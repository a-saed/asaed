---
title: What Socket.IO Never Told You About WebSockets
date: 2026-05-29
description: I spent years using Socket.IO without understanding what WebSockets actually are. Switching to Go forced me to learn the protocol — starting with the part that surprised me most.
tags: [websockets, go, nodejs, networking]
---

I used Socket.IO for years. Events, rooms, namespaces — it all just worked. I never thought much about what was happening underneath.

Then I started building Datum in Go, and I had to use raw WebSockets. No Socket.IO. No abstraction layer. Just the protocol.

The first thing I ran into was the upgrader.

```go
var upgrader = websocket.Upgrader{
    CheckOrigin: func(r *http.Request) bool {
        return true
    },
}

func wsHandler(w http.ResponseWriter, r *http.Request) {
    conn, err := upgrader.Upgrade(w, r, nil)
    // ...
}
```

I stared at this for a while. Why is there an HTTP handler? Why am I "upgrading" something? I thought WebSocket was its own thing.

It's not.

## WebSocket starts as HTTP

Every WebSocket connection begins as a regular HTTP request. The client sends a `GET` request with specific headers:

```
GET /ws HTTP/1.1
Host: localhost:3000
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==
Sec-WebSocket-Version: 13
```

The server looks at these headers, agrees to switch protocols, and responds with `101 Switching Protocols`:

```
HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=
```

After that, the TCP connection stays open but stops speaking HTTP. From this point on it's a full-duplex WebSocket connection — both sides can send frames at any time.

That's the upgrade. It's not a Go concept or a library quirk. It's in the spec. RFC 6455, section 1.7.

Socket.IO does this too — it just does it for you, quietly, before falling back to long-polling if the upgrade fails. Which is why most of us never noticed.

## Why Socket.IO hides this

Socket.IO's default transport is HTTP long-polling. The client makes a request, the server holds it open until there's data to send, responds, and the client immediately makes another request. It looks like a stream but it's a series of HTTP requests.

Once the connection is established, Socket.IO *tries* to upgrade to WebSocket. If it succeeds, great. If not — corporate proxy, old browser, misconfigured server — it stays on polling and you never know the difference.

This is genuinely useful in production. But it has a cost: you develop against an abstraction that doesn't match the protocol. You think in events and rooms, not frames and connections.

When I moved to Go, that abstraction was gone. I had to think about what a WebSocket connection actually is.

## What the upgrader is doing

The `websocket.Upgrader` in Go's `gorilla/websocket` (and the stdlib `golang.org/x/net/websocket`) is just a function that performs the HTTP → WebSocket handshake.

It reads the incoming HTTP request, validates the headers, writes the `101` response, and returns a `*websocket.Conn` — a handle to the now-upgraded TCP connection.

```go
func wsHandler(w http.ResponseWriter, r *http.Request) {
    conn, err := upgrader.Upgrade(w, r, nil)
    if err != nil {
        // The handshake failed — client gets a 4xx response
        return
    }
    defer conn.Close()

    for {
        messageType, message, err := conn.ReadMessage()
        if err != nil {
            break
        }
        conn.WriteMessage(messageType, message)
    }
}
```

This is a complete WebSocket echo server. No event system. No rooms. No reconnection logic. Just a loop reading and writing frames over a connection that used to be HTTP.

## What you lose and what you gain

Socket.IO gives you a lot for free: event names, acknowledgements, rooms, namespaces, automatic reconnection, and the polling fallback. If you switch to raw WebSockets, you build all of that yourself — or you don't need it.

For Datum, I didn't need most of it. I needed one thing: a client subscribes to a bounding box, and the server pushes geographic features whenever something changes inside that box. That maps cleanly to a WebSocket connection with a single subscription message. No rooms. No namespaces. Just a persistent connection and a message format.

Going raw meant I could make the protocol exactly as simple as the problem required. No overhead from features I wasn't using.

But the bigger gain was understanding. Once you've written a WebSocket server from scratch — handled the upgrade, managed connection state, dealt with disconnects — you understand what Socket.IO is doing for you. You can make an informed decision about whether you need it.

## The thing I should have known earlier

The HTTP upgrade mechanism isn't WebSocket-specific. It's a general HTTP feature — `Upgrade: h2c` does the same thing for HTTP/2 cleartext. WebSocket just happens to be the most common use case.

Which means the next time you see a `101 Switching Protocols` in your network tab, you know exactly what happened: an HTTP connection negotiated its way into something else. It's a handshake, not a magic trick.

Socket.IO is a good library. I'd still use it for applications where the polling fallback matters, or where you need rooms and namespaces out of the box. But I'd use it knowing what it's built on — not because the abstraction is leaky, but because understanding the foundation changes how you think about the problem.

That's usually worth something.
