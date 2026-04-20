import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'
import AnalyticsTracker from '@/components/AnalyticsTracker'

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

export const metadata: Metadata = {
  metadataBase: new URL('https://tandirciusta.com'),
  title: {
    default: 'Tandırcı Usta | Kırşehir\'de Yemek – Tandır & Anadolu Mutfağı',
    template: '%s | Tandırcı Usta Kırşehir',
  },
  description: '⭐ 4.8 Google Puanı · Kırşehir\'de yemek için doğru adres. Kuzu tandır, kelle paça çorbası, geleneksel Anadolu lezzetleri. 📍 Ahievran Mah. Rezervasyon & catering hizmeti.',
  keywords: [
    'Kırşehir yemek yerleri', 'Kırşehir restoran', 'Kırşehir lokanta',
    'Kırşehir yemek', 'Kırşehir yemek yenecek yerler', 'Kırşehir restaurant',
    'Kırşehir tandır', 'kuzu tandır Kırşehir', 'tandır restoranı Kırşehir',
    'Kırşehir nerede yemek yenir', 'Kırşehir merkez restoran',
    'Tandırcı Usta', 'Kırşehir Anadolu mutfağı',
    'kelle paça Kırşehir', 'Kırşehir catering', 'Kırşehir rezervasyon',
  ],
  authors: [{ name: 'Tandırcı Usta', url: 'https://tandirciusta.com' }],
  creator: 'Tandırcı Usta',
  publisher: 'Tandırcı Usta',
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    url: 'https://tandirciusta.com',
    siteName: 'Tandırcı Usta',
    title: 'Tandırcı Usta | Kırşehir\'de Yemek – ⭐ 4.8 Google Puanı',
    description: 'Kırşehir\'de geleneksel tandır fırınında pişirilmiş kuzu, kelle paça ve Anadolu lezzetleri. Rezervasyon & catering hizmeti.',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Tandırcı Usta – Kırşehir\'in Tandır Restoranı' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tandırcı Usta | Kırşehir\'de Yemek',
    description: 'Kırşehir\'de geleneksel tandır lezzetleri. Kuzu tandır, kelle paça ve Anadolu mutfağı. ⭐ 4.8 Google.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  alternates: { canonical: 'https://tandirciusta.com' },
  icons: {
    icon: '/icon.ico',
    apple: '/apple-icon.png',
  },
  verification: {
    google: '1Ui2ESAlJRKjxHhQjGs3eiJjw_qr-q2vHHXVVLugVgY',
  },
}

/* ── Restaurant + LocalBusiness Schema ── */
const restaurantSchema = {
  '@context': 'https://schema.org',
  '@type': ['Restaurant', 'LocalBusiness'],
  '@id': 'https://tandirciusta.com/#restaurant',
  name: 'Tandırcı Usta',
  alternateName: 'Tandirci Usta Kırşehir',
  description: 'Kırşehir\'de geleneksel tandır restoranı. Kuzu tandır, tavuk tandır, kelle paça çorbası ve Anadolu mutfağı lezzetleri. Catering ve rezervasyon hizmeti mevcuttur.',
  url: 'https://tandirciusta.com',
  logo: {
    '@type': 'ImageObject',
    url: 'https://tandirciusta.com/logo.png',
    width: 200,
    height: 200,
  },
  image: ['https://tandirciusta.com/og-image.jpg'],
  telephone: '+905394518033',
  servesCuisine: ['Türk Mutfağı', 'Anadolu Mutfağı', 'Tandır Mutfağı'],
  priceRange: '₺₺',
  currenciesAccepted: 'TRY',
  paymentAccepted: 'Nakit, Kredi Kartı',
  hasMenu: 'https://tandirciusta.com/#menu',
  acceptsReservations: 'https://tandirciusta.com/#rezervasyon',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Ahievran Mah. 738. Sk. No:9',
    addressLocality: 'Kırşehir',
    addressRegion: 'Kırşehir',
    postalCode: '40100',
    addressCountry: 'TR',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 39.1454,
    longitude: 34.1631,
  },
  hasMap: 'https://maps.app.goo.gl/tandirciusta',
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '09:00',
      closes: '21:00',
    },
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Saturday'],
      opens: '09:00',
      closes: '22:00',
    },
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Sunday'],
      opens: '10:00',
      closes: '21:00',
    },
  ],
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    bestRating: '5',
    worstRating: '1',
    ratingCount: '200',
  },
  areaServed: { '@type': 'City', name: 'Kırşehir' },
  sameAs: ['https://instagram.com/tandirciusta'],
  potentialAction: {
    '@type': 'ReserveAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://tandirciusta.com/#rezervasyon',
    },
  },
}

/* ── FAQ Schema — hedef: "kırşehir yemek yerleri", "kırşehir restoran" ── */
const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Kırşehir\'de en iyi yemek yeri neresi?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Tandırcı Usta, Kırşehir\'de geleneksel Anadolu mutfağını sunan, ⭐ 4.8 Google puanıyla öne çıkan bir restoran. Ahievran Mah. 738. Sk. No:9 adresinde, kuzu tandır başta olmak üzere kelle paça çorbası ve Anadolu lezzetleri servis edilmektedir.',
      },
    },
    {
      '@type': 'Question',
      name: 'Kırşehir\'de tandır nerede yenir?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Kırşehir\'de en iyi tandır için Tandırcı Usta\'yı tercih edebilirsiniz. Her sabah yakılan tandır fırınında saatlerce pişirilen kuzu tandır, taze ve doğal malzemelerle hazırlanmaktadır.',
      },
    },
    {
      '@type': 'Question',
      name: 'Kırşehir\'de rezervasyon yapabileceğim restoran var mı?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Evet, Tandırcı Usta\'da masa rezervasyonu yapabilirsiniz. Web sitesindeki form veya WhatsApp üzerinden rezervasyon talebinde bulunabilirsiniz.',
      },
    },
    {
      '@type': 'Question',
      name: 'Kırşehir\'de catering hizmeti veren restoran var mı?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Evet, Tandırcı Usta düğün, toplantı ve özel organizasyonlar için catering hizmeti sunmaktadır. Detaylı bilgi için web sitesindeki talep formunu veya WhatsApp\'ı kullanabilirsiniz.',
      },
    },
    {
      '@type': 'Question',
      name: 'Tandırcı Usta\'nın çalışma saatleri nedir?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Tandırcı Usta hafta içi 09:00–21:00, Cumartesi 09:00–22:00, Pazar 10:00–21:00 saatleri arasında hizmet vermektedir.',
      },
    },
  ],
}

/* ── WebSite + SearchAction Schema ── */
const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': 'https://tandirciusta.com/#website',
  name: 'Tandırcı Usta',
  url: 'https://tandirciusta.com',
  description: 'Kırşehir\'in geleneksel tandır restoranı. Tarifler, menü ve rezervasyon.',
  inLanguage: 'tr-TR',
  publisher: { '@id': 'https://tandirciusta.com/#restaurant' },
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://tandirciusta.com/blog?q={search_term_string}',
    },
    'query-input': 'required name=search_term_string',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga-init" strategy="afterInteractive">{`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_ID}');
            `}</Script>
          </>
        )}
        <AnalyticsTracker />
        {children}
      </body>
    </html>
  )
}
