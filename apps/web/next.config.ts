import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@oddtrust/ui", "@oddtrust/design-tokens", "@oddtrust/utils"],
  output: process.env.NODE_ENV === "production" ? "standalone" : undefined,
  serverExternalPackages: ["pg", "ioredis", "bullmq", "pino", "pino-pretty"],
};

export default nextConfig;
