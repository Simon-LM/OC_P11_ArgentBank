/** @format */

import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock modules: define vi.fn() directly inside the factory
vi.mock("jsonwebtoken", () => ({
	default: {
		// Correct: defines the default export
		sign: vi.fn(),
		verify: vi.fn(),
		decode: vi.fn(),
	},
}));

vi.mock("bcrypt", () => ({
	default: {
		// Correct: defines the default export
		compare: vi.fn(),
	},
}));

vi.mock("../lib/prisma.js", () => ({
	prisma: {
		// Correct: defines a named export 'prisma'
		user: {
			findUnique: vi.fn(),
		},
	},
}));

vi.mock("../middleware/rateLimit.js", () => ({
	rateLimitMiddleware: vi.fn(), // Correct: defines a named export
}));

// Import the handler AND the (now mocked) modules AFTER vi.mock calls
import handler from "./login.js";
import jwt from "jsonwebtoken"; // jwt IS the default export: { sign, verify, decode }
import bcrypt from "bcrypt"; // bcrypt IS the default export: { compare }
import { prisma } from "../lib/prisma.js";
import { rateLimitMiddleware } from "../middleware/rateLimit.js";

describe("Login API Handler", () => {
	let req;
	let res;

	beforeEach(() => {
		vi.resetAllMocks();

		// Configure mocks using the directly imported default exports
		jwt.sign.mockReturnValue("fake-token-123"); // CHANGED: Removed .default
		rateLimitMiddleware.mockResolvedValue(false);
		// bcrypt.compare and prisma.user.findUnique will be configured per test case

		req = {
			method: "POST",
			body: {
				email: "user@example.com",
				password: "password123",
			},
		};

		res = {
			status: vi.fn().mockReturnThis(),
			json: vi.fn().mockReturnThis(),
			setHeader: vi.fn(),
			end: vi.fn(),
		};
	});

	// ... (les tests pour 405, OPTIONS, 400 restent les mêmes) ...

	it("should return 401 when credentials are invalid (user found, password mismatch)", async () => {
		prisma.user.findUnique.mockResolvedValue({
			id: 1,
			email: "user@example.com",
			password: "hashedPassword",
		});
		bcrypt.compare.mockResolvedValue(false); // CHANGED: Removed .default

		await handler(req, res);

		expect(prisma.user.findUnique).toHaveBeenCalledWith({
			where: { email: "user@example.com" },
		});
		expect(bcrypt.compare).toHaveBeenCalledWith(
			// CHANGED: Removed .default
			"password123",
			"hashedPassword"
		);
		expect(res.status).toHaveBeenCalledWith(401);
		expect(res.json).toHaveBeenCalledWith({
			status: 401,
			message: "Invalid email or password",
		});
	});

	it("should return 401 when credentials are invalid (user not found)", async () => {
		prisma.user.findUnique.mockResolvedValue(null);

		await handler(req, res);

		expect(prisma.user.findUnique).toHaveBeenCalledWith({
			where: { email: "user@example.com" },
		});
		expect(bcrypt.compare).not.toHaveBeenCalled(); // CHANGED: Removed .default (though not strictly necessary for .not.toHaveBeenCalled)
		expect(res.status).toHaveBeenCalledWith(401);
		expect(res.json).toHaveBeenCalledWith({
			status: 401,
			message: "Invalid email or password",
		});
	});

	it("should return 200 and token when login is successful", async () => {
		const mockUser = {
			id: 1,
			email: "user@example.com",
			password: "hashedPassword",
		};
		prisma.user.findUnique.mockResolvedValue(mockUser);
		bcrypt.compare.mockResolvedValue(true); // CHANGED: Removed .default

		await handler(req, res);

		expect(prisma.user.findUnique).toHaveBeenCalledWith({
			where: { email: "user@example.com" },
		});
		expect(bcrypt.compare).toHaveBeenCalledWith(
			// CHANGED: Removed .default
			"password123",
			"hashedPassword"
		);
		expect(jwt.sign).toHaveBeenCalledWith(
			// CHANGED: Removed .default
			{ id: mockUser.id },
			expect.any(String),
			{ expiresIn: "1h" }
		);
		expect(res.status).toHaveBeenCalledWith(200);
		expect(res.json).toHaveBeenCalledWith({
			status: 200,
			message: "User successfully logged in",
			body: { token: "fake-token-123" },
		});
	});

	it("should return 500 when an error occurs (e.g., prisma error)", async () => {
		prisma.user.findUnique.mockRejectedValue(new Error("Database error"));
		const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

		await handler(req, res);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.json).toHaveBeenCalledWith({
			status: 500,
			message: "Internal server error",
		});
		expect(consoleSpy).toHaveBeenCalledWith("Login error:", expect.any(Error));
		consoleSpy.mockRestore();
	});

	it("should early return when rate limit is exceeded", async () => {
		rateLimitMiddleware.mockResolvedValue(true); // Rate limit exceeded

		await handler(req, res);

		expect(rateLimitMiddleware).toHaveBeenCalledWith(req, res, "login");
		expect(prisma.user.findUnique).not.toHaveBeenCalled();
	});
});
