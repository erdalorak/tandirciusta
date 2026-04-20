'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import dynamic from 'next/dynamic'
import { PAGE_SECTIONS } from '@/lib/admin-pages-config'

const ImageUploadCrop = dynamic(() => import('@/components/admin/ImageUploadCrop'), { ssr: false })
const RichEditor = dynamic(() => import('@/components/admin/RichEditor'), { ssr: false })

const TABS = ['Dashboard', 'Sayfalar', 'Menü', 'Blog & Tarifler', 'Galeri', 'Talepler', 'İstatistikler'] as const
type Tab = typeof TABS[number]

type Post = { id: string; title: string; slug: string; published: boolean; created_at: string; excerpt: string; post_type?: string }
type FullPost = Post & { content: string; cover_image_url: string; recipe_data: RecipeData | null; meta_title?: string; meta_description?: string }
type RecipeData = {
  prep_time: string; cook_time: string; servings: string; difficulty: string
  ingredients: string[]; steps: string[]; tips: string
}
type VisitRow = { id: string; ip: string; country: string | null; country_code: string | null; city: string | null; region: string | null; page: string | null; referrer: string | null; user_agent: string | null; created_at: string }
type Category = { id: string; name: string; display_order: number }
type Item = { id: string; category_id: string; name: string; description: string; price: string; image_url: string; is_available: boolean; is_featured: boolean; display_order: number }
type GalleryImg = { id: string; url: string; caption: string; display_order: number }
type Settings = Record<string, string>

const SETTING_FIELDS = [
  { key: 'phone', label: 'Telefon', placeholder: '+90 XXX XXX XX XX' },
  { key: 'whatsapp', label: 'WhatsApp Numarası (başında 90)', placeholder: '905XXXXXXXXX' },
  { key: 'address', label: 'Tam Adres', placeholder: 'Ahievran Mah. 738. Sk. No:9, Kırşehir' },
  { key: 'maps_embed_url', label: 'Google Maps Embed URL', placeholder: 'https://maps.google.com/maps?q=...' },
  { key: 'maps_link', label: 'Google Maps Yol Tarifi Linki', placeholder: 'https://maps.app.goo.gl/...' },
  { key: 'instagram', label: 'Instagram Linki', placeholder: 'https://instagram.com/tandirciusta' },
  { key: 'hours_weekday', label: 'Hf. İçi Saatler', placeholder: '09:00 – 21:00' },
  { key: 'hours_saturday', label: 'Cumartesi Saatleri', placeholder: '09:00 – 22:00' },
  { key: 'hours_sunday', label: 'Pazar Saatleri', placeholder: '10:00 – 21:00' },
  { key: 'hero_title', label: 'Ana Sayfa Başlığı', placeholder: 'Ateşin Sabrıyla, Ustanın Elleriyle' },
  { key: 'hero_subtitle', label: 'Ana Sayfa Alt Başlığı', placeholder: 'Geleneksel tandır fırınında...' },
  { key: 'about_text', label: 'Hakkımızda Metni', placeholder: 'Tandırcı Usta, Kırşehir\'in kalbinde...' },
]

const defaultRecipe = (): RecipeData => ({
  prep_time: '', cook_time: '', servings: '', difficulty: 'Orta',
  ingredients: [''], steps: [''], tips: '',
})

function useAdminFetch(key: string, adminKey: string) {
  const keyRef = useRef(adminKey)
  useEffect(() => { keyRef.current = adminKey }, [adminKey])
  const request = useCallback(async (url: string, opts?: RequestInit) => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json', 'x-admin-key': keyRef.current }
    const r = await fetch(url, { ...opts, headers })
    const data = await r.json()
    if (!r.ok) throw new Error(data?.error || `HTTP ${r.status}`)
    return data
  }, [])
  const get = useCallback((url: string) => request(url), [request])
  const post = useCallback((url: string, body: unknown) => request(url, { method: 'POST', body: JSON.stringify(body) }), [request])
  const put = useCallback((url: string, body: unknown) => request(url, { method: 'PUT', body: JSON.stringify(body) }), [request])
  const del = useCallback((url: string, body?: unknown) => request(url, { method: 'DELETE', body: body ? JSON.stringify(body) : undefined }), [request])
  void key
  return { get, post, put, del }
}

// ── DASHBOARD ────────────────────────────────────────────────────

