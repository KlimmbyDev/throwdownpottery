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
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Nobody may frame the site (clickjacking on the studio).
          { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "rvmizfbwvktytmnpnbgi.supabase.co",
        pathname: "/storage/v1/object/public/pottery-images/**",
      },
    ],
  },
};

export default nextConfig;
