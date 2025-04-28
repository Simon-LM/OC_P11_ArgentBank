/** @format */

import { kv } from "@vercel/kv";

const WINDOW_SIZE = 60 * 60 * 1000;
const MAX_REQUESTS = 5;

export async function rateLimitMiddleware(req, res, next) {
	const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
	const key = `rate-limit:${ip}:profile-update`;

	try {
		const requests = (await kv.get(key)) || [];
		const now = Date.now();
		const windowRequests = requests.filter((time) => time > now - WINDOW_SIZE);

		if (windowRequests.length >= MAX_REQUESTS) {
			return res.status(429).json({
				status: 429,
				message: "Too many update requests. Please try again later.",
			});
		}

		windowRequests.push(now);
		await kv.set(key, windowRequests, { ex: 60 * 60 }); // expire in 1 hour

		next();
	} catch (error) {
		console.error("Rate limiting error:", error);
		next();
	}
}
