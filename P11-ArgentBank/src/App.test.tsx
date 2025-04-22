/** @format */

import { describe, test, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import userReducer, { UsersState, User } from "./store/slices/usersSlice";
import App from "./App";

// Définir RootState
interface RootState {
	users: UsersState;
}

// Store mock avec le state correct
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
								balance: "$2,082.79", // string
								balanceType: "Available Balance",
							},
						],
					}
				: null,
			users: [] as User[], // Type explicite pour éviter never[]
		},
	};

	return configureStore({
		reducer: {
			users: userReducer,
		},
		preloadedState,
	});
};

describe("App", () => {
	let store: ReturnType<typeof createTestStore>;

	beforeEach(() => {
		store = createTestStore();
	});

	test("affiche la page Home par défaut", async () => {
		render(
			<Provider store={store}>
				<App />
			</Provider>
		);

		expect(await screen.findByText(/No fees./i)).toBeInTheDocument();
	});

	test("affiche le Header sur toutes les pages", () => {
		render(
			<Provider store={store}>
				<App />
			</Provider>
		);

		expect(screen.getByRole("banner")).toBeInTheDocument();
	});

	test("affiche le Footer sur toutes les pages", () => {
		render(
			<Provider store={store}>
				<App />
			</Provider>
		);

		expect(screen.getByRole("contentinfo")).toBeInTheDocument();
	});

	test("redirige vers Error404 pour une route invalide", async () => {
		window.history.pushState({}, "", "/invalid");

		render(
			<Provider store={store}>
				<App />
			</Provider>
		);

		expect(await screen.findByText(/404/i)).toBeInTheDocument();
	});

	test("protège la route /user sans authentification", async () => {
		const unauthenticatedStore = createTestStore(false);

		window.history.pushState({}, "", "/user");

		render(
			<Provider store={unauthenticatedStore}>
				<App />
			</Provider>
		);

		expect(await screen.findByText(/Sign In/i)).toBeInTheDocument();
	});
});
