/** @format */

import { z } from "zod";

// Définition du schéma Zod pour valider les données
const loginSchema = z.object({
	email: z.string().email("Invalid email format"),
	password: z.string().min(8, "Password must be at least 8 characters"),
});

type LoginCredentials = z.infer<typeof loginSchema>;

export const loginUser = async (credentials: LoginCredentials) => {
	// Validation des données avec Zod
	const parsedCredentials = loginSchema.safeParse(credentials);
	if (!parsedCredentials.success) {
		// Si la validation échoue, une erreur est lancée
		throw new Error(parsedCredentials.error.message);
	}

	const requestOptions: RequestInit = {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			email: credentials.email,
			password: credentials.password,
		}),
		redirect: "follow",
	};

	try {
		const response = await fetch(
			"http://localhost:3001/api/v1/user/login",
			requestOptions
		);

		if (!response.ok) {
			const data = await response.json();
			throw new Error(`Login failed: ${response.status} - ${data.message}`);
		}

		const data = await response.json();
		return data; // Token et autres données reçues
	} catch (error) {
		console.error("Error during login:", error);
		throw error;
	}
};
