/** @format */

import { createSlice } from "@reduxjs/toolkit";

interface CounterState {
	value: number;
}

const initialState: CounterState = {
	value: 0,
};

const counterSlice = createSlice({
	name: "counter",
	initialState,
	reducers: {
		increment: (state) => {
			state.value += 1;
		},
		decrement: (state) => {
			state.value -= 1;
		},
		// Vous pouvez ajouter d'autres actions si nécessaire
	},
});

export const { increment, decrement } = counterSlice.actions;
export default counterSlice.reducer;