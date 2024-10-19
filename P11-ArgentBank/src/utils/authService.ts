/** @format */

import { z } from "zod";

// Schéma pour la réponse de l'API de connexion (login)
const loginResponseSchema = z.object({
	status: z.number(),
	message: z.string(),
	body: z.object({
		token: z.string(), // Token reçu après connexion réussie
	}),
});

// Schéma pour la réponse de l'API de profil utilisateur (User Profile)
const profileResponseSchema = z.object({
	status: z.number(),
	message: z.string(),
	body: z.object({
		id: z.string(),
		email: z.string(),
		userName: z.string().optional(), // Facultatif si non renvoyé dans tous les cas
	}),
});

// Schéma pour les données de connexion (credentials)
const loginSchema = z.object({
	email: z.string().email("Invalid email format"),
	password: z.string().min(8, "Password must be at least 8 characters"),
});
export { loginSchema };

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

		// Vérifier que la réponse est au format JSON
		const data = await response.json();

		// Validation de la réponse API avec Zod
		const parsedResponse = loginResponseSchema.safeParse(data);
		if (!parsedResponse.success) {
			throw new Error(JSON.stringify(parsedResponse.error.issues, null, 2));
		}
		// Retourner le token si tout est valide
		return parsedResponse.data.body.token;
	} catch (error) {
		console.error("Error during login:", error);
		throw error;
	}
};
// Fonction pour récupérer le profil utilisateur après connexion
export const fetchUserProfile = async (token: string) => {
	try {
		const response = await fetch("/user/profile", {
			method: "GET",
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		const data = await response.json();

		// Validation de la réponse API avec Zod
		const parsedResponse = profileResponseSchema.safeParse(data);
		if (!parsedResponse.success) {
			throw new Error(JSON.stringify(parsedResponse.error.issues, null, 2));
		}

		// Retourne les données validées (profil utilisateur)
		return parsedResponse.data.body;
	} catch (error) {
		console.error("Error fetching user profile:", error);
		throw error;
	}
};
