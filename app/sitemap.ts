import { MetadataRoute } from 'next'
import { supabase } from '@/lib/supabase'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = 'https://tandirciusta.com'

  const { data: posts } = await supabase
    .from('blog_posts')
    .select('slug, created_at, post_type')
    .eq('published', true)

  const postUrls = (posts ?? []).map(p => {
    const path = p.post_type === 'tarif' ? 'tarifler' : 'blog'
    return {
      url: `${base}/${path}/${p.slug}`,
      lastModified: new Date(p.created_at),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }
  })

  return [
    { url: base, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${base}/ilikya`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/lezzet-cografyasi`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.85 },
    { url: `${base}/menu`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.5 },
    { url: `${base}/tarifler`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.85 },
    { url: `${base}/blog`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    ...postUrls,
  ]
}
