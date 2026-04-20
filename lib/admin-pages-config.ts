import type { AspectRatio } from '@/components/admin/ImageUploadCrop'

export type FieldType = 'text' | 'textarea' | 'image'

export interface PageField {
  key: string
  label: string
  type: FieldType
  placeholder?: string
  aspectRatio?: AspectRatio
  widthKey?: string
  opacityKey?: string   // image fields — stores 0-100 transparency value
}

export interface PageSection {
  id: string
  title: string
  fields: PageField[]
  previewPath?: string
}

export const PAGE_SECTIONS: PageSection[] = [
  /* ─────────────────────────────────────────
     ANA SAYFA — HERO
  ───────────────────────────────────────── */
  {
    id: 'homepage_hero',
    title: 'Ana Sayfa — Hero',
    previewPath: '/',
    fields: [
      { key: 'hero_image', label: 'Hero Arka Plan Görseli', type: 'image', aspectRatio: '16:9', widthKey: 'hero_image_width', opacityKey: 'hero_image_opacity' },
      { key: 'hero_badge', label: 'Hero Üst Rozet', type: 'text', placeholder: "Kırşehir'in Tandır Ustası · 1965'den Beri" },
      { key: 'hero_title_line1', label: 'Hero Başlık — 1. satır', type: 'text', placeholder: 'Her Ürünü' },
      { key: 'hero_title_line2', label: 'Hero Başlık — 2. satır (italik)', type: 'text', placeholder: 'Ustalık Eseri' },
      { key: 'hero_subtitle', label: 'Hero Alt Metin', type: 'textarea', placeholder: 'Gelenekten doğan ustalık, modern sunumla yeniden hayat bulur.' },
    ],
  },

  /* ─────────────────────────────────────────
     ANA SAYFA — HİKAYEMİZ & İSTATİSTİKLER
  ───────────────────────────────────────── */
  {
    id: 'homepage_about',
    title: 'Ana Sayfa — Hikayemiz',
    previewPath: '/#hakkimizda',
    fields: [
      { key: 'about_image', label: 'Hakkımızda Görseli', type: 'image', aspectRatio: '4:3', widthKey: 'about_image_width', opacityKey: 'about_image_opacity' },
      { key: 'about_eyebrow', label: 'Bölüm Etiketi (üstteki küçük yazı)', type: 'text', placeholder: 'Hikayemiz' },
      { key: 'about_title_line1', label: 'Başlık — 1. kısım', type: 'text', placeholder: 'Gelenekten Gelen' },
      { key: 'about_title_line2', label: 'Başlık — 2. kısım (italik)', type: 'text', placeholder: 'Tat' },
      { key: 'about_text', label: 'Hakkımızda — 1. Paragraf', type: 'textarea', placeholder: "Tandırcı Usta®, Kırşehir'in kalbinde..." },
      { key: 'about_paragraph2', label: 'Hakkımızda — 2. Paragraf', type: 'textarea', placeholder: 'Tandır fırınımız her sabah yakılır...' },
      { key: 'about_paragraph3', label: 'Hakkımızda — 3. Paragraf', type: 'textarea', placeholder: "Aile işletmemiz olarak her müşterimizi misafir..." },
      { key: 'about_stat1_num', label: 'İstatistik 1 — Sayı', type: 'text', placeholder: '10+' },
      { key: 'about_stat1_label', label: 'İstatistik 1 — Etiket', type: 'text', placeholder: 'Yıllık Deneyim' },
      { key: 'about_stat2_num', label: 'İstatistik 2 — Sayı', type: 'text', placeholder: '%100' },
      { key: 'about_stat2_label', label: 'İstatistik 2 — Etiket', type: 'text', placeholder: 'Taze Malzeme' },
      { key: 'about_stat3_num', label: 'İstatistik 3 — Sayı', type: 'text', placeholder: '★4.8' },
      { key: 'about_stat3_label', label: 'İstatistik 3 — Etiket', type: 'text', placeholder: 'Google Puanı' },
    ],
  },

  /* ─────────────────────────────────────────
     ANA SAYFA — BÖLÜM BAŞLIKLARI
  ───────────────────────────────────────── */
  {
    id: 'homepage_sections',
    title: 'Ana Sayfa — Bölüm Başlıkları',
    previewPath: '/',
    fields: [
      { key: 'menu_eyebrow', label: 'Menü — Üst Etiket', type: 'text', placeholder: 'Lezzetlerimiz' },
      { key: 'menu_title', label: 'Menü — Başlık', type: 'text', placeholder: 'Menümüz' },
      { key: 'menu_lead', label: 'Menü — Açıklama', type: 'textarea', placeholder: 'Taze malzemeler, geleneksel tarifler...' },

      { key: 'reviews_eyebrow', label: 'Yorumlar — Üst Etiket', type: 'text', placeholder: 'Müşterilerimiz Ne Diyor?' },
      { key: 'reviews_title', label: 'Yorumlar — Başlık (düz)', type: 'text', placeholder: 'Google' },
      { key: 'reviews_title_em', label: 'Yorumlar — Başlık (italik)', type: 'text', placeholder: 'Yorumları' },
      { key: 'reviews_lead', label: 'Yorumlar — Açıklama', type: 'text', placeholder: 'Gerçek deneyimler, gerçek lezzetler.' },

      { key: 'gallery_eyebrow', label: 'Galeri — Üst Etiket', type: 'text', placeholder: 'Fotoğraflar' },
      { key: 'gallery_title', label: 'Galeri — Başlık (düz)', type: 'text', placeholder: 'Gözlerinizle' },
      { key: 'gallery_title_em', label: 'Galeri — Başlık (italik)', type: 'text', placeholder: 'Tadın' },

      { key: 'brands_eyebrow', label: 'Markalar — Üst Etiket', type: 'text', placeholder: 'Çatımız Altında' },
      { key: 'brands_title', label: 'Markalar — Başlık (düz)', type: 'text', placeholder: 'Diğer' },
      { key: 'brands_title_em', label: 'Markalar — Başlık (italik)', type: 'text', placeholder: 'Markalarımız' },
      { key: 'brands_lead', label: 'Markalar — Açıklama', type: 'text', placeholder: 'Tandırcı Usta® ailesinin büyüyen vizyonu.' },

      { key: 'blog_eyebrow', label: 'Blog — Üst Etiket', type: 'text', placeholder: 'Blog & Tarifler' },
      { key: 'blog_title', label: 'Blog — Başlık (düz)', type: 'text', placeholder: 'Son' },
      { key: 'blog_title_em', label: 'Blog — Başlık (italik)', type: 'text', placeholder: 'Yazılarımız' },

      { key: 'instagram_eyebrow', label: 'Instagram — Üst Etiket', type: 'text', placeholder: 'Sosyal Medya' },
      { key: 'instagram_title', label: 'Instagram — Başlık (düz)', type: 'text', placeholder: 'Bizi' },
      { key: 'instagram_title_em', label: 'Instagram — Başlık (italik)', type: 'text', placeholder: 'Takip Edin' },
      { key: 'instagram_lead', label: 'Instagram — Açıklama', type: 'text', placeholder: "Instagram'da günlük paylaşımlarımızı takip edin." },
      { key: 'instagram_handle', label: 'Instagram — Buton Yazısı', type: 'text', placeholder: '@tandirciusta — Takip Et' },

      { key: 'rezervasyon_eyebrow', label: 'Rezervasyon — Üst Etiket', type: 'text', placeholder: 'Hemen Başlayın' },
      { key: 'rezervasyon_title', label: 'Rezervasyon — Başlık (düz)', type: 'text', placeholder: 'Rezervasyon &' },
      { key: 'rezervasyon_title_em', label: 'Rezervasyon — Başlık (italik)', type: 'text', placeholder: 'Talep' },
      { key: 'rezervasyon_lead', label: 'Rezervasyon — Açıklama', type: 'textarea', placeholder: 'Masa rezervasyonu, catering talebi...' },
    ],
  },

  /* ─────────────────────────────────────────
     ANA SAYFA — GOOGLE YORUMLARI
  ───────────────────────────────────────── */
  {
    id: 'homepage_reviews',
    title: 'Ana Sayfa — Yorum Kartları',
    previewPath: '/#yorumlar',
    fields: [
      { key: 'review1_name', label: 'Yorum 1 — İsim', type: 'text', placeholder: 'Musa Akkuş' },
      { key: 'review1_date', label: 'Yorum 1 — Tarih', type: 'text', placeholder: '8 ay önce' },
      { key: 'review1_text', label: 'Yorum 1 — Metin', type: 'textarea', placeholder: 'Kelle paça çorbası ve tandır harika...' },

      { key: 'review2_name', label: 'Yorum 2 — İsim', type: 'text', placeholder: 'Emre Sadıkoğlu' },
      { key: 'review2_date', label: 'Yorum 2 — Tarih', type: 'text', placeholder: '7 ay önce' },
      { key: 'review2_text', label: 'Yorum 2 — Metin', type: 'textarea', placeholder: 'Kelle paça çorbası ve kuzu tandırını çok beğendik...' },

      { key: 'review3_name', label: 'Yorum 3 — İsim', type: 'text', placeholder: 'Bahar Gülsever' },
      { key: 'review3_date', label: 'Yorum 3 — Tarih', type: 'text', placeholder: 'Bir yıl önce' },
      { key: 'review3_text', label: 'Yorum 3 — Metin', type: 'textarea', placeholder: "Kırşehir'de adam akıllı yemek yenilecek bir yer bulduk..." },

      { key: 'review4_name', label: 'Yorum 4 — İsim', type: 'text', placeholder: 'Alper Gümuş' },
      { key: 'review4_date', label: 'Yorum 4 — Tarih', type: 'text', placeholder: '2 yıl önce' },
      { key: 'review4_text', label: 'Yorum 4 — Metin', type: 'textarea', placeholder: 'Tandırı bu şehre kazandıran sevgili Erdem abi...' },

      { key: 'review5_name', label: 'Yorum 5 — İsim', type: 'text', placeholder: 'Bircan Mert' },
      { key: 'review5_date', label: 'Yorum 5 — Tarih', type: 'text', placeholder: '3 ay önce' },
      { key: 'review5_text', label: 'Yorum 5 — Metin', type: 'textarea', placeholder: 'Kaliteli ve güler yüzlü hizmet için çok teşekkür ederiz.' },

      { key: 'review6_name', label: 'Yorum 6 — İsim', type: 'text', placeholder: 'Gamze Saatçi' },
      { key: 'review6_date', label: 'Yorum 6 — Tarih', type: 'text', placeholder: 'Bir yıl önce' },
      { key: 'review6_text', label: 'Yorum 6 — Metin', type: 'textarea', placeholder: 'İncik haşlama benim favorim!...' },
    ],
  },

  /* ─────────────────────────────────────────
     ANA SAYFA — MARKA KARTI (İLİKYA)
  ───────────────────────────────────────── */
  {
    id: 'homepage_brand',
    title: 'Ana Sayfa — Marka Kartı',
    previewPath: '/#markalar',
    fields: [
      { key: 'brand_ilikya_title', label: 'Marka Adı', type: 'text', placeholder: 'İlikya' },
      { key: 'brand_ilikya_desc', label: 'Marka Açıklaması', type: 'textarea', placeholder: 'Dana kemiklerinden elde edilen doğal ve katkısız ilik suyu...' },
      { key: 'brand_ilikya_tag', label: 'Marka Etiketi', type: 'text', placeholder: 'Yakında →' },
    ],
  },

  /* ─────────────────────────────────────────
     İLİKYA — HERO & CTA
  ───────────────────────────────────────── */
  {
    id: 'ilikya_hero',
    title: 'İlikya — Hero & CTA',
    previewPath: '/ilikya',
    fields: [
      { key: 'ilikya_hero_image', label: 'İlikya Hero Arka Plan Görseli', type: 'image', aspectRatio: '16:9', widthKey: 'ilikya_hero_image_width', opacityKey: 'ilikya_hero_image_opacity' },
      { key: 'ilikya_hero_subbrand', label: 'Üst Etiket (marka referansı)', type: 'text', placeholder: 'Tandırcı Usta® Ailesinden' },
      { key: 'ilikya_hero_title_line1', label: 'Hero Başlık — 1. satır', type: 'text', placeholder: 'Doğal ve Katkısız' },
      { key: 'ilikya_hero_title_line2', label: 'Hero Başlık — 2. satır (italik)', type: 'text', placeholder: 'İlik Suyu' },
      { key: 'ilikya_hero_subtitle', label: 'Hero Alt Metin', type: 'textarea', placeholder: 'Dana kemiklerinden geleneksel yöntemlerle elde edilen...' },
      { key: 'ilikya_hero_btn_order', label: 'Sipariş Butonu Yazısı', type: 'text', placeholder: 'Sipariş & Bilgi Al' },
      { key: 'ilikya_series_eyebrow', label: 'Ürün Serisi — Üst Etiket', type: 'text', placeholder: 'Ürün Gamı' },
      { key: 'ilikya_series_title', label: 'Ürün Serisi — Başlık (düz)', type: 'text', placeholder: '6 Farklı' },
      { key: 'ilikya_series_title_em', label: 'Ürün Serisi — Başlık (italik)', type: 'text', placeholder: 'Seri' },
      { key: 'ilikya_series_lead', label: 'Ürün Serisi — Açıklama', type: 'text', placeholder: 'Her ihtiyaca özel, özenle formüle edilmiş ilik suyu serileri.' },
      { key: 'ilikya_features_eyebrow', label: 'Özellikler — Üst Etiket', type: 'text', placeholder: 'Neden İlikya?' },
      { key: 'ilikya_features_title', label: 'Özellikler — Başlık (düz)', type: 'text', placeholder: 'Fark Yaratan' },
      { key: 'ilikya_features_title_em', label: 'Özellikler — Başlık (italik)', type: 'text', placeholder: 'Özellikler' },
      { key: 'ilikya_audience_eyebrow', label: 'Hedef Kitle — Üst Etiket', type: 'text', placeholder: 'Kimler İçin?' },
      { key: 'ilikya_audience_title', label: 'Hedef Kitle — Başlık (düz)', type: 'text', placeholder: 'İlikya ile' },
      { key: 'ilikya_audience_title_em', label: 'Hedef Kitle — Başlık (italik)', type: 'text', placeholder: 'Sağlıklı Yaşam' },
      { key: 'ilikya_cta_heading', label: 'CTA — Başlık', type: 'text', placeholder: 'İlikya ile Tanışmaya Hazır mısınız?' },
      { key: 'ilikya_cta_description', label: 'CTA — Açıklama', type: 'textarea', placeholder: 'Yakında sipariş ve toptan satış için web sitemiz aktif olacak...' },
      { key: 'ilikya_cta_button', label: 'CTA — Buton Yazısı', type: 'text', placeholder: 'WhatsApp ile Sipariş Ver' },
    ],
  },

  /* ─────────────────────────────────────────
     İLİKYA — ÜRÜN SERİLERİ
  ───────────────────────────────────────── */
  {
    id: 'ilikya_seriler',
    title: 'İlikya — Ürün Serileri',
    previewPath: '/ilikya',
    fields: [
      { key: 'ilikya_seri1_ad', label: 'Seri 1 — Adı', type: 'text', placeholder: 'Geleneksel Seri' },
      { key: 'ilikya_seri1_aciklama', label: 'Seri 1 — Açıklama', type: 'textarea', placeholder: 'Atalarımızdan öğrendiğimiz geleneksel kemik suyu tarifi...' },
      { key: 'ilikya_seri2_ad', label: 'Seri 2 — Adı', type: 'text', placeholder: 'Bağışıklık Destek Serisi' },
      { key: 'ilikya_seri2_aciklama', label: 'Seri 2 — Açıklama', type: 'textarea', placeholder: 'Bağışıklık sistemini güçlendiren özel aromatik karışım...' },
      { key: 'ilikya_seri3_ad', label: 'Seri 3 — Adı', type: 'text', placeholder: 'Detoks Serisi' },
      { key: 'ilikya_seri3_aciklama', label: 'Seri 3 — Açıklama', type: 'textarea', placeholder: 'Vücudu arındıran, sindirimi destekleyen...' },
      { key: 'ilikya_seri4_ad', label: 'Seri 4 — Adı', type: 'text', placeholder: 'Sporcu Serisi' },
      { key: 'ilikya_seri4_aciklama', label: 'Seri 4 — Açıklama', type: 'textarea', placeholder: 'Kas ve eklem sağlığını destekleyen...' },
      { key: 'ilikya_seri5_ad', label: 'Seri 5 — Adı', type: 'text', placeholder: 'Çocuklar İçin Özel Seri' },
      { key: 'ilikya_seri5_aciklama', label: 'Seri 5 — Açıklama', type: 'textarea', placeholder: 'Çocukların gelişimini destekleyen...' },
      { key: 'ilikya_seri6_ad', label: 'Seri 6 — Adı', type: 'text', placeholder: 'Şifa Serisi' },
      { key: 'ilikya_seri6_aciklama', label: 'Seri 6 — Açıklama', type: 'textarea', placeholder: 'Kronik rahatsızlıklara doğal destek...' },
    ],
  },

  /* ─────────────────────────────────────────
     İLİKYA — ÖZELLİKLER & HEDEF KİTLE
  ───────────────────────────────────────── */
  {
    id: 'ilikya_ozellikler',
    title: 'İlikya — Özellikler & Hedef Kitle',
    previewPath: '/ilikya',
    fields: [
      { key: 'ilikya_ozellik1_baslik', label: 'Özellik 1 — Başlık', type: 'text', placeholder: 'Doğal & Katkısız' },
      { key: 'ilikya_ozellik1_aciklama', label: 'Özellik 1 — Açıklama', type: 'text', placeholder: 'Hiçbir yapay katkı maddesi, sadece doğanın gücü' },
      { key: 'ilikya_ozellik2_baslik', label: 'Özellik 2 — Başlık', type: 'text', placeholder: 'Cam Kavanoz' },
      { key: 'ilikya_ozellik2_aciklama', label: 'Özellik 2 — Açıklama', type: 'text', placeholder: 'Sağlığa zararlı plastikten uzak, sürdürülebilir ambalaj' },
      { key: 'ilikya_ozellik3_baslik', label: 'Özellik 3 — Başlık', type: 'text', placeholder: 'Soğuk Zincir' },
      { key: 'ilikya_ozellik3_aciklama', label: 'Özellik 3 — Açıklama', type: 'text', placeholder: 'Üretimden teslimata tam soğuk zincir güvencesi' },
      { key: 'ilikya_ozellik4_baslik', label: 'Özellik 4 — Başlık', type: 'text', placeholder: 'Yüksek Kolajen' },
      { key: 'ilikya_ozellik4_aciklama', label: 'Özellik 4 — Açıklama', type: 'text', placeholder: 'Cilt, eklem ve bağırsak sağlığı için doğal kolajen kaynağı' },
      { key: 'ilikya_ozellik5_baslik', label: 'Özellik 5 — Başlık', type: 'text', placeholder: '6 Farklı Aroma' },
      { key: 'ilikya_ozellik5_aciklama', label: 'Özellik 5 — Açıklama', type: 'text', placeholder: 'Her ihtiyaca özel özenle geliştirilmiş aroma seçenekleri' },
      { key: 'ilikya_ozellik6_baslik', label: 'Özellik 6 — Başlık', type: 'text', placeholder: 'Hijyenik Üretim' },
      { key: 'ilikya_ozellik6_aciklama', label: 'Özellik 6 — Açıklama', type: 'text', placeholder: 'Endüstriyel sterilizasyon tüneli ile titiz üretim süreci' },

      { key: 'ilikya_hedef1_baslik', label: 'Hedef Kitle 1 — Başlık', type: 'text', placeholder: 'Ebeveynler' },
      { key: 'ilikya_hedef1_aciklama', label: 'Hedef Kitle 1 — Açıklama', type: 'textarea', placeholder: 'Çocuklarının gelişimini doğal ve katkısız kaynaklarla...' },
      { key: 'ilikya_hedef2_baslik', label: 'Hedef Kitle 2 — Başlık', type: 'text', placeholder: 'Sporcular' },
      { key: 'ilikya_hedef2_aciklama', label: 'Hedef Kitle 2 — Açıklama', type: 'textarea', placeholder: 'Kas ve eklem sağlığını korumayı...' },
      { key: 'ilikya_hedef3_baslik', label: 'Hedef Kitle 3 — Başlık', type: 'text', placeholder: 'Sağlıklı Yaşam Tutkunları' },
      { key: 'ilikya_hedef3_aciklama', label: 'Hedef Kitle 3 — Açıklama', type: 'textarea', placeholder: 'Yapay tatlandırıcılardan kaçınan...' },
      { key: 'ilikya_hedef4_baslik', label: 'Hedef Kitle 4 — Başlık', type: 'text', placeholder: 'İyileşme Sürecindekiler' },
      { key: 'ilikya_hedef4_aciklama', label: 'Hedef Kitle 4 — Açıklama', type: 'textarea', placeholder: 'Doğal ve kolay sindirilebilir takviyeyle...' },
      { key: 'ilikya_hedef5_baslik', label: 'Hedef Kitle 5 — Başlık', type: 'text', placeholder: 'Cilt & Eklem Sağlığı' },
      { key: 'ilikya_hedef5_aciklama', label: 'Hedef Kitle 5 — Açıklama', type: 'textarea', placeholder: 'Kolajen içeriğiyle cilt elastikiyetini...' },
      { key: 'ilikya_hedef6_baslik', label: 'Hedef Kitle 6 — Başlık', type: 'text', placeholder: 'Restoranlar & Kafeler' },
      { key: 'ilikya_hedef6_aciklama', label: 'Hedef Kitle 6 — Açıklama', type: 'textarea', placeholder: 'Menülerine doğal ve kaliteli et suyu eklemek...' },
    ],
  },

  /* ─────────────────────────────────────────
     İLETİŞİM & KONUM
  ───────────────────────────────────────── */
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

  /* ─────────────────────────────────────────
     ÇALIŞMA SAATLERİ
  ───────────────────────────────────────── */
  {
    id: 'hours',
    title: 'Çalışma Saatleri',
    fields: [
      { key: 'hours_weekday', label: 'Hf. İçi', type: 'text', placeholder: '09:00 – 21:00' },
      { key: 'hours_saturday', label: 'Cumartesi', type: 'text', placeholder: '09:00 – 22:00' },
      { key: 'hours_sunday', label: 'Pazar', type: 'text', placeholder: '10:00 – 21:00' },
    ],
  },

  /* ─────────────────────────────────────────
     FOOTER & GENEL
  ───────────────────────────────────────── */
  {
    id: 'footer_genel',
    title: 'Footer & Genel',
    fields: [
      { key: 'footer_description', label: 'Footer Açıklaması', type: 'textarea', placeholder: "Kırşehir'in geleneksel tandır restoranı. Ateşin sabrıyla, ustanın elleriyle pişirilmiş Anadolu lezzetleri." },
      { key: 'site_title_badge', label: 'Site Genel — Kısa Slogan', type: 'text', placeholder: '#MesleğinPîri' },
    ],
  },
]
