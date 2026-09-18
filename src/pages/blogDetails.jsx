import "../styles/luxurySystem.css";
import { blogPublishDate, blogReadingTime, blogVisual } from "../utils/premiumAssets";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { FiArrowLeft, FiArrowRight, FiBookOpen, FiCalendar, FiCheck, FiClock, FiGrid, FiShield, FiTool } from "react-icons/fi";
import Nav from "../layouts/nav";
import Footer from "../layouts/Footer";
import ServicePlanImage from "../components/ServicePlanImage";
import { getApplianceServices, getBlogBySlug, getBlogs, getChildServices, getServiceCategories, getServicePlans } from "../services/api";
import "../styles/Allblogs/AllBlogs.css";

const fallbackArticle = (blog) => {
  const topic = `${blog?.slug || ""} ${blog?.title || ""}`.toLowerCase();
  if (/(freezer|refrigerator|fridge)/.test(topic)) return [
    "A freezer that stops cooling properly can put stored food at risk and increase electricity consumption. In Vaishali Nagar, common causes range from blocked airflow and worn door seals to thermostat, relay or compressor faults. A structured inspection helps identify the real issue before any part is replaced.",
    "Start by checking the temperature setting, power supply and the space around the appliance. The freezer should have enough ventilation, the door should close firmly and food packages should not block internal air vents. If frost is covering the rear panel, the defrost system may need professional attention.",
    "Warning signs include continuous compressor noise, repeated clicking, water leakage, excessive ice formation, a warm cabinet wall or food taking unusually long to freeze. These symptoms are useful clues, but several components can create similar behaviour, so diagnosis should come before repair estimates.",
    "A trained technician typically checks the door gasket, condenser condition, evaporator airflow, thermostat or sensor readings, start relay and compressor performance. Refrigerant pressure should only be tested when the earlier checks indicate a sealed-system or gas-related problem.",
    "Repair cost depends on the failed component and freezer model. Cleaning, alignment or minor electrical fixes are usually simpler, while fan motors, control boards, compressors and sealed-system work require more time and specialised tools. Ask for a clear diagnosis and itemised estimate before approving replacement parts.",
    "Avoid repeatedly switching the appliance on and off, chipping ice with sharp tools or allowing untrained handling of refrigerant lines. These shortcuts can damage the evaporator, create an electrical risk or turn a manageable fault into an expensive repair.",
    "After service, verify that the door seals evenly, unusual noise has reduced and the cabinet begins reaching its target temperature. Cooling stabilisation can take several hours, so monitor performance without opening the door frequently.",
    "Preventive care is straightforward: clean accessible condenser areas, leave ventilation space, avoid overloading, inspect the gasket regularly and respond early to changes in sound or cooling. Timely maintenance generally protects both food safety and appliance efficiency."
  ];
  return [
    blog?.excerpt || "Professional home care begins with understanding the symptom before choosing a repair.",
    "Begin with simple safety and usage checks, then note when the issue started and whether performance has changed gradually or suddenly. Clear observations help a professional diagnose the problem efficiently.",
    "Avoid replacing parts based only on symptoms. A verified technician can inspect the appliance, explain the cause and provide a transparent service recommendation before work begins.",
    "Regular maintenance, correct usage and early attention to warning signs can prevent larger faults and extend the useful life of household equipment."
  ];
};

const cleanParagraphs = (blog) => {
  const paragraphs = String(blog?.content || "").split(/\n+/).map((paragraph) => paragraph.trim()).filter(Boolean);
  return paragraphs.length >= 3 ? paragraphs : fallbackArticle(blog);
};

