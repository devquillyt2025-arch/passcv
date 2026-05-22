/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['pdf-parse', 'mammoth', '@react-pdf/renderer'],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // canvas is a native Node.js module used by @react-pdf/renderer internally;
      // it doesn't exist in the browser bundle so tell webpack to ignore it.
      config.resolve.fallback = { ...config.resolve.fallback, canvas: false };
    }
    return config;
  },
};

export default nextConfig;
