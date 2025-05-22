/** @format */

// import React from "react";
// import Features from "../../components/Features";

// const Home: React.FC = () => {
// 	return (
// 		<div id="main-content" tabIndex={-1}>
// 			<div className="hero" data-testid="hero">
// 				<div className="hero__image-description">
// 					<span className="material-symbols-outlined">image</span> A young tree
// 					sprout growing in a glass jar filled with coins, symbolizing financial
// 					growth
// 				</div>
// 				<section className="hero__content">
// 					<h2 className="sr-only">Banking Benefits</h2>
// 					<p className="hero__subtitle">No fees.</p>
// 					<p className="hero__subtitle">No minimum deposit.</p>
// 					<p className="hero__subtitle">High interest rates.</p>
// 					<p className="hero__text">
// 						Open a savings account with Argent Bank today!
// 					</p>
// 				</section>
// 			</div>
// 			<Features />
// 		</div>
// 	);
// };

// export default Home;

// // // // // // // // //

import React, { useState, lazy, Suspense } from "react";
import { useInView } from "react-intersection-observer";

const Features = lazy(() => import("../../components/Features/Features"));

const Home: React.FC = () => {
	const [heroImageError, setHeroImageError] = useState(false);
	const [heroImageLoaded, setHeroImageLoaded] = useState(false);

	const { ref: featuresRef, inView: featuresInView } = useInView({
		triggerOnce: true,
		threshold: 0.1,
		rootMargin: "100px",
	});

	return (
		<div id="main-content" tabIndex={-1}>
			<div className="hero" data-testid="hero">
				<div className="hero__image-container">
					{!heroImageError && (
						<picture className="hero__picture">
							<source
								media="(max-width: 640px)"
								srcSet="/img/bank-tree-640w.avif"
								type="image/avif"
							/>
							<source
								media="(max-width: 1024px)"
								srcSet="/img/bank-tree-1024w.avif"
								type="image/avif"
							/>
							<source srcSet="/img/bank-tree.avif" type="image/avif" />

							<source
								media="(max-width: 640px)"
								srcSet="/img/bank-tree-640w.webp"
								type="image/webp"
							/>
							<source
								media="(max-width: 1024px)"
								srcSet="/img/bank-tree-1024w.webp"
								type="image/webp"
							/>
							<source srcSet="/img/bank-tree.webp" type="image/webp" />
							<img
								src="/img/bank-tree.jpg"
								srcSet="/img/bank-tree-640w.jpg 640w, /img/bank-tree-1024w.jpg 1024w, /img/bank-tree.jpg 1440w"
								sizes="(max-width: 640px) 640px, (max-width: 1024px) 1024px, 1440px"
								alt=""
								className="hero__image"
								aria-hidden="true"
								width="1440"
								height="400"
								fetchPriority="high"
								loading="eager"
								onError={() => setHeroImageError(true)}
								onLoad={() => setHeroImageLoaded(true)}
							/>
						</picture>
					)}
					<div
						className="hero__image-description"
						style={{
							opacity: heroImageError || !heroImageLoaded ? 1 : 0,
							zIndex: heroImageError ? 1 : 0,
						}}>
						<span className="material-symbols-outlined">image</span> A young
						tree sprout growing in a glass jar filled with coins, symbolizing
						financial growth
					</div>
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

			<div ref={featuresRef}>
				{featuresInView && (
					<Suspense
						fallback={<div className="features-loading">Loading...</div>}>
						<Features />
					</Suspense>
				)}
			</div>
		</div>
	);
};

export default Home;
