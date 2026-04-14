import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

function auth(req: NextRequest) {
  return req.headers.get('x-admin-key') === process.env.ADMIN_PASSWORD
}

function getClientIP(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  const realIP = req.headers.get('x-real-ip')
  if (realIP) return realIP.trim()
  return 'unknown'
}

function isPrivateIP(ip: string): boolean {
  return (
    ip === 'unknown' ||
    ip === '::1' ||
    ip === '127.0.0.1' ||
    ip.startsWith('192.168.') ||
    ip.startsWith('10.') ||
    ip.startsWith('172.16.') ||
    ip.startsWith('::ffff:127.')
  )
}

async function geolocateIP(ip: string) {
  if (isPrivateIP(ip)) {
    return { country: 'Yerel', country_code: 'XX', city: 'Yerel Ağ', region: '', lat: 0, lon: 0 }
  }
  try {
    const res = await fetch(
      `http://ip-api.com/json/${ip}?fields=status,country,countryCode,regionName,city,lat,lon`,
      { signal: AbortSignal.timeout(3000) }
    )
    if (!res.ok) return null
    const data = await res.json()
    if (data.status === 'fail') return null
    return {
      country: data.country ?? null,
      country_code: data.countryCode ?? null,
      city: data.city ?? null,
      region: data.regionName ?? null,
      lat: data.lat ?? null,
      lon: data.lon ?? null,
    }
  } catch {
    return null
  }
}

// POST — ziyaret kaydet (public)
export async function POST(req: NextRequest) {
  const userAgent = req.headers.get('user-agent') || ''

  // Bot filtrele
  if (/bot|crawler|spider|crawling|slurp|baiduspider|googlebot|bingbot|yandex/i.test(userAgent)) {
    return NextResponse.json({ ok: true })
  }

  const ip = getClientIP(req)

  // Yönetici IP'lerini say
  const excludedIPs = (process.env.ANALYTICS_EXCLUDED_IPS || '').split(',').map(s => s.trim()).filter(Boolean)
  if (excludedIPs.includes(ip)) return NextResponse.json({ ok: true })

  const body = await req.json().catch(() => ({}))
  const { page = '/', referrer = '' } = body as { page?: string; referrer?: string }

  const geo = await geolocateIP(ip)

  const { error } = await supabaseAdmin.from('page_views').insert({
    ip,
    page: page.slice(0, 255),
    referrer: referrer.slice(0, 255),
    user_agent: userAgent.slice(0, 512),
    country: geo?.country ?? null,
    country_code: geo?.country_code ?? null,
    city: geo?.city ?? null,
    region: geo?.region ?? null,
    lat: geo?.lat ?? null,
    lon: geo?.lon ?? null,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

// GET — istatistikler (admin)
export async function GET(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  const url = new URL(req.url)
  const from = url.searchParams.get('from')
  const to   = url.searchParams.get('to')
  const days = Math.min(parseInt(url.searchParams.get('days') || '30'), 90)

  const since = from
    ? new Date(from + 'T00:00:00').toISOString()
    : new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
  const until = to
    ? new Date(to + 'T23:59:59').toISOString()
    : new Date().toISOString()

  const { data, error } = await supabaseAdmin
    .from('page_views')
    .select('*')
    .gte('created_at', since)
    .lte('created_at', until)
    .order('created_at', { ascending: false })
    .limit(2000)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
