/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@basedcollective/shared'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.r2.cloudflarestorage.com' },
      { protocol: 'https', hostname: '*.cloudflare.com' },
    ],
  },
};

module.exports = nextConfig;
