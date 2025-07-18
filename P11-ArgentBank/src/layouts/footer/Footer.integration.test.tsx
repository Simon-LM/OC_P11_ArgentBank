/** @format */

/**
 * Integration tests for Footer
 *
 * Integration scope:
 * - User interactions (toggle privacy)
 * - Accessibility tests with axe-core
 * - WCAG compliance validation
 */

import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { axe } from "jest-axe";
import Footer from "./Footer";
import { describe, test, expect } from "vitest";
import "../../../Axe/utils/axe-setup.js";

describe("Footer - Integration Tests", () => {
  const renderWithRouter = (component: React.ReactElement) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
  };

  test("should toggle privacy information when button is clicked", () => {
    renderWithRouter(<Footer />);
    const privacyButton = screen.getByRole("button", {
      name: /Show Privacy Information/,
    });

    fireEvent.click(privacyButton);
    expect(privacyButton).toHaveTextContent(/Hide Privacy Information/);
    expect(privacyButton).toHaveAttribute("aria-expanded", "true");

    const privacyContent = screen.getByRole("region", { hidden: false });
    expect(privacyContent).not.toHaveAttribute("hidden");
    expect(privacyContent).toHaveClass("open");

    fireEvent.click(privacyButton);
    expect(privacyButton).toHaveTextContent(/Show Privacy Information/);
    expect(privacyButton).toHaveAttribute("aria-expanded", "false");
    expect(privacyContent).toHaveAttribute("hidden");
    expect(privacyContent).not.toHaveClass("open");
  });

  test("should display privacy information content when expanded", () => {
    renderWithRouter(<Footer />);
    const privacyButton = screen.getByRole("button", {
      name: /Show Privacy Information/,
    });
    fireEvent.click(privacyButton);

    expect(
      screen.getByText(/This site uses Matomo for traffic analysis/),
    ).toBeInTheDocument();
    expect(screen.getByText(/No cookies are used/)).toBeInTheDocument();
    expect(screen.getByText(/IP addresses are anonymized/)).toBeInTheDocument();
    expect(
      screen.getByText(/No data is shared with third parties/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Analytics data is retained for 13 months/),
    ).toBeInTheDocument();

    const optOutLink = screen.getByText(/Click here to opt out of tracking/);
    expect(optOutLink).toBeInTheDocument();
    expect(optOutLink.closest("a")).toHaveAttribute(
      "href",
      expect.stringContaining("optOut"),
    );
  });

  test("should render Site Map link", () => {
    renderWithRouter(<Footer />);
    const siteMapLink = screen.getByText("Site Map");
    expect(siteMapLink).toBeInTheDocument();
    expect(siteMapLink.closest("a")).toHaveAttribute("href", "/sitemap");
  });

  // Accessibility tests
  test("has no accessibility violations", async () => {
    const { container } = renderWithRouter(<Footer />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  test("privacy information has proper accessibility when expanded", async () => {
    const { container } = renderWithRouter(<Footer />);
    const privacyButton = screen.getByRole("button", {
      name: /Show Privacy Information/,
    });

    fireEvent.click(privacyButton);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
