import type { Metadata } from 'next'
import Link from 'next/link'
import QrMenuClient from '@/components/QrMenuClient'
import { supabaseAdmin as supabase, getSettings } from '@/lib/supabase'
import type { MenuCategory, MenuItem } from '@/lib/supabase'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Dijital Menü',
  description:
    'Tandırcı Usta Kırşehir — güncel menü, fiyatlar ve ürün açıklamaları. Telefondan hızlıca göz atın.',
  alternates: { canonical: 'https://tandirciusta.com/menu' },
  openGraph: {
    title: 'Dijital Menü | Tandırcı Usta Kırşehir',
    description: 'Güncel menü ve fiyatlar — Tandırcı Usta.',
    url: 'https://tandirciusta.com/menu',
    siteName: 'Tandırcı Usta',
    locale: 'tr_TR',
    type: 'website',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Tandırcı Usta Menü' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dijital Menü | Tandırcı Usta',
    description: 'Güncel menü ve fiyatlar.',
    images: ['/og-image.jpg'],
  },
  robots: { index: true, follow: true },
}

async function getMenuPageData() {
  const [settings, categoriesRes, itemsRes] = await Promise.all([
    getSettings(),
    supabase.from('menu_categories').select('*').order('display_order'),
    supabase.from('menu_items').select('*').eq('is_available', true).order('display_order'),
  ])
  return {
    settings,
    categories: (categoriesRes.data ?? []) as MenuCategory[],
    items: (itemsRes.data ?? []) as MenuItem[],
  }
}

export default async function DigitalMenuPage() {
  const { settings: s, categories, items } = await getMenuPageData()
  const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.address || 'Tandırcı Usta Kırşehir')}`

  return (
    <div className="qr-menu-page">
      <a href="#qr-menu-main" className="qr-menu-skip">
        Menü listesine geç
      </a>
      <header className="qr-menu-head" aria-label="Üst bilgi">
        <div className="qr-menu-head-inner">
          <Link href="/" className="qr-menu-brand">
            <img src="/logo.png" alt="Tandırcı Usta" width={44} height={44} decoding="async" />
            <div className="qr-menu-brand-text">
              <span className="qr-menu-brand-name">Tandırcı Usta</span>
              <span className="qr-menu-brand-sub">Dijital menü</span>
            </div>
          </Link>
          <div className="qr-menu-head-actions">
            {s.phone && (
              <a className="qr-menu-icon-btn" href={`tel:${s.phone.replace(/\s/g, '')}`} aria-label="Telefon ile ara">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.7 10.5 19.79 19.79 0 01.67 2.11 2 2 0 012.68 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.09 6.09l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14.92v2z" />
                </svg>
              </a>
            )}
            {s.whatsapp && (
              <a
                className="qr-menu-icon-btn qr-menu-icon-wa"
                href={`https://wa.me/${s.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </a>
            )}
            <Link href="/" className="qr-menu-home-link">
              Ana sayfa
            </Link>
          </div>
        </div>
      </header>

      <QrMenuClient
        categories={categories}
        items={items}
        menuTitle={s.menu_title}
        menuLead={s.menu_lead}
        address={s.address}
        mapsHref={mapsHref}
      />
    </div>
  )
}
