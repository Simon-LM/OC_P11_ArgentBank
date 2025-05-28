/** @format */

import { describe, test, expect } from "vitest";
import useSessionTimeout from "./useSessionTimeout";

describe("useSessionTimeout", () => {
	test("exports a valid hook function", () => {
		expect(useSessionTimeout).toBeDefined();
		expect(typeof useSessionTimeout).toBe("function");
	});

	test("accepts timeout parameter", () => {
		// Test structurel minimal sans rendu
		expect(useSessionTimeout.length).toBe(1); // Attend 1 paramètre
	});
});
