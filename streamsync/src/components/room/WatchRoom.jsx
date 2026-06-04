'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Logo } from '@/components/ui'
import { ChangeVideoModal } from '@/components/modals'
import { ChatPanel, UsersList, QueuePanel } from './panels'
import { REACTION_EMOJIS } from '@/lib/constants'
import { getSocket } from '@/lib/socket'

// ─── YouTube IFrame API loader ───────────────────────────────────────────────
// Multiple components can call this safely — the script is only injected once.
let _ytApiReady = false
const _ytCallbacks = []

function loadYtApi(cb) {
  if (_ytApiReady && window.YT?.Player) { cb(); return }
  _ytCallbacks.push(cb)
  if (!document.getElementById('yt-iframe-api')) {
    const tag   = document.createElement('script')
    tag.id      = 'yt-iframe-api'
    tag.src     = 'https://www.youtube.com/iframe_api'
    document.head.appendChild(tag)
  }
  const prev = window.onYouTubeIframeAPIReady
  window.onYouTubeIframeAPIReady = () => {
    _ytApiReady = true
    prev?.()
    _ytCallbacks.forEach(fn => fn())
    _ytCallbacks.length = 0
  }
}

// ─── Component ───────────────────────────────────────────────────────────────

export function WatchRoom({ rcode, vid: initVid, nick, isHost: isHostProp, showToast, onLeave }) {

  // ── UI state ────────────────────────────────
  const [connecting,      setConnecting]      = useState(true)
  const [roomError,       setRoomError]       = useState(null)
  const [sidebarOpen,     setSidebarOpen]     = useState(true)
  const [tab,             setTab]             = useState('chat')
  const [showChangeVideo, setShowChangeVideo] = useState(false)
  const [showAddQueue,    setShowAddQueue]    = useState(false)
  const [chatInput,       setChatInput]       = useState('')
  const [floats,          setFloats]          = useState([])
  const [syncStatus,      setSyncStatus]      = useState('connecting') // 'connecting' | 'synced' | 'buffering'

  // ── Room state (from server) ─────────────────
  const [messages,    setMessages]    = useState([])
  const [users,       setUsers]       = useState([])
  const [queue,       setQueue]       = useState([])
  const [currentVid,  setCurrentVid]  = useState(null)
  const [isHost,      setIsHost]      = useState(false)

  // ── Refs ─────────────────────────────────────
  const playerRef     = useRef(null)   // YT.Player instance
  const playerElRef   = useRef(null)   // <div> that YT mounts the iframe into
  const suppressRef   = useRef(false)  // suppress onStateChange emit while applying remote sync
  const syncTimer     = useRef(null)   // host's 5-second periodic broadcast
  const isHostRef     = useRef(false)  // always-current mirror of isHost state

  // Keep isHostRef in sync
  useEffect(() => { isHostRef.current = isHost }, [isHost])

  // ─── Socket setup ─────────────────────────────────────────────────────────
  useEffect(() => {
    const socket = getSocket()

    // Join the room
    socket.emit('room:join', {
      code:   rcode,
      nick,
      isHost: isHostProp,
      vid:    initVid,
    })

    // ── Handlers ──
    const onJoined = ({ vid, users, messages, queue, videoState, isHost: serverIsHost }) => {
      setConnecting(false)
      setIsHost(serverIsHost)
      isHostRef.current = serverIsHost
      setCurrentVid(vid)
      setUsers(users)
      setMessages(messages)
      setQueue(queue)
      setSyncStatus('synced')
      // Boot the YouTube player now that we have the real vid + initial state
      bootPlayer(vid, videoState, serverIsHost)
    }

    const onError = ({ message }) => {
      setConnecting(false)
      setRoomError(message)
    }

    const onMessage      = (msg)    => setMessages(prev => [...prev, msg])
    const onUsers        = (list)   => setUsers(list)
    const onQueue        = (q)      => setQueue(q)
    const onUserJoined   = ({ nick: n }) => showToast(`${n} joined`, 'info')

    const onSync = ({ playing, time }) => {
      // Only viewers receive and apply sync; host's own player drives the state
      if (isHostRef.current) return
      applySync(playing, time)
    }

    const onVideoChanged = ({ vid, queue: newQueue }) => {
      setCurrentVid(vid)
      setQueue(newQueue)
      if (playerRef.current) {
        suppressRef.current = true
        playerRef.current.loadVideoById(vid)
      }
    }

    const onReaction = ({ emoji }) => spawnFloat(emoji)

    const onKicked = ({ message }) => {
      showToast(message || 'You were removed from the room.', 'danger')
      setTimeout(onLeave, 2500)
    }

    const onHostChanged = ({ newHostNick }) => {
      showToast(`${newHostNick} is now the host.`, 'info')
      if (newHostNick === nick) {
        setIsHost(true)
        isHostRef.current = true
        showToast('You are now the host! You control playback.', 'success')
        // Start periodic sync as new host
        startSyncInterval()
      }
    }

    socket.on('room:joined',      onJoined)
    socket.on('room:error',       onError)
    socket.on('room:message',     onMessage)
    socket.on('room:users',       onUsers)
    socket.on('room:queue',       onQueue)
    socket.on('room:user-joined', onUserJoined)
    socket.on('room:sync',        onSync)
    socket.on('room:video-changed', onVideoChanged)
    socket.on('room:reaction',    onReaction)
    socket.on('room:kicked',      onKicked)
    socket.on('room:host-changed', onHostChanged)

    return () => {
      socket.off('room:joined',       onJoined)
      socket.off('room:error',        onError)
      socket.off('room:message',      onMessage)
      socket.off('room:users',        onUsers)
      socket.off('room:queue',        onQueue)
      socket.off('room:user-joined',  onUserJoined)
      socket.off('room:sync',         onSync)
      socket.off('room:video-changed', onVideoChanged)
      socket.off('room:reaction',     onReaction)
      socket.off('room:kicked',       onKicked)
      socket.off('room:host-changed', onHostChanged)

      clearInterval(syncTimer.current)
      socket.emit('room:leave', { code: rcode })
    }
  }, []) // run once on mount

  // ─── YouTube IFrame Player ─────────────────────────────────────────────────

  const startSyncInterval = useCallback(() => {
    clearInterval(syncTimer.current)
    syncTimer.current = setInterval(() => {
      if (!playerRef.current || !isHostRef.current) return
      try {
        const state   = playerRef.current.getPlayerState()
        const time    = playerRef.current.getCurrentTime()
        const playing = state === window.YT?.PlayerState?.PLAYING
        getSocket().emit('room:sync', { playing, time })
      } catch { /* player may be unloaded */ }
    }, 5000)
  }, [])

  function bootPlayer(videoId, initialVideoState, hostFlag) {
    loadYtApi(() => {
      if (!playerElRef.current) return

      // Destroy previous instance if re-initializing
      if (playerRef.current) {
        try { playerRef.current.destroy() } catch { /* ignore */ }
        playerRef.current = null
      }

      playerRef.current = new window.YT.Player(playerElRef.current, {
        videoId,
        playerVars: {
          modestbranding: 1,
          rel:            0,
          autoplay:       0,
          enablejsapi:    1,
          origin:         window.location.origin,
        },
        events: {
          onReady: (e) => {
            setSyncStatus('synced')
            // Latecomers: seek to where the room is
            if (initialVideoState && initialVideoState.time > 2) {
              suppressRef.current = true
              e.target.seekTo(initialVideoState.time, true)
              if (initialVideoState.playing) {
                suppressRef.current = true
                e.target.playVideo()
              }
            }
            // Host: start periodic broadcast so viewers stay in sync
            if (hostFlag) startSyncInterval()
          },

          onStateChange: (e) => {
            const YT = window.YT?.PlayerState
            if (!YT) return

            // Track buffering for UI indicator
            if (e.data === YT.BUFFERING) {
              setSyncStatus('buffering')
              return
            }
            if (e.data === YT.PLAYING || e.data === YT.PAUSED) {
              setSyncStatus('synced')
            }

            // Suppress programmatically-triggered state changes
            if (suppressRef.current) {
              suppressRef.current = false
              return
            }

            // Only the host broadcasts sync events
            if (!isHostRef.current) return

            if (e.data === YT.PLAYING || e.data === YT.PAUSED) {
              const playing = e.data === YT.PLAYING
              const time    = playerRef.current?.getCurrentTime() ?? 0
              getSocket().emit('room:sync', { playing, time })
            }

            // Video ended — auto-advance to next queue item
            if (e.data === YT.ENDED) {
              getSocket().emit('room:queue-next')
            }
          },

          onError: () => setSyncStatus('synced'), // reset on error
        },
      })
    })
  }

  const applySync = useCallback((playing, time) => {
    if (!playerRef.current) return
    try {
      const current = playerRef.current.getCurrentTime() ?? 0
      const drift   = Math.abs(current - time)

      suppressRef.current = true
      if (drift > 2) playerRef.current.seekTo(time, true)
      if (playing) playerRef.current.playVideo()
      else         playerRef.current.pauseVideo()
    } catch { /* player may be in a bad state */ }
  }, [])

  const spawnFloat = useCallback((emoji) => {
    const id   = Date.now() + Math.random()
    const left = 25 + Math.random() * 50
    setFloats(prev => [...prev, { id, emoji, left }])
    setTimeout(() => setFloats(prev => prev.filter(f => f.id !== id)), 1300)
  }, [])

  // ─── Actions ──────────────────────────────────────────────────────────────

  const sendMessage = () => {
    if (!chatInput.trim()) return
    getSocket().emit('room:chat', { msg: chatInput })
    setChatInput('')
  }

  const sendReaction = (emoji) => {
    spawnFloat(emoji)
    getSocket().emit('room:reaction', { emoji })
  }

  const kickUser = (userId) => {
    getSocket().emit('room:kick', { userId })
    showToast('User removed from room.', 'danger')
  }

  const muteUser = () => showToast('Chat mute not yet implemented.', 'warning')

  const changeVideo = (newVid) => {
    getSocket().emit('room:video-change', { vid: newVid })
    setShowChangeVideo(false)
    showToast('Video changed for all viewers.', 'success')
  }

  const addToQueue = (newVid) => {
    getSocket().emit('room:queue-add', { vid: newVid })
    setShowAddQueue(false)
    showToast('Added to queue.', 'success')
  }

  const playFromQueue = (vid) => {
    getSocket().emit('room:queue-play', { vid })
  }

  const copyCode = () => {
    navigator.clipboard?.writeText(rcode).catch(() => {})
    showToast(`Code copied: ${rcode}`, 'info')
  }

  // ─── Sync status label ────────────────────────────────────────────────────
  const syncLabel = syncStatus === 'buffering' ? 'Buffering…' : 'In Sync'
  const syncDotColor = syncStatus === 'buffering' ? '#F59E0B' : '#22C55E'

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="room-layout">

      {/* ── Modals ── */}
      {showChangeVideo && (
        <ChangeVideoModal onClose={() => setShowChangeVideo(false)} onSubmit={changeVideo} />
      )}
      {showAddQueue && (
        <ChangeVideoModal
          title="Add to Queue"
          submitLabel="+ Add to Queue"
          onClose={() => setShowAddQueue(false)}
          onSubmit={addToQueue}
        />
      )}

      {/* ── Connecting overlay ── */}
      {connecting && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'var(--bg)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexDirection: 'column', gap: 14,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            border: '3px solid rgba(88,101,242,.2)',
            borderTopColor: '#5865F2',
            animation: 'spin 0.8s linear infinite',
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ color: '#8A90A0', fontSize: 14, fontWeight: 600 }}>Joining room…</p>
        </div>
      )}

      {/* ── Error overlay ── */}
      {roomError && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'var(--bg)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexDirection: 'column', gap: 14, padding: 24, textAlign: 'center',
        }}>
          <span style={{ fontSize: 40 }}>😕</span>
          <h2 style={{ color: '#fff', fontWeight: 800, margin: 0 }}>Room Not Found</h2>
          <p style={{ color: '#8A90A0', fontSize: 14, maxWidth: 340 }}>{roomError}</p>
          <button className="btn btn-primary" onClick={onLeave}>← Back to Home</button>
        </div>
      )}

      {/* ── Room Nav ── */}
      <header className="room-nav">
        <div className="room-nav-left">
          <Logo size={14} />
          <span style={{ color: 'rgba(255,255,255,.2)' }}>·</span>
          <span className="room-nav-title">Watch Party</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button className="room-code-chip" onClick={copyCode} title="Click to copy room code">
            {rcode}
          </button>
          <button
            className="btn btn-ghost"
            style={{ fontSize: 12, padding: '4px 9px' }}
            onClick={onLeave}
          >
            Leave
          </button>
          {isHost && (
            <button
              className="btn btn-secondary"
              style={{ padding: '4px 10px', fontSize: 12 }}
              onClick={() => setShowChangeVideo(true)}
            >
              ↪ Change Video
            </button>
          )}
          <button
            className="btn btn-secondary"
            style={{ padding: '4px 10px', fontSize: 12 }}
            onClick={() => setSidebarOpen(v => !v)}
          >
            {sidebarOpen ? '✕ Hide' : '☰ Chat'}
          </button>
        </div>
      </header>

      {/* ── Room Body ── */}
      <div className="room-body">

        {/* ── Video Column ── */}
        <div className="video-col">
          <div className="video-wrap">
            {/*
              playerElRef is the mount point for the YouTube IFrame API.
              The API replaces this div with an <iframe> on bootPlayer().
              Always rendered so the ref is always in the DOM.
            */}
            <div
              ref={playerElRef}
              style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
            />

            {/* Viewers: block direct player interaction; host controls playback */}
            {!isHost && !connecting && (
              <div
                title="Only the host can control playback"
                style={{
                  position: 'absolute', inset: 0,
                  zIndex: 1,
                  cursor: 'default',
                  // Leave bottom ~50px open so YT's progress bar is visually accessible
                  // but interaction is blocked for consistency
                }}
              />
            )}

            {/* Floating reactions */}
            {floats.map(f => (
              <div key={f.id} className="float-emoji" style={{ left: `${f.left}%`, zIndex: 2 }}>
                {f.emoji}
              </div>
            ))}
          </div>

          <div className="video-bar">
            <span style={{ fontSize: 11, color: '#8A90A0', fontWeight: 600 }}>
              {isHost ? '👑 Host — controls all viewers' : '🟢 Viewer — synced to host'}
            </span>
            <div className="reactions">
              {REACTION_EMOJIS.map(em => (
                <button key={em} className="react-btn" onClick={() => sendReaction(em)} title={`React ${em}`}>
                  {em}
                </button>
              ))}
            </div>
            <div className="sync-pill">
              <span className="sync-dot" style={{ background: syncDotColor }} />
              {syncLabel}
            </div>
          </div>
        </div>

        {/* ── Sidebar ── */}
        <div className={`sidebar${sidebarOpen ? '' : ' closed'}`}>
          <div className="sidebar-tabs">
            {[
              { id: 'chat',  label: '💬 Chat'             },
              { id: 'users', label: `👥 ${users.length}`  },
              { id: 'queue', label: '📋 Queue'             },
            ].map(t => (
              <button
                key={t.id}
                className={`sidebar-tab${tab === t.id ? ' active' : ''}`}
                onClick={() => setTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>

          {tab === 'chat' && (
            <ChatPanel
              messages={messages}
              nick={nick}
              input={chatInput}
              setInput={setChatInput}
              onSend={sendMessage}
            />
          )}
          {tab === 'users' && (
            <UsersList
              users={users}
              nick={nick}
              isHost={isHost}
              onKick={kickUser}
              onMute={muteUser}
            />
          )}
          {tab === 'queue' && (
            <QueuePanel
              queue={queue}
              isHost={isHost}
              onPlay={playFromQueue}
              onAddVideo={() => setShowAddQueue(true)}
            />
          )}
        </div>
      </div>
    </div>
  )
}
