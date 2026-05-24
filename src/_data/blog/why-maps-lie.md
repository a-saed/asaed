---
title: Why Maps Lie (And What to Do About It)
date: 2026-05-24
description: Geographic data is messy by nature. Here's what I've learned building GIS software and why your map is probably wrong in at least three ways.
tags: [gis, maps, engineering]
---

Every map you've ever seen is a lie.

Not a malicious one — just a necessary one. The Earth is a lumpy, irregular spheroid. A map is a flat rectangle. Getting from one to the other requires a projection, and every projection trades off something. Area for shape. Shape for distance. Distance for direction. There's no free lunch.

This sounds like a geography lecture. It's not. It has real consequences for software engineers working with geographic data, and I've been bitten by all of them.

## The coordinate system problem

When someone hands you a GeoJSON file, your first question should be: "what coordinate reference system is this in?"

Most of the time they'll say "latitude and longitude" and think that answers the question. It doesn't. There's WGS84 (what GPS uses), NAD83 (common in North America), and dozens of others, all slightly different. Slightly different enough to put a pin 100 meters from where it should be in some cases.

The fun part: libraries often assume WGS84 and don't tell you. You load the data, it looks right, you ship it, and a client in a specific region notices their assets are all slightly off.

Always verify the CRS. Always.

## The precision trap

Coordinates get stored with more decimal places than they need. Six decimal places gives you ~11cm precision — more than enough for any real-world use case. But databases will happily store 15 decimal places, computations will drift, and suddenly two polygons that should share a border have a tiny gap between them and you're debugging why a point that's clearly inside a region isn't registering as inside.

The fix: round coordinates to a reasonable precision before storing, and use a spatial library that handles floating point edge cases properly (PostGIS is good at this; rolling your own geometry operations is not).

## The performance cliff

Geographic queries have a hidden performance cliff. Everything works fine in development with 1,000 features. Then you load real data — 500,000 features — and the map freezes for 3 seconds on every pan.

Two things to fix this:

1. **Spatial indexes.** If you're using PostGIS, `CREATE INDEX ON your_table USING GIST (geom)` is not optional. It's the difference between 3ms and 3 seconds.
2. **Tile or cluster at scale.** Don't send 500,000 raw features to the browser. Use vector tiles, server-side clustering, or simplify geometries at lower zoom levels. The browser is not a GIS engine.

## The thing that actually helps

After working with geographic data long enough, the thing that helps most isn't knowing all the edge cases upfront. It's knowing to be suspicious.

When the data looks right, verify it. When the query is fast, check the query plan. When the map renders cleanly, zoom in.

Maps lie. Your job is to catch them at it.
