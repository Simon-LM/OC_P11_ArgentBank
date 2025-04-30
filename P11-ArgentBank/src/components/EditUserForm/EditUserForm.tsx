/** @format */

import React from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Label } from "@radix-ui/react-label";
import editUserForm from "./editUserForm.module.scss";
import { usernameBlacklist } from "../../utils/blacklist";

const schema = z.object({
	userName: z
		.string()
		.nonempty("User name is required")
		.max(10, "User name cannot exceed 10 characters")
		.refine((val) => val.trim() !== "", "User name cannot be empty")
		.refine(
			(val) => /^[a-zA-Z0-9_-]+$/.test(val),
			"Only letters, numbers, underscore and hyphen are allowed"
		)
		.refine((val) => {
			const regex = new RegExp(usernameBlacklist.join("|"), "i");
			return !regex.test(val);
		}, "Username contains inappropriate words or terms"),

	firstName: z.string().nonempty("First name is required"),
	lastName: z.string().nonempty("Last name is required"),
});

type FormData = z.infer<typeof schema>;

interface EditUserFormProps {
	currentUser: {
		firstName: string;
		lastName: string;
		userName?: string;
	};
	onSave: (data: FormData) => void;
	onCancel: () => void;
}

const EditUserForm: React.FC<EditUserFormProps> = ({
	currentUser,
	onSave,
	onCancel,
}) => {
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<FormData>({
		resolver: zodResolver(schema),
		defaultValues: {
			userName: currentUser.userName ?? "",
			firstName: currentUser.firstName,
			lastName: currentUser.lastName,
		},
	});

	const handleSave = async (data: FormData) => {
		// Ne faites pas de retour manuel ici :
		// if (!data.userName.trim()) { return false; }
		onSave(data);
	};

	return (
		<div className={editUserForm["edit-user-form__container"]}>
			<h2>Edit user info</h2>

			<div className={editUserForm["edit-user-form__disclaimer-box"]}>
				<p className={editUserForm["edit-user-form__disclaimer"]}>
					<strong>Note:</strong> This is a demonstration site. Any username you
					set will be visible to other visitors.
				</p>
			</div>

			<form
				className={editUserForm["edit-user-form__form"]}
				onSubmit={handleSubmit(handleSave)}
				role="form">
				<div className={editUserForm["edit-user-form__input-group"]}>
					<Label
						className={editUserForm["edit-user-form__label"]}
						htmlFor="userName">
						User Name :
					</Label>
					<div className={editUserForm["edit-user-form__input-wrapper"]}>
						<input
							className={editUserForm["edit-user-form__input"]}
							id="userName"
							{...register("userName")}
							aria-invalid={errors.userName ? "true" : "false"}
						/>
						{errors.userName && (
							<p className={editUserForm["edit-user-form__error"]} role="alert">
								{errors.userName.message}
							</p>
						)}
					</div>
				</div>

				<div className={editUserForm["edit-user-form__input-group"]}>
					<Label
						className={editUserForm["edit-user-form__label"]}
						htmlFor="firstName">
						First Name :
					</Label>
					<div className={editUserForm["edit-user-form__input-wrapper"]}>
						<input
							className={`${editUserForm["edit-user-form__input"]} ${editUserForm["edit-user-form__input--readonly"]}`}
							id="firstName"
							readOnly
							{...register("firstName")}
						/>
						{errors.firstName && (
							<p className={editUserForm["edit-user-form__error"]}>
								{errors.firstName.message}
							</p>
						)}
					</div>
				</div>

				<div className={editUserForm["edit-user-form__input-group"]}>
					<Label
						className={editUserForm["edit-user-form__label"]}
						htmlFor="lastName">
						Last Name :
					</Label>
					<div className={editUserForm["edit-user-form__input-wrapper"]}>
						<input
							className={`${editUserForm["edit-user-form__input"]} ${editUserForm["edit-user-form__input--readonly"]}`}
							id="lastName"
							readOnly
							{...register("lastName")}
						/>
						{errors.lastName && (
							<p className={editUserForm["edit-user-form__error"]}>
								{errors.lastName.message}
							</p>
						)}
					</div>
				</div>

				<div className={editUserForm["edit-user-form__button-group"]}>
					<button
						className={`${editUserForm["edit-user-form__button"]} ${editUserForm["edit-user-form__button--submit"]}`}
						type="submit">
						Save
					</button>
					<button
						className={`${editUserForm["edit-user-form__button"]} ${editUserForm["edit-user-form__button--cancel"]}`}
						type="button"
						onClick={onCancel}>
						Cancel
					</button>
				</div>
			</form>
		</div>
	);
};

export default EditUserForm;
