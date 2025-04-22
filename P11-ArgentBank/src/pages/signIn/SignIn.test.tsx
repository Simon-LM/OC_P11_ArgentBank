/** @format */

// import { loginUserSuccess, logoutUser } from "../user/usersSlice";
// import { test, expect, describe, beforeEach } from "vitest"; // Import describe from Vitest
// import { configureStore } from "@reduxjs/toolkit"; // Import Redux toolkit
// import userReducer from "../user/usersSlice"; // Import userReducer
// import { usersMockData } from "../../mockData/users"; // Import mock data
// import { RootState } from "../../store/Store";

// // Mock de sessionStorage
// const sessionStorageMock = (() => {
// 	let store: { [key: string]: string } = {};

// 	return {
// 		getItem(key: string) {
// 			return store[key] || null;
// 		},
// 		setItem(key: string, value: string) {
// 			store[key] = value.toString();
// 		},
// 		removeItem(key: string) {
// 			delete store[key];
// 		},
// 		clear() {
// 			store = {};
// 		},
// 	};
// })();

// // Définir le mock de sessionStorage dans l'objet global
// Object.defineProperty(window, "sessionStorage", {
// 	value: sessionStorageMock,
// 	writable: true,
// });

// describe("usersSlice Tests with Mock Data", () => {
// 	let store: ReturnType<typeof configureStore>;

// 	beforeEach(() => {
// 		// Réinitialiser sessionStorage avant chaque test
// 		window.sessionStorage.clear();

// 		// Configurer un nouveau store avant chaque test
// 		store = configureStore({
// 			reducer: {
// 				users: userReducer,
// 			},
// 			preloadedState: {
// 				users: {
// 					users: usersMockData,
// 					isAuthenticated: false,
// 					currentUser: null,
// 				} as RootState["users"],
// 			},
// 		});
// 	});

// 	// Test for importing loginUserSuccess from usersSlice
// 	test("should import loginUserSuccess from '../user/usersSlice'", () => {
// 		expect(loginUserSuccess).toBeDefined();
// 	});

// 	// Test for initial state of the user slice
// 	test("should have correct initial state", () => {
// 		const store = configureStore({
// 			reducer: {
// 				users: userReducer,
// 			},
// 			preloadedState: {
// 				users: {
// 					users: usersMockData,
// 					isAuthenticated: false,
// 					currentUser: null,
// 				},
// 			},
// 		});

// 		const state = store.getState();
// 		expect(state.users.currentUser).toBeNull(); // Vérifie que l'état initial est bien null
// 		expect(state.users.isAuthenticated).toBe(false);
// 		expect(window.sessionStorage.getItem("authToken")).toBeNull(); // Utiliser sessionStorage
// 	});

// 	// Test for dispatching loginUserSuccess
// 	test("should dispatch loginUserSuccess and update the user state and sessionStorage", () => {
// 		const store = configureStore({
// 			reducer: {
// 				users: userReducer,
// 			},
// 			preloadedState: {
// 				users: {
// 					users: usersMockData,
// 					isAuthenticated: false,
// 					currentUser: null,
// 				},
// 			},
// 		});

// 		// Données simulées de l'utilisateur
// 		const userLoginPayload = { email: "test@example.com", token: "dummyToken" };

// 		// Dispatcher l'action loginUserSuccess
// 		store.dispatch(loginUserSuccess(userLoginPayload));

// 		// Vérifier l'état dans le store
// 		const state = store.getState();
// 		expect(state.users.isAuthenticated).toBe(true);

// 		// Vérifier que le token est bien stocké dans sessionStorage
// 		expect(window.sessionStorage.getItem("authToken")).toBe("dummyToken");
// 	});

// 	// Test pour dispatcher logoutUser
// 	test("should logout user and clear state and sessionStorage", () => {
// 		const store = configureStore({
// 			reducer: {
// 				users: userReducer,
// 			},
// 			preloadedState: {
// 				users: {
// 					users: usersMockData,
// 					isAuthenticated: false,
// 					currentUser: null,
// 				},
// 			},
// 		});

// 		// Simuler l'état initial avec un utilisateur connecté
// 		store.dispatch(
// 			loginUserSuccess({ email: "test@example.com", token: "dummyToken" })
// 		);

