/** @format */

import { renderHook, act } from "@testing-library/react";
import {
	describe,
	test,
	expect,
	vi,
	beforeEach,
	afterEach,
	Mock,
} from "vitest";
import useMediaQuery from "./useMediaQuery";

// Définit le type de l'objet retourné par notre simulation de matchMedia
interface MockMediaQueryListInstance {
	matches: boolean;
	media: string;
	onchange: null | ((event: Partial<MediaQueryListEvent>) => void);
	addListener: Mock;
	removeListener: Mock;
	addEventListener: Mock;
	removeEventListener: Mock;
	dispatchEvent: Mock;
	simulateChange: (newMatches: boolean) => void;
}

// Helper pour simuler window.matchMedia
const createMatchMediaMock = (initialMatches: boolean) => {
	const listeners: Array<(event: Partial<MediaQueryListEvent>) => void> = [];
	// Cet état est capturé par la fermeture de mockImplementation et simulateChange
	let currentMatchesState = initialMatches;

	const mockFn = vi
		.fn()
		.mockImplementation((query: string): MockMediaQueryListInstance => {
			const mqlInstance: MockMediaQueryListInstance = {
				get matches() {
					return currentMatchesState;
				},
				media: query,
				onchange: null,
				addListener: vi.fn(), // Déprécié
				removeListener: vi.fn(), // Déprécié
				addEventListener: vi.fn(
					(
						type: string,
						listenerCb: (event: Partial<MediaQueryListEvent>) => void
					) => {
						if (type === "change") {
							listeners.push(listenerCb);
						}
					}
				),
				removeEventListener: vi.fn(
					(
						type: string,
						listenerCb: (event: Partial<MediaQueryListEvent>) => void
					) => {
						if (type === "change") {
							const index = listeners.indexOf(listenerCb);
							if (index !== -1) {
								listeners.splice(index, 1);
							}
						}
					}
				),
				dispatchEvent: vi.fn(),
				// Fonction pour simuler un changement de media query
				simulateChange: (newMatchesValue: boolean) => {
					currentMatchesState = newMatchesValue; // Met à jour l'état capturé
					const eventArg = {
						matches: currentMatchesState,
						media: query,
					} as Partial<MediaQueryListEvent>;
					listeners.forEach((listener) => listener(eventArg));
				},
			};
			return mqlInstance;
		});
	return mockFn;
};

let currentMock: ReturnType<typeof createMatchMediaMock>; // Type: vi.Mock<[string], MockMediaQueryListInstance>

describe("useMediaQuery hook", () => {
	beforeEach(() => {
		// Par défaut, la media query ne correspond pas
		currentMock = createMatchMediaMock(false);
		Object.defineProperty(window, "matchMedia", {
			writable: true,
			configurable: true,
			value: currentMock,
		});
	});

	afterEach(() => {
		// Nettoyer le mock
		vi.restoreAllMocks();
	});

	test("should return false when media query does not match initially", () => {
		const { result } = renderHook(() => useMediaQuery("(min-width: 768px)"));
		expect(result.current).toBe(false);
		expect(window.matchMedia).toHaveBeenCalledWith("(min-width: 768px)");
	});

	test("should return true when media query matches initially", () => {
		// Simuler une correspondance initiale en recréant le mock
		currentMock = createMatchMediaMock(true);
		Object.defineProperty(window, "matchMedia", {
			value: currentMock,
		});

		const { result } = renderHook(() => useMediaQuery("(min-width: 768px)"));
		expect(result.current).toBe(true);
	});

	test("should update when media query changes from false to true", () => {
		const { result } = renderHook(() => useMediaQuery("(min-width: 768px)"));
		expect(result.current).toBe(false); // Vérification initiale

		act(() => {
			// Obtenir l'instance retournée par l'appel à window.matchMedia (currentMock)
			const mqlInstance = currentMock.mock.results[0].value;
			mqlInstance.simulateChange(true);
		});

		expect(result.current).toBe(true); // Vérification après changement
	});

	test("should update when media query changes from true to false", () => {
		// Simuler une correspondance initiale
		currentMock = createMatchMediaMock(true);
		Object.defineProperty(window, "matchMedia", {
			value: currentMock,
		});

		const { result } = renderHook(() => useMediaQuery("(min-width: 768px)"));
		expect(result.current).toBe(true); // Vérification initiale

		act(() => {
			const mqlInstance = currentMock.mock.results[0].value;
			mqlInstance.simulateChange(false);
		});

		expect(result.current).toBe(false); // Vérification après changement
	});

	test("should add and remove event listener correctly", () => {
		const query = "(max-width: 600px)";
		const { unmount } = renderHook(() => useMediaQuery(query));

		// Vérifier que addEventListener a été appelé
		const matchMediaInstance = currentMock.mock.results[0].value;
		expect(matchMediaInstance.addEventListener).toHaveBeenCalledWith(
			"change",
			expect.any(Function)
		);

		// Simuler le démontage
		unmount();

		// Vérifier que removeEventListener a été appelé avec le même handler
		expect(matchMediaInstance.removeEventListener).toHaveBeenCalledWith(
			"change",
			(matchMediaInstance.addEventListener as Mock).mock.calls[0][1] // Récupère le handler passé à addEventListener
		);
	});

	test("should re-evaluate and re-attach listener if query string changes", () => {
		const initialQuery = "(min-width: 768px)";
		const newQuery = "(min-width: 1024px)";
		currentMock = createMatchMediaMock(false); // État initial pour initialQuery
		Object.defineProperty(window, "matchMedia", { value: currentMock });

		const { rerender, result } = renderHook(
			({ query }) => useMediaQuery(query),
			{
				initialProps: { query: initialQuery },
			}
		);

		expect(result.current).toBe(false); // Initial state with initialQuery
		expect(window.matchMedia).toHaveBeenCalledWith(initialQuery);
		const initialMatchMediaInstance = currentMock.mock.results[0].value;

		// Change la query et simule que la nouvelle query correspond
		// Il faut recréer le mock pour changer l'état initial que `useMediaQuery` verra pour la nouvelle query
		act(() => {
			currentMock = createMatchMediaMock(true);
			Object.defineProperty(window, "matchMedia", { value: currentMock });
		});

		rerender({ query: newQuery });

		// Après rerender, useMediaQuery s'exécute à nouveau avec newQuery.
		// window.matchMedia (notre currentMock mis à jour) est appelé.
		expect(window.matchMedia).toHaveBeenCalledWith(newQuery);
		// Le hook devrait maintenant refléter l'état du nouveau mock (true).
		expect(result.current).toBe(true);

		// Vérifier que l'ancien listener a été retiré (sur l'instance originale)
		expect(initialMatchMediaInstance.removeEventListener).toHaveBeenCalledWith(
			"change",
			expect.any(Function)
		);

		// Vérifier qu'un nouveau listener a été ajouté (sur la nouvelle instance, si applicable, ou le mock actuel)
		// currentMock.mock.results[0] est l'appel pour initialQuery
		// currentMock.mock.results[1] est l'appel pour newQuery
		const newMatchMediaInstance = currentMock.mock.results[0].value; // Le mock a été réinitialisé, donc c'est le premier appel au *nouveau* mock
		expect(newMatchMediaInstance.addEventListener).toHaveBeenCalledWith(
			"change",
			expect.any(Function)
		);
	});
});
