'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import dynamic from 'next/dynamic'
import { PAGE_SECTIONS } from '@/lib/admin-pages-config'

const ImageUploadCrop = dynamic(() => import('@/components/admin/ImageUploadCrop'), { ssr: false })

const TABS = ['Sayfalar', 'Menü', 'Blog & Tarifler', 'Galeri', 'Talepler', 'İstatistikler'] as const
type Tab = typeof TABS[number]

type Post = { id: string; title: string; slug: string; published: boolean; created_at: string; excerpt: string }
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
  return { get, post, put, del }
  void key
}

// ── TABS ──────────────────────────────────────────────────────

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
                <textarea
                  value={settings[f.key] || ''}
                  placeholder={f.placeholder}
                  onChange={e => setSettings(s => ({ ...s, [f.key]: e.target.value }))}
                  style={{ minHeight: 100 }}
                />
              ) : (
                <input
                  type="text"
                  value={settings[f.key] || ''}
                  placeholder={f.placeholder}
                  onChange={e => setSettings(s => ({ ...s, [f.key]: e.target.value }))}
                />
              )}
            </div>
          ))}
          <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
            <button className="admin-btn admin-btn-red" onClick={save} disabled={saving}>
              {saving ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
            {msg && <span className={`admin-msg ${msg.startsWith('H') ? 'error' : 'success'}`}>{msg}</span>}
          </div>
        </div>
      </div>
    </div>
  )
}

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
    } catch (e: unknown) {
      console.error('Menü yüklenemedi:', e)
    }
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
      const payload: Record<string, unknown> = {
        type: 'item',
        category_id: form.category_id,
        name: form.name.trim(),
        description: form.description,
        price: form.price,
        is_available: true,
        is_featured: form.is_featured,
        display_order: items.length + 1,
      }
      if (form.image_url) payload.image_url = form.image_url
      await post('/api/menu', payload)
      setForm(f => ({ ...f, name: '', description: '', price: '', image_url: '', is_featured: false }))
      load(); flash('Ürün eklendi ✓')
    } catch (e: unknown) {
      flash('Hata: ' + (e instanceof Error ? e.message : String(e)))
    }
  }

  const toggleAvailable = async (item: Item) => {
    try {
      await put(`/api/menu/${item.id}`, { type: 'item', is_available: !item.is_available })
      load()
    } catch (e: unknown) { flash('Hata: ' + (e instanceof Error ? e.message : String(e))) }
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
    try {
      await del(`/api/menu/${id}`, { type: 'item' }); load()
    } catch (e: unknown) { flash('Hata: ' + (e instanceof Error ? e.message : String(e))) }
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
    // Optimistic update
    setItems(prev => {
      const others = prev.filter(i => i.category_id !== categoryId)
      const updated = reordered.map((item, idx) => ({ ...item, display_order: idx + 1 }))
      return [...others, ...updated]
    })
    // Persist changed orders
    try {
      await Promise.all(
        reordered.map((item, idx) =>
          item.display_order !== idx + 1
            ? put(`/api/menu/${item.id}`, { type: 'item', display_order: idx + 1 })
            : Promise.resolve()
        )
      )
    } catch (e: unknown) { flash('Sıra kaydedilemedi: ' + (e instanceof Error ? e.message : String(e))); load() }
    dragItem.current = null
    dragOver.current = null
  }

  return (
    <div>
      <div className="admin-header">
        <div className="admin-page-title">Menü Yönetimi</div>
        <div className="admin-page-sub">Kategoriler ve ürünleri buradan düzenleyin.</div>
      </div>

      {/* Kategoriler */}
      <div className="admin-card">
        <div className="admin-card-title">Kategoriler</div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          <input
            className="admin-form"
            style={{ flex: 1, minWidth: 180, background: 'var(--bg2)', border: '1.5px solid var(--border-g)', padding: '8px 12px', borderRadius: 8, fontSize: 14, color: 'var(--black)' }}
            placeholder="Yeni kategori adı..."
            value={newCat}
            onChange={e => setNewCat(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addCat()}
          />
          <button className="admin-btn admin-btn-red" onClick={addCat}>Ekle</button>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {categories.map(c => (
            <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--bg2)', border: '1.5px solid var(--border-g)', borderRadius: 8, padding: '6px 12px' }}>
              <span style={{ fontSize: 13, fontWeight: 500 }}>{c.name}</span>
              <button onClick={() => deleteCat(c.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: 14, lineHeight: 1 }}>×</button>
            </div>
          ))}
        </div>
      </div>

      {/* Yeni Ürün */}
      <div className="admin-card">
        <div className="admin-card-title">Yeni Ürün Ekle</div>
        <div className="admin-form">
          <div className="admin-form-row">
            <div>
              <label>Kategori</label>
              <select value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label>Fiyat (opsiyonel)</label>
              <input placeholder="120₺" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} />
            </div>
          </div>
          <label>Ürün Adı</label>
          <input placeholder="Kuzu Tandır" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          <label>Açıklama</label>
          <textarea placeholder="Saatlerce yavaş pişirilmiş..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} style={{ minHeight: 80 }} />
          <label>Ürün Görseli (opsiyonel)</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {form.image_url && <img src={form.image_url} alt="" style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border-g)' }} />}
            <label style={{ cursor: 'pointer' }}>
              <span className="admin-btn admin-btn-outline" style={{ pointerEvents: 'none' }}>
                {uploading ? 'Yükleniyor...' : 'Fotoğraf Seç'}
              </span>
              <input type="file" accept="image/*" style={{ display: 'none' }} disabled={uploading}
                onChange={e => { const f = e.target.files?.[0]; if (f) uploadImage(f, url => setForm(fm => ({ ...fm, image_url: url }))); e.target.value = '' }} />
            </label>
            {form.image_url && <button onClick={() => setForm(f => ({ ...f, image_url: '' }))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: 18 }}>×</button>}
          </div>
          <label className="admin-toggle">
            <input type="checkbox" checked={form.is_featured} onChange={e => setForm(f => ({ ...f, is_featured: e.target.checked }))} />
            <span>Öne çıkan ürün olarak işaretle</span>
          </label>
          <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
            <button className="admin-btn admin-btn-red" onClick={addItem}>Ürün Ekle</button>
            {msg && <span className={`admin-msg ${msg.startsWith('Hata') ? 'error' : 'success'}`}>{msg}</span>}
          </div>
        </div>
      </div>

      {/* Ürün Listesi */}
      {items.length === 0 && categories.length > 0 && (
        <div className="admin-card">
          <div className="admin-empty">Henüz ürün eklenmedi. Yukarıdaki formdan ürün ekleyin.</div>
        </div>
      )}
      {categories.map(cat => {
        const catItems = items.filter(i => i.category_id === cat.id)
        if (catItems.length === 0) return null
        return (
          <div key={cat.id} className="admin-card">
            <div className="admin-card-title" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>{cat.name}</span>
              <span style={{ fontWeight: 400, fontSize: 13, color: 'var(--muted)' }}>{catItems.length} ürün</span>
            </div>
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: 28 }}></th>
                  <th>Ürün</th>
                  <th>Fiyat</th>
                  <th>Durum</th>
                  <th>İşlem</th>
                </tr>
              </thead>
              <tbody>
                {catItems.sort((a, b) => a.display_order - b.display_order).map(item => (
                  <tr key={item.id}
                    draggable
                    onDragStart={() => { dragItem.current = item.id }}
                    onDragEnter={() => { dragOver.current = item.id }}
                    onDragOver={e => e.preventDefault()}
                    onDrop={() => handleDrop(cat.id)}
                    style={{ cursor: 'grab', transition: 'opacity 0.15s' }}
                    onDragEnd={() => { dragItem.current = null; dragOver.current = null }}
                  >
                    <td style={{ color: 'var(--muted)', fontSize: 18, textAlign: 'center', userSelect: 'none' }}>⠿</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{item.name}</div>
                      {item.description && <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{item.description.slice(0, 60)}{item.description.length > 60 ? '...' : ''}</div>}
                      {item.is_featured && <span className="badge badge-red" style={{ marginTop: 4, display: 'inline-block' }}>⭐ Öne Çıkan</span>}
                    </td>
                    <td>{item.price || '—'}</td>
                    <td>
                      <button onClick={() => toggleAvailable(item)} style={{ background: 'none', border: 'none', cursor: 'pointer' }} title="Tıkla: Aktif/Pasif değiştir">
                        <span className={`badge ${item.is_available ? 'badge-green' : 'badge-gray'}`}>
                          {item.is_available ? 'Aktif' : 'Pasif'}
                        </span>
                      </button>
                    </td>
                    <td>
                      <div className="admin-actions">
                        <button className="admin-btn admin-btn-outline" onClick={() => setEditItem(item)}>Düzenle</button>
                        <button className="admin-btn admin-btn-danger" onClick={() => deleteItem(item.id)}>Sil</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      })}

      {/* Düzenleme Modal */}
      {editItem && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ background: 'var(--bg)', borderRadius: 16, padding: 32, width: '100%', maxWidth: 520 }}>
            <h3 style={{ fontFamily: 'var(--serif)', fontSize: 22, marginBottom: 20 }}>Ürünü Düzenle</h3>
            <div className="admin-form">
              <label>Ürün Adı</label>
              <input value={editItem.name} onChange={e => setEditItem(i => i ? { ...i, name: e.target.value } : i)} />
              <label>Açıklama</label>
              <textarea value={editItem.description} onChange={e => setEditItem(i => i ? { ...i, description: e.target.value } : i)} style={{ minHeight: 80 }} />
              <label>Fiyat</label>
              <input value={editItem.price} onChange={e => setEditItem(i => i ? { ...i, price: e.target.value } : i)} />
              <label>Ürün Görseli</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {editItem.image_url && <img src={editItem.image_url} alt="" style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border-g)' }} />}
                <label style={{ cursor: 'pointer' }}>
                  <span className="admin-btn admin-btn-outline" style={{ pointerEvents: 'none' }}>
                    {uploading ? 'Yükleniyor...' : 'Fotoğraf Seç'}
                  </span>
                  <input type="file" accept="image/*" style={{ display: 'none' }} disabled={uploading}
                    onChange={e => { const f = e.target.files?.[0]; if (f) uploadImage(f, url => setEditItem(i => i ? { ...i, image_url: url } : i)); e.target.value = '' }} />
                </label>
                {editItem.image_url && <button onClick={() => setEditItem(i => i ? { ...i, image_url: '' } : i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: 18 }}>×</button>}
              </div>
              <label className="admin-toggle" style={{ marginTop: 12 }}>
                <input type="checkbox" checked={editItem.is_featured} onChange={e => setEditItem(i => i ? { ...i, is_featured: e.target.checked } : i)} />
                <span>Öne çıkan</span>
              </label>
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

function BlogTab({ adminKey }: { adminKey: string }) {
  const { get, post, put, del } = useAdminFetch('blog', adminKey)
  const [posts, setPosts] = useState<Post[]>([])
  const [form, setForm] = useState({ title: '', excerpt: '', content: '', cover_image_url: '', published: false })
  const [editPost, setEditPost] = useState<(Post & { content: string; cover_image_url: string }) | null>(null)
  const [msg, setMsg] = useState('')
  const [saving, setSaving] = useState(false)
  const [tab, setTab] = useState<'list' | 'new'>('list')
  const [featuredSlug, setFeaturedSlug] = useState('')

  const load = useCallback(async () => {
    const data = await get('/api/posts')
    setPosts(Array.isArray(data) ? data : [])
    const settings = await fetch('/api/settings').then(r => r.json())
    setFeaturedSlug(settings.featured_blog_slug || '')
  }, [get])

  useEffect(() => { load() }, [load])

  const toggleFeatured = async (p: Post) => {
    const newSlug = featuredSlug === p.slug ? '' : p.slug
    await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
      body: JSON.stringify({ featured_blog_slug: newSlug }),
    })
    setFeaturedSlug(newSlug)
    flash(newSlug ? `"${p.title}" öne çıkarıldı ✓` : 'Öne çıkan kaldırıldı')
  }

  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 3000) }

  const addPost = async () => {
    if (!form.title.trim() || !form.content.trim()) { flash('Başlık ve içerik zorunlu'); return }
    setSaving(true)
    const res = await post('/api/posts', form)
    if (res.error) { flash(`Hata: ${res.error}`); setSaving(false); return }
    setForm({ title: '', excerpt: '', content: '', cover_image_url: '', published: false })
    load(); flash('Yazı eklendi ✓'); setSaving(false); setTab('list')
  }

  const togglePublish = async (p: Post) => {
    await put(`/api/posts/${p.id}`, { published: !p.published })
    load()
  }

  const deletePost = async (id: string) => {
    if (!confirm('Bu yazıyı sil?')) return
    await del(`/api/posts/${id}`); load()
  }

  const openEdit = async (p: Post) => {
    const res = await get(`/api/posts?id=${p.id}`)
    // full post için direkt supabase'den çekiyoruz — şimdilik listedeki veriyi kullan
    setEditPost({ ...p, content: '', cover_image_url: '' })
    setTab('new')
  }

  const saveEdit = async () => {
    if (!editPost) return
    setSaving(true)
    await put(`/api/posts/${editPost.id}`, {
      title: editPost.title, excerpt: editPost.excerpt,
      content: editPost.content, cover_image_url: editPost.cover_image_url,
      published: editPost.published,
    })
    setEditPost(null); load(); flash('Güncellendi ✓'); setSaving(false); setTab('list')
  }

  const isEditing = editPost !== null

  return (
    <div>
      <div className="admin-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div className="admin-page-title">Blog & Tarifler</div>
            <div className="admin-page-sub">Yazı ekle, düzenle, yayınla veya taslak olarak kaydet.</div>
          </div>
          <button className="admin-btn admin-btn-red" onClick={() => { setEditPost(null); setTab(tab === 'new' ? 'list' : 'new') }}>
            {tab === 'new' ? '← Liste' : '+ Yeni Yazı'}
          </button>
        </div>
      </div>

      {tab === 'list' && (
        <div className="admin-card">
          {posts.length === 0 ? (
            <div className="admin-empty">Henüz yazı yok. &quot;Yeni Yazı&quot; ile başlayın.</div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr><th>Başlık</th><th>Tarih</th><th>Durum</th><th>İşlem</th></tr>
              </thead>
              <tbody>
                {posts.map(p => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{p.title}</div>
                      {p.excerpt && <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{p.excerpt.slice(0, 70)}...</div>}
                      {featuredSlug === p.slug && <span className="badge badge-red" style={{ marginTop: 4, display: 'inline-block' }}>⭐ Öne Çıkan</span>}
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      {new Date(p.created_at).toLocaleDateString('tr-TR')}
                    </td>
                    <td>
                      <button onClick={() => togglePublish(p)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                        <span className={`badge ${p.published ? 'badge-green' : 'badge-gray'}`}>
                          {p.published ? 'Yayında' : 'Taslak'}
                        </span>
                      </button>
                    </td>
                    <td>
                      <div className="admin-actions">
                        <button
                          className="admin-btn admin-btn-outline"
                          onClick={() => toggleFeatured(p)}
                          title={featuredSlug === p.slug ? 'Öne çıkanı kaldır' : 'Öne çıkar'}
                          style={{ fontSize: 16 }}
                        >{featuredSlug === p.slug ? '⭐' : '☆'}</button>
                        <button className="admin-btn admin-btn-outline" onClick={() => { setEditPost({ ...p, content: '', cover_image_url: '' }); setTab('new') }}>Düzenle</button>
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

      {tab === 'new' && (
        <div className="admin-card">
          <div className="admin-card-title">{isEditing ? 'Yazıyı Düzenle' : 'Yeni Yazı'}</div>
          <div className="admin-form">
            <label>Başlık *</label>
            <input
              placeholder="Kuzu Tandır Nasıl Yapılır?"
              value={isEditing ? editPost!.title : form.title}
              onChange={e => isEditing ? setEditPost(p => p ? { ...p, title: e.target.value } : p) : setForm(f => ({ ...f, title: e.target.value }))}
            />
            <label>Kısa Açıklama (excerpt)</label>
            <input
              placeholder="Geleneksel yöntemle kuzu tandırın sırrı..."
              value={isEditing ? editPost!.excerpt : form.excerpt}
              onChange={e => isEditing ? setEditPost(p => p ? { ...p, excerpt: e.target.value } : p) : setForm(f => ({ ...f, excerpt: e.target.value }))}
            />
            <label>Kapak Fotoğrafı URL (opsiyonel)</label>
            <input
              placeholder="https://..."
              value={isEditing ? editPost!.cover_image_url : form.cover_image_url}
              onChange={e => isEditing ? setEditPost(p => p ? { ...p, cover_image_url: e.target.value } : p) : setForm(f => ({ ...f, cover_image_url: e.target.value }))}
            />
            <label>İçerik * (HTML yapıştırabilirsiniz)</label>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 6 }}>
              Düz metin ya da HTML kullanabilirsiniz. &lt;h2&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;strong&gt;, &lt;blockquote&gt; desteklenir.
            </div>
            <textarea
              style={{ minHeight: 320, fontFamily: 'monospace', fontSize: 13 }}
              placeholder={'<h2>Malzemeler</h2>\n<ul>\n  <li>1 kg kuzu but</li>\n</ul>\n<h2>Yapılışı</h2>\n<p>...</p>'}
              value={isEditing ? editPost!.content : form.content}
              onChange={e => isEditing ? setEditPost(p => p ? { ...p, content: e.target.value } : p) : setForm(f => ({ ...f, content: e.target.value }))}
            />
            <label className="admin-toggle" style={{ marginTop: 8 }}>
              <input
                type="checkbox"
                checked={isEditing ? editPost!.published : form.published}
                onChange={e => isEditing ? setEditPost(p => p ? { ...p, published: e.target.checked } : p) : setForm(f => ({ ...f, published: e.target.checked }))}
              />
              <span>Hemen yayınla (işaretsiz = taslak)</span>
            </label>
            <div style={{ display: 'flex', gap: 12, marginTop: 20, alignItems: 'center', flexWrap: 'wrap' }}>
              <button className="admin-btn admin-btn-red" onClick={isEditing ? saveEdit : addPost} disabled={saving}>
                {saving ? 'Kaydediliyor...' : isEditing ? 'Güncelle' : 'Kaydet'}
              </button>
              <button className="admin-btn admin-btn-outline" onClick={() => { setTab('list'); setEditPost(null) }}>İptal</button>
              {msg && <span className={`admin-msg ${msg.startsWith('H') ? 'error' : 'success'}`}>{msg}</span>}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function PagesTab({ adminKey }: { adminKey: string }) {
  const { get, post } = useAdminFetch('pages', adminKey)
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [openSection, setOpenSection] = useState<string>(PAGE_SECTIONS[0].id)

  useEffect(() => { get('/api/settings').then(setSettings) }, [get])

  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 3000) }

  const set = (key: string, val: string) => setSettings(s => ({ ...s, [key]: val }))

  const save = async (sectionId: string) => {
    setSaving(true)
    const section = PAGE_SECTIONS.find(s => s.id === sectionId)!
    const payload: Record<string, string> = {}
    section.fields.forEach(f => {
      payload[f.key] = settings[f.key] || ''
      if (f.widthKey) payload[f.widthKey] = settings[f.widthKey] || '100'
    })
    try {
      await post('/api/settings', { ...settings, ...payload })
      flash('Kaydedildi ✓')
    } catch { flash('Hata oluştu') }
    setSaving(false)
  }

  return (
    <div>
      <div className="admin-header">
        <div className="admin-page-title">Sayfa Yönetimi</div>
        <div className="admin-page-sub">Her bölüm için görsel yükleyin, kırpın, boyutlandırın ve metinleri düzenleyin.</div>
      </div>

      {PAGE_SECTIONS.map(section => (
        <div key={section.id} className="admin-card" style={{ overflow: 'visible' }}>
          <div
            className="admin-card-title"
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', userSelect: 'none' }}
            onClick={() => setOpenSection(openSection === section.id ? '' : section.id)}
          >
            <span>{section.title}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {section.previewPath && (
                <a
                  href={section.previewPath}
                  target="_blank"
                  rel="noopener"
                  onClick={e => e.stopPropagation()}
                  style={{ fontSize: 12, color: 'var(--muted)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                  Önizle
                </a>
              )}
              <span style={{ fontSize: 18, color: 'var(--muted)', transition: 'transform 0.2s', transform: openSection === section.id ? 'rotate(180deg)' : 'rotate(0deg)' }}>▾</span>
            </div>
          </div>

          {openSection === section.id && (
            <div className="admin-form" style={{ marginTop: 16 }}>
              {section.fields.map(field => (
                <div key={field.key}>
                  {field.type === 'image' ? (
                    <ImageUploadCrop
                      value={settings[field.key] || ''}
                      settingKey={field.key}
                      aspectRatio={field.aspectRatio}
                      label={field.label}
                      adminKey={adminKey}
                      displayWidth={Number(settings[field.widthKey!] || 100)}
                      onChange={(url, w) => {
                        set(field.key, url)
                        if (field.widthKey) set(field.widthKey, String(w))
                      }}
                    />
                  ) : field.type === 'textarea' ? (
                    <div>
                      <label>{field.label}</label>
                      <textarea
                        value={settings[field.key] || ''}
                        placeholder={field.placeholder}
                        onChange={e => set(field.key, e.target.value)}
                        style={{ minHeight: 80 }}
                      />
                    </div>
                  ) : (
                    <div>
                      <label>{field.label}</label>
                      <input
                        type="text"
                        value={settings[field.key] || ''}
                        placeholder={field.placeholder}
                        onChange={e => set(field.key, e.target.value)}
                      />
                    </div>
                  )}
                </div>
              ))}
              <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
                <button className="admin-btn admin-btn-red" onClick={() => save(section.id)} disabled={saving}>
                  {saving ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
                {msg && <span className={`admin-msg ${msg.startsWith('H') ? 'error' : 'success'}`}>{msg}</span>}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function GalleryTab({ adminKey }: { adminKey: string }) {
  const { get, post, del } = useAdminFetch('gallery', adminKey)
  const [images, setImages] = useState<GalleryImg[]>([])
  const [caption, setCaption] = useState('')
  const [msg, setMsg] = useState('')
  const [uploading, setUploading] = useState(false)

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
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'x-admin-key': adminKey },
        body: fd,
      })
      const data = await res.json()
      if (data.error) { flash('Hata: ' + data.error); return }
      await post('/api/gallery', { url: data.url, caption, display_order: images.length + 1 })
      setCaption('')
      e.target.value = ''
      load(); flash('Fotoğraf yüklendi ✓')
    } finally {
      setUploading(false)
    }
  }

  const remove = async (id: string) => {
    if (!confirm('Bu fotoğrafı sil?')) return
    await del('/api/gallery', { id }); load()
  }

  return (
    <div>
      <div className="admin-header">
        <div className="admin-page-title">Galeri</div>
        <div className="admin-page-sub">Bilgisayarınızdan fotoğraf yükleyin. JPG, PNG, WebP desteklenir.</div>
      </div>

      <div className="admin-card">
        <div className="admin-card-title">Fotoğraf Yükle</div>
        <div className="admin-form">
          <label>Açıklama (opsiyonel)</label>
          <input
            placeholder="Kuzu Tandır, Restoran, vb."
            value={caption}
            onChange={e => setCaption(e.target.value)}
          />
          <label style={{ marginTop: 8 }}>Fotoğraf Seç *</label>
          <label style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            border: '2px dashed var(--border-g)', borderRadius: 10, padding: '28px 20px',
            cursor: 'pointer', background: 'var(--bg2)', gap: 8,
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--muted)' }}>
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            <span style={{ fontSize: 13, color: 'var(--muted)' }}>{uploading ? 'Yükleniyor...' : 'Tıkla veya sürükle'}</span>
            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={uploadFile} disabled={uploading} />
          </label>
          {msg && <span className={`admin-msg ${msg.startsWith('H') ? 'error' : 'success'}`}>{msg}</span>}
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-card-title">Galerindeki Fotoğraflar ({images.length})</div>
        {images.length === 0 ? (
          <div className="admin-empty">Henüz fotoğraf yok. Yukarıdan yükleyin.</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12, marginTop: 8 }}>
            {images.map(img => (
              <div key={img.id} style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', border: '1.5px solid var(--border-g)' }}>
                <img
                  src={img.url}
                  alt={img.caption}
                  style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', display: 'block' }}
                  onError={e => { (e.target as HTMLImageElement).style.background = '#f0ebe3' }}
                />
                <div style={{ padding: '8px 10px', background: 'var(--bg)' }}>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 6 }}>{img.caption || 'Açıklama yok'}</div>
                  <button className="admin-btn admin-btn-danger" style={{ width: '100%' }} onClick={() => remove(img.id)}>Sil</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

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
    await fetch('/api/requests', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
      body: JSON.stringify({ id, status }),
    })
    flash('Durum güncellendi ✓')
    load()
  }

  const TYPE_LABEL: Record<string, string> = { rezervasyon: '🍽️ Rezervasyon', catering: '🎉 Catering', oneri: '💬 Öneri/Şikayet' }

  const buildWaNotif = (r: Record<string, unknown>, status: string) => {
    const name = String(r.name || '')
    const phone = String(r.phone || '').replace(/[^0-9]/g, '')
    if (!phone) return null
    const lines: string[] = []
    if (status === 'onaylandi') {
      lines.push(`Sayın ${name},`)
      if (r.type === 'rezervasyon') {
        lines.push(`Rezervasyonunuz onaylanmıştır. ✅`)
        if (r.date) lines.push(`📅 Tarih: ${String(r.date)}${r.time ? ` saat ${String(r.time)}` : ''}`)
        if (r.guests) lines.push(`👥 Kişi: ${String(r.guests)}`)
      } else if (r.type === 'catering') {
        lines.push(`Catering talebiniz onaylanmıştır. ✅`)
        if (r.date) lines.push(`📅 Tarih: ${String(r.date)}`)
        if (r.guests) lines.push(`👥 Kişi: ${String(r.guests)}`)
      } else {
        lines.push(`Geri bildiriminiz için teşekkür ederiz. ✅`)
      }
      lines.push(`Sizi aramızda görmekten mutluluk duyarız.`)
      lines.push(`— Tandırcı Usta®`)
    } else if (status === 'iptal') {
      lines.push(`Sayın ${name},`)
      lines.push(`Maalesef talebinizi bu kez karşılayamıyoruz. 😔`)
      lines.push(`Detaylar için bizi arayabilirsiniz.`)
      lines.push(`— Tandırcı Usta®`)
    }
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
            <div className="admin-page-title">
              Talepler
              {yeniCount > 0 && <span className="badge badge-red" style={{ marginLeft: 10, fontSize: 13 }}>{yeniCount} Yeni</span>}
            </div>
            <div className="admin-page-sub">Rezervasyon, catering ve öneri/şikayet talepleri.</div>
          </div>
          <button className="admin-btn admin-btn-outline" onClick={load}>↻ Yenile</button>
        </div>
      </div>

      {/* Filtre */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {['tumu','rezervasyon','catering','oneri','yeni','goruldu','onaylandi'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`admin-btn ${filter === f ? 'admin-btn-red' : 'admin-btn-outline'}`}
            style={{ textTransform: 'capitalize' }}>
            {f === 'tumu' ? 'Tümü' : f === 'goruldu' ? 'Görüldü' : f === 'onaylandi' ? 'Onaylandı' : f === 'yeni' ? 'Yeni' : TYPE_LABEL[f]?.replace(/^[^ ]+ /, '') || f}
          </button>
        ))}
      </div>

      <div className="admin-card">
        {loading ? (
          <div className="admin-empty">Yükleniyor...</div>
        ) : filtered.length === 0 ? (
          <div className="admin-empty">Henüz talep yok.</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Tür</th>
                <th>Ad</th>
                <th>Telefon</th>
                <th>Detay</th>
                <th>Not</th>
                <th>Tarih</th>
                <th>Durum</th>
                <th>Bildir</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const id = r.id as string
                const status = (r.status as string) || 'yeni'
                const createdAt = r.created_at as string
                return (
                  <tr key={id}>
                    <td><span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>{TYPE_LABEL[r.type as string] || String(r.type)}</span></td>
                    <td style={{ fontWeight: 600 }}>{String(r.name || '—')}</td>
                    <td>{r.phone ? <a href={`tel:${r.phone}`} style={{ color: 'var(--red)', textDecoration: 'none' }}>{String(r.phone)}</a> : '—'}</td>
                    <td style={{ fontSize: 12, color: 'var(--muted)' }}>
                      {r.date ? <div>📅 {String(r.date)}{r.time ? ` ${String(r.time)}` : ''}</div> : null}
                      {r.guests ? <div>👥 {String(r.guests)} kişi</div> : null}
                      {r.event_type ? <div>🎊 {String(r.event_type)}</div> : null}
                    </td>
                    <td style={{ maxWidth: 200, fontSize: 12, color: 'var(--muted)' }}>
                      {r.note ? String(r.note).slice(0, 80) + (String(r.note).length > 80 ? '…' : '') : '—'}
                    </td>
                    <td style={{ whiteSpace: 'nowrap', fontSize: 12, color: 'var(--muted)' }}>
                      {new Date(createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}<br />
                      {new Date(createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td>
                      <select
                        value={status}
                        onChange={e => updateStatus(id, e.target.value)}
                        style={{
                          border: '1.5px solid var(--border-g)',
                          borderRadius: 6, padding: '5px 8px',
                          fontSize: 12, fontWeight: 600, cursor: 'pointer',
                          background: status === 'yeni' ? 'rgba(200,37,26,0.08)' : status === 'onaylandi' ? 'rgba(34,197,94,0.1)' : 'var(--bg2)',
                          color: status === 'yeni' ? 'var(--red)' : status === 'onaylandi' ? '#16a34a' : 'var(--muted)',
                          outline: 'none',
                        }}
                      >
                        <option value="yeni">🔴 Yeni</option>
                        <option value="goruldu">👁 Görüldü</option>
                        <option value="onaylandi">✅ Onaylandı</option>
                        <option value="iptal">❌ İptal</option>
                      </select>
                    </td>
                    <td>
                      {(() => {
                        const waUrl = buildWaNotif(r, status)
                        return waUrl ? (
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener"
                            title="WhatsApp ile bildir"
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: 5,
                              background: status === 'iptal' ? 'rgba(220,38,38,0.08)' : 'rgba(37,211,102,0.1)',
                              color: status === 'iptal' ? '#dc2626' : '#16a34a',
                              border: `1px solid ${status === 'iptal' ? 'rgba(220,38,38,0.2)' : 'rgba(37,211,102,0.25)'}`,
                              borderRadius: 6, padding: '5px 10px', fontSize: 11, fontWeight: 700,
                              textDecoration: 'none', whiteSpace: 'nowrap',
                            }}
                          >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                            {status === 'iptal' ? 'Reddet' : 'Onayla'}
                          </a>
                        ) : <span style={{ color: 'var(--muted)', fontSize: 11 }}>—</span>
                      })()}
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

function countryFlag(code: string | null): string {
  if (!code || code === 'XX') return '🌐'
  return Array.from(code.toUpperCase())
    .map(c => String.fromCodePoint(0x1F1E6 + c.charCodeAt(0) - 65))
    .join('')
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Az önce'
  if (mins < 60) return `${mins}dk önce`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}sa önce`
  const days = Math.floor(hours / 24)
  return `${days}g önce`
}

function IstatistiklerTab({ adminKey }: { adminKey: string }) {
  const toIso = (d: Date) => d.toISOString().slice(0, 10)
  const todayIso = toIso(new Date())

  const initFrom = () => { const d = new Date(); d.setDate(d.getDate() - 6); return toIso(d) }
  const [dateFrom, setDateFrom] = useState(initFrom)
  const [dateTo, setDateTo]     = useState(todayIso)
  const [customFrom, setCustomFrom] = useState(initFrom)
  const [customTo, setCustomTo]     = useState(todayIso)
  const [activePreset, setActivePreset] = useState('7g')
  const [data, setData]   = useState<VisitRow[]>([])
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
    const today = new Date()
    let from = todayIso
    if (key === 'dun')  { const d = new Date(); d.setDate(d.getDate() - 1); from = toIso(d) }
    if (key === '7g')   { const d = new Date(); d.setDate(d.getDate() - 6); from = toIso(d) }
    if (key === '30g')  { const d = new Date(); d.setDate(d.getDate() - 29); from = toIso(d) }
    if (key === '90g')  { const d = new Date(); d.setDate(d.getDate() - 89); from = toIso(d) }
    const to = key === 'dun' ? from : toIso(today)
    setActivePreset(key); setDateFrom(from); setDateTo(to)
    setCustomFrom(from); setCustomTo(to)
  }

  const applyCustom = () => { setActivePreset(''); setDateFrom(customFrom); setDateTo(customTo) }

  // ── İstatistikler ──
  const totalVisits = data.length
  const uniqueIPs   = new Set(data.map(d => d.ip)).size
  const todayVisits = data.filter(d => d.created_at.startsWith(todayIso)).length

  const topCountries = Object.entries(
    data.reduce((acc, d) => {
      const k = d.country || 'Bilinmiyor'
      acc[k] = { count: (acc[k]?.count || 0) + 1, code: d.country_code || null }
      return acc
    }, {} as Record<string, { count: number; code: string | null }>)
  ).sort((a, b) => b[1].count - a[1].count).slice(0, 10)

  const topCities = Object.entries(
    data.reduce((acc, d) => {
      if (!d.city) return acc
      const k = `${d.city}|${d.country || ''}|${d.country_code || ''}`
      acc[k] = (acc[k] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  ).sort((a, b) => b[1] - a[1]).slice(0, 10)

  const topPages = Object.entries(
    data.reduce((acc, d) => {
      const k = d.page || '/'
      acc[k] = (acc[k] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  ).sort((a, b) => b[1] - a[1]).slice(0, 10)

  const maxCountry  = topCountries[0]?.[1].count || 1
  const maxPage     = topPages[0]?.[1] || 1

  // ── Günlük grafik ──
  const visitsByDay = data.reduce((acc, d) => {
    const day = d.created_at.slice(0, 10)
    acc[day] = (acc[day] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const chartDays: { date: string; label: string; count: number }[] = []
  for (let d = new Date(dateFrom); toIso(d) <= dateTo; d.setDate(d.getDate() + 1)) {
    const iso = toIso(d)
    chartDays.push({ date: iso, label: d.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' }), count: visitsByDay[iso] || 0 })
  }
  const maxDay = Math.max(...chartDays.map(d => d.count), 1)
  const showAllLabels = chartDays.length <= 14

  const PRESETS = [
    { key: 'bugun', label: 'Bugün' }, { key: 'dun', label: 'Dün' },
    { key: '7g', label: '7 Gün' }, { key: '30g', label: '30 Gün' }, { key: '90g', label: '90 Gün' },
  ]

  return (
    <div>
      <div className="admin-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div className="admin-page-title">İstatistikler</div>
            <div className="admin-page-sub">Ziyaretçi sayısı, konumlar ve sayfa görüntülemeleri.</div>
          </div>
          <button className="admin-btn admin-btn-outline" onClick={() => loadData(dateFrom, dateTo)}>↻ Yenile</button>
        </div>
      </div>

      {/* Google Analytics Banner */}
      <a href="https://analytics.google.com" target="_blank" rel="noopener noreferrer" style={{ display: 'block', textDecoration: 'none', marginBottom: 20 }}>
        <div style={{
          background: 'linear-gradient(135deg, #1557b0 0%, #1a73e8 100%)',
          border: '1px solid rgba(26,115,232,0.4)',
          borderRadius: 12,
          padding: '14px 20px',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 10, width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <rect x="2" y="13" width="4" height="9" rx="1" fill="white" opacity="0.6"/>
                <rect x="9" y="7" width="4" height="15" rx="1" fill="white" opacity="0.8"/>
                <rect x="16" y="2" width="4" height="20" rx="1" fill="white"/>
              </svg>
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#fff', lineHeight: 1.2 }}>Google Analytics 4</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 3 }}>tandirciusta.com · Tüm ziyaretler izleniyor</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.85)', fontSize: 12, fontWeight: 600, flexShrink: 0 }}>
            Raporu Aç
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="2.5">
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
              <polyline points="15 3 21 3 21 9"/>
              <line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
          </div>
        </div>
      </a>

      {/* Tarih Filtresi */}
      <div className="admin-card" style={{ marginBottom: 20, padding: '16px 20px' }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          {PRESETS.map(p => (
            <button key={p.key} onClick={() => applyPreset(p.key)}
              className={`admin-btn ${activePreset === p.key ? 'admin-btn-red' : 'admin-btn-outline'}`}
              style={{ fontSize: 12, padding: '6px 12px' }}>
              {p.label}
            </button>
          ))}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 4, flexWrap: 'wrap' }}>
            <input type="date" value={customFrom}
              onChange={e => { setCustomFrom(e.target.value); setActivePreset('') }}
              style={{ padding: '6px 10px', border: '1.5px solid var(--border-g)', borderRadius: 7, fontSize: 12, fontFamily: 'var(--sans)', background: 'var(--bg)', color: 'var(--text)' }} />
            <span style={{ color: 'var(--muted)', fontSize: 12 }}>–</span>
            <input type="date" value={customTo}
              onChange={e => { setCustomTo(e.target.value); setActivePreset('') }}
              style={{ padding: '6px 10px', border: '1.5px solid var(--border-g)', borderRadius: 7, fontSize: 12, fontFamily: 'var(--sans)', background: 'var(--bg)', color: 'var(--text)' }} />
            <button className="admin-btn admin-btn-red" style={{ fontSize: 12, padding: '6px 14px' }} onClick={applyCustom}>
              Uygula
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="admin-card"><div className="admin-empty">Yükleniyor...</div></div>
      ) : (
        <>
          {/* Özet Kartlar */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 20 }}>
            <div className="admin-card" style={{ padding: '20px 24px', margin: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: 30, fontWeight: 800, color: 'var(--red)', lineHeight: 1, letterSpacing: -1 }}>{totalVisits.toLocaleString('tr-TR')}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 5, fontWeight: 500 }}>Toplam Ziyaret</div>
                </div>
                <div style={{ background: 'rgba(200,37,26,0.08)', borderRadius: 8, padding: '8px', flexShrink: 0 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                  </svg>
                </div>
              </div>
            </div>
            <div className="admin-card" style={{ padding: '20px 24px', margin: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: 30, fontWeight: 800, color: 'var(--red)', lineHeight: 1, letterSpacing: -1 }}>{uniqueIPs.toLocaleString('tr-TR')}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 5, fontWeight: 500 }}>Tekil Ziyaretçi</div>
                </div>
                <div style={{ background: 'rgba(200,37,26,0.08)', borderRadius: 8, padding: '8px', flexShrink: 0 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>
              </div>
            </div>
            <div className="admin-card" style={{ padding: '20px 24px', margin: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: 30, fontWeight: 800, color: 'var(--red)', lineHeight: 1, letterSpacing: -1 }}>{todayVisits.toLocaleString('tr-TR')}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 5, fontWeight: 500 }}>Bugün</div>
                </div>
                <div style={{ background: 'rgba(200,37,26,0.08)', borderRadius: 8, padding: '8px', flexShrink: 0 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Günlük Grafik */}
          {chartDays.length > 0 && chartDays.length <= 91 && (
            <div className="admin-card" style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div className="admin-card-title" style={{ marginBottom: 0 }}>Günlük Ziyaretler</div>
                <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 400 }}>
                  {dateFrom} – {dateTo}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: chartDays.length > 30 ? 2 : 4, height: 130, paddingBottom: showAllLabels ? 22 : 0, position: 'relative' }}>
                {chartDays.map(({ date, label, count }) => (
                  <div key={date} title={`${date}: ${count} ziyaret`}
                    style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%', position: 'relative', cursor: 'default' }}>
                    {count > 0 && chartDays.length <= 14 && (
                      <span style={{ position: 'absolute', top: 0, fontSize: 9, fontWeight: 700, color: 'var(--red)', whiteSpace: 'nowrap' }}>{count}</span>
                    )}
                    <div style={{
                      width: '100%',
                      height: count > 0 ? `${Math.max((count / maxDay) * 100, 5)}%` : '2px',
                      background: count > 0
                        ? `linear-gradient(to top, var(--red), rgba(200,37,26,0.6))`
                        : 'var(--border-g)',
                      borderRadius: '3px 3px 0 0',
                      transition: 'height 0.2s',
                    }} />
                    {showAllLabels && (
                      <span style={{ position: 'absolute', bottom: -18, fontSize: 9, color: 'var(--muted)', whiteSpace: 'nowrap' }}>{label}</span>
                    )}
                  </div>
                ))}
              </div>
              {!showAllLabels && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--muted)', marginTop: 8 }}>
                  <span>{chartDays[0]?.label}</span>
                  <span>{chartDays[Math.floor(chartDays.length / 2)]?.label}</span>
                  <span>{chartDays[chartDays.length - 1]?.label}</span>
                </div>
              )}
            </div>
          )}

          {/* Ülkeler + Sayfalar */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
            <div className="admin-card" style={{ margin: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
                  <path d="M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"/>
                </svg>
                <span className="admin-card-title" style={{ marginBottom: 0 }}>Ülkelere Göre</span>
              </div>
              {topCountries.length === 0 ? <div className="admin-empty" style={{ fontSize: 13 }}>Henüz veri yok.</div> : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {topCountries.map(([country, { count, code }]) => (
                    <div key={country}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                        <span style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 7 }}>
                          <span style={{ fontSize: 16 }}>{countryFlag(code)}</span>
                          <span style={{ color: 'var(--text)' }}>{country}</span>
                        </span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--red)', background: 'rgba(200,37,26,0.07)', padding: '1px 8px', borderRadius: 20 }}>{count}</span>
                      </div>
                      <div style={{ height: 5, background: 'var(--bg3)', borderRadius: 3 }}>
                        <div style={{ height: '100%', background: 'linear-gradient(to right, var(--red), rgba(200,37,26,0.5))', borderRadius: 3, width: `${(count / maxCountry) * 100}%`, transition: 'width 0.3s' }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="admin-card" style={{ margin: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
                </svg>
                <span className="admin-card-title" style={{ marginBottom: 0 }}>Sayfalara Göre</span>
              </div>
              {topPages.length === 0 ? <div className="admin-empty" style={{ fontSize: 13 }}>Henüz veri yok.</div> : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {topPages.map(([page, count]) => (
                    <div key={page}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                        <span style={{ fontSize: 12, color: 'var(--muted)', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '75%' }}>
                          {page || '/'}
                        </span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--red)', background: 'rgba(200,37,26,0.07)', padding: '1px 8px', borderRadius: 20, flexShrink: 0 }}>{count}</span>
                      </div>
                      <div style={{ height: 5, background: 'var(--bg3)', borderRadius: 3 }}>
                        <div style={{ height: '100%', background: 'linear-gradient(to right, var(--red), rgba(200,37,26,0.5))', borderRadius: 3, width: `${(count / maxPage) * 100}%`, transition: 'width 0.3s' }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Top Şehirler */}
          {topCities.length > 0 && (
            <div className="admin-card" style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
                <span className="admin-card-title" style={{ marginBottom: 0 }}>En Çok Ziyaret Eden Şehirler</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {topCities.map(([key, count]) => {
                  const [city, , cc] = key.split('|')
                  return (
                    <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--bg2)', border: '1px solid var(--border-g)', borderRadius: 20, padding: '5px 12px', fontSize: 12 }}>
                      <span>{countryFlag(cc || null)}</span>
                      <span style={{ color: 'var(--text)' }}>{city}</span>
                      <span style={{ fontWeight: 700, color: 'var(--red)' }}>{count}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Son Ziyaretçiler */}
          <div className="admin-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
              </svg>
              <span className="admin-card-title" style={{ marginBottom: 0 }}>Son Ziyaretçiler</span>
              <span style={{ fontWeight: 400, fontSize: 12, color: 'var(--muted)', marginLeft: 2 }}>{data.length} kayıt</span>
            </div>
            {data.length === 0 ? (
              <div className="admin-empty">Seçilen aralıkta ziyaretçi yok.</div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Zaman</th>
                      <th>IP Adresi</th>
                      <th>Konum</th>
                      <th>Sayfa</th>
                      <th>Referans</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.slice(0, 100).map(v => (
                      <tr key={v.id}>
                        <td style={{ fontSize: 11, color: 'var(--muted)', whiteSpace: 'nowrap' }}>{timeAgo(v.created_at)}</td>
                        <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{v.ip || '—'}</td>
                        <td style={{ fontSize: 12 }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                            <span>{countryFlag(v.country_code)}</span>
                            <span>{[v.city, v.country].filter(Boolean).join(', ') || '—'}</span>
                          </span>
                        </td>
                        <td style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--red)' }}>{v.page || '/'}</td>
                        <td style={{ fontSize: 11, color: 'var(--muted)', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {v.referrer || '—'}
                        </td>
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

// ── MAIN ADMIN PAGE ────────────────────────────────────────────

export default function AdminPage() {
  const [authed, setAuthed] = useState(false)
  const [pw, setPw] = useState('')
  const [err, setErr] = useState('')
  const [adminKey, setAdminKey] = useState('')
  const [activeTab, setActiveTab] = useState<Tab>('Sayfalar')
  const [newRequestCount, setNewRequestCount] = useState(0)

  const fetchNewCount = useCallback(async (key: string) => {
    try {
      const res = await fetch('/api/requests', { headers: { 'x-admin-key': key } })
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data)) {
          setNewRequestCount(data.filter((r: Record<string, unknown>) => r.status === 'yeni').length)
        }
      }
    } catch { /* silent */ }
  }, [])

  useEffect(() => {
    const saved = sessionStorage.getItem('admin_key')
    if (saved) { setAdminKey(saved); setAuthed(true); fetchNewCount(saved) }
  }, [fetchNewCount])

  // Talepler sekmesinden çıkınca sayacı güncelle
  useEffect(() => {
    if (authed && adminKey && activeTab !== 'Talepler') {
      fetchNewCount(adminKey)
    }
  }, [activeTab, authed, adminKey, fetchNewCount])

  const login = async () => {
    // POST auth gerektirir — GET her zaman 200 döndüğü için POST kullanıyoruz
    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-key': pw },
      body: JSON.stringify({}),
    })
    if (res.ok) {
      sessionStorage.setItem('admin_key', pw)
      setAdminKey(pw); setAuthed(true); fetchNewCount(pw)
    } else {
      setErr('Yanlış şifre'); setTimeout(() => setErr(''), 2000)
    }
  }

  const logout = () => {
    sessionStorage.removeItem('admin_key')
    setAuthed(false); setAdminKey(''); setPw('')
  }

  const NAV_ICONS: Record<Tab, React.ReactNode> = {
    'Sayfalar': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>,
    'Menü': <svg viewBox="0 0 24 24"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>,
    'Blog & Tarifler': <svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
    'Galeri': <svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
    'Talepler': <svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>,
    'İstatistikler': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  }

  if (!authed) {
    return (
      <div className="admin-login">
        <div className="admin-login-card">
          <div style={{ width: 56, height: 56, borderRadius: 14, background: 'var(--red)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 26 }}>🔥</div>
          <div className="admin-login-logo">Tandırcı Usta®</div>
          <div className="admin-login-sub">Yönetim Paneli — Yetkili Giriş</div>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 6, textAlign: 'left' }}>Şifre</div>
            <input
              type="password"
              placeholder="••••••••"
              value={pw}
              onChange={e => setPw(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && login()}
              style={{ width: '100%', background: 'var(--bg2)', border: '1.5px solid var(--border-g)', padding: '12px 16px', borderRadius: 8, fontSize: 16, outline: 'none', letterSpacing: 4, color: 'var(--black)', fontFamily: 'var(--sans)', transition: 'border-color 0.2s' }}
              onFocus={e => e.target.style.borderColor = 'var(--red)'}
              onBlur={e => e.target.style.borderColor = 'var(--border-g)'}
            />
          </div>
          <button className="btn btn-red" style={{ width: '100%', justifyContent: 'center', padding: '13px', fontSize: 14 }} onClick={login}>
            Giriş Yap
          </button>
          {err && <div className="admin-msg error" style={{ marginTop: 12 }}>{err}</div>}
        </div>
      </div>
    )
  }

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <div className="admin-sidebar">
        <div className="admin-sidebar-logo">Tandırcı Usta®<br /><span style={{ fontSize: 11, fontFamily: 'var(--sans)', color: 'rgba(255,255,255,0.4)', fontWeight: 400 }}>Admin Panel</span></div>
        <nav className="admin-nav">
          {TABS.map(tab => (
            <button
              key={tab}
              className={`admin-nav-item${activeTab === tab ? ' active' : ''}`}
              onClick={() => setActiveTab(tab)}
              style={{ justifyContent: 'space-between' }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {NAV_ICONS[tab]}
                {tab}
              </span>
              {tab === 'Talepler' && newRequestCount > 0 && (
                <span style={{
                  background: 'var(--red)', color: '#fff',
                  fontSize: 10, fontWeight: 700, lineHeight: 1,
                  padding: '3px 7px', borderRadius: 20, minWidth: 18, textAlign: 'center',
                }}>
                  {newRequestCount}
                </span>
              )}
            </button>
          ))}
          <div style={{ marginTop: 'auto', paddingTop: 24 }}>
            <a href="/" target="_blank" rel="noopener" className="admin-nav-item" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>
              <svg viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              Siteyi Gör
            </a>
            <button className="admin-nav-item" onClick={logout} style={{ color: 'rgba(255,255,255,0.4)' }}>
              <svg viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Çıkış
            </button>
          </div>
        </nav>
      </div>

      {/* Main */}
      <main className="admin-main">
        {activeTab === 'Sayfalar' && <PagesTab adminKey={adminKey} />}
        {activeTab === 'Menü' && <MenuTab adminKey={adminKey} />}
        {activeTab === 'Blog & Tarifler' && <BlogTab adminKey={adminKey} />}
        {activeTab === 'Galeri' && <GalleryTab adminKey={adminKey} />}
        {activeTab === 'Talepler' && <TaleplerTab adminKey={adminKey} />}
        {activeTab === 'İstatistikler' && <IstatistiklerTab adminKey={adminKey} />}
      </main>
    </div>
  )
}
