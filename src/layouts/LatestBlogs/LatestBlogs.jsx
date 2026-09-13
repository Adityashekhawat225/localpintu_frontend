import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { motion } from "../../utils/motionLite";
import { FiArrowRight, FiBookOpen, FiCalendar, FiClock } from "react-icons/fi";
import { getLatestBlogs } from "../../services/api";
import { blogPublishDate, blogReadingTime, blogVisual } from "../../utils/premiumAssets";
import { cardMotion, imageMotion, sectionReveal } from "../../utils/animations";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "../../styles/Home/LatestBlogs.css";

const LatestBlogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    getLatestBlogs()
      .then((nextBlogs) => alive && setBlogs(nextBlogs))
      .catch(() => {
        if (alive) setError("Unable to load latest blogs.");
      })
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, []);

  return (
    <motion.section className="latestBlogs" {...sectionReveal} layout aria-labelledby="latest-blogs-title">
      <div className="latestBlogs__glow" aria-hidden="true" />
      <div className="latestBlogs__container">
        <motion.div className="latestBlogs__heading" {...sectionReveal}>
          <div>
            <span className="latestBlogs__eyebrow"><FiBookOpen aria-hidden="true" /> Latest from the journal</span>
            <h2 id="latest-blogs-title">Fresh ideas for a <em>better cared-for home.</em></h2>
            <p>Expert advice, practical maintenance guides and smarter ways to keep every corner of your home working beautifully.</p>
          </div>
          <Link to="/blogs" className="latestBlogs__all">Explore all stories <FiArrowRight aria-hidden="true" /></Link>
        </motion.div>

        {loading && <div className="latestBlogs__skeletons" aria-label="Loading latest blogs">{Array.from({ length: 3 }, (_, index) => <div className="latestBlogs__skeleton" key={index}><i /><span /><span /><small /></div>)}</div>}
        {!loading && error && <div className="latest-blog-status latest-blog-status--error">{error}</div>}
        {!loading && !error && blogs.length === 0 && <div className="latest-blog-status">No blogs are available yet.</div>}

        {!loading && !error && blogs.length > 0 && (
          <Swiper
            className="latestBlogs__slider"
            modules={[Navigation, Pagination, Autoplay]}
            navigation
            pagination={{ clickable: true }}
            autoplay={{ delay: 4500, disableOnInteraction: false, pauseOnMouseEnter: true }}
            spaceBetween={20}
            breakpoints={{ 0: { slidesPerView: 1 }, 680: { slidesPerView: 2 }, 1100: { slidesPerView: 3 } }}
          >
            {blogs.map((blog, index) => (
              <SwiperSlide key={blog._id || blog.slug}>
                <motion.article className="blogCard" {...cardMotion}>
                  <Link className="blogImage" to={`/blogs/${blog.slug}`} aria-label={`Read ${blog.title}`}>
                    <motion.img src={blogVisual(blog, index)} alt={blog.title} loading="lazy" {...imageMotion} />
                    <span className="blogImage__wash" aria-hidden="true" />
                    <span className="blogImage__index">{String(index + 1).padStart(2, "0")}</span>
                    <span className="blogCategory">{blog.category || "Home care"}</span>
                  </Link>
                  <div className="blogContent">
                    <div className="blog-meta">
                      <span><FiCalendar aria-hidden="true" /> {blogPublishDate(blog)}</span>
                      <span><FiClock aria-hidden="true" /> {blogReadingTime(blog)}</span>
                    </div>
                    <h3><Link to={`/blogs/${blog.slug}`}>{blog.title}</Link></h3>
                    <p>{blog.excerpt}</p>
                    <Link to={`/blogs/${blog.slug}`} className="blog-link">Read article <span><FiArrowRight aria-hidden="true" /></span></Link>
                  </div>
                </motion.article>
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </div>
    </motion.section>
  );
};

export default LatestBlogs;
