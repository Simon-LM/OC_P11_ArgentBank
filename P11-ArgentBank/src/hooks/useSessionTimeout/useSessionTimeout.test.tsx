/** @format */

import { describe, test, expect } from "vitest";
import useSessionTimeout from "./useSessionTimeout";

describe("useSessionTimeout", () => {
  test("exports a valid hook function", () => {
    expect(useSessionTimeout).toBeDefined();
    expect(typeof useSessionTimeout).toBe("function");
  });

  test("accepts timeout parameter", () => {
    // Minimal structural test without rendering
    expect(useSessionTimeout.length).toBe(1); // Expects 1 parameter
  });
});
