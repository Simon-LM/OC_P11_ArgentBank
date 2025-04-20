/** @format */

// import { prisma } from "../../lib/prisma.js";
import { prisma } from "../lib/prisma.js";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "default_secret_key";

export default async function handler(req, res) {
	if (req.method === "GET") {
		const authHeader = req.headers.authorization;
		if (!authHeader || !authHeader.startsWith("Bearer ")) {
			console.log("No or bad Authorization header");
			return res.status(401).json({ status: 401, message: "Unauthorized" });
		}

		const token = authHeader.split(" ")[1];
		try {
			const decoded = jwt.verify(token, JWT_SECRET);
			console.log("Decoded JWT:", decoded);
			const user = await prisma.user.findUnique({ where: { id: decoded.id } });
			console.log("User trouvé:", user);
			if (!user) {
				return res.status(404).json({ status: 404, message: "User not found" });
			}
			return res.status(200).json({
				status: 200,
				message: "User profile retrieved successfully",
				body: {
					id: user.id,
					email: user.email,
					userName: user.userName,
					firstName: user.firstName,
					lastName: user.lastName,
					createdAt: user.createdAt,
					updatedAt: user.updatedAt,
				},
			});
		} catch (error) {
			console.error("Profile error:", error);
			return res
				.status(500)
				.json({ status: 500, message: "Internal Server Error" });
		}
	}

	if (req.method === "PUT" || req.method === "PATCH") {
		const authHeader = req.headers.authorization;
		if (!authHeader || !authHeader.startsWith("Bearer ")) {
			return res.status(401).json({ status: 401, message: "Unauthorized" });
		}
		const token = authHeader.split(" ")[1];
		try {
			const decoded = jwt.verify(token, JWT_SECRET);

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

			const { userName, firstName, lastName } = body;
			if (!userName && !firstName && !lastName) {
				return res
					.status(400)
					.json({ status: 400, message: "No fields to update" });
			}

			const updatedUser = await prisma.user.update({
				where: { id: decoded.id },
				data: { userName, firstName, lastName },
			});

			return res.status(200).json({
				status: 200,
				message: "User profile updated successfully",
				body: {
					id: updatedUser.id,
					email: updatedUser.email,
					userName: updatedUser.userName,
					firstName: updatedUser.firstName,
					lastName: updatedUser.lastName,
					createdAt: updatedUser.createdAt,
					updatedAt: updatedUser.updatedAt,
				},
			});
		} catch (error) {
			console.error("Profile update error:", error);
			return res
				.status(500)
				.json({ status: 500, message: "Internal Server Error" });
		}
	}

	return res.status(405).json({ status: 405, message: "Method Not Allowed" });
}
