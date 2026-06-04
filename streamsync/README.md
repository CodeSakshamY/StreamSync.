# StreamSync

> Watch Together. Anywhere. Perfectly in sync.

Real-time YouTube watch party platform. Create a room, share a 6-char code,
watch in perfect sync — no account, no extensions, no friction.

---

## Stack

| Layer      | Tech                         |
|------------|------------------------------|
| Frontend   | Next.js 15 (App Router)      |
| Styling    | Global CSS + CSS variables   |
| Real-Time  | Socket.io 4 (WebSocket)      |
| Sync       | YouTube IFrame Player API    |
| State      | In-memory (server.js Map)    |
| Server     | Custom Node.js (server.js)   |

---

## Run locally

```bash
npm install
npm run dev        # starts Next.js + Socket.io together on :3000
```

Open http://localhost:3000

---

## Deploy — Railway (recommended, free tier, zero code changes)

1. Push this repo to GitHub
2. Go to https://railway.app → New Project → Deploy from GitHub repo
3. Select your repo — Railway auto-detects Node.js
4. Set the start command: `npm start`
5. Click Deploy

That's it. Railway gives you a public URL with WebSocket support out of the box.

**Environment variables (optional):**
| Var        | Default     | Purpose              |
|------------|-------------|----------------------|
| `PORT`     | `3000`      | Server port          |
| `HOSTNAME` | `localhost` | Bind address         |

---

## Deploy — Render (alternative free option)

1. New Web Service → connect GitHub repo
2. Build command: `npm install && npm run build`
3. Start command: `npm start`
4. Instance type: Free

---

## Why not Vercel?

Vercel runs serverless functions that spin up/down per request.
This app needs a **persistent Node.js process** for:
- Long-lived WebSocket connections (Socket.io)
- In-memory room state (the rooms Map)

Neither works in a serverless environment. Use Railway or Render instead —
both are free, support WebSockets, and deploy in under 2 minutes.

---

## How it works

### Creating a room
1. Paste a YouTube URL → a random 6-char code is generated (e.g. `K7Q3HX`)
2. Click **Enter Room** → you become the host
3. The room is registered on the server when your socket connects
4. Share the code — guests join from the homepage

### Joining a room
1. Enter the room code + your nickname
2. Client joins the socket room and receives current video + position
3. YouTube player auto-seeks to the host's current timestamp

### Sync mechanics
- **Host** drives all playback. Play, pause, and seek fire `room:sync` to every viewer
- **Viewers** receive `room:sync` and correct drift > 2 seconds automatically
- **Heartbeat**: host emits current position every 5 s for latecomers
- **Host transfer**: if host disconnects, oldest remaining user is promoted after 15 s
- **Auto-advance**: when a video ends, the next queue item starts for everyone automatically

---

## Project structure

```
streamsync/
├── server.js                   ← Custom server: Next.js + Socket.io + room state
├── package.json
├── next.config.mjs
└── src/
    ├── app/
    │   ├── layout.jsx
    │   ├── page.jsx            ← Landing page: create / join room
    │   ├── globals.css
    │   └── room/[code]/
    │       ├── page.jsx        ← Suspense wrapper (server component)
    │       └── RoomClient.jsx  ← Reads URL params → renders WatchRoom
    ├── components/
    │   ├── ui/                 ← Logo, Toast, GlobalNav, FAQItem
    │   ├── landing/            ← Hero, Stats, Features, FAQ, Footer
    │   ├── modals/             ← CreateRoom, JoinRoom, ChangeVideo modals
    │   └── room/
    │       ├── WatchRoom.jsx   ← Room UI: socket + YouTube IFrame API
    │       └── panels.jsx      ← ChatPanel, UsersList, QueuePanel
    ├── hooks/
    │   └── useToast.js
    └── lib/
        ├── constants.js        ← REACTION_EMOJIS, FAQ_DATA, FEATURES, STATS
        ├── helpers.js          ← genRoomCode (6-char), extractVideoId, formatTime
        └── socket.js           ← socket.io-client singleton
```

---

## Socket.io event reference

| Event                | Direction             | Payload                                          |
|----------------------|-----------------------|--------------------------------------------------|
| `room:join`          | client → server       | `{ code, nick, isHost, vid? }`                  |
| `room:joined`        | server → client       | `{ vid, users, messages, queue, videoState, isHost }` |
| `room:error`         | server → client       | `{ message }`                                    |
| `room:chat`          | client → server       | `{ msg }`                                        |
| `room:message`       | server → all          | `{ id, user, msg, t, host }`                    |
| `room:sync`          | host → server → all   | `{ playing, time }`                             |
| `room:video-change`  | host → server         | `{ vid }`                                        |
| `room:video-changed` | server → all          | `{ vid, queue }`                                 |
| `room:queue-add`     | host → server         | `{ vid }`                                        |
| `room:queue-play`    | host → server         | `{ vid }`                                        |
| `room:queue-next`    | host → server         | *(auto-fired on video end)*                      |
| `room:queue`         | server → all          | `QueueItem[]`                                    |
| `room:kick`          | host → server         | `{ userId }`                                     |
| `room:kicked`        | server → target       | `{ message }`                                    |
| `room:reaction`      | client → others       | `{ emoji }`                                      |
| `room:users`         | server → all          | `User[]`                                         |
| `room:user-joined`   | server → others       | `{ nick }`                                       |
| `room:host-changed`  | server → all          | `{ newHostNick }`                                |
| `room:leave`         | client → server       | `{ code }`                                       |

---

Made with ❤️ · StreamSync v2.0
