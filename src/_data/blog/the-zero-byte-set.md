---
title: "The Zero-Byte Set: What an Easy Go Problem Taught Me About Memory"
date: 2026-06-01
description: I solved Contains Duplicate in Go and fell down a rabbit hole into how the language represents nothing — and came out understanding memory better than years of writing JavaScript ever managed.
tags: [go, memory, data-structures, learning]
---

I've been learning Go the slow way — reading real codebases, asking *why* instead of just *how*. To keep the muscle warm, I started grinding NeetCode problems in Go instead of a language I already know. The rule I set for myself: don't copy a solution. Reason it out, get it wrong, fix it, and only move on once I understand every character on the screen.

The first problem was **Contains Duplicate** — about as "easy" as they come. I expected five minutes. Instead I fell down a rabbit hole into how Go represents *nothing*, and came out understanding memory better than I had after years of writing JavaScript. This is that rabbit hole.

## The problem

> Given an integer array `nums`, return `true` if any value appears more than once, otherwise `false`.

That's it. Coming from JS, my brain went straight to the obvious answers.

**Brute force:** loop the array, and for each element compare it against every other element. Two nested loops. It works, but it's `O(n²)` — for the max input here (10⁵ elements) that's around 10 *billion* comparisons. That's the solution you write down specifically so you know what you're trying to avoid.

**The faster instinct:** the actual question being asked over and over is *"have I seen this value before?"* When that's the question, you want a structure that answers it cheaply. In JS I'd reach for a `Set` without a second thought:

```js
const seen = new Set();
for (const num of nums) {
  if (seen.has(num)) return true;
  seen.add(num);
}
return false;
```

Check first, then store. (The order is the whole game — if you store *before* you check, every element finds itself in the set and you return `true` for everything.) Easy. Then I went to write it in Go and hit a wall.

## Go doesn't have a Set

It just... doesn't. No built-in `Set` type like Python or Java or JS. The first time you need one, Go shrugs and points you at a map.

Which raises an immediate question I'd never had to think about: **a map is `key → value`. A set only cares about keys. So what do I put as the value?**

The beginner-friendly answer is a bool:

```go
seen := map[int]bool{}
seen[num] = true
```

That works fine. My first correct solution looked exactly like that. But then I noticed something that bugged me: **I set every value to `true` and I never once read it back.** The bool is dead weight. So what's the *right* way?

That's when I met the idiom that sent me down the hole:

```go
seen := map[int]struct{}{}
seen[num] = struct{}{}
```

And my first reaction was: *what on earth is `struct{}{}`? Why are there two pairs of braces? Is that a type or a value?*

## `struct{}` vs `struct{}{}` — type vs value

The thing that unlocked it: **both, and that's the confusion.** They're two different things that look almost identical.

- `struct{}` — **one** pair of braces — is a **type.** It means "a struct with no fields." An empty struct. Same category as `int` or `bool`: it's a type, not a value.
- To make a *value* of any type in Go, you write the type followed by `{}`.

I'd already been doing this all along without noticing:

```go
map[int]bool{}
//          ^^ these braces construct an empty VALUE of type map[int]bool
```

So the exact same pattern applies to the empty struct:

```
map[int]bool   →  map[int]bool{}     // type, then a value of it
struct{}       →  struct{}{}         // type, then a value of it
```

It only *looks* cursed because the struct type already ends in braces. Pull it apart and it's totally regular:

```
struct{}  +  {}   =   struct{}{}
 (type)    (make one)
```

The first `{}` is part of the type — it's literally where the (zero) fields would go. The second `{}` is the "construct a value" braces, identical to the ones on the map. So `seen[num] = struct{}{}` reads as: *store a value-of-type-empty-struct at key `num`.* We don't care about the value. We care that the key now exists.

## The part that actually rewired my brain: why it costs zero bytes

Okay, so it's a placeholder value. But *why* is everyone obsessed with using an empty struct specifically? Because it takes **zero bytes** of memory. And understanding *why* fixed a misconception I didn't know I had.

My first wrong guess was: "if the trick is storing only one value, I could just always store `1` — then there's only one possibility, right?" Wrong, and the reason is the whole lesson:

> **Size comes from what a type *can* hold, not from what you put in it.**

