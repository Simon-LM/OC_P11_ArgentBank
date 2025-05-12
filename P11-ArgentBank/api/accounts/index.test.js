/** @format */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mocks des dépendances - sans utiliser de classes personnalisées
vi.mock("jsonwebtoken", () => {
	return {
		default: {
			verify: vi.fn(),
			// Pas besoin de définir JsonWebTokenError ici
		},
	};
});

vi.mock("../lib/prisma.js", () => ({
	prisma: {
		account: {
			findMany: vi.fn(),
		},
	},
}));

// Import des modules mockés
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";

// NE PAS importer le handler ici au niveau supérieur
// import handler from "./index.js";

describe("Accounts API Handler", () => {
	let req, res, consoleErrorSpy;
	let handlerInstance; // Pour stocker l'instance du handler importée dynamiquement
	const mockUserId = "user-123";
	const mockToken = "valid.jwt.token";

	// Mock JWT_SECRET
	// const originalEnv = process.env; // Plus nécessaire avec vi.unstubAllEnvs

	beforeEach(async () => {
		// Rendre beforeEach asynchrone
		vi.resetAllMocks();

		// Définir JWT_SECRET - Attention: vi.stubEnv est nécessaire au lieu de juste process.env
		vi.stubEnv("JWT_SECRET", "test_secret_key");

		// Réinitialiser le cache des modules pour forcer le rechargement de index.js
		// afin qu'il prenne la nouvelle valeur de JWT_SECRET
		vi.resetModules();
		const module = await import("./index.js");
		handlerInstance = module.default;

		// Mock des objets request et response
		req = {
			method: "GET",
			headers: {
				authorization: `Bearer ${mockToken}`,
			},
		};

		res = {
			status: vi.fn().mockReturnThis(),
			json: vi.fn(),
		};

		// Mock de console.error pour les tests d'erreur
		consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

		// Configuration par défaut du mock JWT
		jwt.verify.mockReturnValue({ id: mockUserId });

		// Configuration par défaut du mock Prisma
		prisma.account.findMany.mockResolvedValue([
			{
				id: "account-1",
				userId: mockUserId,
				accountNumber: "1234",
				balance: 1000,
				type: "Checking Account",
			},
			{
				id: "account-2",
				userId: mockUserId,
				accountNumber: "5678",
				balance: 5000,
				type: "Savings Account",
			},
		]);

		// Supprimer le mock virtuel de ./index.js car nous importons dynamiquement
	});

	afterEach(() => {
		consoleErrorSpy.mockRestore();
		// Restaurer toutes les variables d'environnement stubbées
		vi.unstubAllEnvs();
	});

	it("should return 405 if method is not GET", async () => {
		req.method = "POST";

		await handlerInstance(req, res); // Utiliser handlerInstance

		expect(res.status).toHaveBeenCalledWith(405);
		expect(res.json).toHaveBeenCalledWith({ message: "Method Not Allowed" });
	});

	it("should return 401 if no authorization header is provided", async () => {
		delete req.headers.authorization;

		await handlerInstance(req, res); // Utiliser handlerInstance

		expect(res.status).toHaveBeenCalledWith(401);
		expect(res.json).toHaveBeenCalledWith({
			message: "Authorization header missing or invalid",
		});
	});

	it("should return 401 if authorization header format is invalid", async () => {
		req.headers.authorization = "InvalidFormat";

		await handlerInstance(req, res); // Utiliser handlerInstance

		expect(res.status).toHaveBeenCalledWith(401);
		expect(res.json).toHaveBeenCalledWith({
			message: "Authorization header missing or invalid",
		});
	});

	it("should return 401 if token verification fails", async () => {
		// Simplifier en lançant simplement une erreur avec le bon nom
		jwt.verify.mockImplementationOnce(() => {
			const error = new Error("Invalid token");
			error.name = "JsonWebTokenError"; // Ajouter la propriété name
			throw error;
		});

		await handlerInstance(req, res); // Utiliser handlerInstance

		expect(res.status).toHaveBeenCalledWith(401);
		expect(res.json).toHaveBeenCalledWith({
			message: "Invalid or expired token",
		});
	});

	it("should return 401 if decoded token has no user ID", async () => {
		jwt.verify.mockReturnValue({
			/* pas d'ID */
		});

		await handlerInstance(req, res); // Utiliser handlerInstance

		expect(res.status).toHaveBeenCalledWith(401);
		expect(res.json).toHaveBeenCalledWith({
			message: "Invalid token: User ID missing",
		});
	});

	it("should return 200 and user accounts when successful", async () => {
		const mockAccounts = [
			{
				id: "account-1",
				userId: mockUserId,
				accountNumber: "1234",
				balance: 1000,
				type: "Checking Account",
			},
			{
				id: "account-2",
				userId: mockUserId,
				accountNumber: "5678",
				balance: 5000,
				type: "Savings Account",
			},
		];

		prisma.account.findMany.mockResolvedValue(mockAccounts);

		await handlerInstance(req, res); // Utiliser handlerInstance

		// Utiliser la variable d'environnement stubbée dans le test
		expect(jwt.verify).toHaveBeenCalledWith(mockToken, "test_secret_key");
		expect(prisma.account.findMany).toHaveBeenCalledWith({
			where: {
				userId: mockUserId,
			},
		});
		expect(res.status).toHaveBeenCalledWith(200);
		expect(res.json).toHaveBeenCalledWith({
			body: mockAccounts,
		});
	});

	it("should return 500 if database query fails", async () => {
		prisma.account.findMany.mockRejectedValue(new Error("Database error"));

		await handlerInstance(req, res); // Utiliser handlerInstance

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.json).toHaveBeenCalledWith({
			message: "Internal server error while fetching accounts",
		});
		expect(consoleErrorSpy).toHaveBeenCalledWith(
			"Error fetching accounts:",
			expect.any(Error)
		);
	});
});
