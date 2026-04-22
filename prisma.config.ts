// Turso(libSQL) 클라우드 DB 연결 설정
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["TURSO_DATABASE_URL"] ?? process.env["DATABASE_URL"],
  },
});
