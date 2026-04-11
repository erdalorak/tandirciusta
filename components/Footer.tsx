import Link from 'next/link'

type Props = {
  phone?: string
  address?: string
  instagram?: string
  whatsapp?: string
  hoursWeekday?: string
  hoursSaturday?: string
  hoursSunday?: string
}

export default function Footer({
  phone = '+90 XXX XXX XX XX',
  address = 'Ahievran Mah. 738. Sk. No:9, Kırşehir',
  instagram = 'https://instagram.com/tandirciusta',
  whatsapp = '90XXXXXXXXXX',
  hoursWeekday = '09:00 – 21:00',
  hoursSaturday = '09:00 – 22:00',
  hoursSunday = '10:00 – 21:00',
}: Props) {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="footer-logo-text">Tandırcı<span>.</span>Usta</div>
            <p className="footer-desc">
              Kırşehir&apos;in geleneksel tandır restoranı. Ateşin sabrıyla, ustanın elleriyle pişirilmiş Anadolu lezzetleri.
            </p>
          </div>
          <div>
            <div className="footer-heading">Sayfalar</div>
            <ul className="footer-links">
              <li><a href="/#menu">Menü</a></li>
              <li><a href="/#hakkimizda">Hakkımızda</a></li>
              <li><a href="/#galeri">Galeri</a></li>
              <li><Link href="/blog">Blog & Tarifler</Link></li>
              <li><a href="/#iletisim">İletişim</a></li>
            </ul>
          </div>
          <div>
            <div className="footer-heading">İletişim</div>
            <div className="footer-contact-item">
              <svg viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.7 10.5 19.79 19.79 0 01.67 2.11 2 2 0 012.68 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.09 6.09l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14.92v2z" /></svg>
              <a href={`tel:${phone?.replace(/\s/g, '')}`}>{phone}</a>
            </div>
            <div className="footer-contact-item">
              <svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
              <span>{address}</span>
            </div>
          </div>
          <div>
            <div className="footer-heading">Çalışma Saatleri</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.8 }}>
              <div><strong style={{ color: 'rgba(255,255,255,0.85)' }}>Hf. içi:</strong> {hoursWeekday}</div>
              <div><strong style={{ color: 'rgba(255,255,255,0.85)' }}>Cumartesi:</strong> {hoursSaturday}</div>
              <div><strong style={{ color: 'rgba(255,255,255,0.85)' }}>Pazar:</strong> {hoursSunday}</div>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-copy">
            © {new Date().getFullYear()} Tandırcı Usta · Tüm hakları saklıdır.
          </div>
          <div className="footer-social">
            <a href={instagram} target="_blank" rel="noopener" aria-label="Instagram">
              <svg viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" /></svg>
            </a>
            <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener" aria-label="WhatsApp">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
