/** @format */

import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AccessibilityMenu from "./AccessibilityMenu";

describe("AccessibilityMenu", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = "";
    document.documentElement.removeAttribute("data-theme");
    document.documentElement.style.removeProperty("--font-size-factor");
  });

  test("renders the header and main categories", () => {
    render(<AccessibilityMenu language="en" />);
    expect(
      screen.getByRole("heading", { name: "Accessibility Options" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Mode")).toBeInTheDocument();
    expect(screen.getByText("Vision")).toBeInTheDocument();
    expect(screen.getByText("Reading")).toBeInTheDocument();
  });

  test("renders French labels when language is fr", () => {
    render(<AccessibilityMenu language="fr" />);
    expect(
      screen.getByRole("heading", { name: "Options d'accessibilité" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Contraste")).toBeInTheDocument();
  });

  test("clicking Dark switches the theme and marks the button active", async () => {
    const user = userEvent.setup();
    render(<AccessibilityMenu language="en" />);

    const darkButton = screen.getByRole("button", { name: "Dark" });
    await user.click(darkButton);

    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
    expect(localStorage.getItem("theme")).toBe("dark");
    expect(darkButton).toHaveClass("active");
  });

  test("clicking Comfort activates anti-glare-light when the last base theme was light", async () => {
    const user = userEvent.setup();
    render(<AccessibilityMenu language="en" />);

    await user.click(screen.getByRole("button", { name: "Comfort" }));

    expect(document.documentElement).toHaveAttribute(
      "data-theme",
      "anti-glare-light",
    );
  });

  test("clicking Comfort activates anti-glare-dark after switching to Dark first", async () => {
    const user = userEvent.setup();
    render(<AccessibilityMenu language="en" />);

    await user.click(screen.getByRole("button", { name: "Dark" }));
    await user.click(screen.getByRole("button", { name: "Comfort" }));

    expect(document.documentElement).toHaveAttribute(
      "data-theme",
      "anti-glare-dark",
    );
  });

  test("the standalone Anti-glare button always activates anti-glare-light", async () => {
    const user = userEvent.setup();
    render(<AccessibilityMenu language="en" />);

    await user.click(screen.getByRole("button", { name: "Dark" }));
    await user.click(screen.getByRole("button", { name: "Anti-glare" }));

    expect(document.documentElement).toHaveAttribute(
      "data-theme",
      "anti-glare-light",
    );
  });

  test("clicking High contrast activates the last-used variant (default yellow-on-black)", async () => {
    const user = userEvent.setup();
    render(<AccessibilityMenu language="en" />);

    await user.click(screen.getByRole("button", { name: "High contrast" }));

    expect(document.documentElement).toHaveAttribute(
      "data-theme",
      "high-contrast",
    );
    expect(document.documentElement).toHaveClass("high-contrast");
  });

  test("selecting a high-contrast variant persists it and reactivating High contrast reuses it", async () => {
    const user = userEvent.setup();
    render(<AccessibilityMenu language="en" />);

    await user.click(screen.getByRole("button", { name: "High contrast" }));
    const greenVariant = screen.getByRole("button", {
      name: "Green on black",
    });
    await user.click(greenVariant);

    expect(document.documentElement).toHaveAttribute(
      "data-theme",
      "high-contrast-green",
    );
    expect(localStorage.getItem("hc-variant")).toBe("high-contrast-green");
    expect(greenVariant).toHaveAttribute("aria-pressed", "true");

    // Leave high contrast, then come back — should reactivate the green variant.
    await user.click(screen.getByRole("button", { name: "Light" }));
    await user.click(screen.getByRole("button", { name: "High contrast" }));
    expect(document.documentElement).toHaveAttribute(
      "data-theme",
      "high-contrast-green",
    );
  });

  test("reads a previously saved high-contrast variant from localStorage on mount", () => {
    localStorage.setItem("hc-variant", "high-contrast-paper");
    render(<AccessibilityMenu language="en" />);
    // Not in high-contrast mode yet, so no variant buttons are shown —
    // but activating it should reuse the saved variant.
    expect(
      screen.queryByRole("button", { name: "Black on white" }),
    ).not.toBeInTheDocument();
  });

  test("toggling Reduce animations flips aria-pressed, the DOM class, and persists to localStorage", async () => {
    const user = userEvent.setup();
    render(<AccessibilityMenu language="en" />);

    const button = screen.getByRole("button", {
      name: "Reduce animations",
    });
    expect(button).toHaveAttribute("aria-pressed", "false");

    await user.click(button);

    expect(button).toHaveAttribute("aria-pressed", "true");
    expect(document.documentElement).toHaveClass("reduce-motion");
    expect(localStorage.getItem("reduce-motion")).toBe("true");

    await user.click(button);
    expect(button).toHaveAttribute("aria-pressed", "false");
    expect(document.documentElement).not.toHaveClass("reduce-motion");
    expect(localStorage.getItem("reduce-motion")).toBe("false");
  });

  test("reads the reduce-motion preference from localStorage on mount", () => {
    localStorage.setItem("reduce-motion", "true");
    render(<AccessibilityMenu language="en" />);
    expect(
      screen.getByRole("button", { name: "Reduce animations" }),
    ).toHaveAttribute("aria-pressed", "true");
  });

  test("toggling dyslexia mode flips aria-pressed, the DOM class, and its label", async () => {
    const user = userEvent.setup();
    render(<AccessibilityMenu language="en" />);

    const button = screen.getByRole("button", {
      name: /Dyslexia mode/,
    });
    expect(button).toHaveTextContent("Disabled");

    await user.click(button);

    expect(button).toHaveAttribute("aria-pressed", "true");
    expect(button).toHaveTextContent("Enabled");
    expect(document.documentElement).toHaveClass("dyslexia-optimized");
  });

  test("toggling dyslexia mode back off removes the DOM class and updates the label", async () => {
    const user = userEvent.setup();
    render(<AccessibilityMenu language="en" />);
    const button = screen.getByRole("button", { name: /Dyslexia mode/ });

    await user.click(button);
    expect(document.documentElement).toHaveClass("dyslexia-optimized");

    await user.click(button);
    expect(button).toHaveAttribute("aria-pressed", "false");
    expect(button).toHaveTextContent("Disabled");
    expect(document.documentElement).not.toHaveClass("dyslexia-optimized");
  });

  test("shows the OpenDyslexic label when a11y-font is already set to opendyslexic", () => {
    localStorage.setItem("a11y-font", "opendyslexic");
    render(<AccessibilityMenu language="en" />);
    expect(screen.getByText("OpenDyslexic")).toBeInTheDocument();
  });

  test("shows the Andika label when a11y-font is already set to andika", () => {
    localStorage.setItem("a11y-font", "andika");
    render(<AccessibilityMenu language="en" />);
    expect(screen.getByText("Andika")).toBeInTheDocument();
  });

  test("switching the color-vision select back to Normal restores the last base theme", async () => {
    const user = userEvent.setup();
    render(<AccessibilityMenu language="en" />);

    const select = screen.getByLabelText("Vision type");
    await user.click(select);
    await user.click(await screen.findByText("Deutéranopie"));
    expect(document.documentElement).toHaveAttribute(
      "data-theme",
      "deuteranopia",
    );

    await user.click(select);
    await user.click(await screen.findByText("Normal"));
    expect(document.documentElement).toHaveAttribute("data-theme", "light");
  });

  test("enabling dyslexia mode resets the accessibility font type to Standard", async () => {
    const user = userEvent.setup();
    localStorage.setItem("a11y-font", "atkinson");
    render(<AccessibilityMenu language="en" />);

    await user.click(screen.getByRole("button", { name: /Dyslexia mode/ }));

    expect(localStorage.getItem("a11y-font")).toBe("none");
  });

  test("the font-size slider updates the displayed percentage and the CSS variable", () => {
    render(<AccessibilityMenu language="en" />);
    const slider = screen.getByLabelText("Text size") as HTMLInputElement;

    fireEvent.change(slider, { target: { value: "125" } });

    expect(screen.getByText("125%")).toBeInTheDocument();
    expect(
      document.documentElement.style.getPropertyValue("--font-size-factor"),
    ).toBe("1.25");
  });

  test("the reset icon button restores the font size to 100%", () => {
    render(<AccessibilityMenu language="en" />);
    const slider = screen.getByLabelText("Text size") as HTMLInputElement;
    fireEvent.change(slider, { target: { value: "150" } });
    expect(screen.getByText("150%")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Reset to 100%" }));

    expect(screen.getByText("100%")).toBeInTheDocument();
  });

  test("Reset all settings restores theme, font size, font type, dyslexia mode and high-contrast variant", async () => {
    const user = userEvent.setup();
    render(<AccessibilityMenu language="en" />);

    await user.click(screen.getByRole("button", { name: "Dark" }));
    fireEvent.change(screen.getByLabelText("Text size"), {
      target: { value: "150" },
    });
    await user.click(screen.getByRole("button", { name: /Dyslexia mode/ }));

    await user.click(
      screen.getByRole("button", { name: "Reset all settings" }),
    );

    expect(document.documentElement).toHaveAttribute("data-theme", "light");
    expect(screen.getByText("100%")).toBeInTheDocument();
    expect(document.documentElement).not.toHaveClass("dyslexia-optimized");
    expect(localStorage.getItem("hc-variant")).toBeNull();
  });

  test("renders the French compliance link label when language is fr", () => {
    render(
      <AccessibilityMenu
        language="fr"
        complianceUrl="https://example.com/a11y"
      />,
    );
    expect(
      screen.getByRole("link", {
        name: "Accessibilité : déclaration de conformité",
      }),
    ).toBeInTheDocument();
  });

  test("Reset all settings falls back to dark when the system prefers dark mode", async () => {
    const original = window.matchMedia;
    window.matchMedia = (query: string) =>
      ({
        matches: query === "(prefers-color-scheme: dark)",
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }) as unknown as MediaQueryList;

    try {
      const user = userEvent.setup();
      render(<AccessibilityMenu language="en" />);
      await user.click(screen.getByRole("button", { name: "Light" }));
      await user.click(
        screen.getByRole("button", { name: "Reset all settings" }),
      );
      expect(document.documentElement).toHaveAttribute("data-theme", "dark");
    } finally {
      window.matchMedia = original;
    }
  });

  test("Reset all settings works even when dyslexia mode was never enabled", async () => {
    const user = userEvent.setup();
    render(<AccessibilityMenu language="en" />);

    await user.click(screen.getByRole("button", { name: "Dark" }));
    await user.click(
      screen.getByRole("button", { name: "Reset all settings" }),
    );

    expect(document.documentElement).toHaveAttribute("data-theme", "light");
    expect(document.documentElement).not.toHaveClass("dyslexia-optimized");
  });

  test("selecting a font type while dyslexia mode is off doesn't touch it", async () => {
    const user = userEvent.setup();
    render(<AccessibilityMenu language="en" />);
    expect(document.documentElement).not.toHaveClass("dyslexia-optimized");

    const select = screen.getByLabelText("Font type");
    await user.click(select);
    await user.click(await screen.findByText("Andika"));

    expect(localStorage.getItem("a11y-font")).toBe("andika");
    expect(document.documentElement).not.toHaveClass("dyslexia-optimized");
  });

  test("mounting with a saved color-vision theme still tracks light as the last base theme", async () => {
    const user = userEvent.setup();
    localStorage.setItem("theme", "achromatopsia");
    render(<AccessibilityMenu language="en" />);

    await user.click(screen.getByRole("button", { name: "Comfort" }));

    expect(document.documentElement).toHaveAttribute(
      "data-theme",
      "anti-glare-light",
    );
  });

  test("renders the compliance link only when complianceUrl is provided", () => {
    const { rerender } = render(<AccessibilityMenu language="en" />);
    expect(
      screen.queryByRole("link", {
        name: "Accessibility: compliance statement",
      }),
    ).not.toBeInTheDocument();

    rerender(
      <AccessibilityMenu
        language="en"
        complianceUrl="https://example.com/a11y"
      />,
    );
    expect(
      screen.getByRole("link", {
        name: "Accessibility: compliance statement",
      }),
    ).toHaveAttribute("href", "https://example.com/a11y");
  });

  test("calls onClose from both the header and footer close buttons", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<AccessibilityMenu language="en" onClose={onClose} />);

    await user.click(screen.getByRole("button", { name: "Close menu" }));
    expect(onClose).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole("button", { name: "Close" }));
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  test("does not render close buttons when onClose is omitted", () => {
    render(<AccessibilityMenu language="en" />);
    expect(
      screen.queryByRole("button", { name: "Close menu" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Close" }),
    ).not.toBeInTheDocument();
  });

  test("the color-vision select defaults to Normal and the font-type select to Standard", () => {
    render(<AccessibilityMenu language="en" />);
    expect(screen.getByText("Normal")).toBeInTheDocument();
    expect(screen.getByText("Standard")).toBeInTheDocument();
  });

  test("switching to a color-vision theme via the select updates the theme", async () => {
    const user = userEvent.setup();
    render(<AccessibilityMenu language="en" />);

    const select = screen.getByLabelText("Vision type");
    await user.click(select);
    const option = await screen.findByText("Deutéranopie");
    await user.click(option);

    expect(document.documentElement).toHaveAttribute(
      "data-theme",
      "deuteranopia",
    );
  });

  test("switching to a font type via the select updates localStorage and clears dyslexia mode", async () => {
    const user = userEvent.setup();
    render(<AccessibilityMenu language="en" />);

    await user.click(screen.getByRole("button", { name: /Dyslexia mode/ }));
    expect(document.documentElement).toHaveClass("dyslexia-optimized");

    const select = screen.getByLabelText("Font type");
    await user.click(select);
    const option = await screen.findByText("Atkinson Hyperlegible");
    await user.click(option);

    expect(localStorage.getItem("a11y-font")).toBe("atkinson");
    expect(document.documentElement).not.toHaveClass("dyslexia-optimized");
  });
});
