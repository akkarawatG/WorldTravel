import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
// 1. แก้ไขคำว่า word ให้เป็น world (เติมตัว L)
  basePath: '/worldtravel',
  
  env: {
    NEXT_PUBLIC_BASE_PATH: '/worldtravel',
  },
  
  reactStrictMode: false,
  
  async redirects() {
    return [
      {
        source: '/',
        destination: '/worldtravel',
        permanent: true,
        // 2. 🟢 จุดสำคัญ: บังคับให้ Next.js ข้าม basePath ตอนเช็คหน้าแรกสุด
        basePath: false, 
      },
    ]
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      {
        protocol: 'https',
        hostname: 'edzeixguwiymhsdlpvag.supabase.co', 
      },
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
      },
      {
        protocol: 'https',
        hostname: 'd1bv4heaa2n05k.cloudfront.net',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
    ],
  },
};

export default nextConfig;