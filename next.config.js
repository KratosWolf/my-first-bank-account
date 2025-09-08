/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Enable ESLint checks during build
    ignoreDuringBuilds: false,
  },
  typescript: {
    // Temporarily ignore build errors during refactoring
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
