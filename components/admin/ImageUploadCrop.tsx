'use client'
import { useState, useRef, useCallback } from 'react'
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'

export type AspectRatio = '16:9' | '4:3' | '1:1' | 'free'

interface Props {
  value: string           // current image URL
  settingKey: string      // e.g. "hero_image"
  aspectRatio?: AspectRatio
  label?: string
  adminKey: string
  onChange: (url: string, width: number) => void  // url + display width %
  displayWidth?: number   // 25 | 50 | 75 | 100
}

const ASPECT_MAP: Record<AspectRatio, number | undefined> = {
  '16:9': 16 / 9,
  '4:3': 4 / 3,
  '1:1': 1,
  'free': undefined,
}

function centerAspectCrop(width: number, height: number, aspect: number) {
  return centerCrop(makeAspectCrop({ unit: '%', width: 90 }, aspect, width, height), width, height)
}

export default function ImageUploadCrop({ value, aspectRatio = 'free', label, adminKey, onChange, displayWidth = 100 }: Props) {
  const [modalOpen, setModalOpen] = useState(false)
  const [srcImg, setSrcImg] = useState<string | null>(null)
  const [crop, setCrop] = useState<Crop>()
  const [uploading, setUploading] = useState(false)
  const [width, setWidth] = useState(displayWidth)
  const imgRef = useRef<HTMLImageElement | null>(null)

  const openFile = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = () => { setSrcImg(reader.result as string); setModalOpen(true) }
      reader.readAsDataURL(file)
    }
    input.click()
  }

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth: w, naturalHeight: h } = e.currentTarget
    const aspect = ASPECT_MAP[aspectRatio]
    if (aspect) {
      setCrop(centerAspectCrop(w, h, aspect))
    } else {
      setCrop({ unit: '%', x: 5, y: 5, width: 90, height: 90 })
    }
  }, [aspectRatio])

  const applyCrop = async () => {
    if (!imgRef.current || !crop) return
    setUploading(true)
    try {
      const canvas = document.createElement('canvas')
      const img = imgRef.current
      const scaleX = img.naturalWidth / img.width
      const scaleY = img.naturalHeight / img.height
      const pixelCrop = crop.unit === '%'
        ? {
            x: (crop.x / 100) * img.naturalWidth,
            y: (crop.y / 100) * img.naturalHeight,
            width: (crop.width / 100) * img.naturalWidth,
            height: (crop.height / 100) * img.naturalHeight,
          }
        : { x: crop.x * scaleX, y: crop.y * scaleY, width: crop.width * scaleX, height: crop.height * scaleY }

      canvas.width = pixelCrop.width
      canvas.height = pixelCrop.height
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, pixelCrop.width, pixelCrop.height)

      const blob = await new Promise<Blob>((res) => canvas.toBlob(b => res(b!), 'image/webp', 0.88))
      const fd = new FormData()
      fd.append('file', blob, 'image.webp')
      const res = await fetch('/api/upload', { method: 'POST', headers: { 'x-admin-key': adminKey }, body: fd })
      const data = await res.json()
      if (data.url) { onChange(data.url, width); setModalOpen(false); setSrcImg(null) }
    } finally { setUploading(false) }
  }

  return (
    <div className="iuc-root">
      {label && <label className="iuc-label">{label}</label>}

      {/* Preview + controls */}
      <div className="iuc-preview-row">
        <div className="iuc-preview-wrap" style={{ width: `${width}%` }}>
          {value
            ? <img src={value} alt="" className="iuc-preview-img" />
            : <div className="iuc-placeholder">Görsel yok</div>
          }
        </div>
        <div className="iuc-controls">
          <button className="admin-btn admin-btn-outline" onClick={openFile} type="button">
            {value ? '🔄 Değiştir' : '📷 Görsel Seç'}
          </button>
          {value && (
            <button className="admin-btn admin-btn-danger" onClick={() => onChange('', width)} type="button" style={{ fontSize: 12 }}>
              Kaldır
            </button>
          )}
          <div className="iuc-slider-wrap">
            <span className="iuc-slider-label">Genişlik: <strong>{width}%</strong></span>
            <input
              type="range" min={25} max={100} step={25}
              value={width}
              onChange={e => { const v = Number(e.target.value); setWidth(v); if (value) onChange(value, v) }}
              className="iuc-slider"
            />
            <div className="iuc-slider-ticks">
              {[25, 50, 75, 100].map(v => <span key={v} style={{ opacity: width === v ? 1 : 0.4 }}>{v}%</span>)}
            </div>
          </div>
        </div>
      </div>

      {/* Crop modal */}
      {modalOpen && srcImg && (
        <div className="iuc-modal-overlay" onClick={e => { if (e.target === e.currentTarget) setModalOpen(false) }}>
          <div className="iuc-modal">
            <div className="iuc-modal-header">
              <span>Görseli Kırp</span>
              <button onClick={() => setModalOpen(false)} className="iuc-close">✕</button>
            </div>
            <div className="iuc-modal-body">
              <ReactCrop
                crop={crop}
                onChange={c => setCrop(c)}
                aspect={ASPECT_MAP[aspectRatio]}
                style={{ maxHeight: '60vh', maxWidth: '100%' }}
              >
                <img
                  ref={imgRef}
                  src={srcImg}
                  onLoad={onImageLoad}
                  style={{ maxHeight: '60vh', maxWidth: '100%', display: 'block' }}
                  alt="crop"
                />
              </ReactCrop>
            </div>
            <div className="iuc-modal-footer">
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>
                Oran: {aspectRatio === 'free' ? 'Serbest' : aspectRatio}
              </span>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="admin-btn admin-btn-outline" onClick={() => setModalOpen(false)}>İptal</button>
                <button className="admin-btn admin-btn-red" onClick={applyCrop} disabled={uploading}>
                  {uploading ? 'Yükleniyor...' : 'Uygula & Kaydet'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
