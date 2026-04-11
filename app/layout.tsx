import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://tandirciusta.com'),
  title: {
    default: 'Tandırcı Usta | Kırşehir Tandır Restoranı',
    template: '%s | Tandırcı Usta Kırşehir',
  },
  description: 'Kırşehir\'in en iyi tandır restoranı. Kuzu tandır, tavuk tandır, çorba, geleneksel Anadolu yemekleri. Kırşehir lokanta, Kırşehir restoran, Kırşehir yemek. Ahievran Mah. 738. Sk. No:9',
  keywords: [
    'Kırşehir tandır', 'Kırşehir restoran', 'Kırşehir lokanta',
    'Kırşehir yemek', 'Kırşehir et', 'Kırşehir çorba',
    'kuzu tandır Kırşehir', 'tandır restoranı Kırşehir',
    'Kırşehir nerede yemek yenir', 'Kırşehir merkez restoran',
    'Tandırcı Usta', 'Kırşehir Anadolu mutfağı',
  ],
  authors: [{ name: 'Tandırcı Usta' }],
  creator: 'Tandırcı Usta',
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    url: 'https://tandirciusta.com',
    siteName: 'Tandırcı Usta',
    title: 'Tandırcı Usta | Kırşehir\'in En İyi Tandır Restoranı',
    description: 'Geleneksel tandır fırınında pişirilmiş kuzu, tavuk ve Anadolu lezzetleri. Kırşehir\'de hizmetinizdeyiz.',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Tandırcı Usta Kırşehir' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tandırcı Usta | Kırşehir Tandır',
    description: 'Kırşehir\'de geleneksel tandır lezzetleri.',
    images: ['/og-image.jpg'],
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 } },
  alternates: { canonical: 'https://tandirciusta.com' },
  icons: {
    icon: '/icon.ico',
    apple: '/apple-icon.png',
  },
  verification: {
    google: '1Ui2ESAlJRKjxHhQjGs3eiJjw_qr-q2vHHXVVLugVgY',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Restaurant',
  name: 'Tandırcı Usta',
  description: 'Kırşehir\'de geleneksel tandır restoranı. Kuzu tandır, tavuk tandır, çorba.',
  url: 'https://tandirciusta.com',
  image: 'https://tandirciusta.com/og-image.jpg',
  servesCuisine: ['Turkish', 'Anatolian'],
  priceRange: '₺₺',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Ahievran Mah. 738. Sk. No:9',
    addressLocality: 'Kırşehir Merkez',
    postalCode: '40100',
    addressCountry: 'TR',
  },
  geo: { '@type': 'GeoCoordinates', latitude: 39.1454, longitude: 34.1631 },
  openingHoursSpecification: [
    { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday','Tuesday','Wednesday','Thursday','Friday'], opens: '09:00', closes: '21:00' },
    { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Saturday'], opens: '09:00', closes: '22:00' },
    { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Sunday'], opens: '10:00', closes: '21:00' },
  ],
  sameAs: ['https://instagram.com/tandirciusta'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  )
}
