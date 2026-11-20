const port = Number.parseInt(process.env.PORT ?? "3000", 10);
const storage = (process.env.STORAGE ?? "postgres").trim();

if (storage !== "postgres" && storage !== "memory") {
  console.error(
    `Configuration invalide : STORAGE doit valoir "postgres" ou "memory" (reçu : "${storage}").`
  );
  process.exit(1);
}

const db = {
  host: process.env.DB_HOST ?? "127.0.0.1",
  port: Number.parseInt(process.env.DB_PORT ?? "5432", 10),
  user: process.env.DB_USER ?? "queenbee",
  password: process.env.DB_PASSWORD ?? "",
  database: process.env.DB_NAME ?? "queenbee",
  poolMax: Number.parseInt(process.env.DB_POOL_MAX ?? "10", 10),
};

if (storage === "postgres" && !db.password) {
  console.error("Configuration invalide : DB_PASSWORD est obligatoire lorsque STORAGE=postgres.");
  process.exit(1);
}

export const config = {
  port: Number.isNaN(port) ? 3000 : port,
  storage,
  db: {
    ...db,
    port: Number.isNaN(db.port) ? 5432 : db.port,
    poolMax: Number.isNaN(db.poolMax) ? 10 : db.poolMax,
  },
};