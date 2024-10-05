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
}

const initialState: UsersState = {
	users: usersMockData,
	isAuthenticated: false,
};

const usersSlice = createSlice({
	name: "users",
	initialState,
	reducers: {
		addUser: (state, action: PayloadAction<User>) => {
			state.users.push(action.payload);
		},

		setAuthentication: (state, action: PayloadAction<boolean>) => {
			state.isAuthenticated = action.payload;
		},

		resetUsers: (state) => {
			state.users = initialState.users;
			state.isAuthenticated = false;
		},
	},
});

export const { addUser, resetUsers, setAuthentication } = usersSlice.actions;

export default usersSlice.reducer;
