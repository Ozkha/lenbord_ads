import { drizzle } from "drizzle-orm/mysql2";
import { createConnection } from "mysql2/promise";
import * as schema from "./schema";
import { config } from "dotenv";

config({ path: ".env" });

let connectionTemp;

if (process.env.ENV_MODE == "TEST") {
  connectionTemp = process.env.TEST_DATABASE_URL!;
} else {
  connectionTemp = process.env.DATABASE_URL!;
}

export const connection = createConnection(connectionTemp);

export const db = (async () => {
  const waited = await connection;
  return drizzle(waited, { schema, mode: "default" });
})();
