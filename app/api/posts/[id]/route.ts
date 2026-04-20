import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

function auth(req: NextRequest) {
  return req.headers.get('x-admin-key') === process.env.ADMIN_PASSWORD
}

type Props = { params: Promise<{ id: string }> }

export async function PUT(req: NextRequest, { params }: Props) {
  if (!auth(req)) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
  const { id } = await params
  const body = await req.json()
  // Strip optional SEO fields if empty — prevents schema errors before migration
  const updateBody: Record<string, unknown> = { ...body }
  if (updateBody.meta_title === '') delete updateBody.meta_title
  if (updateBody.meta_description === '') delete updateBody.meta_description
  const { data, error } = await supabaseAdmin.from('blog_posts').update(updateBody).eq('id', id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(req: NextRequest, { params }: Props) {
  if (!auth(req)) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
  const { id } = await params
  const { error } = await supabaseAdmin.from('blog_posts').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
