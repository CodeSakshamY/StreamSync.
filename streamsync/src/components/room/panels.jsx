'use client'

import { useRef, useEffect } from 'react'
import { getAvatarColor, getStatusIcon } from '@/lib/helpers'

// ── Chat Panel ────────────────────────────────
export function ChatPanel({ messages, nick, onSend, input, setInput }) {
  const endRef = useRef(null)
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  return (
    <div className="chat-col">
      <div className="chat-msgs">
        {messages.map((m) => (
          <div className="chat-msg" key={m.id}>
            <div className="chat-msg-hdr">
              <span className={`chat-user${m.host ? ' host' : ''}`}>
                {m.host ? '👑 ' : ''}{m.user}
              </span>
              <span className="chat-ts">{m.t}</span>
            </div>
            <div className="chat-text">{m.msg}</div>
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <div className="chat-foot">
        <div className="chat-input-wrap">
          <input
            className="chat-input"
            placeholder={`Message as ${nick}…`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSend()}
          />
          <button className="chat-send" onClick={onSend}>→</button>
        </div>
      </div>
    </div>
  )
}

// ── Users List ────────────────────────────────
export function UsersList({ users, nick, isHost, onKick, onMute }) {
  return (
    <div className="users-list">
      <div className="users-count">Watching Now ({users.length})</div>
      {users.map((u) => (
        <div className="user-row" key={u.id}>
          <div className="user-avatar" style={{ background: getAvatarColor(u.name) }}>
            {u.name[0]}
          </div>
          <span className="user-name">
            {u.host ? '👑 ' : ''}{u.name}{u.name === nick ? ' (you)' : ''}
          </span>
          <span className="user-status">{getStatusIcon(u.status)}</span>
          {isHost && !u.host && u.name !== nick && (
            <div className="user-actions">
              <button className="btn-danger-sm" onClick={() => onMute(u.id)}>Mute</button>
              <button className="btn-danger-sm" onClick={() => onKick(u.id)}>Kick</button>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ── Queue Panel ───────────────────────────────
export function QueuePanel({ queue, isHost, onPlay, onAddVideo }) {
  return (
    <div className="queue-list">
      <div className="users-count">Up Next ({queue.length})</div>
      {queue.map((item, i) => (
        <div className={`queue-item${item.active ? ' active' : ''}`} key={item.id}>
          <span className="queue-num">{i + 1}</span>
          <div className="queue-thumb">
            <img
              src={`https://img.youtube.com/vi/${item.vid}/mqdefault.jpg`}
              alt={item.title}
              loading="lazy"
            />
          </div>
          <span className="queue-title">{item.title}</span>
          {item.active && <span className="pill pill-blue" style={{ fontSize: 9, flexShrink: 0 }}>Now</span>}
          {isHost && !item.active && (
            <button className="queue-play-btn" onClick={() => onPlay(item.vid)}>▶</button>
          )}
        </div>
      ))}
      {isHost && (
        <button
          className="btn btn-secondary"
          style={{ width: '100%', padding: '7px', fontSize: 12, marginTop: 4 }}
          onClick={onAddVideo}
        >
          + Add Video
        </button>
      )}
    </div>
  )
}
