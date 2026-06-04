'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Logo } from './index'

const TABS = [
  { href: '/',     label: '🏠 Platform'     },
  { href: '/arch', label: '🏗 Architecture' },
  { href: '/seo',  label: '📈 SEO Report'   },
]

export function GlobalNav({ rightSlot }) {
  const pathname = usePathname()

  return (
    <nav className="global-nav">
      <Link href="/" style={{ textDecoration: 'none' }}>
        <Logo />
      </Link>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <div className="nav-tabs">
          {TABS.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className={`nav-tab${pathname === t.href ? ' active' : ''}`}
            >
              {t.label}
            </Link>
          ))}
        </div>
        {rightSlot && (
          <div style={{ display: 'flex', gap: 8, marginLeft: 8 }}>{rightSlot}</div>
        )}
      </div>
    </nav>
  )
}
