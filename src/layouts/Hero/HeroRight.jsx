import heroImg from "../../assets/images/hero_section.optimized.webp";

const HeroRight = () => {
  return (
    <div className="hero-right" data-reveal="zoom">
      <div className="hero-image-wrapper">
        <img src={heroImg} alt="Hero" />
      </div>

      <div className="floating-card top">
        <h4>24/7</h4>
        <p>Customer Support</p>
      </div>

      <div className="floating-card middle">
        <h4>60 Min</h4>
        <p>Response Time</p>
      </div>

      <div className="floating-card bottom">
        <h4>100%</h4>
        <p>Satisfaction</p>
      </div>
    </div>
  );
};

export default HeroRight;
