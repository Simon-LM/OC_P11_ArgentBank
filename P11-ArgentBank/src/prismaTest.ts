/** @format */

import { PrismaClient } from "./generated/prisma";

const prisma = new PrismaClient();

async function main() {
	// Récupérer tous les utilisateurs
	const users = await prisma.user.findMany();
	console.log("Tous les utilisateurs :", users);

	// Récupérer un utilisateur précis
	const tony = await prisma.user.findUnique({
		where: { email: "tony@stark.com" },
	});
	console.log("Tony :", tony);
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
