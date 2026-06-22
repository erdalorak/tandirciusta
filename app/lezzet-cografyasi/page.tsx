import type { Metadata } from 'next'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import Link from 'next/link'
import Script from 'next/script'

export const revalidate = 0

export const metadata: Metadata = {
  title: "Kırşehir'in Lezzet Coğrafyası ve CBS ile Tedarik Analizi | Tandırcı Usta",
  description:
    "Kırşehir meralarından sofraya: tandır etinin coğrafi kökeni, rakım ve bitki örtüsünün lezzete etkisi. Tandırcı Usta'nın CBS destekli tedarik felsefesi.",
  keywords: [
    'Kırşehir tandır',
    'coğrafi işaret',
    'lezzet haritası',
    'Kırşehir mera',
    'tandır eti tedarik',
    'Kırşehir yöresel lezzetler',
    'Türkiye coğrafi işaretli ürünler',
  ],
  alternates: { canonical: 'https://tandirciusta.com/lezzet-cografyasi' },
  openGraph: {
    title: "Kırşehir'in Lezzet Coğrafyası | Tandırcı Usta",
    description:
      "Kırşehir meralarından sofraya: tandır etinin coğrafi kökeni ve Tandırcı Usta'nın tedarik felsefesi.",
    url: 'https://tandirciusta.com/lezzet-cografyasi',
    siteName: 'Tandırcı Usta',
    locale: 'tr_TR',
    type: 'article',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: "Kırşehir Lezzet Coğrafyası" }],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Kırşehir'in Lezzet Coğrafyası | Tandırcı Usta",
    description: "Kırşehir meralarından sofraya: CBS destekli tedarik analizi.",
    images: ['/og-image.jpg'],
  },
}

const restaurantSchema = {
  '@context': 'https://schema.org',
  '@type': 'Restaurant',
  name: 'Tandırcı Usta',
  url: 'https://tandirciusta.com',
  servesCuisine: ['Kırşehir Mutfağı', 'Türk Mutfağı', 'Tandır'],
  priceRange: '₺₺',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Kırşehir',
    addressRegion: 'Kırşehir',
    addressCountry: 'TR',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 39.1425,
    longitude: 34.1709,
  },
  description:
    "Kırşehir'in otantik tandır lezzetlerini geleneksel yöntemlerle hazırlayan Tandırcı Usta, malzemelerini coğrafi veri disipliniyle seçer.",
}

const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'Tandırcı Usta',
  url: 'https://tandirciusta.com',
  image: 'https://tandirciusta.com/og-image.jpg',
  description:
    "Kırşehir meralarından temin edilen, coğrafi işaret değeri taşıyan malzemelerle hazırlanan geleneksel tandır ürünleri.",
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Kırşehir',
    addressRegion: 'Kırşehir',
    addressCountry: 'TR',
  },
  areaServed: { '@type': 'Place', name: 'Kırşehir ve İç Anadolu' },
  knowsAbout: ['Tandır pişirme teknikleri', 'Kırşehir yöresel ürünleri', 'Coğrafi işaretli gıdalar', 'İç Anadolu mera hayvancılığı'],
}

const productsSchema = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: "Kırşehir Coğrafi İşaretli Ürünler",
  itemListElement: [
    {
      '@type': 'ListItem', position: 1,
      item: {
        '@type': 'Product',
        name: 'Kırşehir Kuzu Eti (Mera Besili)',
        description: "Kırşehir'in 900–1.100 m rakımlı çayırlıklarında otlayan Akkaraman ve Kangal melezi kuzulardan elde edilen et.",
        brand: { '@type': 'Brand', name: 'Tandırcı Usta' },
        category: 'Et Ürünleri',
      },
    },
    {
      '@type': 'ListItem', position: 2,
      item: {
        '@type': 'Product',
        name: 'Kırşehir Tulum Peyniri',
        description: "Koyun sütünden, geleneksel deri tulumda olgunlaştırılan peynir.",
        brand: { '@type': 'Brand', name: 'Tandırcı Usta' },
        category: 'Süt Ürünleri',
      },
    },
    {
      '@type': 'ListItem', position: 3,
      item: {
        '@type': 'Product',
        name: 'Kırşehir Çiçek Balı',
        description: "Kırşehir steplerinde yetişen yabani kekik, adaçayı ve gelincik çiçeklerinden toplanan bal.",
        brand: { '@type': 'Brand', name: 'Tandırcı Usta' },
        category: 'Doğal Ürünler',
      },
    },
  ],
}

