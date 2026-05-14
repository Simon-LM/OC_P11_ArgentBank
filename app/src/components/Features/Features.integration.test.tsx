/** @format */

/**
 * Integration tests for Features
 *
 * Integration scope:
 * - Accessibility tests with axe-core
 * - WCAG compliance validation
 */

import { describe, test, expect } from "vitest";
import { render } from "@testing-library/react";
import { axe } from "jest-axe";
import Features from "./Features";
import "../../../Axe/utils/axe-setup.js";

describe("Features - Integration Tests", () => {
  // Accessibility tests
  test("has no accessibility violations", async () => {
    const { container } = render(<Features />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
