/** @format */

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import User from "./User";
import usersReducer from "./usersSlice";
import * as authService from "../../utils/authService";
import { describe, test, expect, vi } from "vitest";

vi.mock("../../utils/authService");

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

describe("User Component", () => {
	const renderUser = (initialState = {}) => {
		// Configuration du store avec token
		sessionStorage.setItem("authToken", "fake-token");

		const store = configureStore({
			reducer: { users: usersReducer },
			preloadedState: {
				users: {
					currentUser: mockUser,
					isAuthenticated: true,
					users: [],
					...initialState,
				},
			},
		});

		return render(
			<Provider store={store}>
				<User />
			</Provider>
		);
	};

	test("affiche le message de chargement quand currentUser est null", () => {
		renderUser({ currentUser: null });
		expect(screen.getByText(/loading user data/i)).toBeInTheDocument();
	});

	test("affiche les informations de l'utilisateur", () => {
		renderUser();
		expect(screen.getByText(/tony stark/i)).toBeInTheDocument();
		expect(screen.getByText(/argent bank checking/i)).toBeInTheDocument();
	});

	test("gère l'édition du profil", async () => {
		vi.mocked(authService.updateUserProfile).mockResolvedValue({
			...mockUser,
			userName: "newUsername",
		});

		renderUser();

		fireEvent.click(screen.getByText(/edit name/i));

		// Remplir le formulaire
		const userNameInput = screen.getByLabelText(/user name/i);
		fireEvent.change(userNameInput, { target: { value: "newUsername" } });

		// Soumettre le formulaire
		fireEvent.submit(screen.getByRole("form"));

		await waitFor(() => {
			expect(authService.updateUserProfile).toHaveBeenCalledWith(
				"newUsername",
				"fake-token"
			);
		});
	});

	test("gère les erreurs de mise à jour", async () => {
		const error = new Error("Update failed");
		vi.mocked(authService.updateUserProfile).mockRejectedValue(error);

		const consoleSpy = vi.spyOn(console, "error");
		renderUser();

		fireEvent.click(screen.getByText(/edit name/i));
		fireEvent.submit(screen.getByRole("form"));

		await waitFor(() => {
			expect(consoleSpy).toHaveBeenCalledWith(
				"Failed to update user profile:",
				error
			);
		});
	});

	test("affiche un message quand aucun compte n'est disponible", () => {
		const userWithoutAccounts = { ...mockUser, accounts: [] };
		renderUser({ currentUser: userWithoutAccounts });

		expect(screen.getByText(/aucun compte disponible/i)).toBeInTheDocument();
	});
});
