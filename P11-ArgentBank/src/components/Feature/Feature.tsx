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
		<div className="feature-item__icon">
			<i className={`feature-icon ${iconClass}`} aria-hidden="true">
				<span className="feature-icon__description">
					<span className="material-symbols-outlined" aria-hidden="true">
						image
					</span>{" "}
					{iconLabel}
				</span>
			</i>
		</div>
		<div className="feature-item__content">
			<h3 className="feature-item__title">{title}</h3>
			<p className="feature-item__description">{description}</p>
		</div>
	</div>
);

export default Feature;
