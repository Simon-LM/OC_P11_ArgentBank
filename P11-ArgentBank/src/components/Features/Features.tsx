/** @format */

import { memo } from "react";
import Feature from "../Feature";

const Features = memo(() => (
	<section className="features">
		<h2 className="sr-only">Features</h2>
		<Feature
			iconClass="feature-icon--chat"
			iconLabel="Chat icon representing 24/7 customer service"
			title="You are our #1 priority"
			description="Need to talk to a representative? You can get in touch through our 24/7 chat or through a phone call in less than 5 minutes."
		/>
		<Feature
			iconClass="feature-icon--money"
			iconLabel="Money icon showing stacked coins representing savings growth"
			title="More savings means higher rates"
			description="The more you save with us, the higher your interest rate will be!"
		/>
		<Feature
			iconClass="feature-icon--security"
			iconLabel="Security shield icon representing data protection"
			title="Security you can trust"
			description="We use top of the line encryption to make sure your data and money is always safe."
		/>
	</section>
));

export default Features;
