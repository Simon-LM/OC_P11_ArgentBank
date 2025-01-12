/** @format */
import jwt from "jsonwebtoken";

const users = [
	{
		id: "66e6fc6d339057ebf4c97019",
		email: "tony@stark.com",
		password: "password123",
		firstName: "Tony",
		lastName: "Stark",
		userName: "Iron",
	},
	{
		id: "77f7fd7e440168ff05d8712a",
		email: "steve@rogers.com",
		password: "password456",
		firstName: "Steve",
		lastName: "Rogers",
		userName: "Captain",
	},
];

// const JWT_SECRET = process.env.JWT_SECRET || "default_secret_key";
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
	// Autoriser explicitement CORS
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
	// Gérer la requête OPTIONS pour CORS
	if (req.method === 'OPTIONS') {
	  return res.status(200).end();
	}
  
	// Vérifier si c'est une requête POST
	if (req.method !== 'POST') {
	  return res.status(405).json({
		status: 405,
		message: "Method Not Allowed - Only POST requests are accepted"
	  });
	}
  
	try {
	  const { email, password } = req.body;
	  console.log('Login attempt:', { email, password });
  
	  // Vérifier les credentials
	  const user = users.find(u => u.email === email && u.password === password);
	  
	  if (!user) {
		return res.status(400).json({
		  status: 400,
		  message: "Invalid credentials"
		});
	  }
  
	  // Générer le token
	  const token = "dev-token-" + user.id;
  
	  // Retourner la réponse
	  return res.status(200).json({
		status: 200,
		message: "Login successful",
		body: { token }
	  });
  
	} catch (error) {
	  console.error('Login error:', error);
	  return res.status(500).json({
		status: 500,
		message: "Internal server error",
		error: error.message
	  });
	}
  }