/** @format */

import {
	describe,
	it,
	expect,
	vi,
	beforeEach,
	afterEach,
	beforeAll,
} from "vitest";

// Mock modules (hoisted by Vitest)
vi.mock("jsonwebtoken", () => ({
	default: {
		verify: vi.fn(),
	},
}));

vi.mock("../../../api/lib/prisma.js", () => ({
	prisma: {
		transaction: {
			findMany: vi.fn(),
		},
	},
}));

// Importer les modules mockés pour les utiliser dans les tests
import jwt from "jsonwebtoken"; // jwt est l'exportation par défaut : { verify }
import { prisma } from "../../../api/lib/prisma.js";

// La constante JWT_SECRET utilisée dans les assertions de test doit correspondre à la valeur stubbée.
const LOCAL_TEST_JWT_SECRET = "valeur_stub_secret_transactions_dynamique";

describe("Transactions API Handler", () => {
	let req;
	let res;
	let consoleErrorSpy;
	let handler; // Déclarer le handler ici

	beforeAll(async () => {
		// Stubber la variable d'environnement AVANT l'importation dynamique
		vi.stubEnv("JWT_SECRET", LOCAL_TEST_JWT_SECRET);

		// Importer dynamiquement le handler APRÈS que vi.stubEnv ait été appelé
		const module = await import("../../../api/transactions/index.js");
		handler = module.default;
	});

	const mockUserId = "user-id-123";
	const mockTransactions = [
		{
			id: "txn-1",
			amount: 100,
			date: new Date().toISOString(),
			accountId: "acc-1",
		},
		{
			id: "txn-2",
			amount: -50,
			date: new Date().toISOString(),
			accountId: "acc-1",
		},
	];

	beforeEach(() => {
		vi.resetAllMocks();

		// Par défaut, la vérification JWT réussit et retourne un ID utilisateur
		jwt.verify.mockReturnValue({ id: mockUserId });
		// Par défaut, la recherche de transactions réussit
		prisma.transaction.findMany.mockResolvedValue(mockTransactions);

		req = {
			method: "GET", // La plupart des tests seront pour GET
			headers: {
				authorization: `Bearer valid-jwt-token`,
			},
		};

		res = {
			status: vi.fn().mockReturnThis(),
			json: vi.fn().mockReturnThis(),
			setHeader: vi.fn(),
			end: vi.fn(),
		};

		consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
	});

	afterEach(() => {
		consoleErrorSpy.mockRestore();
	});

	it("should handle OPTIONS request for CORS preflight", async () => {
		req.method = "OPTIONS";
		await handler(req, res);
		expect(res.status).toHaveBeenCalledWith(200);
		expect(res.end).toHaveBeenCalled();
		expect(res.setHeader).toHaveBeenCalledWith(
			"Access-Control-Allow-Origin",
			"*"
		);
		expect(res.setHeader).toHaveBeenCalledWith(
			"Access-Control-Allow-Methods",
			"GET, OPTIONS"
		);
		expect(res.setHeader).toHaveBeenCalledWith(
			"Access-Control-Allow-Headers",
			"Content-Type, Authorization"
		);
	});

	it("should return 405 if method is not GET or OPTIONS", async () => {
		req.method = "POST";
		await handler(req, res);
		expect(res.status).toHaveBeenCalledWith(405);
		expect(res.json).toHaveBeenCalledWith({
			status: 405,
			message: "Method Not Allowed",
		});
		expect(res.setHeader).toHaveBeenCalledWith("Allow", ["GET", "OPTIONS"]);
	});

	describe("GET /api/transactions", () => {
		it("should return transactions successfully for an authenticated user", async () => {
			await handler(req, res);

			expect(jwt.verify).toHaveBeenCalledWith(
				"valid-jwt-token",
				LOCAL_TEST_JWT_SECRET // Doit correspondre à la valeur stubbée
			);
			expect(prisma.transaction.findMany).toHaveBeenCalledWith({
				where: {
					account: {
						userId: mockUserId,
					},
				},
				orderBy: {
					date: "desc",
				},
			});
			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith({
				status: 200,
				message: "Transactions retrieved successfully",
				body: mockTransactions,
			});
		});

		it("should return 401 if Authorization header is missing", async () => {
			req.headers.authorization = undefined;
			await handler(req, res);
			expect(res.status).toHaveBeenCalledWith(401);
			expect(res.json).toHaveBeenCalledWith({
				status: 401,
				message: "Unauthorized: Missing or invalid token format",
			});
		});

		it("should return 401 if Authorization header is not Bearer token", async () => {
			req.headers.authorization = "Basic somecredentials";
			await handler(req, res);
			expect(res.status).toHaveBeenCalledWith(401);
			expect(res.json).toHaveBeenCalledWith({
				status: 401,
				message: "Unauthorized: Missing or invalid token format",
			});
		});

		it("should return 401 if JWT verification fails (e.g., token expired)", async () => {
			const jwtError = new Error("Token expired");
			jwt.verify.mockImplementation(() => {
				throw jwtError;
			});
			await handler(req, res);
			expect(res.status).toHaveBeenCalledWith(401);
			expect(res.json).toHaveBeenCalledWith({
				status: 401,
				message: `Unauthorized: ${jwtError.message}`,
			});
			expect(consoleErrorSpy).toHaveBeenCalledWith(
				"JWT Verification Error:",
				jwtError.message
			);
		});

		it("should return 401 if JWT payload does not contain user id", async () => {
			jwt.verify.mockReturnValue({}); // Pas de 'id' dans le payload
			await handler(req, res);
			expect(res.status).toHaveBeenCalledWith(401);
			expect(res.json).toHaveBeenCalledWith({
				status: 401,
				message: "Unauthorized: Invalid token payload",
			});
			expect(consoleErrorSpy).toHaveBeenCalledWith("JWT payload missing 'id'");
		});

		it("should return an empty array if user has no transactions", async () => {
			prisma.transaction.findMany.mockResolvedValue([]);
			await handler(req, res);
			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith({
				status: 200,
				message: "Transactions retrieved successfully",
				body: [],
			});
		});

		it("should return 500 if Prisma query fails", async () => {
			const dbError = new Error("Database connection error");
			prisma.transaction.findMany.mockRejectedValue(dbError);
			await handler(req, res);
			expect(res.status).toHaveBeenCalledWith(500);
			expect(res.json).toHaveBeenCalledWith({
				status: 500,
				message: "Internal Server Error",
			});
			expect(consoleErrorSpy).toHaveBeenCalledWith(
				"Error fetching transactions:",
				dbError
			);
		});
	});
});
