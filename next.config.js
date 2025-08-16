/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    dirs: ['app', 'components', 'lib', 'types'],
  },
  serverExternalPackages: ['@neondatabase/serverless'],
}

module.exports = nextConfig