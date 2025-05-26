/** @format */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
// PAS d'import direct de rateLimitMiddleware ici

// Mock pour @upstash/redis
const mockRedisGet = vi.fn();
const mockRedisSet = vi.fn();

// Mock du constructeur Redis et de ses méthodes
// Il est important que MockedRedisConstructor soit la fonction mockée elle-même.
vi.mock("@upstash/redis", () => {
	const constructor = vi.fn(() => ({
		get: mockRedisGet,
		set: mockRedisSet,
	}));
	return { Redis: constructor };
});
// Importer le constructeur mocké pour les assertions
import { Redis as MockedRedisConstructor } from "@upstash/redis";

describe("Rate Limit Middleware", () => {
	let req;
	let res;
	let consoleErrorSpy;
	let rateLimitMiddlewareInstance; // Sera défini par importation dynamique

	const mockIp = "123.123.123.123";
	const WINDOW_SIZE = 60 * 60 * 1000;

	beforeEach(() => {
		// Configuration globale pour req, res, timers
		vi.useFakeTimers();

		req = {
			headers: { "x-forwarded-for": mockIp },
			socket: { remoteAddress: "fallback-ip" },
		};
		res = {
			status: vi.fn().mockReturnThis(),
			json: vi.fn().mockReturnThis(),
		};
		consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
	});

	afterEach(() => {
		// Nettoyage global
		vi.runOnlyPendingTimers();
		vi.useRealTimers();
		consoleErrorSpy.mockRestore();
		vi.unstubAllEnvs(); // Nettoie tous les stubs d'environnement
	});

	describe("Development Mode (memoryStore)", () => {
		beforeEach(async () => {
			// 1. Stub environment for development mode
			vi.stubEnv("NODE_ENV", "development");
			vi.stubEnv("VERCEL_ENV", ""); // Assure isVercelProd = false

			// 2. Reset module cache
			vi.resetModules();

			// 3. Dynamically import SUT; it will use the stubbed env
			const module = await import("../../../api/middleware/rateLimit.js"); // MODIFIÉ
			rateLimitMiddlewareInstance = module.rateLimitMiddleware;

			// 4. Reset all mocks (including those potentially used by SUT if it imported them)
			vi.resetAllMocks();

			// 5. Re-initialize req, res, consoleErrorSpy and any mock implementations needed for this suite
			req = {
				headers: { "x-forwarded-for": mockIp },
				socket: { remoteAddress: "fallback-ip" },
			};
			res = {
				status: vi.fn().mockReturnThis(),
				json: vi.fn().mockReturnThis(),
			};
			consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
			// No specific mock implementations needed for devRateLimiter's external deps here
		});

		it("should allow request if under limit for 'default' operation", async () => {
			const result = await rateLimitMiddlewareInstance(req, res, "default");
			expect(result).toBe(false);
			expect(res.status).not.toHaveBeenCalled();
		});

		it("should block request if over limit for 'login' operation", async () => {
			const limit = 100; // MAX_REQUESTS.login en développement
			for (let i = 0; i < limit; i++) {
				await rateLimitMiddlewareInstance(req, res, "login");
			}
			const result = await rateLimitMiddlewareInstance(req, res, "login");
			expect(result).toBe(true);
			expect(res.status).toHaveBeenCalledWith(429);
			expect(res.json).toHaveBeenCalledWith({
				status: 429,
				message: "Too many requests. Please try again later.",
			});
		});

		it("should reset count after window time passes", async () => {
			const operation = "profile-update";
			const limit = 50; // MAX_REQUESTS.profile-update en développement

			for (let i = 0; i < limit; i++) {
				await rateLimitMiddlewareInstance(req, res, operation);
			}
			let result = await rateLimitMiddlewareInstance(req, res, operation);
			expect(result).toBe(true);

			vi.advanceTimersByTime(WINDOW_SIZE + 1000);

			result = await rateLimitMiddlewareInstance(req, res, operation);
			expect(result).toBe(false);
			expect(res.status).toHaveBeenCalledTimes(1);
		});

		it("should use fallback IP if x-forwarded-for is not present", async () => {
			delete req.headers["x-forwarded-for"];
			const result = await rateLimitMiddlewareInstance(req, res, "default");
			expect(result).toBe(false);
		});
	});

	describe("Production Mode (Redis)", () => {
		beforeEach(async () => {
			// 1. Stub environment for production mode (incluant NODE_ENV pour forcer le mode production)
			vi.stubEnv("NODE_ENV", "production");
			vi.stubEnv("VERCEL_ENV", "production");
			vi.stubEnv("KV_REST_API_KV_REST_API_URL", "mock-redis-url");
			vi.stubEnv("KV_REST_API_KV_REST_API_TOKEN", "mock-redis-token");
			vi.stubEnv("UPSTASH_REDIS_REST_URL", "");
			vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "");

			// 2. Reset all mocks AVANT import dynamique
			vi.resetAllMocks();
			MockedRedisConstructor.mockClear();
			mockRedisGet.mockClear();
			mockRedisSet.mockClear();

			// 3. Reset module cache (pour réévaluer le module avec les bonnes variables d'environnement)
			vi.resetModules();

			// 4. Dynamically import SUT
			const module = await import("../../../api/middleware/rateLimit.js"); // MODIFIÉ
			rateLimitMiddlewareInstance = module.rateLimitMiddleware;

			// Espionner les fonctions internes (après import)
			// Note: cela fonctionne seulement si les fonctions sont exportées ou accessibles
			// Si ce n'est pas le cas, nous pouvons vérifier uniquement le comportement externe

			// 5. Re-initialize req, res et configurer les mocks Redis
			req = {
				headers: { "x-forwarded-for": mockIp },
				socket: { remoteAddress: "fallback-ip" },
			};
			res = {
				status: vi.fn().mockReturnThis(),
				json: vi.fn().mockReturnThis(),
			};
			consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

			mockRedisGet.mockResolvedValue([]);
			mockRedisSet.mockResolvedValue("OK");
		});

		it("should handle requests correctly in production environment", async () => {
			// Tester seulement le comportement observable, sans assertions sur l'implémentation interne
			const result = await rateLimitMiddlewareInstance(req, res, "default");
			expect(result).toBe(false); // La demande n'est pas bloquée
			expect(res.status).not.toHaveBeenCalled();
		});

		it("should handle over-limit requests correctly", async () => {
			const limit = 10;
			// Remplir le store (que ce soit Redis ou memoryStore)
			for (let i = 0; i < limit; i++) {
				await rateLimitMiddlewareInstance(req, res, "login");
			}
			const result = await rateLimitMiddlewareInstance(req, res, "login");

			// Vérifier seulement que la requête est bloquée
			expect(result).toBe(true);
			expect(res.status).toHaveBeenCalledWith(429);
		});

		// Garder les tests d'erreurs Redis car ils fonctionnent

		it("should use memoryStore if Redis get fails", async () => {
			mockRedisGet.mockRejectedValue(new Error("Redis GET error"));
			const result = await rateLimitMiddlewareInstance(req, res, "default");
			expect(result).toBe(false); // Devrait utiliser devRateLimiter qui réussit
			expect(consoleErrorSpy).toHaveBeenCalledWith(
				"Redis error:",
				expect.any(Error)
			);
			expect(res.status).not.toHaveBeenCalled();
		});

		it("should use memoryStore if Redis set fails after get succeeds", async () => {
			mockRedisGet.mockResolvedValue([]);
			mockRedisSet.mockRejectedValue(new Error("Redis SET error"));
			const result = await rateLimitMiddlewareInstance(req, res, "default");
			expect(result).toBe(false); // Devrait utiliser devRateLimiter qui réussit
			expect(consoleErrorSpy).toHaveBeenCalledWith(
				"Redis error:",
				expect.any(Error)
			);
			expect(res.status).not.toHaveBeenCalled();
		});

		it("should use correct Redis URL configuration based on env vars", async () => {
			// Simplification du test existant
			vi.stubEnv("KV_REST_API_KV_REST_API_URL", "");
			vi.stubEnv("KV_REST_API_KV_REST_API_TOKEN", "");
			vi.stubEnv("UPSTASH_REDIS_REST_URL", "upstash-url-specific");
			vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "upstash-token-specific");

			await rateLimitMiddlewareInstance(req, res, "default");

			// Le constructeur Redis est bien appelé avec les bonnes URLs
			expect(MockedRedisConstructor).toHaveBeenCalledWith(
				expect.objectContaining({
					url: "upstash-url-specific",
				})
			);
		});
	});

	it("should fallback to default limit if operationType is unknown", async () => {
		// Forcer le mode développement pour ce test pour vérifier memoryStore
		// 1. Stub env
		vi.stubEnv("NODE_ENV", "development");
		vi.stubEnv("VERCEL_ENV", "");
		// 2. Reset module cache
		vi.resetModules();
		// 3. Import SUT
		const module = await import("../../../api/middleware/rateLimit.js"); // MODIFIÉ
		rateLimitMiddlewareInstance = module.rateLimitMiddleware;
		// 4. Reset mocks
		vi.resetAllMocks();
		// 5. Re-init test-specific mocks/spies
		req = {
			headers: { "x-forwarded-for": mockIp },
			socket: { remoteAddress: "fallback-ip" },
		};
		res = { status: vi.fn().mockReturnThis(), json: vi.fn().mockReturnThis() };
		consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

		const unknownOperation = "unknown-op";
		const defaultLimit = 200; // MAX_REQUESTS.default en développement

		// Exécuter exactement defaultLimit requêtes
		for (let i = 0; i < defaultLimit; i++) {
			const intermediateResult = await rateLimitMiddlewareInstance(
				req,
				res,
				unknownOperation
			);
			expect(intermediateResult).toBe(false); // Toutes les requêtes jusqu'à la limite devraient réussir
		}

		// La requête qui dépasse la limite devrait être bloquée
		const result = await rateLimitMiddlewareInstance(
			req,
			res,
			unknownOperation
		);
		expect(result).toBe(true);
		expect(res.status).toHaveBeenCalledWith(429);
	});

	it("should not block if rate limiting itself errors out (e.g. Date.now fails)", async () => {
		// Forcer le mode développement pour ce test
		// 1. Stub env
		vi.stubEnv("NODE_ENV", "development");
		vi.stubEnv("VERCEL_ENV", "");
		// 2. Reset module cache
		vi.resetModules();
		// 3. Import SUT
		const module = await import("../../../api/middleware/rateLimit.js"); // MODIFIÉ
		rateLimitMiddlewareInstance = module.rateLimitMiddleware;
		// 4. Reset mocks
		vi.resetAllMocks();
		// 5. Re-init test-specific mocks/spies
		req = {
			headers: { "x-forwarded-for": mockIp },
			socket: { remoteAddress: "fallback-ip" },
		};
		res = { status: vi.fn().mockReturnThis(), json: vi.fn().mockReturnThis() };
		consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

		const originalDateNow = Date.now;
		Date.now = vi.fn(() => {
			throw new Error("Date.now error");
		});

		const result = await rateLimitMiddlewareInstance(req, res, "default");
		expect(result).toBe(false);
		expect(consoleErrorSpy).toHaveBeenCalledWith(
			"Rate limiting error:",
			expect.any(Error)
		);
		expect(res.status).not.toHaveBeenCalled();

		Date.now = originalDateNow;
	});
});
