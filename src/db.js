import pg from "pg";
import { config } from "./config.js";

pg.types.setTypeParser(1700, (value) => Number(value));

export function createPool() {
  return new pg.Pool({
    host: config.db.host,
    port: config.db.port,
    user: config.db.user,
    password: config.db.password,
    database: config.db.database,
    max: config.db.poolMax,
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
  });
}