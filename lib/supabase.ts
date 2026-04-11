import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const service = process.env.SUPABASE_SERVICE_ROLE_KEY!

export const supabase = createClient(url, anon)
export const supabaseAdmin = createClient(url, service)

export type SiteSetting = { key: string; value: string }
export type MenuCategory = { id: string; name: string; display_order: number }
export type MenuItem = {
  id: string; category_id: string; name: string
  description: string; price: string
  is_available: boolean; is_featured: boolean; display_order: number
}
export type BlogPost = {
  id: string; title: string; slug: string
  content: string; excerpt: string
  cover_image_url: string; published: boolean; created_at: string
}
export type GalleryImage = {
  id: string; url: string; caption: string; display_order: number
}

export async function getSettings(): Promise<Record<string, string>> {
  const { data } = await supabaseAdmin.from('site_settings').select('key,value')
  if (!data) return {}
  return Object.fromEntries(data.map((s: SiteSetting) => [s.key, s.value]))
}

export function slugify(text: string): string {
  return text.toLowerCase()
    .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
    .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
    .replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim()
}
