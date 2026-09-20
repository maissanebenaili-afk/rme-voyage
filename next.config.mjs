/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' },
      {
        protocol: 'https',
        hostname: 'commons.wikimedia.org',
        pathname: '/wiki/Special:FilePath/**',
      },
    ],
  },
  poweredByHeader: false,
  compress: true,
  reactStrictMode: true,
  // output: 'export', // Disabled: API routes require server-side rendering
};

export default nextConfig;
