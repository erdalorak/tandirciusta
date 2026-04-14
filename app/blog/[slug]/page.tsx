import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import { supabaseAdmin as supabase, getSettings } from '@/lib/supabase'
import type { BlogPost } from '@/lib/supabase'
import Link from 'next/link'
import ShareButtons from '@/components/ShareButtons'

export const revalidate = 60

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const { data } = await supabase
    .from('blog_posts')
    .select('title,excerpt,cover_image_url,created_at')
    .eq('slug', slug)
    .single()
  if (!data) return { title: 'Yazı Bulunamadı' }
  return {
    title: data.title,
    description: data.excerpt,
    alternates: { canonical: `https://tandirciusta.com/blog/${slug}` },
    openGraph: {
      type: 'article',
      title: data.title,
      description: data.excerpt,
      url: `https://tandirciusta.com/blog/${slug}`,
      siteName: 'Tandırcı Usta',
      locale: 'tr_TR',
      publishedTime: data.created_at,
      authors: ['Tandırcı Usta'],
      images: data.cover_image_url
        ? [{ url: data.cover_image_url, width: 1200, height: 630, alt: data.title }]
        : [{ url: '/og-image.jpg', width: 1200, height: 630, alt: data.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: data.title,
      description: data.excerpt,
      images: [data.cover_image_url || '/og-image.jpg'],
    },
  }
}

/** H2 etiketlerini çıkar, TOC verisi üret */
function extractTOC(html: string) {
  const matches = [...html.matchAll(/<h2[^>]*>(.*?)<\/h2>/gi)]
  return matches.map((m, i) => ({
    id: `bolum-${i + 1}`,
    text: m[1].replace(/<[^>]*>/g, '').trim(),
  }))
}

/** H2 etiketlerine sıralı id ekle */
function injectH2Ids(html: string) {
  let idx = 0
  return html.replace(/<h2([^>]*)>/gi, (_, attrs) => `<h2 id="bolum-${++idx}"${attrs}>`)
}

/** SSS bölümünden Q&A çıkar — FAQPage schema için */
function extractFAQ(html: string): { q: string; a: string }[] {
  const faqs: { q: string; a: string }[] = []
  // faq-item içindeki faq-q ve faq-a divlerini yakala
  const itemRegex = /<div[^>]*class="faq-item"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/gi
  const qRegex = /<div[^>]*class="faq-q"[^>]*>([\s\S]*?)<\/div>/i
  const aRegex = /<div[^>]*class="faq-a"[^>]*>([\s\S]*?)<\/div>/i

  // Daha güvenli: tüm faq-q ve faq-a çiftlerini sırayla eşleştir
  const questions = [...html.matchAll(/<div[^>]*class="faq-q"[^>]*>([\s\S]*?)<\/div>/gi)]
  const answers   = [...html.matchAll(/<div[^>]*class="faq-a"[^>]*>([\s\S]*?)<\/div>/gi)]

  const len = Math.min(questions.length, answers.length)
  for (let i = 0; i < len; i++) {
    const q = questions[i][1].replace(/<[^>]*>/g, '').trim()
    const a = answers[i][1].replace(/<[^>]*>/g, '').trim()
    if (q && a) faqs.push({ q, a })
  }

  void itemRegex; void qRegex; void aRegex // suppress unused warnings
  return faqs
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params
  const [s, { data: post }] = await Promise.all([
    getSettings(),
    supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .eq('published', true)
      .single(),
  ])

  if (!post) notFound()
  const p = post as BlogPost

  const toc = extractTOC(p.content)
  const contentWithIds = injectH2Ids(p.content)
  const faqs = extractFAQ(p.content)

  const postUrl = `https://tandirciusta.com/blog/${slug}`

  /* ── Article Schema ── */
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${postUrl}/#article`,
    headline: p.title,
    description: p.excerpt || '',
    image: p.cover_image_url
      ? [{ '@type': 'ImageObject', url: p.cover_image_url, width: 1200, height: 630 }]
      : ['https://tandirciusta.com/og-image.jpg'],
    datePublished: p.created_at,
    dateModified: p.created_at,
    inLanguage: 'tr-TR',
    author: {
      '@type': 'Organization',
      '@id': 'https://tandirciusta.com/#restaurant',
      name: 'Tandırcı Usta',
      url: 'https://tandirciusta.com',
    },
    publisher: {
      '@type': 'Organization',
      '@id': 'https://tandirciusta.com/#restaurant',
      name: 'Tandırcı Usta',
      logo: {
        '@type': 'ImageObject',
        url: 'https://tandirciusta.com/logo.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': postUrl,
    },
    isPartOf: {
      '@type': 'Blog',
      name: 'Tandırcı Usta Blog & Tarifler',
      url: 'https://tandirciusta.com/blog',
    },
  }

  /* ── BreadcrumbList Schema ── */
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Ana Sayfa', item: 'https://tandirciusta.com' },
      { '@type': 'ListItem', position: 2, name: 'Blog & Tarifler', item: 'https://tandirciusta.com/blog' },
      { '@type': 'ListItem', position: 3, name: p.title, item: postUrl },
    ],
  }

  /* ── FAQPage Schema (sadece SSS varsa) ── */
  const faqSchema = faqs.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  } : null

  return (
    <>
      <Nav />

      {/* JSON-LD Schema Blokları */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {faqSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      )}

      <article>
        <div className="blog-post-hero">
          <div className="container" style={{ maxWidth: 820 }}>

            {/* Görsel Breadcrumb */}
            <nav className="post-breadcrumb" aria-label="Breadcrumb">
              <Link href="/" className="post-breadcrumb-link">Ana Sayfa</Link>
              <span className="post-breadcrumb-sep">›</span>
              <Link href="/blog" className="post-breadcrumb-link">Blog & Tarifler</Link>
              <span className="post-breadcrumb-sep">›</span>
              <span className="post-breadcrumb-current">{p.title}</span>
            </nav>

            <p className="eyebrow" style={{ marginTop: 16 }}>
              {new Date(p.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
            <h1 className="post-title">{p.title}</h1>
            {p.excerpt && (
              <p style={{ fontSize: 18, color: 'var(--muted)', lineHeight: 1.7, maxWidth: 620 }}>{p.excerpt}</p>
            )}
          </div>
        </div>

        <div className="container" style={{ maxWidth: 820, paddingBottom: 80 }}>
          {p.cover_image_url && (
            <img src={p.cover_image_url} alt={p.title} className="post-cover" />
          )}

          {/* İçindekiler — en az 3 H2 varsa göster */}
          {toc.length >= 3 && (
            <nav className="post-toc" aria-label="İçindekiler">
              <div className="post-toc-title">📋 İçindekiler</div>
              <ol className="post-toc-list">
                {toc.map((item) => (
                  <li key={item.id}>
                    <a href={`#${item.id}`} className="post-toc-link">{item.text}</a>
                  </li>
                ))}
              </ol>
            </nav>
          )}

          <div
            className="post-content"
            dangerouslySetInnerHTML={{ __html: contentWithIds }}
          />

          <ShareButtons url={postUrl} title={p.title} />

          {/* Yazı sonu breadcrumb */}
          <div style={{ marginTop: 32, display: 'flex', gap: 12 }}>
            <Link href="/blog" className="btn btn-outline btn-sm">← Tüm Tarifler</Link>
            <Link href="/#rezervasyon" className="btn btn-red btn-sm">Rezervasyon Yap</Link>
          </div>
        </div>
      </article>

      <Footer
        phone={s.phone} address={s.address} instagram={s.instagram}
        whatsapp={s.whatsapp} hoursWeekday={s.hours_weekday}
        hoursSaturday={s.hours_saturday} hoursSunday={s.hours_sunday}
      />
    </>
  )
}
