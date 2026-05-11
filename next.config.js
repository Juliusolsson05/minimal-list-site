function getSupabaseHostname() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return undefined;

  try {
    return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname;
  } catch {
    return undefined;
  }
}

const supabaseHostname = getSupabaseHostname();
const supabaseStorageBucket = process.env.SUPABASE_STORAGE_BUCKET || 'minimal-list';

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',

  images: {
    unoptimized: true,
    remotePatterns: supabaseHostname
      ? [
          {
            protocol: 'https',
            hostname: supabaseHostname,
            port: '',
            pathname: `/storage/v1/object/public/${supabaseStorageBucket}/**`,
          },
        ]
      : [],
  },

  // Enable React strict mode for better development experience
  reactStrictMode: true,

  // Aggressive static optimization
  experimental: {
    // Optimize package imports for faster builds
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons', 'date-fns'],
  },

  // Aggressive caching headers for static assets
  async headers() {
    return [
      {
        // Cache static assets for 1 year
        source: '/:all*(svg|jpg|jpeg|png|gif|ico|webp|woff|woff2)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Cache JS/CSS bundles for 1 year (they have content hashes)
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Cache data fetches with stale-while-revalidate
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
        ],
      },
    ];
  },

  // Compress responses
  compress: true,

  // Power optimizations
  poweredByHeader: false,
};

module.exports = nextConfig;
