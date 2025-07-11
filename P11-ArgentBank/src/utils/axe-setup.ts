/**
 * @format
 * @fileoverview Configuration Axe pour les tests d'accessibilité intégrés
 * @description Setup global pour tous les tests incluant Axe
 */

import { expect } from "vitest";
import { toHaveNoViolations } from "jest-axe";

// Vitest matchers extension with jest-axe
expect.extend(toHaveNoViolations);

// Mock for window.matchMedia required for jsdom
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

  // Mock for IntersectionObserver required for certain components
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
