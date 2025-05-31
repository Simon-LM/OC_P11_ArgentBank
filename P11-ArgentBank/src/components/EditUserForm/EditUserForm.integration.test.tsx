/** @format */

/**
 * Tests d'intégration pour le composant EditUserForm
 *
 * Ces tests couvrent la validation des formulaires,
 * les interactions utilisateur complexes et l'accessibilité.
 */

import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { axe } from "jest-axe";
import EditUserForm from "./EditUserForm";
import "../../../Axe/utils/axe-setup.js";

describe("EditUserForm - Tests d'intégration", () => {
  const mockUser = {
    firstName: "Tony",
    lastName: "Stark",
    userName: "IronMan",
  };

  const mockOnSave = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("calls onSave with form data when submitted with valid data", async () => {
    render(
      <EditUserForm
        currentUser={mockUser}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />,
    );

    const userNameInput = screen.getByLabelText(/User Name/i);
    fireEvent.change(userNameInput, { target: { value: "NewIronMan" } });

    const form = screen.getByRole("form");
    fireEvent.submit(form);

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith({
        userName: "NewIronMan",
        firstName: "Tony",
        lastName: "Stark",
      });
    });
  });

  test("affiche une erreur quand le userName est vide", async () => {
    render(
      <EditUserForm
        currentUser={mockUser}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />,
    );

    const userNameInput = screen.getByLabelText(/User Name/i);
    fireEvent.change(userNameInput, { target: { value: "" } });

    const form = screen.getByRole("form");
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText("User name is required")).toBeInTheDocument();
      expect(mockOnSave).not.toHaveBeenCalled();
    });
  });

  test("affiche une erreur quand le userName contient uniquement des espaces", async () => {
    render(
      <EditUserForm
        currentUser={mockUser}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />,
    );

    const userNameInput = screen.getByLabelText(/User Name/i);
    fireEvent.change(userNameInput, { target: { value: "   " } });

    const form = screen.getByRole("form");
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText("User name cannot be empty")).toBeInTheDocument();
      expect(mockOnSave).not.toHaveBeenCalled();
    });
  });

  test("has no accessibility violations", async () => {
    const { container } = render(
      <EditUserForm
        currentUser={mockUser}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
