/** @format */

import { describe, test, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AccessibilityControl from "./AccessibilityControl";

describe("AccessibilityControl", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = "";
    document.documentElement.removeAttribute("data-theme");
  });

  test("renders the trigger button with an English label by default", () => {
    render(<AccessibilityControl language="en" />);
    expect(
      screen.getByRole("button", { name: "Accessibility options" }),
    ).toBeInTheDocument();
  });

  test("renders the trigger button with a French label", () => {
    render(<AccessibilityControl language="fr" />);
    expect(
      screen.getByRole("button", { name: "Options d'accessibilité" }),
    ).toBeInTheDocument();
  });

  test("panel is closed by default", () => {
    render(<AccessibilityControl language="en" />);
    const button = screen.getByRole("button", {
      name: "Accessibility options",
    });
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(document.querySelector(".accessibility-panel")).not.toHaveClass(
      "open",
    );
  });

  test("clicking the trigger opens the panel", async () => {
    const user = userEvent.setup();
    render(<AccessibilityControl language="en" />);
    const button = screen.getByRole("button", {
      name: "Accessibility options",
    });

    await user.click(button);

    expect(button).toHaveAttribute("aria-expanded", "true");
    expect(document.querySelector(".accessibility-panel")).toHaveClass("open");
  });

  test("clicking the trigger again closes the panel", async () => {
    const user = userEvent.setup();
    render(<AccessibilityControl language="en" />);
    const button = screen.getByRole("button", {
      name: "Accessibility options",
    });

    await user.click(button);
    await user.click(button);

    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(document.querySelector(".accessibility-panel")).not.toHaveClass(
      "open",
    );
  });

  test("clicking outside the control closes the panel", async () => {
    const user = userEvent.setup();
    render(
      <div>
        <AccessibilityControl language="en" />
        <button>outside</button>
      </div>,
    );
    const button = screen.getByRole("button", {
      name: "Accessibility options",
    });

    await user.click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");

    await user.click(screen.getByRole("button", { name: "outside" }));
    expect(button).toHaveAttribute("aria-expanded", "false");
  });

  test("pressing Escape closes the panel and returns focus to the trigger", async () => {
    const user = userEvent.setup();
    render(<AccessibilityControl language="en" />);
    const button = screen.getByRole("button", {
      name: "Accessibility options",
    });

    await user.click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");

    fireEvent.keyDown(document, { key: "Escape" });

    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(button).toHaveFocus();
  });

  test("pressing Escape while the panel is already closed does nothing", () => {
    render(<AccessibilityControl language="en" />);
    const button = screen.getByRole("button", {
      name: "Accessibility options",
    });
    expect(button).toHaveAttribute("aria-expanded", "false");

    fireEvent.keyDown(document, { key: "Escape" });

    expect(button).toHaveAttribute("aria-expanded", "false");
  });

  test("the close button inside the menu closes the panel via the same focus-return path", async () => {
    const user = userEvent.setup();
    render(<AccessibilityControl language="en" />);
    const button = screen.getByRole("button", {
      name: "Accessibility options",
    });

    await user.click(button);
    await user.click(screen.getByRole("button", { name: "Close menu" }));

    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(button).toHaveFocus();
  });

  test("renders a custom icon when provided instead of the default pictogram", () => {
    render(
      <AccessibilityControl
        language="en"
        icon={<span data-testid="custom-icon">★</span>}
      />,
    );
    expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
    expect(
      document.querySelector(".accessibility-control__button svg"),
    ).not.toBeInTheDocument();
  });

  test("applies the position and className props to the wrapper", () => {
    render(
      <AccessibilityControl
        language="en"
        position="bottom-left"
        className="my-extra-class"
      />,
    );
    const wrapper = document.querySelector(".accessibility-control");
    expect(wrapper).toHaveClass("bottom-left", "my-extra-class");
  });

  test("defaults to the top-right position when none is given", () => {
    render(<AccessibilityControl language="en" />);
    expect(document.querySelector(".accessibility-control")).toHaveClass(
      "top-right",
    );
  });

  test("forwards complianceUrl through to the menu's compliance link", async () => {
    const user = userEvent.setup();
    render(
      <AccessibilityControl
        language="en"
        complianceUrl="https://example.com/a11y"
      />,
    );
    await user.click(
      screen.getByRole("button", { name: "Accessibility options" }),
    );
    expect(
      screen.getByRole("link", {
        name: "Accessibility: compliance statement",
      }),
    ).toHaveAttribute("href", "https://example.com/a11y");
  });

  test("does not render a compliance link when complianceUrl is omitted", async () => {
    const user = userEvent.setup();
    render(<AccessibilityControl language="en" />);
    await user.click(
      screen.getByRole("button", { name: "Accessibility options" }),
    );
    expect(
      screen.queryByRole("link", {
        name: "Accessibility: compliance statement",
      }),
    ).not.toBeInTheDocument();
  });
});
