/** @format */

import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock react-intersection-observer
vi.mock("react-intersection-observer", () => ({
  useInView: () => ({
    ref: vi.fn(),
    inView: true, // Or false, depending on the default behavior you want to simulate
    entry: null,
  }),
}));

// Global mock for window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false, // Default mock value
    media: query,
    onchange: null,
    addListener: vi.fn(), // Mock addListener
    removeListener: vi.fn(), // Mock removeListener
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }),
});

// // eslint-disable-next-line no-var
// declare global {
// 	var vi: typeof vi;
// }

// global.vi = vi;
