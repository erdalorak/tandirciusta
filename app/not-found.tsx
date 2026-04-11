import Link from 'next/link'
import Nav from '@/components/Nav'

export default function NotFound() {
  return (
    <>
      <Nav />
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', textAlign: 'center', padding: 40, paddingTop: 120 }}>
        <p style={{ fontSize: 80, fontFamily: 'var(--serif)', fontWeight: 700, color: 'var(--red)', lineHeight: 1 }}>404</p>
        <h1 style={{ fontFamily: 'var(--serif)', fontSize: 28, color: 'var(--black)', margin: '16px 0 12px' }}>Sayfa Bulunamadı</h1>
        <p style={{ color: 'var(--muted)', marginBottom: 32 }}>Aradığınız sayfa mevcut değil.</p>
        <Link href="/" className="btn btn-red">Ana Sayfaya Dön</Link>
      </div>
    </>
  )
}
