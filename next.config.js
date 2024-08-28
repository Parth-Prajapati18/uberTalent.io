/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // missingSuspenseWithCSRBailout: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'tailwindui.com',
        port: '',
        pathname: '/img/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.clerk.dev',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'ha0zvfuhxvqxvltz.public.blob.vercel-storage.com',
        port: '',
        pathname: '/**',
      }
    ],
    dangerouslyAllowSVG: true,
  },
};
module.exports = nextConfig;
