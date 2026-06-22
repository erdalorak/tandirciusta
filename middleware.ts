/**
 * Middleware — Veritabanındaki 301 yönlendirmelerini uygular.
 * Önbellek: 60 saniye (edge instance başına).
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { normalizePath } from '@/lib/redirects'

type RedirectRow = {
  source_path: string
  destination_path: string
  status_code: number
}

const SETTINGS_KEY = 'url_redirects_json'

let cachedRedirects: Map<string, RedirectRow> | null = null
let cacheExpiresAt = 0
const CACHE_TTL_MS = 10_000

/** Supabase'den yönlendirme haritasını yükler */
async function getRedirectMap(): Promise<Map<string, RedirectRow>> {
  const now = Date.now()
  if (cachedRedirects && now < cacheExpiresAt) {
    return cachedRedirects
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  const map = new Map<string, RedirectRow>()
  if (!url || !key) return map

  const supabase = createClient(url, key)

  // Önce url_redirects tablosunu dene
  const { data: tableData, error: tableError } = await supabase
    .from('url_redirects')
    .select('source_path, destination_path, status_code')

  if (!tableError && tableData) {
    for (const row of tableData as RedirectRow[]) {
      map.set(normalizePath(row.source_path), row)
    }
  } else {
    // Tablo yoksa site_settings JSON yedek deposunu oku
    const { data: setting } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', SETTINGS_KEY)
      .maybeSingle()

    if (setting?.value) {
      try {
        const rows = JSON.parse(setting.value) as RedirectRow[]
        if (Array.isArray(rows)) {
          for (const row of rows) {
            map.set(normalizePath(row.source_path), row)
          }
        }
      } catch {
        /* bozuk JSON — yoksay */
      }
    }
  }

  cachedRedirects = map
  cacheExpiresAt = now + CACHE_TTL_MS
  return map
}

export async function middleware(request: NextRequest) {
  const pathname = normalizePath(decodeURIComponent(request.nextUrl.pathname))
  const redirectMap = await getRedirectMap()
  const match = redirectMap.get(pathname)

  if (match) {
    const destination = match.destination_path.startsWith('http')
      ? match.destination_path
      : new URL(match.destination_path, request.url)

    return NextResponse.redirect(destination, match.status_code || 301)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icon.ico|apple-icon.png|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
