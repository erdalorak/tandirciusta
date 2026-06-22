/**
 * 301 yönlendirme kayıtları — Supabase site_settings (JSON) veya url_redirects tablosu.
 * Supabase client parametreli sorgular kullanır (SQL injection koruması).
 *
 * Öncelik: url_redirects tablosu varsa onu kullanır.
 * Tablo yoksa site_settings içindeki url_redirects_json anahtarını kullanır.
 */

import { supabaseAdmin } from '@/lib/supabase'
import type { UrlRedirect } from '@/lib/redirects'

const SETTINGS_KEY = 'url_redirects_json'

let useDedicatedTable: boolean | null = null

/** url_redirects tablosunun mevcut olup olmadığını bir kez kontrol eder */
async function hasDedicatedTable(): Promise<boolean> {
  if (useDedicatedTable !== null) return useDedicatedTable
  const { error } = await supabaseAdmin.from('url_redirects').select('id').limit(1)
  useDedicatedTable = !error
  return useDedicatedTable
}

/** site_settings JSON deposundan yönlendirmeleri okur */
async function loadFromSettings(): Promise<UrlRedirect[]> {
  const { data, error } = await supabaseAdmin
    .from('site_settings')
    .select('value')
    .eq('key', SETTINGS_KEY)
    .maybeSingle()

  if (error || !data?.value) return []
  try {
    const parsed = JSON.parse(data.value) as UrlRedirect[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

/** site_settings JSON deposuna yönlendirmeleri yazar */
async function saveToSettings(rows: UrlRedirect[]): Promise<{ error: string | null }> {
  const { error } = await supabaseAdmin
    .from('site_settings')
    .upsert({ key: SETTINGS_KEY, value: JSON.stringify(rows) }, { onConflict: 'key' })
  if (error) return { error: error.message }
  return { error: null }
}

/** Tüm yönlendirmeleri en yeniden eskiye sıralı getirir */
export async function listRedirects(): Promise<{ data: UrlRedirect[] | null; error: string | null }> {
  if (await hasDedicatedTable()) {
    const { data, error } = await supabaseAdmin
      .from('url_redirects')
      .select('id, source_path, destination_path, status_code, created_at')
      .order('created_at', { ascending: false })
    if (error) return { data: null, error: error.message }
    return { data: (data ?? []) as UrlRedirect[], error: null }
  }

  const rows = await loadFromSettings()
  rows.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  return { data: rows, error: null }
}

/** Middleware için hafif lookup listesi */
export async function listRedirectsForMiddleware(): Promise<
  { source_path: string; destination_path: string; status_code: number }[]
> {
  const { data } = await listRedirects()
  if (!data) return []
  return data.map(({ source_path, destination_path, status_code }) => ({
    source_path,
    destination_path,
    status_code,
  }))
}

/** Yeni 301 yönlendirmesi ekler */
export async function createRedirect(
  source_path: string,
  destination_path: string,
  status_code = 301,
): Promise<{ data: UrlRedirect | null; error: string | null }> {
  if (await hasDedicatedTable()) {
    const { data, error } = await supabaseAdmin
      .from('url_redirects')
      .insert({ source_path, destination_path, status_code })
      .select('id, source_path, destination_path, status_code, created_at')
      .single()

    if (error) {
      if (error.code === '23505') {
        return { data: null, error: 'Bu Eski URL için zaten bir yönlendirme tanımlı.' }
      }
      return { data: null, error: error.message }
    }
    return { data: data as UrlRedirect, error: null }
  }

  const rows = await loadFromSettings()
  if (rows.some((r) => r.source_path === source_path)) {
    return { data: null, error: 'Bu Eski URL için zaten bir yönlendirme tanımlı.' }
  }

  const row: UrlRedirect = {
    id: crypto.randomUUID(),
    source_path,
    destination_path,
    status_code,
    created_at: new Date().toISOString(),
  }
  rows.push(row)
  const { error } = await saveToSettings(rows)
  if (error) return { data: null, error }
  return { data: row, error: null }
}

/** Yönlendirmeyi siler */
export async function deleteRedirect(id: string): Promise<{ error: string | null }> {
  if (await hasDedicatedTable()) {
    const { error } = await supabaseAdmin.from('url_redirects').delete().eq('id', id)
    if (error) return { error: error.message }
    return { error: null }
  }

  const rows = await loadFromSettings()
  const next = rows.filter((r) => r.id !== id)
  if (next.length === rows.length) {
    return { error: 'Yönlendirme bulunamadı.' }
  }
  return saveToSettings(next)
}
