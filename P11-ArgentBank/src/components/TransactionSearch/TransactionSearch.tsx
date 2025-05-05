/** @format */

import React, { useState, useEffect } from "react";
import { SearchTransactionsParams } from "../../store/slices/usersSlice";
import styles from "./TransactionSearch.module.scss";

interface TransactionSearchProps {
	searchParams: SearchTransactionsParams;
	onSearchChange: (params: Partial<SearchTransactionsParams>) => void;
	isLoading: boolean;
	selectedAccount: {
		id: string;
		accountNumber: string;
		type: string;
	} | null;
	onGlobalSearchToggle?: () => void;
}

const TransactionSearch: React.FC<TransactionSearchProps> = ({
	searchParams,
	onSearchChange,
	isLoading,
	selectedAccount,
	onGlobalSearchToggle,
}) => {
	const [inputValue, setInputValue] = useState(searchParams.searchTerm || "");
	const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(
		null
	);

	useEffect(() => {
		setInputValue(searchParams.searchTerm || "");
	}, [searchParams.searchTerm]);

	const handleSearchChange = (value: string) => {
		setInputValue(value);

		if (searchTimeout) clearTimeout(searchTimeout);

		const timeout = setTimeout(() => {
			onSearchChange({
				searchTerm: value,
				page: 1,
			});
		}, 500);

		setSearchTimeout(timeout);
	};

	// const handleGlobalSearchToggle = () => {
	// 	onSearchChange({
	// 		accountId: searchParams.accountId ? undefined : selectedAccount?.id,
	// 		page: 1,
	// 	});
	// };

	const handleGlobalSearchToggle = () => {
		if (onGlobalSearchToggle && isGlobalSearchMode === false) {
			onGlobalSearchToggle();
		} else {
			onSearchChange({
				accountId: searchParams.accountId ? undefined : selectedAccount?.id,
				page: 1,
			});
		}
	};

	useEffect(() => {
		return () => {
			if (searchTimeout) clearTimeout(searchTimeout);
		};
	}, [searchTimeout]);

	// const searchLabel = selectedAccount
	// 	? `Search transactions in ${selectedAccount.type} (${selectedAccount.accountNumber})`
	// 	: "Search transactions in all accounts";

	const searchLabel = "Filter transactions";

	const isGlobalSearchMode = !searchParams.accountId;

	return (
		<div className={styles["transaction-search"]}>
			<label
				htmlFor="transaction-search-input"
				className={styles["transaction-search__label"]}>
				{searchLabel}
			</label>

			{/* <p className={styles["transaction-search__help-text"]}>
				{selectedAccount
					? `Showing transactions for ${selectedAccount.type} (x${selectedAccount.accountNumber})`
					: "Showing transactions across all accounts"}
			</p> */}

			<p className={styles["transaction-search__search-tips"]}>
				Search by date (DD/MM/YYYY), amount, description, category or notes
			</p>

			<div className={styles["transaction-search__search-row"]}>
				<div className={styles["transaction-search__container"]}>
					<input
						id="transaction-search-input"
						type="search"
						className={styles["transaction-search__input"]}
						value={inputValue}
						onChange={(e) => handleSearchChange(e.target.value)}
						aria-describedby="transaction-search-instructions"
					/>

					{inputValue && (
						<button
							type="button"
							className={styles["transaction-search__button"]}
							onClick={() => handleSearchChange("")}
							aria-label="Clear search">
							<svg
								width="16"
								height="16"
								viewBox="0 0 16 16"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
								aria-hidden="true">
								<path
									d="M12 4L4 12M4 4L12 12"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
								/>
							</svg>
						</button>
					)}

					{isLoading && (
						<div
							className={styles["transaction-search__spinner"]}
							aria-hidden="true">
							⟳
						</div>
					)}
				</div>

				{selectedAccount && (
					<button
						type="button"
						className={`${styles["transaction-search__global-button"]} ${
							isGlobalSearchMode
								? styles["transaction-search__global-button--active"]
								: ""
						}`}
						onClick={handleGlobalSearchToggle}
						aria-pressed={isGlobalSearchMode}
						aria-label={
							isGlobalSearchMode
								? "Global search is active"
								: "Switch to global search"
						}>
						Global search
					</button>
				)}
			</div>

			<span id="transaction-search-instructions" className="sr-only">
				Filter transactions by entering text.
				{selectedAccount
					? `Currently viewing account ending in ${selectedAccount.accountNumber}.`
					: "Currently viewing all accounts."}
				You can search by date format DD/MM/YYYY, exact amounts, or keywords in
				descriptions.
			</span>
		</div>
	);
};

export default TransactionSearch;
