/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode for better development experience
  reactStrictMode: true,

  // Image optimization configuration
  images: {
    // Allow images from Supabase storage and common image hosts
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.in',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },

  // Environment variables that should be available at build time
  // (Note: NEXT_PUBLIC_ variables are automatically available)
  env: {
    // Optional: Set default values or expose non-public vars if needed
  },
};

export default nextConfig;

