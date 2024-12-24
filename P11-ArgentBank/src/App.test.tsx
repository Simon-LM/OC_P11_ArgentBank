/** @format */

import { describe, test, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./pages/user/usersSlice";
import { usersMockData } from "./mockData/users";
import store from "./store/Store";

import App from "./App";

// Mock du store avec un état authentifié
const createMockStore = (isAuthenticated = false) => {
	return configureStore({
		reducer: {
			users: userReducer,
		},
		preloadedState: {
			users: {
				isAuthenticated,
				currentUser: isAuthenticated
					? {
							id: "66e6fc6d339057ebf4c97019",
							firstName: "Tony",
							lastName: "Stark",
							userName: "Iron",
							email: "tony@stark.com",
							createdAt: "2024-09-15T15:25:33.373Z",
							updatedAt: "2024-09-15T15:25:33.373Z",
							accounts: [
								{
									accountName: "Argent Bank Checking",
									accountNumber: "8949",
									balance: "$5,600.55",
									balanceType: "Available Balance",
								},
								{
									accountName: "Argent Bank Savings",
									accountNumber: "2094",
									balance: "$12,450.22",
									balanceType: "Available Balance",
								},
							],
						}
					: null,
				users: usersMockData,
			},
		},
	});
};

describe("App component", () => {
	// Test 1 : vérifier si la page Home est bien rendue par défaut
	test("renders Home page by default", () => {
		render(
			<Provider store={store}>
				<App />
			</Provider>
		);

		// Vérifiez qu'un texte unique à la page Home est présent
		expect(
			screen.getByText(/Open a savings account with Argent Bank today!/i)
		).toBeInTheDocument();
	});

	// Test 2 : vérifier la navigation vers la page SignIn
	test("renders SignIn page when navigating to /SignIn", () => {
		window.history.pushState({}, "SignIn page", "/SignIn");
		render(
			<Provider store={store}>
				<App />
			</Provider>
		);

		// Vérifiez qu'un texte unique à la page SignIn est présent
		expect(screen.getByLabelText(/Username/i)).toBeInTheDocument();
	});

	// Test 3 : vérifier la navigation vers la page User
	test("renders User page when navigating to /User", () => {
		// Configurer le store avec un utilisateur authentifié
		const authenticatedStore = createMockStore(true);

		// Simuler la navigation vers /User
		window.history.pushState({}, "User page", "/User");

		render(
			<Provider store={authenticatedStore}>
				<App />
			</Provider>
		);

		// Vérifier que le composant User est rendu
		expect(screen.getByText(/Welcome/i)).toBeInTheDocument();
	});

	// Test 4 : tester la redirection vers Error404 pour les routes non valides
	test("redirects to Error404 for invalid routes", () => {
		window.history.pushState({}, "Invalid route", "/invalid-route");
		render(
			<Provider store={store}>
				<App />
			</Provider>
		);

		// Vérifiez que la page 404 est bien rendue
		expect(
			screen.getByText(/Oops, the page you are requesting does not exist./i)
		).toBeInTheDocument();
	});

	// Test 5 : vérifier que le Header et le Footer sont toujours présents
	test("renders Header and Footer on all routes", () => {
		render(
			<Provider store={store}>
				<App />
			</Provider>
		);

		// Vérifiez que le Header et le Footer sont bien rendus
		expect(screen.getByRole("banner")).toBeInTheDocument(); // Header
		expect(screen.getByRole("contentinfo")).toBeInTheDocument(); // Footer
	});
});
