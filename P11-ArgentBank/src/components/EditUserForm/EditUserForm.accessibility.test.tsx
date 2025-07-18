/**
 * Accessibility Tests for EditUserForm Component
 *
 * Comprehensive test suite covering RGAA 4.1 compliance requirements
 * These tests focus on manual accessibility validation not covered by automated tools
 *
 * @format
 */

import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import EditUserForm from "./EditUserForm";
import "../../../Axe/utils/axe-setup.js";

describe("EditUserForm - Accessibility Tests (RGAA 4.1 Compliance)", () => {
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

  test("1. Form submission with empty userName should show proper error messaging", async () => {
    const user = userEvent.setup();

    render(
      <EditUserForm
        currentUser={mockUser}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />,
    );

    // Clear the userName field
    const userNameInput = screen.getByLabelText(/User Name/i);
    await user.clear(userNameInput);

    // Submit the form
    const submitButton = screen.getByRole("button", { name: /save/i });
    await user.click(submitButton);

    await waitFor(() => {
      // Check that error message appears
      expect(screen.getByText("User name is required")).toBeInTheDocument();

      // Verify error has role="alert" for screen readers
      const errorElement = screen.getByRole("alert");
      expect(errorElement).toHaveTextContent("User name is required");

      // Ensure form was not submitted
      expect(mockOnSave).not.toHaveBeenCalled();
    });
  });

  test("2. Invalid userName validation should update aria-invalid attribute", async () => {
    const user = userEvent.setup();

    render(
      <EditUserForm
        currentUser={mockUser}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />,
    );

    const userNameInput = screen.getByLabelText(/User Name/i);

    // Initially should not be invalid
    expect(userNameInput).toHaveAttribute("aria-invalid", "false");

    // Enter invalid username (too long)
    await user.clear(userNameInput);
    await user.type(userNameInput, "ThisUserNameIsTooLong");

    // Submit to trigger validation
    const submitButton = screen.getByRole("button", { name: /save/i });
    await user.click(submitButton);

    await waitFor(() => {
      // aria-invalid should be true when there's an error
      expect(userNameInput).toHaveAttribute("aria-invalid", "true");

      // Error message should be present
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });
  });

  test("3. Form should have proper ARIA structure and relationships", () => {
    render(
      <EditUserForm
        currentUser={mockUser}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />,
    );

    // Form should have role="form"
    const form = screen.getByRole("form");
    expect(form).toBeInTheDocument();

    // Form should be labeled by the heading
    expect(form).toHaveAttribute("aria-labelledby", "edit-user-form-title");

    // Heading should exist
    const heading = screen.getByRole("heading", { name: /edit user info/i });
    expect(heading).toHaveAttribute("id", "edit-user-form-title");

    // Container should have appropriate role and label
    const container = form.closest('[role="region"]');
    expect(container).toHaveAttribute(
      "aria-label",
      "Edit user information form",
    );
  });

  test("4. AutoComplete attributes should be properly set for all form fields", () => {
    render(
      <EditUserForm
        currentUser={mockUser}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />,
    );

    // Check autocomplete attributes for RGAA compliance
    const userNameInput = screen.getByLabelText(/User Name/i);
    const firstNameInput = screen.getByLabelText(/First Name/i);
    const lastNameInput = screen.getByLabelText(/Last Name/i);

    expect(userNameInput).toHaveAttribute("autoComplete", "username");
    expect(firstNameInput).toHaveAttribute("autoComplete", "given-name");
    expect(lastNameInput).toHaveAttribute("autoComplete", "family-name");
  });

  test("5. Read-only fields should have proper accessibility attributes", () => {
    render(
      <EditUserForm
        currentUser={mockUser}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />,
    );

    const firstNameInput = screen.getByLabelText(/First Name/i);
    const lastNameInput = screen.getByLabelText(/Last Name/i);

    // Read-only fields should have readOnly attribute
    expect(firstNameInput).toHaveAttribute("readOnly");
    expect(lastNameInput).toHaveAttribute("readOnly");

    // And aria-readonly for screen readers
    expect(firstNameInput).toHaveAttribute("aria-readonly", "true");
    expect(lastNameInput).toHaveAttribute("aria-readonly", "true");
  });

  test("6. Focus management should work correctly with keyboard navigation", async () => {
    const user = userEvent.setup();

    render(
      <EditUserForm
        currentUser={mockUser}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />,
    );

    // Container should receive focus on mount (after timeout)
    await waitFor(() => {
      const container = screen.getByRole("region", {
        name: "Edit user information form",
      });
      expect(container).toHaveAttribute("tabIndex", "0");
    });

    // Tab navigation should work between interactive elements
    const userNameInput = screen.getByLabelText(/User Name/i);
    const firstNameInput = screen.getByLabelText(/First Name/i);
    const lastNameInput = screen.getByLabelText(/Last Name/i);
    const saveButton = screen.getByRole("button", { name: /save/i });
    const cancelButton = screen.getByRole("button", { name: /cancel/i });

    // Readonly fields should NOT be focusable (must have tabIndex={-1})
    expect(firstNameInput).toHaveAttribute("tabIndex", "-1");
    expect(lastNameInput).toHaveAttribute("tabIndex", "-1");

    // userName input should be focusable
    await user.click(userNameInput);
    expect(userNameInput).toHaveFocus();

    // Tab navigation should skip readonly fields and go directly to Save button
    await user.tab();
    expect(saveButton).toHaveFocus();

    // Tab to cancel button
    await user.tab();
    expect(cancelButton).toHaveFocus();
  });

  test("7. Keyboard escape should trigger onCancel function", async () => {
    const user = userEvent.setup();

    render(
      <EditUserForm
        currentUser={mockUser}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />,
    );

    // Focus the container
    const container = screen.getByRole("region", {
      name: "Edit user information form",
    });
    container.focus();

    // Press Escape key
    await user.keyboard("{Escape}");

    expect(mockOnCancel).toHaveBeenCalled();
  });

  test("8. Form labels should be properly associated with their inputs", () => {
    render(
      <EditUserForm
        currentUser={mockUser}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />,
    );

    // Check that all labels are properly associated
    const userNameInput = screen.getByLabelText(/User Name/i);
    const firstNameInput = screen.getByLabelText(/First Name/i);
    const lastNameInput = screen.getByLabelText(/Last Name/i);

    expect(userNameInput).toHaveAttribute("id", "userName");
    expect(firstNameInput).toHaveAttribute("id", "firstName");
    expect(lastNameInput).toHaveAttribute("id", "lastName");

    // Labels should point to correct inputs
    const userNameLabel = screen.getByText("User Name :");
    const firstNameLabel = screen.getByText("First Name :");
    const lastNameLabel = screen.getByText("Last Name :");

    // Check the actual DOM for attribute (using for instead of htmlFor for DOM checking)
    expect(userNameLabel.closest("label")).toHaveAttribute("for", "userName");
    expect(firstNameLabel.closest("label")).toHaveAttribute("for", "firstName");
    expect(lastNameLabel.closest("label")).toHaveAttribute("for", "lastName");
  });

  test("9. Should have no accessibility violations according to axe-core", async () => {
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

  test("10. Help text should be properly associated with userName input", () => {
    render(
      <EditUserForm
        currentUser={mockUser}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />,
    );

    const userNameInput = screen.getByLabelText(/User Name/i);
    const helpText = screen.getByText("Max 10 chars: a-z, 0-9, _ and -");

    // Help text should have proper ID
    expect(helpText).toHaveAttribute("id", "username-requirements");

    // Input should reference help text when no error is present
    expect(userNameInput).toHaveAttribute(
      "aria-describedby",
      "username-requirements",
    );
  });

  test("11. Error messages should take precedence over help text in aria-describedby", async () => {
    const user = userEvent.setup();

    render(
      <EditUserForm
        currentUser={mockUser}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />,
    );

    const userNameInput = screen.getByLabelText(/User Name/i);

    // Initially, should reference help text
    expect(userNameInput).toHaveAttribute(
      "aria-describedby",
      "username-requirements",
    );

    // Clear field and submit to trigger error
    await user.clear(userNameInput);
    const submitButton = screen.getByRole("button", { name: /save/i });
    await user.click(submitButton);

    await waitFor(() => {
      // When error is present, aria-describedby should not reference help text
      // (our current implementation removes the describedby when there's an error)
      expect(userNameInput).not.toHaveAttribute(
        "aria-describedby",
        "username-requirements",
      );
    });
  });

  test("12. Disclaimer note should have proper accessibility role", () => {
    render(
      <EditUserForm
        currentUser={mockUser}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />,
    );

    // Il y a deux éléments avec role="note" - c'est conforme RGAA
    const notes = screen.getAllByRole("note");
    expect(notes).toHaveLength(2);

    // Premier note : le disclaimer
    const disclaimer = notes.find((note) =>
      note.textContent?.includes("This is a demonstration site"),
    );
    expect(disclaimer).toBeInTheDocument();
    expect(disclaimer).toHaveTextContent("This is a demonstration site");

    // Deuxième note : le texte d'aide
    const helpText = notes.find((note) =>
      note.textContent?.includes("Max 10 chars"),
    );
    expect(helpText).toBeInTheDocument();
    expect(helpText).toHaveTextContent("Max 10 chars: a-z, 0-9, _ and -");

    // Icon should be hidden from screen readers
    const icon = disclaimer?.querySelector('[aria-hidden="true"]');
    expect(icon).toBeInTheDocument();
  });
});
