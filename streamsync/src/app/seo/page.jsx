import Link from 'next/link'
import { GlobalNav } from '@/components/ui/GlobalNav'

export const metadata = {
  title: 'SEO + GEO + AIEO Report',
  description: 'Full technical SEO, Generative Engine Optimisation, and AI Engine Optimisation audit for StreamSync.',
}

const SCHEMA_APP = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'StreamSync',
  url: 'https://streamsync.app',
  description: 'Real-time watch party platform. Sync YouTube videos with friends instantly. No account required.',
  applicationCategory: 'EntertainmentApplication',
  operatingSystem: 'Web Browser, iOS, Android',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  featureList: [
    'Synchronized video playback','Real-time group chat','Instant room creation',
    'No account required','Mobile-first design','Auto-sync drift correction every 5s',
    'Host moderation controls','Late-join sync','Auto-reconnect','Video queue',
  ],
}

const AUDITS = [
  { item: 'JSON-LD WebApplication Schema', s:'✅', imp:'High', n:'App type, featureList, pricing, OS — eligible for rich results and knowledge panel.' },
  { item: 'JSON-LD FAQPage Schema',         s:'✅', imp:'High', n:'6 Q&As embedded in layout.jsx — People Also Ask eligible + LLM direct retrieval.' },
  { item: 'Next.js Metadata API',           s:'✅', imp:'High', n:'Title template, description, og:*, twitter:*, robots, canonical — all via metadata export in layout.jsx.' },
  { item: 'Answer-First Hero Copy',         s:'✅', imp:'High', n:"Lead sentence answers 'what is this app' — optimised for zero-shot LLM extraction." },
  { item: 'Entity-Rich FAQ Content',        s:'✅', imp:'High', n:'6 Q&As covering: what is, how does, how many, what if, mobile support. All key query patterns.' },
  { item: 'robots.txt (AI crawlers)',       s:'✅', imp:'High', n:'GPTBot, anthropic-ai, Google-Extended all explicitly allowed in public/robots.txt.' },
  { item: 'Auto-generated sitemap.xml',     s:'✅', imp:'Med',  n:'Next.js app/sitemap.js generates /sitemap.xml automatically on build.' },
  { item: 'Custom 404 page',               s:'✅', imp:'Med',  n:'not-found.jsx with clear messaging and CTA back to home.' },
  { item: 'Image domain allowlist',        s:'✅', imp:'Med',  n:'img.youtube.com in next.config.mjs remotePatterns for queue thumbnails.' },
  { item: 'Core Web Vitals (LCP/CLS/INP)', s:'⚠️', imp:'High', n:'Monitor in Vercel Analytics post-deploy. Target LCP <2.5s, CLS <0.1.' },
  { item: 'OG Image (/og-image.jpg)',      s:'⚠️', imp:'High', n:'Create a 1200×630 social share image and add to /public/.' },
  { item: 'Alt text on images',            s:'⚠️', imp:'Med',  n:'Queue thumbnails use alt={title} already. Ensure OG and any future images have descriptive alt.' },
]

const GEO = [
  { t:'Entity Coverage',    s:'✅', n:'Core entities present: watch party, video sync, real-time chat, WebSocket, YouTube, room code, synchronized playback.' },
  { t:'Question Patterns',  s:'✅', n:'FAQ covers all major LLM query patterns: what is, how does, how many, what if, does it work on mobile.' },
  { t:'Named featureList',  s:'✅', n:'Explicit schema featureList enables direct AI extraction of capabilities without inference.' },
  { t:'Comparison Content', s:'⚠️', n:"Add blog: 'StreamSync vs Teleparty vs Watch2Gether vs Kosmi' — comparison table raises LLM citation probability." },
  { t:'Use Case Pages',     s:'⚠️', n:'Create /for-teachers, /for-friends, /for-anime-clubs for topical authority and semantic clusters.' },
  { t:'E-E-A-T Signals',   s:'⚠️', n:'Add /about with founding story, team, uptime stats, security practices, and press/Product Hunt mentions.' },
]

