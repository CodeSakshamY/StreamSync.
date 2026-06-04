// server.js — StreamSync custom server
// Runs Next.js + Socket.io on the same port.
// Room state lives in-memory; no external database needed.

const { createServer } = require('http')
const { Server }       = require('socket.io')
const next             = require('next')

const dev      = process.env.NODE_ENV !== 'production'
const hostname = process.env.HOSTNAME || 'localhost'
const port     = parseInt(process.env.PORT || '3000', 10)

const app    = next({ dev, hostname, port })
const handle = app.getRequestHandler()

// ─── In-memory room store ───────────────────────────────────────────────────

/** @type {Map<string, Room>} */
const rooms = new Map()

/**
 * @typedef {Object} Room
 * @property {string}   code
 * @property {string}   vid          - current YouTube video ID
 * @property {string}   hostId       - socket.id of current host
 * @property {string}   hostNick
 * @property {number}   createdAt
 * @property {User[]}   users
 * @property {Message[]} messages    - capped at 200
 * @property {QueueItem[]} queue
 * @property {VideoState} videoState
 */

function makeRoom({ code, vid, hostNick, hostId }) {
  return {
    code,
    vid,
    hostId,
    hostNick,
    createdAt: Date.now(),
    users: [{ id: hostId, nick: hostNick, host: true, status: 'active' }],
    messages: [],
    queue: [{ id: 1, vid, title: 'Now Playing', active: true }],
    videoState: { playing: false, time: 0, updatedAt: Date.now() },
  }
}

function getRoom(code) {
  return rooms.get(code.toUpperCase())
}

// ─── YouTube title helper (oEmbed, no API key needed) ───────────────────────

