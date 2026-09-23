/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow checkout to be embedded in iframes from any origin.
  // In production, restrict X-Frame-Options to specific merchant origins.
  async headers() {
    return [
      {
        source: "/checkout",
        headers: [
          // Remove X-Frame-Options to allow iframe embedding
          { key: "X-Frame-Options", value: "ALLOWALL" },
          // Content Security Policy: allow framing from configured merchant origins
          {
            key: "Content-Security-Policy",
            value: `frame-ancestors 'self' ${process.env.NEXT_PUBLIC_MERCHANT_ORIGIN ?? "http://localhost:3000"};`,
          },
        ],
      },
    ];
  },
};

export default nextConfig;
