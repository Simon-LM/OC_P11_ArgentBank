/** @format */

import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { BrowserRouter } from "react-router-dom";
import Header from "./Header";
import userReducer, {
	logoutUser,
	UsersState,
} from "../../pages/user/usersSlice";

// Définition de l'interface RootState basée sur le store réel
interface RootState {
	users: UsersState;
}

// Mock de useNavigate
const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
	const actual =
		await vi.importActual<typeof import("react-router-dom")>(
			"react-router-dom"
		);
	return {
		...actual,
		useNavigate: () => mockNavigate,
	};
});

// Création du store mock
const createTestStore = (isAuthenticated = false) => {
	const preloadedState: RootState = {
		users: {
			isAuthenticated,
			currentUser: isAuthenticated
				? {
						id: "123",
						userName: "Tony",
						firstName: "Tony",
						lastName: "Stark",
						email: "tony@stark.com",
						createdAt: new Date().toISOString(),
						updatedAt: new Date().toISOString(),
						accounts: [
							{
								accountName: "Argent Bank Checking",
								accountNumber: "x8349",
								balance: "$2,082.79",
								balanceType: "Available Balance",
							},
						],
					}
				: null,
			users: [],
		},
	};

	return configureStore({
		reducer: {
			users: userReducer,
		},
		preloadedState,
	});
};

describe("Header", () => {
	let store: ReturnType<typeof createTestStore>;
	let spyDispatch: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		vi.clearAllMocks();
		store = createTestStore(true); // Authentifié par défaut
		spyDispatch = vi.spyOn(store, "dispatch");
	});

	test("affiche le lien 'Sign In' lorsque l'utilisateur n'est pas authentifié", () => {
		store = createTestStore(false);

		render(
			<Provider store={store}>
				<BrowserRouter>
					<Header />
				</BrowserRouter>
			</Provider>
		);

		expect(screen.getByText(/Sign In/i)).toBeInTheDocument();
		expect(screen.queryByText(/Sign Out/i)).not.toBeInTheDocument();
		expect(screen.queryByText(/Tony/i)).not.toBeInTheDocument();
	});

	test("affiche le nom d'utilisateur et le lien 'Sign Out' lorsque l'utilisateur est authentifié", () => {
		render(
			<Provider store={store}>
				<BrowserRouter>
					<Header />
				</BrowserRouter>
			</Provider>
		);

		expect(screen.getByText(/Tony/i)).toBeInTheDocument();
		expect(screen.getByText(/Sign Out/i)).toBeInTheDocument();
		expect(screen.queryByText(/Sign In/i)).not.toBeInTheDocument();
	});

	test("dispatch logoutUser et navigue vers '/signin' lors du clic sur 'Sign Out'", () => {
		render(
			<Provider store={store}>
				<BrowserRouter>
					<Header />
				</BrowserRouter>
			</Provider>
		);

		const signOutLink = screen.getByText(/Sign Out/i);
		fireEvent.click(signOutLink);

		// Vérifier que logoutUser a été dispatché
		expect(spyDispatch).toHaveBeenCalledWith(logoutUser());

		// Vérifier que navigate a été appelé avec '/signin'
		expect(mockNavigate).toHaveBeenCalledWith("/signin");
	});

	test("redirige vers '/signin' après déconnexion", () => {
		render(
			<Provider store={store}>
				<BrowserRouter>
					<Header />
				</BrowserRouter>
			</Provider>
		);

		const signOutLink = screen.getByText(/Sign Out/i);
		fireEvent.click(signOutLink);

		// Vérifiez que navigate a été appelé avec '/signin'
		expect(mockNavigate).toHaveBeenCalledWith("/signin");
	});
});
