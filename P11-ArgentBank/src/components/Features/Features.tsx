import Feature from '../Feature/Feature';

const Features: React.FC = () => (
  <section className="features">
    <h2 className="sr-only">Features</h2>
    <Feature
      iconClass="feature-icon-1"
      iconLabel="Chat icon"
      title="You are our #1 priority"
      description="Need to talk to a representative? You can get in touch through our 24/7 chat or through a phone call in less than 5 minutes."
    />
    <Feature
      iconClass="feature-icon-2"
      iconLabel="Money icon"
      title="More savings means higher rates"
      description="The more you save with us, the higher your interest rate will be!"
    />
    <Feature
      iconClass="feature-icon-3"
      iconLabel="Security icon"
      title="Security you can trust"
      description="We use top of the line encryption to make sure your data and money is always safe."
    />
  </section>
);

export default Features;