An `int` can hold billions of possible values, so it reserves 8 bytes — *even if every single one you store is a `1`.* The compiler doesn't know your discipline; it sizes the box for everything the type could be. It's a parking space built for a bus: parking a bicycle in it doesn't make it smaller. The size was decided when the space was built, not when you parked.

Now line them up by *how many values each type can possibly be*:

| Type        | Possible values        | Bytes |
|-------------|------------------------|-------|
| `int`       | ~18 quintillion        | 8     |
| `bool`      | 2 (true / false)       | 1     |
| `struct{}`  | **exactly 1**          | **0** |

Memory is addressed in bytes, so *any* type that can be two-or-more things needs at least 1 byte to record which one it is — that's why `bool` can't go below 1. But a struct with no fields has exactly **one** possible value, ever. There's no second thing it could be, so there's nothing to record, so it needs no space. Zero choices → zero bits → zero bytes.

And it ties back to the set perfectly. In a map-as-set you **never read the value** — presence is decided by the key:

```go
if _, ok := seen[num]; ok {  // the `ok` comes from the KEY existing
    return true
}
```

That `_, ok` is Go's "comma ok" idiom — the map hands back the value *and* a bool saying whether the key was there. We throw the value away with `_` and only keep `ok`. So the value does literally no work. You want it to cost as little as possible. `struct{}` costs nothing. That's the entire reason the idiom exists.

## "But isn't there a hidden pointer?"

This was my last line of defense. Sure, the struct is zero bytes — but if Go secretly stores an 8-byte *pointer* to it, I've saved nothing. Right?

Nope. **Go stores map values inline, by value — not as pointers** (it only goes indirect for very large elements, over 128 bytes, which is the opposite of our case). So the value slot for a zero-width type is *width zero*. Not a pointer, not a byte. The map pays for the keys (real ints, real memory) and the value side is genuinely free.

There's a lovely detail underneath: if you ever *force* a pointer to an empty struct (`&struct{}{}`), Go does give you a real pointer — but **every** such pointer in your whole program points at the *same* shared address (`zerobase`). Since all empty structs are identical and hold nothing, there's no reason to allocate a separate spot for each. But that only happens when you explicitly take an address. In the map, you never do. No `&`, no pointer, no allocation.

## Set vs Map — the last knot

One more thing I'd been blurring: I kept *saying* "set" while *writing* a map. Are they the same? No.

- A **set** is a *concept*: an unordered collection of unique things where the only question is "is X in here?"
- A **map** is a *concrete tool*: `key → value` pairs with unique keys.

The bridge: **a map's keys are already a set** — unique, unordered, membership-checkable. So you borrow the map, throw away the value half, and the keys *are* your set. Python and Java ship a real set type so you'd never do this there. Go doesn't, so the whole community settled on `map[T]struct{}` as "a set." When a Go dev says "set," the code that comes out is a map. The word is the concept; the code is the tool standing in for it.

## The final solution

```go
func hasDuplicate(nums []int) bool {
    seen := map[int]struct{}{}
    for _, num := range nums {
        if _, ok := seen[num]; ok {
            return true
        }
        seen[num] = struct{}{}
    }
    return false
}
```

`O(n)` time, `O(n)` space, and it bails the instant it finds a duplicate instead of scanning the whole array. (There's a tempting one-liner — dump everything into a set, then check `len(seen) != len(nums)` — but it has no early exit, so it always walks the entire array even when the answer was obvious at index 1. Same Big-O, worse in practice.)

## What I actually took away

The code is eight lines. But under those eight lines:

- **`struct{}` is a type; `struct{}{}` is a value** — and Go's `type{}` construction pattern is everywhere once you see it.
- **A type's size comes from what it *can* hold, not what you store** — the single most clarifying sentence about memory I've internalized.
- **Zero possible values means zero bytes**, because there's nothing to distinguish.
- **Map values live inline**, so a zero-width value is truly free — no sneaky pointer.
- **"Set" is a concept; in Go the tool is a map** with the values thrown away.

This is why I'm doing NeetCode in a language I *don't* know instead of one I do. In JS, `new Set()` hides all of this. Go made me look at it. The "easy" problem wasn't the array — it was the excuse to finally understand what it means to store nothing.

Next up: Two Sum — same map, but this time the value actually carries its weight. Funny how that's the perfect sequel.
