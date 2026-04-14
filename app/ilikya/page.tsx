import type { Metadata } from 'next'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { getSettings } from '@/lib/supabase'

export const revalidate = 0

export const metadata: Metadata = {
  title: 'İlikya | Doğal İlik Suyu',
  description: 'Dana kemiklerinden elde edilen doğal ve katkısız ilik suyu. Yüksek kolajen içeriği, 6 farklı aroma, cam kavanoz ambalaj. Sağlıklı yaşamın doğal destekçisi.',
  openGraph: {
    title: 'İlikya | Doğal ve Katkısız İlik Suyu',
    description: 'Geleneksel yöntemlerle üretilen, yüksek kolajen içerikli doğal ilik suyu.',
    images: [{ url: '/ilikya/ilikya-logo.png' }],
  },
}

const seriler = [
  {
    img: '/ilikya/geleneksel.png',
    ad: 'Geleneksel Seri',
    aciklama: 'Atalarımızdan öğrendiğimiz geleneksel kemik suyu tarifi. Saf, doğal, katkısız.',
    renk: '#8B4513',
  },
  {
    img: '/ilikya/bagisiklik.png',
    ad: 'Bağışıklık Destek Serisi',
    aciklama: 'Bağışıklık sistemini güçlendiren özel aromatik karışım. Hastalık dönemlerinde doğal destek.',
    renk: '#2E7D32',
  },
  {
    img: '/ilikya/detoks.png',
    ad: 'Detoks Serisi',
    aciklama: 'Vücudu arındıran, sindirimi destekleyen özel bitki ve baharat karışımlı ilik suyu.',
    renk: '#00695C',
  },
  {
    img: '/ilikya/sporcu.png',
    ad: 'Sporcu Serisi',
    aciklama: 'Kas ve eklem sağlığını destekleyen, elektrolit dengesini koruyan performans serisi.',
    renk: '#1565C0',
  },
  {
    img: '/ilikya/cocuk.png',
    ad: 'Çocuklar İçin Özel Seri',
    aciklama: 'Çocukların gelişimini destekleyen, hafif aromalı, özel formüllü ilik suyu.',
    renk: '#F57C00',
  },
  {
    img: '/ilikya/sifa.png',
    ad: 'Şifa Serisi',
    aciklama: 'Kronik rahatsızlıklara doğal destek. Şifalı bitkilerle zenginleştirilmiş özel karışım.',
    renk: '#6A1B9A',
  },
]

const ozellikler = [
  { icon: '🦴', baslik: 'Doğal & Katkısız', aciklama: 'Hiçbir yapay katkı maddesi, sadece doğanın gücü' },
  { icon: '🫙', baslik: 'Cam Kavanoz', aciklama: 'Sağlığa zararlı plastikten uzak, sürdürülebilir ambalaj' },
  { icon: '❄️', baslik: 'Soğuk Zincir', aciklama: 'Üretimden teslimata tam soğuk zincir güvencesi' },
  { icon: '✨', baslik: 'Yüksek Kolajen', aciklama: 'Cilt, eklem ve bağırsak sağlığı için doğal kolajen kaynağı' },
  { icon: '🌿', baslik: '6 Farklı Aroma', aciklama: 'Her ihtiyaca özel özenle geliştirilmiş aroma seçenekleri' },
  { icon: '🏭', baslik: 'Hijyenik Üretim', aciklama: 'Endüstriyel sterilizasyon tüneli ile titiz üretim süreci' },
]

