/** @format */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock de PrismaClient
const mockPrismaConstructor = vi.fn();
vi.mock("@prisma/client", () => ({
	PrismaClient: function () {
		return mockPrismaConstructor();
	},
}));

describe("Prisma Client Singleton", () => {
	const originalNodeEnv = process.env.NODE_ENV;

	beforeEach(() => {
		// Réinitialiser les mocks et l'état global avant chaque test
		vi.resetAllMocks();
		mockPrismaConstructor.mockReturnValue({
			$connect: vi.fn().mockResolvedValue(undefined),
			$disconnect: vi.fn().mockResolvedValue(undefined),
			// Mock d'autres méthodes si nécessaire pour les tests
		});

		// Supprimer l'instance existante dans global si elle existe
		if (global.prisma) delete global.prisma;

		// Nettoyer le cache des modules pour forcer le rechargement
		vi.resetModules();
	});

	afterEach(() => {
		// Restaurer l'environnement original après chaque test
		process.env.NODE_ENV = originalNodeEnv;
	});

	it("should create a new PrismaClient instance in production environment", async () => {
		// Configurer l'environnement comme production
		process.env.NODE_ENV = "production";

		// Importer le module après avoir configuré l'environnement
		const { prisma } = await import("./prisma.js");

		// Vérifier que PrismaClient a été appelé
		expect(mockPrismaConstructor).toHaveBeenCalledTimes(1);
		expect(prisma).toBeDefined();
	});

	it("should reuse the same PrismaClient instance in development environment", async () => {
		// Configurer l'environnement comme développement
		process.env.NODE_ENV = "development";

		// Premier import
		const { prisma: prismaFirst } = await import("./prisma.js");
		expect(mockPrismaConstructor).toHaveBeenCalledTimes(1);

		// Nettoyer le cache mais garder l'objet global
		vi.resetModules();

		// Deuxième import - ne devrait pas créer une nouvelle instance
		const { prisma: prismaSecond } = await import("./prisma.js");
		expect(mockPrismaConstructor).toHaveBeenCalledTimes(1); // Toujours 1 appel

		// Les deux instances devraient pointer vers le même objet
		expect(prismaFirst).toBe(prismaSecond);
	});

	it("should create new instance if global.prisma is undefined in development", async () => {
		// Configurer l'environnement comme développement
		process.env.NODE_ENV = "development";

		// Forcer global.prisma à être undefined
		global.prisma = undefined;

		// Import du module
		const { prisma } = await import("./prisma.js");

		// Vérifier que PrismaClient a été appelé
		expect(mockPrismaConstructor).toHaveBeenCalledTimes(1);
		expect(prisma).toBeDefined();
		// Vérifier que global.prisma est maintenant défini
		expect(global.prisma).toBeDefined();
	});

	it("should export an object with Prisma client methods", async () => {
		// Import du module
		const { prisma } = await import("./prisma.js");

		// Vérifier que l'objet exporté a les méthodes attendues
		expect(prisma.$connect).toBeDefined();
		expect(typeof prisma.$connect).toBe("function");
		expect(prisma.$disconnect).toBeDefined();
		expect(typeof prisma.$disconnect).toBe("function");
	});
});
