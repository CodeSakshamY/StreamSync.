// src/lib/socket.js
// Singleton socket.io client — safe to call from multiple components.
// The socket auto-connects to the same origin (custom server = same port as Next.js).

import { io } from 'socket.io-client'

/** @type {import('socket.io-client').Socket | null} */
let socket = null

export function getSocket() {
  if (!socket) {
    socket = io({
      transports: ['websocket', 'polling'],
      autoConnect: true,
    })

    socket.on('connect', () => {
      console.log('[socket] connected:', socket.id)
    })
    socket.on('disconnect', (reason) => {
      console.log('[socket] disconnected:', reason)
    })
    socket.on('connect_error', (err) => {
      console.error('[socket] connection error:', err.message)
    })
  }
  return socket
}

/** Call this if you need a completely fresh connection (e.g. auth change). */
export function destroySocket() {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}
