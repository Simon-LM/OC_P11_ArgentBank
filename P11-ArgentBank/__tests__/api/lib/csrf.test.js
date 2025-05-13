/** @format */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { storeUserCSRFToken, getUserCSRFToken } from "../../../api/lib/csrf.js"; // MODIFIÉ

// Créer un mock pour le module prisma.js que csrf.js importe (api/lib/prisma.js)
// csrf.js (dans api/lib/) importe "./prisma.js", donc le mock doit cibler api/lib/prisma.js
vi.mock("../../../api/lib/prisma.js", async () => {
	// MODIFIÉ
	const mockCsrfToken = {
		findUnique: vi.fn(),
		update: vi.fn(),
		create: vi.fn(),
	};

	return {
		prisma: {
			csrfToken: mockCsrfToken,
		},
	};
});

// Importer le module mocké
const { prisma } = await import("../../../api/lib/prisma.js"); // MODIFIÉ

describe("CSRF Token Management", () => {
	const mockUserId = "user-123";
	const mockToken = "csrf-token-xyz";
	const mockDate = new Date("2023-01-01");

	beforeEach(() => {
		vi.resetAllMocks();
		// Utiliser une date fixe pour faciliter les tests
		vi.useFakeTimers();
		vi.setSystemTime(mockDate);
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	describe("storeUserCSRFToken", () => {
		it("should update existing token if one exists", async () => {
			// Simuler qu'un token existe déjà
			prisma.csrfToken.findUnique.mockResolvedValue({
				userId: mockUserId,
				token: "old-token",
			});

			prisma.csrfToken.update.mockResolvedValue({
				userId: mockUserId,
				token: mockToken,
				updatedAt: mockDate,
			});

			const result = await storeUserCSRFToken(mockUserId, mockToken);

			expect(prisma.csrfToken.findUnique).toHaveBeenCalledWith({
				where: { userId: mockUserId },
			});

			expect(prisma.csrfToken.update).toHaveBeenCalledWith({
				where: { userId: mockUserId },
				data: {
					token: mockToken,
					updatedAt: mockDate,
				},
			});

			expect(prisma.csrfToken.create).not.toHaveBeenCalled();
			expect(result).toEqual({
				userId: mockUserId,
				token: mockToken,
				updatedAt: mockDate,
			});
		});

		it("should create a new token if none exists", async () => {
			// Simuler qu'aucun token n'existe
			prisma.csrfToken.findUnique.mockResolvedValue(null);

			prisma.csrfToken.create.mockResolvedValue({
				userId: mockUserId,
				token: mockToken,
				createdAt: mockDate,
				updatedAt: mockDate,
			});

			const result = await storeUserCSRFToken(mockUserId, mockToken);

			expect(prisma.csrfToken.findUnique).toHaveBeenCalledWith({
				where: { userId: mockUserId },
			});

			expect(prisma.csrfToken.create).toHaveBeenCalledWith({
				data: {
					userId: mockUserId,
					token: mockToken,
					createdAt: mockDate,
					updatedAt: mockDate,
				},
			});

			expect(prisma.csrfToken.update).not.toHaveBeenCalled();
			expect(result).toEqual({
				userId: mockUserId,
				token: mockToken,
				createdAt: mockDate,
				updatedAt: mockDate,
			});
		});

		it("should throw error when database operation fails", async () => {
			const mockError = new Error("Database error");
			prisma.csrfToken.findUnique.mockRejectedValue(mockError);

			const consoleSpy = vi
				.spyOn(console, "error")
				.mockImplementation(() => {});

			await expect(storeUserCSRFToken(mockUserId, mockToken)).rejects.toThrow(
				mockError
			);

			expect(consoleSpy).toHaveBeenCalledWith(
				"Error storing CSRF token:",
				mockError
			);
			consoleSpy.mockRestore();
		});
	});

	describe("getUserCSRFToken", () => {
		it("should return the token if it exists", async () => {
			prisma.csrfToken.findUnique.mockResolvedValue({
				userId: mockUserId,
				token: mockToken,
			});

			const result = await getUserCSRFToken(mockUserId);

			expect(prisma.csrfToken.findUnique).toHaveBeenCalledWith({
				where: { userId: mockUserId },
			});

			expect(result).toBe(mockToken);
		});

		it("should return null if no token exists", async () => {
			prisma.csrfToken.findUnique.mockResolvedValue(null);

			const result = await getUserCSRFToken(mockUserId);

			expect(prisma.csrfToken.findUnique).toHaveBeenCalledWith({
				where: { userId: mockUserId },
			});

			expect(result).toBeNull();
		});

		it("should return null when database operation fails", async () => {
			const mockError = new Error("Database error");
			prisma.csrfToken.findUnique.mockRejectedValue(mockError);

			const consoleSpy = vi
				.spyOn(console, "error")
				.mockImplementation(() => {});

			const result = await getUserCSRFToken(mockUserId);

			expect(result).toBeNull();
			expect(consoleSpy).toHaveBeenCalledWith(
				"Error retrieving CSRF token:",
				mockError
			);
			consoleSpy.mockRestore();
		});
	});
});
