/** @format */
import jwt from "jsonwebtoken";
import { storeUserCSRFToken } from "../lib/csrf.js";

const JWT_SECRET = process.env.JWT_SECRET || "default_secret_key";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ status: 405, message: "Method Not Allowed" });
  }

  try {
    // Vérifier l'authentification
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ status: 401, message: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const { userId, csrfToken } = req.body;

    // Vérifier que l'userId dans le body correspond à celui du token
    if (decoded.id !== userId) {
      return res.status(403).json({ status: 403, message: "Access denied" });
    }

    // Stocker le token
    await storeUserCSRFToken(userId, csrfToken);

    return res.status(200).json({
      status: 200,
      message: "CSRF token stored successfully",
    });
  } catch (error) {
    console.error("Error storing CSRF token:", error);
    return res
      .status(500)
      .json({ status: 500, message: "Internal Server Error" });
  }
}
