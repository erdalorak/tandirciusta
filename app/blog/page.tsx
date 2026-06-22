import type { Metadata } from 'next'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import BlogSearch from '@/components/BlogSearch'
import { supabaseAdmin as supabase, getSettings } from '@/lib/supabase'
import type { BlogPost } from '@/lib/supabase'
import Link from 'next/link'

export const revalidate = 0

export const metadata: Metadata = {
  title: 'Blog | Tandırcı Usta Kırşehir',
  description:
    'Tandırcı Usta’dan haberler, mutfak kültürü, Kırşehir ve Anadolu mutfağı üzerine yazılar.',
  alternates: { canonical: 'https://tandirciusta.com/blog' },
  openGraph: {
    title: 'Blog | Tandırcı Usta',
    description: 'Restoran haberleri, mutfak kültürü ve Anadolu mutfağı yazıları.',
    url: 'https://tandirciusta.com/blog',
    siteName: 'Tandırcı Usta',
    locale: 'tr_TR',
    type: 'website',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Tandırcı Usta Blog' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog | Tandırcı Usta',
    description: 'Restoran haberleri ve mutfak yazıları.',
    images: ['/og-image.jpg'],
  },
}

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Ana Sayfa', item: 'https://tandirciusta.com' },
    { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://tandirciusta.com/blog' },
  ],
}

const collectionSchema = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Blog | Tandırcı Usta',
  description: 'Tandırcı Usta blog yazıları.',
  url: 'https://tandirciusta.com/blog',
  inLanguage: 'tr-TR',
  isPartOf: { '@id': 'https://tandirciusta.com/#website' },
}

export default async function BlogPage() {
  const [s, { data: posts }] = await Promise.all([
    getSettings(),
    supabase
      .from('blog_posts')
      .select('id,title,slug,excerpt,cover_image_url,created_at')
      .eq('published', true)
      .or('post_type.eq.blog,post_type.is.null')
      .order('created_at', { ascending: false }),
  ])

  const blogPosts = (posts ?? []) as BlogPost[]

  return (
    <>
      <Nav />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }} />

      <div className="blog-page-hero">
        <div className="container">
          <nav className="post-breadcrumb" aria-label="Breadcrumb">
            <Link href="/" className="post-breadcrumb-link">Ana Sayfa</Link>
            <span className="post-breadcrumb-sep">›</span>
            <span className="post-breadcrumb-current">Blog</span>
          </nav>
          <p className="eyebrow" style={{ marginTop: 16 }}>Tandırcı Usta</p>
          <h1 className="blog-page-title">Bizden <em>Haberler</em></h1>
          <p style={{ color: 'var(--muted)', fontSize: 16, marginTop: 12, maxWidth: 520, lineHeight: 1.7 }}>
            Restoran kültürü, Kırşehir mutfağı ve ustadan notlar.
          </p>
          <Link href="/tarifler" className="btn btn-outline btn-sm" style={{ display: 'inline-block', marginTop: 18 }}>
            Tariflere git →
          </Link>
        </div>
      </div>

      <section className="section">
        <div className="container">
          {blogPosts.length === 0 ? (
            <div className="blog-empty" style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--muted)' }}>
              <p style={{ fontSize: 16, marginBottom: 8 }}>Henüz blog yazısı yok.</p>
              <p style={{ fontSize: 13 }}>Tarifler için <Link href="/tarifler">Tarifler</Link> sayfasına bakın.</p>
            </div>
          ) : (
            <BlogSearch posts={blogPosts} hrefBase="/blog" searchPlaceholder="Başlık veya konu ara…" />
          )}
        </div>
      </section>

      <Footer
        phone={s.phone} address={s.address} instagram={s.instagram}
        whatsapp={s.whatsapp} hoursWeekday={s.hours_weekday}
        hoursSaturday={s.hours_saturday} hoursSunday={s.hours_sunday}
      />
    </>
  )
}
