import { NextRequest, NextResponse } from 'next/server'
import { validateRedirectPair } from '@/lib/redirects'
import { createRedirect, deleteRedirect, listRedirects } from '@/lib/redirects-db'

/** Admin isteklerinde x-admin-key doğrulaması */
function isAdmin(req: NextRequest): boolean {
  return req.headers.get('x-admin-key') === process.env.ADMIN_PASSWORD
}

/**
 * GET — Tüm yönlendirmeleri listele (admin)
 */
export async function GET(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
  }

  const { data, error } = await listRedirects()
  if (error) {
    return NextResponse.json({ error }, { status: 500 })
  }
  return NextResponse.json(data)
}

/**
 * POST — Yeni 301 yönlendirmesi ekle (admin)
 * Body: { source_url: string, destination_url: string }
 */
export async function POST(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
  }

  let body: { source_url?: string; destination_url?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Geçersiz JSON gövdesi.' }, { status: 400 })
  }

  const sourceUrl = body.source_url ?? ''
  const destinationUrl = body.destination_url ?? ''

  const validated = validateRedirectPair(sourceUrl, destinationUrl)
  if ('error' in validated) {
    return NextResponse.json({ error: validated.error }, { status: 400 })
  }

  const { data, error } = await createRedirect(validated.source, validated.destination, 301)
  if (error) {
    const status = error.includes('zaten') ? 409 : 500
    return NextResponse.json({ error }, { status })
  }

  return NextResponse.json(data, { status: 201 })
}

/**
 * DELETE — Yönlendirmeyi kaldır (admin)
 * Body: { id: string }
 */
export async function DELETE(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
  }

  let body: { id?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Geçersiz JSON gövdesi.' }, { status: 400 })
  }

  if (!body.id) {
    return NextResponse.json({ error: 'Silinecek yönlendirme ID\'si gerekli.' }, { status: 400 })
  }

  const { error } = await deleteRedirect(body.id)
  if (error) {
    return NextResponse.json({ error }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
