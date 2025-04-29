/** @format */

import { z } from "zod";
import { setAuthState, logoutUser } from "../store/slices/usersSlice";
import { AppDispatch } from "../store/Store";
import { usernameBlacklist } from "./blacklist";

// Schéma pour la réponse de l'API de connexion (login)
const loginResponseSchema = z.object({
	status: z.number(),
	message: z.string(),
	body: z.object({
		token: z.string(),
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
			"/api/user/login", // Modification uniquement de la route
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

		try {
			const userProfile = await fetchUserProfile(token);
			// Stocker les infos importantes en session
			sessionStorage.setItem("userId", userProfile.id);
			sessionStorage.setItem("currentUserName", userProfile.userName);
		} catch (error) {
			console.warn("Couldn't fetch user profile after login:", error);
			// Continue quand même, l'utilisateur est connecté
		}

		return parsedResponse.data;
	} catch (error) {
		console.error("Error during login:", error);
		throw error;
	}
};
// Fonction pour récupérer le profil utilisateur après connexion
export const fetchUserProfile = async (token: string) => {
	try {
		const response = await fetch("/api/user/profile", {
			// Modification de la route
			method: "GET",
			headers: { Authorization: `Bearer ${token}` },
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

		// Si accounts est absent, on initialise avec un tableau vide
		if (!user.accounts) {
			user.accounts = [];
		}

		// Si createdAt ou updatedAt sont absents, on les initialise
		if (!user.createdAt) {
			user.createdAt = new Date().toISOString();
		}
		if (!user.updatedAt) {
			user.updatedAt = new Date().toISOString();
		}

		return user;
	} catch (error) {
		console.error("Error fetching user profile:", error);
		throw error;
	}
};

export const generateCSRFToken = () => {
	const token = Math.random().toString(36).substring(2, 15);
	sessionStorage.setItem("csrfToken", token);
	return token;
};

export const validateUsername = (username: string): boolean => {
	const regex = new RegExp(usernameBlacklist.join("|"), "i");
	return !regex.test(username);
};

export const updateUserProfile = async (userName: string, token: string) => {
	try {
		if (!validateUsername(userName)) {
			throw new Error("Username contains inappropriate words or terms");
		}

		// Récupère ou génère un token CSRF
		const csrfToken =
			sessionStorage.getItem("csrfToken") || generateCSRFToken();

		const userId = sessionStorage.getItem("userId");
		if (!userId) {
			throw new Error("User ID not found in session");
		}

		await fetch("/api/csrf/store", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({
				userId,
				csrfToken,
			}),
		});

		const response = await fetch("/api/user/profile", {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
				"X-CSRF-Token": csrfToken, // Ajout du token CSRF
			},
			body: JSON.stringify({ userName }),
		});

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(`Failed to update profile: ${errorData.message}`);
		}

		sessionStorage.setItem("currentUserName", userName);

		const updatedProfile = await fetchUserProfile(token);
		return updatedProfile;
	} catch (error) {
		console.error("Error updating user profile:", error);
		throw error;
	}
};

export const initializeAuth = () => {
	return async (dispatch: AppDispatch) => {
		const token = sessionStorage.getItem("authToken");
		const expiresAt = sessionStorage.getItem("expiresAt");
		const storedUserName = sessionStorage.getItem("currentUserName");

		if (token && expiresAt) {
			const now = new Date().getTime();
			if (now > parseInt(expiresAt, 10)) {
				dispatch(logoutUser());
			} else {
				try {
					const userProfile = await fetchUserProfile(token);
					// Utiliser le userName stocké dans sessionStorage s'il existe
					if (storedUserName) {
						userProfile.userName = storedUserName;
					}
					dispatch(setAuthState(userProfile));
				} catch (error) {
					console.error("Failed to initialize authentication:", error);
					dispatch(logoutUser());
				}
			}
		}
	};
};
