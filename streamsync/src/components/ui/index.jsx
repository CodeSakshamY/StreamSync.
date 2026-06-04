'use client'

// ── Logo ──────────────────────────────────────
export function Logo({ size = 18 }) {
  return (
    <span className="logo" style={{ fontSize: size }}>
      StreamSync <span className="logo-dot" />
    </span>
  )
}

// ── Toast ─────────────────────────────────────
export function Toast({ msg, kind = 'info' }) {
  const icons = { success: '✓', info: 'ℹ', danger: '✕', warning: '⚠' }
  return (
    <div className={`toast toast-${kind}`}>
      {icons[kind]} {msg}
    </div>
  )
}

// ── FAQItem ───────────────────────────────────
import { useState } from 'react'

export function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="faq-item">
      <button className="faq-btn" onClick={() => setOpen(!open)}>
        <span>{q}</span>
        <span className={`faq-chevron${open ? ' open' : ''}`}>▾</span>
      </button>
      {open && <p className="faq-answer">{a}</p>}
    </div>
  )
}
