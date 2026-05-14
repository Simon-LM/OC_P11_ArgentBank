/** @format */

import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
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

  test("calls onSave with valid form data", async () => {
    render(
      <EditUserForm
        currentUser={mockUser}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />,
    );

    fireEvent.change(screen.getByLabelText(/User Name/i), {
      target: { value: "WarMach" },
    });
    fireEvent.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith({
        userName: "WarMach",
        firstName: "Tony",
        lastName: "Stark",
      });
    });
  });

  test("uses an empty username as default when none is provided", () => {
    render(
      <EditUserForm
        currentUser={{ firstName: "Tony", lastName: "Stark" }}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />,
    );

    expect(screen.getByLabelText(/User Name/i)).toHaveValue("");
  });

  test("shows a validation error for an empty username", async () => {
    render(
      <EditUserForm
        currentUser={mockUser}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />,
    );

    fireEvent.change(screen.getByLabelText(/User Name/i), {
      target: { value: "" },
    });
    fireEvent.click(screen.getByRole("button", { name: /save/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /user name is required/i,
    );
    expect(mockOnSave).not.toHaveBeenCalled();
  });

  test("shows a validation error for a too long username", async () => {
    render(
      <EditUserForm
        currentUser={mockUser}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />,
    );

    fireEvent.change(screen.getByLabelText(/User Name/i), {
      target: { value: "VeryLongName" },
    });
    fireEvent.click(screen.getByRole("button", { name: /save/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /cannot exceed 10 characters/i,
    );
  });

  test("shows a validation error for unsupported username characters", async () => {
    render(
      <EditUserForm
        currentUser={mockUser}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />,
    );

    fireEvent.change(screen.getByLabelText(/User Name/i), {
      target: { value: "Bad Name" },
    });
    fireEvent.click(screen.getByRole("button", { name: /save/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /only letters, numbers, underscore and hyphen/i,
    );
  });

  test("shows a validation error for blacklisted usernames", async () => {
    render(
      <EditUserForm
        currentUser={mockUser}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />,
    );

    fireEvent.change(screen.getByLabelText(/User Name/i), {
      target: { value: "admin" },
    });
    fireEvent.click(screen.getByRole("button", { name: /save/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /inappropriate words or terms/i,
    );
  });

  test("calls onCancel when Escape is pressed on the form", () => {
    render(
      <EditUserForm
        currentUser={mockUser}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />,
    );

    fireEvent.keyDown(screen.getByRole("region"), { key: "Escape" });

    expect(mockOnCancel).toHaveBeenCalled();
  });

  test("calls onCancel and blurs username input when Escape is pressed", () => {
    render(
      <EditUserForm
        currentUser={mockUser}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />,
    );

    const usernameInput = screen.getByLabelText(/User Name/i);
    usernameInput.focus();
    fireEvent.keyDown(usernameInput, { key: "Escape" });

    expect(usernameInput).not.toHaveFocus();
    expect(mockOnCancel).toHaveBeenCalled();
  });

  test("moves focus to Save when ArrowDown is pressed at the end", () => {
    render(
      <EditUserForm
        currentUser={mockUser}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />,
    );

    const usernameInput = screen.getByLabelText(
      /User Name/i,
    ) as HTMLInputElement;
    usernameInput.focus();
    usernameInput.setSelectionRange(
      usernameInput.value.length,
      usernameInput.value.length,
    );

    fireEvent.keyDown(usernameInput, { key: "ArrowDown" });

    expect(screen.getByRole("button", { name: /save/i })).toHaveFocus();
  });

  test("moves focus to title when ArrowUp is pressed at the start", () => {
    render(
      <EditUserForm
        currentUser={mockUser}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />,
    );

    const usernameInput = screen.getByLabelText(
      /User Name/i,
    ) as HTMLInputElement;
    usernameInput.focus();
    usernameInput.setSelectionRange(0, 0);

    fireEvent.keyDown(usernameInput, { key: "ArrowUp" });

    expect(
      screen.getByRole("heading", { name: /edit user info/i }),
    ).toHaveFocus();
  });
});
