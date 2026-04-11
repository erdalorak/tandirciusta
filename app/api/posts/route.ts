import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, slugify } from '@/lib/supabase'

function auth(req: NextRequest) {
  return req.headers.get('x-admin-key') === process.env.ADMIN_PASSWORD
}

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('blog_posts')
    .select('id,title,slug,published,created_at,excerpt')
    .order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
  const body = await req.json()
  const slug = body.slug || slugify(body.title)
  const { data, error } = await supabaseAdmin
    .from('blog_posts')
    .insert({ ...body, slug })
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
