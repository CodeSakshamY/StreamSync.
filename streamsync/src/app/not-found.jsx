import Link from 'next/link'

export const metadata = { title: 'Room Not Found — StreamSync' }

export default function NotFound() {
  return (
    <main style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', minHeight: '100vh', textAlign: 'center', padding: '40px 20px',
    }}>
      <div style={{
        fontFamily: "'Syne', sans-serif", fontSize: 'clamp(64px,12vw,120px)',
        fontWeight: 800, color: '#5865F2', lineHeight: 1, marginBottom: 16,
      }}>
        404
      </div>
      <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(20px,3vw,28px)', fontWeight: 800, marginBottom: 10 }}>
        Room not found
      </h1>
      <p style={{ fontSize: 15, color: '#8A90A0', maxWidth: 360, lineHeight: 1.65, marginBottom: 28 }}>
        This room may have expired or the code is incorrect. Rooms auto-expire after 10 minutes of inactivity.
      </p>
      <Link href="/" className="btn btn-primary" style={{ fontSize: 14, padding: '12px 24px' }}>
        ← Back to StreamSync
      </Link>
    </main>
  )
}
