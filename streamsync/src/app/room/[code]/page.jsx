import { Suspense } from 'react'
import RoomClient from './RoomClient'

export default async function RoomPage({ params }) {
  const { code } = await params
  return (
    <Suspense fallback={
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', flexDirection: 'column', gap: 14,
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
    }>
      <RoomClient code={code} />
    </Suspense>
  )
}