export default async function IlikyaPage() {
  const s = await getSettings()
  return (
    <>
      <Nav />

      {/* HERO */}
      <section style={{
        background: s.ilikya_hero_image
          ? `linear-gradient(rgba(0,0,0,0.45),rgba(0,0,0,0.45)), url(${s.ilikya_hero_image}) center/cover no-repeat`
          : 'linear-gradient(135deg, #C62828 0%, #B71C1C 50%, #7B1111 100%)',
        paddingTop: '120px',
        paddingBottom: '80px',
        color: '#fff',
      }}>
        <div className="container" style={{display:'flex', flexDirection:'column', alignItems:'center', textAlign:'center', gap:32}}>
          <img src="/ilikya/ilikya-logo-white.png" alt="İlikya" style={{height:280, objectFit:'contain'}} />
          <div>
            <p style={{fontSize:13, fontWeight:600, letterSpacing:'0.15em', textTransform:'uppercase', opacity:0.8, marginBottom:12}}>
              Tandırcı Usta® Ailesinden
            </p>
            <h1 style={{fontFamily:'Georgia,serif', fontSize:'clamp(2rem,5vw,3.5rem)', fontWeight:700, lineHeight:1.2, marginBottom:16}}>
              Doğal ve Katkısız<br /><em style={{fontStyle:'italic'}}>İlik Suyu</em>
            </h1>
            <p style={{fontSize:'1.1rem', opacity:0.85, maxWidth:560, margin:'0 auto', lineHeight:1.7}}>
              Dana kemiklerinden geleneksel yöntemlerle elde edilen, yüksek kolajen içerikli, cam kavanozlarda soğuk zincirle sunulan ilik suyu.
            </p>
          </div>
          <div style={{display:'flex', gap:12, flexWrap:'wrap', justifyContent:'center'}}>
            <a href="https://wa.me/905394518033?text=İlikya%20hakkında%20bilgi%20almak%20istiyorum"
              target="_blank" rel="noopener"
              style={{background:'#fff', color:'#C62828', fontWeight:700, padding:'12px 28px', borderRadius:8, textDecoration:'none', fontSize:15}}>
              Sipariş & Bilgi Al
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
            <p className="eyebrow">Ürün Gamı</p>
            <h2 className="section-title">6 Farklı <em>Seri</em></h2>
            <p className="section-lead">Her ihtiyaca özel, özenle formüle edilmiş ilik suyu serileri.</p>
          </div>
          <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px,1fr))', gap:24}}>
            {seriler.map((s, i) => (
              <div key={i} style={{background:'#fff', border:'1.5px solid #e8e0d5', borderRadius:16, overflow:'hidden', boxShadow:'0 2px 12px rgba(0,0,0,0.06)'}}>
                <img src={s.img} alt={s.ad} style={{width:'100%', height:240, objectFit:'contain', background:'#f8f5f0', padding:'12px 0'}} />
                <div style={{padding:'20px 24px'}}>
                  <div style={{fontFamily:'Georgia,serif', fontSize:18, fontWeight:700, marginBottom:8, color:'#1a1a1a'}}>{s.ad}</div>
                  <div style={{fontSize:13, color:'#666', lineHeight:1.65}}>{s.aciklama}</div>
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
            <p className="eyebrow">Neden İlikya?</p>
            <h2 className="section-title">Fark Yaratan <em>Özellikler</em></h2>
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
            <p className="eyebrow">Kimler İçin?</p>
            <h2 className="section-title">İlikya ile <em>Sağlıklı Yaşam</em></h2>
          </div>
          <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(260px,1fr))', gap:16}}>
            {[
              { baslik: 'Ebeveynler', aciklama: 'Çocuklarının gelişimini doğal ve katkısız kaynaklarla desteklemek isteyen aileler' },
              { baslik: 'Sporcular', aciklama: 'Kas ve eklem sağlığını korumayı, performansını artırmayı hedefleyen aktif bireyler' },
              { baslik: 'Sağlıklı Yaşam Tutkunları', aciklama: 'Yapay tatlandırıcılardan kaçınan, yemeğine doğal lezzet katmak isteyenler' },
              { baslik: 'İyileşme Sürecindekiler', aciklama: 'Doğal ve kolay sindirilebilir takviyeyle iyileşme sürecini hızlandırmak isteyenler' },
              { baslik: 'Cilt & Eklem Sağlığı', aciklama: "Kolajen içeriğiyle cilt elastikiyetini artırmayı ve eklem sağlığını korumayı hedefleyenler" },
              { baslik: 'Restoranlar & Kafeler', aciklama: 'Menülerine doğal ve kaliteli et suyu eklemek isteyen profesyonel mutfaklar' },
            ].map((h, i) => (
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
            İlikya ile Tanışmaya Hazır mısınız?
          </h2>
          <p style={{opacity:0.85, fontSize:'1.05rem', marginBottom:32, maxWidth:480, margin:'0 auto 32px'}}>
            Yakında sipariş ve toptan satış için web sitemiz aktif olacak. Şimdilik WhatsApp üzerinden bilgi alabilirsiniz.
          </p>
          <a href="https://wa.me/905394518033?text=İlikya%20hakkında%20bilgi%20almak%20istiyorum"
            target="_blank" rel="noopener"
            style={{background:'#fff', color:'#C62828', fontWeight:700, padding:'14px 36px', borderRadius:8, textDecoration:'none', fontSize:16, display:'inline-block'}}>
            WhatsApp ile Sipariş Ver
          </a>
        </div>
      </section>

      <Footer />
    </>
  )
}
