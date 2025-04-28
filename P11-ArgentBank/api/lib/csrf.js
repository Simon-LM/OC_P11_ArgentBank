/** @format */

// import { prisma } from "./prisma.js";

export async function storeUserCSRFToken(userId, token) {
	try {
		const { prisma } = await import("./prisma.js");

		const existingToken = await prisma.csrfToken.findUnique({
			where: { userId },
		});

		if (existingToken) {
			return prisma.csrfToken.update({
				where: { userId },
				data: {
					token,
					updatedAt: new Date(),
				},
			});
		} else {
			return prisma.csrfToken.create({
				data: {
					userId,
					token,
					createdAt: new Date(),
					updatedAt: new Date(),
				},
			});
		}
	} catch (error) {
		console.error("Error storing CSRF token:", error);
		throw error;
	}
}

export async function getUserCSRFToken(userId) {
	try {
		const { prisma } = await import("./prisma.js");

		const record = await prisma.csrfToken.findUnique({
			where: { userId },
		});
		return record ? record.token : null;
	} catch (error) {
		console.error("Error retrieving CSRF token:", error);
		return null;
	}
}
