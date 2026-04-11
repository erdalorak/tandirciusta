'use client'
import { useState } from 'react'
import type { MenuCategory, MenuItem } from '@/lib/supabase'

type Props = {
  categories: MenuCategory[]
  items: MenuItem[]
}

export default function MenuClient({ categories, items }: Props) {
  const [active, setActive] = useState<string>('all')

  const filtered = items.filter(i => active === 'all' || i.category_id === active)

  return (
    <>
      <div className="menu-filter reveal">
        <button
          className={`filter-btn${active === 'all' ? ' active' : ''}`}
          onClick={() => setActive('all')}
        >
          Tümü
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            className={`filter-btn${active === cat.id ? ' active' : ''}`}
            onClick={() => setActive(cat.id)}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <div className="menu-grid reveal reveal-d1">
        {filtered.length === 0 ? (
          <div className="menu-empty">Bu kategoride henüz ürün yok.</div>
        ) : (
          filtered.map(item => (
            <div key={item.id} className="menu-card">
              {item.image_url && (
                <div className="menu-card-img">
                  <img src={item.image_url} alt={item.name} loading="lazy" />
                </div>
              )}
              <div className="menu-card-top">
                <div className="menu-card-name">{item.name}</div>
                {item.price && <div className="menu-card-price">{item.price}</div>}
              </div>
              {item.description && <div className="menu-card-desc">{item.description}</div>}
              {item.is_featured && <span className="menu-card-badge">⭐ Öne Çıkan</span>}
            </div>
          ))
        )}
      </div>
    </>
  )
}
