'use client'

import Link from 'next/link'
import { FAQItem } from '@/components/ui'
import { FEATURES, STATS, FAQ_DATA } from '@/lib/constants'

// ── Hero ──────────────────────────────────────
export function Hero({ onCreate, onJoin }) {
  return (
    <section className="landing-hero">
      <div className="hero-glow" />
      <div className="hero-eyebrow">
        <span className="logo-dot" style={{ width: 6, height: 6 }} />
        Real-Time Watch Party Platform
      </div>
      <h1 className="hero-h1">
        Watch parties.<br /><em>Perfectly in sync.</em>
      </h1>
      <p className="hero-sub">
        Create a room, share a code, and watch YouTube with anyone — no account, no extensions, no friction.
      </p>
      <div className="hero-ctas">
        <button
          className="btn btn-primary"
          style={{ fontSize: 15, padding: '14px 28px' }}
          onClick={onCreate}
        >
          ▶ Create a Room
        </button>
        <button
          className="btn btn-secondary"
          style={{ fontSize: 15, padding: '14px 28px' }}
          onClick={onJoin}
        >
          # Join with Code
        </button>
      </div>
    </section>
  )
}

// ── Stats Bar ─────────────────────────────────
export function Stats() {
  return (
    <div className="stats-bar">
      {STATS.map(({ value, label }) => (
        <div className="stat-cell" key={label}>
          <div className="stat-value">{value}</div>
          <div className="stat-label">{label}</div>
        </div>
      ))}
    </div>
  )
}

// ── Features Grid ─────────────────────────────
export function Features() {
  return (
    <section className="section">
      <div className="section-eyebrow">Platform Features</div>
      <h2 className="section-h2">Everything you need.</h2>
      <p className="section-sub">No unnecessary complexity. Every feature earns its place.</p>
      <div className="features-grid">
        {FEATURES.map((f) => (
          <div className="feature-card" key={f.title}>
            <div className="feature-icon">{f.icon}</div>
            <div className="feature-title">{f.title}</div>
            <p className="feature-desc">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

// ── FAQ ───────────────────────────────────────
export function FAQ() {
  return (
    <section className="faq-section">
      <div className="section-eyebrow">FAQ</div>
      <h2 className="section-h2" style={{ marginBottom: 24 }}>Common questions</h2>
      {FAQ_DATA.map((item, i) => (
        <FAQItem key={i} q={item.q} a={item.a} />
      ))}
    </section>
  )
}

// ── Footer ────────────────────────────────────
export function Footer() {
  return (
    <footer className="site-footer">
      <p>StreamSync — Watch Together. Anywhere. · Free · No account required</p>
      <p>
        <Link href="/seo"  className="footer-link">SEO + GEO + AIEO Report →</Link>
        {' · '}
        <Link href="/arch" className="footer-link">Architecture →</Link>
      </p>
    </footer>
  )
}
