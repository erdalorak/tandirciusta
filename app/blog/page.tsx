import type { Metadata } from 'next'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import { supabase, getSettings } from '@/lib/supabase'
import type { BlogPost } from '@/lib/supabase'
import Link from 'next/link'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Blog & Tarifler',
  description: 'Tandırcı Usta\'dan geleneksel Anadolu tarifleri, tandır pişirme ipuçları ve Kırşehir mutfağı üzerine yazılar.',
  alternates: { canonical: 'https://tandirciusta.com/blog' },
}

export default async function BlogPage() {
  const [s, { data: posts }] = await Promise.all([
    getSettings(),
    supabase.from('blog_posts')
      .select('id,title,slug,excerpt,cover_image_url,created_at')
      .eq('published', true)
      .order('created_at', { ascending: false }),
  ])

  const allPosts = (posts ?? []) as BlogPost[]

  return (
    <>
      <Nav />
      <div className="blog-page-hero">
        <div className="container">
          <p className="eyebrow">Blog & Tarifler</p>
          <h1 className="blog-page-title">Geleneksel <em>Tarifler</em></h1>
          <p style={{ color: 'var(--muted)', fontSize: 16, marginTop: 12, maxWidth: 520, lineHeight: 1.7 }}>
            Tandır pişirme sanatı, geleneksel Anadolu tarifleri ve mutfaktan ipuçları.
          </p>
        </div>
      </div>

      <section className="section">
        <div className="container">
          {allPosts.length === 0 ? (
            <div className="blog-empty" style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--muted)' }}>
              <p style={{ fontSize: 16, marginBottom: 8 }}>Henüz yazı yok.</p>
              <p style={{ fontSize: 13 }}>Admin panelinden ilk tarifinizi ekleyebilirsiniz.</p>
            </div>
          ) : (
            <div className="blog-grid">
              {allPosts.map(post => (
                <Link key={post.id} href={`/blog/${post.slug}`} className="blog-card">
                  <div className="blog-card-img">
                    {post.cover_image_url
                      ? <img src={post.cover_image_url} alt={post.title} loading="lazy" />
                      : <span className="blog-card-img-placeholder">Fotoğraf yok</span>
                    }
                  </div>
                  <div className="blog-card-body">
                    <div className="blog-card-meta">
                      {new Date(post.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                    <div className="blog-card-title">{post.title}</div>
                    <div className="blog-card-excerpt">{post.excerpt}</div>
                  </div>
                  <div className="blog-card-footer">
                    <span className="blog-read-more">Devamını Oku →</span>
                  </div>
                </Link>
              ))}
            </div>
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
