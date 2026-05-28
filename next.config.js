/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  async redirects() {
    return [
      {
        source: "/blog/:slug",
        destination: "/writing/:slug",
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
