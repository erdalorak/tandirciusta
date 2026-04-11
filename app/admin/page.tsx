'use client'
import { useState, useEffect, useCallback, useRef } from 'react'

const TABS = ['Genel Ayarlar', 'Menü', 'Blog & Tarifler', 'Galeri'] as const
type Tab = typeof TABS[number]

type Post = { id: string; title: string; slug: string; published: boolean; created_at: string; excerpt: string }
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

  const load = useCallback(async () => {
    const data = await get('/api/posts')
    setPosts(Array.isArray(data) ? data : [])
  }, [get])

  useEffect(() => { load() }, [load])

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

// ── MAIN ADMIN PAGE ────────────────────────────────────────────

export default function AdminPage() {
  const [authed, setAuthed] = useState(false)
  const [pw, setPw] = useState('')
  const [err, setErr] = useState('')
  const [adminKey, setAdminKey] = useState('')
  const [activeTab, setActiveTab] = useState<Tab>('Genel Ayarlar')

  useEffect(() => {
    const saved = sessionStorage.getItem('admin_key')
    if (saved) { setAdminKey(saved); setAuthed(true) }
  }, [])

  const login = async () => {
    const res = await fetch('/api/settings', { headers: { 'x-admin-key': pw } })
    if (res.ok) {
      sessionStorage.setItem('admin_key', pw)
      setAdminKey(pw); setAuthed(true)
    } else {
      setErr('Yanlış şifre'); setTimeout(() => setErr(''), 2000)
    }
  }

  const logout = () => {
    sessionStorage.removeItem('admin_key')
    setAuthed(false); setAdminKey(''); setPw('')
  }

  const NAV_ICONS: Record<Tab, React.ReactNode> = {
    'Genel Ayarlar': <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/></svg>,
    'Menü': <svg viewBox="0 0 24 24"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>,
    'Blog & Tarifler': <svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
    'Galeri': <svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
  }

  if (!authed) {
    return (
      <div className="admin-login">
        <div className="admin-login-card">
          <div className="admin-login-logo">Tandırcı Usta</div>
          <div className="admin-login-sub">Admin Paneli</div>
          <input
            type="password"
            placeholder="••••••••"
            value={pw}
            onChange={e => setPw(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && login()}
            style={{ width: '100%', background: 'var(--bg2)', border: '1.5px solid var(--border-g)', padding: '12px 16px', borderRadius: 8, fontSize: 16, marginBottom: 12, outline: 'none', textAlign: 'center', letterSpacing: 4, color: 'var(--black)', fontFamily: 'var(--sans)' }}
          />
          <button className="btn btn-red" style={{ width: '100%', justifyContent: 'center' }} onClick={login}>
            Giriş Yap
          </button>
          {err && <div className="admin-msg error">{err}</div>}
        </div>
      </div>
    )
  }

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <div className="admin-sidebar">
        <div className="admin-sidebar-logo">Tandırcı Usta<br /><span style={{ fontSize: 11, fontFamily: 'var(--sans)', color: 'rgba(255,255,255,0.4)', fontWeight: 400 }}>Admin Panel</span></div>
        <nav className="admin-nav">
          {TABS.map(tab => (
            <button
              key={tab}
              className={`admin-nav-item${activeTab === tab ? ' active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {NAV_ICONS[tab]}
              {tab}
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
        {activeTab === 'Genel Ayarlar' && <SettingsTab adminKey={adminKey} />}
        {activeTab === 'Menü' && <MenuTab adminKey={adminKey} />}
        {activeTab === 'Blog & Tarifler' && <BlogTab adminKey={adminKey} />}
        {activeTab === 'Galeri' && <GalleryTab adminKey={adminKey} />}
      </main>
    </div>
  )
}
