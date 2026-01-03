/** @format */
import { describe, test, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import SignIn from "./SignIn";
import { configureStore } from "@reduxjs/toolkit";
import userReducer from "../../store/slices/usersSlice";

// Mock for useMatomo
vi.mock("../../hooks/useMatomo/useMatomo", () => ({
  useMatomo: () => ({
    trackEvent: vi.fn(),
  }),
}));

describe("SignIn Component", () => {
  test("handles password visibility toggle", () => {
    const store = configureStore({
      reducer: {
        users: userReducer,
      },
    });

    render(
      <Provider store={store}>
        <MemoryRouter>
          <SignIn />
        </MemoryRouter>
      </Provider>,
    );

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
    const store = configureStore({
      reducer: {
        users: userReducer,
      },
    });

    render(
      <Provider store={store}>
        <MemoryRouter>
          <SignIn />
        </MemoryRouter>
      </Provider>,
    );

    expect(screen.getByText(/Demo credentials/i)).toBeInTheDocument();
    expect(
      screen.getByText(/steve@rogers.com \/ Louvre123/i),
    ).toBeInTheDocument();
  });
});
