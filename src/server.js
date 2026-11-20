import { config } from "./config.js";
import { createApp } from "./app.js";
import { createMemoryRepositories } from "./repositories/memory/index.js";
import { createPostgresRepositories } from "./repositories/postgres/index.js";
import { createPool } from "./db.js";

let repositories;

if (config.storage === "postgres") {
  const pool = createPool();
  try {
    await pool.query("SELECT 1");
  } catch (err) {
    console.error(
      `Impossible de joindre PostgreSQL sur ${config.db.host}:${config.db.port} : ${err.message || err.code}`
    );
    process.exit(1);
  }
  repositories = createPostgresRepositories(pool);
} else {
  repositories = createMemoryRepositories();
}

const app = createApp(repositories);

app.listen(config.port, () => {
  console.log(
    `API Queen Bee sur http://localhost:${config.port} (stockage : ${config.storage})`
  );
});