/**
 * @format
 * @fileoverview Configuration Axe pour les tests d'accessibilité intégrés
 * @description Setup global pour tous les tests incluant Axe
 */

import { expect } from "vitest";
import { toHaveNoViolations } from "jest-axe";

// Extension des matchers Vitest avec jest-axe
expect.extend(toHaveNoViolations);

// Mock pour window.matchMedia requis pour jsdom
if (typeof window !== "undefined") {
	Object.defineProperty(window, "matchMedia", {
		writable: true,
		value: (query: string) => ({
			matches: false,
			media: query,
			onchange: null,
			addListener: () => {}, // deprecated
			removeListener: () => {}, // deprecated
			addEventListener: () => {},
			removeEventListener: () => {},
			dispatchEvent: () => {},
		}),
	});

	// Mock pour IntersectionObserver requis pour certains composants
	if (!globalThis.IntersectionObserver) {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		(globalThis as any).IntersectionObserver = class MockIntersectionObserver {
			constructor(_callback: unknown, _options?: unknown) {
				// Mock implementation
			}

			observe() {}
			unobserve() {}
			disconnect() {}
		};
	}
}
