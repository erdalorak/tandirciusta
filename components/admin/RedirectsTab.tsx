'use client'

import { useCallback, useEffect, useState } from 'react'
import type { UrlRedirect } from '@/lib/redirects'
import { DOMAIN_ERROR_MESSAGE } from '@/lib/redirects'

type Props = {
  adminKey: string
}

/**
 * 301 Yönlendirme Yönetim Modülü — Admin panel sekmesi.
 * Eski/Yeni URL formu, domain doğrulama uyarıları ve geçmiş liste tablosu.
 */
export default function RedirectsTab({ adminKey }: Props) {
  const [redirects, setRedirects] = useState<UrlRedirect[]>([])
  const [sourceUrl, setSourceUrl] = useState('')
  const [destinationUrl, setDestinationUrl] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const headers = useCallback(
    () => ({
      'Content-Type': 'application/json',
      'x-admin-key': adminKey,
    }),
    [adminKey],
  )

  /** Geçmiş yönlendirme listesini sunucudan yükler */
  const loadRedirects = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/redirects', { headers: headers() })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`)
      setRedirects(Array.isArray(data) ? data : [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Liste yüklenemedi.')
    } finally {
      setLoading(false)
    }
  }, [headers])

  useEffect(() => {
    loadRedirects()
  }, [loadRedirects])

  /** Form gönderimi — yeni 301 yönlendirmesi ekler */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSubmitting(true)

    try {
      const res = await fetch('/api/redirects', {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({
          source_url: sourceUrl,
          destination_url: destinationUrl,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`)

      setSourceUrl('')
      setDestinationUrl('')
      setSuccess('301 yönlendirmesi başarıyla eklendi.')
      await loadRedirects()
      setTimeout(() => setSuccess(''), 4000)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Yönlendirme eklenemedi.')
    } finally {
      setSubmitting(false)
    }
  }

  /** Satırdaki Sil butonu */
  const handleDelete = async (id: string) => {
    if (!confirm('Bu yönlendirmeyi silmek istediğinize emin misiniz?')) return
    setDeletingId(id)
    setError('')
    try {
      const res = await fetch('/api/redirects', {
        method: 'DELETE',
        headers: headers(),
        body: JSON.stringify({ id }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`)
      setSuccess('Yönlendirme silindi.')
      await loadRedirects()
      setTimeout(() => setSuccess(''), 3000)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Silme işlemi başarısız.')
    } finally {
      setDeletingId(null)
    }
  }

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

  const fullUrl = (path: string) => `https://tandirciusta.com${path}`

  return (
    <div>
      <div className="admin-header">
        <div className="admin-page-title">301 Yönlendirme Yönetimi</div>
        <div className="admin-page-sub">
          Eski URL&apos;leri kalıcı olarak (301) yeni adreslere yönlendirin. Yalnızca tandirciusta.com
          domaini desteklenir.
        </div>
      </div>

      {/* ── Yeni yönlendirme formu ── */}
      <div className="admin-card">
        <div className="admin-card-title">Yeni Yönlendirme Ekle</div>

        <form className="admin-form" onSubmit={handleSubmit}>
          <div className="admin-form-row" style={{ alignItems: 'flex-start' }}>
            <div style={{ flex: 1, minWidth: 220 }}>
              <label htmlFor="redirect-source">Eski URL</label>
              <input
                id="redirect-source"
                type="text"
                placeholder="/blog/eski-yazi veya https://tandirciusta.com/blog/eski-yazi"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                disabled={submitting}
                required
              />
            </div>
            <div style={{ flex: 1, minWidth: 220 }}>
              <label htmlFor="redirect-destination">Yeni URL</label>
              <input
                id="redirect-destination"
                type="text"
                placeholder="/tarifler veya https://tandirciusta.com/tarifler"
                value={destinationUrl}
                onChange={(e) => setDestinationUrl(e.target.value)}
                disabled={submitting}
                required
              />
            </div>
          </div>

          <p
            style={{
              fontSize: 12,
              color: 'var(--muted)',
              marginTop: 14,
              lineHeight: 1.5,
              padding: '10px 12px',
              background: 'var(--bg2)',
              borderRadius: 8,
              border: '1px solid var(--border-g)',
            }}
          >
            <strong>Not:</strong> Her iki alana da yalnızca <code>tandirciusta.com</code> adresine ait
            yollar girilmelidir. Farklı bir site URL&apos;si girilirse işlem yapılmaz ve şu uyarı
            gösterilir: &ldquo;{DOMAIN_ERROR_MESSAGE}&rdquo; Yeni eklenen yönlendirmeler en geç 10 saniye
            içinde canlıya yansır.
          </p>

          <div style={{ marginTop: 20 }}>
            <button
              type="submit"
              className="admin-btn admin-btn-red"
              disabled={submitting || !sourceUrl.trim() || !destinationUrl.trim()}
            >
              {submitting ? 'Ekleniyor…' : '301 Yönlendirmesi Ekle'}
            </button>
          </div>
        </form>

        {error && <div className="admin-msg error">{error}</div>}
        {success && <div className="admin-msg success">{success}</div>}
      </div>

      {/* ── Geçmiş yönlendirme tablosu ── */}
      <div className="admin-card">
        <div className="admin-card-title">Geçmiş Yönlendirmeler</div>

        {loading ? (
          <p style={{ fontSize: 13, color: 'var(--muted)' }}>Yükleniyor…</p>
        ) : redirects.length === 0 ? (
          <p style={{ fontSize: 13, color: 'var(--muted)' }}>
            Henüz tanımlı yönlendirme yok. Yukarıdaki formdan ilk 301 kuralınızı ekleyin.
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Eklenme Tarihi</th>
                  <th>Eski URL</th>
                  <th>Yeni URL</th>
                  <th>Yönlendirme Kodu</th>
                  <th style={{ width: 80 }}>İşlem</th>
                </tr>
              </thead>
              <tbody>
                {redirects.map((row) => (
                  <tr key={row.id}>
                    <td style={{ whiteSpace: 'nowrap' }}>{formatDate(row.created_at)}</td>
                    <td>
                      <code style={{ fontSize: 12, wordBreak: 'break-all' }}>{fullUrl(row.source_path)}</code>
                    </td>
                    <td>
                      <code style={{ fontSize: 12, wordBreak: 'break-all' }}>
                        {fullUrl(row.destination_path)}
                      </code>
                    </td>
                    <td>
                      <span className="badge badge-red">{row.status_code}</span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="admin-btn admin-btn-outline"
                        style={{ padding: '6px 10px', fontSize: 11 }}
                        onClick={() => handleDelete(row.id)}
                        disabled={deletingId === row.id}
                      >
                        {deletingId === row.id ? '…' : 'Sil'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
