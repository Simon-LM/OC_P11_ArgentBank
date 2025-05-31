/** @format */

/**
 * Tests d'intégration pour Home
 *
 * Scope d'intégration :
 * - Lazy loading avec Intersection Observer
 * - Gestion d'erreurs des images (fireEvent)
 * - Tests d'accessibilité avec axe-core
 * - Interactions asynchrones avec waitFor
 */

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { axe } from "jest-axe";
import Home from "./Home";
import { vi, describe, test, expect } from "vitest";
import "../../../Axe/utils/axe-setup.js";

// Mock Intersection Observer for lazy loading
vi.mock("react-intersection-observer", () => ({
  useInView: () => ({ ref: () => {}, inView: true }),
}));

// Mock Features to avoid actual lazy loading in this test
vi.mock("../../components/Features/Features", () => ({
  __esModule: true,
  default: () => <div data-testid="features-component">Features Content</div>,
}));

describe("Home - Integration Tests", () => {
  test("renders Features when in view (lazy loaded)", async () => {
    render(<Home />);
    await waitFor(() => {
      expect(screen.getByTestId("features-component")).toBeInTheDocument();
    });
  });

  test("shows description if hero image fails to load", () => {
    render(<Home />);
    const img = document.querySelector(".hero__image");
    expect(img).not.toBeNull();
    if (img) {
      fireEvent.error(img);
    }
    const description = screen.getByText(
      /A young tree sprout growing in a glass jar filled with coins/,
    );
    expect(description).toHaveClass("visible");
    expect(description).not.toHaveClass("hidden");
  });

  test("image description has correct visibility when image loads successfully", async () => {
    render(<Home />);
    const img = document.querySelector(".hero__image");
    expect(img).not.toBeNull();
    if (img) {
      fireEvent.load(img);
    }

    // Attendre que le style de la description soit mis à jour
    await waitFor(() => {
      const description = screen.getByText(
        /A young tree sprout growing in a glass jar filled with coins/,
      );
      expect(description).toHaveClass("hidden");
      expect(description).not.toHaveClass("visible");
    });
  });

  test("has no accessibility violations", async () => {
    const { container } = render(<Home />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
