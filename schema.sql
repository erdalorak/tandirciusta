-- ================================================================
-- TANDIRCI USTA — Supabase SQL Schema
-- Supabase Dashboard > SQL Editor > New Query > Run
-- ================================================================

-- 1. Site Ayarları
create table if not exists site_settings (
  key text primary key,
  value text not null default ''
);

insert into site_settings (key, value) values
  ('phone', '+90 XXX XXX XX XX'),
  ('whatsapp', '90XXXXXXXXXX'),
  ('address', 'Ahievran Mah. 738. Sk. No:9, Kırşehir Merkez, 40100'),
  ('maps_embed_url', 'https://maps.google.com/maps?q=Ahievran+Mah+738+Sk+No+9+Kirsehir&t=&z=17&ie=UTF8&iwloc=&output=embed'),
  ('maps_link', 'https://maps.app.goo.gl/KzDooO6U8EcRu1BOn'),
  ('instagram', 'https://instagram.com/tandirciusta'),
  ('hours_weekday', '09:00 – 21:00'),
  ('hours_saturday', '09:00 – 22:00'),
  ('hours_sunday', '10:00 – 21:00'),
  ('hero_title', 'Ateşin Sabrıyla, Ustanın Elleriyle'),
  ('hero_subtitle', 'Geleneksel tandır fırınında, en taze malzemelerle pişirilmiş Anadolu lezzetleri.'),
  ('about_text', 'Tandırcı Usta, Kırşehir''in kalbinde geleneksel Anadolu mutfağını yaşatma idealiyle hizmet vermektedir. Her porsiyonda atalarımızdan öğrendiğimiz sabır ve özenin izlerini taşıyoruz.')
on conflict (key) do nothing;

-- 2. Menü Kategorileri
create table if not exists menu_categories (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  display_order int default 0
);

insert into menu_categories (name, display_order) values
  ('Tandır Çeşitleri', 1),
  ('Çorbalar', 2),
  ('Yanlar & Salatalar', 3),
  ('İçecekler', 4);

-- 3. Menü Ürünleri
create table if not exists menu_items (
  id uuid default gen_random_uuid() primary key,
  category_id uuid references menu_categories(id) on delete cascade,
  name text not null,
  description text default '',
  price text default '',
  is_available boolean default true,
  is_featured boolean default false,
  display_order int default 0
);

-- 4. Blog / Tarifler
create table if not exists blog_posts (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  slug text not null unique,
  content text not null default '',
  excerpt text default '',
  cover_image_url text default '',
  published boolean default false,
  created_at timestamptz default now()
);

-- 5. Galeri
create table if not exists gallery_images (
  id uuid default gen_random_uuid() primary key,
  url text not null,
  caption text default '',
  display_order int default 0
);

-- ================================================================
-- Row Level Security — Sadece yayınlananlar halka açık
-- ================================================================
alter table site_settings enable row level security;
alter table menu_categories enable row level security;
alter table menu_items enable row level security;
alter table blog_posts enable row level security;
alter table gallery_images enable row level security;

create policy "public_read_settings" on site_settings for select using (true);
create policy "public_read_categories" on menu_categories for select using (true);
create policy "public_read_items" on menu_items for select using (is_available = true);
create policy "public_read_posts" on blog_posts for select using (published = true);
create policy "public_read_gallery" on gallery_images for select using (true);