export default function LezzetCografyasiPage() {
  return (
    <>
      <Script id="schema-restaurant" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantSchema) }} />
      <Script id="schema-localbusiness" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }} />
      <Script id="schema-products" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productsSchema) }} />

      <Nav />

      <main style={{ paddingTop: 110, background: 'var(--bg)' }}>

        {/* Hero */}
        <section style={{
          background: 'var(--bg2)',
          borderBottom: '1px solid var(--border)',
          padding: '64px 24px 56px',
          textAlign: 'center',
        }}>
          <div style={{ maxWidth: 720, margin: '0 auto' }}>
            <p style={{ fontSize: 12, letterSpacing: 3, textTransform: 'uppercase', color: 'var(--red)', marginBottom: 16, fontWeight: 600, fontFamily: 'var(--sans)' }}>
              Tandırcı Usta · Coğrafi Lezzet Atlası
            </p>
            <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(28px, 5vw, 46px)', fontWeight: 700, lineHeight: 1.2, color: 'var(--black)', margin: '0 0 20px' }}>
              Kırşehir'in Lezzet Coğrafyası<br />
              <em style={{ color: 'var(--red)', fontStyle: 'italic' }}>ve CBS ile Tedarik Analizi</em>
            </h1>
            <p style={{ fontSize: 17, color: 'var(--muted)', maxWidth: 580, margin: '0 auto 36px', lineHeight: 1.75 }}>
              Bir tandır yemeğinin lezzeti, sadece tariften ibaret değildir. Eti yetiştiren meranın rakımı,
              toprağın mineral yapısı ve hayvanın beslenme biçimi — hepsi tabaktaki aromayı şekillendirir.
              Biz bunu veri ile takip ediyoruz.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href="#katman-analizi" style={{
                padding: '12px 28px', borderRadius: 6, background: 'var(--red)',
                color: '#fff', fontWeight: 600, fontSize: 14, textDecoration: 'none',
                fontFamily: 'var(--sans)',
              }}>
                Katman Analizini Gör
              </a>
              <Link href="/tarifler" style={{
                padding: '12px 28px', borderRadius: 6,
                border: '1.5px solid var(--border-g)',
                color: 'var(--text)', fontWeight: 500, fontSize: 14, textDecoration: 'none',
                fontFamily: 'var(--sans)', background: '#fff',
              }}>
                Tariflere Bak
              </Link>
            </div>
          </div>
        </section>

        <div style={{ maxWidth: 860, margin: '0 auto', padding: '0 24px' }}>

          {/* Giriş */}
          <section style={{ margin: '56px 0 0', padding: '36px 40px', background: 'var(--bg2)', borderRadius: 8, border: '1px solid var(--border)' }}>
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: 22, fontWeight: 700, color: 'var(--black)', marginTop: 0, marginBottom: 16 }}>
              Neden Coğrafya Önemli?
            </h2>
            <p style={{ color: 'var(--text)', lineHeight: 1.8, fontSize: 16, margin: '0 0 16px' }}>
              Kırşehir, İç Anadolu'nun ortasında 900–1.100 metre rakım bandında konumlanan bir step şehridir.
              Bu rakım; kışın sert geçmesi, yazın kuru esmesi ve meraların özgün bitki çeşitliliğiyle birleşince
              hayvan beslemesi açısından eşsiz bir coğrafya ortaya çıkarır. <strong>Akkaraman ve Kangal melezi kuzular</strong>,
              yıllık ortalama 180 günü bu meralar üzerinde otlayarak büyür.
            </p>
            <p style={{ color: 'var(--text)', lineHeight: 1.8, fontSize: 16, margin: 0 }}>
              Tandırcı Usta, malzeme tedarikinde bu coğrafi değişkenleri sistematik biçimde değerlendirir.
              Tıpkı bir coğrafi bilgi sistemi (CBS) analistinin katman katman veri okuduğu gibi, biz de
              meranın rakımını, toprak nem oranını ve bitki örtüsü yoğunluğunu tedarikçi seçiminde ölçüt olarak kullanıyoruz.
            </p>
          </section>

          {/* Katman Analizi */}
          <section id="katman-analizi" style={{ margin: '56px 0 0' }}>
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: 26, fontWeight: 700, color: 'var(--black)', marginBottom: 8 }}>
              Katman Analizi: Malzeme Tedarik Haritası
            </h2>
            <p style={{ color: 'var(--muted)', lineHeight: 1.75, marginBottom: 32, fontSize: 15 }}>
              CBS terminolojisinde bir "katman analizi", farklı veri katmanlarını üst üste bindirerek
              en uygun konumu veya kaynağı tespit eder. Tandırcı Usta'nın tedarik felsefesi de aynı mantıkla çalışır.
            </p>
            <div style={{ display: 'grid', gap: 16 }}>
              {([
                { icon: '⛰️', baslik: 'Katman 1 — Rakım ve İklim', metin: "Kırşehir meralarının 900–1.100 m bandı, kuzuların yavaş büyümesine yol açar. Yavaş büyüme, kas liflerinin daha sıkı ve lezzet bileşiklerinin (miyoglobin, karnitin) daha yoğun olmasını sağlar. Sonuç: buhara gelen etin derin, yoğun aroması." },
                { icon: '🌿', baslik: 'Katman 2 — Bitki Örtüsü', metin: "Step bitki örtüsü; kekik (Thymus serpyllum), yavşan otu (Artemisia) ve geven (Astragalus) türlerini barındırır. Bu bitkilerle beslenen kuzularda uçucu yağ transferi gerçekleşir — et, pişirilmeden önce bile hafif aromatik notalar taşır." },
                { icon: '🪨', baslik: 'Katman 3 — Toprak Mineral Yapısı', metin: "Kırşehir havzasının kireçtaşı ve bazalt kaynaklı toprakları, kalsiyum ve magnezyum açısından zengindir. Bu mineraller otlara geçer, oradan hayvana, oradan sofraya ulaşır. Mineral dengesi kemik sağlığını ve et kalitesini doğrudan etkiler." },
                { icon: '📍', baslik: 'Katman 4 — Tedarikçi Mesafesi', metin: "Kısa tedarik zinciri, et kalitesini korur. Tandırcı Usta, Kırşehir il sınırları içindeki tedarikçilere öncelik vererek kesimden sofraya geçen süreyi minimize eder. Bu; stres hormonu (kortizol) düşük, lifin yumuşak kaldığı bir et profili demektir." },
              ] as const).map(({ icon, baslik, metin }) => (
                <div key={baslik} style={{
                  background: '#fff', borderRadius: 8, padding: '24px 28px',
                  border: '1px solid var(--border-g)',
                  borderLeft: '3px solid var(--red)',
                  boxShadow: 'var(--shadow)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <span style={{ fontSize: 20 }}>{icon}</span>
                    <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: 'var(--black)', fontFamily: 'var(--sans)' }}>{baslik}</h3>
                  </div>
                  <p style={{ margin: 0, color: 'var(--text)', lineHeight: 1.75, fontSize: 15 }}>{metin}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Mekansal Sorgulama */}
          <section style={{ margin: '64px 0 0' }}>
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: 26, fontWeight: 700, color: 'var(--black)', marginBottom: 8 }}>
              Mekansal Sorgulama: Kırşehir Mera Analizi
            </h2>
            <p style={{ color: 'var(--muted)', lineHeight: 1.75, fontSize: 15, marginBottom: 28 }}>
              Kırşehir'in toplam yüzölçümünün yaklaşık <strong style={{ color: 'var(--black)' }}>%34'ü</strong> çayır
              ve mera niteliğindedir. Bu oran Türkiye ortalamasının üzerindedir. Meralar il merkezine
              15–55 km arasında yayılmış, deniz seviyesinden 950–1.080 m yükseklikte konumlanmıştır.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
              {([
                { label: 'Toplam Mera Alanı', deger: '~215.000 ha', alt: 'Kırşehir ili geneli' },
                { label: 'Ortalama Rakım', deger: '985 m', alt: 'Mera alanları ortalaması' },
                { label: 'Yıllık Otlatma', deger: '~180 gün', alt: 'İlkbahar–sonbahar' },
                { label: 'Hakim Flora', deger: 'Kekik & Geven', alt: 'Step karakteristik' },
              ] as const).map(({ label, deger, alt }) => (
                <div key={label} style={{
                  background: 'var(--bg2)', borderRadius: 8, padding: '20px 20px',
                  border: '1px solid var(--border)', textAlign: 'center',
                }}>
                  <p style={{ margin: '0 0 6px', fontSize: 11, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>{label}</p>
                  <p style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 700, color: 'var(--red)', fontFamily: 'var(--serif)' }}>{deger}</p>
                  <p style={{ margin: 0, fontSize: 12, color: 'var(--muted)' }}>{alt}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Coğrafi İşaretli Ürünler */}
          <section style={{ margin: '64px 0 0' }}>
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: 26, fontWeight: 700, color: 'var(--black)', marginBottom: 8 }}>
              Coğrafi İşaretli Ürünler ve Sofradaki Yeri
            </h2>
            <p style={{ color: 'var(--muted)', lineHeight: 1.7, fontSize: 15, marginBottom: 28 }}>
              Kırşehir'e özgü, coğrafi işaret değeri taşıyan ürünler — Tandırcı Usta mutfağında öncelikli olarak kullanılır.
            </p>
            <div style={{ display: 'grid', gap: 16 }}>
              {([
                {
                  emoji: '🥩', isim: 'Kırşehir Kuzu Eti (Mera Besili)',
                  tanim: 'Akkaraman ve Kangal melezi kuzular, Kırşehir meralarında en az 6 ay özgürce otlar. Kasaplık ağırlığı ve aroma profili, düz besi hayvanlarından belirgin biçimde ayrışır.',
                  kullanim: 'Tandır et, kuzu tandır, fırın kuzu',
                },
                {
                  emoji: '🧀', isim: 'Kırşehir Tulum Peyniri',
                  tanim: 'Koyun sütünden üretilen, deri tulumda 3–6 ay olgunlaştırılan geleneksel peynir. Keskin ve granüler yapısıyla salata ve mezelerde başroldedir.',
                  kullanim: 'Çoban salata, peynirli pide, meze tabağı',
                },
                {
                  emoji: '🍯', isim: 'Kırşehir Çiçek Balı',
                  tanim: 'Step florası üzerinde çalışan arıların ürettiği polikrom bal. Kekik, adaçayı ve gelincik aromaları bir arada, düşük nem oranıyla uzun raf ömrü.',
                  kullanim: 'Kahvaltı, tatlı sosu, marinat bileşeni',
                },
              ] as const).map(({ emoji, isim, tanim, kullanim }) => (
                <div key={isim} style={{
                  background: '#fff', borderRadius: 8, padding: '24px 28px',
                  border: '1px solid var(--border-g)', display: 'flex', gap: 20,
                  boxShadow: 'var(--shadow)',
                }}>
                  <span style={{ fontSize: 32, flexShrink: 0 }}>{emoji}</span>
                  <div>
                    <h3 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 600, color: 'var(--black)', fontFamily: 'var(--sans)' }}>{isim}</h3>
                    <p style={{ margin: '0 0 8px', color: 'var(--text)', lineHeight: 1.7, fontSize: 15 }}>{tanim}</p>
                    <p style={{ margin: 0, fontSize: 13, color: 'var(--red)', fontWeight: 600 }}>Kullanım: {kullanim}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Hakkımızda */}
          <section style={{ margin: '64px 0 0', padding: '48px 44px', background: 'var(--bg2)', borderRadius: 8, border: '1px solid var(--border)' }}>
            <p style={{ fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: 'var(--red)', margin: '0 0 12px', fontWeight: 600 }}>
              Hakkımızda
            </p>
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: 26, fontWeight: 700, color: 'var(--black)', margin: '0 0 20px', lineHeight: 1.3 }}>
              Coğrafi Veriyi Mutfağa Taşıyan Anlayış
            </h2>
            <p style={{ color: 'var(--text)', lineHeight: 1.8, fontSize: 16, margin: '0 0 16px' }}>
              Tandırcı Usta, yüzyıllık tandır geleneğini 21. yüzyılın veri okuryazarlığıyla harmanlayan
              bir mutfak anlayışı benimser. Her tedarikçi seçiminde sadece fiyat değil; meranın coğrafi
              konumu, hayvanın yetişme koşulları ve ürünün iz sürülebilirliği değerlendirilir.
            </p>
            <p style={{ color: 'var(--text)', lineHeight: 1.8, fontSize: 16, margin: '0 0 32px' }}>
              Bu sayfa, bu sürecin şeffaf bir anlatısıdır. Kırşehir'in lezzet haritasını paylaşmak,
              sofranızdaki yemeğin arkasındaki coğrafyayı görünür kılmak istiyoruz.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link href="/tarifler" style={{
                padding: '12px 24px', borderRadius: 6, background: 'var(--red)',
                color: '#fff', fontWeight: 600, fontSize: 14, textDecoration: 'none',
              }}>
                Tarifleri Keşfet
              </Link>
              <Link href="/" style={{
                padding: '12px 24px', borderRadius: 6,
                border: '1.5px solid var(--border-g)',
                color: 'var(--text)', fontWeight: 500, fontSize: 14, textDecoration: 'none',
                background: '#fff',
              }}>
                Ana Sayfaya Dön
              </Link>
            </div>
          </section>

          {/* İlgili sayfalar */}
          <section style={{ margin: '48px 0 80px' }}>
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: 20, fontWeight: 700, color: 'var(--black)', marginBottom: 16 }}>
              İlgili İçerikler
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
              {([
                { href: '/tarifler', label: 'Tüm tarifler', desc: 'Kırşehir ve Türk mutfağından tarifler' },
                { href: '/ilikya', label: 'İlikya', desc: 'Doğal & katkısız ilik suyu ürününü keşfet' },
                { href: '/', label: 'Tandırcı Usta', desc: 'Ana sayfamız ve ürünlerimiz' },
              ] as const).map(({ href, label, desc }) => (
                <Link key={href} href={href} style={{
                  display: 'block', padding: '18px 20px', borderRadius: 8,
                  background: '#fff', border: '1px solid var(--border-g)',
                  textDecoration: 'none', boxShadow: 'var(--shadow)',
                }}>
                  <p style={{ margin: '0 0 4px', fontWeight: 600, fontSize: 14, color: 'var(--black)' }}>{label}</p>
                  <p style={{ margin: 0, fontSize: 13, color: 'var(--muted)' }}>{desc}</p>
                </Link>
              ))}
            </div>
          </section>

        </div>
      </main>

      <Footer />
    </>
  )
}
