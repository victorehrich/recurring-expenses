/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  experimental: {
    serverComponentsExternalPackages: ["mongoose"],
  },
  env: {
    NEXT_PUBLIC_APP_VERSION: require("./package.json").version,
  },
};

module.exports = nextConfig;
