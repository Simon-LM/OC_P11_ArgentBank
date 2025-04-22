/** @format */
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";

// Récupérez la clé secrète depuis les variables d'environnement
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
	console.error(
		"FATAL ERROR: JWT_SECRET is not defined in environment variables."
	);
	process.exit(1);
}

export default async function handler(req, res) {
	// --- Configuration CORS ---
	// ATTENTION: Soyez plus restrictif en production !
	// Remplacez '*' par l'URL de votre frontend Vercel.
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
	res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
	res.setHeader("Content-Type", "application/json");

	// --- Gestion Preflight CORS ---
	if (req.method === "OPTIONS") {
		return res.status(200).end();
	}

	// --- Vérification Méthode GET ---
	if (req.method !== "GET") {
		res.setHeader("Allow", ["GET", "OPTIONS"]);
		return res.status(405).json({ status: 405, message: "Method Not Allowed" });
	}

	try {
		// 1. Vérification du Token JWT (similaire à profile.js)
		const authHeader = req.headers.authorization;
		if (!authHeader || !authHeader.startsWith("Bearer ")) {
			return res.status(401).json({
				status: 401,
				message: "Unauthorized: Missing or invalid token format",
			});
		}
		const token = authHeader.split(" ")[1];

		let decoded;
		try {
			// Vérifier le token en utilisant la clé secrète
			decoded = jwt.verify(token, JWT_SECRET);
		} catch (error) {
			// Gérer spécifiquement les erreurs JWT (expiré, invalide)
			console.error("JWT Verification Error:", error.message);
			return res
				.status(401)
				.json({ status: 401, message: `Unauthorized: ${error.message}` });
		}

		// L'ID de l'utilisateur authentifié se trouve dans le payload du token
		const userId = decoded.id;
		if (!userId) {
			console.error("JWT payload missing 'id'");
			return res
				.status(401)
				.json({ status: 401, message: "Unauthorized: Invalid token payload" });
		}

		// 2. Récupérer les transactions via les comptes de l'utilisateur
		const transactions = await prisma.transaction.findMany({
			where: {
				account: {
					userId: userId,
				},
			},
			orderBy: {
				date: "desc",
			},
			// Optionnel: Inclure les détails du compte si nécessaire
			// include: {
			//   account: {
			//     select: { accountNumber: true, type: true }
			//   }
			// }
		});

		// 3. Réponse Succès
		return res.status(200).json({
			status: 200,
			message: "Transactions retrieved successfully",
			body: transactions,
		});
	} catch (error) {
		console.error("Error fetching transactions:", error);
		// 4. Gestion Erreur Générale du Serveur
		return res
			.status(500)
			.json({ status: 500, message: "Internal Server Error" });
	} finally {
		// Déconnexion Prisma non nécessaire dans un environnement serverless comme Vercel
		// await prisma.$disconnect();
	}
}
