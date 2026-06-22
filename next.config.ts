import type { NextConfig } from 'next'
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.googleusercontent.com' },
      { protocol: 'https', hostname: '**.googleapis.com' },
    ],
  },
  async redirects() {
    return [
      {
        source: '/admin',
        destination: '/tusta',
        permanent: true,
      },
    ]
  },
}
export default nextConfig
