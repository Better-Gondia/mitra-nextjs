/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "15mb", // Change this to your required limit
    },
  },
};

export default nextConfig;
