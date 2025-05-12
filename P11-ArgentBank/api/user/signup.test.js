/** @format */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock modules
vi.mock("bcrypt", () => ({
	default: {
		hash: vi.fn(),
	},
}));

vi.mock("../lib/prisma.js", () => ({
	prisma: {
		user: {
			findUnique: vi.fn(),
			create: vi.fn(),
		},
	},
}));

// Import the handler and mocked modules AFTER vi.mock calls
import handler from "./signup.js";
import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma.js";

describe("Signup API Handler", () => {
	let req;
	let res;
	let consoleErrorSpy;

	const mockUserData = {
		email: "test@example.com",
		password: "password123",
		firstName: "Test",
		lastName: "User",
		userName: "TestUser",
	};

	beforeEach(() => {
		vi.resetAllMocks();

		bcrypt.hash.mockResolvedValue("hashedPassword123");
		prisma.user.findUnique.mockResolvedValue(null); // Default: user does not exist
		prisma.user.create.mockImplementation(async (data) => ({
			id: "new-user-id",
			...data.data, // prisma.user.create takes { data: { ... } }
		}));

		req = {
			method: "POST",
			body: { ...mockUserData },
			headers: {
				"Content-Type": "application/json",
			},
			on: vi.fn(), // For raw body parsing tests
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

	it("should handle OPTIONS request", async () => {
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
			"POST, OPTIONS"
		);
		expect(res.setHeader).toHaveBeenCalledWith(
			"Access-Control-Allow-Headers",
			"Content-Type"
		);
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

	describe("POST /api/user/signup", () => {
		it("should successfully create a new user", async () => {
			await handler(req, res);

			expect(prisma.user.findUnique).toHaveBeenCalledWith({
				where: { email: mockUserData.email },
			});
			expect(bcrypt.hash).toHaveBeenCalledWith(mockUserData.password, 10);
			expect(prisma.user.create).toHaveBeenCalledWith({
				data: {
					email: mockUserData.email,
					password: "hashedPassword123",
					firstName: mockUserData.firstName,
					lastName: mockUserData.lastName,
					userName: mockUserData.userName,
				},
			});
			expect(res.status).toHaveBeenCalledWith(201);
			expect(res.json).toHaveBeenCalledWith({
				status: 201,
				message: "Signup Successfully",
				body: { id: "new-user-id", email: mockUserData.email },
			});
		});

		it("should return 400 if email is already in use", async () => {
			prisma.user.findUnique.mockResolvedValue({ id: "existing-user-id" });
			await handler(req, res);

			expect(prisma.user.findUnique).toHaveBeenCalledWith({
				where: { email: mockUserData.email },
			});
			expect(bcrypt.hash).not.toHaveBeenCalled();
			expect(prisma.user.create).not.toHaveBeenCalled();
			expect(res.status).toHaveBeenCalledWith(400);
			expect(res.json).toHaveBeenCalledWith({
				status: 400,
				message: "Email already in use",
			});
		});

		it.each([
			["email"],
			["password"],
			["firstName"],
			["lastName"],
			["userName"],
		])("should return 400 if %s is missing", async (field) => {
			req.body = { ...mockUserData };
			delete req.body[field];
			await handler(req, res);

			expect(res.status).toHaveBeenCalledWith(400);
			expect(res.json).toHaveBeenCalledWith({
				status: 400,
				message: "Invalid Fields",
			});
		});

		it("should correctly parse JSON body if req.body is not initially populated", async () => {
			const rawBody = JSON.stringify(mockUserData);
			req.body = undefined; // Simulate req.body not being populated

			const listeners = {};
			req.on = vi.fn((event, callback) => {
				listeners[event] = callback;
			});

			const handlerPromise = handler(req, res);

			// Yield to ensure the handler has progressed enough to attach listeners
			await new Promise((resolve) => setTimeout(resolve, 0));

			expect(listeners.data).toBeDefined();
			expect(listeners.end).toBeDefined();

			if (listeners.data) listeners.data(Buffer.from(rawBody));
			if (listeners.end) listeners.end();

			await handlerPromise;

			expect(prisma.user.create).toHaveBeenCalledWith({
				data: {
					email: mockUserData.email,
					password: "hashedPassword123",
					firstName: mockUserData.firstName,
					lastName: mockUserData.lastName,
					userName: mockUserData.userName,
				},
			});
			expect(res.status).toHaveBeenCalledWith(201);
		});

		it("should return 400 if JSON body is malformed when req.body is initially undefined", async () => {
			const rawBody = "{ email: 'test@example.com"; // Malformed JSON
			req.body = undefined;

			const listeners = {};
			req.on = vi.fn((event, callback) => {
				listeners[event] = callback;
			});

			const handlerPromise = handler(req, res);

			await new Promise((resolve) => setTimeout(resolve, 0));

			expect(listeners.data).toBeDefined();
			expect(listeners.end).toBeDefined();

			if (listeners.data) listeners.data(Buffer.from(rawBody));
			if (listeners.end) listeners.end();

			await handlerPromise;

			// Because JSON.parse fails, body becomes {}, leading to "Invalid Fields"
			expect(res.status).toHaveBeenCalledWith(400);
			expect(res.json).toHaveBeenCalledWith({
				status: 400,
				message: "Invalid Fields",
			});
		});

		it("should return 500 if prisma.user.findUnique fails", async () => {
			prisma.user.findUnique.mockRejectedValue(
				new Error("DB findUnique error")
			);
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

		it("should return 500 if bcrypt.hash fails", async () => {
			bcrypt.hash.mockRejectedValue(new Error("Hashing error"));
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

		it("should return 500 if prisma.user.create fails", async () => {
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
});
