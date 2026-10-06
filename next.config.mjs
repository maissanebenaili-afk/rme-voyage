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
  // Un lien partagé (/?from=…&to=…) est servi par /partage pour porter un
  // aperçu WhatsApp propre au trajet ; l'accueil sans paramètres reste statique.
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/',
          has: [{ type: 'query', key: 'from' }, { type: 'query', key: 'to' }],
          destination: '/partage',
        },
      ],
    };
  },
  // output: 'export', // Disabled: API routes require server-side rendering
};

export default nextConfig;
