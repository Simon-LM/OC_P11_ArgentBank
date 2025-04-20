/** @format */

import { prisma } from "./lib/prisma.js";

export default async function handler(req, res) {
	if (req.method === "GET") {
		// Récupère tous les utilisateurs
		const users = await prisma.user.findMany();
		return res.json({ users });
	}
	if (req.method === "POST") {
		// Ajoute un utilisateur fictif
		const { email, password, firstName, lastName, userName } = req.body;
		const user = await prisma.user.create({
			data: { email, password, firstName, lastName, userName },
		});
		return res.json({ user });
	}
	return res.status(405).json({ message: "Method Not Allowed" });
}
