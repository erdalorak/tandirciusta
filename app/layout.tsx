import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'
import AnalyticsTracker from '@/components/AnalyticsTracker'

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

export const metadata: Metadata = {
  metadataBase: new URL('https://tandirciusta.com'),
  title: {
    default: 'Tandırcı Usta | Kırşehir Tandır Restoranı',
    template: '%s | Tandırcı Usta Kırşehir',
  },
  description: 'Kırşehir\'in en iyi tandır restoranı. Kuzu tandır, tavuk tandır, kelle paça çorbası, geleneksel Anadolu yemekleri. Ahievran Mah. 738. Sk. No:9, Kırşehir. Rezervasyon ve catering hizmeti.',
  keywords: [
    'Kırşehir tandır', 'Kırşehir restoran', 'Kırşehir lokanta',
    'Kırşehir yemek', 'Kırşehir et', 'Kırşehir çorba',
    'kuzu tandır Kırşehir', 'tandır restoranı Kırşehir',
    'Kırşehir nerede yemek yenir', 'Kırşehir merkez restoran',
    'Tandırcı Usta', 'Kırşehir Anadolu mutfağı',
    'kelle paça Kırşehir', 'kuzu kol tandır', 'Kırşehir catering',
  ],
  authors: [{ name: 'Tandırcı Usta', url: 'https://tandirciusta.com' }],
  creator: 'Tandırcı Usta',
  publisher: 'Tandırcı Usta',
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    url: 'https://tandirciusta.com',
    siteName: 'Tandırcı Usta',
    title: 'Tandırcı Usta | Kırşehir\'in En İyi Tandır Restoranı',
    description: 'Geleneksel tandır fırınında pişirilmiş kuzu, tavuk ve Anadolu lezzetleri. Kırşehir\'de hizmetinizdeyiz.',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Tandırcı Usta Kırşehir Tandır Restoranı' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tandırcı Usta | Kırşehir Tandır',
    description: 'Kırşehir\'de geleneksel tandır lezzetleri. Kuzu tandır, çorba ve Anadolu mutfağı.',
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
