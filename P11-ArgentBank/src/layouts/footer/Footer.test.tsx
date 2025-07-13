/** @format */

import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Footer from "./Footer";
import { describe, test, expect } from "vitest";

describe("Footer Component", () => {
  const renderWithRouter = (component: React.ReactElement) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
  };

  test("should render the footer component correctly with the correct class and text", () => {
    renderWithRouter(<Footer />);
    const footerElement = screen.getByTestId("footer");
    expect(footerElement).toBeInTheDocument();
    expect(footerElement).toHaveClass("footer");
    expect(screen.getByText(/ArgentBank - Demo Project/)).toBeInTheDocument();
    expect(screen.getByText(/Simon LM/)).toBeInTheDocument();
  });

  test("should have the privacy button with correct initial state", () => {
    renderWithRouter(<Footer />);
    const privacyButton = screen.getByRole("button", {
      name: /Show Privacy Information/,
    });
    expect(privacyButton).toBeInTheDocument();
    expect(privacyButton).toHaveAttribute("aria-expanded", "false");

    const privacyContent = screen.getByRole("region", { hidden: true });
    expect(privacyContent).toHaveAttribute("hidden");
    expect(privacyContent).not.toHaveClass("open");
  });
});
