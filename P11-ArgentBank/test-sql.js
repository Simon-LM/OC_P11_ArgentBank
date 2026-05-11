/** @format */

import "dotenv/config";
import pg from "pg";
const { Client } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is missing");
}

const requiresSsl = process.env.DATABASE_URL.includes("sslmode=require");

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ...(requiresSsl ? { ssl: { rejectUnauthorized: false } } : {}),
});

client
  .connect()
  .then(() => client.query("SELECT 1 AS ok"))
  .then((res) => {
    console.log(res.rows[0]);
    return client.end();
  })
  .catch((err) => {
    console.error("Erreur SQL:", err);
    client.end();
  });
