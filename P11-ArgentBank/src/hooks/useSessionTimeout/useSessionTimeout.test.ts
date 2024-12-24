/** @format */

import { renderHook } from "@testing-library/react";
import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { logoutUser } from "../../pages/user/usersSlice";
import useSessionTimeout from "./useSessionTimeout";

// Déclarez UN SEUL mock ici
const mockDispatch = vi.fn();

// Moquez react-redux et retournez ce mock
vi.mock("react-redux", async () => {
	const actual: Record<string, unknown> = await vi.importActual("react-redux");
	return {
		...actual,
		useDispatch: () => mockDispatch,
	};
});

describe("useSessionTimeout", () => {
	beforeEach(() => {
		vi.useFakeTimers();
		mockDispatch.mockClear();
	});

	afterEach(() => {
		vi.useRealTimers();
		vi.restoreAllMocks();
	});

	test("déclenche logoutUser après le délai spécifié", () => {
		const timeout = 5000;
		renderHook(() => useSessionTimeout(timeout));

		// Simule l'écoulement du temps
		vi.advanceTimersByTime(timeout);

		// Vérifie que mockDispatch a été appelé avec logoutUser()
		expect(mockDispatch).toHaveBeenCalledWith(logoutUser());
	});
	test("réinitialise le timer sur mousemove", () => {
		const timeout = 5000;
		renderHook(() => useSessionTimeout(timeout));

		// Avancer de 3 secondes
		vi.advanceTimersByTime(3000);

		// Simuler mouvement souris
		window.dispatchEvent(new MouseEvent("mousemove"));

		// Avancer de 3 secondes supplémentaires
		vi.advanceTimersByTime(3000);

		// Le logout ne devrait pas encore être appelé
		expect(mockDispatch).not.toHaveBeenCalled();

		// Avancer jusqu'à la fin du nouveau timer
		vi.advanceTimersByTime(2000);

		expect(mockDispatch).toHaveBeenCalledWith(logoutUser());
	});

	test("réinitialise le timer sur keypress", () => {
		const timeout = 5000;
		renderHook(() => useSessionTimeout(timeout));

		vi.advanceTimersByTime(3000);
		window.dispatchEvent(new KeyboardEvent("keypress"));
		vi.advanceTimersByTime(3000);

		expect(mockDispatch).not.toHaveBeenCalled();
	});

	test("nettoie les event listeners au démontage", () => {
		const timeout = 5000;
		const { unmount } = renderHook(() => useSessionTimeout(timeout));

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
