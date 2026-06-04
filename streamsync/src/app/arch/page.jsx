import Link from 'next/link'
import { GlobalNav } from '@/components/ui/GlobalNav'

export const metadata = {
  title: 'Architecture',
  description: 'StreamSync technical architecture — Next.js 14, FastAPI, WebSockets, SQLite/PostgreSQL.',
}

const STACK = [
  { icon: '⚛️', title: 'Frontend — Next.js 14',   desc: 'App Router · React Server Components · Client islands · Path aliases · TypeScript-ready', hi: true  },
  { icon: '🐍', title: 'Backend — FastAPI',         desc: 'Room management · Sync engine · Presence tracking · Chat · Moderation actions',           hi: true  },
  { icon: '🔌', title: 'Real-Time — WebSockets',    desc: 'Persistent WS connection per user. Events broadcast instantly to all room participants.',  hi: true  },
  { icon: '🗄️', title: 'Database — SQLite → PG',   desc: 'SQLite for local/MVP. Swap to PostgreSQL (Supabase, Neon, Railway) for production.',       hi: false },
  { icon: '☁️', title: 'Hosting — Vercel',          desc: 'Zero-config Next.js deployment. Edge Network, Analytics, preview URLs on every push.',     hi: false },
  { icon: '🔒', title: 'Security',                  desc: 'Input validation · XSS escaping · Rate limiting on room creation + chat · No auth required for MVP.', hi: false },
]

const EVENTS = [
  'join', 'leave', 'play', 'pause', 'seek',
  'sync', 'chat', 'video_change', 'mute', 'kick', 'delete_message',
]

const DB_TABLES = [
  { name: 'rooms',              fields: ['id', 'room_code', 'video_id', 'host_id', 'created_at', 'last_activity']       },
  { name: 'participants',       fields: ['id', 'room_id', 'nickname', 'joined_at', 'status']                            },
  { name: 'messages',           fields: ['id', 'room_id', 'user', 'message', 'timestamp']                               },
  { name: 'room_state',         fields: ['room_id', 'current_time', 'is_playing', 'last_sync']                          },
  { name: 'moderation_actions', fields: ['id', 'room_id', 'target_user', 'action', 'timestamp']                         },
]

const ENDPOINTS = [
  { method: 'POST', path: '/room/create', desc: 'Input: YouTube URL → Output: { roomId, videoId, roomCode }' },
  { method: 'POST', path: '/room/join',   desc: 'Input: room code + nickname. Validates room is active.' },
  { method: 'WS',   path: '/room/{id}',   desc: 'Persistent WebSocket. Handles all real-time events bi-directionally.' },
  { method: 'GET',  path: '/room/{id}',   desc: 'Returns current room state (videoId, currentTime, isPlaying, participants).' },
]

const SYNC_STEPS = [
  { n: '1', title: 'Host triggers event',   desc: 'Host presses play/pause/seek in their browser.' },
  { n: '2', title: 'Client emits WS event', desc: 'React sends a play/pause/seek message over the WebSocket.' },
  { n: '3', title: 'Server broadcasts',     desc: 'FastAPI broadcasts the event to all connected clients in the room.' },
  { n: '4', title: 'Clients receive',       desc: "Each viewer's YouTube iframe is synced to the new state." },
  { n: '5', title: 'Drift correction',      desc: 'Every 5s the server compares timestamps. If drift > 2s, a sync event is broadcast.' },
]

