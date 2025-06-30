import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";

config({ path: ".env" });

let urldatabase;

if (process.env.ENV_MODE == "TEST") {
  urldatabase = process.env.TEST_DATABASE_URL!;
} else {
  urldatabase = process.env.DATABASE_URL!;
}

export default defineConfig({
  //@ts-ignore
  dialect: "mysql", // "mysql" | "sqlite" | "postgresql"
  schema: "src/db/schema.ts",
  out: "src/db/migrations",
  dbCredentials: {
    // @ts-ignore
    url: urldatabase,
  },
});
