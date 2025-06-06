/** @format */

import { render, screen } from "@testing-library/react";
import Home from "./Home";
import { vi, describe, test, expect } from "vitest";

// Mock Intersection Observer for lazy loading
vi.mock("react-intersection-observer", () => ({
  useInView: () => ({ ref: () => {}, inView: false }),
}));

// Mock Features to avoid actual lazy loading in this test
vi.mock("../../components/Features/Features", () => ({
  __esModule: true,
  default: () => <div data-testid="features-component">Features Content</div>,
}));

describe("Home Component", () => {
  test("renders hero section with correct content and image description", () => {
    render(<Home />);
    expect(
      screen.getByText(
        /A young tree sprout growing in a glass jar filled with coins/,
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("No fees.")).toBeInTheDocument();
    expect(screen.getByText("No minimum deposit.")).toBeInTheDocument();
    expect(screen.getByText("High interest rates.")).toBeInTheDocument();
    expect(
      screen.getByText("Open a savings account with Argent Bank today!"),
    ).toBeInTheDocument();
  });

  test("hero image uses modern image formats and responsive sizes", () => {
    render(<Home />);
    const sources = document.querySelectorAll("source");

    expect(sources[0]).toHaveAttribute("type", "image/avif");
    expect(sources[0]).toHaveAttribute("media", "(max-width: 640px)");
    expect(sources[0]).toHaveAttribute("srcSet", "/img/bank-tree-640w.avif");

    expect(sources[1]).toHaveAttribute("type", "image/avif");
    expect(sources[1]).toHaveAttribute("media", "(max-width: 1024px)");
    expect(sources[1]).toHaveAttribute("srcSet", "/img/bank-tree-1024w.avif");

    expect(sources[2]).toHaveAttribute("type", "image/avif");
    expect(sources[2]).toHaveAttribute("srcSet", "/img/bank-tree.avif");

    expect(sources[3]).toHaveAttribute("type", "image/webp");
    expect(sources[3]).toHaveAttribute("media", "(max-width: 640px)");
    expect(sources[3]).toHaveAttribute("srcSet", "/img/bank-tree-640w.webp");

    expect(sources[4]).toHaveAttribute("type", "image/webp");
    expect(sources[4]).toHaveAttribute("media", "(max-width: 1024px)");
    expect(sources[4]).toHaveAttribute("srcSet", "/img/bank-tree-1024w.webp");

    expect(sources[5]).toHaveAttribute("type", "image/webp");
    expect(sources[5]).toHaveAttribute("srcSet", "/img/bank-tree.webp");

    const img = document.querySelector(".hero__image");
    expect(img).toHaveAttribute("src", "/img/bank-tree.jpg");
    expect(img).toHaveAttribute("width", "1440");
    expect(img).toHaveAttribute("height", "400");
    expect(img).toHaveAttribute("fetchPriority", "high");
    expect(img).toHaveAttribute("loading", "eager");
    expect(img).toHaveAttribute(
      "srcSet",
      "/img/bank-tree-640w.jpg 640w, /img/bank-tree-1024w.jpg 1024w, /img/bank-tree.jpg 1440w",
    );
    expect(img).toHaveAttribute(
      "sizes",
      "(max-width: 640px) 640px, (max-width: 1024px) 1024px, 1440px",
    );
  });
});