async function fetchYtTitle(vid) {
  try {
    const url = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${vid}&format=json`
    const res  = await fetch(url)
    if (!res.ok) return null
    const data = await res.json()
    return data.title || null
  } catch {
    return null
  }
}

// ─── Boot ────────────────────────────────────────────────────────────────────

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    // Thin REST shim — lets RoomClient validate a room before socket join
    if (req.method === 'GET' && req.url?.startsWith('/api/rooms/')) {
      const code = req.url.split('/api/rooms/')[1].split('?')[0].toUpperCase()
      res.setHeader('Content-Type', 'application/json')
      const room = getRoom(code)
      if (room) {
        res.end(JSON.stringify({ exists: true, vid: room.vid }))
      } else {
        res.statusCode = 404
        res.end(JSON.stringify({ exists: false }))
      }
      return
    }
    handle(req, res)
  })

  const io = new Server(httpServer, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
    transports: ['websocket', 'polling'],
  })

  // ── Connection ────────────────────────────────────────────────────────────
  io.on('connection', (socket) => {

    // ── room:join ─────────────────────────────────────────────────────────
    socket.on('room:join', ({ code, nick, isHost, vid }) => {
      code = (code || '').toUpperCase().trim()
      nick = (nick || 'Viewer').trim().slice(0, 24)

      let room = getRoom(code)

      if (isHost) {
        if (!room) {
          // Create new room
          if (!vid) {
            socket.emit('room:error', { message: 'Missing video ID for room creation.' })
            return
          }
          room = makeRoom({ code, vid, hostNick: nick, hostId: socket.id })
          rooms.set(code, room)
          console.log(`[+] Room created: ${code}  host: ${nick}  vid: ${vid}`)
        } else if (room.hostNick === nick) {
          // Host re-connecting
          room.hostId = socket.id
          room.users  = room.users.map(u =>
            u.nick === nick ? { ...u, id: socket.id, status: 'active', host: true } : u
          )
          if (!room.users.find(u => u.nick === nick)) {
            room.users.unshift({ id: socket.id, nick, host: true, status: 'active' })
          }
          console.log(`[~] Host reconnected: ${nick} → ${code}`)
        } else {
          // Room exists but this isn't the original host — join as viewer
          if (!room.users.find(u => u.id === socket.id || u.nick === nick)) {
            room.users.push({ id: socket.id, nick, host: false, status: 'active' })
          }
        }
      } else {
        if (!room) {
          socket.emit('room:error', {
            message: `Room "${code}" not found. Make sure the host has entered the room first.`,
          })
          return
        }
        // Remove stale entry for same nick (reconnect) then add fresh
        room.users = room.users.filter(u => !(u.nick === nick && u.id !== socket.id))
        if (!room.users.find(u => u.id === socket.id)) {
          room.users.push({ id: socket.id, nick, host: false, status: 'active' })
        }
        console.log(`[+] ${nick} joined room ${code}`)
      }

      socket.join(code)
      socket.data.code   = code
      socket.data.nick   = nick
      socket.data.isHost = room.hostId === socket.id

      socket.emit('room:joined', {
        code,
        vid:        room.vid,
        users:      room.users,
        messages:   room.messages.slice(-50),
        queue:      room.queue,
        videoState: room.videoState,
        isHost:     socket.data.isHost,
      })

      // Notify others
      socket.to(code).emit('room:user-joined', { nick })
      io.to(code).emit('room:users', room.users)
    })

    // ── room:chat ─────────────────────────────────────────────────────────
    socket.on('room:chat', ({ msg }) => {
      const room = getRoom(socket.data.code)
      if (!room || !msg?.trim()) return

      const message = {
        id:   Date.now() + Math.random(),
        user: socket.data.nick,
        msg:  msg.trim().slice(0, 500),
        t:    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        host: room.hostId === socket.id,
      }
      room.messages.push(message)
      if (room.messages.length > 200) room.messages = room.messages.slice(-200)

      io.to(socket.data.code).emit('room:message', message)
    })

    // ── room:sync  (host → viewers) ───────────────────────────────────────
    socket.on('room:sync', ({ playing, time }) => {
      const room = getRoom(socket.data.code)
      if (!room || room.hostId !== socket.id) return

      room.videoState = { playing, time, updatedAt: Date.now() }
      // Only broadcast to others — host already updated their own player
      socket.to(socket.data.code).emit('room:sync', { playing, time })
    })

    // ── room:video-change  (host only) ────────────────────────────────────
    socket.on('room:video-change', async ({ vid, title }) => {
      const room = getRoom(socket.data.code)
      if (!room || room.hostId !== socket.id) return

      // Resolve title asynchronously (oEmbed)
      const resolvedTitle = title || (await fetchYtTitle(vid)) || 'Now Playing'

      room.vid        = vid
      room.videoState = { playing: false, time: 0, updatedAt: Date.now() }

      const inQueue = room.queue.find(q => q.vid === vid)
      if (inQueue) {
        room.queue = room.queue.map(q => ({ ...q, active: q.vid === vid }))
      } else {
        room.queue = [
          ...room.queue.map(q => ({ ...q, active: false })),
          { id: Date.now(), vid, title: resolvedTitle, active: true },
        ]
      }

      io.to(socket.data.code).emit('room:video-changed', { vid, queue: room.queue })
      console.log(`[~] Video changed in ${socket.data.code}: ${vid}`)
    })

    // ── room:queue-add  (host only) ───────────────────────────────────────
    socket.on('room:queue-add', async ({ vid }) => {
      const room = getRoom(socket.data.code)
      if (!room || room.hostId !== socket.id) return
      if (room.queue.some(q => q.vid === vid)) return

      const title = (await fetchYtTitle(vid)) || `Video ${room.queue.length + 1}`
      room.queue.push({ id: Date.now(), vid, title, active: false })
      io.to(socket.data.code).emit('room:queue', room.queue)
    })

    // ── room:queue-play  (host only) ──────────────────────────────────────
    socket.on('room:queue-play', ({ vid }) => {
      const room = getRoom(socket.data.code)
      if (!room || room.hostId !== socket.id) return

      room.vid        = vid
      room.videoState = { playing: false, time: 0, updatedAt: Date.now() }
      room.queue      = room.queue.map(q => ({ ...q, active: q.vid === vid }))

      io.to(socket.data.code).emit('room:video-changed', { vid, queue: room.queue })
    })

    // ── room:queue-next  (host only, triggered by YT.ENDED) ─────────────────
    socket.on('room:queue-next', async () => {
      const room = getRoom(socket.data.code)
      if (!room || room.hostId !== socket.id) return

      const currentIdx = room.queue.findIndex(q => q.active)
      const nextItem   = room.queue[currentIdx + 1]

      if (!nextItem) return // nothing queued after current

      const title = nextItem.title || (await fetchYtTitle(nextItem.vid)) || 'Now Playing'
      nextItem.title = title

      room.vid        = nextItem.vid
      room.videoState = { playing: true, time: 0, updatedAt: Date.now() }
      room.queue      = room.queue.map(q => ({ ...q, active: q.vid === nextItem.vid }))

      io.to(socket.data.code).emit('room:video-changed', { vid: nextItem.vid, queue: room.queue })
      console.log(`[~] Auto-advanced queue in ${socket.data.code}: ${nextItem.vid}`)
    })

    // ── room:kick  (host only) ────────────────────────────────────────────
    socket.on('room:kick', ({ userId }) => {
      const room = getRoom(socket.data.code)
      if (!room || room.hostId !== socket.id) return

      room.users = room.users.filter(u => u.id !== userId)
      io.to(userId).emit('room:kicked', { message: 'You were removed from the room.' })
      io.to(socket.data.code).emit('room:users', room.users)
    })

    // ── room:reaction ────────────────────────────────────────────────────
    socket.on('room:reaction', ({ emoji }) => {
      socket.to(socket.data.code).emit('room:reaction', { emoji, nick: socket.data.nick })
    })

    // ── room:leave ────────────────────────────────────────────────────────
    socket.on('room:leave', handleLeave)

    // ── disconnect ───────────────────────────────────────────────────────
    socket.on('disconnect', handleLeave)

    function handleLeave() {
      const code = socket.data.code
      const room = getRoom(code)
      if (!room) return

      const wasHost = room.hostId === socket.id

      // Temporarily mark as disconnected so others see the status change
      room.users = room.users.map(u =>
        u.id === socket.id ? { ...u, status: 'disconnected' } : u
      )
      io.to(code).emit('room:users', room.users)

      // Grace period before final cleanup
      setTimeout(() => {
        const r = getRoom(code)
        if (!r) return

        // Remove the user permanently
        r.users = r.users.filter(u => u.id !== socket.id)

        if (wasHost) {
          const active = r.users.filter(u => u.status !== 'disconnected')
          if (active.length > 0) {
            // Promote oldest remaining user
            const newHost = active[0]
            r.hostId   = newHost.id
            r.hostNick = newHost.nick
            r.users    = r.users.map(u => ({ ...u, host: u.id === newHost.id }))
            io.to(code).emit('room:host-changed', { newHostNick: newHost.nick })
            console.log(`[~] New host in ${code}: ${newHost.nick}`)
          } else {
            rooms.delete(code)
            console.log(`[-] Room deleted: ${code} (empty after host left)`)
            return
          }
        }

        io.to(code).emit('room:users', r.users)

        // Clean up empty rooms
        if (r.users.length === 0) {
          rooms.delete(code)
          console.log(`[-] Room deleted: ${code} (empty)`)
        }
      }, 15_000)
    }
  })

  // ── Start ─────────────────────────────────────────────────────────────────
  httpServer.listen(port, () => {
    console.log(`\n  StreamSync ready → http://${hostname}:${port}\n`)
  })
})
