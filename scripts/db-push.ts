import "dotenv/config";
import { readFile } from "node:fs/promises";
import { Pool } from "pg";

async function pushSchema() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("db:push is disabled in production. Apply managed database changes through Replit Publish.");
  }
  if (process.env.DB_PUSH_TARGET !== "development") {
    throw new Error("Set DB_PUSH_TARGET=development in .env to confirm this is a development database.");
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
    console.log("Development database schema pushed successfully.");
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
