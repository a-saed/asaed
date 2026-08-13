---
title: "I Gave an AI Agent SQL Access to My Database. The Hard Part Was Saying No."
date: 2026-08-13
description: Wiring an MCP server into datum so an AI agent can query local PostGIS data directly was almost free. The actual engineering was making "read-only" mean it.
tags: [ai, mcp, postgis, localfirst, safety]
---

datum already runs a full Postgres + PostGIS instance locally — that's the whole premise of the project, a bounding box as a live subscription with no network round-trip for queries. So when I looked at wiring up [MCP](https://modelcontextprotocol.io) (Model Context Protocol) so an AI agent could query it directly, I expected the interesting part to be the AI side. It wasn't. The data was already local, already structured, already queryable. Handing it to an agent was almost free. The actual engineering work was making sure "read-only" couldn't be talked out of it.

## What MCP gives you

MCP is a small protocol for exposing tools to an AI agent over stdio or a socket — the agent sends a JSON-RPC call, your server runs it, the agent gets structured data back instead of having to scrape a UI or guess at an API. Claude Desktop, Cursor, Windsurf, and anything else MCP-compatible can point at a server and start calling its tools by name.

`datum-cli mcp` starts Postgres, `datum-server`, and the MCP bridge together in one command and exposes three tools:

- **`query`** — run SQL against the local PGlite database, full PostGIS included.
- **`get_schema`** — column names, Postgres types, and datum's roles (`id`, `geom`, `updated_at`, `data`).
- **`get_status`** — connection state, pending outbox writes, row count.

Point an agent at it and "what's within 500m of here?" becomes a `query` call the agent writes itself:

```sql
SELECT name FROM features
WHERE ST_DWithin(geom::geography, ST_MakePoint(-0.12, 51.5)::geography, 500)
```

No API surface to design for every question someone might ask. The agent already knows SQL and, once it calls `get_schema`, it knows the table. That's the whole interface.

## The part that actually took work: read-only

Handing an agent a `query` tool means handing it a SQL string with no supervision over what's in it. By default that tool has to be **read-only** — writes are opt-in via an explicit `--allow-writes` flag, off unless you mean it. The first version of that guard was the obvious one:

```ts
const SELECT_ONLY_RE = /^\s*(SELECT|EXPLAIN)\b/i
```

If the statement starts with `SELECT` or `EXPLAIN`, let it through. Anything else, reject. It looks complete. It isn't, and every hole in it is the same shape: a statement that *starts* with an allowed keyword but doesn't *stay* read-only once Postgres runs it.

**A CTE can wrap a mutation.** `WITH x AS (DELETE FROM features RETURNING *) SELECT 1` starts with `SELECT`. The regex passes it. Postgres deletes every row and returns `1`.

**`EXPLAIN ANALYZE` executes its argument.** Plain `EXPLAIN` just prints a plan — nothing runs. `EXPLAIN ANALYZE`, on the other hand, actually executes the statement it's explaining so it can report real timings. `EXPLAIN ANALYZE DELETE FROM features` starts with `EXPLAIN`, passes the regex, and deletes the table while pretending to just measure it.

**`SELECT INTO` creates a table.** `SELECT * INTO new_table FROM features` starts with `SELECT`. It's also a `CREATE TABLE ... AS SELECT` in disguise — a write with a read's prefix.

None of these are exotic. They're the normal vocabulary of SQL, which is exactly the problem with a prefix check: it verifies how a statement *starts*, not what it *does*. The fix moved from a single regex to a small set of explicit checks:

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

Each line is a specific statement shape that passes the old check while doing a write. `hasUnquotedInto` splits the SQL on `'` and only checks for `INTO` in the segments *outside* string literals, so a column that happens to contain the word "into" in a quoted string doesn't false-positive. `stripSqlComments` strips `--` and `/* */` comments first — an agent (or a hostile prompt) can otherwise hide a keyword mid-comment where a naive regex still sees it, or use a comment to break up a pattern the check is looking for.

## The hole a regex can't close: stacked statements

Even with every keyword check right, one shape stays open if you're not careful about *how* you execute the SQL at all: `SELECT 1; DROP TABLE features;`. The first statement is harmless and matches every check. The second one, stacked after a semicolon, is not.

Postgres has two ways to run a query. The **simple query protocol** takes a string and can execute multiple `;`-separated statements in one call — that's what you get from `.exec()`. The **extended query protocol** — parse, bind, execute — is scoped to a single statement; PGlite's `.query()` method uses it and explicitly documents that it takes one statement, full stop. datum's MCP `query` tool calls `client.query()`, which calls PGlite's `.query()`, never `.exec()`. The stacked-statement attack doesn't need a check to reject it — it's structurally unreachable, because the code path it would need to run through doesn't exist. The best guardrail isn't the one you write carefully. It's the one you don't need because you picked the right primitive.

## What I'd point one of these at

The pattern generalizes past datum: any time you hand an agent a query tool instead of a fixed API, "read-only" is a claim about *behavior*, not about a string's first few characters. A prefix check tells you what a statement claims to be. Only running it — or reasoning precisely about what running it does — tells you what it actually is.

The access was the easy 80%. The guard is where the real work lives, and it's the part worth getting right before you hand anyone — human or agent — a SQL string and a "read-only" promise.
