import type { AspectRatio } from '@/components/admin/ImageUploadCrop'

export type FieldType = 'text' | 'textarea' | 'image'

export interface PageField {
  key: string
  label: string
  type: FieldType
  placeholder?: string
  aspectRatio?: AspectRatio   // only for image fields
  widthKey?: string           // settings key to store display width (e.g. "hero_image_width")
}

export interface PageSection {
  id: string
  title: string
  fields: PageField[]
  previewPath?: string        // e.g. "/" or "/ilikya"
}

export const PAGE_SECTIONS: PageSection[] = [
  {
    id: 'homepage_hero',
    title: 'Ana Sayfa — Hero',
    previewPath: '/',
    fields: [
      { key: 'hero_image', label: 'Hero Arka Plan Görseli', type: 'image', aspectRatio: '16:9', widthKey: 'hero_image_width' },
      { key: 'hero_title', label: 'Başlık', type: 'text', placeholder: 'Her Ürünü Ustalık Eseri' },
      { key: 'hero_subtitle', label: 'Alt Başlık', type: 'textarea', placeholder: 'Gelenekten doğan ustalık...' },
    ],
  },
  {
    id: 'homepage_about',
    title: 'Ana Sayfa — Hakkımızda',
    previewPath: '/#hakkimizda',
    fields: [
      { key: 'about_image', label: 'Hakkımızda Görseli', type: 'image', aspectRatio: '4:3', widthKey: 'about_image_width' },
      { key: 'about_text', label: 'Hakkımızda Metni', type: 'textarea', placeholder: 'Tandırcı Usta, Kırşehir\'in kalbinde...' },
    ],
  },
  {
    id: 'ilikya_hero',
    title: 'İlikya — Hero',
    previewPath: '/ilikya',
    fields: [
      { key: 'ilikya_hero_image', label: 'İlikya Hero Görseli', type: 'image', aspectRatio: '16:9', widthKey: 'ilikya_hero_image_width' },
      { key: 'ilikya_hero_title', label: 'İlikya Başlık', type: 'text', placeholder: 'Doğal ve Katkısız İlik Suyu' },
      { key: 'ilikya_hero_subtitle', label: 'İlikya Alt Başlık', type: 'textarea', placeholder: 'Dana kemiklerinden...' },
    ],
  },
  {
    id: 'contact',
    title: 'İletişim & Konum',
    previewPath: '/#iletisim',
    fields: [
      { key: 'phone', label: 'Telefon', type: 'text', placeholder: '+90 XXX XXX XX XX' },
      { key: 'whatsapp', label: 'WhatsApp (başında 90)', type: 'text', placeholder: '905XXXXXXXXX' },
      { key: 'address', label: 'Adres', type: 'textarea', placeholder: 'Ahievran Mah. 738. Sk. No:9, Kırşehir' },
      { key: 'maps_embed_url', label: 'Google Maps Embed URL', type: 'text', placeholder: 'https://maps.google.com/maps?q=...' },
      { key: 'maps_link', label: 'Google Maps Yol Tarifi Linki', type: 'text', placeholder: 'https://maps.app.goo.gl/...' },
      { key: 'instagram', label: 'Instagram Linki', type: 'text', placeholder: 'https://instagram.com/tandirciusta' },
    ],
  },
  {
    id: 'hours',
    title: 'Çalışma Saatleri',
    fields: [
      { key: 'hours_weekday', label: 'Hf. İçi', type: 'text', placeholder: '09:00 – 21:00' },
      { key: 'hours_saturday', label: 'Cumartesi', type: 'text', placeholder: '09:00 – 22:00' },
      { key: 'hours_sunday', label: 'Pazar', type: 'text', placeholder: '10:00 – 21:00' },
    ],
  },
]
