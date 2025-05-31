/** @format */

import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma.js";

const saltRounds = 10;

export default async function handler(req, res) {
  // Configuration CORS (ajouté pour la cohérence, même si moins critique pour signup)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Content-Type", "application/json");

  // Gestion preflight CORS
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method === "POST") {
    // Lecture du body (pour Vercel/serverless)
    let body = req.body;
    if (!body) {
      let raw = "";
      await new Promise((resolve) => {
        req.on("data", (chunk) => {
          raw += chunk;
        });
        req.on("end", resolve);
      });
      try {
        body = JSON.parse(raw);
      } catch {
        body = {};
      }
    }

    const { email, password, firstName, lastName, userName } = body;

    if (!email || !password || !firstName || !lastName || !userName) {
      return res.status(400).json({ status: 400, message: "Invalid Fields" });
    }

    try {
      // Vérifie si l'utilisateur existe déjà
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return res
          .status(400)
          .json({ status: 400, message: "Email already in use" });
      }

      // --- Hachage du mot de passe ---
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      // ---------------------------------

      // Crée le nouvel utilisateur
      const newUser = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName,
          lastName,
          userName,
        },
      });
      return res.status(201).json({
        status: 201,
        message: "Signup Successfully",
        body: { id: newUser.id, email: newUser.email },
      });
    } catch (error) {
      console.error("Signup error:", error);
      return res
        .status(500)
        .json({ status: 500, message: "Internal Server Error" });
    }
  } else {
    return res.status(405).json({ status: 405, message: "Method Not Allowed" });
  }
}
