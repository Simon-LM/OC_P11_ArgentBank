/** @format */

import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import Feature from "./Feature";

describe("Feature Component", () => {
  const mockProps = {
    iconClass: "feature-icon--chat",
    title: "You are our #1 priority",
    description:
      "Need to talk to a representative? You can get in touch through our 24/7 chat or through a phone call in less than 5 minutes.",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders the component with correct props", () => {
    render(<Feature {...mockProps} />);
    expect(screen.getByText(mockProps.title)).toBeInTheDocument();
    expect(screen.getByText(mockProps.description)).toBeInTheDocument();
  });

  test("applies correct CSS classes", () => {
    render(<Feature {...mockProps} />);
    const iconDiv = document.querySelector(".feature-icon");
    expect(iconDiv).toHaveClass("feature-icon", mockProps.iconClass);
  });

  test("renders the icon as an inline SVG, not an <img>", () => {
    const { container } = render(<Feature {...mockProps} />);
    expect(container.querySelector("svg.feature-icon__svg")).not.toBeNull();
    expect(container.querySelector("img")).toBeNull();
    expect(container.querySelector("picture")).toBeNull();
  });

  // RGAA 1.2 [A] — a decorative <svg> must be hidden from assistive
  // technologies with aria-hidden="true" and must carry none of the
  // naming attributes, nor a <title>/<desc>. Anything here would give the
  // icon an accessible name and duplicate the adjacent heading.
  test.each(["chat", "money", "security"])(
    "%s icon is decorative per RGAA 1.2",
    (name) => {
      const { container } = render(
        <Feature {...mockProps} iconClass={`feature-icon--${name}`} />,
      );
      const svg = container.querySelector("svg.feature-icon__svg");

      expect(svg).not.toBeNull();
      expect(svg).toHaveAttribute("aria-hidden", "true");
      for (const attr of [
        "aria-label",
        "aria-labelledby",
        "aria-describedby",
        "role",
        "title",
      ]) {
        expect(svg).not.toHaveAttribute(attr);
      }
      expect(svg?.querySelector("title")).toBeNull();
      expect(svg?.querySelector("desc")).toBeNull();
    },
  );

  test("paints every shape with currentColor so the theme drives the icon", () => {
    const { container } = render(<Feature {...mockProps} />);
    const svg = container.querySelector("svg.feature-icon__svg");
    expect(svg).toHaveAttribute("fill", "currentColor");
  });

  // Duplicate ids across two icons on the same page would be an HTML
  // validity error (RGAA 8.2 [A]) and would make the second icon resolve
  // its url(#...) mask against the first one's.
  test("generates unique mask ids per instance", () => {
    const { container } = render(
      <>
        <Feature {...mockProps} />
        <Feature {...mockProps} />
      </>,
    );
    const ids = Array.from(container.querySelectorAll("mask")).map((m) => m.id);

    expect(ids.length).toBeGreaterThan(0);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) {
      expect(id).toMatch(/^[a-zA-Z0-9-]+$/);
    }
  });

  test("handles invalid iconClass", () => {
    const { container } = render(
      <Feature
        iconClass=""
        title="Test title"
        description="Test description"
      />,
    );
    expect(container.querySelector("svg.feature-icon__svg")).toBeNull();
    expect(screen.getByText("Test title")).toBeInTheDocument();
  });

  test("handles non-string iconClass", () => {
    const { container } = render(
      <Feature
        iconClass={null as unknown as string}
        title="Test title"
        description="Test description"
      />,
    );
    expect(container.querySelector("svg.feature-icon__svg")).toBeNull();
    expect(container.querySelector(".feature-icon")).toHaveClass(
      "feature-icon",
    );
    expect(screen.getByText("Test title")).toBeInTheDocument();
  });
});
