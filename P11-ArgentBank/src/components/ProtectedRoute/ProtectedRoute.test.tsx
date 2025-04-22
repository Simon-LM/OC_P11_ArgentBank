/** @format */

import { describe, test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import userReducer from "../../store/slices/usersSlice";

// Helper pour créer un store avec un état spécifique
const createMockStore = (isAuthenticated: boolean) => {
	return configureStore({
		reducer: {
			users: userReducer,
		},
		preloadedState: {
			users: {
				isAuthenticated,
				currentUser: null,
				users: [],
			},
		},
	});
};

describe("ProtectedRoute", () => {
	test("rend le composant enfant quand l'utilisateur est authentifié", () => {
		const store = createMockStore(true);

		render(
			<Provider store={store}>
				<MemoryRouter>
					<ProtectedRoute>
						<div data-testid="protected-content">Contenu Protégé</div>
					</ProtectedRoute>
				</MemoryRouter>
			</Provider>
		);

		expect(screen.getByTestId("protected-content")).toBeInTheDocument();
	});

	test("redirige vers /signin quand l'utilisateur n'est pas authentifié", () => {
		const store = createMockStore(false);

		const { container } = render(
			<Provider store={store}>
				<MemoryRouter>
					<ProtectedRoute>
						<div data-testid="protected-content">Contenu Protégé</div>
					</ProtectedRoute>
				</MemoryRouter>
			</Provider>
		);

		expect(container.innerHTML).toBe("");
	});
});
