import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: [
      "plus.unsplash.com",
      "images.unsplash.com",
      "randomuser.me",
      "media.istockphoto.com",
      "utfs.io", // For UploadThing file storage
      "uploadthing.com", // Alternative UploadThing domain
      "files.uploadthing.com", // Another UploadThing domain pattern
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "utfs.io",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.utfs.io",
        port: "",
        pathname: "/**",
      },
    ],
  },
  allowedDevOrigins: [
    "9004-idx-studio-1744504031934.cluster-blu4edcrfnajktuztkjzgyxzek.cloudworkstations.dev",
  ],
};

export default nextConfig;
