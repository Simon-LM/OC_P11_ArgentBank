/** @format */
/**
 * @fileoverview Tests d'intégration pour le composant SignIn
 *
 * Scope d'intégration testé :
 * - Soumission de formulaire avec validation
 * - Intégration API d'authentification (loginUser, fetchUserProfile)
 * - Navigation après login réussi
 * - Gestion des erreurs d'authentification
 * - Interaction Redux store
 */
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

// Mock for useMatomo
vi.mock("../../hooks/useMatomo/useMatomo", () => ({
	useMatomo: () => ({
		trackEvent: vi.fn(),
	}),
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

describe("SignIn Component - Integration Tests", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	test("handles form submission successfully", async () => {
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

		vi.mocked(authService.loginUser).mockResolvedValue({
			message: "Login successful",
			status: 200,
			body: { token: mockToken },
		});
		vi.mocked(authService.fetchUserProfile).mockResolvedValue(mockUserProfile);

		renderSignIn();

		fireEvent.change(screen.getByLabelText(/email/i), {
			target: { value: "test@example.com" },
		});
		fireEvent.change(screen.getByLabelText("Password", { selector: "input" }), {
			target: { value: "password123" },
		});

		fireEvent.click(screen.getByRole("button", { name: /connect/i }));

		await waitFor(() => {
			expect(authService.loginUser).toHaveBeenCalledWith({
				email: "test@example.com",
				password: "password123",
			});
			expect(mockNavigate).toHaveBeenCalledWith("/user");
		});
	});

	test("handles login errors", async () => {
		vi.mocked(authService.loginUser).mockRejectedValue(
			new Error("Invalid credentials")
		);

		renderSignIn();

		fireEvent.change(screen.getByLabelText(/email/i), {
			target: { value: "test@example.com" },
		});
		fireEvent.change(screen.getByLabelText("Password", { selector: "input" }), {
			target: { value: "wrongpassword" },
		});

		fireEvent.click(screen.getByRole("button", { name: /connect/i }));

		await waitFor(() => {
			expect(authService.loginUser).toHaveBeenCalledWith({
				email: "test@example.com",
				password: "wrongpassword",
			});
		});
	});
});
