/** @format */

import { z } from "zod";
import { usersMockData } from "../mockData/users";
import { setAuthState, logoutUser } from "../pages/user/usersSlice";
import { AppDispatch } from "../store/Store";

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
		userName: z.string(),
		firstName: z.string(),
		lastName: z.string(),
		createdAt: z.string(),
		updatedAt: z.string(),
		accounts: z
			.array(
				z.object({
					accountName: z.string(),
					accountNumber: z.string(),
					balance: z.string(),
					balanceType: z.string(),
				})
			)
			.optional(),
	}),
});

// Schéma pour la réponse de mise à jour du profil utilisateur
const updateProfileResponseSchema = z.object({
	status: z.number(),
	message: z.string(),
	body: z.object({
		id: z.string(),
		email: z.string(),
		userName: z.string(),
		createdAt: z.string(),
		updatedAt: z.string(),
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

		const token = parsedResponse.data.body.token;

		// Définir la durée de session (ex: 1 heure)
		const expiresAt = new Date().getTime() + 5 * 60 * 1000; // 5 min en ms

		// Stocker le token et l'expiration dans sessionStorage
		sessionStorage.setItem("authToken", token);
		sessionStorage.setItem("expiresAt", expiresAt.toString());

		return token;
	} catch (error) {
		console.error("Error during login:", error);
		throw error;
	}
};
// Fonction pour récupérer le profil utilisateur après connexion
export const fetchUserProfile = async (token: string) => {
	try {
		const API_BASE_URL =
			import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api/v1";

		const response = await fetch(`${API_BASE_URL}/user/profile`, {
			method: "GET",
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		if (!response.ok) {
			const data = await response.json();
			throw new Error(
				`Fetch profile failed: ${response.status} - ${data.message}`
			);
		}

		const data = await response.json();

		// Validation de la réponse API avec Zod
		const parsedResponse = profileResponseSchema.safeParse(data);
		if (!parsedResponse.success) {
			throw new Error(JSON.stringify(parsedResponse.error.issues, null, 2));
		}

		const user = parsedResponse.data.body;

		// Injecter des comptes mock si 'accounts' est absent
		if (!user.accounts) {
			const mockUser = usersMockData.find(
				(u) => u.id === user.id || u.email === user.email
			);
			if (mockUser && mockUser.accounts) {
				user.accounts = mockUser.accounts;
			} else {
				user.accounts = []; // Ou toute valeur par défaut souhaitée
			}
		}

		// Injecter 'createdAt' et 'updatedAt' si Absents
		if (!user.createdAt || !user.updatedAt) {
			const mockUser = usersMockData.find(
				(u) => u.id === user.id || u.email === user.email
			);
			if (mockUser) {
				user.createdAt = mockUser.createdAt;
				user.updatedAt = mockUser.updatedAt;
			} else {
				user.createdAt = new Date().toISOString(); // Valeur par défaut
				user.updatedAt = new Date().toISOString(); // Valeur par défaut
			}
		}

		return user;
	} catch (error) {
		console.error("Error fetching user profile:", error);
		throw error;
	}
};

// Fonction pour mettre à jour le profil utilisateur
export const updateUserProfile = async (
	userName: string,
	token: string
): Promise<{ id: string; email: string; userName?: string }> => {
	const requestOptions: RequestInit = {
		method: "PUT",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${token}`,
		},
		body: JSON.stringify({ userName }),
	};

	try {
		const response = await fetch(
			"http://localhost:3001/api/v1/user/profile",
			requestOptions
		);

		if (!response.ok) {
			const data = await response.json();
			throw new Error(`Update failed: ${response.status} - ${data.message}`);
		}

		const data = await response.json();

		// Validation de la réponse API avec Zod
		const parsedResponse = updateProfileResponseSchema.safeParse(data);
		if (!parsedResponse.success) {
			throw new Error(JSON.stringify(parsedResponse.error.issues, null, 2));
		}

		return parsedResponse.data.body;
	} catch (error) {
		console.error("Error updating user profile:", error);
		throw error;
	}
};

// Fonction pour initialiser l'authentification au démarrage de l'app
export const initializeAuth = () => {
	return async (dispatch: AppDispatch) => {
		const token = sessionStorage.getItem("authToken");
		const expiresAt = sessionStorage.getItem("expiresAt");

		if (token && expiresAt) {
			const now = new Date().getTime();
			if (now > parseInt(expiresAt, 10)) {
				// Si le token a expiré, déconnecter l'utilisateur
				dispatch(logoutUser());
			} else {
				try {
					const userProfile = await fetchUserProfile(token);
					dispatch(setAuthState(userProfile));
				} catch (error) {
					console.error("Failed to initialize authentication:", error);
					dispatch(logoutUser());
				}
			}
		}
	};
};
