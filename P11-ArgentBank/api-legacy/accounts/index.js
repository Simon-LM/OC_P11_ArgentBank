/** @format */

import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";

const JWT_SECRET = process.env.JWT_SECRET;

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Authorization header missing or invalid" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.id;

    if (!userId) {
      return res
        .status(401)
        .json({ message: "Invalid token: User ID missing" });
    }

    const accounts = await prisma.account.findMany({
      where: {
        userId: userId,
      },
      // Optionnel: Trier les comptes si nécessaire
      // orderBy: {
      //  type: 'asc',
      // },
    });

    return res.status(200).json({ body: accounts });
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
    console.error("Error fetching accounts:", error);
    return res
      .status(500)
      .json({ message: "Internal server error while fetching accounts" });
  } finally {
    // Déconnexion de Prisma n'est généralement pas nécessaire ici dans un contexte serverless
    // await prisma.$disconnect();
  }
}
