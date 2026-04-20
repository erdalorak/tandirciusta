import type { Metadata } from 'next'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { getSettings } from '@/lib/supabase'

export const revalidate = 0

export const metadata: Metadata = {
  title: 'İlikya | Doğal & Katkısız İlik Suyu – Tandırcı Usta',
  description: 'Dana kemiklerinden geleneksel yöntemlerle üretilen ilik suyu. Yüksek kolajen, 6 farklı aroma, cam kavanoz. Sağlıklı yaşamın doğal destekçisi.',
  alternates: { canonical: 'https://tandirciusta.com/ilikya' },
  openGraph: {
    title: 'İlikya | Doğal ve Katkısız İlik Suyu',
    description: 'Geleneksel yöntemlerle üretilen, yüksek kolajen içerikli doğal ilik suyu. 6 farklı aroma, cam kavanoz ambalaj.',
    url: 'https://tandirciusta.com/ilikya',
    siteName: 'Tandırcı Usta',
    locale: 'tr_TR',
    type: 'website',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'İlikya – Doğal İlik Suyu' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'İlikya | Doğal & Katkısız İlik Suyu',
    description: 'Dana kemiklerinden geleneksel yöntemlerle üretilen ilik suyu. Yüksek kolajen, cam kavanoz.',
    images: ['/og-image.jpg'],
  },
}

// Texts come from settings — defaults below


