/** @format */

import { configureStore } from "@reduxjs/toolkit";
import { thunk } from "redux-thunk";
import usersReducer from "../pages/user/usersSlice";

const store = configureStore({
	reducer: {
		users: usersReducer,
	},
	middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(thunk),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
