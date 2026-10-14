/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Question images are optional and may be hosted anywhere; we render them with
  // a plain <img> rather than next/image so no remote-host allowlist is needed.
  eslint: { ignoreDuringBuilds: true },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