export default async function IlikyaPage() {
  const s = await getSettings()

  const seriler = [
    { img: '/ilikya/geleneksel.png', ad: s.ilikya_seri1_ad || 'Geleneksel Seri', aciklama: s.ilikya_seri1_aciklama || 'Atalarımızdan öğrendiğimiz geleneksel kemik suyu tarifi. Saf, doğal, katkısız.' },
    { img: '/ilikya/bagisiklik.png', ad: s.ilikya_seri2_ad || 'Bağışıklık Destek Serisi', aciklama: s.ilikya_seri2_aciklama || 'Bağışıklık sistemini güçlendiren özel aromatik karışım. Hastalık dönemlerinde doğal destek.' },
    { img: '/ilikya/detoks.png', ad: s.ilikya_seri3_ad || 'Detoks Serisi', aciklama: s.ilikya_seri3_aciklama || 'Vücudu arındıran, sindirimi destekleyen özel bitki ve baharat karışımlı ilik suyu.' },
    { img: '/ilikya/sporcu.png', ad: s.ilikya_seri4_ad || 'Sporcu Serisi', aciklama: s.ilikya_seri4_aciklama || 'Kas ve eklem sağlığını destekleyen, elektrolit dengesini koruyan performans serisi.' },
    { img: '/ilikya/cocuk.png', ad: s.ilikya_seri5_ad || 'Çocuklar İçin Özel Seri', aciklama: s.ilikya_seri5_aciklama || 'Çocukların gelişimini destekleyen, hafif aromalı, özel formüllü ilik suyu.' },
    { img: '/ilikya/sifa.png', ad: s.ilikya_seri6_ad || 'Şifa Serisi', aciklama: s.ilikya_seri6_aciklama || 'Kronik rahatsızlıklara doğal destek. Şifalı bitkilerle zenginleştirilmiş özel karışım.' },
  ]

  const ozellikler = [
    { icon: '🦴', baslik: s.ilikya_ozellik1_baslik || 'Doğal & Katkısız', aciklama: s.ilikya_ozellik1_aciklama || 'Hiçbir yapay katkı maddesi, sadece doğanın gücü' },
    { icon: '🫙', baslik: s.ilikya_ozellik2_baslik || 'Cam Kavanoz', aciklama: s.ilikya_ozellik2_aciklama || 'Sağlığa zararlı plastikten uzak, sürdürülebilir ambalaj' },
    { icon: '❄️', baslik: s.ilikya_ozellik3_baslik || 'Soğuk Zincir', aciklama: s.ilikya_ozellik3_aciklama || 'Üretimden teslimata tam soğuk zincir güvencesi' },
    { icon: '✨', baslik: s.ilikya_ozellik4_baslik || 'Yüksek Kolajen', aciklama: s.ilikya_ozellik4_aciklama || 'Cilt, eklem ve bağırsak sağlığı için doğal kolajen kaynağı' },
    { icon: '🌿', baslik: s.ilikya_ozellik5_baslik || '6 Farklı Aroma', aciklama: s.ilikya_ozellik5_aciklama || 'Her ihtiyaca özel özenle geliştirilmiş aroma seçenekleri' },
    { icon: '🏭', baslik: s.ilikya_ozellik6_baslik || 'Hijyenik Üretim', aciklama: s.ilikya_ozellik6_aciklama || 'Endüstriyel sterilizasyon tüneli ile titiz üretim süreci' },
  ]

  const hedefler = [
    { baslik: s.ilikya_hedef1_baslik || 'Ebeveynler', aciklama: s.ilikya_hedef1_aciklama || 'Çocuklarının gelişimini doğal ve katkısız kaynaklarla desteklemek isteyen aileler' },
    { baslik: s.ilikya_hedef2_baslik || 'Sporcular', aciklama: s.ilikya_hedef2_aciklama || 'Kas ve eklem sağlığını korumayı, performansını artırmayı hedefleyen aktif bireyler' },
    { baslik: s.ilikya_hedef3_baslik || 'Sağlıklı Yaşam Tutkunları', aciklama: s.ilikya_hedef3_aciklama || 'Yapay tatlandırıcılardan kaçınan, yemeğine doğal lezzet katmak isteyenler' },
    { baslik: s.ilikya_hedef4_baslik || 'İyileşme Sürecindekiler', aciklama: s.ilikya_hedef4_aciklama || 'Doğal ve kolay sindirilebilir takviyeyle iyileşme sürecini hızlandırmak isteyenler' },
    { baslik: s.ilikya_hedef5_baslik || 'Cilt & Eklem Sağlığı', aciklama: s.ilikya_hedef5_aciklama || 'Kolajen içeriğiyle cilt elastikiyetini artırmayı ve eklem sağlığını korumayı hedefleyenler' },
    { baslik: s.ilikya_hedef6_baslik || 'Restoranlar & Kafeler', aciklama: s.ilikya_hedef6_aciklama || 'Menülerine doğal ve kaliteli et suyu eklemek isteyen profesyonel mutfaklar' },
  ]

  return (
    <>
      <Nav />

      {/* HERO */}
      <section style={{
        background: s.ilikya_hero_image ? undefined : 'linear-gradient(135deg, #C62828 0%, #B71C1C 50%, #7B1111 100%)',
        paddingTop: '120px',
        paddingBottom: '80px',
        color: '#fff',
        position: 'relative',
      }}>
        {s.ilikya_hero_image && (
          <div aria-hidden="true" style={{
            position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
            backgroundImage: `url(${s.ilikya_hero_image})`, backgroundSize: 'cover', backgroundPosition: 'center',
            opacity: s.ilikya_hero_image_opacity !== undefined ? Number(s.ilikya_hero_image_opacity) / 100 : 1,
          }} />
        )}
        {s.ilikya_hero_image && (
          <div aria-hidden="true" style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'rgba(0,0,0,0.45)', pointerEvents: 'none' }} />
        )}
        <div className="container" style={{display:'flex', flexDirection:'column', alignItems:'center', textAlign:'center', gap:32, position:'relative', zIndex:2}}>
          <img src="/ilikya/ilikya-logo-white.png" alt="İlikya" style={{height:280, objectFit:'contain'}} />
          <div>
            <p style={{fontSize:13, fontWeight:600, letterSpacing:'0.15em', textTransform:'uppercase', opacity:0.8, marginBottom:12}}>
              {s.ilikya_hero_subbrand || 'Tandırcı Usta® Ailesinden'}
            </p>
            <h1 style={{fontFamily:'Georgia,serif', fontSize:'clamp(2rem,5vw,3.5rem)', fontWeight:700, lineHeight:1.2, marginBottom:16}}>
              {s.ilikya_hero_title_line1 || 'Doğal ve Katkısız'}<br /><em style={{fontStyle:'italic'}}>{s.ilikya_hero_title_line2 || 'İlik Suyu'}</em>
            </h1>
            <p style={{fontSize:'1.1rem', opacity:0.85, maxWidth:560, margin:'0 auto', lineHeight:1.7}}>
              {s.ilikya_hero_subtitle || 'Dana kemiklerinden geleneksel yöntemlerle elde edilen, yüksek kolajen içerikli, cam kavanozlarda soğuk zincirle sunulan ilik suyu.'}
            </p>
          </div>
          <div style={{display:'flex', gap:12, flexWrap:'wrap', justifyContent:'center'}}>
            <a href={`https://wa.me/${s.whatsapp || '905394518033'}?text=${encodeURIComponent('İlikya hakkında bilgi almak istiyorum')}`}
              target="_blank" rel="noopener"
              style={{background:'#fff', color:'#C62828', fontWeight:700, padding:'12px 28px', borderRadius:8, textDecoration:'none', fontSize:15}}>
              {s.ilikya_hero_btn_order || 'Sipariş & Bilgi Al'}
            </a>
            <Link href="/#markalar"
              style={{border:'2px solid rgba(255,255,255,0.5)', color:'#fff', fontWeight:600, padding:'12px 28px', borderRadius:8, textDecoration:'none', fontSize:15}}>
              ← Geri Dön
            </Link>
          </div>
        </div>
      </section>

      {/* ÜRÜN SERİLERİ */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <p className="eyebrow">{s.ilikya_series_eyebrow || 'Ürün Gamı'}</p>
            <h2 className="section-title">{s.ilikya_series_title || '6 Farklı'} <em>{s.ilikya_series_title_em || 'Seri'}</em></h2>
            <p className="section-lead">{s.ilikya_series_lead || 'Her ihtiyaca özel, özenle formüle edilmiş ilik suyu serileri.'}</p>
          </div>
          <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px,1fr))', gap:24}}>
            {seriler.map((sr, i) => (
              <div key={i} style={{background:'#fff', border:'1.5px solid #e8e0d5', borderRadius:16, overflow:'hidden', boxShadow:'0 2px 12px rgba(0,0,0,0.06)'}}>
                <img src={sr.img} alt={sr.ad} style={{width:'100%', height:240, objectFit:'contain', background:'#f8f5f0', padding:'12px 0'}} />
                <div style={{padding:'20px 24px'}}>
                  <div style={{fontFamily:'Georgia,serif', fontSize:18, fontWeight:700, marginBottom:8, color:'#1a1a1a'}}>{sr.ad}</div>
                  <div style={{fontSize:13, color:'#666', lineHeight:1.65}}>{sr.aciklama}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ÖZELLİKLER */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-header">
            <p className="eyebrow">{s.ilikya_features_eyebrow || 'Neden İlikya?'}</p>
            <h2 className="section-title">{s.ilikya_features_title || 'Fark Yaratan'} <em>{s.ilikya_features_title_em || 'Özellikler'}</em></h2>
          </div>
          <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px,1fr))', gap:20}}>
            {ozellikler.map((o, i) => (
              <div key={i} style={{background:'#fff', border:'1.5px solid #e8e0d5', borderRadius:14, padding:'28px 24px', display:'flex', gap:16, alignItems:'flex-start'}}>
                <span style={{fontSize:32}}>{o.icon}</span>
                <div>
                  <div style={{fontWeight:700, fontSize:15, marginBottom:6, color:'#1a1a1a'}}>{o.baslik}</div>
                  <div style={{fontSize:13, color:'#666', lineHeight:1.6}}>{o.aciklama}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HEDEF KİTLE */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <p className="eyebrow">{s.ilikya_audience_eyebrow || 'Kimler İçin?'}</p>
            <h2 className="section-title">{s.ilikya_audience_title || 'İlikya ile'} <em>{s.ilikya_audience_title_em || 'Sağlıklı Yaşam'}</em></h2>
          </div>
          <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(260px,1fr))', gap:16}}>
            {hedefler.map((h, i) => (
              <div key={i} style={{background:'#faf9f7', border:'1px solid #e8e0d5', borderRadius:12, padding:'20px 20px'}}>
                <div style={{fontWeight:700, fontSize:14, marginBottom:6, color:'#C62828'}}>{h.baslik}</div>
                <div style={{fontSize:13, color:'#555', lineHeight:1.6}}>{h.aciklama}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{background:'linear-gradient(135deg, #C62828, #7B1111)', padding:'80px 0', color:'#fff', textAlign:'center'}}>
        <div className="container">
          <h2 style={{fontFamily:'Georgia,serif', fontSize:'clamp(1.8rem,4vw,2.8rem)', marginBottom:16}}>
            {s.ilikya_cta_heading || 'İlikya ile Tanışmaya Hazır mısınız?'}
          </h2>
          <p style={{opacity:0.85, fontSize:'1.05rem', marginBottom:32, maxWidth:480, margin:'0 auto 32px'}}>
            {s.ilikya_cta_description || 'Yakında sipariş ve toptan satış için web sitemiz aktif olacak. Şimdilik WhatsApp üzerinden bilgi alabilirsiniz.'}
          </p>
          <a href={`https://wa.me/${s.whatsapp || '905394518033'}?text=${encodeURIComponent('İlikya hakkında bilgi almak istiyorum')}`}
            target="_blank" rel="noopener"
            style={{background:'#fff', color:'#C62828', fontWeight:700, padding:'14px 36px', borderRadius:8, textDecoration:'none', fontSize:16, display:'inline-block'}}>
            {s.ilikya_cta_button || 'WhatsApp ile Sipariş Ver'}
          </a>
        </div>
      </section>

      <Footer description={s.footer_description} />
    </>
  )
}
