/** @format */

import { PrismaClient, TransactionType } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();
const saltRounds = 10;

async function main() {
	console.log(`Start seeding ...`);

	// --- Seed User 1 (Tony Stark) ---
	const tonyPassword = await bcrypt.hash("password123", saltRounds);
	const tony = await prisma.user.upsert({
		where: { email: "tony@stark.com" },
		update: {
			userName: "Iron",
		},
		create: {
			email: "tony@stark.com",
			password: tonyPassword,
			firstName: "Tony",
			lastName: "Stark",
			userName: "Iron",
		},
	});
	console.log(`Upserted user Tony Stark with id: ${tony.id}`);

	await prisma.transaction.deleteMany({
		where: { account: { userId: tony.id } },
	});
	await prisma.account.deleteMany({ where: { userId: tony.id } });
	console.log(`Cleaned old accounts/transactions for Tony Stark.`);

	const tonyChecking = await prisma.account.create({
		data: {
			userId: tony.id,
			accountNumber: "8949",
			balance: 5600.55,
			type: "Argent Bank Checking",
			transactions: {
				create: [
					{
						date: new Date("2024-04-20T10:00:00Z"),
						amount: 250.0,
						description: "Restaurant Chez Louis",
						type: TransactionType.DEBIT,
						category: "Food",
					},
					{
						date: new Date("2024-04-19T15:30:00Z"),
						amount: 1200.0,
						description: "Virement Salaire Stark Industries",
						type: TransactionType.CREDIT,
						category: "Income",
					},
					{
						date: new Date("2024-04-18T08:15:00Z"),
						amount: 55.6,
						description: "Golden Sun Bakery",
						type: TransactionType.DEBIT,
						category: "Food",
						notes: "Petit déjeuner équipe",
					},
					{
						date: new Date("2024-04-17T11:00:00Z"),
						amount: 8.0,
						description: "Café du coin",
						type: TransactionType.DEBIT,
						category: "Food",
					},
				],
			},
		},
	});
	const tonySavings = await prisma.account.create({
		data: {
			userId: tony.id,
			accountNumber: "2094",
			balance: 12450.22,
			type: "Argent Bank Savings",
			transactions: {
				create: [
					{
						date: new Date("2024-04-01T09:00:00Z"),
						amount: 500.0,
						description: "Virement mensuel épargne",
						type: TransactionType.CREDIT,
						category: "Savings",
					},
				],
			},
		},
	});
	console.log(
		`Created accounts for Tony Stark: ${tonyChecking.id}, ${tonySavings.id}`
	);

	// --- Seed User 2 (Steve Rogers) ---
	const stevePassword = await bcrypt.hash("password456", saltRounds);
	const steve = await prisma.user.upsert({
		where: { email: "steve@rogers.com" },
		update: {
			userName: "Captain",
		},
		create: {
			email: "steve@rogers.com",
			password: stevePassword,
			firstName: "Steve",
			lastName: "Rogers",
			userName: "Captain",
		},
	});
	console.log(`Upserted user Steve Rogers with id: ${steve.id}`);

	await prisma.transaction.deleteMany({
		where: { account: { userId: steve.id } },
	});
	await prisma.account.deleteMany({ where: { userId: steve.id } });
	console.log(`Cleaned old accounts/transactions for Steve Rogers.`);

	const steveChecking = await prisma.account.create({
		data: {
			userId: steve.id,
			accountNumber: "8349",
			balance: 2082.79,
			type: "Argent Bank Checking",
			transactions: {
				create: [
					{
						date: new Date("2024-04-21T07:45:00Z"),
						amount: 15.5,
						description: "Épicerie du quartier",
						type: TransactionType.DEBIT,
						category: "Groceries",
					},
					{
						date: new Date("2024-04-15T12:00:00Z"),
						amount: 75.0,
						description: "Remboursement Bucky",
						type: TransactionType.CREDIT,
						category: "Transfer",
					},
					{
						date: new Date("2024-04-10T18:00:00Z"),
						amount: 42.0,
						description: "Librairie Centrale",
						type: TransactionType.DEBIT,
						category: "Shopping",
					},
				],
			},
		},
	});
	const steveSavings = await prisma.account.create({
		data: {
			userId: steve.id,
			accountNumber: "6712",
			balance: 10928.42,
			type: "Argent Bank Savings",
			transactions: {
				create: [
					{
						date: new Date("2024-03-31T10:00:00Z"),
						amount: 100.0,
						description: "Intérêts",
						type: TransactionType.CREDIT,
						category: "Interest",
					},
				],
			},
		},
	});
	const steveCredit = await prisma.account.create({
		data: {
			userId: steve.id,
			accountNumber: "8849",
			balance: -184.3,
			type: "Argent Bank Credit Card",
			transactions: {
				create: [
					{
						date: new Date("2024-04-18T14:20:00Z"),
						amount: 184.3,
						description: "Achat matériel dessin",
						type: TransactionType.DEBIT,
						category: "Hobbies",
					},
				],
			},
		},
	});
	console.log(
		`Created accounts for Steve Rogers: ${steveChecking.id}, ${steveSavings.id}, ${steveCredit.id}`
	);

	console.log(`Seeding finished.`);
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