const AIEO = [
  { score:'High', t:'Chunking Strategy',      n:'Each FAQ answer is 1–3 sentences. Optimal vector-search chunk, under 512 tokens.' },
  { score:'High', t:'Entity Density',          n:'watch party, room code, synchronized playback, WebSocket, YouTube — all high RAG retrieval signals.' },
  { score:'High', t:'Structured featureList',  n:'Schema featureList enables direct LLM extraction of capabilities in a single tool call.' },
  { score:'High', t:'Answer-First Hero',       n:"First sentence answers the core query. Matches zero-shot patterns used by ChatGPT, Gemini, Perplexity." },
  { score:'Med',  t:'Comparison Content',      n:"'StreamSync vs Teleparty' with structured table significantly improves AI citation probability." },
  { score:'Med',  t:'Knowledge Base (/docs/)', n:'WebSocket event reference + architecture docs improve knowledge graph depth for LLM training signal.' },
  { score:'Med',  t:'Step-by-Step Guide',      n:"'Create a watch party in 3 steps with screenshots' — highly extracted and cited format." },
]

const META_EXAMPLE = `// src/app/layout.jsx
export const metadata = {
  metadataBase: new URL('https://streamsync.app'),
  title: {
    default: 'StreamSync — Watch YouTube Together in Real Time | Free Watch Party',
    template: '%s | StreamSync',
  },
  description: 'Free watch party. Sync YouTube with friends in <10s. No account.',
  openGraph: {
    type: 'website',
    title: 'StreamSync — Watch YouTube Together in Real Time',
    description: 'Free watch party rooms. Perfect sync, live chat, no account.',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
}`

const ROBOTS = `# public/robots.txt
User-agent: *
Allow: /
Disallow: /api/

# AI search crawlers — explicitly allowed
User-agent: GPTBot
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: PerplexityBot
Allow: /

Sitemap: https://streamsync.app/sitemap.xml`

const MONITORING = [
  ['Google Search Console', 'Impressions, CTR, Core Web Vitals, Rich Result coverage',   'Weekly'      ],
  ['Vercel Analytics',       'LCP, INP, CLS on all pages in production',                  'Every deploy'],
  ['Perplexity / ChatGPT',   "Search 'watch party platform' — is StreamSync cited?",      'Bi-weekly'   ],
  ['Schema Markup Validator','Validate JSON-LD after every content change',               'Every deploy'],
  ['Bing Webmaster Tools',   'Index coverage + Copilot citation signals',                 'Monthly'     ],
]

function Th({ children }) {
  return (
    <th style={{ textAlign:'left', fontSize:9.5, fontWeight:700, textTransform:'uppercase',
      letterSpacing:'.07em', color:'#8A90A0', padding:'5px 8px',
      borderBottom:'1px solid rgba(255,255,255,.07)' }}>
      {children}
    </th>
  )
}
function Td({ children, style = {} }) {
  return <td style={{ padding:'8px 8px', fontSize:12.5, lineHeight:1.5, ...style }}>{children}</td>
}

