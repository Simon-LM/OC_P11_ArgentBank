/** @format */

import { renderHook } from "@testing-library/react";
import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { logoutUser } from "../../pages/user/usersSlice";
import useSessionTimeout from "./useSessionTimeout";
import type { ReactNode } from "react";

const mockDispatch = vi.fn();

// Configuration du store Redux pour les tests
const mockStore = configureStore({
	reducer: {
		users: () => ({ isAuthenticated: true }),
	},
});

// Mock de react-redux
vi.mock("react-redux", async () => {
	const actual = await vi.importActual("react-redux");
	return {
		...actual,
		useDispatch: () => mockDispatch,
	};
});

const TestWrapper = ({ children }: { children: ReactNode }) => (
	<Provider store={mockStore}>{children}</Provider>
);

describe("useSessionTimeout", () => {
	const TEST_TIMEOUT = 5000;

	beforeEach(() => {
		vi.useFakeTimers();
		mockDispatch.mockClear();
	});

	afterEach(() => {
		vi.useRealTimers();
		vi.restoreAllMocks();
	});

	test("déclenche logoutUser après le délai spécifié", () => {
		renderHook(() => useSessionTimeout(TEST_TIMEOUT), {
			wrapper: TestWrapper,
		});

		vi.advanceTimersByTime(TEST_TIMEOUT);

		expect(mockDispatch).toHaveBeenCalledWith(logoutUser());
	});

	test("réinitialise le timer sur mousemove", () => {
		renderHook(() => useSessionTimeout(TEST_TIMEOUT), {
			wrapper: TestWrapper,
		});

		// Avance de 3 secondes
		vi.advanceTimersByTime(3000);

		// Simule un mouvement de souris
		window.dispatchEvent(new MouseEvent("mousemove"));

		// Avance de 3 secondes supplémentaires
		vi.advanceTimersByTime(3000);

		// Ne devrait pas être déconnecté
		expect(mockDispatch).not.toHaveBeenCalled();

		// Avance jusqu'à la fin du nouveau délai
		vi.advanceTimersByTime(2000);
		expect(mockDispatch).toHaveBeenCalledWith(logoutUser());
	});

	test("réinitialise le timer sur keypress", () => {
		renderHook(() => useSessionTimeout(TEST_TIMEOUT), {
			wrapper: TestWrapper,
		});

		// Avance de 3 secondes
		vi.advanceTimersByTime(3000);

		// Simule une frappe clavier
		window.dispatchEvent(new KeyboardEvent("keypress"));

		// Avance de 3 secondes supplémentaires
		vi.advanceTimersByTime(3000);

		// Ne devrait pas être déconnecté
		expect(mockDispatch).not.toHaveBeenCalled();

		// Avance jusqu'à la fin du nouveau délai
		vi.advanceTimersByTime(2000);
		expect(mockDispatch).toHaveBeenCalledWith(logoutUser());
	});

	test("nettoie les event listeners au démontage", () => {
		const { unmount } = renderHook(() => useSessionTimeout(TEST_TIMEOUT), {
			wrapper: TestWrapper,
		});

		const removeEventListenerSpy = vi.spyOn(window, "removeEventListener");

		unmount();

		expect(removeEventListenerSpy).toHaveBeenCalledTimes(2);
		expect(removeEventListenerSpy).toHaveBeenCalledWith(
			"mousemove",
			expect.any(Function)
		);
		expect(removeEventListenerSpy).toHaveBeenCalledWith(
			"keypress",
			expect.any(Function)
		);
	});
});