
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/v0/b/mystic-muse-rj8ab.appspot.com/o/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co', // Added for rune placeholder images
        port: '',
        pathname: '/**',
      }
    ],
  },
};

export default nextConfig;
