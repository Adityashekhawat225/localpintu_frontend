import "../styles/luxurySystem.css";
import { Link } from "react-router-dom";
import Nav from "../layouts/nav";
import Footer from "../layouts/Footer";
import { FiArrowRight, FiCompass, FiHome, FiSearch } from "react-icons/fi";
import { useSiteSettings } from "../context/SiteSettingsContext";
import "../styles/notFound.css";

const NotFound = () => {
  const settings = useSiteSettings();
  return (
    <>
      <Nav />
      <main className="premium-404">
        <div className="premium-404__media" aria-hidden="true">
          {settings.notFoundVideoUrl && <video autoPlay muted loop playsInline poster={settings.notFoundPosterUrl || undefined}><source src={settings.notFoundVideoUrl} /></video>}
          <div className="premium-404__aurora premium-404__aurora--one" />
          <div className="premium-404__aurora premium-404__aurora--two" />
          <div className="premium-404__grid" />
        </div>
        <section className="premium-404__content" aria-labelledby="not-found-title">
          <div className="premium-404__code"><span>4</span><div><FiCompass /><i /></div><span>4</span></div>
          <p className="premium-404__eyebrow">{settings.notFoundEyebrow}</p>
          <h1 id="not-found-title">{settings.notFoundTitle}</h1>
          <p className="premium-404__description">{settings.notFoundDescription}</p>
          <div className="premium-404__actions">
            <Link className="premium-404__primary" to="/"><FiHome />{settings.notFoundCtaLabel}<FiArrowRight /></Link>
            <Link className="premium-404__secondary" to="/#home-services"><FiSearch />Explore services</Link>
          </div>
          <div className="premium-404__hint"><span>Lost route</span><strong>{window.location.pathname}</strong></div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default NotFound;
