/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'uwgzfxxbgqgmqxugmsdh.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/photos/**',
      },
    ],
  },
};

export default nextConfig;