'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', fn, { passive: true })
    fn()
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const close = () => setOpen(false)

  return (
    <>
      <nav className={`nav${scrolled ? ' scrolled' : ''}`}>
        <div className="nav-inner">
          <Link href="/" className="nav-logo" onClick={close}>
            <img src="/logo.png" alt="Tandırcı Usta" height={120} style={{objectFit:'contain'}} />
            <span className="nav-hashtag">#MesleğinPîri</span>
          </Link>

          <ul className="nav-links">
            <li><a href="/#menu">Menü</a></li>
            <li><a href="/#hakkimizda">Hakkımızda</a></li>
            <li><a href="/#yorumlar">Yorumlar</a></li>
            <li><a href="/#markalar">Markalar</a></li>
            <li><Link href="/blog">Blog & Tarifler</Link></li>
            <li><a href="/#iletisim">İletişim</a></li>
            <li><a href="/#rezervasyon" className="nav-cta">Rezervasyon</a></li>
          </ul>

          <button className="hamburger" onClick={() => setOpen(o => !o)} aria-label="Menüyü aç">
            <span /><span /><span />
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <div className={`mobile-menu${open ? ' open' : ''}`}>
        <button className="mobile-close" onClick={close}>✕</button>
        <a href="/#menu" onClick={close}>Menü</a>
        <a href="/#hakkimizda" onClick={close}>Hakkımızda</a>
        <a href="/#yorumlar" onClick={close}>Yorumlar</a>
        <a href="/#markalar" onClick={close}>Markalar</a>
        <Link href="/blog" onClick={close}>Blog & Tarifler</Link>
        <a href="/#rezervasyon" onClick={close}>Rezervasyon</a>
        <a href="/#iletisim" onClick={close}>İletişim & Konum</a>
      </div>
    </>
  )
}
