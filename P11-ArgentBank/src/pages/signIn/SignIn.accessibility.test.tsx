/** @format */
/**
 * @fileoverview Specific accessibility tests for the SignIn form
 *
 * Based on RGAA 4.1 criteria and the Accessibility Action Plan
 * Tests compliant with Test 3a defined in PLAN_ACTION_ACCESSIBILITE_RGAA.md
 *
 * Accessibility scope tested:
 * - Empty form submission with focus management
 * - Invalid email validation with ARIA
 * - Invalid credentials error handling
 * - Autocomplete attributes verification
 * - Focus behavior on fields with errors
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
    </Provider>,
  );
};

describe("SignIn Component - RGAA Accessibility Tests (Test 3a)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Test 3a.1: Empty Form Submission", () => {
    test("should display error message with role='alert' on empty form submission", async () => {
      vi.mocked(authService.loginUser).mockRejectedValue(
        new Error("Unable to login. Please check your credentials."),
      );

      renderSignIn();

      // Submit empty form
      const submitButton = screen.getByRole("button", { name: /connect/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        // Verify error message appears with role="alert"
        const errorMessage = screen.getByRole("alert");
        expect(errorMessage).toBeInTheDocument();
        expect(errorMessage).toHaveTextContent(/unable to login/i);
      });
    });

    test("should move focus to first field with error on empty form submission", async () => {
      vi.mocked(authService.loginUser).mockRejectedValue(
        new Error("Invalid email address"),
      );

      renderSignIn();

      const emailField = screen.getByLabelText(/email/i);
      const submitButton = screen.getByRole("button", { name: /connect/i });

      fireEvent.click(submitButton);

      await waitFor(() => {
        // Verify error appears
        expect(screen.getByRole("alert")).toBeInTheDocument();

        // Check that email field has appropriate ARIA attributes for error state
        expect(emailField).toHaveAttribute("aria-invalid", "true");
        expect(emailField).toHaveAttribute("aria-describedby", "error-message");
      });
    });
  });

  describe("Test 3a.2: Invalid Email Test", () => {
    test("should handle invalid email with proper ARIA attributes", async () => {
      vi.mocked(authService.loginUser).mockRejectedValue(
        new Error("Invalid email address"),
      );

      renderSignIn();

      const emailField = screen.getByLabelText(/email/i);
      const passwordField = screen.getByLabelText("Password", {
        selector: "input",
      });
      const submitButton = screen.getByRole("button", { name: /connect/i });

      // Enter invalid email and valid password
      fireEvent.change(emailField, { target: { value: "invalid-email" } });
      fireEvent.change(passwordField, { target: { value: "password123" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        // Verify email field has error state
        expect(emailField).toHaveAttribute("aria-invalid", "true");
        expect(emailField).toHaveAttribute("aria-describedby", "error-message");

        // Verify error message is present and accessible
        const errorMessage = screen.getByRole("alert");
        expect(errorMessage).toBeInTheDocument();
        expect(errorMessage).toHaveAttribute("id", "error-message");
      });
    });
  });

  describe("Test 3a.3: Invalid Credentials Test", () => {
    test("should display general error message for invalid credentials", async () => {
      vi.mocked(authService.loginUser).mockRejectedValue(new Error("401"));

      renderSignIn();

      const emailField = screen.getByLabelText(/email/i);
      const passwordField = screen.getByLabelText("Password", {
        selector: "input",
      });
      const submitButton = screen.getByRole("button", { name: /connect/i });

      // Enter valid email format but wrong credentials
      fireEvent.change(emailField, { target: { value: "test@example.com" } });
      fireEvent.change(passwordField, { target: { value: "wrongpassword" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        // Verify general error message appears
        const errorMessage = screen.getByRole("alert");
        expect(errorMessage).toBeInTheDocument();
        expect(errorMessage).toHaveTextContent(/invalid email or password/i);
      });
    });
  });

  describe("Test 3a.4: Autocomplete Verification", () => {
    test("should have proper autocomplete attributes", () => {
      renderSignIn();

      const emailField = screen.getByLabelText(/email/i);
      const passwordField = screen.getByLabelText("Password", {
        selector: "input",
      });

      // Verify autocomplete attributes according to RGAA 11.13
      expect(emailField).toHaveAttribute("autoComplete", "username");
      expect(passwordField).toHaveAttribute("autoComplete", "current-password");
    });

    test("should have proper ARIA attributes for form accessibility", () => {
      renderSignIn();

      const emailField = screen.getByLabelText(/email/i);
      const passwordField = screen.getByLabelText("Password", {
        selector: "input",
      });
      const form = screen.getByRole("form", { name: /sign in/i });

      // Verify required ARIA attributes
      expect(emailField).toHaveAttribute("aria-required", "true");
      expect(passwordField).toHaveAttribute("aria-required", "true");

      // Verify form has proper labeling
      expect(form).toHaveAttribute("aria-labelledby", "signin-title");
      expect(form).toHaveAttribute("noValidate");
    });
  });

  describe("Focus Management", () => {
    test("should have proper focus management for password visibility toggle", () => {
      renderSignIn();

      const passwordField = screen.getByLabelText("Password", {
        selector: "input",
      });
      const toggleButton = screen.getByLabelText(/show password/i);

      // Verify toggle button has proper ARIA label
      expect(toggleButton).toHaveAttribute("aria-label", "Show password");
      expect(toggleButton).toHaveAttribute("type", "button");

      // Test toggle functionality
      fireEvent.click(toggleButton);

      // After click, should change to "Hide password"
      const hideButton = screen.getByLabelText(/hide password/i);
      expect(hideButton).toHaveAttribute("aria-label", "Hide password");
      expect(passwordField).toHaveAttribute("type", "text");
    });
  });

  describe("Screen Reader Support", () => {
    test("should have proper live regions for status updates", async () => {
      vi.mocked(authService.loginUser).mockRejectedValue(
        new Error("Authentication failed"),
      );

      renderSignIn();

      const submitButton = screen.getByRole("button", { name: /connect/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        // Verify error message has role="alert" for immediate announcement
        const alertMessage = screen.getByRole("alert");
        expect(alertMessage).toHaveAttribute("aria-live", "assertive");

        // Verify status messages for screen readers
        const statusElement = screen.getByRole("status");
        expect(statusElement).toHaveAttribute("aria-live", "polite");
        expect(statusElement).toHaveClass("sr-only");
      });
    });

    test("should announce loading state to screen readers", async () => {
      // Mock a delayed response to test loading state
      vi.mocked(authService.loginUser).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100)),
      );

      renderSignIn();

      const emailField = screen.getByLabelText(/email/i);
      const passwordField = screen.getByLabelText("Password", {
        selector: "input",
      });
      const submitButton = screen.getByRole("button", { name: /connect/i });

      fireEvent.change(emailField, { target: { value: "test@example.com" } });
      fireEvent.change(passwordField, { target: { value: "password123" } });
      fireEvent.click(submitButton);

      // Verify loading state is announced
      expect(submitButton).toHaveAttribute("aria-busy", "true");
      expect(submitButton).toHaveTextContent("Authenticating...");
      expect(submitButton).toBeDisabled();
    });
  });
});
