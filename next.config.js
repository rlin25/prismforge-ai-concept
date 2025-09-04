/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Enterprise-grade TypeScript configuration
    tsconfigPath: './tsconfig.json',
  },
  eslint: {
    // Strict linting for enterprise code quality
    ignoreDuringBuilds: false,
  },
  env: {
    // Environment variables for enterprise deployment
    NEXT_PUBLIC_APP_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_APP_NAME: 'PrismForge AI',
    NEXT_PUBLIC_APP_VERSION: '1.0.0',
  },
  // Security headers for enterprise deployment
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;