export default function ArchPage() {
  return (
    <>
      <GlobalNav />
      <main className="arch-wrap">
        <div className="section-eyebrow" style={{ marginBottom: 8 }}>Technical Architecture</div>
        <h1 className="section-h2" style={{ marginBottom: 6 }}>How StreamSync is built</h1>
        <p style={{ fontSize: 13.5, color: '#8A90A0', marginBottom: 32, lineHeight: 1.65, maxWidth: 520 }}>
          Next.js 14 App Router on the frontend · FastAPI on the backend · WebSockets for real-time · SQLite for MVP, PostgreSQL for scale.
        </p>

        {/* Stack */}
        <div className="arch-grid" style={{ marginBottom: 20 }}>
          {STACK.map((s) => (
            <div className={`arch-card${s.hi ? ' highlight' : ''}`} key={s.title}>
              <div className="arch-card-icon">{s.icon}</div>
              <div className="arch-card-title">{s.title}</div>
              <p className="arch-card-desc">{s.desc}</p>
            </div>
          ))}
        </div>

        {/* Sync flow */}
        <div className="arch-card" style={{ marginBottom: 20 }}>
          <div className="arch-card-title" style={{ marginBottom: 14 }}>⚡ Sync Flow — How play/pause/seek stays in sync</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {SYNC_STEPS.map((s) => (
              <div key={s.n} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{
                  width: 22, height: 22, borderRadius: '50%', background: 'rgba(88,101,242,.2)',
                  border: '1px solid rgba(88,101,242,.4)', color: '#818cf8',
                  fontFamily: "'Syne', sans-serif", fontSize: 11, fontWeight: 800,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1,
                }}>
                  {s.n}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>{s.title}</div>
                  <div style={{ fontSize: 12, color: '#8A90A0', lineHeight: 1.55 }}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* WebSocket events */}
        <div className="arch-card" style={{ marginBottom: 20 }}>
          <div className="arch-card-title" style={{ marginBottom: 9 }}>WebSocket Event Types (11)</div>
          <div>{EVENTS.map((e) => <span key={e} className="event-chip">{e}</span>)}</div>
        </div>

        {/* API Endpoints */}
        <div style={{ marginBottom: 20 }}>
          <div className="arch-card-title" style={{ marginBottom: 12, fontSize: 14 }}>API Endpoints</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {ENDPOINTS.map((ep) => (
              <div className="arch-card" key={ep.path} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <span style={{
                  fontFamily: "'Courier New', monospace", fontSize: 10, fontWeight: 700,
                  background: 'rgba(88,101,242,.15)', color: '#818cf8',
                  border: '1px solid rgba(88,101,242,.3)', borderRadius: 4,
                  padding: '2px 7px', flexShrink: 0, marginTop: 1,
                }}>{ep.method}</span>
                <div>
                  <div style={{ fontFamily: "'Courier New', monospace", fontSize: 11.5, color: '#fff', marginBottom: 3 }}>{ep.path}</div>
                  <div className="arch-card-desc">{ep.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Database Schema */}
        <div style={{ marginBottom: 20 }}>
          <div className="arch-card-title" style={{ marginBottom: 12, fontSize: 14 }}>Database Schema</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(175px, 1fr))', gap: 9 }}>
            {DB_TABLES.map((t) => (
              <div className="db-table" key={t.name}>
                <div className="db-name">{t.name}</div>
                {t.fields.map((f) => <span key={f} className="db-field">{f}</span>)}
              </div>
            ))}
          </div>
        </div>

        {/* Next.js File Structure */}
        <div className="arch-card" style={{ marginBottom: 20 }}>
          <div className="arch-card-title" style={{ marginBottom: 10 }}>📁 Next.js File Structure</div>
          <div style={{
            fontFamily: "'Courier New', monospace", fontSize: 11, color: '#8A90A0',
            lineHeight: 2, whiteSpace: 'pre',
          }}>{`streamsync/
├── src/
│   ├── app/
│   │   ├── layout.jsx          ← Root layout + metadata + JSON-LD
│   │   ├── page.jsx            ← Landing page
│   │   ├── globals.css         ← Full design system
│   │   ├── sitemap.js          ← Auto-generated sitemap.xml
│   │   ├── not-found.jsx       ← Custom 404
│   │   ├── error.jsx           ← Error boundary
│   │   ├── loading.jsx         ← Global loading state
│   │   ├── room/[code]/
│   │   │   ├── page.jsx        ← Room page (Suspense wrapper)
│   │   │   └── RoomClient.jsx  ← Client: reads searchParams
│   │   ├── seo/page.jsx        ← SEO + GEO + AIEO report
│   │   └── arch/page.jsx       ← Architecture overview
│   ├── components/
│   │   ├── ui/                 ← Logo, Toast, FAQItem, GlobalNav
│   │   ├── landing/            ← Hero, Stats, Features, FAQ, Footer
│   │   ├── modals/             ← CreateRoom, JoinRoom, ChangeVideo
│   │   └── room/               ← WatchRoom, ChatPanel, UsersList, QueuePanel
│   ├── hooks/
│   │   └── useToast.js
│   └── lib/
│       ├── constants.js        ← Seed data, FAQ, features, stats
│       └── helpers.js          ← genRoomCode, extractVideoId, formatTime
├── public/
│   ├── robots.txt              ← AI crawler rules
│   └── favicon.svg
├── next.config.mjs
├── vercel.json
└── package.json`}</div>
        </div>

        <p style={{ textAlign: 'center', padding: '8px 0 4px', color: '#3a3f52', fontSize: 11 }}>
          StreamSync · Architecture Overview · MVP v1.0
        </p>
      </main>
    </>
  )
}
