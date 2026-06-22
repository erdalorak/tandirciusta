import type { ReactNode } from 'react'
import type { Viewport } from 'next'

export const viewport: Viewport = {
  themeColor: '#C8251A',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function MenuLayout({ children }: { children: ReactNode }) {
  return children
}
