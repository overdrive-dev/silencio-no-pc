import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/pcs", destination: "/dispositivos", permanent: true },
      { source: "/pc/:id", destination: "/dispositivo/:id", permanent: true },
      { source: "/pc/:id/:path*", destination: "/dispositivo/:id/:path*", permanent: true },
      { source: "/api/pcs", destination: "/api/dispositivos", permanent: true },
      { source: "/api/pcs/:path*", destination: "/api/dispositivos/:path*", permanent: true },
      { source: "/api/pc/:id", destination: "/api/dispositivo/:id", permanent: true },
      { source: "/api/pc/:id/:path*", destination: "/api/dispositivo/:id/:path*", permanent: true },
    ];
  },
};

export default nextConfig;
