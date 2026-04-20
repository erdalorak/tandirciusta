import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import { supabaseAdmin as supabase, getSettings } from '@/lib/supabase'
import type { BlogPost, RecipeData } from '@/lib/supabase'
import Link from 'next/link'
import ShareButtons from '@/components/ShareButtons'

export const revalidate = 60

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const { data } = await supabase
    .from('blog_posts')
    .select('title,excerpt,cover_image_url,created_at,meta_title,meta_description')
    .eq('slug', slug)
    .single()
  if (!data) return { title: 'Yazı Bulunamadı' }
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

function RecipeCard({ r }: { r: RecipeData }) {
  const diffColor = r.difficulty === 'Kolay' ? '#16a34a' : r.difficulty === 'Zor' ? '#dc2626' : '#d97706'
  const diffBg    = r.difficulty === 'Kolay' ? 'rgba(22,163,74,0.08)' : r.difficulty === 'Zor' ? 'rgba(220,38,38,0.08)' : 'rgba(217,119,6,0.08)'

  return (
    <div className="recipe-card">
      {/* Meta bar */}
      {(r.prep_time || r.cook_time || r.servings || r.difficulty) && (
        <div className="recipe-meta-bar">
          {r.prep_time && (
            <div className="recipe-meta-item">
              <span className="recipe-meta-icon">⏱</span>
              <div>
                <div className="recipe-meta-label">Hazırlık</div>
                <div className="recipe-meta-value">{r.prep_time}</div>
              </div>
            </div>
          )}
          {r.cook_time && (
            <div className="recipe-meta-item">
              <span className="recipe-meta-icon">🔥</span>
              <div>
                <div className="recipe-meta-label">Pişirme</div>
                <div className="recipe-meta-value">{r.cook_time}</div>
              </div>
            </div>
          )}
          {r.servings && (
            <div className="recipe-meta-item">
              <span className="recipe-meta-icon">👥</span>
              <div>
                <div className="recipe-meta-label">Porsiyon</div>
                <div className="recipe-meta-value">{r.servings}</div>
              </div>
            </div>
          )}
          {r.difficulty && (
            <div className="recipe-meta-item">
              <span className="recipe-meta-icon">📊</span>
              <div>
                <div className="recipe-meta-label">Zorluk</div>
                <div className="recipe-meta-value" style={{ color: diffColor, background: diffBg, padding: '1px 8px', borderRadius: 20, fontSize: 12, fontWeight: 700, display: 'inline-block' }}>{r.difficulty}</div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="recipe-body">
        {/* Malzemeler */}
        {r.ingredients?.filter(i => i.trim()).length > 0 && (
          <div className="recipe-block">
            <div className="recipe-block-title">
              <span>🥩</span> Malzemeler
            </div>
            <ul className="recipe-ingredients">
              {r.ingredients.filter(i => i.trim()).map((ing, idx) => (
                <li key={idx} className="recipe-ingredient-item">
                  <span className="recipe-ingredient-dot" />
                  {ing}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Yapılış Adımları */}
        {r.steps?.filter(s => s.trim()).length > 0 && (
          <div className="recipe-block">
            <div className="recipe-block-title">
              <span>👨‍🍳</span> Yapılış
            </div>
            <ol className="recipe-steps">
              {r.steps.filter(s => s.trim()).map((step, idx) => (
                <li key={idx} className="recipe-step">
                  <span className="recipe-step-num">{idx + 1}</span>
                  <p className="recipe-step-text">{step}</p>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Püf Noktaları */}
        {r.tips?.trim() && (
          <div className="recipe-tips">
            <div className="recipe-tips-title">💡 Püf Noktaları</div>
            <p className="recipe-tips-text">{r.tips}</p>
          </div>
        )}
      </div>
    </div>
  )
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
      .select('id,title,slug,excerpt,cover_image_url,created_at')
      .eq('published', true)
      .neq('slug', slug)
      .order('created_at', { ascending: false })
      .limit(3),
  ])
  const relatedPosts = (relatedRaw ?? []) as BlogPost[]

  if (!post) notFound()
  const p = post as BlogPost
  const isRecipe = p.post_type === 'tarif'
  const recipe = p.recipe_data as RecipeData | null

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
    isPartOf: { '@type': 'Blog', name: 'Tandırcı Usta Blog & Tarifler', url: 'https://tandirciusta.com/blog' },
  }

  /* ── Recipe Schema (tarif yazılarında) ── */
  const recipeSchema = isRecipe && recipe ? {
    '@context': 'https://schema.org',
    '@type': 'Recipe',
    name: p.title,
    description: p.excerpt || '',
    image: p.cover_image_url ? [p.cover_image_url] : [],
    author: { '@type': 'Organization', name: 'Tandırcı Usta', url: 'https://tandirciusta.com' },
    datePublished: p.created_at,
    prepTime: recipe.prep_time ? `PT${recipe.prep_time.replace(/[^0-9]/g, '')}M` : undefined,
    cookTime: recipe.cook_time ? `PT${recipe.cook_time.replace(/[^0-9]/g, '')}M` : undefined,
    recipeYield: recipe.servings || undefined,
    recipeCuisine: 'Türk Mutfağı',
    recipeCategory: 'Ana Yemek',
    recipeIngredient: recipe.ingredients?.filter(i => i.trim()) || [],
    recipeInstructions: recipe.steps?.filter(s => s.trim()).map((step, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      text: step,
    })) || [],
  } : null

  /* ── Breadcrumb Schema ── */
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Ana Sayfa', item: 'https://tandirciusta.com' },
      { '@type': 'ListItem', position: 2, name: 'Blog & Tarifler', item: 'https://tandirciusta.com/blog' },
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
      {recipeSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(recipeSchema) }} />}
      {faqSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />}

      <article>
        <div className="blog-post-hero">
          <div className="container" style={{ maxWidth: 820 }}>
            <nav className="post-breadcrumb" aria-label="Breadcrumb">
              <Link href="/" className="post-breadcrumb-link">Ana Sayfa</Link>
              <span className="post-breadcrumb-sep">›</span>
              <Link href="/blog" className="post-breadcrumb-link">Blog & Tarifler</Link>
              <span className="post-breadcrumb-sep">›</span>
              <span className="post-breadcrumb-current">{p.title}</span>
            </nav>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 16 }}>
              <p className="eyebrow" style={{ margin: 0 }}>
                {new Date(p.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
              {isRecipe && (
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', background: 'rgba(245,158,11,0.12)', color: '#d97706', border: '1px solid rgba(245,158,11,0.3)', padding: '3px 10px', borderRadius: 20 }}>
                  🍽️ Yemek Tarifi
                </span>
              )}
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

          {/* Tarif Kartı */}
          {isRecipe && recipe && <RecipeCard r={recipe} />}

          {/* İçindekiler */}
          {!isRecipe && toc.length >= 3 && (
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

          <ShareButtons url={postUrl} title={p.title} />

          <div style={{ marginTop: 32, display: 'flex', gap: 12 }}>
            <Link href="/blog" className="btn btn-outline btn-sm">← Tüm Tarifler</Link>
            <Link href="/#rezervasyon" className="btn btn-red btn-sm">Rezervasyon Yap</Link>
          </div>

          {/* ── İlgili Yazılar ── */}
          {relatedPosts.length > 0 && (
            <div style={{ marginTop: 64, paddingTop: 40, borderTop: '1px solid #e8e0d5' }}>
              <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 22, fontWeight: 700, marginBottom: 24, color: '#1a1a1a' }}>
                Diğer Tarifler
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
