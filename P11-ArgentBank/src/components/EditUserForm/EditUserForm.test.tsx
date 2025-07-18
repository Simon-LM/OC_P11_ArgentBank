/** @format */

import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import EditUserForm from "./EditUserForm";

describe("EditUserForm", () => {
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

  test("renders form with correct initial values", () => {
    render(
      <EditUserForm
        currentUser={mockUser}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />,
    );

    expect(screen.getByLabelText(/User Name/i)).toHaveValue("IronMan");
    expect(screen.getByLabelText(/First Name/i)).toHaveValue("Tony");
    expect(screen.getByLabelText(/Last Name/i)).toHaveValue("Stark");
  });

  test("calls onCancel when Cancel button is clicked", () => {
    render(
      <EditUserForm
        currentUser={mockUser}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />,
    );

    fireEvent.click(screen.getByText("Cancel"));
    expect(mockOnCancel).toHaveBeenCalled();
  });

  test("validates that firstName and lastName fields are read-only", () => {
    render(
      <EditUserForm
        currentUser={mockUser}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />,
    );

    const firstNameInput = screen.getByLabelText(/First Name/i);
    const lastNameInput = screen.getByLabelText(/Last Name/i);

    expect(firstNameInput).toHaveAttribute("readOnly");
    expect(lastNameInput).toHaveAttribute("readOnly");
  });
});
