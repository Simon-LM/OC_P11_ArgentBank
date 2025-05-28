/** @format */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import handler from "../../../api/csrf/store.js";

// Mock des dépendances
vi.mock("jsonwebtoken", () => ({
	default: {
		verify: vi.fn(),
	},
}));

vi.mock("../../../api/lib/csrf.js", () => ({
	storeUserCSRFToken: vi.fn(),
}));

// Import des mocks
import jwt from "jsonwebtoken";
import { storeUserCSRFToken } from "../../../api/lib/csrf.js";

describe("CSRF Token Storage Endpoint", () => {
	let req;
	let res;
	let consoleErrorSpy;

	beforeEach(() => {
		// Réinitialiser tous les mocks
		vi.resetAllMocks();

		// Configuration de base pour la requête
		req = {
			method: "POST",
			headers: {
				authorization: "Bearer valid-token",
			},
			body: {
				userId: "user-123",
				csrfToken: "csrf-token-xyz",
			},
		};

		// Mock de l'objet réponse
		res = {
			status: vi.fn().mockReturnThis(),
			json: vi.fn(),
		};

		// Mock de console.error pour éviter la pollution des logs de test
		consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

		// Configuration par défaut pour jwt.verify
		jwt.verify.mockReturnValue({ id: "user-123" });

		// Configuration par défaut pour storeUserCSRFToken
		storeUserCSRFToken.mockResolvedValue({
			userId: "user-123",
			token: "csrf-token-xyz",
		});
	});

	afterEach(() => {
		consoleErrorSpy.mockRestore();
	});

	it("should return 405 if method is not POST", async () => {
		req.method = "GET";

		await handler(req, res);

		expect(res.status).toHaveBeenCalledWith(405);
		expect(res.json).toHaveBeenCalledWith({
			status: 405,
			message: "Method Not Allowed",
		});
		expect(storeUserCSRFToken).not.toHaveBeenCalled();
	});

	it("should return 401 if no authorization header is provided", async () => {
		delete req.headers.authorization;

		await handler(req, res);

		expect(res.status).toHaveBeenCalledWith(401);
		expect(res.json).toHaveBeenCalledWith({
			status: 401,
			message: "Unauthorized",
		});
		expect(storeUserCSRFToken).not.toHaveBeenCalled();
	});

	it("should return 401 if authorization header does not start with 'Bearer '", async () => {
		req.headers.authorization = "Basic some-credentials";

		await handler(req, res);

		expect(res.status).toHaveBeenCalledWith(401);
		expect(res.json).toHaveBeenCalledWith({
			status: 401,
			message: "Unauthorized",
		});
		expect(storeUserCSRFToken).not.toHaveBeenCalled();
	});

	it("should return 403 if userId in token does not match userId in body", async () => {
		jwt.verify.mockReturnValue({ id: "different-user" });

		await handler(req, res);

		expect(res.status).toHaveBeenCalledWith(403);
		expect(res.json).toHaveBeenCalledWith({
			status: 403,
			message: "Access denied",
		});
		expect(storeUserCSRFToken).not.toHaveBeenCalled();
	});

	it("should store CSRF token and return 200 on success", async () => {
		await handler(req, res);

		expect(jwt.verify).toHaveBeenCalledWith("valid-token", expect.any(String));
		expect(storeUserCSRFToken).toHaveBeenCalledWith(
			"user-123",
			"csrf-token-xyz"
		);
		expect(res.status).toHaveBeenCalledWith(200);
		expect(res.json).toHaveBeenCalledWith({
			status: 200,
			message: "CSRF token stored successfully",
		});
	});

	it("should return 500 if token verification fails", async () => {
		jwt.verify.mockImplementation(() => {
			throw new Error("Invalid token");
		});

		await handler(req, res);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.json).toHaveBeenCalledWith({
			status: 500,
			message: "Internal Server Error",
		});
		expect(consoleErrorSpy).toHaveBeenCalledWith(
			"Error storing CSRF token:",
			expect.any(Error)
		);
		expect(storeUserCSRFToken).not.toHaveBeenCalled();
	});

	it("should return 500 if token storage fails", async () => {
		storeUserCSRFToken.mockRejectedValue(new Error("Storage error"));

		await handler(req, res);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.json).toHaveBeenCalledWith({
			status: 500,
			message: "Internal Server Error",
		});
		expect(consoleErrorSpy).toHaveBeenCalledWith(
			"Error storing CSRF token:",
			expect.any(Error)
		);
	});
});
