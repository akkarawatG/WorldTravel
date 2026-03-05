import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
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
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
    ],
  },
};

export default nextConfig;