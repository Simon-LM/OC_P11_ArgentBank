/** @format */

// const users = [
// 	{
// 		id: "66e6fc6d339057ebf4c97019",
// 		email: "tony@stark.com",
// 		password: "password123",
// 		firstName: "Tony",
// 		lastName: "Stark",
// 		userName: "Iron",
// 	},
// 	{
// 		id: "77f7fd7e440168ff05d8712a",
// 		email: "steve@rogers.com",
// 		password: "password456",
// 		firstName: "Steve",
// 		lastName: "Rogers",
// 		userName: "Captain",
// 	},
// ];

// export default function handler(req, res) {
// 	if (req.method === "POST") {
// 		const { email, password, firstName, lastName, userName } = req.body;

// 		if (!email || !password || !firstName || !lastName || !userName) {
// 			return res.status(400).json({ status: 400, message: "Invalid Fields" });
// 		}

// 		const existingUser = users.find((u) => u.email === email);
// 		if (existingUser) {
// 			return res
// 				.status(400)
// 				.json({ status: 400, message: "Email already in use" });
// 		}

// 		const newUser = {
// 			id: `${Date.now()}`,
// 			email,
// 			password,
// 			firstName,
// 			lastName,
// 			userName,
// 		};

// 		users.push(newUser);

// 		return res.status(200).json({
// 			status: 200,
// 			message: "Signup Successfully",
// 			body: { id: newUser.id, email: newUser.email },
// 		});
// 	} else {
// 		res.status(405).json({ status: 405, message: "Method Not Allowed" });
// 	}
// }

// // // // // // // // // // // // //

import { prisma } from "../../lib/prisma.js";

export default async function handler(req, res) {
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

			// Crée le nouvel utilisateur
			const newUser = await prisma.user.create({
				data: { email, password, firstName, lastName, userName },
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
