import './globals.css'

export const metadata = {
  metadataBase: new URL('https://streamsync.app'),
  title: {
    default: 'StreamSync — Watch YouTube Together in Real Time | Free Watch Party',
    template: '%s | StreamSync',
  },
  description:
    'Free watch party platform. Sync YouTube videos with friends in under 10 seconds. No account, no downloads, no extensions required.',
  keywords: [
    'watch party', 'sync youtube', 'watch together', 'watch party app',
    'synchronized video', 'free watch party', 'online watch party',
    'streamsync', 'youtube watch party',
  ],
  authors: [{ name: 'StreamSync', url: 'https://streamsync.app' }],
  creator: 'StreamSync',
  openGraph: {
    type: 'website',
    url: 'https://streamsync.app',
    title: 'StreamSync — Watch YouTube Together in Real Time',
    description: 'Free watch party rooms. Perfect sync, live chat, no account needed. Create a room in under 10 seconds.',
    siteName: 'StreamSync',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'StreamSync Watch Party Platform' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'StreamSync — Watch YouTube Together',
    description: 'Free real-time watch party. Sync YouTube with friends in 10 seconds.',
    images: ['/og-image.jpg'],
  },
  robots: { index: true, follow: true },
  icons: { icon: '/favicon.svg' },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: 'StreamSync',
              url: 'https://streamsync.app',
              description: 'Real-time watch party platform. Sync YouTube videos with friends instantly. No account required.',
              applicationCategory: 'EntertainmentApplication',
              operatingSystem: 'Web Browser, iOS, Android',
              offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
              featureList: [
                'Synchronized video playback', 'Real-time group chat',
                'Instant room creation', 'No account required',
                'Mobile-first design', 'Auto-sync drift correction every 5s',
                'Host moderation controls', 'Late-join sync', 'Auto-reconnect', 'Video queue',
              ],
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: [
                { '@type': 'Question', name: 'What is StreamSync?', acceptedAnswer: { '@type': 'Answer', text: 'StreamSync is a free real-time watch party platform that synchronises YouTube videos for groups. Create a room, share a 6-character code, and watch together — no account needed.' } },
                { '@type': 'Question', name: 'Do I need an account to use StreamSync?', acceptedAnswer: { '@type': 'Answer', text: 'No account, no sign-up, no downloads. Enter a YouTube URL, get a room code, share with friends, and start watching in under 10 seconds.' } },
                { '@type': 'Question', name: 'How many people can join a StreamSync room?', acceptedAnswer: { '@type': 'Answer', text: 'Up to 50 people can watch simultaneously in one room. V1 expands this to 500 viewers per room.' } },
                { '@type': 'Question', name: 'How does StreamSync keep everyone in sync?', acceptedAnswer: { '@type': 'Answer', text: 'Play, pause, and seek events broadcast via WebSocket instantly. Auto-correction runs every 5 seconds and resyncs anyone drifting more than 2 seconds.' } },
                { '@type': 'Question', name: 'What happens if the host leaves?', acceptedAnswer: { '@type': 'Answer', text: 'The room stays active for 10–15 minutes. If the host returns, privileges restore. If not, the oldest remaining participant becomes host automatically.' } },
                { '@type': 'Question', name: 'Does StreamSync work on mobile?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. StreamSync is mobile-first — iOS, Android, and all modern mobile browsers supported.' } },
              ],
            }),
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
