/** @format */

import React from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Label } from "@radix-ui/react-label";
import editUserForm from "./editUserForm.module.scss";

const schema = z.object({
	userName: z
		.string()
		.nonempty("User name is required")
		.refine((val) => val.trim() !== "", "User name cannot be empty"),
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
		<div className={editUserForm["EditUserForm-container"]}>
			<h2>Edit user info</h2>
			<form
				className={editUserForm["form-container"]}
				onSubmit={handleSubmit(handleSave)}
				role="form">
				<div className={editUserForm["input-group"]}>
					<Label className={editUserForm.label} htmlFor="userName">
						User Name :
					</Label>
					<div className={editUserForm["input-wrapper"]}>
						<input
							className={editUserForm.input}
							id="userName"
							{...register("userName")}
							aria-invalid={errors.userName ? "true" : "false"}
						/>
						{errors.userName && (
							<p className={editUserForm["error-message"]} role="alert">
								{errors.userName.message}
							</p>
						)}
					</div>
				</div>

				<div className={editUserForm["input-group"]}>
					<Label className={editUserForm.label} htmlFor="firstName">
						First Name :
					</Label>
					<div className={editUserForm["input-wrapper"]}>
						<input
							className={editUserForm.input_readonly}
							id="firstName"
							readOnly
							{...register("firstName")}
						/>
						{errors.firstName && (
							<p className={editUserForm["error-message"]}>
								{errors.firstName.message}
							</p>
						)}
					</div>
				</div>

				<div className={editUserForm["input-group"]}>
					<Label className={editUserForm.label} htmlFor="lastName">
						Last Name :
					</Label>
					<div className={editUserForm["input-wrapper"]}>
						<input
							className={editUserForm.input_readonly}
							id="lastName"
							readOnly
							{...register("lastName")}
						/>
						{errors.lastName && (
							<p className={editUserForm["error-message"]}>
								{errors.lastName.message}
							</p>
						)}
					</div>
				</div>

				<div className={editUserForm["button-group"]}>
					<button className={editUserForm["submit-button"]} type="submit">
						Save
					</button>
					<button
						className={editUserForm["cancel-button"]}
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
