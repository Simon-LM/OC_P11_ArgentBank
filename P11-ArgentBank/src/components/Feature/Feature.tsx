/** @format */

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
}) => (
	<div className="feature-item">
		<div className="feature-item-icon">
			<i className={`feature-icon ${iconClass}`} aria-label={iconLabel}>
				<div className="icon-image-description">
					<span className="material-symbols-outlined">image</span> {iconLabel}
				</div>
			</i>
		</div>
		<h3 className="feature-item-title">{title}</h3>
		<p>{description}</p>
	</div>
);

export default Feature;
