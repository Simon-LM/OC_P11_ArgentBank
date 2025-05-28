/** @format */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock modules - Doit être au top-level et avant les imports des modules mockés
vi.mock("jsonwebtoken", () => ({
	default: {
		verify: vi.fn(),
	},
}));

vi.mock("../../../api/lib/prisma.js", () => ({
	prisma: {
		user: {
			findUnique: vi.fn(),
			update: vi.fn(),
		},
	},
}));

vi.mock("../../../api/middleware/rateLimit.js", () => ({
	rateLimitMiddleware: vi.fn(),
}));

vi.mock("../../../api/lib/csrf.js", () => ({
	getUserCSRFToken: vi.fn(),
}));

vi.mock("../../../api/lib/blacklist.js", () => ({
	usernameBlacklist: ["badword", "anotherbadword"],
}));

// Import the handler and mocked modules AFTER vi.mock calls
import handler from "../../../api/user/profile.js";
import jwt from "jsonwebtoken";
import { prisma } from "../../../api/lib/prisma.js";
import { rateLimitMiddleware } from "../../../api/middleware/rateLimit.js";
import { getUserCSRFToken } from "../../../api/lib/csrf.js";

describe("Profile API Handler", () => {
	let req;
	let res;
	let consoleErrorSpy;

	const mockUser = {
		id: "user-id-123",
		email: "test@example.com",
		userName: "TestUser",
		firstName: "Test",
		lastName: "User",
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	};

	const JWT_SECRET = process.env.JWT_SECRET || "default_secret_key";

	beforeEach(() => {
		vi.resetAllMocks();

		jwt.verify.mockReturnValue({ id: mockUser.id });
		prisma.user.findUnique.mockResolvedValue(mockUser);
		prisma.user.update.mockResolvedValue({
			...mockUser,
			userName: "UpdatedUser", // Default for successful update
		});
		rateLimitMiddleware.mockResolvedValue(false);
		getUserCSRFToken.mockResolvedValue("valid-csrf-token");

		req = {
			headers: {
				authorization: `Bearer valid-jwt-token`,
				"x-csrf-token": "valid-csrf-token",
			},
			body: {}, // Populated by default for most tests
			on: vi.fn(), // Default mock for req.on
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
		if (consoleErrorSpy) {
			consoleErrorSpy.mockRestore();
		}
	});

	describe("GET /api/user/profile", () => {
		beforeEach(() => {
			req.method = "GET";
		});

		it("should return user profile on successful retrieval", async () => {
			await handler(req, res);

			expect(jwt.verify).toHaveBeenCalledWith("valid-jwt-token", JWT_SECRET);
			expect(prisma.user.findUnique).toHaveBeenCalledWith({
				where: { id: mockUser.id },
			});
			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith({
				status: 200,
				message: "User profile retrieved successfully",
				body: {
					id: mockUser.id,
					email: mockUser.email,
					userName: mockUser.userName,
					firstName: mockUser.firstName,
					lastName: mockUser.lastName,
					createdAt: mockUser.createdAt,
					updatedAt: mockUser.updatedAt,
				},
			});
		});

		it("should return 401 if no Authorization header", async () => {
			req.headers.authorization = undefined;
			await handler(req, res);
			expect(res.status).toHaveBeenCalledWith(401);
			expect(res.json).toHaveBeenCalledWith({
				status: 401,
				message: "Unauthorized",
			});
		});

		it("should return 401 if Authorization header is not Bearer token", async () => {
			req.headers.authorization = "Basic somecredentials";
			await handler(req, res);
			expect(res.status).toHaveBeenCalledWith(401);
			expect(res.json).toHaveBeenCalledWith({
				status: 401,
				message: "Unauthorized",
			});
		});

		it("should return 500 if JWT verification fails", async () => {
			jwt.verify.mockImplementation(() => {
				throw new Error("JWT verification failed");
			});
			await handler(req, res);
			expect(res.status).toHaveBeenCalledWith(500);
			expect(res.json).toHaveBeenCalledWith({
				status: 500,
				message: "Internal Server Error",
			});
			expect(consoleErrorSpy).toHaveBeenCalledWith(
				"Profile error:",
				expect.any(Error)
			);
		});

		it("should return 404 if user not found in database", async () => {
			prisma.user.findUnique.mockResolvedValue(null);
			await handler(req, res);
			expect(res.status).toHaveBeenCalledWith(404);
			expect(res.json).toHaveBeenCalledWith({
				status: 404,
				message: "User not found",
			});
		});

		it("should return 500 if database query fails", async () => {
			prisma.user.findUnique.mockRejectedValue(new Error("DB error"));
			await handler(req, res);
			expect(res.status).toHaveBeenCalledWith(500);
			expect(res.json).toHaveBeenCalledWith({
				status: 500,
				message: "Internal Server Error",
			});
			expect(consoleErrorSpy).toHaveBeenCalledWith(
				"Profile error:",
				expect.any(Error)
			);
		});
	});

	describe("PUT /api/user/profile (or PATCH)", () => {
		beforeEach(() => {
			req.method = "PUT"; // Default to PUT for this block
			req.body = {
				// Default body for update tests
				userName: "UpdatedUser",
				firstName: "UpdatedFirst",
				lastName: "UpdatedLast",
			};
		});

		const testUpdateProfile = async () => {
			// Ensure prisma.user.update is mocked to return the expected shape for this specific call
			// This mock should reflect what the handler would return after a successful update with req.body data
			prisma.user.update.mockResolvedValueOnce({
				...mockUser, // Start with base mock user data
				userName: req.body.userName || mockUser.userName, // Apply updates from req.body
				firstName: req.body.firstName || mockUser.firstName,
				lastName: req.body.lastName || mockUser.lastName,
				updatedAt: new Date().toISOString(), // Simulate updatedAt being changed
			});

			await handler(req, res);

			expect(jwt.verify).toHaveBeenCalledWith("valid-jwt-token", JWT_SECRET);
			expect(getUserCSRFToken).toHaveBeenCalledWith(mockUser.id);
			expect(prisma.user.update).toHaveBeenCalledWith({
				where: { id: mockUser.id },
				data: {
					// Data sent to prisma should be the sanitized version of req.body
					userName: req.body.userName, // Assuming sanitizeInput handles undefined correctly or they are always present
					firstName: req.body.firstName,
					lastName: req.body.lastName,
				},
			});
			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith(
				expect.objectContaining({
					status: 200,
					message: "User profile updated successfully",
					body: expect.objectContaining({
						// The body in response should reflect the updated data
						userName: req.body.userName,
						firstName: req.body.firstName,
						lastName: req.body.lastName,
					}),
				})
			);
		};

		it("should update user profile successfully with PUT", async () => {
			req.method = "PUT";
			req.body = {
				userName: "UpdatedUserViaPUT",
				firstName: "FirstPUT",
				lastName: "LastPUT",
			};
			await testUpdateProfile();
		});

		it("should update user profile successfully with PATCH", async () => {
			req.method = "PATCH";
			req.body = {
				userName: "UpdatedUserViaPATCH",
				firstName: "FirstPATCH",
				lastName: "LastPATCH",
			};
			await testUpdateProfile();
		});

		it("should correctly parse JSON body if req.body is not initially populated", async () => {
			const rawBody = JSON.stringify({ userName: "StreamedUser" });
			req.body = undefined; // Simulate req.body not being populated by middleware
			prisma.user.update.mockResolvedValueOnce({
				// Ensure this mock is specific for this test case
				...mockUser,
				userName: "StreamedUser",
			});

			// Simulate the event emitter behavior more directly for testing
			const listeners = {};
			req.on = vi.fn((event, callback) => {
				listeners[event] = callback;
			});

			// Call handler, it will attach listeners
			const handlerPromise = handler(req, res);

			// Yield to ensure the handler has progressed enough to attach listeners
			await new Promise((resolve) => setTimeout(resolve, 0));

			expect(listeners.data).toBeDefined();
			expect(listeners.end).toBeDefined();

			if (listeners.data) listeners.data(Buffer.from(rawBody));
			if (listeners.end) listeners.end();

			await handlerPromise; // Now wait for the handler to complete

			expect(prisma.user.update).toHaveBeenCalledWith(
				expect.objectContaining({
					data: expect.objectContaining({ userName: "StreamedUser" }),
				})
			);
			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith(
				expect.objectContaining({
					body: expect.objectContaining({ userName: "StreamedUser" }),
				})
			);
		});

		it("should return 400 if JSON body is malformed when req.body is initially undefined", async () => {
			const rawBody = "{ userName: 'MalformedJSON"; // Malformed JSON
			req.body = undefined;

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

			// The handler should catch the JSON.parse error and return 400 or a specific error.
			// Based on your handler, if JSON.parse fails, body becomes {}, leading to "No fields to update"
			expect(res.status).toHaveBeenCalledWith(400);
			expect(res.json).toHaveBeenCalledWith({
				status: 400,
				message: "No fields to update", // This is because JSON.parse fails, body becomes {}
			});
		});

		it("should return 401 if no Authorization header", async () => {
			req.headers.authorization = undefined;
			await handler(req, res);
			expect(res.status).toHaveBeenCalledWith(401);
			expect(res.json).toHaveBeenCalledWith({
				status: 401,
				message: "Unauthorized",
			});
		});

		it("should return 403 if no CSRF token", async () => {
			req.headers["x-csrf-token"] = undefined;
			await handler(req, res);
			expect(res.status).toHaveBeenCalledWith(403);
			expect(res.json).toHaveBeenCalledWith({
				status: 403,
				message: "CSRF token missing",
			});
		});

		it("should return 403 if invalid CSRF token", async () => {
			getUserCSRFToken.mockResolvedValue("different-stored-csrf-token");
			await handler(req, res);
			expect(res.status).toHaveBeenCalledWith(403);
			expect(res.json).toHaveBeenCalledWith({
				status: 403,
				message: "Invalid CSRF token",
			});
		});

		it("should return 403 if stored CSRF token is null", async () => {
			getUserCSRFToken.mockResolvedValue(null);
			await handler(req, res);
			expect(res.status).toHaveBeenCalledWith(403);
			expect(res.json).toHaveBeenCalledWith({
				status: 403,
				message: "Invalid CSRF token",
			});
		});

		it("should return early if rate limit exceeded", async () => {
			rateLimitMiddleware.mockResolvedValue(true);
			await handler(req, res);
			expect(rateLimitMiddleware).toHaveBeenCalledWith(
				req,
				res,
				"profile-update"
			);
			expect(prisma.user.update).not.toHaveBeenCalled();
		});

		it("should return 400 if no fields to update", async () => {
			req.body = {};
			await handler(req, res);
			expect(res.status).toHaveBeenCalledWith(400);
			expect(res.json).toHaveBeenCalledWith({
				status: 400,
				message: "No fields to update",
			});
		});

		it("should return 400 if userName contains blacklisted words", async () => {
			req.body = { userName: "UserWithBadword" };
			await handler(req, res);
			expect(res.status).toHaveBeenCalledWith(400);
			expect(res.json).toHaveBeenCalledWith({
				status: 400,
				message: "Username contains inappropriate words",
			});
		});

		it("should return 400 if userName contains blacklisted words (case-insensitive)", async () => {
			req.body = { userName: "UserWithBADWORD" }; // Test case-insensitivity
			await handler(req, res);
			expect(res.status).toHaveBeenCalledWith(400);
			expect(res.json).toHaveBeenCalledWith({
				status: 400,
				message: "Username contains inappropriate words",
			});
		});

		it("should sanitize inputs before updating", async () => {
			req.body = { userName: "User<script>alert('xss')</script>Name" };
			// Correct sanitizedUserName based on sanitizeInput: input.replace(/[<>'"`;]/g, "")
			const sanitizedUserName = "Userscriptalert(xss)/scriptName";

			prisma.user.update.mockResolvedValueOnce({
				...mockUser,
				userName: sanitizedUserName,
			});

			await handler(req, res);
			expect(prisma.user.update).toHaveBeenCalledWith(
				expect.objectContaining({
					data: expect.objectContaining({ userName: sanitizedUserName }),
				})
			);
			expect(res.json).toHaveBeenCalledWith(
				expect.objectContaining({
					body: expect.objectContaining({ userName: sanitizedUserName }),
				})
			);
		});

		it("should sanitize firstName and lastName inputs", async () => {
			req.body = {
				firstName: "First<Name>",
				lastName: "Last;Name",
			};
			// Based on sanitizeInput: input.replace(/[<>'"`;]/g, "")
			const sanitizedFirstName = "FirstName";
			const sanitizedLastName = "LastName";

			prisma.user.update.mockResolvedValueOnce({
				...mockUser,
				firstName: sanitizedFirstName,
				lastName: sanitizedLastName,
			});

			await handler(req, res);

			expect(prisma.user.update).toHaveBeenCalledWith(
				expect.objectContaining({
					data: {
						// Only fields present in req.body should be in data after sanitization
						userName: undefined, // Not in req.body for this test
						firstName: sanitizedFirstName,
						lastName: sanitizedLastName,
					},
				})
			);
			expect(res.json).toHaveBeenCalledWith(
				expect.objectContaining({
					body: expect.objectContaining({
						firstName: sanitizedFirstName,
						lastName: sanitizedLastName,
					}),
				})
			);
		});

		it("should handle only partial updates (e.g., only firstName)", async () => {
			req.body = { firstName: "OnlyFirstUpdated" };
			prisma.user.update.mockResolvedValueOnce({
				...mockUser, // Base
				firstName: "OnlyFirstUpdated", // Updated field
				userName: mockUser.userName, // userName should remain unchanged from mockUser
			});

			await handler(req, res);
			expect(prisma.user.update).toHaveBeenCalledWith({
				where: { id: mockUser.id },
				data: {
					userName: undefined, // Because it's not in req.body for this test
					firstName: "OnlyFirstUpdated", // Sanitized version
					lastName: undefined, // Because it's not in req.body for this test
				},
			});
			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith(
				expect.objectContaining({
					body: expect.objectContaining({
						firstName: "OnlyFirstUpdated",
						userName: mockUser.userName, // Ensure original userName is returned if not updated
					}),
				})
			);
		});

		it("should return 500 if JWT verification fails during update", async () => {
			jwt.verify.mockImplementation(() => {
				throw new Error("JWT verification failed");
			});
			await handler(req, res);
			expect(res.status).toHaveBeenCalledWith(500);
			expect(res.json).toHaveBeenCalledWith({
				status: 500,
				message: "Internal Server Error",
			});
			expect(consoleErrorSpy).toHaveBeenCalledWith(
				"Profile update error:",
				expect.any(Error)
			);
		});

		it("should return 500 if getUserCSRFToken throws an error", async () => {
			getUserCSRFToken.mockRejectedValue(new Error("CSRF storage error"));
			req.body = { userName: "anyUser" }; // Ensure body is not empty to pass initial checks

			await handler(req, res);

			expect(res.status).toHaveBeenCalledWith(500);
			expect(res.json).toHaveBeenCalledWith({
				status: 500,
				message: "Internal Server Error",
			});
			expect(consoleErrorSpy).toHaveBeenCalledWith(
				"Profile update error:",
				expect.objectContaining({ message: "CSRF storage error" })
			);
		});

		it("should return 500 if database update fails", async () => {
			prisma.user.update.mockRejectedValue(new Error("DB update error"));
			await handler(req, res);
			expect(res.status).toHaveBeenCalledWith(500);
			expect(res.json).toHaveBeenCalledWith({
				status: 500,
				message: "Internal Server Error",
			});
			expect(consoleErrorSpy).toHaveBeenCalledWith(
				"Profile update error:",
				expect.any(Error)
			);
		});

		it("should return 500 if non-string input for a field causes Prisma error", async () => {
			// This test assumes that Prisma itself would throw an error if a field
			// that's supposed to be a string receives a number, and that your sanitizeInput
			// function might pass non-strings through if they are not explicitly handled.
			req.body = { userName: 12345 }; // Non-string input

			// Mock Prisma to simulate a type error or validation error from the database/ORM
			prisma.user.update.mockRejectedValue(
				new Error("Prisma validation error: userName must be a string")
			);

			await handler(req, res);

			expect(res.status).toHaveBeenCalledWith(500);
			expect(res.json).toHaveBeenCalledWith({
				status: 500,
				message: "Internal Server Error",
			});
			expect(consoleErrorSpy).toHaveBeenCalledWith(
				"Profile update error:",
				expect.objectContaining({
					message: "Prisma validation error: userName must be a string",
				})
			);
		});
	});

	describe("Unsupported methods", () => {
		it("should return 405 for unsupported methods like POST", async () => {
			req.method = "POST";
			await handler(req, res);
			expect(res.status).toHaveBeenCalledWith(405);
			expect(res.json).toHaveBeenCalledWith({
				status: 405,
				message: "Method Not Allowed",
			});
		});

		it("should return 405 for unsupported methods like DELETE", async () => {
			req.method = "DELETE";
			await handler(req, res);
			expect(res.status).toHaveBeenCalledWith(405);
			expect(res.json).toHaveBeenCalledWith({
				status: 405,
				message: "Method Not Allowed",
			});
		});
	});
});
