/** @format */

import React from "react";
import FeatureIcon from "./FeatureIcon";

interface FeatureProps {
  iconClass: string;
  title: string;
  description: string;
}

const Feature: React.FC<FeatureProps> = ({ iconClass, title, description }) => {
  const iconName =
    typeof iconClass === "string"
      ? iconClass.replace("feature-icon--", "")
      : "";

  return (
    <div className="feature-item">
      <div className="feature-item__icon">
        <div className={`feature-icon ${iconClass || ""}`.trimEnd()}>
          <FeatureIcon name={iconName} />
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
