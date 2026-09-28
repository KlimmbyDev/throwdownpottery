import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Potters became artists; keep old shared links working.
  async redirects() {
    return [
      { source: "/potters", destination: "/artists", permanent: true },
      { source: "/potters/:slug", destination: "/artists/:slug", permanent: true },
      { source: "/studio/potters", destination: "/studio/artists", permanent: true },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
