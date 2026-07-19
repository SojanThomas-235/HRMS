import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@hrms/types", "@hrms/validators", "@hrms/utils"],
};

export default nextConfig;
