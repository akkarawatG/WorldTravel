/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/wordtravel',
  env: {
    NEXT_PUBLIC_BASE_PATH: '/wordtravel',
  },
  reactStrictMode: false,
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
      // ✅ เพิ่มอันนี้เข้าไปครับ เพื่อแก้ Error ล่าสุด
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
    ],
  },
};

export default nextConfig;