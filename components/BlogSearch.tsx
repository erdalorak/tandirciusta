'use client'
import { useState, useMemo } from 'react'
import Link from 'next/link'
import type { BlogPost } from '@/lib/supabase'

type BlogSearchProps = { posts: BlogPost[]; hrefBase?: string; searchPlaceholder?: string }

export default function BlogSearch({ posts, hrefBase = '/blog', searchPlaceholder = 'Ara…' }: BlogSearchProps) {
  const [q, setQ] = useState('')

  const filtered = useMemo(() => {
    const term = q.trim().toLocaleLowerCase('tr')
    if (!term) return posts
    return posts.filter(p =>
      p.title.toLocaleLowerCase('tr').includes(term) ||
      (p.excerpt || '').toLocaleLowerCase('tr').includes(term)
    )
  }, [posts, q])

  return (
    <>
      <div style={{ maxWidth: 520, margin: '0 auto 32px', position: 'relative' }}>
        <input
          type="search"
          placeholder={searchPlaceholder}
          value={q}
          onChange={e => setQ(e.target.value)}
          aria-label="Tarif ara"
          style={{
            width: '100%',
            padding: '14px 18px 14px 46px',
            border: '1px solid var(--border)',
            borderRadius: 10,
            fontSize: 15,
            background: '#fff',
            outline: 'none',
            boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
          }}
        />
        <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', fontSize: 18, color: 'var(--muted)', pointerEvents: 'none' }}>🔍</span>
        {q && (
          <div style={{ marginTop: 8, fontSize: 13, color: 'var(--muted)', textAlign: 'center' }}>
            {filtered.length} sonuç bulundu
          </div>
        )}
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--muted)' }}>
          <p style={{ fontSize: 16, marginBottom: 8 }}>&quot;{q}&quot; için sonuç bulunamadı.</p>
          <p style={{ fontSize: 13 }}>Farklı bir arama terimi deneyin.</p>
        </div>
      ) : (
        <div className="blog-grid">
          {filtered.map(post => (
            <Link key={post.id} href={`${hrefBase}/${post.slug}`} className="blog-card">
              <div className="blog-card-img">
                {post.cover_image_url
                  ? <img src={post.cover_image_url} alt={`${post.title} - Tandırcı Usta Kırşehir`} loading="lazy" />
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
    </>
  )
}
