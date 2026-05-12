/** @format */
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma.js";
import { rateLimitMiddleware } from "../middleware/rateLimit.js";

const JWT_SECRET = process.env.JWT_SECRET || "default_secret_key";
const DATABASE_URL_LOG = process.env.DATABASE_URL
  ? `DATABASE_URL is set (e.g., ${process.env.DATABASE_URL.substring(0, 20)}...)`
  : "DATABASE_URL is NOT set";

export default async function handler(req, res) {
  // console.log("Login handler invoked"); // Log d'invocation
  // console.log(
  // 	`JWT_SECRET used: ${JWT_SECRET === "default_secret_key" ? "Default key" : "Environment key"}`
  // );
  // console.log(DATABASE_URL_LOG);

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Content-Type", "application/json");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      status: 405,
      message: "Method Not Allowed",
    });
  }

  const rateLimitResult = await rateLimitMiddleware(req, res, "login");
  if (rateLimitResult === true) {
    return;
  }

  if (!req.body) {
    console.error("Login error: Request body is missing.");
    return res.status(400).json({
      status: 400,
      message: "Request body is missing",
    });
  }

  try {
    const { email, password } = req.body;

    // console.log(`Attempting login for email: ${email}`); // Log de l'email

    if (!email || !password) {
      return res.status(400).json({
        status: 400,
        message: "Email and password are required",
      });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    const isPasswordValid = user
      ? await bcrypt.compare(password, user.password)
      : false;

    if (!isPasswordValid) {
      return res.status(401).json({
        status: 401,
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "1h" });

    return res.status(200).json({
      status: 200,
      message: "User successfully logged in",
      body: { token },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      status: 500,
      message: "Internal server error. Check server logs for details.", // Message plus générique pour le client
    });
  }
}
