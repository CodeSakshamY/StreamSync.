'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({ error, reset }) {
  useEffect(() => { console.error(error) }, [error])

  return (
    <main style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', minHeight: '100vh', textAlign: 'center', padding: '40px 20px',
    }}>
      <div style={{ fontSize: 48, marginBottom: 14 }}>⚠️</div>
      <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 24, fontWeight: 800, marginBottom: 10 }}>
        Something went wrong
      </h2>
      <p style={{ fontSize: 14, color: '#8A90A0', maxWidth: 360, lineHeight: 1.65, marginBottom: 24 }}>
        An unexpected error occurred. You can try again or return to the home page.
      </p>
      <div style={{ display: 'flex', gap: 10 }}>
        <button className="btn btn-primary" onClick={reset} style={{ fontSize: 14, padding: '11px 20px' }}>
          Try Again
        </button>
        <Link href="/" className="btn btn-secondary" style={{ fontSize: 14, padding: '11px 20px' }}>
          ← Home
        </Link>
      </div>
    </main>
  )
}
