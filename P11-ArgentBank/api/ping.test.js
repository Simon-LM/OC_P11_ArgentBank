/** @format */

import { describe, it, expect, vi, beforeEach } from "vitest";
import handler from "./ping.js";

vi.mock("./lib/prisma.js", () => {
	return {
		prisma: {
			$connect: vi.fn(),
		},
	};
});

import { prisma } from "./lib/prisma.js";

describe("Ping API Handler", () => {
	let req;
	let res;

	beforeEach(() => {
		vi.resetAllMocks();

		req = {};
		res = {
			status: vi.fn().mockReturnThis(),
			json: vi.fn(),
		};
	});

	it("should return success response when database connection works", async () => {
		prisma.$connect.mockResolvedValue(undefined);

		await handler(req, res);

		expect(prisma.$connect).toHaveBeenCalledTimes(1);
		expect(res.json).toHaveBeenCalledWith({ pong: true, db: "OK" });
		expect(res.status).not.toHaveBeenCalled();
	});

	it("should return error response when database connection fails", async () => {
		const dbError = new Error("Database connection failed");
		prisma.$connect.mockRejectedValue(dbError);

		const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

		await handler(req, res);

		expect(prisma.$connect).toHaveBeenCalledTimes(1);
		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.json).toHaveBeenCalledWith({
			pong: false,
			error: "Database connection failed",
		});
		expect(consoleSpy).toHaveBeenCalledWith("DB connect error:", dbError);
		consoleSpy.mockRestore();
	});
});
