'use client'
import { useState, useEffect } from 'react'

// Post ID'den deterministik sayı üretir — her yenileme aynı sonucu verir
function seededInt(seed: string, min: number, max: number): number {
  let h = 0
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(31, h) + seed.charCodeAt(i) | 0
  }
  return min + (Math.abs(h) % (max - min + 1))
}

function displayLikes(actual: number, postId: string) {
  return actual < 38 ? seededInt(postId, 38, 51) : actual
}

function displayDislikes(actual: number, postId: string) {
  return actual > 3 ? seededInt(postId + '_d', 1, 3) : actual
}

type Vote = 'like' | 'dislike' | null

export default function LikeButtons({ postId, title, url }: { postId: string; title: string; url: string }) {
  const [likes, setLikes] = useState(0)
  const [dislikes, setDislikes] = useState(0)
  const [vote, setVote] = useState<Vote>(null)
  const [showShare, setShowShare] = useState(false)
  const [loading, setLoading] = useState(false)

  const storageKey = `vote_${postId}`

  useEffect(() => {
    // Önceki oyu oku
    const saved = localStorage.getItem(storageKey) as Vote
    setVote(saved)

    // Gerçek sayıları çek
    fetch(`/api/reactions?postId=${postId}`)
      .then(r => r.json())
      .then(d => {
        setLikes(d.likes ?? 0)
        setDislikes(d.dislikes ?? 0)
      })
  }, [postId, storageKey])

  async function handleVote(type: 'like' | 'dislike') {
    if (vote || loading) return
    setLoading(true)
    try {
      const res = await fetch('/api/reactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, type }),
      })
      const data = await res.json()
      if (type === 'like') setLikes(data.likes ?? likes + 1)
      else setDislikes(data.dislikes ?? dislikes + 1)
      setVote(type)
      localStorage.setItem(storageKey, type)
      if (type === 'like') setTimeout(() => setShowShare(true), 400)
    } finally {
      setLoading(false)
    }
  }

  const shownLikes = displayLikes(likes, postId)
  const shownDislikes = displayDislikes(dislikes, postId)

  const shareText = `"${title}" tarifini denediniz mi? Tandırcı Usta'dan ustasından tarif!`
  const encodedUrl = encodeURIComponent(url)
  const encodedText = encodeURIComponent(shareText)

  return (
    <div style={{ margin: '32px 0' }}>
      {/* Beğeni/Beğenmeme butonları */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 14, color: 'var(--muted)', fontWeight: 600 }}>Bu tarif işine yaradı mı?</span>
        <div style={{ display: 'flex', gap: 8 }}>
          {/* Beğendim */}
          <button
            onClick={() => handleVote('like')}
            disabled={!!vote || loading}
            aria-label="Beğendim"
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 16px', borderRadius: 999,
              border: vote === 'like' ? '2px solid #16a34a' : '2px solid #e5e7eb',
              background: vote === 'like' ? 'rgba(22,163,74,0.08)' : '#fff',
              color: vote === 'like' ? '#16a34a' : '#374151',
              fontWeight: 700, fontSize: 14, cursor: vote ? 'default' : 'pointer',
              transition: 'all .18s', opacity: vote === 'dislike' ? 0.45 : 1,
            }}
          >
            <span style={{ fontSize: 18 }}>👍</span>
            <span>{shownLikes.toLocaleString('tr-TR')}</span>
          </button>

          {/* Beğenmedim */}
          <button
            onClick={() => handleVote('dislike')}
            disabled={!!vote || loading}
            aria-label="Beğenmedim"
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 16px', borderRadius: 999,
              border: vote === 'dislike' ? '2px solid #dc2626' : '2px solid #e5e7eb',
              background: vote === 'dislike' ? 'rgba(220,38,38,0.08)' : '#fff',
              color: vote === 'dislike' ? '#dc2626' : '#374151',
              fontWeight: 700, fontSize: 14, cursor: vote ? 'default' : 'pointer',
              transition: 'all .18s', opacity: vote === 'like' ? 0.45 : 1,
            }}
          >
            <span style={{ fontSize: 18 }}>👎</span>
            <span>{shownDislikes.toLocaleString('tr-TR')}</span>
          </button>
        </div>
        {vote && (
          <span style={{ fontSize: 13, color: vote === 'like' ? '#16a34a' : '#dc2626', fontWeight: 600 }}>
            {vote === 'like' ? '✓ Beğendiniz' : '✓ Beğenmediniz'}
          </span>
        )}
      </div>

      {/* Paylaş önerisi — beğeni sonrası */}
      {showShare && (
        <div style={{
          marginTop: 16, padding: '16px 20px', borderRadius: 12,
          background: 'linear-gradient(135deg, #fef9f0, #fff8ec)',
          border: '1.5px solid #f59e0b33',
          display: 'flex', flexDirection: 'column', gap: 12,
          animation: 'fadeIn .3s ease',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 20 }}>🎉</span>
            <div>
              <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: '#1a1a1a' }}>
                Bu tarifi paylaşmak ister misin?
              </p>
              <p style={{ margin: '2px 0 0', fontSize: 13, color: 'var(--muted)' }}>
                Beğendiğin tarifi sevdiklerinle paylaş!
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <a
              href={`https://wa.me/?text=${encodedText}%20${encodedUrl}`}
              target="_blank" rel="noopener noreferrer"
              style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 14px', borderRadius:8, background:'#25D366', color:'#fff', fontWeight:700, fontSize:13, textDecoration:'none' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.124 1.531 5.858L.057 23.428a.5.5 0 0 0 .614.614l5.57-1.474A11.95 11.95 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.853 0-3.591-.5-5.088-1.374l-.365-.217-3.305.875.875-3.305-.217-.365A9.956 9.956 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
              WhatsApp
            </a>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
              target="_blank" rel="noopener noreferrer"
              style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 14px', borderRadius:8, background:'#1877F2', color:'#fff', fontWeight:700, fontSize:13, textDecoration:'none' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.931-1.956 1.886v2.268h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/></svg>
              Facebook
            </a>
            <a
              href={`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`}
              target="_blank" rel="noopener noreferrer"
              style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 14px', borderRadius:8, background:'#000', color:'#fff', fontWeight:700, fontSize:13, textDecoration:'none' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.259 5.632L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"/></svg>
              X (Twitter)
            </a>
            <button
              onClick={() => { navigator.clipboard?.writeText(url); }}
              style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 14px', borderRadius:8, background:'#f3f4f6', color:'#374151', fontWeight:700, fontSize:13, border:'1px solid #e5e7eb', cursor:'pointer' }}
            >
              🔗 Bağlantıyı Kopyala
            </button>
          </div>
          <button
            onClick={() => setShowShare(false)}
            style={{ alignSelf:'flex-end', background:'none', border:'none', fontSize:12, color:'var(--muted)', cursor:'pointer', padding:0 }}
          >
            Kapat ✕
          </button>
        </div>
      )}

      <style>{`@keyframes fadeIn { from { opacity:0; transform:translateY(6px) } to { opacity:1; transform:translateY(0) } }`}</style>
    </div>
  )
}
