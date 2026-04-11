import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import { supabase, getSettings } from '@/lib/supabase'
import type { BlogPost } from '@/lib/supabase'
import Link from 'next/link'

export const revalidate = 60

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const { data } = await supabase.from('blog_posts').select('title,excerpt').eq('slug', slug).single()
  if (!data) return { title: 'Yazı Bulunamadı' }
  return {
    title: data.title,
    description: data.excerpt,
    alternates: { canonical: `https://tandirciusta.com/blog/${slug}` },
    openGraph: { title: data.title, description: data.excerpt },
  }
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params
  const [s, { data: post }] = await Promise.all([
    getSettings(),
    supabase.from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .eq('published', true)
      .single(),
  ])

  if (!post) notFound()
  const p = post as BlogPost

  return (
    <>
      <Nav />
      <article>
        <div className="blog-post-hero">
          <div className="container" style={{ maxWidth: 820 }}>
            <Link href="/blog" className="back-link">← Blog&apos;a Dön</Link>
            <p className="eyebrow">{new Date(p.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            <h1 className="post-title">{p.title}</h1>
            {p.excerpt && <p style={{ fontSize: 18, color: 'var(--muted)', lineHeight: 1.7, maxWidth: 620 }}>{p.excerpt}</p>}
          </div>
        </div>

        <div className="container" style={{ maxWidth: 820, paddingBottom: 80 }}>
          {p.cover_image_url && (
            <img src={p.cover_image_url} alt={p.title} className="post-cover" />
          )}
          <div
            className="post-content"
            dangerouslySetInnerHTML={{ __html: p.content }}
          />
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
