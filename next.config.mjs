/** @type {import('next').NextConfig} */
const repo = "follow-up-board";
const isProduction = process.env.NODE_ENV === "production";
const basePath = isProduction ? `/${repo}` : undefined;

const nextConfig = {
  output: "export",
  trailingSlash: true,
  basePath,
  assetPrefix: isProduction ? `/${repo}/` : undefined,
  images: { unoptimized: true },
  devIndicators: false,
};

export default nextConfig;
