import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, slugify } from '@/lib/supabase'

function auth(req: NextRequest) {
  return req.headers.get('x-admin-key') === process.env.ADMIN_PASSWORD
}

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id')

  if (id) {
    const { data, error } = await supabaseAdmin
      .from('blog_posts')
      .select('*')
      .eq('id', id)
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  }

  const { data, error } = await supabaseAdmin
    .from('blog_posts')
    .select('id,title,slug,published,created_at,excerpt,post_type')
    .order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
  const body = await req.json()
  const slug = body.slug || slugify(body.title)
  // Strip optional SEO fields if empty — prevents schema errors before migration
  const insertBody: Record<string, unknown> = { ...body, slug }
  if (!insertBody.meta_title) delete insertBody.meta_title
  if (!insertBody.meta_description) delete insertBody.meta_description
  const { data, error } = await supabaseAdmin
    .from('blog_posts')
    .insert(insertBody)
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
