import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import { supabaseAdmin as supabase, getSettings } from '@/lib/supabase'
import type { BlogPost } from '@/lib/supabase'
import Link from 'next/link'
import ShareButtons from '@/components/ShareButtons'
import LikeButtons from '@/components/LikeButtons'

export const revalidate = 60

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const { data } = await supabase
    .from('blog_posts')
    .select('title,excerpt,cover_image_url,created_at,meta_title,meta_description,post_type')
    .eq('slug', slug)
    .single()
  if (!data) return { title: 'Yazı Bulunamadı' }
  if (data.post_type === 'tarif') permanentRedirect(`/tarifler/${slug}`)
  const metaTitle = data.meta_title || data.title
  const metaDesc  = data.meta_description || data.excerpt
  return {
    title: metaTitle,
    description: metaDesc,
    alternates: { canonical: `https://tandirciusta.com/blog/${slug}` },
    openGraph: {
      type: 'article',
      title: metaTitle,
      description: metaDesc,
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
      title: metaTitle,
      description: metaDesc,
      images: [data.cover_image_url || '/og-image.jpg'],
    },
  }
}

function extractTOC(html: string) {
  const matches = [...html.matchAll(/<h2[^>]*>(.*?)<\/h2>/gi)]
  return matches.map((m, i) => ({ id: `bolum-${i + 1}`, text: m[1].replace(/<[^>]*>/g, '').trim() }))
}
function injectH2Ids(html: string) {
  let idx = 0
  return html.replace(/<h2([^>]*)>/gi, (_, attrs) => `<h2 id="bolum-${++idx}"${attrs}>`)
}
function extractFAQ(html: string): { q: string; a: string }[] {
  const questions = [...html.matchAll(/<div[^>]*class="faq-q"[^>]*>([\s\S]*?)<\/div>/gi)]
  const answers   = [...html.matchAll(/<div[^>]*class="faq-a"[^>]*>([\s\S]*?)<\/div>/gi)]
  const len = Math.min(questions.length, answers.length)
  const faqs: { q: string; a: string }[] = []
  for (let i = 0; i < len; i++) {
    const q = questions[i][1].replace(/<[^>]*>/g, '').trim()
    const a = answers[i][1].replace(/<[^>]*>/g, '').trim()
    if (q && a) faqs.push({ q, a })
  }
  return faqs
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params
  const [s, { data: post }, { data: relatedRaw }] = await Promise.all([
    getSettings(),
    supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .eq('published', true)
      .single(),
    supabase
      .from('blog_posts')
      .select('id,title,slug,excerpt,cover_image_url,created_at,post_type')
      .eq('published', true)
      .neq('slug', slug)
      .or('post_type.eq.blog,post_type.is.null')
      .order('created_at', { ascending: false })
      .limit(3),
  ])
  const relatedPosts = (relatedRaw ?? []) as BlogPost[]

  if (!post) notFound()
  const p = post as BlogPost
  if (p.post_type === 'tarif') permanentRedirect(`/tarifler/${slug}`)

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
    author: { '@type': 'Organization', '@id': 'https://tandirciusta.com/#restaurant', name: 'Tandırcı Usta', url: 'https://tandirciusta.com' },
    publisher: { '@type': 'Organization', '@id': 'https://tandirciusta.com/#restaurant', name: 'Tandırcı Usta', logo: { '@type': 'ImageObject', url: 'https://tandirciusta.com/logo.png' } },
    mainEntityOfPage: { '@type': 'WebPage', '@id': postUrl },
    isPartOf: { '@type': 'Blog', name: 'Tandırcı Usta Blog', url: 'https://tandirciusta.com/blog' },
  }

  /* ── Breadcrumb Schema ── */
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Ana Sayfa', item: 'https://tandirciusta.com' },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://tandirciusta.com/blog' },
      { '@type': 'ListItem', position: 3, name: p.title, item: postUrl },
    ],
  }

  const faqSchema = faqs.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(({ q, a }) => ({
      '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  } : null

  return (
    <>
      <Nav />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {faqSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />}

      <article>
        <div className="blog-post-hero">
          <div className="container" style={{ maxWidth: 820 }}>
            <nav className="post-breadcrumb" aria-label="Breadcrumb">
              <Link href="/" className="post-breadcrumb-link">Ana Sayfa</Link>
              <span className="post-breadcrumb-sep">›</span>
              <Link href="/blog" className="post-breadcrumb-link">Blog</Link>
              <span className="post-breadcrumb-sep">›</span>
              <span className="post-breadcrumb-current">{p.title}</span>
            </nav>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 16 }}>
              <p className="eyebrow" style={{ margin: 0 }}>
                {new Date(p.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>

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

          {/* İçindekiler */}
          {toc.length >= 3 && (
            <nav className="post-toc" aria-label="İçindekiler">
              <div className="post-toc-title">📋 İçindekiler</div>
              <ol className="post-toc-list">
                {toc.map(item => (
                  <li key={item.id}><a href={`#${item.id}`} className="post-toc-link">{item.text}</a></li>
                ))}
              </ol>
            </nav>
          )}

          {/* TipTap HTML içeriği */}
          {p.content && p.content !== '<p></p>' && (
            <div className="post-content" dangerouslySetInnerHTML={{ __html: contentWithIds }} />
          )}

          <LikeButtons postId={p.id} title={p.title} url={postUrl} />

          <ShareButtons url={postUrl} title={p.title} />

          <div style={{ marginTop: 32, display: 'flex', gap: 12 }}>
            <Link href="/blog" className="btn btn-outline btn-sm">← Tüm yazılar</Link>
            <Link href="/tarifler" className="btn btn-outline btn-sm">Tarifler</Link>
            <Link href="/#rezervasyon" className="btn btn-red btn-sm">Rezervasyon Yap</Link>
          </div>

          {/* ── İlgili Yazılar ── */}
          {relatedPosts.length > 0 && (
            <div style={{ marginTop: 64, paddingTop: 40, borderTop: '1px solid #e8e0d5' }}>
              <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 22, fontWeight: 700, marginBottom: 24, color: '#1a1a1a' }}>
                Diğer yazılar
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 20 }}>
                {relatedPosts.map(rp => (
                  <Link key={rp.id} href={`/blog/${rp.slug}`} style={{ textDecoration: 'none', display: 'block', background: '#faf9f7', border: '1.5px solid #e8e0d5', borderRadius: 12, overflow: 'hidden' }}>
                    {rp.cover_image_url && (
                      <img src={rp.cover_image_url} alt={`${rp.title} tarifi – Tandırcı Usta Kırşehir`} loading="lazy" style={{ width: '100%', height: 140, objectFit: 'cover', display: 'block' }} />
                    )}
                    <div style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: '#1a1a1a', marginBottom: 6, lineHeight: 1.4 }}>{rp.title}</div>
                      {rp.excerpt && <div style={{ fontSize: 12, color: '#888', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{rp.excerpt}</div>}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
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
