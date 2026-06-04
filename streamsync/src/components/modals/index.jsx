'use client'

import { useState } from 'react'
import { Logo } from '@/components/ui'
import { extractVideoId } from '@/lib/helpers'

// ── Shared modal wrapper ──────────────────────
function ModalWrap({ onBackdrop, children }) {
  return (
    <div
      className="overlay"
      onMouseDown={(e) => e.target === e.currentTarget && onBackdrop()}
    >
      <div className="modal">{children}</div>
    </div>
  )
}

// ── Room Created Modal ────────────────────────
export function RoomCreatedModal({ code, onEnter }) {
  const [copied, setCopied] = useState(false)

  const copy = () => {
    navigator.clipboard?.writeText(code).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <ModalWrap onBackdrop={() => {}}>
      <Logo size={15} />
      <h2 className="modal-title">Room Created! 🎉</h2>
      <p className="modal-sub">Share this code with your friends so they can join.</p>

      <div
        onClick={copy}
        style={{
          textAlign: 'center',
          letterSpacing: '0.18em',
          fontFamily: "'Syne', sans-serif",
          fontSize: 36,
          fontWeight: 900,
          color: '#818cf8',
          background: 'rgba(88,101,242,.1)',
          border: '2px dashed rgba(88,101,242,.4)',
          borderRadius: 12,
          padding: '18px 24px',
          margin: '12px 0 8px',
          cursor: 'pointer',
          userSelect: 'all',
          transition: 'background .15s',
        }}
      >
        {code}
      </div>

      <button
        className="btn btn-secondary"
        style={{ width: '100%', marginBottom: 10, justifyContent: 'center' }}
        onClick={copy}
      >
        {copied ? '✓ Copied!' : '📋 Copy Code'}
      </button>

      <button className="btn btn-primary" style={{ width: '100%' }} onClick={onEnter}>
        ▶ Enter Room
      </button>
    </ModalWrap>
  )
}

// ── Create Room Modal ─────────────────────────
export function CreateRoomModal({ onClose, onSubmit }) {
  const [url, setUrl]   = useState('')
  const [err, setErr]   = useState('')

  const handleSubmit = () => {
    if (!url.trim()) { setErr('Enter a YouTube URL'); return }
    const vid = extractVideoId(url)
    if (!vid) { setErr('Invalid YouTube URL — try youtube.com/watch?v=...'); return }
    onSubmit(vid)
  }

  return (
    <ModalWrap onBackdrop={onClose}>
      <Logo size={15} />
      <h2 className="modal-title">Create a Room</h2>
      <p className="modal-sub">Paste a YouTube URL. Get a code. Share it. Start watching.</p>

      <label className="form-label">YouTube URL</label>
      <input
        className={`form-input${err ? ' error' : ''}`}
        placeholder="https://youtube.com/watch?v=..."
        value={url}
        onChange={(e) => { setUrl(e.target.value); setErr('') }}
        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        autoFocus
      />
      {err && <p className="form-error">⚠ {err}</p>}

      <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleSubmit}>
        ▶ Create Room
      </button>
      <button className="btn btn-ghost" style={{ width: '100%', marginTop: 7, justifyContent: 'center' }} onClick={onClose}>
        ← Back
      </button>
    </ModalWrap>
  )
}

// ── Join Room Modal ───────────────────────────
export function JoinRoomModal({ onClose, onSubmit }) {
  const [code, setCode] = useState('')
  const [nick, setNick] = useState('')

  const handleSubmit = () => {
    if (!code.trim() || !nick.trim()) return
    onSubmit(code.toUpperCase(), nick.trim())
  }

  return (
    <ModalWrap onBackdrop={onClose}>
      <Logo size={15} />
      <h2 className="modal-title">Join a Room</h2>
      <p className="modal-sub">Enter the room code from your friend and pick a nickname.</p>

      <label className="form-label">Room Code</label>
      <input
        className="form-input"
        placeholder="e.g. RIVER7"
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        maxLength={8}
        style={{ textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 800 }}
        autoFocus
      />

      <label className="form-label">Nickname</label>
      <input
        className="form-input"
        placeholder="Your nickname"
        value={nick}
        onChange={(e) => setNick(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        maxLength={20}
      />

      <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleSubmit} disabled={!code || !nick}>
        → Join Room
      </button>
      <button className="btn btn-ghost" style={{ width: '100%', marginTop: 7, justifyContent: 'center' }} onClick={onClose}>
        ← Back
      </button>
    </ModalWrap>
  )
}

// ── Change Video Modal ────────────────────────
export function ChangeVideoModal({ onClose, onSubmit, title = 'Change Video', submitLabel = '↪ Change for Everyone' }) {
  const [url, setUrl] = useState('')
  const [err, setErr] = useState('')

  const handleSubmit = () => {
    const vid = extractVideoId(url)
    if (!vid) { setErr('Invalid YouTube URL'); return }
    onSubmit(vid)
  }

  return (
    <ModalWrap onBackdrop={onClose}>
      <h2 className="modal-title" style={{ marginTop: 0 }}>{title}</h2>
      <p className="modal-sub">Paste a new YouTube URL — all viewers switch instantly.</p>

      <label className="form-label">New YouTube URL</label>
      <input
        className={`form-input${err ? ' error' : ''}`}
        placeholder="https://youtube.com/watch?v=..."
        value={url}
        onChange={(e) => { setUrl(e.target.value); setErr('') }}
        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        autoFocus
      />
      {err && <p className="form-error">⚠ {err}</p>}

      <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleSubmit}>
        {submitLabel}
      </button>
      <button className="btn btn-ghost" style={{ width: '100%', marginTop: 7, justifyContent: 'center' }} onClick={onClose}>
        Cancel
      </button>
    </ModalWrap>
  )
}
