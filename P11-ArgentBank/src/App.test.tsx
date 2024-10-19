/** @format */

import { describe, test, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import store from "./store/Store"; // Importez votre store Redux
import App from "./App";

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
		window.history.pushState({}, "User page", "/User");
		render(
			<Provider store={store}>
				<App />
			</Provider>
		);

		// Vérifiez qu'un texte unique à la page User est présent
		expect(screen.getByText(/Loading user data.../i)).toBeInTheDocument();
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

	// Test 6 : tester le bouton d'incrémentation du compteur
	test("increments count when button is clicked", () => {
		render(
			<Provider store={store}>
				<App />
			</Provider>
		);

		// Vérifiez que le compteur commence à 0
		expect(screen.getByText(/count is 0/i)).toBeInTheDocument();

		// Simulez un clic sur le bouton
		fireEvent.click(screen.getByRole("button", { name: /count is/i }));

		// Vérifiez que le compteur est incrémenté
		expect(screen.getByText(/count is 1/i)).toBeInTheDocument();
	});
});
