/** @format */

import { configureStore } from "@reduxjs/toolkit";
import counterReducer from "../features/counter/counterSilice";
import usersReducer from "../pages/user/usersSilice";

const store = configureStore({
	reducer: {
		counter: counterReducer,
		users: usersReducer,
	},
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