function DashboardTab({ adminKey, onNavigate }: { adminKey: string; onNavigate: (tab: Tab) => void }) {
  const { get } = useAdminFetch('dashboard', adminKey)
  const [stats, setStats] = useState({ posts: 0, gallery: 0, requests: 0, newRequests: 0, menuItems: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [posts, gallery, menu, requests] = await Promise.all([
          get('/api/posts').catch(() => []),
          get('/api/gallery').catch(() => []),
          get('/api/menu').catch(() => ({ items: [] })),
          fetch('/api/requests', { headers: { 'x-admin-key': adminKey } }).then(r => r.json()).catch(() => []),
        ])
        setStats({
          posts: Array.isArray(posts) ? posts.length : 0,
          gallery: Array.isArray(gallery) ? gallery.length : 0,
          menuItems: Array.isArray(menu?.items) ? menu.items.length : 0,
          requests: Array.isArray(requests) ? requests.length : 0,
          newRequests: Array.isArray(requests) ? requests.filter((r: Record<string, unknown>) => r.status === 'yeni').length : 0,
        })
      } finally { setLoading(false) }
    }
    load()
  }, [get, adminKey])

  const today = new Date().toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  const StatCard = ({ icon, label, value, color, badge }: { icon: React.ReactNode; label: string; value: number; color: string; badge?: number }) => (
    <div className="admin-card" style={{ margin: 0, padding: '20px 22px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 32, fontWeight: 800, color, lineHeight: 1, letterSpacing: -1 }}>
            {loading ? '–' : value}
          </div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 5, fontWeight: 500 }}>{label}</div>
          {badge !== undefined && badge > 0 && (
            <span className="badge badge-red" style={{ marginTop: 6, display: 'inline-block' }}>{badge} Yeni</span>
          )}
        </div>
        <div style={{ background: `${color}15`, borderRadius: 10, padding: 10, flexShrink: 0 }}>
          <div style={{ color, width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</div>
        </div>
      </div>
    </div>
  )

  const QuickBtn = ({ icon, label, tab, color }: { icon: string; label: string; tab: Tab; color: string }) => (
    <button
      onClick={() => onNavigate(tab)}
      style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px',
        background: 'var(--bg)', border: `1.5px solid var(--border-g)`, borderRadius: 10,
        cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'var(--sans)', textAlign: 'left',
        flex: '1 1 180px',
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = color; (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 4px 16px ${color}20` }}
      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-g)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none' }}
    >
      <span style={{ fontSize: 24 }}>{icon}</span>
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--black)' }}>{label}</div>
        <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>Hızlı erişim</div>
      </div>
    </button>
  )

  return (
    <div>
      <div className="admin-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div className="admin-page-title">Hoş geldiniz 👋</div>
            <div className="admin-page-sub">{today}</div>
          </div>
          <a href="/" target="_blank" rel="noopener" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--muted)', textDecoration: 'none', padding: '7px 14px', border: '1.5px solid var(--border-g)', borderRadius: 8, fontWeight: 600 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            Siteyi Gör
          </a>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14, marginBottom: 24 }}>
        <StatCard icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>} label="Blog & Tarif Yazısı" value={stats.posts} color="var(--red)" />
        <StatCard icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>} label="Menü Ürünü" value={stats.menuItems} color="#f59e0b" />
        <StatCard icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>} label="Galeri Fotoğrafı" value={stats.gallery} color="#10b981" />
        <StatCard icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>} label="Talep" value={stats.requests} color="#6366f1" badge={stats.newRequests} />
      </div>

      <div className="admin-card">
        <div className="admin-card-title">Hızlı İşlemler</div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <QuickBtn icon="✍️" label="Yeni Yazı / Tarif" tab="Blog & Tarifler" color="var(--red)" />
          <QuickBtn icon="🍽️" label="Menü Düzenle" tab="Menü" color="#f59e0b" />
          <QuickBtn icon="🖼️" label="Galeri Yükle" tab="Galeri" color="#10b981" />
          <QuickBtn icon="📋" label="Talepleri Gör" tab="Talepler" color="#6366f1" />
          <QuickBtn icon="📄" label="Sayfa Düzenle" tab="Sayfalar" color="#06b6d4" />
        </div>
      </div>

      <div className="admin-card" style={{ background: 'linear-gradient(135deg, #1c1c1e 0%, #2d2d2d 100%)', borderColor: 'transparent' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: 12 }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="14" width="4" height="8" rx="1" fill="white" opacity="0.5"/>
              <rect x="9" y="8" width="4" height="14" rx="1" fill="white" opacity="0.75"/>
              <rect x="16" y="3" width="4" height="19" rx="1" fill="white"/>
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>Detaylı Analitik</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 3 }}>Ziyaretçi istatistiklerini görmek için İstatistikler sekmesini kullanın</div>
          </div>
          <button onClick={() => onNavigate('İstatistikler')} style={{ background: 'var(--red)', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 12, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
            Görüntüle →
          </button>
        </div>
      </div>
    </div>
  )
}

// ── SETTINGS ─────────────────────────────────────────────────────

function SettingsTab({ adminKey }: { adminKey: string }) {
  const { get, post } = useAdminFetch('settings', adminKey)
  const [settings, setSettings] = useState<Settings>({})
  const [msg, setMsg] = useState('')
  const [saving, setSaving] = useState(false)
  useEffect(() => { get('/api/settings').then(setSettings) }, [get])
  const save = async () => {
    setSaving(true)
    const res = await post('/api/settings', settings)
    setMsg(res.ok ? 'Kaydedildi ✓' : `Hata: ${res.error}`)
    setSaving(false)
    setTimeout(() => setMsg(''), 3000)
  }
  return (
    <div>
      <div className="admin-header">
        <div className="admin-page-title">Genel Ayarlar</div>
        <div className="admin-page-sub">İletişim bilgileri, çalışma saatleri ve site metinleri.</div>
      </div>
      <div className="admin-card">
        <div className="admin-form">
          {SETTING_FIELDS.map(f => (
            <div key={f.key}>
              <label>{f.label}</label>
              {f.key === 'about_text' ? (
                <textarea value={settings[f.key] || ''} placeholder={f.placeholder} onChange={e => setSettings(s => ({ ...s, [f.key]: e.target.value }))} style={{ minHeight: 100 }} />
              ) : (
                <input type="text" value={settings[f.key] || ''} placeholder={f.placeholder} onChange={e => setSettings(s => ({ ...s, [f.key]: e.target.value }))} />
              )}
            </div>
          ))}
          <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
            <button className="admin-btn admin-btn-red" onClick={save} disabled={saving}>{saving ? 'Kaydediliyor...' : 'Kaydet'}</button>
            {msg && <span className={`admin-msg ${msg.startsWith('H') ? 'error' : 'success'}`}>{msg}</span>}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── MENU ─────────────────────────────────────────────────────────

function MenuTab({ adminKey }: { adminKey: string }) {
  const { get, post, put, del } = useAdminFetch('menu', adminKey)
  const [categories, setCategories] = useState<Category[]>([])
  const [items, setItems] = useState<Item[]>([])
  const [newCat, setNewCat] = useState('')
  const [form, setForm] = useState({ category_id: '', name: '', description: '', price: '', image_url: '', is_featured: false })
  const [editItem, setEditItem] = useState<Item | null>(null)
  const [msg, setMsg] = useState('')
  const [uploading, setUploading] = useState(false)
  const catInitialized = useRef(false)
  const dragItem = useRef<string | null>(null)
  const dragOver = useRef<string | null>(null)

  const load = useCallback(async () => {
    try {
      const data = await get('/api/menu')
      setCategories(data.categories ?? [])
      setItems(data.items ?? [])
      if (data.categories?.length && !catInitialized.current) {
        catInitialized.current = true
        setForm(f => ({ ...f, category_id: data.categories[0].id }))
      }
    } catch (e: unknown) { console.error('Menü yüklenemedi:', e) }
  }, [get])

  useEffect(() => { load() }, [load])
  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 5000) }

  const addCat = async () => {
    if (!newCat.trim()) return
    await post('/api/menu', { type: 'category', name: newCat, display_order: categories.length + 1 })
    setNewCat(''); load()
  }
  const deleteCat = async (id: string) => {
    if (!confirm('Kategoriyi ve içindeki tüm ürünleri sil?')) return
    await del(`/api/menu/${id}`, { type: 'category' }); load()
  }
  const uploadImage = async (file: File, onDone: (url: string) => void) => {
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    try {
      const res = await fetch('/api/upload', { method: 'POST', headers: { 'x-admin-key': adminKey }, body: fd })
      const data = await res.json()
      if (!data.error) onDone(data.url)
      else flash('Yükleme hatası: ' + data.error)
    } finally { setUploading(false) }
  }
  const addItem = async () => {
    if (!form.name.trim()) { flash('Ürün adı zorunlu'); return }
    if (!form.category_id) { flash('Önce bir kategori seçin'); return }
    try {
      const payload: Record<string, unknown> = { type: 'item', category_id: form.category_id, name: form.name.trim(), description: form.description, price: form.price, is_available: true, is_featured: form.is_featured, display_order: items.length + 1 }
      if (form.image_url) payload.image_url = form.image_url
      await post('/api/menu', payload)
      setForm(f => ({ ...f, name: '', description: '', price: '', image_url: '', is_featured: false }))
      load(); flash('Ürün eklendi ✓')
    } catch (e: unknown) { flash('Hata: ' + (e instanceof Error ? e.message : String(e))) }
  }
  const toggleAvailable = async (item: Item) => {
    try { await put(`/api/menu/${item.id}`, { type: 'item', is_available: !item.is_available }); load() }
    catch (e: unknown) { flash('Hata: ' + (e instanceof Error ? e.message : String(e))) }
  }
  const saveEdit = async () => {
    if (!editItem) return
    try {
      const payload: Record<string, unknown> = { type: 'item', name: editItem.name, description: editItem.description, price: editItem.price, is_featured: editItem.is_featured, is_available: editItem.is_available, category_id: editItem.category_id }
      if (editItem.image_url) payload.image_url = editItem.image_url
      await put(`/api/menu/${editItem.id}`, payload)
      setEditItem(null); load(); flash('Güncellendi ✓')
    } catch (e: unknown) { flash('Hata: ' + (e instanceof Error ? e.message : String(e))) }
  }
  const deleteItem = async (id: string) => {
    if (!confirm('Bu ürünü sil?')) return
    try { await del(`/api/menu/${id}`, { type: 'item' }); load() }
    catch (e: unknown) { flash('Hata: ' + (e instanceof Error ? e.message : String(e))) }
  }
  const handleDrop = async (categoryId: string) => {
    if (!dragItem.current || !dragOver.current || dragItem.current === dragOver.current) return
    const catItems = items.filter(i => i.category_id === categoryId).sort((a, b) => a.display_order - b.display_order)
    const fromIdx = catItems.findIndex(i => i.id === dragItem.current)
    const toIdx = catItems.findIndex(i => i.id === dragOver.current)
    if (fromIdx === -1 || toIdx === -1) return
    const reordered = [...catItems]
    const [moved] = reordered.splice(fromIdx, 1)
    reordered.splice(toIdx, 0, moved)
    setItems(prev => { const others = prev.filter(i => i.category_id !== categoryId); const updated = reordered.map((item, idx) => ({ ...item, display_order: idx + 1 })); return [...others, ...updated] })
    try {
      await Promise.all(reordered.map((item, idx) => item.display_order !== idx + 1 ? put(`/api/menu/${item.id}`, { type: 'item', display_order: idx + 1 }) : Promise.resolve()))
    } catch (e: unknown) { flash('Sıra kaydedilemedi: ' + (e instanceof Error ? e.message : String(e))); load() }
    dragItem.current = null; dragOver.current = null
  }

  return (
    <div>
      <div className="admin-header">
        <div className="admin-page-title">Menü Yönetimi</div>
        <div className="admin-page-sub">Kategoriler ve ürünleri buradan düzenleyin.</div>
      </div>
      <div className="admin-card">
        <div className="admin-card-title">Kategoriler</div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          <input className="admin-form" style={{ flex: 1, minWidth: 180, background: 'var(--bg2)', border: '1.5px solid var(--border-g)', padding: '8px 12px', borderRadius: 8, fontSize: 14, color: 'var(--black)' }} placeholder="Yeni kategori adı..." value={newCat} onChange={e => setNewCat(e.target.value)} onKeyDown={e => e.key === 'Enter' && addCat()} />
          <button className="admin-btn admin-btn-red" onClick={addCat}>+ Ekle</button>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {categories.map(c => (
            <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--bg2)', border: '1.5px solid var(--border-g)', borderRadius: 8, padding: '6px 12px' }}>
              <span style={{ fontSize: 13, fontWeight: 500 }}>{c.name}</span>
              <button onClick={() => deleteCat(c.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: 16, lineHeight: 1, padding: '0 2px' }}>×</button>
            </div>
          ))}
        </div>
      </div>
      <div className="admin-card">
        <div className="admin-card-title">Yeni Ürün Ekle</div>
        <div className="admin-form">
          <div className="admin-form-row">
            <div><label>Kategori</label><select value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
            <div><label>Fiyat (opsiyonel)</label><input placeholder="120₺" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} /></div>
          </div>
          <label>Ürün Adı</label>
          <input placeholder="Kuzu Tandır" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          <label>Açıklama</label>
          <textarea placeholder="Saatlerce yavaş pişirilmiş..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} style={{ minHeight: 80 }} />
          <label>Ürün Görseli (opsiyonel)</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {form.image_url && <img src={form.image_url} alt="" style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border-g)' }} />}
            <label style={{ cursor: 'pointer' }}>
              <span className="admin-btn admin-btn-outline" style={{ pointerEvents: 'none' }}>{uploading ? 'Yükleniyor...' : 'Fotoğraf Seç'}</span>
              <input type="file" accept="image/*" style={{ display: 'none' }} disabled={uploading} onChange={e => { const f = e.target.files?.[0]; if (f) uploadImage(f, url => setForm(fm => ({ ...fm, image_url: url }))); e.target.value = '' }} />
            </label>
            {form.image_url && <button onClick={() => setForm(f => ({ ...f, image_url: '' }))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: 18 }}>×</button>}
          </div>
          <label className="admin-toggle"><input type="checkbox" checked={form.is_featured} onChange={e => setForm(f => ({ ...f, is_featured: e.target.checked }))} /><span>Öne çıkan ürün olarak işaretle</span></label>
          <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
            <button className="admin-btn admin-btn-red" onClick={addItem}>Ürün Ekle</button>
            {msg && <span className={`admin-msg ${msg.startsWith('Hata') ? 'error' : 'success'}`}>{msg}</span>}
          </div>
        </div>
      </div>
      {items.length === 0 && categories.length > 0 && <div className="admin-card"><div className="admin-empty">Henüz ürün eklenmedi.</div></div>}
      {categories.map(cat => {
        const catItems = items.filter(i => i.category_id === cat.id)
        if (catItems.length === 0) return null
        return (
          <div key={cat.id} className="admin-card">
            <div className="admin-card-title" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>{cat.name}</span>
              <span style={{ fontWeight: 400, fontSize: 13, color: 'var(--muted)' }}>{catItems.length} ürün</span>
            </div>
            <table className="admin-table"><thead><tr><th style={{ width: 28 }}></th><th>Ürün</th><th>Fiyat</th><th>Durum</th><th>İşlem</th></tr></thead>
              <tbody>
                {catItems.sort((a, b) => a.display_order - b.display_order).map(item => (
                  <tr key={item.id} draggable onDragStart={() => { dragItem.current = item.id }} onDragEnter={() => { dragOver.current = item.id }} onDragOver={e => e.preventDefault()} onDrop={() => handleDrop(cat.id)} style={{ cursor: 'grab' }} onDragEnd={() => { dragItem.current = null; dragOver.current = null }}>
                    <td style={{ color: 'var(--muted)', fontSize: 18, textAlign: 'center', userSelect: 'none' }}>⠿</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{item.name}</div>
                      {item.description && <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{item.description.slice(0, 60)}{item.description.length > 60 ? '...' : ''}</div>}
                      {item.is_featured && <span className="badge badge-red" style={{ marginTop: 4, display: 'inline-block' }}>⭐ Öne Çıkan</span>}
                    </td>
                    <td>{item.price || '—'}</td>
                    <td><button onClick={() => toggleAvailable(item)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><span className={`badge ${item.is_available ? 'badge-green' : 'badge-gray'}`}>{item.is_available ? 'Aktif' : 'Pasif'}</span></button></td>
                    <td><div className="admin-actions"><button className="admin-btn admin-btn-outline" onClick={() => setEditItem(item)}>Düzenle</button><button className="admin-btn admin-btn-danger" onClick={() => deleteItem(item.id)}>Sil</button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      })}
      {editItem && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ background: 'var(--bg)', borderRadius: 16, padding: 32, width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ fontFamily: 'var(--serif)', fontSize: 22, marginBottom: 20 }}>Ürünü Düzenle</h3>
            <div className="admin-form">
              <label>Ürün Adı</label><input value={editItem.name} onChange={e => setEditItem(i => i ? { ...i, name: e.target.value } : i)} />
              <label>Açıklama</label><textarea value={editItem.description} onChange={e => setEditItem(i => i ? { ...i, description: e.target.value } : i)} style={{ minHeight: 80 }} />
              <label>Fiyat</label><input value={editItem.price} onChange={e => setEditItem(i => i ? { ...i, price: e.target.value } : i)} />
              <label>Ürün Görseli</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {editItem.image_url && <img src={editItem.image_url} alt="" style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border-g)' }} />}
                <label style={{ cursor: 'pointer' }}><span className="admin-btn admin-btn-outline" style={{ pointerEvents: 'none' }}>{uploading ? 'Yükleniyor...' : 'Fotoğraf Seç'}</span><input type="file" accept="image/*" style={{ display: 'none' }} disabled={uploading} onChange={e => { const f = e.target.files?.[0]; if (f) uploadImage(f, url => setEditItem(i => i ? { ...i, image_url: url } : i)); e.target.value = '' }} /></label>
                {editItem.image_url && <button onClick={() => setEditItem(i => i ? { ...i, image_url: '' } : i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: 18 }}>×</button>}
              </div>
              <label className="admin-toggle" style={{ marginTop: 12 }}><input type="checkbox" checked={editItem.is_featured} onChange={e => setEditItem(i => i ? { ...i, is_featured: e.target.checked } : i)} /><span>Öne çıkan</span></label>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
              <button className="admin-btn admin-btn-red" onClick={saveEdit}>Kaydet</button>
              <button className="admin-btn admin-btn-outline" onClick={() => setEditItem(null)}>İptal</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── BLOG & TARİFLER ──────────────────────────────────────────────

function RecipeSection({ data, onChange }: { data: RecipeData; onChange: (d: RecipeData) => void }) {
  const set = (k: keyof RecipeData, v: string | string[]) => onChange({ ...data, [k]: v })
  const updateList = (key: 'ingredients' | 'steps', idx: number, val: string) => {
    const arr = [...data[key]]
    arr[idx] = val
    set(key, arr)
  }
  const addRow = (key: 'ingredients' | 'steps') => set(key, [...data[key], ''])
  const removeRow = (key: 'ingredients' | 'steps', idx: number) => {
    if (data[key].length <= 1) return
    set(key, data[key].filter((_, i) => i !== idx))
  }

  return (
    <div className="recipe-section">
      <div className="recipe-section-title">
        <span className="recipe-icon">📋</span> Tarif Bilgileri
      </div>

      {/* Meta row */}
      <div className="recipe-meta-grid">
        <div className="admin-form">
          <label>⏱ Hazırlık Süresi</label>
          <input placeholder="15 dakika" value={data.prep_time} onChange={e => set('prep_time', e.target.value)} />
        </div>
        <div className="admin-form">
          <label>🔥 Pişirme Süresi</label>
          <input placeholder="3 saat" value={data.cook_time} onChange={e => set('cook_time', e.target.value)} />
        </div>
        <div className="admin-form">
          <label>👥 Porsiyon</label>
          <input placeholder="4–6 kişi" value={data.servings} onChange={e => set('servings', e.target.value)} />
        </div>
        <div className="admin-form">
          <label>📊 Zorluk</label>
          <select value={data.difficulty} onChange={e => set('difficulty', e.target.value)}>
            <option>Kolay</option>
            <option>Orta</option>
            <option>Zor</option>
          </select>
        </div>
      </div>

      {/* Ingredients */}
      <div style={{ marginTop: 20 }}>
        <div className="recipe-list-header">
          <span className="recipe-list-title">🥩 Malzemeler</span>
          <button type="button" className="admin-btn admin-btn-outline" style={{ fontSize: 11 }} onClick={() => addRow('ingredients')}>+ Ekle</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {data.ingredients.map((ing, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ color: 'var(--muted)', fontSize: 12, width: 20, textAlign: 'right', flexShrink: 0 }}>{i + 1}.</span>
              <input
                className="recipe-list-input"
                placeholder={`Malzeme ${i + 1} (örn. 1 kg kuzu but)`}
                value={ing}
                onChange={e => updateList('ingredients', i, e.target.value)}
              />
              <button type="button" onClick={() => removeRow('ingredients', i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: 16, padding: '0 4px', flexShrink: 0 }}>×</button>
            </div>
          ))}
        </div>
      </div>

      {/* Steps */}
      <div style={{ marginTop: 20 }}>
        <div className="recipe-list-header">
          <span className="recipe-list-title">👨‍🍳 Yapılış Adımları</span>
          <button type="button" className="admin-btn admin-btn-outline" style={{ fontSize: 11 }} onClick={() => addRow('steps')}>+ Ekle</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {data.steps.map((step, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <span style={{ background: 'var(--red)', color: '#fff', borderRadius: '50%', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0, marginTop: 9 }}>{i + 1}</span>
              <textarea
                className="recipe-list-input"
                placeholder={`Adım ${i + 1}...`}
                value={step}
                onChange={e => updateList('steps', i, e.target.value)}
                style={{ minHeight: 64, resize: 'vertical' }}
              />
              <button type="button" onClick={() => removeRow('steps', i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: 16, padding: '0 4px', flexShrink: 0, marginTop: 8 }}>×</button>
            </div>
          ))}
        </div>
      </div>

      {/* Tips */}
      <div style={{ marginTop: 16 }}>
        <div className="admin-form">
          <label>💡 Püf Noktaları (opsiyonel)</label>
          <textarea placeholder="Bu tarif için ipuçları..." value={data.tips} onChange={e => set('tips', e.target.value)} style={{ minHeight: 80 }} />
        </div>
      </div>
    </div>
  )
}

function BlogTab({ adminKey }: { adminKey: string }) {
  const { get, post, put, del } = useAdminFetch('blog', adminKey)
  const [posts, setPosts] = useState<Post[]>([])
  const [form, setForm] = useState({ title: '', excerpt: '', content: '', cover_image_url: '', published: false, post_type: 'blog', recipe_data: null as RecipeData | null, meta_title: '', meta_description: '' })
  const [editPost, setEditPost] = useState<FullPost | null>(null)
  const [msg, setMsg] = useState('')
  const [saving, setSaving] = useState(false)
  const [view, setView] = useState<'list' | 'new'>('list')
  const [featuredSlug, setFeaturedSlug] = useState('')
  const [uploading, setUploading] = useState(false)
  const [loadingPost, setLoadingPost] = useState(false)

  const load = useCallback(async () => {
    const data = await get('/api/posts')
    setPosts(Array.isArray(data) ? data : [])
    const settings = await fetch('/api/settings').then(r => r.json())
    setFeaturedSlug(settings.featured_blog_slug || '')
  }, [get])

  useEffect(() => { load() }, [load])
  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 3000) }

  const isEditing = editPost !== null
  const postType = isEditing ? editPost.post_type || 'blog' : form.post_type
  const recipeData = isEditing ? (editPost.recipe_data || defaultRecipe()) : (form.recipe_data || defaultRecipe())

  const setPostType = (t: string) => {
    if (isEditing) setEditPost(p => p ? { ...p, post_type: t, recipe_data: t === 'tarif' ? (p.recipe_data || defaultRecipe()) : null } : p)
    else setForm(f => ({ ...f, post_type: t, recipe_data: t === 'tarif' ? (f.recipe_data || defaultRecipe()) : null }))
  }
  const setRecipeData = (d: RecipeData) => {
    if (isEditing) setEditPost(p => p ? { ...p, recipe_data: d } : p)
    else setForm(f => ({ ...f, recipe_data: d }))
  }

  const uploadCover = async (file: File) => {
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    try {
      const res = await fetch('/api/upload', { method: 'POST', headers: { 'x-admin-key': adminKey }, body: fd })
      const data = await res.json()
      if (!data.error) {
        if (isEditing) setEditPost(p => p ? { ...p, cover_image_url: data.url } : p)
        else setForm(f => ({ ...f, cover_image_url: data.url }))
      } else flash('Yükleme hatası: ' + data.error)
    } finally { setUploading(false) }
  }

  const openNew = () => { setEditPost(null); setForm({ title: '', excerpt: '', content: '', cover_image_url: '', published: false, post_type: 'blog', recipe_data: null, meta_title: '', meta_description: '' }); setView('new') }

  const openEdit = async (p: Post) => {
    setLoadingPost(true)
    setView('new')
    try {
      const data = await get(`/api/posts?id=${p.id}`)
      setEditPost({ ...p, content: data.content || '', cover_image_url: data.cover_image_url || '', recipe_data: data.recipe_data || null, post_type: data.post_type || 'blog', meta_title: data.meta_title || '', meta_description: data.meta_description || '' })
    } catch { flash('Yazı yüklenemedi') }
    setLoadingPost(false)
  }

  const toggleFeatured = async (p: Post) => {
    const newSlug = featuredSlug === p.slug ? '' : p.slug
    await fetch('/api/settings', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey }, body: JSON.stringify({ featured_blog_slug: newSlug }) })
    setFeaturedSlug(newSlug)
    flash(newSlug ? `"${p.title}" öne çıkarıldı ✓` : 'Öne çıkan kaldırıldı')
  }

  const savePost = async () => {
    const payload = isEditing
      ? { title: editPost!.title, excerpt: editPost!.excerpt, content: editPost!.content, cover_image_url: editPost!.cover_image_url, published: editPost!.published, post_type: editPost!.post_type || 'blog', recipe_data: editPost!.recipe_data, meta_title: editPost!.meta_title || '', meta_description: editPost!.meta_description || '' }
      : { ...form }
    if (!payload.title.trim()) { flash('Başlık zorunlu'); return }
    setSaving(true)
    try {
      if (isEditing) {
        await put(`/api/posts/${editPost!.id}`, payload)
        flash('Güncellendi ✓')
      } else {
        await post('/api/posts', payload)
        flash('Yazı eklendi ✓')
      }
      setView('list'); setEditPost(null)
      setForm({ title: '', excerpt: '', content: '', cover_image_url: '', published: false, post_type: 'blog', recipe_data: null, meta_title: '', meta_description: '' })
      load()
    } catch (e: unknown) { flash('Hata: ' + (e instanceof Error ? e.message : String(e))) }
    setSaving(false)
  }

  const togglePublish = async (p: Post) => { await put(`/api/posts/${p.id}`, { published: !p.published }); load() }
  const deletePost = async (id: string) => { if (!confirm('Bu yazıyı sil?')) return; await del(`/api/posts/${id}`); load() }

  const val = (k: 'title' | 'excerpt' | 'content' | 'cover_image_url' | 'published' | 'meta_title' | 'meta_description') => isEditing ? editPost![k] : form[k] as typeof form[typeof k]
  const setVal = (k: 'title' | 'excerpt' | 'content' | 'cover_image_url' | 'meta_title' | 'meta_description', v: string) => {
    if (isEditing) setEditPost(p => p ? { ...p, [k]: v } : p)
    else setForm(f => ({ ...f, [k]: v }))
  }
  const setBool = (k: 'published', v: boolean) => {
    if (isEditing) setEditPost(p => p ? { ...p, [k]: v } : p)
    else setForm(f => ({ ...f, [k]: v }))
  }

  return (
    <div>
      <div className="admin-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div className="admin-page-title">Blog & Tarifler</div>
            <div className="admin-page-sub">Yazı ekle, düzenle, yayınla veya taslak olarak kaydet.</div>
          </div>
          {view === 'list'
            ? <button className="admin-btn admin-btn-red" onClick={openNew}>+ Yeni Yazı / Tarif</button>
            : <button className="admin-btn admin-btn-outline" onClick={() => { setView('list'); setEditPost(null) }}>← Listeye Dön</button>
          }
        </div>
      </div>

      {view === 'list' && (
        <div className="admin-card">
          {posts.length === 0 ? <div className="admin-empty">Henüz yazı yok. &quot;Yeni Yazı / Tarif&quot; ile başlayın.</div> : (
            <table className="admin-table">
              <thead><tr><th>Başlık</th><th>Tür</th><th>Tarih</th><th>Durum</th><th>İşlem</th></tr></thead>
              <tbody>
                {posts.map(p => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{p.title}</div>
                      {p.excerpt && <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{p.excerpt.slice(0, 70)}...</div>}
                      {featuredSlug === p.slug && <span className="badge badge-red" style={{ marginTop: 4, display: 'inline-block' }}>⭐ Öne Çıkan</span>}
                    </td>
                    <td>
                      <span className={`badge ${p.post_type === 'tarif' ? 'badge-orange' : 'badge-blue'}`}>
                        {p.post_type === 'tarif' ? '🍽️ Tarif' : '✍️ Blog'}
                      </span>
                    </td>
                    <td style={{ whiteSpace: 'nowrap', fontSize: 12, color: 'var(--muted)' }}>{new Date(p.created_at).toLocaleDateString('tr-TR')}</td>
                    <td>
                      <button onClick={() => togglePublish(p)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                        <span className={`badge ${p.published ? 'badge-green' : 'badge-gray'}`}>{p.published ? 'Yayında' : 'Taslak'}</span>
                      </button>
                    </td>
                    <td>
                      <div className="admin-actions">
                        <button className="admin-btn admin-btn-outline" onClick={() => toggleFeatured(p)} title={featuredSlug === p.slug ? 'Öne çıkanı kaldır' : 'Öne çıkar'} style={{ fontSize: 15 }}>{featuredSlug === p.slug ? '⭐' : '☆'}</button>
                        <button className="admin-btn admin-btn-outline" onClick={() => openEdit(p)}>Düzenle</button>
                        <button className="admin-btn admin-btn-danger" onClick={() => deletePost(p.id)}>Sil</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {view === 'new' && (
        <div>
          {loadingPost ? (
            <div className="admin-card"><div className="admin-empty">Yazı yükleniyor...</div></div>
          ) : (
            <>
              {/* Post type toggle */}
              <div className="admin-card" style={{ padding: '16px 20px' }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1, marginRight: 4 }}>İçerik Türü:</span>
                  <button type="button" onClick={() => setPostType('blog')} className={`post-type-btn ${postType === 'blog' ? 'active' : ''}`}>✍️ Blog Yazısı</button>
                  <button type="button" onClick={() => setPostType('tarif')} className={`post-type-btn ${postType === 'tarif' ? 'active-recipe' : ''}`}>🍽️ Yemek Tarifi</button>
                </div>
              </div>

              {/* Main fields */}
              <div className="admin-card">
                <div className="admin-form">
                  <label>Başlık *</label>
                  <input placeholder={postType === 'tarif' ? 'Kuzu Tandır Tarifi' : 'Yazı başlığı...'} value={val('title') as string} onChange={e => setVal('title', e.target.value)} />
                  <label>Kısa Açıklama</label>
                  <input placeholder="Bu yazının özeti..." value={val('excerpt') as string} onChange={e => setVal('excerpt', e.target.value)} />
                  <label>Kapak Fotoğrafı</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    {(val('cover_image_url') as string) && <img src={val('cover_image_url') as string} alt="" style={{ width: 100, height: 64, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border-g)' }} />}
                    <label style={{ cursor: 'pointer' }}>
                      <span className="admin-btn admin-btn-outline" style={{ pointerEvents: 'none' }}>{uploading ? 'Yükleniyor...' : '📷 Fotoğraf Yükle'}</span>
                      <input type="file" accept="image/*" style={{ display: 'none' }} disabled={uploading} onChange={e => { const f = e.target.files?.[0]; if (f) uploadCover(f); e.target.value = '' }} />
                    </label>
                    {(val('cover_image_url') as string) && <button type="button" onClick={() => setVal('cover_image_url', '')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: 18 }}>×</button>}
                  </div>
                </div>
              </div>

              {/* Recipe section */}
              {postType === 'tarif' && (
                <RecipeSection data={recipeData} onChange={setRecipeData} />
              )}

              {/* Rich content editor */}
              <div className="admin-card">
                <div className="admin-card-title">
                  {postType === 'tarif' ? '📝 Ek Notlar / Hikaye (opsiyonel)' : '📝 İçerik *'}
                </div>
                <RichEditor
                  value={val('content') as string}
                  onChange={v => setVal('content', v)}
                  placeholder={postType === 'tarif' ? 'Bu tarif hakkında bir hikaye veya ek bilgi ekleyin...' : 'Yazmaya başlayın...'}
                  minHeight={postType === 'tarif' ? 200 : 360}
                />
              </div>

              {/* SEO Ayarları */}
              <details className="admin-card" style={{ padding: 0 }}>
                <summary style={{ padding: '14px 20px', cursor: 'pointer', fontWeight: 700, fontSize: 13, color: 'var(--black)', listStyle: 'none', display: 'flex', alignItems: 'center', gap: 8, userSelect: 'none' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                  SEO Ayarları
                  <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--muted)', marginLeft: 4 }}>(opsiyonel — boş bırakılırsa başlık/özet kullanılır)</span>
                </summary>
                <div className="admin-form" style={{ paddingTop: 0, borderTop: '1px solid var(--border-g)' }}>
                  <label>Meta Başlık <span style={{ fontWeight: 400, color: 'var(--muted)' }}>(max 60 karakter)</span></label>
                  <input
                    placeholder={val('title') as string || 'Sayfa başlığı...'}
                    value={val('meta_title') as string}
                    onChange={e => setVal('meta_title', e.target.value)}
                    maxLength={60}
                  />
                  <div style={{ fontSize: 11, color: ((val('meta_title') as string)?.length ?? 0) > 50 ? '#d97706' : 'var(--muted)', marginTop: 4, textAlign: 'right' }}>
                    {(val('meta_title') as string)?.length ?? 0}/60
                  </div>
                  <label>Meta Açıklama <span style={{ fontWeight: 400, color: 'var(--muted)' }}>(max 160 karakter)</span></label>
                  <textarea
                    rows={3}
                    placeholder={val('excerpt') as string || 'Arama sonuçlarında görünecek açıklama...'}
                    value={val('meta_description') as string}
                    onChange={e => setVal('meta_description', e.target.value)}
                    maxLength={160}
                    style={{ resize: 'vertical' }}
                  />
                  <div style={{ fontSize: 11, color: ((val('meta_description') as string)?.length ?? 0) > 140 ? '#d97706' : 'var(--muted)', marginTop: 4, textAlign: 'right', marginBottom: 16 }}>
                    {(val('meta_description') as string)?.length ?? 0}/160
                  </div>
                  {/* Google önizleme */}
                  <div style={{ background: 'var(--bg2)', border: '1px solid var(--border-g)', borderRadius: 10, padding: '14px 16px', marginBottom: 16 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>Google Önizleme</div>
                    <div style={{ fontSize: 12, color: '#006621' }}>tandirciusta.com › blog › ...</div>
                    <div style={{ fontSize: 18, color: '#1a0dab', fontWeight: 400, lineHeight: 1.3, margin: '2px 0 4px' }}>
                      {(val('meta_title') as string) || (val('title') as string) || 'Sayfa Başlığı'}
                    </div>
                    <div style={{ fontSize: 13, color: '#545454', lineHeight: 1.5 }}>
                      {(val('meta_description') as string) || (val('excerpt') as string) || 'Sayfa açıklaması burada görünür...'}
                    </div>
                  </div>
                </div>
              </details>

              {/* Publish */}
              <div className="admin-card" style={{ padding: '16px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                  <label className="admin-toggle" style={{ margin: 0 }}>
                    <input type="checkbox" checked={val('published') as boolean} onChange={e => setBool('published', e.target.checked)} />
                    <span>Hemen yayınla <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(işaretsiz = taslak)</span></span>
                  </label>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    {msg && <span className={`admin-msg ${msg.startsWith('H') ? 'error' : 'success'}`}>{msg}</span>}
                    <button className="admin-btn admin-btn-outline" onClick={() => { setView('list'); setEditPost(null) }}>İptal</button>
                    <button className="admin-btn admin-btn-red" onClick={savePost} disabled={saving}>
                      {saving ? 'Kaydediliyor...' : isEditing ? 'Güncelle' : 'Kaydet'}
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

// ── PAGES ─────────────────────────────────────────────────────────

const PAGE_SECTION_META: Record<string, { icon: string; color: string; description: string }> = {
  homepage_hero:     { icon: '🏠', color: '#6366f1', description: 'Ana sayfanın en üstündeki büyük görsel ve başlık alanı' },
  homepage_about:    { icon: '📖', color: '#0891b2', description: 'Ana sayfada "Hikayemiz" bölümündeki görsel, metin ve istatistikler' },
  homepage_sections: { icon: '📋', color: '#7c3aed', description: 'Ana sayfadaki tüm bölüm başlıkları (menü, yorumlar, galeri, vb.)' },
  homepage_reviews:  { icon: '⭐', color: '#d97706', description: 'Google yorum kartları — isim, tarih ve yorum metinleri' },
  homepage_brand:    { icon: '🏷️', color: '#059669', description: 'İlikya marka kartı — ad, açıklama ve etiket' },
  ilikya_hero:       { icon: '💧', color: '#0d9488', description: 'İlikya sayfası hero bölümü, CTA ve bölüm başlıkları' },
  ilikya_seriler:    { icon: '🫙', color: '#2563eb', description: 'İlikya ürün serileri — adlar ve açıklamalar' },
  ilikya_ozellikler: { icon: '✨', color: '#9333ea', description: 'İlikya özellik ve hedef kitle kartları' },
  contact:           { icon: '📍', color: '#d97706', description: 'İletişim bilgileri, harita ve sosyal medya linkleri' },
  hours:             { icon: '🕐', color: '#dc2626', description: 'Footer ve hero kartında görünen çalışma saatleri' },
  footer_genel:      { icon: '🔧', color: '#6b7280', description: 'Footer açıklaması ve genel site bilgileri' },
}

const FIELD_HINTS: Record<string, string> = {
  hero_image:          'Tam sayfa arka plan görseli — 1920×1080px önerilir',
  hero_title:          'Sayfada büyük harflerle görünen ana başlık',
  hero_subtitle:       'Başlığın altında görünen açıklama metni',
  about_image:         'Hakkımızda bölümündeki yandan görsel — 4:3 oran',
  about_text:          'Restoranınızı tanıtan paragraf metni',
  ilikya_hero_image:   'İlikya hero arka planı — geniş format önerilir',
  ilikya_hero_title:   'İlikya ürün başlığı',
  ilikya_hero_subtitle:'İlikya ürün açıklaması',
  phone:               'Arama butonu ve footer\'da görünür',
  whatsapp:            'Uluslararası formatta, başında 90 — örn: 905551234567',
  address:             'Footer ve iletişim bölümünde görünür',
  maps_embed_url:      'Google Maps → Paylaş → Haritayı göm → URL\'yi yapıştırın',
  maps_link:           'Google Maps → Yol tarifi → URL\'yi kopyalayın',
  instagram:           'Instagram profil linkiniz',
  hours_weekday:       'Hafta içi çalışma saati — örn: 11:00 – 22:00',
  hours_saturday:      'Cumartesi çalışma saati',
  hours_sunday:        'Pazar çalışma saati',
}

function PagesTab({ adminKey }: { adminKey: string }) {
  const { get, post } = useAdminFetch('pages', adminKey)
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [saving, setSaving]     = useState(false)
  const [saved, setSaved]       = useState<string | null>(null)
  const [activeId, setActiveId] = useState<string>(PAGE_SECTIONS[0].id)

  useEffect(() => { get('/api/settings').then(setSettings) }, [get])

  const set = (key: string, val: string) => setSettings(s => ({ ...s, [key]: val }))

  const save = async () => {
    setSaving(true)
    try {
      await post('/api/settings', settings)
      setSaved('Kaydedildi ✓')
      setTimeout(() => setSaved(null), 2500)
    } catch { setSaved('Hata oluştu') }
    setSaving(false)
  }

  const activeSection = PAGE_SECTIONS.find(s => s.id === activeId)!
  const activeMeta    = PAGE_SECTION_META[activeId]

  const imageFields = activeSection.fields.filter(f => f.type === 'image')
  const textFields  = activeSection.fields.filter(f => f.type !== 'image')

  const sectionFilled = (s: typeof PAGE_SECTIONS[0]) =>
    s.fields.some(f => settings[f.key]?.trim())

  return (
    <div className="pages-wrap">
      {/* ── Left nav ─────────────────────────────────────────── */}
      <aside className="pages-aside">
        <div className="pages-aside-title">Bölümler</div>
        {PAGE_SECTIONS.map(s => {
          const meta    = PAGE_SECTION_META[s.id]
          const filled  = sectionFilled(s)
          const isActive = s.id === activeId
          return (
            <button
              key={s.id}
              onClick={() => setActiveId(s.id)}
              className={`pages-nav-item${isActive ? ' active' : ''}`}
            >
              <span className="pages-nav-icon" style={{ background: isActive ? meta.color : 'var(--bg3)' }}>
                {meta.icon}
              </span>
              <span className="pages-nav-text">
                <span className="pages-nav-label">{s.title}</span>
                {filled && !isActive && (
                  <span className="pages-nav-filled">● içerik var</span>
                )}
              </span>
              {isActive && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginLeft: 'auto', color: meta.color, flexShrink: 0 }}>
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              )}
            </button>
          )
        })}
      </aside>

      {/* ── Right content ─────────────────────────────────────── */}
      <div className="pages-content">
        {/* Section header */}
        <div className="pages-content-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="pages-header-icon" style={{ background: activeMeta.color }}>
              {activeMeta.icon}
            </div>
            <div>
              <div className="pages-header-title">{activeSection.title}</div>
              <div className="pages-header-desc">{activeMeta.description}</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
            {activeSection.previewPath && (
              <a href={activeSection.previewPath} target="_blank" rel="noopener" className="pages-preview-link">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
                  <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                </svg>
                Sayfayı Gör
              </a>
            )}
            {saved && (
              <span className={`admin-msg ${saved.startsWith('H') ? 'error' : 'success'}`} style={{ margin: 0 }}>{saved}</span>
            )}
            <button className="admin-btn admin-btn-red" onClick={save} disabled={saving}>
              {saving
                ? <><span className="pages-spin" />Kaydediliyor...</>
                : <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 6 }}><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>Kaydet</>
              }
            </button>
          </div>
        </div>

        {/* ── Image fields ─── */}
        {imageFields.length > 0 && (
          <div className="pages-section-block">
            <div className="pages-block-title">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
              Görseller
            </div>
            <div className={`pages-image-grid pages-image-grid-${imageFields.length}`}>
              {imageFields.map(field => (
                <div key={field.key} className="pages-image-item">
                  <ImageUploadCrop
                    large
                    value={settings[field.key] || ''}
                    settingKey={field.key}
                    aspectRatio={field.aspectRatio}
                    label={field.label}
                    adminKey={adminKey}
                    displayWidth={100}
                    onChange={(url) => { set(field.key, url); if (field.widthKey) set(field.widthKey, '100') }}
                    opacityValue={field.opacityKey ? (settings[field.opacityKey] !== undefined ? Number(settings[field.opacityKey]) : 100) : undefined}
                    onOpacityChange={field.opacityKey ? (v) => set(field.opacityKey!, String(v)) : undefined}
                  />
                  {FIELD_HINTS[field.key] && (
                    <div className="pages-field-hint">💡 {FIELD_HINTS[field.key]}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Text fields ─── */}
        {textFields.length > 0 && (
          <div className="pages-section-block">
            <div className="pages-block-title">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="17" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/>
                <line x1="21" y1="14" x2="3" y2="14"/><line x1="13" y1="18" x2="3" y2="18"/>
              </svg>
              Metinler
            </div>
            <div className="pages-text-fields">
              {textFields.map(field => (
                <div key={field.key} className="pages-text-item">
                  <label className="pages-text-label">{field.label}</label>
                  {FIELD_HINTS[field.key] && (
                    <div className="pages-text-hint">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                      {FIELD_HINTS[field.key]}
                    </div>
                  )}
                  {field.type === 'textarea' ? (
                    <textarea
                      value={settings[field.key] || ''}
                      placeholder={field.placeholder}
                      onChange={e => set(field.key, e.target.value)}
                      className="pages-text-input"
                      rows={3}
                    />
                  ) : (
                    <input
                      type="text"
                      value={settings[field.key] || ''}
                      placeholder={field.placeholder}
                      onChange={e => set(field.key, e.target.value)}
                      className="pages-text-input"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── GALERİ ────────────────────────────────────────────────────────

function GalleryTab({ adminKey }: { adminKey: string }) {
  const { get, post, del } = useAdminFetch('gallery', adminKey)
  const [images, setImages] = useState<GalleryImg[]>([])
  const [caption, setCaption] = useState('')
  const [msg, setMsg] = useState('')
  const [uploading, setUploading] = useState(false)
  const dragImg = useRef<string | null>(null)
  const dragOver = useRef<string | null>(null)

  const load = useCallback(async () => {
    const data = await get('/api/gallery')
    setImages(Array.isArray(data) ? data : [])
  }, [get])

  useEffect(() => { load() }, [load])
  const flash = (m: string, delay = 3000) => { setMsg(m); setTimeout(() => setMsg(''), delay) }

  const uploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    try {
      const res = await fetch('/api/upload', { method: 'POST', headers: { 'x-admin-key': adminKey }, body: fd })
      const data = await res.json()
      if (data.error) { flash('Hata: ' + data.error); return }
      await post('/api/gallery', { url: data.url, caption, display_order: images.length + 1 })
      setCaption(''); e.target.value = ''
      load(); flash('Fotoğraf yüklendi ✓')
    } finally { setUploading(false) }
  }

  const remove = async (id: string) => {
    if (!confirm('Bu fotoğrafı sil?')) return
    await del('/api/gallery', { id }); load()
  }

  const handleDrop = async () => {
    if (!dragImg.current || !dragOver.current || dragImg.current === dragOver.current) return
    const fromIdx = images.findIndex(i => i.id === dragImg.current)
    const toIdx = images.findIndex(i => i.id === dragOver.current)
    if (fromIdx === -1 || toIdx === -1) return
    const reordered = [...images]
    const [moved] = reordered.splice(fromIdx, 1)
    reordered.splice(toIdx, 0, moved)
    const updated = reordered.map((img, idx) => ({ ...img, display_order: idx + 1 }))
    setImages(updated)
    try {
      await Promise.all(updated.map(img => fetch('/api/gallery', { method: 'PATCH', headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey }, body: JSON.stringify({ id: img.id, display_order: img.display_order }) })))
    } catch { flash('Sıra kaydedilemedi'); load() }
    dragImg.current = null; dragOver.current = null
  }

  return (
    <div>
      <div className="admin-header">
        <div className="admin-page-title">Galeri</div>
        <div className="admin-page-sub">Bilgisayarınızdan fotoğraf yükleyin. Sıralamak için sürükleyip bırakın.</div>
      </div>
      <div className="admin-card">
        <div className="admin-card-title">Fotoğraf Yükle</div>
        <div className="admin-form">
          <label>Açıklama (opsiyonel)</label>
          <input placeholder="Kuzu Tandır, Restoran, vb." value={caption} onChange={e => setCaption(e.target.value)} />
          <label style={{ marginTop: 8 }}>Fotoğraf Seç *</label>
          <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '2px dashed var(--border-g)', borderRadius: 10, padding: '28px 20px', cursor: 'pointer', background: 'var(--bg2)', gap: 8, transition: 'border-color 0.2s' }}
            onDragOver={e => { e.preventDefault(); (e.currentTarget as HTMLLabelElement).style.borderColor = 'var(--red)' }}
            onDragLeave={e => { (e.currentTarget as HTMLLabelElement).style.borderColor = 'var(--border-g)' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--muted)' }}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            <span style={{ fontSize: 13, color: 'var(--muted)' }}>{uploading ? 'Yükleniyor...' : 'Tıkla veya sürükle & bırak'}</span>
            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={uploadFile} disabled={uploading} />
          </label>
          {msg && <span className={`admin-msg ${msg.startsWith('H') ? 'error' : 'success'}`}>{msg}</span>}
        </div>
      </div>
      <div className="admin-card">
        <div className="admin-card-title" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Galerindeki Fotoğraflar ({images.length})</span>
          {images.length > 1 && <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 400 }}>⠿ Sürükleyerek sıralayın</span>}
        </div>
        {images.length === 0
          ? <div className="admin-empty">Henüz fotoğraf yok. Yukarıdan yükleyin.</div>
          : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12, marginTop: 8 }}>
              {images.map(img => (
                <div key={img.id}
                  draggable
                  onDragStart={() => { dragImg.current = img.id }}
                  onDragEnter={() => { dragOver.current = img.id }}
                  onDragOver={e => e.preventDefault()}
                  onDrop={handleDrop}
                  onDragEnd={() => { dragImg.current = null; dragOver.current = null }}
                  style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', border: '1.5px solid var(--border-g)', cursor: 'grab', transition: 'box-shadow 0.15s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow)'}
                  onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'}
                >
                  <div style={{ position: 'absolute', top: 6, left: 6, background: 'rgba(0,0,0,0.5)', borderRadius: 4, color: '#fff', fontSize: 14, padding: '1px 5px', lineHeight: 1.4, zIndex: 1 }}>⠿</div>
                  <img src={img.url} alt={img.caption} style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', display: 'block' }} onError={e => { (e.target as HTMLImageElement).style.background = '#f0ebe3' }} />
                  <div style={{ padding: '8px 10px', background: 'var(--bg)' }}>
                    <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{img.caption || 'Açıklama yok'}</div>
                    <button className="admin-btn admin-btn-danger" style={{ width: '100%', fontSize: 11 }} onClick={() => remove(img.id)}>Sil</button>
                  </div>
                </div>
              ))}
            </div>
          )}
      </div>
    </div>
  )
}

// ── TALEPLER ─────────────────────────────────────────────────────

function TaleplerTab({ adminKey }: { adminKey: string }) {
  const [requests, setRequests] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')
  const [filter, setFilter] = useState<string>('tumu')
  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 3000) }
  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/requests', { headers: { 'x-admin-key': adminKey } })
      const data = await res.json()
      setRequests(Array.isArray(data) ? data : [])
    } catch { flash('Yüklenemedi') }
    setLoading(false)
  }, [adminKey])
  useEffect(() => { load() }, [load])
  const updateStatus = async (id: string, status: string) => {
    await fetch('/api/requests', { method: 'PATCH', headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey }, body: JSON.stringify({ id, status }) })
    flash('Durum güncellendi ✓'); load()
  }
  const deleteRequest = async (id: string) => {
    if (!confirm('Bu talebi kalıcı olarak sil?')) return
    await fetch('/api/requests', { method: 'DELETE', headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey }, body: JSON.stringify({ id }) })
    flash('Talep silindi ✓'); load()
  }
  const TYPE_LABEL: Record<string, string> = { rezervasyon: '🍽️ Rezervasyon', catering: '🎉 Catering', oneri: '💬 Öneri/Şikayet' }
  const buildWaNotif = (r: Record<string, unknown>, status: string) => {
    const name = String(r.name || ''); const phone = String(r.phone || '').replace(/[^0-9]/g, '')
    if (!phone) return null
    const lines: string[] = []
    if (status === 'onaylandi') {
      lines.push(`Sayın ${name},`)
      if (r.type === 'rezervasyon') { lines.push(`Rezervasyonunuz onaylanmıştır. ✅`); if (r.date) lines.push(`📅 Tarih: ${String(r.date)}${r.time ? ` saat ${String(r.time)}` : ''}`); if (r.guests) lines.push(`👥 Kişi: ${String(r.guests)}`) }
      else if (r.type === 'catering') { lines.push(`Catering talebiniz onaylanmıştır. ✅`); if (r.date) lines.push(`📅 Tarih: ${String(r.date)}`); if (r.guests) lines.push(`👥 Kişi: ${String(r.guests)}`) }
      else { lines.push(`Geri bildiriminiz için teşekkür ederiz. ✅`) }
      lines.push(`Sizi aramızda görmekten mutluluk duyarız.`); lines.push(`— Tandırcı Usta®`)
    } else if (status === 'iptal') { lines.push(`Sayın ${name},`); lines.push(`Maalesef talebinizi bu kez karşılayamıyoruz. 😔`); lines.push(`Detaylar için bizi arayabilirsiniz.`); lines.push(`— Tandırcı Usta®`) }
    if (!lines.length) return null
    return `https://wa.me/${phone}?text=${encodeURIComponent(lines.join('\n'))}`
  }
  const filtered = filter === 'tumu' ? requests : requests.filter(r => r.type === filter || r.status === filter)
  const yeniCount = requests.filter(r => r.status === 'yeni').length
  return (
    <div>
      <div className="admin-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div className="admin-page-title">Talepler {yeniCount > 0 && <span className="badge badge-red" style={{ marginLeft: 10, fontSize: 13 }}>{yeniCount} Yeni</span>}</div>
            <div className="admin-page-sub">Rezervasyon, catering ve öneri/şikayet talepleri.</div>
          </div>
          <button className="admin-btn admin-btn-outline" onClick={load}>↻ Yenile</button>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {['tumu','rezervasyon','catering','oneri','yeni','goruldu','onaylandi'].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`admin-btn ${filter === f ? 'admin-btn-red' : 'admin-btn-outline'}`} style={{ textTransform: 'capitalize' }}>
            {f === 'tumu' ? 'Tümü' : f === 'goruldu' ? 'Görüldü' : f === 'onaylandi' ? 'Onaylandı' : f === 'yeni' ? 'Yeni' : TYPE_LABEL[f]?.replace(/^[^ ]+ /, '') || f}
          </button>
        ))}
      </div>
      <div className="admin-card">
        {loading ? <div className="admin-empty">Yükleniyor...</div> : filtered.length === 0 ? <div className="admin-empty">Henüz talep yok.</div> : (
          <table className="admin-table">
            <thead><tr><th>Tür</th><th>Ad</th><th>Telefon</th><th>Detay</th><th>Not</th><th>Tarih</th><th>Durum</th><th>Bildir</th><th></th></tr></thead>
            <tbody>
              {filtered.map((r) => {
                const id = r.id as string; const status = (r.status as string) || 'yeni'; const createdAt = r.created_at as string
                return (
                  <tr key={id}>
                    <td><span style={{ fontSize: 12, fontWeight: 600 }}>{TYPE_LABEL[r.type as string] || String(r.type)}</span></td>
                    <td style={{ fontWeight: 600 }}>{String(r.name || '—')}</td>
                    <td>{r.phone ? <a href={`tel:${r.phone}`} style={{ color: 'var(--red)', textDecoration: 'none' }}>{String(r.phone)}</a> : '—'}</td>
                    <td style={{ fontSize: 12, color: 'var(--muted)' }}>
                      {r.date ? <div>📅 {String(r.date)}{r.time ? ` ${String(r.time)}` : ''}</div> : null}
                      {r.guests ? <div>👥 {String(r.guests)} kişi</div> : null}
                      {r.event_type ? <div>🎊 {String(r.event_type)}</div> : null}
                    </td>
                    <td style={{ maxWidth: 200, fontSize: 12, color: 'var(--muted)' }}>{r.note ? String(r.note).slice(0, 80) + (String(r.note).length > 80 ? '…' : '') : '—'}</td>
                    <td style={{ whiteSpace: 'nowrap', fontSize: 12, color: 'var(--muted)' }}>
                      {new Date(createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}<br />
                      {new Date(createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td>
                      <select value={status} onChange={e => updateStatus(id, e.target.value)} style={{ border: '1.5px solid var(--border-g)', borderRadius: 6, padding: '5px 8px', fontSize: 12, fontWeight: 600, cursor: 'pointer', background: status === 'yeni' ? 'rgba(200,37,26,0.08)' : status === 'onaylandi' ? 'rgba(34,197,94,0.1)' : 'var(--bg2)', color: status === 'yeni' ? 'var(--red)' : status === 'onaylandi' ? '#16a34a' : 'var(--muted)', outline: 'none' }}>
                        <option value="yeni">🔴 Yeni</option><option value="goruldu">👁 Görüldü</option><option value="onaylandi">✅ Onaylandı</option><option value="iptal">❌ İptal</option>
                      </select>
                    </td>
                    <td>
                      {(() => { const waUrl = buildWaNotif(r, status); return waUrl ? (
                        <a href={waUrl} target="_blank" rel="noopener" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: status === 'iptal' ? 'rgba(220,38,38,0.08)' : 'rgba(37,211,102,0.1)', color: status === 'iptal' ? '#dc2626' : '#16a34a', border: `1px solid ${status === 'iptal' ? 'rgba(220,38,38,0.2)' : 'rgba(37,211,102,0.25)'}`, borderRadius: 6, padding: '5px 10px', fontSize: 11, fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap' }}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                          {status === 'iptal' ? 'Reddet' : 'Onayla'}
                        </a>
                      ) : <span style={{ color: 'var(--muted)', fontSize: 11 }}>—</span> })()}
                    </td>
                    <td>
                      <button
                        onClick={() => deleteRequest(id)}
                        title="Talebi sil"
                        style={{ background: 'none', border: '1px solid rgba(220,38,38,0.25)', borderRadius: 6, padding: '5px 8px', cursor: 'pointer', color: '#dc2626', display: 'flex', alignItems: 'center', transition: 'all 0.15s' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(220,38,38,0.08)' }}
                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'none' }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                          <path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
                        </svg>
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
        {msg && <div className="admin-msg success" style={{ margin: '12px 0 0' }}>{msg}</div>}
      </div>
    </div>
  )
}

// ── İSTATİSTİKLER ────────────────────────────────────────────────

function countryFlag(code: string | null): string {
  if (!code || code === 'XX') return '🌐'
  return Array.from(code.toUpperCase()).map(c => String.fromCodePoint(0x1F1E6 + c.charCodeAt(0) - 65)).join('')
}
function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Az önce'
  if (mins < 60) return `${mins}dk önce`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}sa önce`
  return `${Math.floor(hours / 24)}g önce`
}

function IstatistiklerTab({ adminKey }: { adminKey: string }) {
  const toIso = (d: Date) => d.toISOString().slice(0, 10)
  const todayIso = toIso(new Date())
  const initFrom = () => { const d = new Date(); d.setDate(d.getDate() - 6); return toIso(d) }
  const [dateFrom, setDateFrom] = useState(initFrom)
  const [dateTo, setDateTo] = useState(todayIso)
  const [customFrom, setCustomFrom] = useState(initFrom)
  const [customTo, setCustomTo] = useState(todayIso)
  const [activePreset, setActivePreset] = useState('7g')
  const [data, setData] = useState<VisitRow[]>([])
  const [loading, setLoading] = useState(true)
  const loadData = useCallback(async (from: string, to: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/analytics?from=${from}&to=${to}`, { headers: { 'x-admin-key': adminKey } })
      const json = await res.json()
      setData(Array.isArray(json) ? json : [])
    } catch { /* silent */ }
    setLoading(false)
  }, [adminKey])
  useEffect(() => { loadData(dateFrom, dateTo) }, [loadData, dateFrom, dateTo])
  const applyPreset = (key: string) => {
    const today = new Date(); let from = todayIso
    if (key === 'dun') { const d = new Date(); d.setDate(d.getDate() - 1); from = toIso(d) }
    if (key === '7g') { const d = new Date(); d.setDate(d.getDate() - 6); from = toIso(d) }
    if (key === '30g') { const d = new Date(); d.setDate(d.getDate() - 29); from = toIso(d) }
    if (key === '90g') { const d = new Date(); d.setDate(d.getDate() - 89); from = toIso(d) }
    const to = key === 'dun' ? from : toIso(today)
    setActivePreset(key); setDateFrom(from); setDateTo(to); setCustomFrom(from); setCustomTo(to)
  }
  const applyCustom = () => { setActivePreset(''); setDateFrom(customFrom); setDateTo(customTo) }
  const totalVisits = data.length
  const uniqueIPs = new Set(data.map(d => d.ip)).size
  const todayVisits = data.filter(d => d.created_at.startsWith(todayIso)).length
  const topCountries = Object.entries(data.reduce((acc, d) => { const k = d.country || 'Bilinmiyor'; acc[k] = { count: (acc[k]?.count || 0) + 1, code: d.country_code || null }; return acc }, {} as Record<string, { count: number; code: string | null }>)).sort((a, b) => b[1].count - a[1].count).slice(0, 10)
  const topCities = Object.entries(data.reduce((acc, d) => { if (!d.city) return acc; const k = `${d.city}|${d.country || ''}|${d.country_code || ''}`; acc[k] = (acc[k] || 0) + 1; return acc }, {} as Record<string, number>)).sort((a, b) => b[1] - a[1]).slice(0, 10)
  const topPages = Object.entries(data.reduce((acc, d) => { const k = d.page || '/'; acc[k] = (acc[k] || 0) + 1; return acc }, {} as Record<string, number>)).sort((a, b) => b[1] - a[1]).slice(0, 10)
  const maxCountry = topCountries[0]?.[1].count || 1
  const maxPage = topPages[0]?.[1] || 1
  const visitsByDay = data.reduce((acc, d) => { const day = d.created_at.slice(0, 10); acc[day] = (acc[day] || 0) + 1; return acc }, {} as Record<string, number>)
  const chartDays: { date: string; label: string; count: number }[] = []
  for (let d = new Date(dateFrom); toIso(d) <= dateTo; d.setDate(d.getDate() + 1)) {
    const iso = toIso(d); chartDays.push({ date: iso, label: d.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' }), count: visitsByDay[iso] || 0 })
  }
  const maxDay = Math.max(...chartDays.map(d => d.count), 1)
  const showAllLabels = chartDays.length <= 14
  const PRESETS = [{ key: 'bugun', label: 'Bugün' }, { key: 'dun', label: 'Dün' }, { key: '7g', label: '7 Gün' }, { key: '30g', label: '30 Gün' }, { key: '90g', label: '90 Gün' }]

  return (
    <div>
      <div className="admin-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div><div className="admin-page-title">İstatistikler</div><div className="admin-page-sub">Ziyaretçi sayısı, konumlar ve sayfa görüntülemeleri.</div></div>
          <button className="admin-btn admin-btn-outline" onClick={() => loadData(dateFrom, dateTo)}>↻ Yenile</button>
        </div>
      </div>
      <a href="https://analytics.google.com" target="_blank" rel="noopener noreferrer" style={{ display: 'block', textDecoration: 'none', marginBottom: 20 }}>
        <div style={{ background: 'linear-gradient(135deg, #1557b0 0%, #1a73e8 100%)', border: '1px solid rgba(26,115,232,0.4)', borderRadius: 12, padding: '14px 20px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 10, width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect x="2" y="13" width="4" height="9" rx="1" fill="white" opacity="0.6"/><rect x="9" y="7" width="4" height="15" rx="1" fill="white" opacity="0.8"/><rect x="16" y="2" width="4" height="20" rx="1" fill="white"/></svg>
            </div>
            <div><div style={{ fontWeight: 700, fontSize: 14, color: '#fff', lineHeight: 1.2 }}>Google Analytics 4</div><div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 3 }}>tandirciusta.com · Tüm ziyaretler izleniyor</div></div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.85)', fontSize: 12, fontWeight: 600, flexShrink: 0 }}>Raporu Aç <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="2.5"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg></div>
        </div>
      </a>
      <div className="admin-card" style={{ marginBottom: 20, padding: '16px 20px' }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          {PRESETS.map(p => (<button key={p.key} onClick={() => applyPreset(p.key)} className={`admin-btn ${activePreset === p.key ? 'admin-btn-red' : 'admin-btn-outline'}`} style={{ fontSize: 12, padding: '6px 12px' }}>{p.label}</button>))}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 4, flexWrap: 'wrap' }}>
            <input type="date" value={customFrom} onChange={e => { setCustomFrom(e.target.value); setActivePreset('') }} style={{ padding: '6px 10px', border: '1.5px solid var(--border-g)', borderRadius: 7, fontSize: 12, fontFamily: 'var(--sans)', background: 'var(--bg)', color: 'var(--text)' }} />
            <span style={{ color: 'var(--muted)', fontSize: 12 }}>–</span>
            <input type="date" value={customTo} onChange={e => { setCustomTo(e.target.value); setActivePreset('') }} style={{ padding: '6px 10px', border: '1.5px solid var(--border-g)', borderRadius: 7, fontSize: 12, fontFamily: 'var(--sans)', background: 'var(--bg)', color: 'var(--text)' }} />
            <button className="admin-btn admin-btn-red" style={{ fontSize: 12, padding: '6px 14px' }} onClick={applyCustom}>Uygula</button>
          </div>
        </div>
      </div>
      {loading ? (<div className="admin-card"><div className="admin-empty">Yükleniyor...</div></div>) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 20 }}>
            {[{ v: totalVisits, l: 'Toplam Ziyaret' }, { v: uniqueIPs, l: 'Tekil Ziyaretçi' }, { v: todayVisits, l: 'Bugün' }].map(({ v, l }) => (
              <div key={l} className="admin-card" style={{ padding: '20px 24px', margin: 0 }}>
                <div style={{ fontSize: 30, fontWeight: 800, color: 'var(--red)', lineHeight: 1, letterSpacing: -1 }}>{v.toLocaleString('tr-TR')}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 5, fontWeight: 500 }}>{l}</div>
              </div>
            ))}
          </div>
          {chartDays.length > 0 && chartDays.length <= 91 && (
            <div className="admin-card" style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div className="admin-card-title" style={{ marginBottom: 0 }}>Günlük Ziyaretler</div>
                <span style={{ fontSize: 12, color: 'var(--muted)' }}>{dateFrom} – {dateTo}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: chartDays.length > 30 ? 2 : 4, height: 130, paddingBottom: showAllLabels ? 22 : 0, position: 'relative' }}>
                {chartDays.map(({ date, label, count }) => (
                  <div key={date} title={`${date}: ${count} ziyaret`} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%', position: 'relative', cursor: 'default' }}>
                    {count > 0 && chartDays.length <= 14 && (<span style={{ position: 'absolute', top: 0, fontSize: 9, fontWeight: 700, color: 'var(--red)', whiteSpace: 'nowrap' }}>{count}</span>)}
                    <div style={{ width: '100%', height: count > 0 ? `${Math.max((count / maxDay) * 100, 5)}%` : '2px', background: count > 0 ? 'linear-gradient(to top, var(--red), rgba(200,37,26,0.6))' : 'var(--border-g)', borderRadius: '3px 3px 0 0', transition: 'height 0.2s' }} />
                    {showAllLabels && (<span style={{ position: 'absolute', bottom: -18, fontSize: 9, color: 'var(--muted)', whiteSpace: 'nowrap' }}>{label}</span>)}
                  </div>
                ))}
              </div>
              {!showAllLabels && (<div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--muted)', marginTop: 8 }}><span>{chartDays[0]?.label}</span><span>{chartDays[Math.floor(chartDays.length / 2)]?.label}</span><span>{chartDays[chartDays.length - 1]?.label}</span></div>)}
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
            <div className="admin-card" style={{ margin: 0 }}>
              <div className="admin-card-title">🌍 Ülkelere Göre</div>
              {topCountries.length === 0 ? <div className="admin-empty" style={{ fontSize: 13 }}>Henüz veri yok.</div> : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {topCountries.map(([country, { count, code }]) => (
                    <div key={country}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                        <span style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 7 }}><span style={{ fontSize: 16 }}>{countryFlag(code)}</span><span style={{ color: 'var(--text)' }}>{country}</span></span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--red)', background: 'rgba(200,37,26,0.07)', padding: '1px 8px', borderRadius: 20 }}>{count}</span>
                      </div>
                      <div style={{ height: 5, background: 'var(--bg3)', borderRadius: 3 }}><div style={{ height: '100%', background: 'linear-gradient(to right, var(--red), rgba(200,37,26,0.5))', borderRadius: 3, width: `${(count / maxCountry) * 100}%` }} /></div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="admin-card" style={{ margin: 0 }}>
              <div className="admin-card-title">📄 Sayfalara Göre</div>
              {topPages.length === 0 ? <div className="admin-empty" style={{ fontSize: 13 }}>Henüz veri yok.</div> : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {topPages.map(([page, count]) => (
                    <div key={page}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                        <span style={{ fontSize: 12, color: 'var(--muted)', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '75%' }}>{page || '/'}</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--red)', background: 'rgba(200,37,26,0.07)', padding: '1px 8px', borderRadius: 20, flexShrink: 0 }}>{count}</span>
                      </div>
                      <div style={{ height: 5, background: 'var(--bg3)', borderRadius: 3 }}><div style={{ height: '100%', background: 'linear-gradient(to right, var(--red), rgba(200,37,26,0.5))', borderRadius: 3, width: `${(count / maxPage) * 100}%` }} /></div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          {topCities.length > 0 && (
            <div className="admin-card" style={{ marginBottom: 20 }}>
              <div className="admin-card-title">📍 En Çok Ziyaret Eden Şehirler</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {topCities.map(([key, count]) => { const [city, , cc] = key.split('|'); return (<div key={key} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--bg2)', border: '1px solid var(--border-g)', borderRadius: 20, padding: '5px 12px', fontSize: 12 }}><span>{countryFlag(cc || null)}</span><span style={{ color: 'var(--text)' }}>{city}</span><span style={{ fontWeight: 700, color: 'var(--red)' }}>{count}</span></div>) })}
              </div>
            </div>
          )}
          <div className="admin-card">
            <div className="admin-card-title">⚡ Son Ziyaretçiler <span style={{ fontWeight: 400, fontSize: 12, color: 'var(--muted)' }}>{data.length} kayıt</span></div>
            {data.length === 0 ? <div className="admin-empty">Seçilen aralıkta ziyaretçi yok.</div> : (
              <div style={{ overflowX: 'auto' }}>
                <table className="admin-table">
                  <thead><tr><th>Zaman</th><th>IP Adresi</th><th>Konum</th><th>Sayfa</th><th>Referans</th></tr></thead>
                  <tbody>
                    {data.slice(0, 100).map(v => (
                      <tr key={v.id}>
                        <td style={{ fontSize: 11, color: 'var(--muted)', whiteSpace: 'nowrap' }}>{timeAgo(v.created_at)}</td>
                        <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{v.ip || '—'}</td>
                        <td style={{ fontSize: 12 }}><span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span>{countryFlag(v.country_code)}</span><span>{[v.city, v.country].filter(Boolean).join(', ') || '—'}</span></span></td>
                        <td style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--red)' }}>{v.page || '/'}</td>
                        <td style={{ fontSize: 11, color: 'var(--muted)', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.referrer || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

// ── MAIN PAGE ────────────────────────────────────────────────────

export default function AdminPage() {
  const [authed, setAuthed] = useState(false)
  const [pw, setPw] = useState('')
  const [err, setErr] = useState('')
  const [adminKey, setAdminKey] = useState('')
  const [activeTab, setActiveTab] = useState<Tab>('Dashboard')
  const [newRequestCount, setNewRequestCount] = useState(0)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const fetchNewCount = useCallback(async (key: string) => {
    try {
      const res = await fetch('/api/requests', { headers: { 'x-admin-key': key } })
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data)) setNewRequestCount(data.filter((r: Record<string, unknown>) => r.status === 'yeni').length)
      }
    } catch { /* silent */ }
  }, [])

  useEffect(() => {
    const saved = sessionStorage.getItem('admin_key')
    if (saved) { setAdminKey(saved); setAuthed(true); fetchNewCount(saved) }
  }, [fetchNewCount])

  useEffect(() => {
    if (authed && adminKey && activeTab !== 'Talepler') fetchNewCount(adminKey)
  }, [activeTab, authed, adminKey, fetchNewCount])

  const login = async () => {
    const res = await fetch('/api/settings', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-admin-key': pw }, body: JSON.stringify({}) })
    if (res.ok) { sessionStorage.setItem('admin_key', pw); setAdminKey(pw); setAuthed(true); fetchNewCount(pw) }
    else { setErr('Yanlış şifre'); setTimeout(() => setErr(''), 2000) }
  }

  const logout = () => { sessionStorage.removeItem('admin_key'); setAuthed(false); setAdminKey(''); setPw('') }

  const NAV_ICONS: Record<Tab, React.ReactNode> = {
    'Dashboard': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
    'Sayfalar': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>,
    'Menü': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>,
    'Blog & Tarifler': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
    'Galeri': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
    'Talepler': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>,
    'İstatistikler': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  }

  if (!authed) {
    return (
      <div className="admin-login">
        <div className="admin-login-card">
          <div style={{ width: 60, height: 60, borderRadius: 16, background: 'linear-gradient(135deg, var(--red), #e03028)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 28, boxShadow: '0 8px 24px rgba(200,37,26,0.3)' }}>🔥</div>
          <div className="admin-login-logo">Tandırcı Usta®</div>
          <div className="admin-login-sub">Yönetim Paneli — Yetkili Giriş</div>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 6, textAlign: 'left' }}>Şifre</div>
            <input type="password" placeholder="••••••••" value={pw} onChange={e => setPw(e.target.value)} onKeyDown={e => e.key === 'Enter' && login()}
              style={{ width: '100%', background: 'var(--bg2)', border: '1.5px solid var(--border-g)', padding: '12px 16px', borderRadius: 8, fontSize: 16, outline: 'none', letterSpacing: 4, color: 'var(--black)', fontFamily: 'var(--sans)', transition: 'border-color 0.2s' }}
              onFocus={e => e.target.style.borderColor = 'var(--red)'} onBlur={e => e.target.style.borderColor = 'var(--border-g)'} />
          </div>
          <button className="btn btn-red" style={{ width: '100%', justifyContent: 'center', padding: '13px', fontSize: 14 }} onClick={login}>Giriş Yap</button>
          {err && <div className="admin-msg error" style={{ marginTop: 12 }}>{err}</div>}
        </div>
      </div>
    )
  }

  const navTo = (tab: Tab) => { setActiveTab(tab); setSidebarOpen(false) }

  return (
    <div className="admin-layout">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 199, backdropFilter: 'blur(2px)' }}
        />
      )}

      <div className={`admin-sidebar${sidebarOpen ? ' admin-sidebar-open' : ''}`}>
        <div className="admin-sidebar-logo">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, var(--red), #e03028)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>🔥</div>
            <div>
              <div>Tandırcı Usta®</div>
              <div style={{ fontSize: 10, fontFamily: 'var(--sans)', color: 'rgba(255,255,255,0.35)', fontWeight: 400, marginTop: 1 }}>Admin Panel v2</div>
            </div>
          </div>
          {/* Mobile close button */}
          <button onClick={() => setSidebarOpen(false)} style={{ display: 'none', background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', padding: 4, marginLeft: 'auto' }} className="sidebar-close-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <nav className="admin-nav">
          {TABS.map(tab => (
            <button key={tab} className={`admin-nav-item${activeTab === tab ? ' active' : ''}`} onClick={() => navTo(tab)} style={{ justifyContent: 'space-between' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {NAV_ICONS[tab]}
                {tab}
              </span>
              {tab === 'Talepler' && newRequestCount > 0 && (
                <span style={{ background: 'var(--red)', color: '#fff', fontSize: 10, fontWeight: 700, lineHeight: 1, padding: '3px 7px', borderRadius: 20, minWidth: 18, textAlign: 'center' }}>{newRequestCount}</span>
              )}
            </button>
          ))}
          <div style={{ paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: 16 }}>
            <a href="/" target="_blank" rel="noopener" className="admin-nav-item" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              Siteyi Gör
            </a>
            <button className="admin-nav-item" onClick={logout} style={{ color: 'rgba(255,255,255,0.4)' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Çıkış Yap
            </button>
          </div>
        </nav>
      </div>
      <main className="admin-main">
        {/* Mobile top bar */}
        <div className="admin-mobile-topbar">
          <button onClick={() => setSidebarOpen(true)} className="admin-hamburger" aria-label="Menüyü Aç">
            <span /><span /><span />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 24, height: 24, borderRadius: 6, background: 'linear-gradient(135deg, var(--red), #e03028)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>🔥</div>
            <span style={{ fontFamily: 'var(--serif)', fontWeight: 700, fontSize: 15, color: 'var(--black)' }}>Admin Panel</span>
          </div>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)' }}>{activeTab}</div>
        </div>

        {activeTab === 'Dashboard'      && <DashboardTab adminKey={adminKey} onNavigate={setActiveTab} />}
        {activeTab === 'Sayfalar'       && <PagesTab adminKey={adminKey} />}
        {activeTab === 'Menü'           && <MenuTab adminKey={adminKey} />}
        {activeTab === 'Blog & Tarifler' && <BlogTab adminKey={adminKey} />}
        {activeTab === 'Galeri'         && <GalleryTab adminKey={adminKey} />}
        {activeTab === 'Talepler'       && <TaleplerTab adminKey={adminKey} />}
        {activeTab === 'İstatistikler'  && <IstatistiklerTab adminKey={adminKey} />}
      </main>
    </div>
  )
}
