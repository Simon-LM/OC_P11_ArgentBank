/** @format */
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

const mockTrackEvent = vi.fn(); // Defined mockTrackEvent here
vi.mock("../../hooks/useMatomo/useMatomo", () => ({
	useMatomo: () => ({
		trackEvent: mockTrackEvent, // Use the stable mockTrackEvent
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

describe("SignIn Component", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockTrackEvent.mockClear(); // Clear mockTrackEvent
	});

	test("handles form submission successfully and updates ARIA live region", async () => {
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
			// Check for success message in ARIA live region
			expect(screen.getByRole("status")).toHaveTextContent(
				"Authentication successful. Redirecting to your account."
			);
			expect(mockNavigate).toHaveBeenCalledWith("/user");
		});
	});

	test("displays 'Authenticating...' message in ARIA live region during submission", async () => {
		// Mock loginUser to return a promise that never resolves for this test
		vi.mocked(authService.loginUser).mockImplementation(
			() => new Promise(() => {})
		);

		renderSignIn();

		fireEvent.change(screen.getByLabelText(/email/i), {
			target: { value: "test@example.com" },
		});
		fireEvent.change(screen.getByLabelText("Password", { selector: "input" }), {
			target: { value: "password123" },
		});

		fireEvent.click(screen.getByRole("button", { name: /connect/i }));

		// Check for "Authenticating..." message
		// Need a short waitFor because setIsLoading and setAriaMessage are asynchronous
		await waitFor(() => {
			expect(screen.getByRole("status")).toHaveTextContent(
				/Authenticating your credentials.../i
			);
		});
	});

	test("handles generic login error and updates ARIA attributes", async () => {
		vi.mocked(authService.loginUser).mockRejectedValue(
			new Error("Some generic network error") // Triggers default error message
		);

		renderSignIn();
		const emailInput = screen.getByLabelText(/email/i);
		const passwordInput = screen.getByLabelText("Password", {
			selector: "input",
		});

		fireEvent.change(emailInput, {
			target: { value: "test@example.com" },
		});
		fireEvent.change(passwordInput, {
			target: { value: "wrongpassword" },
		});

		fireEvent.click(screen.getByRole("button", { name: /connect/i }));

		await waitFor(() => {
			expect(screen.getByRole("status")).toHaveTextContent(
				/Authentication failed. Please check your credentials./i
			);
			// For "Unable to login. Please check your credentials."
			expect(emailInput).toHaveAttribute("aria-invalid", "false");
			expect(passwordInput).toHaveAttribute("aria-invalid", "false");
		});
	});

	test("handles 401 error from API and updates ARIA attributes", async () => {
		vi.mocked(authService.loginUser).mockRejectedValue(
			new Error("Request failed with status code 401")
		);

		renderSignIn();
		const emailInput = screen.getByLabelText(/email/i);
		const passwordInput = screen.getByLabelText("Password", {
			selector: "input",
		});

		fireEvent.change(emailInput, { target: { value: "test@example.com" } });
		fireEvent.change(passwordInput, { target: { value: "anypassword" } });
		fireEvent.click(screen.getByRole("button", { name: /connect/i }));

		await waitFor(() => {
			expect(screen.getByRole("status")).toHaveTextContent(
				/Authentication failed. Please check your credentials./i
			);
			// Error message: "Invalid email or password"
			expect(emailInput).toHaveAttribute("aria-invalid", "true"); // Corrected expectation
			expect(passwordInput).toHaveAttribute("aria-invalid", "true"); // Corrected expectation
		});
	});

	test("handles invalid email error from API and updates ARIA attributes", async () => {
		vi.mocked(authService.loginUser).mockRejectedValue(
			new Error("User email not found")
		);

		renderSignIn();
		const emailInput = screen.getByLabelText(/email/i);
		const passwordInput = screen.getByLabelText("Password", {
			selector: "input",
		});

		fireEvent.change(emailInput, { target: { value: "invalid@example.com" } });
		fireEvent.change(passwordInput, { target: { value: "anypassword" } });
		fireEvent.click(screen.getByRole("button", { name: /connect/i }));

		await waitFor(() => {
			expect(screen.getByRole("status")).toHaveTextContent(
				/Authentication failed. Please check your credentials./i
			);
			// Error message: "Invalid email address"
			expect(emailInput).toHaveAttribute("aria-invalid", "true");
			expect(passwordInput).toHaveAttribute("aria-invalid", "false");
		});
	});

	test("handles incorrect password error from API and updates ARIA attributes", async () => {
		vi.mocked(authService.loginUser).mockRejectedValue(
			new Error("Incorrect password provided")
		);

		renderSignIn();
		const emailInput = screen.getByLabelText(/email/i);
		const passwordInput = screen.getByLabelText("Password", {
			selector: "input",
		});

		fireEvent.change(emailInput, { target: { value: "test@example.com" } });
		fireEvent.change(passwordInput, { target: { value: "incorrect" } });
		fireEvent.click(screen.getByRole("button", { name: /connect/i }));

		await waitFor(() => {
			expect(screen.getByRole("status")).toHaveTextContent(
				/Authentication failed. Please check your credentials./i
			);
			// Error message: "Incorrect password"
			expect(emailInput).toHaveAttribute("aria-invalid", "false");
			expect(passwordInput).toHaveAttribute("aria-invalid", "true");
		});
	});

	test("handles password visibility toggle", () => {
		renderSignIn();

		const passwordField = screen.getByLabelText("Password", {
			selector: "input",
		});
		expect(passwordField).toHaveAttribute("type", "password");

		fireEvent.click(screen.getByLabelText(/show password/i));
		expect(passwordField).toHaveAttribute("type", "text");

		fireEvent.click(screen.getByLabelText(/hide password/i));
		expect(passwordField).toHaveAttribute("type", "password");
	});

	test("displays demo information", () => {
		renderSignIn();

		expect(screen.getByText(/Demo credentials/i)).toBeInTheDocument();
		expect(
			screen.getByText(/tony@stark.com \/ password123/i)
		).toBeInTheDocument();
	});

	describe("handles specific login errors and ARIA attributes", () => {
		const submitFormWithCredentials = (
			email = "test@example.com",
			password = "password123"
		) => {
			fireEvent.change(screen.getByLabelText(/email/i), {
				target: { value: email },
			});
			fireEvent.change(
				screen.getByLabelText("Password", { selector: "input" }),
				{
					target: { value: password },
				}
			);
			fireEvent.click(screen.getByRole("button", { name: /connect/i }));
		};

		test("when API returns 401 error, sets correct ARIA attributes", async () => {
			const errorMessage = "Request failed with status code 401";
			vi.mocked(authService.loginUser).mockRejectedValue(
				new Error(errorMessage)
			);
			renderSignIn();
			submitFormWithCredentials();

			await waitFor(() => {
				expect(
					screen.getByText(
						/Authentication failed. Please check your credentials./i
					)
				).toBeInTheDocument();
				const emailInput = screen.getByLabelText(/email/i);
				const passwordInput = screen.getByLabelText("Password", {
					selector: "input",
				});
				// Error from getErrorMessage will be "Invalid email or password"
				expect(emailInput).toHaveAttribute("aria-invalid", "true"); // Corrected expectation
				expect(passwordInput).toHaveAttribute("aria-invalid", "true"); // Corrected expectation

				expect(mockTrackEvent).toHaveBeenCalledWith({
					// Use mockTrackEvent
					category: "User",
					action: "Login",
					name: `Failed login: ${errorMessage}`,
				});
			});
		});

		test("when error message suggests invalid email, sets correct ARIA attributes", async () => {
			const errorMessage = "User email not found";
			vi.mocked(authService.loginUser).mockRejectedValue(
				new Error(errorMessage)
			);
			renderSignIn();
			submitFormWithCredentials();

			await waitFor(() => {
				expect(
					screen.getByText(
						/Authentication failed. Please check your credentials./i
					)
				).toBeInTheDocument();
				const emailInput = screen.getByLabelText(/email/i);
				const passwordInput = screen.getByLabelText("Password", {
					selector: "input",
				});
				// Error from getErrorMessage will be "Invalid email address"
				expect(emailInput).toHaveAttribute("aria-invalid", "true");
				expect(passwordInput).toHaveAttribute("aria-invalid", "false");

				expect(mockTrackEvent).toHaveBeenCalledWith({
					// Use mockTrackEvent
					category: "User",
					action: "Login",
					name: `Failed login: ${errorMessage}`,
				});
			});
		});

		test("when error message suggests incorrect password, sets correct ARIA attributes", async () => {
			const errorMessage = "Incorrect user password";
			vi.mocked(authService.loginUser).mockRejectedValue(
				new Error(errorMessage)
			);
			renderSignIn();
			submitFormWithCredentials();

			await waitFor(() => {
				expect(
					screen.getByText(
						/Authentication failed. Please check your credentials./i
					)
				).toBeInTheDocument();
				const emailInput = screen.getByLabelText(/email/i);
				const passwordInput = screen.getByLabelText("Password", {
					selector: "input",
				});
				// Error from getErrorMessage will be "Incorrect password"
				expect(emailInput).toHaveAttribute("aria-invalid", "false");
				expect(passwordInput).toHaveAttribute("aria-invalid", "true");

				expect(mockTrackEvent).toHaveBeenCalledWith({
					// Use mockTrackEvent
					category: "User",
					action: "Login",
					name: `Failed login: ${errorMessage}`,
				});
			});
		});

		test("when loginUser rejects with a non-Error object", async () => {
			const errorObject = { message: "A non-error object rejection" };
			vi.mocked(authService.loginUser).mockRejectedValue(errorObject);
			renderSignIn();
			submitFormWithCredentials();

			await waitFor(() => {
				expect(
					screen.getByText(
						/Authentication failed. Please check your credentials./i
					)
				).toBeInTheDocument();
				const emailInput = screen.getByLabelText(/email/i);
				const passwordInput = screen.getByLabelText("Password", {
					selector: "input",
				});
				// Error will be "An unexpected error occurred"
				expect(emailInput).toHaveAttribute("aria-invalid", "false");
				expect(passwordInput).toHaveAttribute("aria-invalid", "false");

				expect(mockTrackEvent).toHaveBeenCalledWith({
					// Use mockTrackEvent
					category: "User",
					action: "Login",
					name: "Failed login: Unknown error", // As err is not instanceof Error
				});
			});
		});
	});
});
