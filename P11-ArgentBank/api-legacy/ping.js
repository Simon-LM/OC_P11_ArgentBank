/** @format */

import { prisma } from "./lib/prisma.js";

export default async function handler(req, res) {
  try {
    await prisma.$connect();
    return res.status(200).json({ pong: true, db: "OK" });
  } catch (e) {
    console.error("Ping DB health warning:", e);
    return res.status(200).json({
      pong: true,
      db: "DEGRADED",
      error: e.message,
    });
  }
}