const serviceForArticle = (blog) => {
  const topic = `${blog?.slug || ""} ${blog?.title || ""} ${blog?.category || ""}`.toLowerCase();
  const appliance = (category, label, text) => ({ to: `/applications/appliance-repair?category=${category}`, label, text });
  const homeRepair = (category, label, text) => ({ to: `/applications/home-repair?category=${category}`, label, text });
  if (/(washing|washer|laundry)/.test(topic)) return appliance("washing-machine", "Washing machine services", "Compare washing machine check-up, service and installation options in Jaipur.");
  if (/(refrigerator|fridge|freezer)/.test(topic)) return appliance("refrigerator", "Refrigerator services", "Explore refrigerator and deep-freezer check-up options for your home.");
  if (/(microwave|oven)/.test(topic)) return appliance("microwave", "Microwave services", "See microwave check-up and clean-up plans with transparent pricing.");
  if (/(air conditioner|\bac\b|split ac|window ac)/.test(topic)) return appliance("ac-repair-services", "AC services", "Compare AC check-up, jet service, installation and uninstallation options.");
  if (/(water purifier|\bro\b|filter)/.test(topic)) return appliance("water-purifier", "Water purifier services", "Explore RO and water-purifier check-up, service and installation options.");
  if (/(geyser|water heater)/.test(topic)) return appliance("geyser", "Geyser services", "Compare geyser check-up, service, installation and uninstallation plans.");
  if (/(chimney)/.test(topic)) return appliance("kitchen-chimney", "Kitchen chimney services", "Explore wall-mounted and island chimney cleaning options.");
  if (/(electric)/.test(topic)) return homeRepair("electrician", "Electrician services", "Find verified electrical check-up and home-repair options.");
  if (/(plumb)/.test(topic)) return homeRepair("plumber", "Plumbing services", "Explore transparent plumbing and water-care service options.");
  if (/(carpenter|furniture)/.test(topic)) return homeRepair("carpenter", "Carpenter services", "Find furniture repair and professional carpentry options.");
  if (/(paint)/.test(topic)) return homeRepair("painter", "Painting services", "Explore professional painting and wall-care options.");
  if (/(clean)/.test(topic)) return { to: "/applications", label: "Home cleaning services", text: "Browse available cleaning and home-care services in Jaipur." };
  return { to: "/applications/appliance-repair", label: "Appliance repair services", text: "Compare clear appliance-repair service options and book a doorstep visit." };
};

const topicWords = (blog) => new Set(`${blog?.slug || ""} ${blog?.title || ""}`.toLowerCase().split(/[^a-z0-9]+/).filter((word) => word.length > 3 && !["service", "services", "repair", "jaipur", "best", "near", "localpintu"].includes(word)));
const relatedScore = (current, candidate) => {
  const currentWords = topicWords(current), candidateWords = topicWords(candidate);
  let score = candidate.category === current?.category ? 2 : 0;
  currentWords.forEach((word) => { if (candidateWords.has(word)) score += 4; });
  return score;
};

const relationId = (value) => (typeof value === "object" && value ? value._id : value);
const planTopicKeywords = (blog) => {
  const topic = `${blog?.slug || ""} ${blog?.title || ""}`.toLowerCase();
  if (/(washing|washer|laundry)/.test(topic)) return ["washing", "washer", "laundry"];
  if (/(refrigerator|fridge|freezer)/.test(topic)) return ["refrigerator", "fridge", "freezer"];
  if (/(microwave|oven)/.test(topic)) return ["microwave", "oven"];
  if (/(air conditioner|\bac\b|split ac|window ac)/.test(topic)) return ["air conditioner", "ac repair", "ac service", "split ac", "window ac"];
  if (/(water purifier|\bro\b|filter)/.test(topic)) return ["water purifier", "ro", "filter"];
  if (/(geyser|water heater)/.test(topic)) return ["geyser", "water heater"];
  if (/(chimney)/.test(topic)) return ["chimney"];
  if (/(electric)/.test(topic)) return ["electrician", "electric"];
  if (/(plumb)/.test(topic)) return ["plumber", "plumb"];
  if (/(carpenter|furniture)/.test(topic)) return ["carpenter", "furniture"];
  if (/(paint)/.test(topic)) return ["painting", "painter"];
  if (/(clean)/.test(topic)) return ["cleaning", "clean"];
  return [...topicWords(blog)];
};
const money = (value) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(value || 0));
const relatedPlansForBlog = (blog, catalog) => {
  if (!blog || !catalog) return [];
  const keywords = planTopicKeywords(blog);
  const children = new Map(catalog.childServices.map((item) => [String(item._id), item]));
  const categories = new Map(catalog.categories.map((item) => [String(item._id), item]));
  const services = new Map(catalog.services.map((item) => [String(item._id), item]));
  return catalog.plans.filter((plan) => plan.isActive !== false).map((plan) => {
    const child = children.get(String(relationId(plan.childServiceId)));
    const category = categories.get(String(relationId(child?.categoryId)));
    const service = services.get(String(relationId(category?.serviceId)));
    if (!child || !category || !service || child.isActive === false || category.isActive === false || service.isActive === false) return null;
    const searchable = `${plan.title || ""} ${plan.slug || ""} ${plan.description || ""} ${child.title || ""} ${child.slug || ""} ${category.title || ""} ${category.slug || ""} ${service.title || ""} ${service.slug || ""}`.toLowerCase();
    const score = keywords.reduce((total, keyword) => total + (searchable.includes(keyword) ? 1 : 0), 0);
    return score ? { plan, child, category, service, score } : null;
  }).filter(Boolean).sort((a, b) => b.score - a.score).slice(0, 3);
};

