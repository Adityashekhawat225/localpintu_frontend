import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight, FiBookOpen, FiCalendar, FiClock } from "react-icons/fi";
import { getBlogs } from "../services/api";
import { blogPublishDate, blogReadingTime, blogVisual } from "../utils/premiumAssets";
import "../styles/Allblogs/AllBlogs.css";

const AllBlogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    getBlogs()
      .then((items) => alive && setBlogs(items))
      .catch(() => {
        if (alive) setError("Unable to load the journal right now. Please try again later.");
      })
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, []);

  const featured = blogs[0];
  const articles = blogs.slice(1);

  return (
    <section className="allBlogs" id="all-articles" aria-labelledby="all-blogs-title">
      <div className="allBlogs__container">
        <header className="allBlogs__heading" data-reveal="up">
          <div><span><FiBookOpen /> Browse the journal</span><h2 id="all-blogs-title">Ideas, guides and <em>expert know-how.</em></h2><p>Explore practical stories created to make home care simpler, safer and more rewarding.</p></div>
          <strong>{blogs.length}<small>Published stories</small></strong>
        </header>

        {loading && <div className="allBlogs__skeletons" aria-label="Loading blogs">{Array.from({ length: 6 }, (_, index) => <div className="allBlogs__skeleton" key={index}><i /><span /><span /><small /></div>)}</div>}
        {!loading && error && <div className="allBlogs__status allBlogs__status--error" role="alert"><FiBookOpen /><strong>Our journal is taking a moment</strong><p>{error}</p></div>}
        {!loading && !error && blogs.length === 0 && <div className="allBlogs__status"><FiBookOpen /><strong>No stories published yet</strong><p>Please check back soon for home-care guides and updates.</p></div>}

        {!loading && !error && featured && (
          <>
            <article className="allBlogs__featured" data-reveal="up">
              <Link className="allBlogs__featuredImage" to={`/blogs/${featured.slug}`}><img src={blogVisual(featured)} alt={featured.title} loading="lazy" decoding="async" width="1200" height="675" /><span /><small>Featured story</small></Link>
              <div className="allBlogs__featuredCopy"><span className="allBlogs__category">{featured.category || "Home care"}</span><div className="allBlogs__meta"><span><FiCalendar /> {blogPublishDate(featured)}</span><span><FiClock /> {blogReadingTime(featured)}</span></div><h3><Link to={`/blogs/${featured.slug}`}>{featured.title}</Link></h3><p>{featured.excerpt}</p><Link className="allBlogs__read" to={`/blogs/${featured.slug}`}>Read featured story <span><FiArrowRight /></span></Link></div>
            </article>

            {articles.length > 0 && <div className="allBlogs__sectionLabel"><span>More from LocalPintu</span><small>{articles.length} more {articles.length === 1 ? "story" : "stories"}</small></div>}
            <div className="allBlogs__grid">
              {articles.map((blog, index) => (
                <article className="allBlogs__card" key={blog._id || blog.slug} data-reveal="up" style={{ "--reveal-delay": `${(index % 3) * 70}ms` }}>
                  <Link className="allBlogs__image" to={`/blogs/${blog.slug}`} aria-label={`Read ${blog.title}`}><img src={blogVisual(blog)} alt={blog.title} loading="lazy" decoding="async" /><span className="allBlogs__category">{blog.category || "Home care"}</span><small>{String(index + 2).padStart(2, "0")}</small></Link>
                  <div className="allBlogs__content"><div className="allBlogs__meta"><span><FiCalendar /> {blogPublishDate(blog)}</span><span><FiClock /> {blogReadingTime(blog)}</span></div><h3><Link to={`/blogs/${blog.slug}`}>{blog.title}</Link></h3><p>{blog.excerpt}</p><Link className="allBlogs__read" to={`/blogs/${blog.slug}`}>Read article <span><FiArrowRight /></span></Link></div>
                </article>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default AllBlogs;
