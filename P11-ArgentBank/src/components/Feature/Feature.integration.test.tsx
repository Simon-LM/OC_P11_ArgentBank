/** @format */

/**
 * Tests d'intégration pour Feature
 *
 * Scope d'intégration :
 * - Gestion d'erreurs des images (fireEvent.error)
 * - Tests d'interactions utilisateur
 */

import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Feature from "./Feature";

describe("Feature - Integration Tests", () => {
  const mockProps = {
    iconClass: "feature-icon--chat",
    iconLabel: "Chat icon representing 24/7 customer service",
    title: "You are our #1 priority",
    description:
      "Need to talk to a representative? You can get in touch through our 24/7 chat or through a phone call in less than 5 minutes.",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("shows fallback text if image fails to load", () => {
    render(<Feature {...mockProps} />);
    const img = document.querySelector(".feature-icon__img");
    expect(img).not.toBeNull();
    if (img) {
      fireEvent.error(img);
    }
    expect(screen.getByText(mockProps.iconLabel)).toBeVisible();
  });
});
