import heroApplication from "../../assets/premium/webp/service-appliance-branded.webp";
import "../../styles/heroStyle/heroStyling.css";

const HeroApplication = () => {
  return (
    <section className="appliance-hero-section">
      <div className="appliance-hero-pattern appliance-hero-pattern-dots" />
      <div className="appliance-hero-pattern appliance-hero-pattern-wave" />
      <div className="appliance-hero-circle appliance-hero-circle-one" />
      <div className="appliance-hero-circle appliance-hero-circle-two" />

      <div className="appliance-hero-content">
        <span className="appliance-hero-badge">OUR SERVICES</span>

        <h1>
          Appliance <span>Repair</span>
        </h1>

        <p>
          We repair all major home appliances with expert care.
          <br />
          Fast, reliable and affordable service at your doorstep.
        </p>

        <div className="appliance-hero-breadcrumb">
          <span className="appliance-home-icon">🏠</span>
          <span>Home</span>
          <span className="appliance-breadcrumb-arrow">&gt;</span>
          <span>Appliance Repair</span>
        </div>
      </div>

      <div className="appliance-hero-image-wrap">
        <div className="appliance-hero-glow" />
        <img
          src={heroApplication}
          alt="Appliance repair service"
          className="appliance-hero-image"
          loading="eager"
          decoding="async"
        />
      </div>
    </section>
  );
};

export default HeroApplication;
