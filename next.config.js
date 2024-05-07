/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        destination: "https://weave-api.fly.dev/:path*",
        source: "/api/:path*"
      }
    ];
  }
};

module.exports = nextConfig;
