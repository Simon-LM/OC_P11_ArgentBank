/** @format */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import handler from "../../../api/user/signup.js"; // SUT

// Mock externals
vi.mock("bcrypt", () => ({
	default: {
		hash: vi.fn(),
	},
}));

vi.mock("../../../api/lib/prisma.js", () => ({
	// MODIFIÉ: chemin vers api/lib/
	prisma: {
		user: {
			findUnique: vi.fn(),
			create: vi.fn(),
		},
	},
}));

// Import mocked dependencies
import bcrypt from "bcrypt";
import { prisma } from "../../../api/lib/prisma.js"; // MODIFIÉ: chemin vers api/lib/

describe("Signup API Handler", () => {
	let req;
	let res;
	let consoleErrorSpy;

	beforeEach(() => {
		vi.resetAllMocks();

		req = {
			method: "POST",
			body: {
				email: "test@example.com",
				password: "password123",
				firstName: "Test",
				lastName: "User",
				userName: "testuser",
			},
			on: vi.fn(),
		};
		res = {
			status: vi.fn().mockReturnThis(),
			json: vi.fn().mockReturnThis(),
			setHeader: vi.fn(),
			end: vi.fn(),
		};
		consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

		bcrypt.hash.mockResolvedValue("hashedpassword123");
		prisma.user.findUnique.mockResolvedValue(null);
		prisma.user.create.mockResolvedValue({
			id: "user-id-new",
			email: "test@example.com",
		});
	});

	afterEach(() => {
		consoleErrorSpy.mockRestore();
	});

	it("should handle OPTIONS request for CORS preflight", async () => {
		req.method = "OPTIONS";
		await handler(req, res);
		expect(res.status).toHaveBeenCalledWith(200);
		expect(res.end).toHaveBeenCalled();
	});

	it("should return 405 if method is not POST or OPTIONS", async () => {
		req.method = "GET";
		await handler(req, res);
		expect(res.status).toHaveBeenCalledWith(405);
		expect(res.json).toHaveBeenCalledWith({
			status: 405,
			message: "Method Not Allowed",
		});
	});

	it("should return 400 if required fields are missing", async () => {
		req.body = { email: "test@example.com" };
		await handler(req, res);
		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.json).toHaveBeenCalledWith({
			status: 400,
			message: "Invalid Fields",
		});
	});

	it("should return 400 if email is already in use", async () => {
		prisma.user.findUnique.mockResolvedValue({ id: "existing-user" });
		await handler(req, res);
		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.json).toHaveBeenCalledWith({
			status: 400,
			message: "Email already in use",
		});
	});

	it("should create a new user successfully", async () => {
		await handler(req, res);
		expect(bcrypt.hash).toHaveBeenCalledWith("password123", 10);
		expect(prisma.user.create).toHaveBeenCalledWith({
			data: {
				email: "test@example.com",
				password: "hashedpassword123",
				firstName: "Test",
				lastName: "User",
				userName: "testuser",
			},
		});
		expect(res.status).toHaveBeenCalledWith(201);
		expect(res.json).toHaveBeenCalledWith({
			status: 201,
			message: "Signup Successfully",
			body: { id: "user-id-new", email: "test@example.com" },
		});
	});

	it("should return 500 if bcrypt hashing fails", async () => {
		bcrypt.hash.mockRejectedValue(new Error("Hashing failed"));
		await handler(req, res);
		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.json).toHaveBeenCalledWith({
			status: 500,
			message: "Internal Server Error",
		});
		expect(consoleErrorSpy).toHaveBeenCalledWith(
			"Signup error:",
			expect.any(Error)
		);
	});

	it("should return 500 if Prisma create fails", async () => {
		prisma.user.create.mockRejectedValue(new Error("DB create error"));
		await handler(req, res);
		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.json).toHaveBeenCalledWith({
			status: 500,
			message: "Internal Server Error",
		});
		expect(consoleErrorSpy).toHaveBeenCalledWith(
			"Signup error:",
			expect.any(Error)
		);
	});
});
