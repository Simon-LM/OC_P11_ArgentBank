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

  test("displays icons with correct labels", () => {
    render(<Features />);

    expect(screen.getByText(/Chat icon representing/)).toBeInTheDocument();
    expect(screen.getByText(/Money icon showing/)).toBeInTheDocument();
    expect(screen.getByText(/Security shield icon/)).toBeInTheDocument();
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
