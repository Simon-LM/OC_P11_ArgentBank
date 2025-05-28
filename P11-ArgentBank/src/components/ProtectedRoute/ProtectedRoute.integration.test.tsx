/** @format */

/**
 * Tests d'intégration pour ProtectedRoute
 *
 * Scope d'intégration :
 * - Intégration Redux + React Router
 * - Logique de redirection d'authentification
 * - Interaction entre store d'état et navigation
 */

import { describe, test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import userReducer, { UsersState } from "../../store/slices/usersSlice";

type LoadingState = "idle" | "loading" | "succeeded" | "failed";

const createMockStore = (isAuthenticated: boolean) => {
	const initialState: UsersState = {
		isAuthenticated,
		currentUser: null,
		accounts: [],
		accountsStatus: "idle" as LoadingState,
		accountsError: null,
		selectedAccountId: null,
		transactions: [],
		transactionsStatus: "idle" as LoadingState,
		transactionsError: null,
		searchResults: [],
		searchStatus: "idle" as LoadingState,
		searchError: null,
		pagination: null,
		currentSortBy: "date",
		currentSortOrder: "desc",
	};

	return configureStore({
		reducer: {
			users: userReducer,
		},
		preloadedState: {
			users: initialState,
		},
	});
};

describe("ProtectedRoute - Integration Tests", () => {
	test("renders the child component when user is authenticated", () => {
		const store = createMockStore(true);

		render(
			<Provider store={store}>
				<MemoryRouter>
					<ProtectedRoute>
						<div data-testid="protected-content">Protected Content</div>
					</ProtectedRoute>
				</MemoryRouter>
			</Provider>
		);

		expect(screen.getByTestId("protected-content")).toBeInTheDocument();
	});

	test("redirects to /signin when user is not authenticated", () => {
		const store = createMockStore(false);

		const { container } = render(
			<Provider store={store}>
				<MemoryRouter>
					<ProtectedRoute>
						<div data-testid="protected-content">Protected Content</div>
					</ProtectedRoute>
				</MemoryRouter>
			</Provider>
		);

		expect(container.innerHTML).toBe("");
	});
});
