# Tandırcı Usta — tandirciusta.com

Next.js 15 · Supabase · Vercel

---

## Kurulum

### 1. Bağımlılıkları kur
```bash
npm install
```

### 2. Supabase
1. [supabase.com](https://supabase.com) → New project
2. SQL Editor → `schema.sql` dosyasını yapıştır → Run
3. Settings → API → URL ve keys'i kopyala

### 3. .env.local oluştur
```bash
cp .env.local.example .env.local
```
Değerleri doldur:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
ADMIN_PASSWORD=güçlü_bir_şifre
```

### 4. Geliştirme sunucusu
```bash
npm run dev
```
→ http://localhost:3000

### 5. Admin paneli
→ http://localhost:3000/admin

---

## Vercel Deploy

```bash
# 1. GitHub'a push et
git init && git add . && git commit -m "init"
git remote add origin https://github.com/kullanici/tandirciusta
git push -u origin main

# 2. vercel.com → Add New Project → import repo
# 3. Environment Variables'a .env.local içindekileri ekle
# 4. Deploy
# 5. Settings → Domains → tandirciusta.com ekle
```

---

## Admin Panel Özellikleri

| Sekme | Ne yapabilirsiniz |
|---|---|
| **Genel Ayarlar** | Telefon, adres, saatler, WhatsApp, Instagram, harita URL |
| **Menü** | Kategori ekle/sil, ürün ekle/düzenle/sil, aktif/pasif |
| **Blog & Tarifler** | Yazı ekle, HTML içerik yapıştır, taslak/yayın |
| **Galeri** | Fotoğraf URL ekle/sil |

---

## Logo Ekleme

`/public/logo.png` olarak ekle, ardından `Nav.tsx` içindeki yorum satırını kaldır.

---

## SEO

- JSON-LD RestaurantSchema otomatik ekli (layout.tsx)
- sitemap.xml → /sitemap.xml
- robots.txt → /robots.txt
- Her blog yazısı için ayrı meta tag otomatik üretilir
