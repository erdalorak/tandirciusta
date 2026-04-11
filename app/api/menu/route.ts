import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

function auth(req: NextRequest) {
  return req.headers.get('x-admin-key') === process.env.ADMIN_PASSWORD
}

export async function GET() {
  const [catRes, itemRes] = await Promise.all([
    supabaseAdmin.from('menu_categories').select('*').order('display_order'),
    supabaseAdmin.from('menu_items').select('*').order('display_order'),
  ])
  return NextResponse.json({
    categories: catRes.data ?? [],
    items: itemRes.data ?? [],
  })
}

export async function POST(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
  const body = await req.json()
  const table = body.type === 'category' ? 'menu_categories' : 'menu_items'
  const payload = { ...body }
  delete payload.type
  const { data, error } = await supabaseAdmin.from(table).insert(payload).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
