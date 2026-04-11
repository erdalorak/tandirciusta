import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import MenuClient from '@/components/MenuClient'
import ScrollReveal from '@/components/ScrollReveal'
import { supabase, getSettings } from '@/lib/supabase'
import type { MenuCategory, MenuItem, BlogPost, GalleryImage } from '@/lib/supabase'
import Link from 'next/link'

export const revalidate = 60

async function getData() {
  const [settings, categoriesRes, itemsRes, postsRes, galleryRes] = await Promise.all([
    getSettings(),
    supabase.from('menu_categories').select('*').order('display_order'),
    supabase.from('menu_items').select('*').eq('is_available', true).order('display_order'),
    supabase.from('blog_posts').select('id,title,slug,excerpt,cover_image_url,created_at').eq('published', true).order('created_at', { ascending: false }).limit(3),
    supabase.from('gallery_images').select('*').order('display_order').limit(6),
  ])
  return {
    settings,
    categories: (categoriesRes.data ?? []) as MenuCategory[],
    items: (itemsRes.data ?? []) as MenuItem[],
    posts: (postsRes.data ?? []) as BlogPost[],
    gallery: (galleryRes.data ?? []) as GalleryImage[],
  }
}

export default async function Home() {
  const { settings, categories, items, posts, gallery } = await getData()
  const s = settings

  const gallerySlots = Array.from({ length: 6 }, (_, i) => gallery[i] ?? null)

  return (
    <>
      <Nav />
      <ScrollReveal />

      {/* ── HERO ── */}
      <section className="hero" aria-label="Ana başlık">
        <div className="hero-inner">
          <div>
            <div className="hero-badge reveal">
              Kırşehir&apos;in Tandır Ustası · 1965&apos;den Beri
            </div>
            <h1 className="hero-title reveal reveal-d1">
              {s.hero_title
                ? s.hero_title.split(',').map((part, i) =>
                    i === 1 ? <><br key={i} /><em>{part.trim()}</em></> : part
                  )
                : <><span>Ateşin Sabrıyla,</span><br /><em>Ustanın Elleriyle</em></>
              }
            </h1>
            <p className="hero-subtitle reveal reveal-d2">
              {s.hero_subtitle || 'Geleneksel tandır fırınında, en taze malzemelerle pişirilmiş Anadolu lezzetleri.'}
            </p>
            <div className="hero-actions reveal reveal-d3">
              <a href="#menu" className="btn btn-red">Menüyü Gör</a>
              <a href="#iletisim" className="btn btn-outline">Konum & İletişim</a>
              {s.whatsapp && (
                <a href={`https://wa.me/${s.whatsapp}`} target="_blank" rel="noopener" className="btn btn-dark">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                  WhatsApp
                </a>
              )}
            </div>
          </div>

          {/* Harita kartı */}
          <div className="hero-visual reveal reveal-d2">
            <div className="hero-map-card">
              <iframe
                src={s.maps_embed_url || 'https://maps.google.com/maps?q=Ahievran+Mah+738+Sk+No+9+Kirsehir&t=&z=17&ie=UTF8&iwloc=&output=embed'}
                loading="lazy"
                title="Tandırcı Usta Konum"
                referrerPolicy="no-referrer-when-downgrade"
              />
              <div className="hero-contact-strip">
                <div className="hero-contact-item">
                  <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
                  <span>{s.address || 'Ahievran Mah. 738. Sk. No:9, Kırşehir'}</span>
                </div>
                {s.phone && (
                  <div className="hero-contact-item">
                    <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.7 10.5 19.79 19.79 0 01.67 2.11 2 2 0 012.68 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.09 6.09l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14.92v2z" /></svg>
                    <a href={`tel:${s.phone?.replace(/\s/g, '')}`}>{s.phone}</a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── MENÜ ── */}
      <section id="menu" className="section">
        <div className="container">
          <div className="section-header reveal">
            <p className="eyebrow">Lezzetlerimiz</p>
            <h2 className="section-title">Menümüz</h2>
            <p className="section-lead">Taze malzemeler, geleneksel tarifler ve tandır fırınının eşsiz aroması.</p>
          </div>
          <MenuClient categories={categories} items={items} />
        </div>
      </section>

      {/* ── HAKKIMIZDA ── */}
      <section id="hakkimizda" className="section section-alt">
        <div className="container">
          <div className="about-grid">
            <div>
              <p className="eyebrow reveal">Hikayemiz</p>
              <h2 className="section-title reveal reveal-d1">Gelenekten Gelen <em>Tat</em></h2>
              <div className="about-text">
                <p className="reveal reveal-d2">
                  {s.about_text || 'Tandırcı Usta, Kırşehir\'in kalbinde geleneksel Anadolu mutfağını yaşatma idealiyle hizmet vermektedir.'}
                </p>
                <p className="reveal reveal-d3">
                  Tandır fırınımız her sabah yakılır, özenle seçilmiş etler saatlerce pişirilir. Kuzu tandırımızın sırrı basit: kaliteli et, doğru ateş ve bolca sabır.
                </p>
                <p className="reveal reveal-d4">
                  Aile işletmemiz olarak her müşterimizi misafir, her öğünü özel bir an olarak görüyoruz. Kırşehir&apos;e geldinizde soframız sizin için açık.
                </p>
              </div>
              <div className="hero-stats" style={{ textAlign: 'left', marginTop: 36 }}>
                <div className="reveal">
                  <div className="hero-stat-num">10<sup>+</sup></div>
                  <div className="hero-stat-label">Yıllık Deneyim</div>
                </div>
                <div className="reveal reveal-d1">
                  <div className="hero-stat-num">%100</div>
                  <div className="hero-stat-label">Taze Malzeme</div>
                </div>
                <div className="reveal reveal-d2">
                  <div className="hero-stat-num">★4.8</div>
                  <div className="hero-stat-label">Google Puanı</div>
                </div>
              </div>
            </div>
            <div className="about-img-wrap reveal reveal-d2">
              <div className="about-img-bg">
                {/* Fotoğraf eklendiğinde: <img src="/about.jpg" alt="Tandırcı Usta Restoran" /> */}
                <div className="about-img-placeholder">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
                  <br />Restoran fotoğrafı ekleyin
                </div>
              </div>
              <div className="about-accent">
                <div className="about-accent-num">Est.</div>
                <div className="about-accent-num">2014</div>
                <div className="about-accent-label">Kırşehir&apos;de</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── GALERİ ── */}
      <section id="galeri" className="section">
        <div className="container">
          <div className="section-header reveal">
            <p className="eyebrow">Fotoğraflar</p>
            <h2 className="section-title">Gözlerinizle <em>Tadın</em></h2>
          </div>
          <div className="gallery-grid reveal reveal-d1">
            {gallerySlots.map((img, i) => (
              <div key={i} className={`g-item${i === 0 ? ' g-big' : ''}`}>
                {img ? (
                  <>
                    <img src={img.url} alt={img.caption || `Tandırcı Usta fotoğraf ${i + 1}`} loading="lazy" />
                    <div className="g-overlay">
                      <span className="g-caption">{img.caption}</span>
                    </div>
                  </>
                ) : (
                  <div className="g-placeholder">
                    <svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
                    <div>Admin panelinden ekleyin</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MARKALAR ── */}
      <section id="markalar" className="section section-alt">
        <div className="container">
          <div className="section-header reveal">
            <p className="eyebrow">Çatımız Altında</p>
            <h2 className="section-title">Diğer <em>Markalarımız</em></h2>
            <p className="section-lead">Tandırcı Usta ailesinin büyüyen vizyonu.</p>
          </div>
          <div className="brands-grid">
            {[
              { num: '01', name: 'Marka Adı', desc: 'Buraya markanın kısa açıklaması gelecek. Admin panelinden eklenebilir.', tag: 'Yakında' },
              { num: '02', name: 'Marka Adı', desc: 'Buraya markanın kısa açıklaması gelecek. Admin panelinden eklenebilir.', tag: 'Yakında' },
              { num: '03', name: 'Marka Adı', desc: 'Buraya markanın kısa açıklaması gelecek. Admin panelinden eklenebilir.', tag: 'Yakında' },
            ].map((b, i) => (
              <div key={i} className={`brand-card reveal reveal-d${i + 1}`}>
                <div className="brand-num">{b.num}</div>
                <div className="brand-name">{b.name}</div>
                <div className="brand-desc">{b.desc}</div>
                <span className="brand-tag">{b.tag}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BLOG ÖN İZLEME ── */}
      <section className="section">
        <div className="container">
          <div className="section-header reveal" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', textAlign: 'left' }}>
            <div>
              <p className="eyebrow">Blog & Tarifler</p>
              <h2 className="section-title">Son <em>Yazılarımız</em></h2>
            </div>
            <Link href="/blog" className="btn btn-outline btn-sm" style={{ flexShrink: 0, marginBottom: 16 }}>
              Tüm Yazılar →
            </Link>
          </div>
          <div className="blog-grid">
            {posts.length === 0 ? (
              <div className="blog-empty reveal">
                <p>Henüz yazı yok. Admin panelinden ilk tarifinizi ekleyin.</p>
              </div>
            ) : posts.map((post, i) => (
              <Link key={post.id} href={`/blog/${post.slug}`} className={`blog-card reveal reveal-d${i}`}>
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
        </div>
      </section>

      {/* ── INSTAGRAM ── */}
      <section className="section instagram-section">
        <div className="container">
          <div className="section-header reveal">
            <p className="eyebrow">Sosyal Medya</p>
            <h2 className="section-title">Bizi <em>Takip Edin</em></h2>
            <p className="section-lead" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Instagram&apos;da günlük paylaşımlarımızı takip edin.
            </p>
          </div>
          <div className="ig-placeholder-grid reveal">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="ig-placeholder-item">
                <svg viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" /></svg>
              </div>
            ))}
          </div>
          <div className="instagram-cta reveal">
            <a
              href={s.instagram || 'https://instagram.com/tandirciusta'}
              target="_blank"
              rel="noopener"
              className="ig-follow-btn"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="0.5" fill="white" /></svg>
              @tandirciusta — Takip Et
            </a>
          </div>
        </div>
      </section>

      {/* ── İLETİŞİM ── */}
      <section id="iletisim" className="section section-alt">
        <div className="container">
          <div className="section-header reveal">
            <p className="eyebrow">Bize Ulaşın</p>
            <h2 className="section-title">Konum & <em>İletişim</em></h2>
          </div>
          <div className="contact-grid">
            <div>
              <div className="contact-item reveal">
                <div className="contact-icon">
                  <svg viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.7 10.5 19.79 19.79 0 01.67 2.11 2 2 0 012.68 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.09 6.09l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14.92v2z" /></svg>
                </div>
                <div>
                  <div className="contact-label">Telefon</div>
                  <div className="contact-value">
                    <a href={`tel:${s.phone?.replace(/\s/g, '')}`}>{s.phone || '+90 XXX XXX XX XX'}</a>
                  </div>
                </div>
              </div>

              <div className="contact-item reveal reveal-d1">
                <div className="contact-icon">
                  <svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
                </div>
                <div>
                  <div className="contact-label">Adres</div>
                  <div className="contact-value">
                    {s.address || 'Ahievran Mah. 738. Sk. No:9, Kırşehir Merkez, 40100'}
                  </div>
                </div>
              </div>

              <div className="contact-item reveal reveal-d2">
                <div className="contact-icon">
                  <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                </div>
                <div>
                  <div className="contact-label">Çalışma Saatleri</div>
                  <div className="contact-value">
                    <div className="hours-grid">
                      <span className="h-day">Hf. içi</span><span className="h-time">{s.hours_weekday || '09:00 – 21:00'}</span>
                      <span className="h-day">Cumartesi</span><span className="h-time">{s.hours_saturday || '09:00 – 22:00'}</span>
                      <span className="h-day">Pazar</span><span className="h-time">{s.hours_sunday || '10:00 – 21:00'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {s.whatsapp && (
                <div className="reveal reveal-d3" style={{ marginTop: 8 }}>
                  <a href={`https://wa.me/${s.whatsapp}`} target="_blank" rel="noopener" className="btn btn-dark" style={{ width: '100%', justifyContent: 'center' }}>
                    WhatsApp ile Ulaş
                  </a>
                </div>
              )}
            </div>

            <div className="map-card reveal reveal-d2">
              <iframe
                src={s.maps_embed_url || 'https://maps.google.com/maps?q=Ahievran+Mah+738+Sk+No+9+Kirsehir&t=&z=17&ie=UTF8&iwloc=&output=embed'}
                loading="lazy"
                title="Tandırcı Usta Harita"
                referrerPolicy="no-referrer-when-downgrade"
              />
              <div className="map-card-footer">
                <span style={{ fontSize: 13, color: 'var(--muted)' }}>Ahievran Mah. 738. Sk. No:9, Kırşehir</span>
                {s.maps_link && (
                  <a href={s.maps_link} target="_blank" rel="noopener" className="btn btn-red btn-sm">
                    Yol Tarifi Al
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WhatsApp Float */}
      {s.whatsapp && (
        <a href={`https://wa.me/${s.whatsapp}`} target="_blank" rel="noopener" className="wa-float" aria-label="WhatsApp ile ulaş">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
        </a>
      )}

      <Footer
        phone={s.phone} address={s.address} instagram={s.instagram}
        whatsapp={s.whatsapp} hoursWeekday={s.hours_weekday}
        hoursSaturday={s.hours_saturday} hoursSunday={s.hours_sunday}
      />
    </>
  )
}
