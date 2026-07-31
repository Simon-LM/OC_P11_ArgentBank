/** @format */

import { memo } from "react";
import Feature from "../Feature";

const Features = memo(() => (
  <section className="features">
    <h2 className="sr-only">Key Advantages of Banking with Argent Bank</h2>
    {/* No iconLabel: the icons are decorative (RGAA 1.2 [A]) — each one
        sits next to a title and a paragraph that already say what it
        depicts, so describing it again would just double the announcement
        for screen reader users. See FeatureIcon.tsx. */}
    <Feature
      iconClass="feature-icon--chat"
      title="You are our #1 priority"
      description="Need to talk to a representative? You can get in touch through our 24/7 chat or through a phone call in less than 5 minutes."
    />
    <Feature
      iconClass="feature-icon--money"
      title="More savings means higher rates"
      description="The more you save with us, the higher your interest rate will be!"
    />
    <Feature
      iconClass="feature-icon--security"
      title="Security you can trust"
      description="We use top of the line encryption to make sure your data and money is always safe."
    />
  </section>
));

export default Features;

// // // // // // // // // // // // // // // // // // // // //

// import React, { useState, lazy, Suspense } from "react";
// import { useInView } from "react-intersection-observer";

// const Features = lazy(() => import("../../components/Features"));

// const Home: React.FC = () => {
// 	const [heroImageError, setHeroImageError] = useState(false);
// 	const [heroImageLoaded, setHeroImageLoaded] = useState(false);

// 	const { ref: featuresRef, inView: featuresInView } = useInView({
// 		triggerOnce: true,
// 		threshold: 0.1,
// 		rootMargin: "100px",
// 	});

// 	return (
// 		<div id="main-content" tabIndex={-1}>
// 			<div className="hero" data-testid="hero">
// 				{/* Hero code remains unchanged */}
// 				<div className="hero__image-container">
// 					{!heroImageError && (
// 						<picture className="hero__picture">
// 							<source srcSet="/img/bank-tree.avif" type="image/avif" />
// 							<source srcSet="/img/bank-tree.webp" type="image/webp" />
// 							<img
// 								src="/img/bank-tree.jpg"
// 								alt=""
// 								className="hero__image"
// 								aria-hidden="true"
// 								fetchPriority="high"
// 								onError={() => setHeroImageError(true)}
// 								onLoad={() => setHeroImageLoaded(true)}
// 							/>
// 						</picture>
// 					)}
// 					<div
// 						className="hero__image-description"
// 						style={{
// 							opacity: heroImageError || !heroImageLoaded ? 1 : 0,
// 							zIndex: heroImageError ? 1 : -1,
// 						}}>
// 						<span className="material-symbols-outlined">image</span> A young
// 						tree sprout growing in a glass jar filled with coins, symbolizing
// 						financial growth
// 					</div>
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

// 			<div ref={featuresRef}>
// 				{featuresInView && (
// 					<Suspense
// 						fallback={<div className="features-loading">Loading...</div>}>
// 						<Features />
// 					</Suspense>
// 				)}
// 			</div>
// 		</div>
// 	);
// };

// export default Home;