// 		// Vérifier que le token est stocké
// 		expect(window.sessionStorage.getItem("authToken")).toBe("dummyToken");
// 		// Vérifier l'état authentifié
// 		expect(store.getState().users.isAuthenticated).toBe(true);

// 		// Déconnecter l'utilisateur
// 		store.dispatch(logoutUser());

// 		// Vérifier l'état dans le store
// 		const state = store.getState();
// 		expect(state.users.currentUser).toBeNull();
// 		expect(state.users.isAuthenticated).toBe(false);

// 		// Vérifier que le token est supprimé de sessionStorage
// 		expect(window.sessionStorage.getItem("authToken")).toBeNull();
// 	});

// 	test("should not update state if user is not found, but isAuthenticated should be true", () => {
// 		const store = configureStore({
// 			reducer: {
// 				users: userReducer,
// 			},
// 			preloadedState: {
// 				users: {
// 					users: usersMockData,
// 					isAuthenticated: false,
// 					currentUser: null,
// 				},
// 			},
// 		});

// 		const userData = {
// 			email: "unknown@user.com",
// 			token: "dummyToken",
// 		};

// 		store.dispatch(loginUserSuccess(userData));

// 		const state = store.getState();

// 		expect(state.users.currentUser).toBeNull();
// 		expect(state.users.isAuthenticated).toBe(true);
// 	});
// });

import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import SignIn from "./SignIn";
import { configureStore } from "@reduxjs/toolkit";
import userReducer from "../../store/slices/usersSlice";
import * as authService from "../../utils/authService";
import type { NavigateFunction } from "react-router-dom";

const mockNavigate = vi.fn() as NavigateFunction;

vi.mock("react-router-dom", async (importOriginal) => {
	const actual = await importOriginal<typeof import("react-router-dom")>();
	return {
		...actual,
		useNavigate: () => mockNavigate,
	};
});

vi.mock("../../utils/authService", () => ({
	loginUser: vi.fn(),
	fetchUserProfile: vi.fn(),
}));

const renderSignIn = () => {
	const store = configureStore({
		reducer: {
			users: userReducer,
		},
	});

	return render(
		<Provider store={store}>
			<MemoryRouter>
				<SignIn />
			</MemoryRouter>
		</Provider>
	);
};

describe("SignIn Component", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	test("gère la soumission du formulaire avec succès", async () => {
		const mockToken = "fake-token";
		const mockUserProfile = {
			id: "1",
			email: "test@example.com",
			firstName: "Test",
			lastName: "User",
			userName: "testuser",
			createdAt: "2024-03-14T12:00:00.000Z",
			updatedAt: "2024-03-14T12:00:00.000Z",
			accounts: [
				{
					accountName: "Argent Bank Checking",
					accountNumber: "x8349",
					balance: "$2,082.79",
					balanceType: "Available Balance",
				},
			],
		};

		vi.mocked(authService.loginUser).mockResolvedValue(mockToken);
		vi.mocked(authService.fetchUserProfile).mockResolvedValue(mockUserProfile);

		renderSignIn();

		fireEvent.change(screen.getByLabelText(/username/i), {
			target: { value: "test@example.com" },
		});
		fireEvent.change(screen.getByLabelText(/password/i), {
			target: { value: "password123" },
		});

		fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

		await waitFor(() => {
			expect(authService.loginUser).toHaveBeenCalledWith({
				email: "test@example.com",
				password: "password123",
			});
			expect(mockNavigate).toHaveBeenCalledWith("/User");
		});
	});

	test("gère les erreurs de connexion", async () => {
		vi.mocked(authService.loginUser).mockRejectedValue(
			new Error("Invalid credentials")
		);

		renderSignIn();

		fireEvent.change(screen.getByLabelText(/username/i), {
			target: { value: "test@example.com" },
		});
		fireEvent.change(screen.getByLabelText(/password/i), {
			target: { value: "wrongpassword" },
		});

		fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

		await waitFor(() => {
			expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
		});
	});

	test("gère la case remember me", () => {
		renderSignIn();

		const checkbox = screen.getByLabelText(/remember me/i);
		fireEvent.click(checkbox);
		expect(checkbox).toBeChecked();
	});
});
