/** @format */

import React, { useState } from "react";

interface FeatureProps {
  iconClass: string;
  iconLabel: string;
  title: string;
  description: string;
}

const Feature: React.FC<FeatureProps> = ({
  iconClass,
  iconLabel,
  title,
  description,
}) => {
  const getIconPaths = () => {
    if (!iconClass || typeof iconClass !== "string") {
      return {
        png: "/img/icon-default_light-mode.png",
        webp: "/img/icon-default_light-mode.webp",
        avif: "/img/icon-default_light-mode.avif",
      };
    }
    const baseName = iconClass.replace("feature-icon--", "");
    return {
      png: `/img/icon-${baseName}_light-mode.png`,
      webp: `/img/icon-${baseName}_light-mode.webp`,
      avif: `/img/icon-${baseName}_light-mode.avif`,
    };
  };

  const iconPaths = getIconPaths();

  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = React.useState(false);

  return (
    <div className="feature-item">
      <div className="feature-item__icon">
        <div className={`feature-icon ${iconClass}`}>
          {!imageError && (
            <picture>
              <source srcSet={iconPaths.avif} type="image/avif" />
              <source srcSet={iconPaths.webp} type="image/webp" />
              <img
                src={iconPaths.png}
                alt=""
                className="feature-icon__img"
                aria-hidden="true"
                width="100"
                height="100"
                loading="lazy"
                decoding="async"
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
              />
            </picture>
          )}
          <span
            className="feature-icon__description"
            style={{
              opacity: imageError || !imageLoaded ? 1 : 0,
              zIndex: imageError || !imageLoaded ? 1 : -1,
            }}
          >
            {iconLabel}
          </span>
        </div>
      </div>
      <div className="feature-item__content">
        <h3 className="feature-item__title">{title}</h3>
        <p className="feature-item__description">{description}</p>
      </div>
    </div>
  );
};

export default Feature;
