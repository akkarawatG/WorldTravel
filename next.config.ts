/** @type {import('next').NextConfig} */
const nextConfig = {
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
      // 👇 เพิ่มโดเมน CloudFront ที่ Error แจ้งเตือนล่าสุดเข้าไปครับ
      {
        protocol: 'https',
        hostname: 'd1bv4heaa2n05k.cloudfront.net',
      },
    ],
  },
};

export default nextConfig;