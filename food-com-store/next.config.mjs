/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['cdn.dummyjson.com'], // Add the allowed hostname here
  },
  //telemetry: false, // Disable telemetry
};

export default nextConfig;
