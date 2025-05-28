/** @format */

/**
 * Tests d'intégration pour la page User
 *
 * Ces tests couvrent les interactions complexes entre composants,
 * les appels API, et les workflows complets utilisateur.
 */

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import User from "./User";
import usersReducer, { UsersState } from "../../store/slices/usersSlice";
import * as authService from "../../utils/authService";
import { describe, test, expect, vi } from "vitest";

vi.mock("../../utils/authService");
vi.mock("../../hooks/useMatomo/useMatomo", () => ({
	useMatomo: () => ({
		trackEvent: vi.fn(),
		trackPageView: vi.fn(),
	}),
	isMatomoLoaded: () => false,
}));

const mockUser = {
	id: "1",
	firstName: "Tony",
	lastName: "Stark",
	userName: "ironman",
	email: "tony@stark.com",
	createdAt: "2024-01-01",
	updatedAt: "2024-01-01",
	accounts: [
		{
			accountName: "Argent Bank Checking",
			accountNumber: "x8349",
			balance: "$2,082.79",
			balanceType: "Available Balance",
		},
	],
};

describe("User Component - Tests d'intégration", () => {
	const renderUser = (customState: Partial<UsersState> = {}) => {
		// Set token in sessionStorage
		sessionStorage.setItem("authToken", "fake-token");

		// Create a complete initial state with all required properties
		const initialState: UsersState = {
			currentUser: mockUser,
			isAuthenticated: true,
			accounts: [
				{
					id: "123",
					accountNumber: "8349",
					balance: 2082.79,
					type: "checking",
					userId: "1",
					createdAt: "2023-01-01",
					updatedAt: "2023-01-01",
				},
			],
			accountsStatus: "succeeded",
			accountsError: null,
			selectedAccountId: null,
			transactions: [],
			transactionsStatus: "succeeded",
			transactionsError: null,
			searchResults: [],
			searchStatus: "succeeded",
			searchError: null,
			pagination: {
				total: 0,
				page: 1,
				limit: 10,
				pages: 0,
			},
			currentSortBy: "date",
			currentSortOrder: "desc",
			...customState,
		};

		const store = configureStore({
			reducer: { users: usersReducer },
			preloadedState: {
				users: initialState,
			},
		});

		return render(
			<Provider store={store}>
				<User />
			</Provider>
		);
	};

	test("handles profile editing", async () => {
		const newUsername = "newuser123";

		vi.mocked(authService.updateUserProfile).mockResolvedValue({
			...mockUser,
			userName: newUsername,
		});

		renderUser();

		fireEvent.click(screen.getByText(/edit user/i));

		const userNameInput = screen.getByRole("textbox", { name: /user name/i });
		fireEvent.change(userNameInput, { target: { value: newUsername } });

		fireEvent.submit(screen.getByRole("form"));

		await waitFor(
			() => {
				expect(authService.updateUserProfile).toHaveBeenCalledWith(
					newUsername,
					"fake-token"
				);
			},
			{ timeout: 3000 }
		);
	});

	test("handles update errors", async () => {
		const error = new Error("Update failed");
		vi.mocked(authService.updateUserProfile).mockRejectedValue(error);

		const consoleSpy = vi.spyOn(console, "error");
		renderUser();

		fireEvent.click(screen.getByText(/edit user/i));
		fireEvent.submit(screen.getByRole("form"));

		await waitFor(() => {
			expect(consoleSpy).toHaveBeenCalledWith(
				"Failed to update user profile:",
				error
			);
		});
	});
});
