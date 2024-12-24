/** @format */

import { describe, test, expect, vi } from "vitest";
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
			/>
		);

		expect(screen.getByLabelText(/User Name/i)).toHaveValue("IronMan");
		expect(screen.getByLabelText(/First Name/i)).toHaveValue("Tony");
		expect(screen.getByLabelText(/Last Name/i)).toHaveValue("Stark");
	});

	test("calls onSave with form data when submitted with valid data", async () => {
		render(
			<EditUserForm
				currentUser={mockUser}
				onSave={mockOnSave}
				onCancel={mockOnCancel}
			/>
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
			/>
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
			/>
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

	test("appelle onCancel quand le bouton Cancel est cliqué", () => {
		render(
			<EditUserForm
				currentUser={mockUser}
				onSave={mockOnSave}
				onCancel={mockOnCancel}
			/>
		);

		fireEvent.click(screen.getByText("Cancel"));
		expect(mockOnCancel).toHaveBeenCalled();
	});

	test("valide que les champs firstName et lastName sont en lecture seule", () => {
		render(
			<EditUserForm
				currentUser={mockUser}
				onSave={mockOnSave}
				onCancel={mockOnCancel}
			/>
		);

		const firstNameInput = screen.getByLabelText(/First Name/i);
		const lastNameInput = screen.getByLabelText(/Last Name/i);

		expect(firstNameInput).toHaveAttribute("readOnly");
		expect(lastNameInput).toHaveAttribute("readOnly");
	});
});
