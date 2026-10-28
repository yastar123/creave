import "dotenv/config";
import { readFile } from "node:fs/promises";
import { Pool } from "pg";

async function pushSchema() {
  const target = process.env.DB_PUSH_TARGET;
  if (target !== "development" && target !== "production") {
    throw new Error("Set DB_PUSH_TARGET=development or DB_PUSH_TARGET=production explicitly.");
  }

  if (target === "production") {
    if (process.env.NODE_ENV !== "production") {
      throw new Error("Set NODE_ENV=production when targeting the production database.");
    }
    if (process.env.DB_PUSH_CONFIRM_PRODUCTION !== "YES") {
      throw new Error("Production schema push requires DB_PUSH_CONFIRM_PRODUCTION=YES.");
    }
  } else if (process.env.NODE_ENV === "production") {
    throw new Error("Production mode cannot push to a development target.");
  }

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is missing. Set it in your untracked .env file.");
  }

  const schema = await readFile(new URL("../server/schema.sql", import.meta.url), "utf8");
  const pool = new Pool({ connectionString });
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    await client.query(schema);
    await client.query("COMMIT");
    console.log(`${target === "production" ? "Production" : "Development"} database schema pushed successfully.`);
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

pushSchema().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Database schema push failed.");
  process.exitCode = 1;
});
