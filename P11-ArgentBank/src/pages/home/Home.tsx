/** @format */

import React from "react";
import Features from "../../components/Features";

const Home: React.FC = () => {
	return (
		<div id="main-content" tabIndex={-1}>
			<div
				className="hero"
				data-testid="hero"
				// aria-label="Hero banner showing a tree sprout in a jar of coins, symbolizing growth and savings"
			>
				<div className="hero__image-description">
					<span className="material-symbols-outlined">image</span> A young tree
					sprout growing in a glass jar filled with coins, symbolizing financial
					growth
				</div>
				<section className="hero__content">
					<h2 className="sr-only">Banking Benefits</h2>
					<p className="hero__subtitle">No fees.</p>
					<p className="hero__subtitle">No minimum deposit.</p>
					<p className="hero__subtitle">High interest rates.</p>
					<p className="hero__text">
						Open a savings account with Argent Bank today!
					</p>
				</section>
			</div>
			<Features />
		</div>
	);
};

export default Home;
