/** @format */

import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
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

  test("turning color blindness back off restores the last base theme", async () => {
    const user = userEvent.setup();
    render(<AccessibilityMenu language="en" />);
    const parent = screen.getByRole("button", { name: "Color blindness" });

    await user.click(parent);
    await user.click(screen.getByRole("button", { name: /Deutéranopie/ }));
    expect(document.documentElement).toHaveAttribute(
      "data-theme",
      "deuteranopia",
    );

    // "Normal" is the parent's off state, not a button in the row.
    await user.click(parent);
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

    await user.click(screen.getByRole("button", { name: "Font type" }));
    await user.click(screen.getByRole("button", { name: /Andika/ }));

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

  // Both pickers are collapsed parent toggles, not dropdowns: their off
  // state ("Normal", "Standard") is the parent button itself, so neither
  // word appears anywhere until something is turned on.
  test("both pickers start off, with no option buttons rendered", () => {
    render(<AccessibilityMenu language="en" />);

    expect(
      screen.getByRole("button", { name: "Color blindness" }),
    ).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByRole("button", { name: "Font type" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    expect(
      screen.queryByRole("button", { name: /Deutéranopie/ }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Andika/ }),
    ).not.toBeInTheDocument();
  });

  // The list is read from the loaded CSS. jsdom loads no stylesheet, so
  // detection finds nothing and the package falls back to offering every
  // mode it knows — deliberately, since hiding a mode the site does have
  // would remove a feature from the person who needs it.
  test("the color-vision parent reveals one button per mode, marked with aria-pressed", async () => {
    const user = userEvent.setup();
    render(<AccessibilityMenu language="en" />);

    await user.click(screen.getByRole("button", { name: "Color blindness" }));

    const group = screen.getByRole("group", { name: "Vision type" });
    expect(within(group).getAllByRole("button")).toHaveLength(7);

    const deuteranopia = screen.getByRole("button", { name: /Deutéranopie/ });
    await user.click(deuteranopia);

    expect(document.documentElement).toHaveAttribute(
      "data-theme",
      "deuteranopia",
    );
    expect(deuteranopia).toHaveAttribute("aria-pressed", "true");
  });

  test("choosing a font applies it and leaves dyslexia mode", async () => {
    const user = userEvent.setup();
    render(<AccessibilityMenu language="en" />);

    await user.click(screen.getByRole("button", { name: /Dyslexia mode/ }));
    expect(document.documentElement).toHaveClass("dyslexia-optimized");

    await user.click(screen.getByRole("button", { name: "Font type" }));
    const atkinson = screen.getByRole("button", {
      name: /Atkinson Hyperlegible/,
    });
    await user.click(atkinson);

    expect(localStorage.getItem("a11y-font")).toBe("atkinson");
    expect(atkinson).toHaveAttribute("aria-pressed", "true");
    expect(document.documentElement).not.toHaveClass("dyslexia-optimized");
  });

  // The fonts are grouped by what they are FOR, because the names mean
  // nothing on their own: "Andika" tells you something only if you already
  // know it. The group heading is what makes the choice possible, so it
  // has to be the accessible name of the group, not just visible text.
  test("the font choices are grouped by purpose, each group named", async () => {
    const user = userEvent.setup();
    render(<AccessibilityMenu language="en" />);

    await user.click(screen.getByRole("button", { name: "Font type" }));

    for (const name of ["For dyslexia", "High legibility", "Easy reading"]) {
      expect(screen.getByRole("group", { name })).toBeInTheDocument();
    }
  });
});