const BlogDetails = () => {
  const { blogSlug } = useParams();
  const [blog, setBlog] = useState(null);
  const [blogs, setBlogs] = useState([]);
  const [catalog, setCatalog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    Promise.all([getBlogBySlug(blogSlug), getBlogs().catch(() => []), getApplianceServices().catch(() => []), getServiceCategories().catch(() => []), getChildServices().catch(() => []), getServicePlans().catch(() => [])])
      .then(([next, allBlogs, services, categories, childServices, plans]) => { if (alive) { setBlog(next); setBlogs(allBlogs); setCatalog({ services, categories, childServices, plans }); } })
      .catch(() => { if (alive) setError("Unable to load this blog right now."); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [blogSlug]);

  const paragraphs = useMemo(() => cleanParagraphs(blog), [blog]);
  const related = useMemo(() => blogs.filter((item) => item.slug !== blogSlug).sort((a, b) => relatedScore(blog, b) - relatedScore(blog, a)).slice(0, 3), [blogs, blog, blogSlug]);
  const takeaways = paragraphs.slice(0, 3).map((text) => text.length > 105 ? `${text.slice(0, 102)}…` : text);
  const siteUrl = (import.meta.env.VITE_SITE_URL || "https://localpintu.com").replace(/\/$/, "");
  const articleUrl = `${siteUrl}/blogs/${blogSlug}`;
  const articleSchema = blog ? { "@context":"https://schema.org", "@type":"BlogPosting", headline:blog.title, description:blog.excerpt, image:[blogVisual(blog)], datePublished:blog.createdAt, dateModified:blog.updatedAt || blog.createdAt, mainEntityOfPage:{"@type":"WebPage","@id":articleUrl}, author:{"@type":"Organization",name:"LocalPintu Editorial Team",url:`${siteUrl}/about`}, publisher:{"@type":"Organization",name:"LocalPintu",logo:{"@type":"ImageObject",url:`${siteUrl}/favicon.svg`}}, articleSection:blog.category || "Home care", keywords:[blog.title, blog.category || "Home care", "Jaipur home services", "LocalPintu expert guide"].join(", "), wordCount:paragraphs.join(" ").split(/\s+/).length, timeRequired:`PT${parseInt(blogReadingTime(blog),10)||5}M`, inLanguage:"en-IN" } : null;
  const orderedBlogs = useMemo(() => [...blogs].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)), [blogs]);
  const articleIndex = orderedBlogs.findIndex((item) => item.slug === blogSlug);
  const previousArticle = articleIndex >= 0 ? orderedBlogs[articleIndex + 1] : null;
  const nextArticle = articleIndex > 0 ? orderedBlogs[articleIndex - 1] : null;
  const articleKeywords = blog ? [blog.title, blog.category || "home care", "Jaipur home services", "appliance maintenance", "LocalPintu expert guide"] : [];
  const relatedService = useMemo(() => serviceForArticle(blog), [blog]);
  const relatedPlans = useMemo(() => relatedPlansForBlog(blog, catalog), [blog, catalog]);
  const articleFaqs = blog ? [
    { question: `What should I check before arranging ${blog.title.toLowerCase()} help?`, answer: "Note the exact symptom, when it started, unusual sounds or smells, and any recent power or usage change. Stop using equipment immediately if there is smoke, sparking, overheating or exposed wiring." },
    { question: "When is professional diagnosis recommended?", answer: "Professional diagnosis is recommended when basic safe checks do not resolve the issue, the fault returns, a component needs opening, or electrical, gas, refrigerant and sealed-system work may be involved." },
    { question: "How can I avoid unnecessary replacement costs?", answer: "Ask for the diagnosed cause and an itemised estimate before approving parts. Similar symptoms can come from different components, so testing should happen before replacement." }
  ] : [];
  const articleSchemas = blog ? [articleSchema, { "@context":"https://schema.org", "@type":"ImageObject", contentUrl:blogVisual(blog), url:blogVisual(blog), name:blog.title, caption:`${blog.title} — LocalPintu expert guide`, description:blog.excerpt, representativeOfPage:true }, { "@context":"https://schema.org", "@type":"BreadcrumbList", itemListElement:[{ "@type":"ListItem", position:1, name:"Home", item:siteUrl },{ "@type":"ListItem", position:2, name:"Blogs", item:`${siteUrl}/blogs` },{ "@type":"ListItem", position:3, name:blog.title, item:articleUrl }] }, { "@context":"https://schema.org", "@type":"FAQPage", mainEntity:articleFaqs.map((item) => ({ "@type":"Question", name:item.question, acceptedAnswer:{ "@type":"Answer", text:item.answer } })) }] : [];

  return (
    <>
      <Nav />
      <main className="blog-detail-page">
        {loading && <div className="blog-detail-state"><FiBookOpen /><p>Preparing your expert guide...</p></div>}
        {!loading && error && <div className="blog-detail-state blog-detail-state--error"><p>{error}</p></div>}
        {!loading && !error && !blog && <div className="blog-detail-state blog-detail-state--error"><p>This blog was not found.</p><Link to="/blogs">Browse all guides</Link></div>}
        {!loading && !error && blog && <><Helmet>
          <title>{`${blog.title} | LocalPintu`}</title><meta name="description" content={blog.excerpt}/><meta name="keywords" content={articleKeywords.join(", ")}/><link rel="canonical" href={articleUrl}/>
          <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1"/><meta name="author" content={blog.author?.name || "LocalPintu Editorial Team"}/><meta name="article:reading_time" content={blogReadingTime(blog)}/><meta name="news_keywords" content={articleKeywords.join(", ")}/>{articleKeywords.slice(1).map((keyword)=><meta property="article:tag" content={keyword} key={keyword}/>)}<meta property="og:type" content="article"/><meta property="og:title" content={blog.title}/><meta property="og:description" content={blog.excerpt}/><meta property="og:url" content={articleUrl}/><meta property="og:image" content={blogVisual(blog)}/><meta property="article:published_time" content={blog.createdAt}/><meta property="article:modified_time" content={blog.updatedAt || blog.createdAt}/><meta property="article:section" content={blog.category || "Home care"}/><meta name="twitter:card" content="summary_large_image"/><meta name="twitter:title" content={blog.title}/><meta name="twitter:description" content={blog.excerpt}/><meta name="twitter:image" content={blogVisual(blog)}/><script type="application/ld+json">{JSON.stringify(articleSchemas)}</script>
        </Helmet>
          <article className="blog-detail-article">
            <header className="blog-detail-header">
              <Link className="blog-detail-back" to="/blogs"><FiArrowLeft /> Back to journal</Link>
              <span className="blog-detail-category">{blog.category || "Home care"}</span>
              <h1>{blog.title}</h1>
              <p>{blog.excerpt}</p>
              <div className="blog-detail-meta"><span><FiCalendar /> <time dateTime={blog.createdAt}>{blogPublishDate(blog)}</time></span><span><FiClock /> {blogReadingTime(blog)}</span><span><FiShield /> Expert reviewed</span></div><div className="blog-detail-assurance"><span><strong>Local insight</strong><small>Vaishali Nagar service context</small></span><span><strong>Diagnosis first</strong><small>Cause before replacement</small></span><span><strong>Safer decisions</strong><small>Repair and maintenance guidance</small></span></div>
            </header>

            <figure className="blog-detail-cover"><img src={blogVisual(blog)} alt={`${blog.title} — LocalPintu expert guide`} title={blog.title} decoding="async" width="1200" height="675" /><figcaption><FiTool /> {blog.title} — practical advice from LocalPintu home-care professionals</figcaption></figure>

            <div className="blog-detail-layout">
              <aside className="blog-detail-aside">
                <div className="blog-detail-toc"><small>In this guide</small><a href="#overview">Overview</a><a href="#expert-notes">Expert notes</a><a href="#next-step">Next step</a></div>
                <div className="blog-detail-help"><FiShield /><strong>Need professional help?</strong><p>Choose a verified expert and convenient doorstep slot.</p><Link to={relatedService.to}>{relatedService.label} <FiArrowRight /></Link></div>
                {relatedPlans.length > 0 && <section className="blog-related-plans" aria-labelledby="related-plans-title"><span>Recommended for this guide</span><h2 id="related-plans-title">Related service plans</h2>{relatedPlans.map(({ plan, child, category, service }, index) => <Link className="blog-related-plan" key={plan._id} to={`/applications/${service.slug}/${category.slug}/${child.slug}/${plan.slug}`}><ServicePlanImage plan={plan} index={index} alt="" loading="lazy" /><div><small>{child.title}</small><strong>{plan.title}</strong><b>{money(plan.customerPrice ?? plan.offerPrice ?? plan.price)}</b></div><FiArrowRight /></Link>)}</section>}
              </aside>

              <div className="blog-detail-body">
                <section id="overview"><span className="blog-detail-section-label">01 · Overview</span>{paragraphs.slice(0, 2).map((paragraph, index) => index === 0 ? <p className="blog-detail-lead" key={paragraph}>{paragraph}</p> : <p key={paragraph}>{paragraph}</p>)}</section>

                {takeaways.length > 0 && <div className="blog-detail-takeaways"><div><FiCheck /><span><small>Quick reference</small><strong>What to remember</strong></span></div><ul>{takeaways.map((item) => <li key={item}><FiCheck /> {item}</li>)}</ul></div>}

                <section id="expert-notes"><span className="blog-detail-section-label">02 · Expert notes</span><h2>Small checks that make a meaningful difference</h2>{paragraphs.slice(2, 5).map((paragraph) => <p key={paragraph}>{paragraph}</p>)}{paragraphs.length < 3 && <p>Regular observation, timely maintenance and choosing the right professional can prevent a small issue from becoming an expensive repair.</p>}</section>

                {paragraphs.length > 5 && <section><h2>More practical guidance</h2>{paragraphs.slice(5).map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</section>}

                                <section className="blog-detail-faq" aria-labelledby="article-faq-title"><span className="blog-detail-section-label">Common questions</span><h2 id="article-faq-title">Questions homeowners also ask</h2>{articleFaqs.map((item)=><details key={item.question}><summary>{item.question}</summary><p>{item.answer}</p></details>)}</section>

                <section className="blog-detail-cta" id="next-step"><span><FiTool /></span><div><small>LocalPintu professional care</small><h2>Prefer an expert to handle it?</h2><p>Browse clear service plans and book a convenient visit for your home.</p></div><Link to={relatedService.to}>Find a service <FiArrowRight /></Link></section>
                <section className="blog-detail-service-link" aria-label="Related LocalPintu service"><span className="blog-detail-section-label">Related Jaipur service</span><h2>Need help with this at home?</h2><p>{relatedService.text}</p><Link to={relatedService.to}>{relatedService.label} <FiArrowRight /></Link></section>
                <nav className="blog-detail-internal-links" aria-label="Useful LocalPintu links"><strong>Useful LocalPintu links</strong><Link to={relatedService.to}>{relatedService.label}</Link><Link to="/applications">Browse all home services</Link><Link to="/contact">Contact LocalPintu support</Link></nav>
              </div>
            </div>
          </article>

          {(previousArticle || nextArticle) && <nav className="blog-detail-pagination" aria-label="Previous and next articles">{previousArticle?<Link to={`/blogs/${previousArticle.slug}`}><small>Previous guide</small><strong>{previousArticle.title}</strong></Link>:<span/>}{nextArticle?<Link to={`/blogs/${nextArticle.slug}`}><small>Next guide</small><strong>{nextArticle.title}</strong></Link>:null}</nav>}

          {related.length > 0 && <section className="blog-detail-related"><div className="blog-detail-related__head"><div><span><FiGrid /> Continue reading</span><h2>Related expert guides</h2></div><Link to="/blogs">View all articles <FiArrowRight /></Link></div><div className="blog-detail-related__grid">{related.map((item) => <article key={item._id || item.slug}><Link className="blog-detail-related__image" to={`/blogs/${item.slug}`}><img src={blogVisual(item)} alt={item.title} loading="lazy" /></Link><div><span>{item.category || "Home care"}</span><h3><Link to={`/blogs/${item.slug}`}>{item.title}</Link></h3><small>{blogReadingTime(item)}</small></div></article>)}</div></section>}
        </>}
      </main>
      <Footer />
    </>
  );
};

export default BlogDetails;
