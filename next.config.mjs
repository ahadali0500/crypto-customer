import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 's3.us-east-1.amazonaws.com',
      pathname: '/bexchange.io/public/**',
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
