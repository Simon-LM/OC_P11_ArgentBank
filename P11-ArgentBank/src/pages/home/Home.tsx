/** @format */

import React, { useState, lazy, Suspense, useRef, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import useMediaQuery from "../../hooks/useMediaQuery/useMediaQuery";

// interface ImageStyles {
// 	opacity: number;
// 	transition?: string;
// }

const Features = lazy(() => import("../../components/Features/Features"));

const Home: React.FC = () => {
  const [heroImageError, setHeroImageError] = useState(false);
  const [heroImageLoaded, setHeroImageLoaded] = useState(false);

  const isFirstRenderRef = useRef(true);
  const isFirstRender = isFirstRenderRef.current;

  useEffect(() => {
    isFirstRenderRef.current = false;
  }, []);

  const isDesktop = useMediaQuery("(min-width: 1024px)");

  const { ref: featuresRef, inView: featuresInView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
    rootMargin: "100px",
  });

  const shouldRenderFeatures = isDesktop || featuresInView;

  return (
    <div tabIndex={-1}>
      <div className="hero" data-testid="hero">
        <div className="hero__image-container">
          {!heroImageError && (
            <picture className="hero__picture">
              {isFirstRender && (
                <>
                  <link
                    rel="preload"
                    href={
                      isDesktop
                        ? "/img/bank-tree.avif"
                        : "/img/bank-tree-640w.avif"
                    }
                    as="image"
                    type="image/avif"
                    fetchPriority="high"
                  />
                </>
              )}

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
                // className="hero__image"
                className={`hero__image ${heroImageLoaded ? "loaded" : ""}`}
                aria-hidden="true"
                width="1440"
                height="400"
                fetchPriority="high"
                loading="eager"
                decoding="sync"
                // style={imageStyles}
                onError={() => setHeroImageError(true)}
                // onLoad={() => {
                // 	requestAnimationFrame(() => setHeroImageLoaded(true));
                // }}
                onLoad={() => {
                  setHeroImageLoaded(true);
                }}
              />
            </picture>
          )}
          <div
            className={`hero__image-description ${heroImageError || !heroImageLoaded ? "visible" : "hidden"}`}
          >
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

          {/* Element de test pour Pa11y - mauvais contraste intentionnel sur la page d'accueil */}
          {/* <div
						style={{
							color: "#ddd",
							backgroundColor: "#eee",
							padding: "8px",
							fontSize: "14px",
						}}>
						Home page contrast test element
          </div> */}
        </section>
      </div>

      <div ref={featuresRef}>
        {shouldRenderFeatures && (
          <Suspense
            fallback={
              <div
                className="features-loading"
                style={{
                  minHeight: "450px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                Loading...
              </div>
            }
          >
            <Features />
          </Suspense>
        )}
      </div>
    </div>
  );
};

export default Home;
