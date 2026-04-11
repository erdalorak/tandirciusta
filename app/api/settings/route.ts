import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

function auth(req: NextRequest) {
  return req.headers.get('x-admin-key') === process.env.ADMIN_PASSWORD
}

export async function GET() {
  const { data, error } = await supabaseAdmin.from('site_settings').select('key,value')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  const settings = Object.fromEntries((data ?? []).map((s: { key: string; value: string }) => [s.key, s.value]))
  return NextResponse.json(settings)
}

export async function POST(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
  const body = await req.json() as Record<string, string>
  const upserts = Object.entries(body).map(([key, value]) => ({ key, value }))
  const { error } = await supabaseAdmin
    .from('site_settings')
    .upsert(upserts, { onConflict: 'key' })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
