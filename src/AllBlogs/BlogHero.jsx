import { Link } from "react-router-dom";
import { FiArrowDown, FiBookOpen, FiCheck, FiShield } from "react-icons/fi";
import heroImage from "../assets/blog-premium/localpintu-journal-hero.optimized.webp";
import "../styles/Allblogs/BlogHero.css";

const BlogHero = () => (
  <section className="blogHero" aria-labelledby="blog-hero-title">
    <div className="blogHero__mesh" aria-hidden="true" />
    <div className="blogHero__content">
      <div className="blogHero__copy" data-reveal="left">
        <span className="blogHero__badge"><FiBookOpen /> The LocalPintu journal</span>
        <h1 id="blog-hero-title">Smarter ideas for a <em>better cared-for home.</em></h1>
        <p>Practical advice, expert repair insights and thoughtful maintenance guides&mdash;written to help every part of your home work beautifully.</p>
        <div className="blogHero__actions">
          <a href="#all-articles">Explore latest stories <FiArrowDown /></a>
          <Link to="/applications">Find a service</Link>
        </div>
        <div className="blogHero__proof"><span><FiCheck /> Expert-led guidance</span><span><FiShield /> Advice you can trust</span></div>
      </div>
      <div className="blogHero__visual" data-reveal="right">
        <div className="blogHero__image"><img src={heroImage} alt="LocalPintu home-care journal and maintenance guidance" fetchPriority="high" decoding="async" width="1572" height="1001" /><span className="blogHero__imageShade" /></div>
        <div className="blogHero__note"><i /> <span><small>Fresh perspective</small><strong>Care starts with knowing your home</strong></span></div>
        <div className="blogHero__issue"><small>Journal</small><strong>01</strong><span>Home care &bull; 2026</span></div>
      </div>
    </div>
  </section>
);

export default BlogHero;