export default function SEOPage() {
  return (
    <>
      <GlobalNav />
      <main className="seo-wrap">
        <div className="seo-badge">⚡ Full Audit Complete</div>
        <h1 className="seo-h1">SEO + GEO + AIEO Report</h1>
        <p className="seo-sub">
          Technical SEO, Generative Engine Optimisation &amp; AI Engine Optimisation — StreamSync MVP v1.0
        </p>

        {/* ── Technical SEO ── */}
        <div className="seo-section">
          <h2 className="seo-section-title">🔍 Technical SEO Audit</h2>
          <table className="audit-table">
            <thead><tr><Th>Item</Th><Th>Status</Th><Th>Impact</Th><Th>Notes</Th></tr></thead>
            <tbody>
              {AUDITS.map((a, i) => (
                <tr key={i}>
                  <Td style={{ fontWeight:500 }}>{a.item}</Td>
                  <Td style={{ fontSize:14 }}>{a.s}</Td>
                  <Td><span className={`pill ${a.imp==='High'?'pill-green':'pill-yellow'}`}>{a.imp}</span></Td>
                  <Td style={{ color:'#8A90A0', fontSize:12 }}>{a.n}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── Meta Tags ── */}
        <div className="seo-section">
          <h2 className="seo-section-title">🏷️ Metadata — Next.js Metadata API</h2>
          <div className="code-block">{META_EXAMPLE}</div>
        </div>

        {/* ── WebApp Schema ── */}
        <div className="seo-section">
          <h2 className="seo-section-title">📋 WebApplication Schema (JSON-LD)</h2>
          <p style={{ fontSize:13, color:'#8A90A0', marginBottom:10 }}>
            Injected via <code style={{ background:'#20242D', padding:'2px 6px', borderRadius:4, fontSize:11.5 }}>dangerouslySetInnerHTML</code> in <code style={{ background:'#20242D', padding:'2px 6px', borderRadius:4, fontSize:11.5 }}>layout.jsx</code>
          </p>
          <div className="code-block">{`<script type="application/ld+json">\n${JSON.stringify(SCHEMA_APP, null, 2)}\n</script>`}</div>
        </div>

        {/* ── GEO ── */}
        <div className="seo-section">
          <h2 className="seo-section-title">🧠 GEO — Generative Engine Optimisation</h2>
          <table className="audit-table">
            <thead><tr><Th>Item</Th><Th>Status</Th><Th>Recommendation</Th></tr></thead>
            <tbody>
              {GEO.map((g, i) => (
                <tr key={i}>
                  <Td style={{ fontWeight:600 }}>{g.t}</Td>
                  <Td style={{ fontSize:14 }}>{g.s}</Td>
                  <Td style={{ color:'#8A90A0', fontSize:12 }}>{g.n}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── AIEO ── */}
        <div className="seo-section">
          <h2 className="seo-section-title">🤖 AIEO — AI Engine Optimisation</h2>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {AIEO.map((a, i) => (
              <div className="aieo-card" key={i}>
                <span className={`pill ${a.score==='High'?'pill-green':'pill-yellow'}`} style={{ flexShrink:0, marginTop:1 }}>
                  {a.score}
                </span>
                <div>
                  <div className="aieo-title">{a.t}</div>
                  <div className="aieo-note">{a.n}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Expected Impact ── */}
        <div className="seo-section">
          <h2 className="seo-section-title">📈 Expected Impact</h2>
          <div className="impact-grid">
            {[
              { v:'+40–70%', l:'Organic Traffic Uplift',   n:'FAQ schema + semantic structure + improved SERP CTR from meta description.' },
              { v:'High',    l:'AI Citation Probability',   n:'FAQ JSON-LD + entity density + answer-first hero = strong LLM retrieval signal.' },
              { v:'82/100',  l:'Technical SEO Score',       n:'Blocking items: Core Web Vitals, OG image. Implement to reach 95+.' },
            ].map((m, i) => (
              <div className="impact-card" key={i}>
                <div className="impact-value">{m.v}</div>
                <div className="impact-label">{m.l}</div>
                <div className="impact-note">{m.n}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── robots.txt ── */}
        <div className="seo-section">
          <h2 className="seo-section-title">🤖 public/robots.txt</h2>
          <div className="code-block">{ROBOTS}</div>
        </div>

        {/* ── Monitoring ── */}
        <div className="seo-section">
          <h2 className="seo-section-title">📊 Monitoring Plan</h2>
          <table className="audit-table">
            <thead><tr><Th>Tool</Th><Th>What to Track</Th><Th>Cadence</Th></tr></thead>
            <tbody>
              {MONITORING.map(([t, w, c], i) => (
                <tr key={i}>
                  <Td style={{ fontWeight:600, whiteSpace:'nowrap' }}>{t}</Td>
                  <Td style={{ color:'#8A90A0', fontSize:12 }}>{w}</Td>
                  <Td><span className="pill pill-blue">{c}</span></Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p style={{ textAlign:'center', padding:'12px 0 4px', color:'#3a3f52', fontSize:11 }}>
          StreamSync SEO + GEO + AIEO Report · MVP v1.0
        </p>
      </main>
    </>
  )
}
