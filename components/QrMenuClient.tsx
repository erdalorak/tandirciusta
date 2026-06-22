'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import type { MenuCategory, MenuItem } from '@/lib/supabase'

type Props = {
  categories: MenuCategory[]
  items: MenuItem[]
  menuTitle?: string
  menuLead?: string
  address?: string
  mapsHref?: string
}

export default function QrMenuClient({
  categories,
  items,
  menuTitle,
  menuLead,
  address,
  mapsHref,
}: Props) {
  const sections = useMemo(() => {
    return categories
      .map(cat => ({
        cat,
        list: items.filter(i => i.category_id === cat.id),
      }))
      .filter(s => s.list.length > 0)
  }, [categories, items])

  const [activeId, setActiveId] = useState(sections[0]?.cat.id ?? '')

  const scrollToSection = useCallback((categoryId: string) => {
    document.getElementById(`qr-sec-${categoryId}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  useEffect(() => {
    if (sections.length === 0) return
    const nodes = sections
      .map(s => document.getElementById(`qr-sec-${s.cat.id}`))
      .filter((n): n is HTMLElement => Boolean(n))
    if (nodes.length === 0) return

    const io = new IntersectionObserver(
      entries => {
        const visible = entries
          .filter(e => e.isIntersecting && e.intersectionRatio >= 0.2)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        const id = visible?.target?.id?.replace(/^qr-sec-/, '')
        if (id) setActiveId(id)
      },
      { root: null, rootMargin: '-96px 0px -45% 0px', threshold: [0, 0.15, 0.35, 0.55] },
    )
    nodes.forEach(n => io.observe(n))
    return () => io.disconnect()
  }, [sections])

  if (sections.length === 0) {
    return (
      <main id="qr-menu-main" className="qr-menu-main">
        <div className="qr-menu-empty">
          <p>Menü şu an güncelleniyor.</p>
          <p className="qr-menu-empty-hint">Kısa süre içinde tekrar deneyin veya garsondan yardım alın.</p>
          <Link href="/" className="qr-menu-empty-link">
            Ana sayfaya dön
          </Link>
        </div>
      </main>
    )
  }

  return (
    <>
      <nav className="qr-menu-chips" aria-label="Menü kategorileri">
        <div className="qr-menu-chips-track">
          {sections.map(({ cat }) => (
            <button
              key={cat.id}
              type="button"
              className={`qr-menu-chip${activeId === cat.id ? ' active' : ''}`}
              onClick={() => {
                setActiveId(cat.id)
                scrollToSection(cat.id)
              }}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </nav>

      <main id="qr-menu-main" className="qr-menu-main">
        <div className="qr-menu-intro">
          <h1 className="qr-menu-h1">{menuTitle || 'Menümüz'}</h1>
          {menuLead && <p className="qr-menu-lead">{menuLead}</p>}
        </div>

        {sections.map(({ cat, list }) => (
          <section key={cat.id} id={`qr-sec-${cat.id}`} className="qr-menu-section" aria-labelledby={`qr-h-${cat.id}`}>
            <h2 id={`qr-h-${cat.id}`} className="qr-menu-cat">
              {cat.name}
            </h2>
            <ul className="qr-menu-list" role="list">
              {list.map(item => (
                <li key={item.id} className="qr-menu-item">
                  <span className="qr-menu-item-name">{item.name}</span>
                  <div className="qr-menu-item-bottom">
                    {item.is_featured ? <span className="qr-menu-item-badge">Öne çıkan</span> : null}
                    {item.price ? <span className="qr-menu-item-price">{item.price}</span> : null}
                  </div>
                  {item.description ? <p className="qr-menu-item-desc">{item.description}</p> : null}
                </li>
              ))}
            </ul>
          </section>
        ))}

        <footer className="qr-menu-foot">
          <p className="qr-menu-disclaimer">Fiyatlar ve porsiyon bilgisi garson teyidine tabidir.</p>
          {address && (
            <p className="qr-menu-address">
              {mapsHref ? (
                <a href={mapsHref} target="_blank" rel="noopener noreferrer">
                  {address}
                </a>
              ) : (
                address
              )}
            </p>
          )}
          <Link href="/" className="qr-menu-foot-link">
            tandirciusta.com
          </Link>
        </footer>
      </main>
    </>
  )
}
