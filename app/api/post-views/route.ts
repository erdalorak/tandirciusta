import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

function auth(req: NextRequest) {
  return req.headers.get('x-admin-key') === process.env.ADMIN_PASSWORD
}

// GET /api/post-views  →  { '/blog/slug': count, '/tarifler/slug': count, ... }
export async function GET(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  const { data, error } = await supabaseAdmin
    .from('page_views')
    .select('page')
    .or('page.ilike./blog/%,page.ilike./tarifler/%')

  if (error) return NextResponse.json({}, { status: 500 })

  const counts: Record<string, number> = {}
  for (const row of data ?? []) {
    counts[row.page] = (counts[row.page] ?? 0) + 1
  }

  return NextResponse.json(counts)
}
