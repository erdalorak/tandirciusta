'use client'
import { useState } from 'react'

type Tab = 'rezervasyon' | 'catering' | 'oneri'

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: 'rezervasyon', label: 'Rezervasyon', icon: '🍽️' },
  { key: 'catering',    label: 'Catering / Toplu Sipariş', icon: '🎉' },
  { key: 'oneri',       label: 'Öneri & Şikayet', icon: '💬' },
]

const EVENT_TYPES = ['Düğün', 'Nişan', 'Doğum Günü', 'İş Yemeği', 'Sünnet', 'Diğer']

export default function RequestForm({ whatsapp }: { whatsapp?: string }) {
  const [tab, setTab] = useState<Tab>('rezervasyon')
  const [form, setForm] = useState({
    name: '', phone: '', date: '', time: '', guests: '',
    event_type: '', note: '',
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [waUrl, setWaUrl] = useState('')

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const buildWaMessage = (type: Tab) => {
    const lines: string[] = []
    if (type === 'rezervasyon') {
      lines.push('🍽️ *Yeni Rezervasyon Talebi*')
      lines.push(`👤 Ad: ${form.name}`)
      if (form.phone)  lines.push(`📞 Telefon: ${form.phone}`)
      if (form.date)   lines.push(`📅 Tarih: ${form.date}`)
      if (form.time)   lines.push(`⏰ Saat: ${form.time}`)
      if (form.guests) lines.push(`👥 Kişi Sayısı: ${form.guests}`)
      if (form.note)   lines.push(`📝 Not: ${form.note}`)
    } else if (type === 'catering') {
      lines.push('🎉 *Yeni Catering Talebi*')
      lines.push(`👤 Ad: ${form.name}`)
      if (form.phone)      lines.push(`📞 Telefon: ${form.phone}`)
      if (form.event_type) lines.push(`🎊 Etkinlik: ${form.event_type}`)
      if (form.date)       lines.push(`📅 Tarih: ${form.date}`)
      if (form.guests)     lines.push(`👥 Kişi Sayısı: ${form.guests}`)
      if (form.note)       lines.push(`📝 Not: ${form.note}`)
    } else {
      lines.push('💬 *Yeni Öneri / Şikayet*')
      lines.push(`👤 Ad: ${form.name}`)
      if (form.phone) lines.push(`📞 Telefon: ${form.phone}`)
      if (form.note)  lines.push(`📝 Mesaj: ${form.note}`)
    }
    return encodeURIComponent(lines.join('\n'))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')

    const payload = {
      type: tab,
      name: form.name,
      phone: form.phone,
      date: form.date || null,
      time: form.time || null,
      guests: form.guests ? parseInt(form.guests) : null,
      event_type: form.event_type || null,
      note: form.note || null,
    }

    const res = await fetch('/api/requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error || 'Bir hata oluştu.')
      setLoading(false)
      return
    }

    // WhatsApp linki oluştur
    const num = (whatsapp || '').replace(/[^0-9]/g, '')
    const url = `https://wa.me/${num}?text=${buildWaMessage(tab)}`
    setWaUrl(url)
    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div className="request-success">
        <div className="request-success-icon">✅</div>
        <h3>Talebiniz Alındı!</h3>
        <p>En kısa sürede sizinle iletişime geçeceğiz. WhatsApp üzerinden de onaylayabilirsiniz.</p>
        {waUrl && (
          <a href={waUrl} target="_blank" rel="noopener" className="btn btn-dark" style={{ marginTop: 20 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            WhatsApp ile Onayla
          </a>
        )}
        <button className="btn btn-outline" style={{ marginTop: 12 }} onClick={() => { setSuccess(false); setForm({ name:'',phone:'',date:'',time:'',guests:'',event_type:'',note:'' }) }}>
          Yeni Talep
        </button>
      </div>
    )
  }

  return (
    <div className="request-form-wrap">
      {/* Sekme butonları */}
      <div className="request-tabs">
        {TABS.map(t => (
          <button
            key={t.key}
            className={`request-tab${tab === t.key ? ' active' : ''}`}
            onClick={() => setTab(t.key)}
            type="button"
          >
            <span className="request-tab-icon">{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      <form className="request-form" onSubmit={handleSubmit}>
        {/* Ad — her formda */}
        <div className="rf-row">
          <div className="rf-field">
            <label>Ad Soyad *</label>
            <input required value={form.name} onChange={e => set('name', e.target.value)} placeholder="Adınız Soyadınız" />
          </div>
          <div className="rf-field">
            <label>Telefon</label>
            <input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="05xx xxx xx xx" type="tel" />
          </div>
        </div>

        {/* Rezervasyon alanları */}
        {tab === 'rezervasyon' && (
          <div className="rf-row">
            <div className="rf-field">
              <label>Tarih</label>
              <input type="date" value={form.date} onChange={e => set('date', e.target.value)} min={new Date().toISOString().split('T')[0]} />
            </div>
            <div className="rf-field">
              <label>Saat</label>
              <input type="time" value={form.time} onChange={e => set('time', e.target.value)} />
            </div>
            <div className="rf-field">
              <label>Kişi Sayısı</label>
              <input type="number" min={1} max={500} value={form.guests} onChange={e => set('guests', e.target.value)} placeholder="Kişi sayısı" />
            </div>
          </div>
        )}

        {/* Catering alanları */}
        {tab === 'catering' && (
          <div className="rf-row">
            <div className="rf-field">
              <label>Etkinlik Türü</label>
              <select value={form.event_type} onChange={e => set('event_type', e.target.value)}>
                <option value="">Seçiniz</option>
                {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="rf-field">
              <label>Tarih</label>
              <input type="date" value={form.date} onChange={e => set('date', e.target.value)} min={new Date().toISOString().split('T')[0]} />
            </div>
            <div className="rf-field">
              <label>Kişi Sayısı</label>
              <input type="number" min={1} max={5000} value={form.guests} onChange={e => set('guests', e.target.value)} placeholder="Tahmini kişi sayısı" />
            </div>
          </div>
        )}

        {/* Not / Mesaj */}
        <div className="rf-field">
          <label>{tab === 'oneri' ? 'Mesajınız *' : 'Eklemek İstedikleriniz'}</label>
          <textarea
            value={form.note}
            onChange={e => set('note', e.target.value)}
            placeholder={tab === 'oneri' ? 'Öneri veya şikayetinizi yazın...' : 'Özel istek, alerji, dikkat edilmesi gereken hususlar...'}
            rows={4}
            required={tab === 'oneri'}
          />
        </div>

        {error && <div className="rf-error">{error}</div>}

        <button type="submit" className="btn btn-red" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '14px 24px', fontSize: 15 }}>
          {loading ? 'Gönderiliyor...' : 'Talebi Gönder'}
        </button>
      </form>
    </div>
  )
}
