/** @format */
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma.js";
import { rateLimitMiddleware } from "../middleware/rateLimit.js";

const JWT_SECRET = process.env.JWT_SECRET || "default_secret_key";

export default async function handler(req, res) {
	// Configuration CORS
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
	res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
	res.setHeader("Content-Type", "application/json");

	// Gestion preflight CORS
	if (req.method === "OPTIONS") {
		return res.status(200).end();
	}

	// Vérification méthode POST
	if (req.method !== "POST") {
		return res.status(405).json({
			status: 405,
			message: "Method Not Allowed",
		});
	}

	const rateLimitResult = await rateLimitMiddleware(req, res, "login");
	if (rateLimitResult === true) {
		// Si limite atteinte, la réponse 429 a déjà été envoyée
		return;
	}

	// Parse body manuellement (si nécessaire)
	if (!req.body) {
		// Le reste du code existant...
	}

	try {
		const { email, password } = req.body;

		// Validation des champs
		if (!email || !password) {
			return res.status(400).json({
				status: 400,
				message: "Email and password are required",
			});
		}

		// Recherche de l'utilisateur dans la base PostgreSQL
		const user = await prisma.user.findUnique({
			where: { email },
		});

		// Vérifier si l'utilisateur existe ET comparer le mot de passe fourni avec le hash stocké
		// bcrypt.compare est asynchrone !
		const isPasswordValid = user
			? await bcrypt.compare(password, user.password)
			: false;

		if (!isPasswordValid) {
			// Si l'utilisateur n'existe pas OU si le mot de passe est invalide
			return res.status(401).json({
				status: 401,
				message: "Invalid email or password", // Garder un message générique pour la sécurité
			});
		}

		// Génération du token JWT
		const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "1h" });

		// Réponse succès
		return res.status(200).json({
			status: 200,
			message: "User successfully logged in",
			body: { token },
		});
	} catch (error) {
		console.error("Login error:", error);
		return res.status(500).json({
			status: 500,
			message: "Internal server error",
		});
	}
}
