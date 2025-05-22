/** @format */

import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock react-intersection-observer
vi.mock("react-intersection-observer", () => ({
	useInView: () => ({
		ref: vi.fn(),
		inView: true, // Ou false, selon le comportement par défaut que vous souhaitez simuler
		entry: null,
	}),
}));

// // eslint-disable-next-line no-var
// declare global {
// 	var vi: typeof vi;
// }

// global.vi = vi;
