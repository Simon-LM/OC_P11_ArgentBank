/** @format */

import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { increment, decrement } from "./counterSlice";
import type { RootState } from "../../store/Store"; // Importez le type pour le state

const Counter: React.FC = () => {
	const count = useSelector((state: RootState) => state.counter.value);
	const dispatch = useDispatch();

	return (
		<div>
			<button onClick={() => dispatch(decrement())}>-</button>
			<span>{count}</span>
			<button onClick={() => dispatch(increment())}>+</button>
		</div>
	);
};

export default Counter;
