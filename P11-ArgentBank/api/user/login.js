/** @format */
import jwt from "jsonwebtoken";
import { PrismaClient } from "../../src/generated/prisma/index.js";

// const users = [
// 	{
// 		id: "66e6fc6d339057ebf4c97019",
// 		email: "tony@stark.com",
// 		password: "password123",
// 		firstName: "Tony",
// 		lastName: "Stark",
// 		userName: "Iron",
// 	},
// 	{
// 		id: "77f7fd7e440168ff05d8712a",
// 		email: "steve@rogers.com",
// 		password: "password456",
// 		firstName: "Steve",
// 		lastName: "Rogers",
// 		userName: "Captain",
// 	},
// ];

// const JWT_SECRET = process.env.JWT_SECRET || "default_secret_key";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.VITE_JWT_SECRET || "default_secret_key";

// export default function handler(req, res) {

// 	console.log('Request method:', req.method);
// 	console.log('Request headers:', req.headers);
// 	console.log('Request body:', req.body);

// 	 // Gérer CORS preflight
// 	 if (req.method === 'OPTIONS') {
// 		return res.status(200).end();
// 	  }

// 	if (req.method === "POST") {
//     try {
//       const { email, password } = req.body;

//       if (!email || !password) {
//         return res.status(400).json({
//           status: 400,
//           message: "Email and password are required"
//         });
//       }

//       const user = users.find(
//         (u) => u.email === email && u.password === password
//       );

//       if (!user) {
//         return res.status(400).json({
//           status: 400,
//           message: "Invalid email or password"
//         });
//       }

//       const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "1h" });

//       return res.status(200).json({
//         status: 200,
//         message: "User successfully logged in",
//         body: { token }
//       });
//     } catch (error) {
//       console.error('Login error:', error);
//       return res.status(500).json({
//         status: 500,
//         message: "Internal server error"
//       });
//     }
//   }

//   return res.status(405).json({
//     status: 405,
//     message: "Method not allowed"
//   });

// if (req.method === "POST") {
// 	const { email, password } = req.body;

// 	const user = users.find(
// 		(u) => u.email === email && u.password === password
// 	);
// 	if (!user) {
// 		return res
// 			.status(400)
// 			.json({ status: 400, message: "Invalid email or password" });
// 	}

// 	// const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "1h" });
// 	const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "1h" });

// 	return res.status(200).json({
// 		status: 200,
// 		message: "User successfully logged in",
// 		body: { token },
// 	});
// } else {
// 	res.status(405).json({ status: 405, message: "Method Not Allowed" });
// }
// }

export default async function handler(req, res) {
	// Logs pour débogage
	console.log(req.body);
	console.log("Méthode:", req.method);
	console.log("Corps:", req.body);

	// Configuration CORS
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
	res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
	res.setHeader("Content-Type", "application/json");

	// Gestion preflight CORS
	if (req.method === "OPTIONS") {
		return res.status(200).end();
	}

	// Vérification méthode POST
	if (req.method !== "POST") {
		return res.status(405).json({
			status: 405,
			message: "Method Not Allowed",
		});
	}

	try {
		const { email, password } = req.body;

		// Validation des champs
		if (!email || !password) {
			return res.status(400).json({
				status: 400,
				message: "Email and password are required",
			});
		}

		//   // Recherche utilisateur
		//   const user = users.find(u =>
		// 	u.email === email && u.password === password
		//   );

		// Recherche de l'utilisateur dans la base PostgreSQL
		const user = await prisma.user.findUnique({
			where: { email },
		});

		if (!user) {
			return res.status(401).json({
				status: 401,
				message: "Invalid email or password",
			});
		}

		// Génération du token JWT
		const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "1h" });

		// Réponse succès
		return res.status(200).json({
			status: 200,
			message: "User successfully logged in",
			body: { token },
		});
	} catch (error) {
		console.error("Login error:", error);
		return res.status(500).json({
			status: 500,
			message: "Internal server error",
		});
	} finally {
		await prisma.$disconnect();
	}
}
