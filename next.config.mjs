import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'crypto-server.ahadcommit.com',
        pathname: '/uploads/**',
      },
    ],
  },
  reactStrictMode: false,
    typescript: {
    // ❗ WARNING: This allows builds to succeed even with TypeScript errors
    ignoreBuildErrors: true,
  },
   eslint: {
    ignoreDuringBuilds: true,
  },
};

export default withNextIntl(nextConfig);
