/** @format */

import { describe, test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Features from "./Features";

describe("Features Component", () => {
  test("renders Features component with all its elements", () => {
    render(<Features />);

    const heading = screen.getByRole("heading", {
      name: /Key Advantages of Banking with Argent Bank/i,
      level: 2,
    });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveClass("sr-only");

    expect(screen.getByText("You are our #1 priority")).toBeInTheDocument();
    expect(
      screen.getByText("More savings means higher rates"),
    ).toBeInTheDocument();
    expect(screen.getByText("Security you can trust")).toBeInTheDocument();
  });

  // The icons are decorative (RGAA 1.2 [A]) — they must render, and must
  // stay out of the accessibility tree, so that screen reader users hear
  // each feature's heading once rather than a description of its icon
  // followed by the heading saying the same thing.
  test("renders three decorative icons, none of them announced", () => {
    const { container } = render(<Features />);
    const icons = container.querySelectorAll("svg.feature-icon__svg");

    expect(icons).toHaveLength(3);
    for (const icon of icons) {
      expect(icon).toHaveAttribute("aria-hidden", "true");
      expect(icon).not.toHaveAttribute("role");
      expect(icon).not.toHaveAttribute("aria-label");
    }
  });

  test("gives every icon on the page its own mask ids", () => {
    const { container } = render(<Features />);
    const ids = Array.from(container.querySelectorAll("mask")).map((m) => m.id);

    expect(ids.length).toBeGreaterThan(0);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test("renders correct component structure", () => {
    const { container } = render(<Features />);

    expect(container.querySelector("section.features")).toBeInTheDocument();
    expect(container.getElementsByClassName("feature-item")).toHaveLength(3);
  });

  test("displays feature descriptions", () => {
    render(<Features />);

    expect(
      screen.getByText(/Need to talk to a representative/),
    ).toBeInTheDocument();
    expect(screen.getByText(/The more you save with us/)).toBeInTheDocument();
    expect(
      screen.getByText(/We use top of the line encryption/),
    ).toBeInTheDocument();
  });
});
