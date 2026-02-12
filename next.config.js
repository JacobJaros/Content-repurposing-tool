/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["react-markdown"],
  experimental: {
    serverComponentsExternalPackages: [
      "@prisma/adapter-better-sqlite3",
      "better-sqlite3",
    ],
  },
};

module.exports = nextConfig;
