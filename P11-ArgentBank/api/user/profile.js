/** @format */

// import jwt from "jsonwebtoken";

// const users = [
// 	{
// 		id: "66e6fc6d339057ebf4c97019",
// 		email: "tony@stark.com",
// 		firstName: "Tony",
// 		lastName: "Stark",
// 		userName: "Iron",
// 		createdAt: "2024-09-15T15:25:33.373Z",
// 		updatedAt: "2025-01-11T18:57:21.884Z",
// 	},
// 	{
// 		id: "77f7fd7e440168ff05d8712a",
// 		email: "steve@rogers.com",
// 		firstName: "Steve",
// 		lastName: "Rogers",
// 		userName: "Captain",
// 		createdAt: "2024-09-15T15:30:00.000Z",
// 		updatedAt: "2025-01-11T18:57:21.884Z",
// 	},
// ];

// const JWT_SECRET = process.env.JWT_SECRET || "default_secret_key";

// export default function handler(req, res) {
// 	if (req.method === "GET") {
// 		const authHeader = req.headers.authorization;
// 		if (!authHeader || !authHeader.startsWith("Bearer ")) {
// 			return res.status(401).json({ status: 401, message: "Unauthorized" });
// 		}

// 		const token = authHeader.split(" ")[1];
// 		try {
// 			const decoded = jwt.verify(token, JWT_SECRET);

// 			const user = users.find((u) => u.id === decoded.id);
// 			if (!user) {
// 				return res.status(400).json({ status: 400, message: "User not found" });
// 			}

// 			return res.status(200).json({
// 				status: 200,
// 				message: "Successfully got user profile data",
// 				body: user,
// 			});
// 		} catch (error) {
// 			return res.status(401).json({ status: 401, message: "Invalid Token" });
// 		}
// 	} else {
// 		res.status(405).json({ status: 405, message: "Method Not Allowed" });
// 	}
// }

// // // // // // // // // // // // //

import jwt from "jsonwebtoken";

const users = [
	{
		id: "66e6fc6d339057ebf4c97019",
		email: "tony@stark.com",
		password: "password123",
		firstName: "Tony",
		lastName: "Stark",
		userName: "Iron",
		createdAt: "2024-09-15T15:25:33.373Z",
		updatedAt: "2025-01-11T18:57:21.884Z",
	},
	{
		id: "77f7fd7e440168ff05d8712a",
		email: "steve@rogers.com",
		password: "password456",
		firstName: "Steve",
		lastName: "Rogers",
		userName: "Captain",
		createdAt: "2024-09-15T15:30:00.000Z",
		updatedAt: "2025-01-11T18:57:21.884Z",
	},
];

const JWT_SECRET = process.env.VITE_JWT_SECRET || "default_secret_key";

export default function handler(req, res) {
	// GET /user/profile
	if (req.method === "GET") {
		const authHeader = req.headers.authorization;
		if (!authHeader || !authHeader.startsWith("Bearer ")) {
			return res.status(401).json({
				status: 401,
				message: "Unauthorized",
			});
		}

		const token = authHeader.split(" ")[1];
		try {
			const decoded = jwt.verify(token, JWT_SECRET);
			const user = users.find((u) => u.id === decoded.id);

			if (!user) {
				return res.status(404).json({
					status: 404,
					message: "User not found",
				});
			}

			// Format selon Swagger
			return res.status(200).json({
				status: 200,
				message: "User profile retrieved successfully",
				body: {
					id: user.id,
					email: user.email,
					userName: user.userName,
					firstName: user.firstName,
					lastName: user.lastName,
					createdAt: user.createdAt,
					updatedAt: user.updatedAt,
				},
			});
		} catch (error) {
			return res.status(500).json({
				status: 500,
				message: "Internal Server Error",
			});
		}
	}

	// PUT /user/profile
	if (req.method === "PUT") {
		const authHeader = req.headers.authorization;
		if (!authHeader || !authHeader.startsWith("Bearer ")) {
			return res.status(401).json({
				status: 401,
				message: "Unauthorized",
			});
		}

		const token = authHeader.split(" ")[1];
		try {
			const decoded = jwt.verify(token, JWT_SECRET);
			const { userName } = req.body;

			if (!userName) {
				return res.status(400).json({
					status: 400,
					message: "Invalid Fields",
				});
			}

			const userIndex = users.findIndex((u) => u.id === decoded.id);
			if (userIndex === -1) {
				return res.status(404).json({
					status: 404,
					message: "User not found",
				});
			}

			users[userIndex].userName = userName;
			users[userIndex].updatedAt = new Date().toISOString();

			return res.status(200).json({
				status: 200,
				message: "User profile updated successfully",
				body: {
					id: users[userIndex].id,
					email: users[userIndex].email,
					userName: users[userIndex].userName,
					createdAt: users[userIndex].createdAt,
					updatedAt: users[userIndex].updatedAt,
				},
			});
		} catch (error) {
			return res.status(500).json({
				status: 500,
				message: "Internal Server Error",
			});
		}
	}

	return res.status(405).json({
		status: 405,
		message: "Method Not Allowed",
	});
}
