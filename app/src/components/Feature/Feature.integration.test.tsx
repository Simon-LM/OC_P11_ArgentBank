/** @format */

/**
 * Integration Tests for Feature
 *
 * Integration scope:
 * - Icon rendering across every variant
 * - RGAA 10.2 [A]: the icon survives with author stylesheets off
 */

import { describe, test, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import Feature from "./Feature";

describe("Feature - Integration Tests", () => {
  const mockProps = {
    iconClass: "feature-icon--chat",
    title: "You are our #1 priority",
    description:
      "Need to talk to a representative? You can get in touch through our 24/7 chat or through a phone call in less than 5 minutes.",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // RGAA 10.2 [A] — visible content must remain present when stylesheets
  // are disabled. The icons used to be CSS background-images, which fail
  // that criterion outright; the inline SVG passes it structurally, since
  // it is DOM content and its geometry lives in the markup rather than in
  // a stylesheet. Guard against a regression to a CSS-only icon.
  test.each(["chat", "money", "security"])(
    "%s icon draws from markup, not from a stylesheet",
    (name) => {
      const { container } = render(
        <Feature {...mockProps} iconClass={`feature-icon--${name}`} />,
      );
      const svg = container.querySelector("svg.feature-icon__svg");

      expect(svg).not.toBeNull();
      expect(svg).toHaveAttribute("viewBox", "0 0 100 100");
      // Painted shapes, not an empty box waiting on CSS to fill it.
      expect(
        svg?.querySelectorAll("path, rect, circle").length,
      ).toBeGreaterThan(0);
    },
  );

  test("cuts former white areas out with a mask instead of painting them", () => {
    const { container } = render(<Feature {...mockProps} />);
    const svg = container.querySelector("svg.feature-icon__svg");

    expect(svg?.querySelectorAll("mask").length).toBeGreaterThan(0);
    // No hardcoded white left over: the theme's background shows through.
    const painted = Array.from(
      svg?.querySelectorAll(":scope > path, :scope > rect, :scope > circle") ??
        [],
    );
    expect(painted.length).toBeGreaterThan(0);
    for (const shape of painted) {
      expect(shape.getAttribute("fill") ?? "").not.toMatch(/#fff|white/i);
      expect(shape.getAttribute("stroke") ?? "").not.toMatch(/#fff|white/i);
    }
  });
});
