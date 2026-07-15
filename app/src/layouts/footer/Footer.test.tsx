/** @format */

import { render, screen, fireEvent, act } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Footer from "./Footer";
import { describe, test, expect, vi } from "vitest";

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

  test("toggles privacy information open and closed", () => {
    vi.useFakeTimers();
    renderWithRouter(<Footer />);

    const toggleButton = screen.getByRole("button", {
      name: /Show Privacy Information/,
    });
    fireEvent.click(toggleButton);
    expect(toggleButton).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("region")).not.toHaveAttribute("hidden");

    // The expanding animation flag resets after 400ms
    act(() => {
      vi.advanceTimersByTime(400);
    });

    fireEvent.click(
      screen.getByRole("button", { name: /Hide Privacy Information/ }),
    );
    expect(toggleButton).toHaveAttribute("aria-expanded", "false");
    vi.useRealTimers();
  });
});
