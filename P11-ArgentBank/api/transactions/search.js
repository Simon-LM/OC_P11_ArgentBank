/** @format */

import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";

const JWT_SECRET = process.env.JWT_SECRET || "default_secret_key";

export default async function handler(req, res) {
	// Vérification de l'authentification
	const authHeader = req.headers.authorization;
	if (!authHeader || !authHeader.startsWith("Bearer ")) {
		return res.status(401).json({ status: 401, message: "Unauthorized" });
	}
	const token = authHeader.split(" ")[1];

	try {
		// Décoder le token JWT
		const decoded = jwt.verify(token, JWT_SECRET);
		const userId = decoded.id;

		// Extraction des paramètres de recherche
		const {
			accountId,
			searchTerm,
			category,
			fromDate,
			toDate,
			minAmount,
			maxAmount,
			type,
			page = 1,
			limit = 10,
			sortBy = "date",
			sortOrder = "desc",
		} = req.query;

		// Construction des filtres
		const whereClause = {
			account: { userId },
		};

		// Filtre par compte si spécifié
		if (accountId) {
			whereClause.accountId = accountId;
		}

		// Filtre par terme de recherche
		if (searchTerm) {
			whereClause.OR = [
				{ description: { contains: searchTerm, mode: "insensitive" } },
				{ notes: { contains: searchTerm, mode: "insensitive" } },
				{ category: { contains: searchTerm, mode: "insensitive" } },
			];
		}

		// Filtres additionnels
		if (category) whereClause.category = category;
		if (type) whereClause.type = type;
		if (fromDate)
			whereClause.date = { ...whereClause.date, gte: new Date(fromDate) };
		if (toDate)
			whereClause.date = { ...whereClause.date, lte: new Date(toDate) };
		if (minAmount)
			whereClause.amount = {
				...whereClause.amount,
				gte: parseFloat(minAmount),
			};
		if (maxAmount)
			whereClause.amount = {
				...whereClause.amount,
				lte: parseFloat(maxAmount),
			};

		// Calcul de la pagination
		const skip = (parseInt(page) - 1) * parseInt(limit);
		const take = parseInt(limit);

		// Requête à la base de données
		const [transactions, total] = await Promise.all([
			prisma.transaction.findMany({
				where: whereClause,
				orderBy: { [sortBy]: sortOrder },
				skip,
				take,
				include: {
					account: {
						select: {
							accountNumber: true,
							type: true,
						},
					},
				},
			}),
			prisma.transaction.count({ where: whereClause }),
		]);

		// Retourner les résultats
		return res.status(200).json({
			status: 200,
			message: "Transactions retrieved successfully",
			body: {
				transactions,
				pagination: {
					total,
					page: parseInt(page),
					limit: parseInt(limit),
					pages: Math.ceil(total / parseInt(limit)),
				},
			},
		});
	} catch (error) {
		console.error("Search transactions error:", error);
		return res
			.status(500)
			.json({ status: 500, message: "Internal Server Error" });
	}
}
