/** @format */

import { loginUser, fetchUserProfile, loginSchema } from "./authService";
// import { loginSchema } from "./authService";
import { expect, test, describe, vi } from "vitest";

// Mock fetch globalement
global.fetch = vi.fn();

describe("loginSchema Validation", () => {
	test("devrait valider correctement des informations de connexion valides", () => {
		const validCredentials = {
			email: "test@example.com",
			password: "password123",
		};
		const parsed = loginSchema.safeParse(validCredentials);
		expect(parsed.success).toBe(true);
	});

	test("devrait échouer pour un email invalide", () => {
		const invalidCredentials = {
			email: "invalid-email",
			password: "password123",
		};
		const parsed = loginSchema.safeParse(invalidCredentials);
		expect(parsed.success).toBe(false);
	});

	test("devrait échouer pour un mot de passe trop court", () => {
		const invalidCredentials = { email: "test@example.com", password: "short" };
		const parsed = loginSchema.safeParse(invalidCredentials);
		expect(parsed.success).toBe(false);
	});
});

describe("loginUser Function", () => {
	test("should return a token when valid credentials are provided", async () => {
		const validCredentials = {
			email: "test@example.com",
			password: "validPassword123",
		};
		const mockToken = "mockToken123";

		// Mock de la réponse fetch
		global.fetch = vi.fn(
			() =>
				Promise.resolve({
					ok: true,
					status: 200,
					statusText: "OK",
					headers: new Headers({ "Content-Type": "application/json" }),
					json: () =>
						Promise.resolve({
							status: 200,
							message: "Success",
							body: { token: mockToken },
						}),
				}) as Promise<Response> // Ici on indique à TypeScript que c'est un Promise<Response>
		);

		const token = await loginUser(validCredentials);
		expect(token).toBe(mockToken);
	});

	test("should throw an error when invalid credentials are provided", async () => {
		const invalidCredentials = {
			email: "test@example.com",
			password: "invalidPassword",
		};

		// Simulation d'une réponse incorrecte
		global.fetch = vi.fn(
			() =>
				Promise.resolve({
					ok: false,
					status: 401,
					statusText: "Unauthorized",
					headers: new Headers({ "Content-Type": "application/json" }),
					json: () =>
						Promise.resolve({
							status: 401,
							message: "Invalid credentials",
						}),
				}) as Promise<Response>
		);

		await expect(loginUser(invalidCredentials)).rejects.toThrow(
			"Login failed: 401 - Invalid credentials"
		);
	});
	test("should throw an error if credentials are invalid", async () => {
		const invalidCredentials = {
			email: "invalid-email",
			password: "short",
		};

		await expect(loginUser(invalidCredentials)).rejects.toThrow(
			"Invalid email format"
		);
	});

	test("should throw an error if the API response does not match the schema", async () => {
		const validCredentials = {
			email: "test@example.com",
			password: "validPassword123",
		};

		global.fetch = vi.fn(
			() =>
				Promise.resolve({
					ok: true,
					status: 200,
					json: () =>
						Promise.resolve({
							status: 200,
							message: "Success",
							body: { wrongField: "mockToken" }, // Champs incorrect
						}),
				}) as Promise<Response>
		);

		await expect(loginUser(validCredentials)).rejects.toThrow();
	});
});

describe("fetchUserProfile Function", () => {
	test("should return user profile when valid token is provided", async () => {
		const mockToken = "validToken123";
		const mockProfile = {
			status: 200,
			message: "Success",
			body: {
				id: "user-id",
				email: "test@example.com",
				userName: "TestUser",
			},
		};

		// Mock de la réponse fetch pour la requête du profil utilisateur
		global.fetch = vi.fn(
			() =>
				Promise.resolve({
					ok: true,
					status: 200,
					json: () => Promise.resolve(mockProfile),
				}) as Promise<Response>
		);

		const profile = await fetchUserProfile(mockToken);

		// On compare directement à la propriété `body` de la réponse de l'API
		expect(profile).toEqual(mockProfile.body);
	});

	test("should throw an error if fetch fails", async () => {
		const mockToken = "mockToken123";

		global.fetch = vi.fn(
			() =>
				Promise.resolve({
					ok: false,
					status: 403,
					json: () => Promise.resolve({ status: 403, message: "Unauthorized" }),
				}) as Promise<Response>
		);

		await expect(fetchUserProfile(mockToken)).rejects.toThrow();
	});

	test("should throw an error if response does not match the schema", async () => {
		const mockToken = "mockToken123";

		global.fetch = vi.fn(
			() =>
				Promise.resolve({
					ok: true,
					status: 200,
					json: () => Promise.resolve({ wrongField: "mockData" }), // Champs incorrect
				}) as Promise<Response>
		);

		await expect(fetchUserProfile(mockToken)).rejects.toThrow();
	});
});
