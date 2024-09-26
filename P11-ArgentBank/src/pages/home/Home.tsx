/** @format */

import React from "react";
// import "./Home.scss";

const Home: React.FC = () => {
	return (
		<main>
			<div
				className="hero"
				aria-label="A tree sprout in a verse filled with coins. 
">
				<div className="hero-image-description">
					<span className="material-symbols-outlined">image</span> A tree sprout
					in a verse filled with coins.
				</div>
				<section className="hero-content">
					<h2 className="sr-only">Promoted Content</h2>
					<p className="subtitle">No fees.</p>
					<p className="subtitle">No minimum deposit.</p>
					<p className="subtitle">High interest rates.</p>
					<p className="text">Open a savings account with Argent Bank today!</p>
				</section>
			</div>
			<section className="features">
				<h2 className="sr-only">Features</h2>
				<div className="feature-item">
					<div className="feature-item-icon">
						<i className="feature-icon  feature-icon-1" aria-label="Chat icon">
							<div className="icon-image-description">
								<span className="material-symbols-outlined">image</span> Chat
								icon
							</div>
						</i>
					</div>
					<h3 className="feature-item-title">You are our #1 priority</h3>
					<p>
						Need to talk to a representative? You can get in touch through our
						24/7 chat or through a phone call in less than 5 minutes.
					</p>
				</div>
				<div className="feature-item">
					<div className="feature-item-icon">
						<i className="feature-icon feature-icon-2" aria-label="Money icon">
							<div className="icon-image-description">
								<span className="material-symbols-outlined">image</span> Money
								icon
							</div>
						</i>
					</div>
					<h3 className="feature-item-title">
						More savings means higher rates
					</h3>
					<p>
						The more you save with us, the higher your interest rate will be!
					</p>
				</div>
				<div className="feature-item ">
					<div className="feature-item-icon">
						<i
							className="feature-icon  feature-icon-3"
							aria-label="Securitiy icon">
							<div className="icon-image-description">
								<span className="material-symbols-outlined">image</span>{" "}
								Securitiy icon
							</div>
						</i>
					</div>
					<h3 className="feature-item-title">Security you can trust</h3>
					<p>
						We use top of the line encryption to make sure your data and money
						is always safe.
					</p>
				</div>
			</section>
		</main>
	);
};

export default Home;
