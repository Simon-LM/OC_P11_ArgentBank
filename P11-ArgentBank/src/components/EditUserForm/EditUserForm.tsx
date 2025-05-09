/** @format */

import React from "react";
import { useRef, useEffect } from "react";
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

	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const timer = setTimeout(() => {
			containerRef.current?.focus();
		}, 10);
		return () => clearTimeout(timer);
	}, []);

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Escape") {
			onCancel();
		}
	};

	return (
		<div
			className={editUserForm["edit-user-form__container"]}
			onKeyDown={handleKeyDown}
			tabIndex={0}
			ref={containerRef}
			// aria-label="Edit user information form"
		>
			<h2 id="edit-user-form-title">Edit user info</h2>

			<div
				className={editUserForm["edit-user-form__disclaimer-box"]}
				role="note">
				<p className={editUserForm["edit-user-form__disclaimer"]}>
					<i className="fa fa-info-circle" aria-hidden="true"></i>{" "}
					<span>
						<strong>Note:</strong> This is a demonstration site. Any username
						you set will be visible to other visitors.
					</span>
				</p>
			</div>

			<form
				className={editUserForm["edit-user-form__form"]}
				onSubmit={handleSubmit(handleSave)}
				role="form"
				aria-labelledby="edit-user-form-title">
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
							aria-describedby="username-requirements"
						/>
						<span
							id="username-requirements"
							className={editUserForm["edit-user-form__help-text"]}>
							Max 10 chars: a-z, 0-9, _ and -
						</span>

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
							aria-readonly="true"
							{...register("firstName")}
							aria-describedby="firstName-readonly-desc"
						/>
						<span id="firstName-readonly-desc" className="sr-only">
							This field cannot be modified.
						</span>

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
							aria-readonly="true"
							{...register("lastName")}
							aria-describedby="lastName-readonly-desc"
						/>
						<span id="lastName-readonly-desc" className="sr-only">
							This field cannot be modified.
						</span>
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
