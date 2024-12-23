/** @format */

import React from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Label } from "@radix-ui/react-label";

const schema = z.object({
	userName: z.string().nonempty("User name is required"),
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

	const handleSave = (data: FormData) => onSave(data);

	return (
		<>
			<h2>Edit user info</h2>
			<form onSubmit={handleSubmit(handleSave)}>
				<div>
					<Label htmlFor="userName">User Name</Label>
					<input id="userName" {...register("userName")} />
					{errors.userName && <p>{errors.userName.message}</p>}
				</div>
				<div>
					<Label htmlFor="firstName">First Name</Label>
					<input id="firstName" readOnly {...register("firstName")} />
					{errors.firstName && <p>{errors.firstName.message}</p>}
				</div>
				<div>
					<Label htmlFor="lastName">Last Name</Label>
					<input id="lastName" readOnly {...register("lastName")} />
					{errors.lastName && <p>{errors.lastName.message}</p>}
				</div>
				<button type="submit">Save</button>
				<button type="button" onClick={onCancel}>
					Cancel
				</button>
			</form>
		</>
	);
};

export default EditUserForm;
