/** @format */

import React, { Suspense, lazy, ComponentType } from "react";
import { IconBaseProps } from "react-icons";

// Mapping des icônes avec chargement différé
const iconMap = {
	FaUserCircle: lazy(() =>
		import("react-icons/fa").then((module) => ({
			default: module.FaUserCircle,
		}))
	),
	FaSignOutAlt: lazy(() =>
		import("react-icons/fa").then((module) => ({
			default: module.FaSignOutAlt,
		}))
	),
	FaInfoCircle: lazy(() =>
		import("react-icons/fa").then((module) => ({
			default: module.FaInfoCircle,
		}))
	),
	FaEye: lazy(() =>
		import("react-icons/fa").then((module) => ({ default: module.FaEye }))
	),
	FaEyeSlash: lazy(() =>
		import("react-icons/fa").then((module) => ({ default: module.FaEyeSlash }))
	),
	FaChevronLeft: lazy(() =>
		import("react-icons/fa").then((module) => ({
			default: module.FaChevronLeft,
		}))
	),
	FaChevronRight: lazy(() =>
		import("react-icons/fa").then((module) => ({
			default: module.FaChevronRight,
		}))
	),
} as const;

type IconName = keyof typeof iconMap;

interface LazyIconProps extends IconBaseProps {
	name: IconName;
	fallback?: React.ReactNode;
}

// Composant de fallback simple pendant le chargement
const IconFallback: React.FC<{ className?: string }> = ({ className }) => (
	<span
		className={className}
		style={{
			display: "inline-block",
			width: "1em",
			height: "1em",
			backgroundColor: "currentColor",
			opacity: 0.3,
			borderRadius: "2px",
		}}
		aria-hidden="true"
	/>
);

const LazyIcon: React.FC<LazyIconProps> = ({
	name,
	fallback = <IconFallback />,
	...props
}) => {
	const IconComponent = iconMap[name] as ComponentType<IconBaseProps>;

	return (
		<Suspense fallback={fallback}>
			<IconComponent {...props} />
		</Suspense>
	);
};

export default LazyIcon;
export type { IconName };
