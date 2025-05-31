/** @format */

import { describe, test, expect } from "vitest";
import ProtectedRoute from "./ProtectedRoute";

describe("ProtectedRoute", () => {
  test("exports a valid React component", () => {
    expect(ProtectedRoute).toBeDefined();
    expect(typeof ProtectedRoute).toBe("function");
  });

  test("is a functional component that accepts props", () => {
    // Test structurel minimal sans rendu
    const component = ProtectedRoute;
    expect(component.length).toBe(1); // Attend 1 paramètre (props)
  });
});
