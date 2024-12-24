/** @format */

import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import {
	loginUser,
	fetchUserProfile,
	updateUserProfile,
	initializeAuth,
} from "./authService";
import store, { AppDispatch } from "../store/Store";

beforeEach(() => {
	vi.stubGlobal("fetch", vi.fn());
});

afterEach(() => {
	vi.restoreAllMocks();
});

describe("loginUser Function", () => {
	// Mock de réponse valide
	const mockValidLoginResponse = {
		status: 200,
		message: "User successfully logged in",
		body: {
			token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
		},
	};

	// Mock de réponse invalide
	const mockInvalidLoginResponse = {
		status: 401,
		message: "invalid signature",
	};

	test("renvoie un token pour des identifiants valides", async () => {
		(fetch as unknown as vi.Mock).mockResolvedValueOnce({
			ok: true,
			json: async () => mockValidLoginResponse,
		});

		const result = await loginUser({
			email: "steve@rogers.com",
			password: "password123",
		});

		expect(result).toBe(mockValidLoginResponse.body.token);
	});

	test("lance une erreur pour des identifiants invalides", async () => {
		(fetch as unknown as vi.Mock).mockResolvedValueOnce({
			ok: false,
			status: 401,
			json: async () => mockInvalidLoginResponse,
		});

		await expect(
			loginUser({
				email: "steve@rogers.com",
				password: "wrongpass",
			})
		).rejects.toThrow("Login failed: 401 - invalid signature");
	});
});

describe("fetchUserProfile Function", () => {
	const mockValidProfileResponse = {
		status: 200,
		message: "Successfully got user profile data",
		body: {
			email: "steve@rogers.com",
			firstName: "Steve",
			lastName: "Rogers",
			userName: "Captain",
			createdAt: "2024-09-15T15:25:33.375Z",
			updatedAt: "2024-12-24T16:49:18.315Z",
			id: "66e6fc6d339057ebf4c9701b",
			accounts: [
				{
					accountName: "Argent Bank Checking",
					accountNumber: "8349",
					balance: "$2,082.79",
					balanceType: "Available Balance",
				},
			],
		},
	};

	test("récupère le profil avec succès", async () => {
		(fetch as unknown as vi.Mock).mockResolvedValueOnce({
			ok: true,
			json: async () => mockValidProfileResponse,
		});

		const profile = await fetchUserProfile("valid-token");
		expect(profile).toEqual(mockValidProfileResponse.body);
	});
});
describe("updateUserProfile Function", () => {
	test("devrait mettre à jour le profil utilisateur avec succès", async () => {
		(fetch as unknown as vi.Mock).mockResolvedValueOnce({
			ok: true,
			json: async () => ({
				status: 200,
				message: "Profile updated",
				body: {
					id: "66e6fc6d339057ebf4c9701b",
					email: "steve@rogers.com",
					userName: "CaptainUpdated",
					createdAt: "2024-09-15T15:25:33.375Z",
					updatedAt: "2024-12-24T16:49:18.315Z",
				},
			}),
		});

		const result = await updateUserProfile("CaptainUpdated", "valid-token");
		expect(result.userName).toBe("CaptainUpdated");
	});

	test("devrait lancer une erreur si la mise à jour échoue", async () => {
		(fetch as unknown as vi.Mock).mockResolvedValueOnce({
			ok: false,
			status: 400,
			json: async () => ({
				status: 400,
				message: "Bad request",
			}),
		});

		await expect(
			updateUserProfile("CaptainUpdated", "invalid-token")
		).rejects.toThrow("Update failed: 400 - Bad request");
	});
});

describe("initializeAuth Function", () => {
	const mockDispatch = vi.fn();

	test("ne fait rien si pas de token en sessionStorage", async () => {
		// S'assurer que sessionStorage est vide
		sessionStorage.clear();

		const initAuthThunk = initializeAuth();
		await initAuthThunk(mockDispatch);

		// Vérifier qu'aucune action n'a été dispatchée
		expect(mockDispatch).not.toHaveBeenCalled();
	});

	test("charge l'utilisateur s'il y a un token valide", async () => {
		// Configurer un token valide
		sessionStorage.setItem("authToken", "test-token");
		sessionStorage.setItem("expiresAt", (Date.now() + 100000).toString());

		// Mock de la réponse API
		(fetch as unknown as vi.Mock).mockResolvedValueOnce({
			ok: true,
			json: async () => ({
				status: 200,
				message: "Successfully got user profile data",
				body: {
					id: "66e6fc6d339057ebf4c9701b",
					email: "steve@rogers.com",
					userName: "Captain",
					firstName: "Steve",
					lastName: "Rogers",
					createdAt: "2024-09-15T15:25:33.375Z",
					updatedAt: "2024-12-24T16:49:18.315Z",
				},
			}),
		});

		const initAuthThunk = initializeAuth();
		await initAuthThunk(mockDispatch);

		// Vérifier que setAuthState a été appelé avec le profil
		expect(mockDispatch).toHaveBeenCalledWith(
			expect.objectContaining({
				type: "users/setAuthState",
			})
		);
	});

	test("déconnecte l'utilisateur si le token a expiré", async () => {
		// Configurer un token expiré
		sessionStorage.setItem("authToken", "test-token");
		sessionStorage.setItem("expiresAt", (Date.now() - 1000).toString());

		const initAuthThunk = initializeAuth();
		await initAuthThunk(mockDispatch);

		// Vérifier que logoutUser a été appelé
		expect(mockDispatch).toHaveBeenCalledWith(
			expect.objectContaining({
				type: "users/logoutUser",
			})
		);
	});
});
