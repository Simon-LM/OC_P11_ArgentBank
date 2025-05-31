/** @format */

import { prisma } from "./lib/prisma.js";

export default async function handler(req, res) {
  try {
    await prisma.$connect();
    return res.json({ pong: true, db: "OK" });
  } catch (e) {
    console.error("DB connect error:", e);
    return res.status(500).json({ pong: false, error: e.message });
  }
}
