/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { unoptimized: true },
  poweredByHeader: false,
  compress: true,
  reactStrictMode: true,
  // output: 'export', // Disabled: API routes require server-side rendering
};

export default nextConfig;