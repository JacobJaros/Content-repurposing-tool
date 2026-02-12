import path from "node:path";
import { defineConfig } from "prisma/config";

const dbUrl = `file:${path.join(__dirname, "prisma", "dev.db")}`;

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "npx tsx prisma/seed.ts",
  },
  datasource: {
    url: dbUrl,
  },
});
