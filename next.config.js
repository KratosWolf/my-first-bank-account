/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Enable ESLint checks during build
    ignoreDuringBuilds: false,
  },
  typescript: {
    // Enable TypeScript checks during build
    ignoreBuildErrors: false,
  },
  experimental: {
    // Enable optimizations for better performance
    optimizeCss: true,
  },
};

module.exports = nextConfig;
