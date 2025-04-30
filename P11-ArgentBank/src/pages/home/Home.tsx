/** @format */

import React from "react";
import Features from "../../components/Features";

const Home: React.FC = () => {
	return (
		<main>
			<div
				className="hero"
				data-testid="hero"
				aria-label="A tree sprout in a verse filled with coins.">
				<div className="hero__image-description">
					<span className="material-symbols-outlined">image</span> A tree sprout
					in a verse filled with coins.
				</div>
				<section className="hero__content">
					<h2 className="sr-only">Promoted Content</h2>
					<p className="hero__subtitle">No fees.</p>
					<p className="hero__subtitle">No minimum deposit.</p>
					<p className="hero__subtitle">High interest rates.</p>
					<p className="hero__text">
						Open a savings account with Argent Bank today!
					</p>
				</section>
			</div>
			<Features />
		</main>
	);
};

export default Home;
