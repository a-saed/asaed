---
title: "I Gave an AI Agent SQL Access to My Database. The Hard Part Was Saying No."
date: 2026-08-13
description: Wiring an MCP server into datum so an AI agent can query local PostGIS data directly was almost free. The actual engineering was making "read-only" mean it.
tags: [ai, mcp, postgis, localfirst, safety]
---

An AI agent has read access to my database right now, and it can write its own SQL to use it. Typed out like that, it sounds like the kind of decision you regret at 2 a.m. Mostly, it wasn't — the access itself turned out to be almost boring to build. What took real effort was making sure "read-only" actually meant read-only, and that's the part of this story worth telling.

Some context first. datum runs a full Postgres + PostGIS instance locally, in the browser or on your machine — that's the whole premise of the project, a bounding box as a live subscription instead of a fetch you re-run on every pan and zoom. No server round-trip for a spatial query, because the data and the query engine are both already sitting right there. So when I started looking at [MCP](https://modelcontextprotocol.io) (Model Context Protocol) — the thing that lets Claude Desktop, Cursor, and friends call tools on your machine instead of just chatting at you — I assumed the interesting problem would be on the AI side. Prompting, tool descriptions, getting the agent to ask good questions. It wasn't. The data was already local, already structured, already queryable. Handing it to an agent turned out to be the *easy* 80% of the work.

## What MCP actually gets you

Strip away the acronym and MCP is a small protocol for exposing tools to an agent over stdio or a socket. The agent sends a JSON-RPC call, your server runs it, the agent gets structured data back — no scraping a UI, no guessing at an undocumented API, no me hand-rolling a chat interface just so a model can ask "what's near this point." Claude Desktop, Cursor, Windsurf, anything MCP-compatible just points at the server and starts calling tools by name.

`datum-cli mcp` starts Postgres, `datum-server`, and the MCP bridge together in one command, and it hands the agent three tools:

- **`query`** — run SQL against the local PGlite database. Full PostGIS included — `ST_DWithin`, `ST_AsGeoJSON`, all of it.
- **`get_schema`** — column names, Postgres types, and datum's roles (`id`, `geom`, `updated_at`, `data`), so the agent knows what it's looking at before it guesses.
- **`get_status`** — connection state, pending outbox writes, row count. Is the sync actually caught up, or is the agent about to answer from stale data?

Here's roughly what a session with it looks like. The agent calls `get_schema` first, unprompted, because that's just what a careful query-writer does:

```json
{
  "table": "features",
  "columns": [
    { "name": "id",   "pg_type": "uuid",     "role": "id",   "nullable": false },
    { "name": "geom", "pg_type": "geometry", "role": "geom", "nullable": false },
    { "name": "name", "pg_type": "text",     "role": "data", "nullable": true  }
  ]
}
```

Then "what's within 500m of here?" turns into a `query` call it writes itself, no prompting from me about column names or SRIDs:

```sql
SELECT name FROM features
WHERE ST_DWithin(geom::geography, ST_MakePoint(-0.12, 51.5)::geography, 500)
```

That's genuinely the whole interface. I didn't design an endpoint for "nearby things" or "things matching a name" or any of the dozen variations someone might actually ask for. The agent already knows SQL, and now it knows the table. Every question I didn't anticipate is still answerable, because I never had to anticipate it.

## The part that actually took work: read-only

Here's the thing that's easy to gloss over: handing an agent a `query` tool means handing it a raw SQL string with no supervision over what's inside it. That's fine if you trust it completely and don't mind it mutating your data. I don't, by default — writes are opt-in behind an explicit `--allow-writes` flag, off unless you specifically mean it. So the `query` tool needs to actually enforce "read-only," not just claim to.

My first version was the obvious one, and I want to be honest that it *felt* done:

```ts
const SELECT_ONLY_RE = /^\s*(SELECT|EXPLAIN)\b/i
```

Statement starts with `SELECT` or `EXPLAIN`? Let it through. Anything else, reject. It passed every test I wrote for it. It took a specific, slightly annoying line of thinking — "okay, but what's a *read* statement that still changes something" — to realize it was wrong in three separate ways, and all three share the same shape: something that *starts* with an allowed keyword but doesn't *stay* read-only once Postgres actually runs it.

**A CTE can smuggle a mutation in.** `WITH x AS (DELETE FROM features RETURNING *) SELECT 1` starts with `SELECT`. The regex waves it through. Postgres deletes every row in the table and hands back `1`, cheerful as anything.

