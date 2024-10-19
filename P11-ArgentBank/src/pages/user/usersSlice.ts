/** @format */

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { usersMockData } from "../../mockData/users";
interface Account {
	accountName: string;
	accountNumber: string;
	balance: string;
	balanceType: string;
}

interface User {
	id: string;
	firstName: string;
	lastName: string;
	userName: string;
	email: string;
	createdAt: string;
	updatedAt: string;
	accounts: Account[];
}

interface UsersState {
	users: User[];
	isAuthenticated: boolean;
	currentUser: User | null;
}

interface UserLoginPayload {
	email: string;
	token: string;
}

const initialState: UsersState = {
	users: usersMockData,
	isAuthenticated: false,
	currentUser: null,
};

// Création du slice
const usersSlice = createSlice({
	name: "users",
	initialState,
	reducers: {
		addUser: (state, action: PayloadAction<User>) => {
			state.users.push(action.payload);
		},

		loginUserSuccess: (state, action: PayloadAction<UserLoginPayload>) => {
			const user = state.users.find(
				(user) => user.email === action.payload.email
			);
			if (user) {
				state.currentUser = user;
				state.isAuthenticated = true;
				localStorage.setItem("authToken", action.payload.token);
			}
		},

		logoutUser: (state) => {
			state.currentUser = null;
			state.isAuthenticated = false;
			localStorage.removeItem("authToken");
		},
	},
});

export const { addUser, loginUserSuccess, logoutUser } = usersSlice.actions;

export default usersSlice.reducer;
