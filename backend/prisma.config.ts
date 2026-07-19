import { defineConfig } from "prisma/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

export default defineConfig({
  earlyAccess: true,
  schema: "./prisma/schema.prisma",

  // Required by Prisma 7 for CLI operations (migrate, introspect, generate)
  datasource: {
    url: process.env.DATABASE_URL!,
  },

  // Seed command — replaces the "prisma.seed" field in package.json
  migrations: {
    seed: "bun ./prisma/seed.ts",
  },

  // Adapter for driver-adapter mode (used by PrismaClient at runtime)
  adapter: () => {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    return new PrismaPg(pool);
  },
});
