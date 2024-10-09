// next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/',
        destination: '/product/productsPage',
        permanent: true, // Use `true` for a permanent redirect
      },
    ];
  },
  images: {
    domains: ['cdn.dummyjson.com'], // Add the allowed hostname here
  },
  // telemetry: false, // Uncomment to disable telemetry
};

module.exports = nextConfig;
