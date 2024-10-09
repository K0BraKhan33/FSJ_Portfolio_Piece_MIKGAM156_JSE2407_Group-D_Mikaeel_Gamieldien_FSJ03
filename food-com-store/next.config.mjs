// next.config.js

/** @type {import('next').NextConfig} */

const { RecaptchaAuthConfig } = require('firebase-admin/lib/auth/auth-config');
const withPWA=require('next-pwa');
module.exports=withPWA({
  reactStrictMode: true,
  pwa:"public",
  register: true,
  skip:true,
  disable:process.env.NODE_ENV === 'development'
});
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
