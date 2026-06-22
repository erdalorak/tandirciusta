import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET /api/reactions?postId=xxx  → { likes: n, dislikes: n }
export async function GET(req: NextRequest) {
  const postId = req.nextUrl.searchParams.get('postId')
  if (!postId) return NextResponse.json({ likes: 0, dislikes: 0 })

  const { data } = await supabaseAdmin
    .from('site_settings')
    .select('key,value')
    .in('key', [`likes_${postId}`, `dislikes_${postId}`])

  const row = (data ?? []).reduce((acc: Record<string, number>, r) => {
    acc[r.key] = parseInt(r.value) || 0
    return acc
  }, {})

  return NextResponse.json({
    likes: row[`likes_${postId}`] ?? 0,
    dislikes: row[`dislikes_${postId}`] ?? 0,
  })
}

// POST /api/reactions  body: { postId, type: 'like'|'dislike' }
export async function POST(req: NextRequest) {
  const { postId, type } = await req.json()
  if (!postId || !['like', 'dislike'].includes(type)) {
    return NextResponse.json({ error: 'Geçersiz istek' }, { status: 400 })
  }

  const key = type === 'like' ? `likes_${postId}` : `dislikes_${postId}`

  // Mevcut değeri oku
  const { data } = await supabaseAdmin
    .from('site_settings')
    .select('value')
    .eq('key', key)
    .maybeSingle()

  const current = parseInt(data?.value ?? '0') || 0
  const next = current + 1

  await supabaseAdmin
    .from('site_settings')
    .upsert({ key, value: String(next) })

  return NextResponse.json({ [type === 'like' ? 'likes' : 'dislikes']: next })
}
