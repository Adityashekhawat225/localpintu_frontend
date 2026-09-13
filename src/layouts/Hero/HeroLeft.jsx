import HeroFeatures from "./HeroFeatures";
import HeroStats from "./HeroStats";
import { FaPhoneAlt } from "react-icons/fa";

const HeroLeft = () => {
  return (
    <div className="hero-left" data-reveal="left">

      <div className="trusted">
        Trusted by 10,000+ Happy Customers
      </div>

      <h1>
        Fast, Reliable & Professional
        <span> Appliance Repair </span>
        Services in Jaipur
      </h1>

      <p>
        We repair all major home appliances with genuine spare
        parts and expert technicians at your doorstep.
      </p>

      <HeroFeatures />

      <div className="hero-buttons">
        <button className="book-btn">
          Book a Service
        </button>

        <button className="call-btn">
          <FaPhoneAlt />
          Call Now
        </button>
      </div>

      <HeroStats />
    </div>
  );
};

export default HeroLeft;
