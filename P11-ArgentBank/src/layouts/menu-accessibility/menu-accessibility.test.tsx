/** @format */

import { describe, test, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import ThemeToggle from "./menu-accessibility";

// Mock de window.matchMedia avant chaque test
beforeEach(() => {
	Object.defineProperty(window, "matchMedia", {
		writable: true,
		value: (query: string) => ({
			matches: query === "(prefers-color-scheme: dark)", // Par défaut, on simule le dark theme
			media: query,
			onchange: null,
			addEventListener: vi.fn(),
			removeEventListener: vi.fn(),
		}),
	});
});

describe("ThemeToggle component", () => {
	test("renders with dark theme when user preference is dark", () => {
		render(<ThemeToggle />);

		expect(screen.getByTestId("dark-theme")).toBeInTheDocument();
		expect(screen.queryByTestId("light-theme")).not.toBeInTheDocument();
	});

	test("renders with light theme when user preference is light", () => {
		// Redéfinir le comportement pour simuler le thème clair
		Object.defineProperty(window, "matchMedia", {
			writable: true,
			value: (query: string) => ({
				matches: query === "(prefers-color-scheme: light)", // Simuler le thème clair
				media: query,
				onchange: null,
				addEventListener: vi.fn(),
				removeEventListener: vi.fn(),
			}),
		});

		render(<ThemeToggle />);

		expect(screen.getByTestId("light-theme")).toBeInTheDocument();
		expect(screen.queryByTestId("dark-theme")).not.toBeInTheDocument();
	});
});