**`EXPLAIN ANALYZE` isn't dry.** Plain `EXPLAIN` just prints a plan — nothing executes. `EXPLAIN ANALYZE`, though, actually *runs* the statement it's explaining, because that's the only way to report real timings. `EXPLAIN ANALYZE DELETE FROM features` starts with `EXPLAIN`, sails through the check, and deletes the table while looking, at a glance, like it was just measuring something.

**`SELECT INTO` builds a table.** `SELECT * INTO new_table FROM features` starts with `SELECT`. It's also a `CREATE TABLE ... AS SELECT` wearing a read's prefix as a disguise.

None of these are obscure corners of SQL. They're the language's normal vocabulary, which is exactly what makes a prefix check the wrong tool for the job — it verifies how a statement *begins*, never what it *does*. The fix meant giving up on a single elegant regex in favor of a short, unglamorous list of specific checks:

```ts
function isReadOnlySql(sql: string): boolean {
  const s = stripSqlComments(sql).trimStart()
  if (!/^(SELECT|EXPLAIN)\b/i.test(s)) return false
  if (/^EXPLAIN\s*\(/i.test(s)) return false          // parenthesized EXPLAIN may include ANALYZE
  if (/^EXPLAIN\s+ANALYZE\b/i.test(s)) return false    // EXPLAIN ANALYZE executes DML
  if (/^SELECT\b/i.test(s) && hasUnquotedInto(s)) return false  // SELECT INTO creates a table
  return true
}
```

Each line exists because of one specific statement shape that beat the old check. `hasUnquotedInto` splits the SQL on `'` and only looks for `INTO` in the segments *outside* string literals — otherwise a `name` column containing the word "into" would get rejected for no reason. `stripSqlComments` strips `--` and `/* */` comments before any of this runs, because a keyword hidden mid-comment, or a pattern deliberately broken up with a comment in the middle, would sail past a check that isn't looking there. None of this is clever. It's just checking the actual things that were actually wrong, one at a time, instead of trusting a single pattern to cover a language with this much surface area.

## The hole a regex genuinely can't close

Even with every keyword check airtight, one shape stays open as long as the *way* you execute the SQL is still naive: `SELECT 1; DROP TABLE features;`. The first statement is spotless and passes every check I just wrote. The second one, stacked after a semicolon, is not — and no amount of regex cleverness on the first statement protects you from the second.

This is where the fix stopped being about the check at all. Postgres actually offers two distinct ways to run a query. The **simple query protocol** takes a raw string and will happily execute multiple `;`-separated statements in a single call — that's what `.exec()` gives you. The **extended query protocol** — parse, bind, execute, the parameterized path — is scoped to exactly one statement; PGlite's `.query()` method uses it and says so explicitly in its own docs. datum's MCP `query` tool calls `client.query()`, which calls PGlite's `.query()`. It never touches `.exec()`. So the stacked-statement trick doesn't need a check to catch it, because there's no code path for it to travel down in the first place — the second statement just isn't reachable.

That's the part I actually like most about this whole exercise: the best guardrail here isn't the clever one I wrote. It's the one I didn't need to write, because the primitive I'd already picked for an unrelated reason happened to close the hole by construction.

## What still makes me a little uneasy

I don't fully relax about any of this, and I don't think I should. `--allow-writes` exists and works exactly as advertised — flip it on and the agent has full table access, no guardrail left standing. That's fine for a local dev loop where I'm the only one typing prompts. It's a very different sentence if that same server is reachable by anyone else, or if the agent's instructions come from somewhere I don't fully control. A read-only guard protects against *the query itself* doing something destructive. It says nothing about a prompt convincing an agent to `--allow-writes` isn't set, then talking a human into flipping it, or about an agent burning through a genuinely enormous read query because nothing stopped it from asking. Some of that datum already handles — `--max-rows` caps result size regardless of intent — and some of it is just a reminder to myself that "read-only" is a claim about one narrow slice of the danger, not a safety net for the whole thing.

## What I'd actually point one of these at

The pattern generalizes well past datum: any time you hand an agent a query tool instead of a fixed, hand-designed API, "read-only" is a claim about *behavior*, not about a string's first few characters. A prefix check tells you what a statement claims to be. Only running it — or reasoning precisely, exhaustively, almost pedantically about what running it *does* — tells you what it actually is.

The access was the easy part. It always is. The guard is where the real work lives, and it's worth getting right before you hand anyone — human or agent — a SQL string and a promise that it's read-only.
