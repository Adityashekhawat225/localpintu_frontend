import { useEffect, useRef, useState } from "react";
import { getServicePlan } from "../services/api";
import { serviceVisual } from "../utils/premiumAssets";

// The catalogue omits embedded artwork. Fetch only a visible plan's detail,
// using the API client's short cache and in-flight request deduplication.
export default function ServicePlanImage({ plan, index = null, ...props }) {
  const ref = useRef(null);
  const [image, setImage] = useState(null);
  useEffect(() => {
    let active = true;
    setImage(null);
    if (plan.image || !plan._id) return undefined;
    const load = () => getServicePlan(plan._id).then(detail => {
      if (active && detail?.image) setImage({ id: plan._id, value: detail.image });
    }).catch(() => {});
    let observer;
    if (typeof IntersectionObserver === "undefined") load();
    else {
      observer = new IntersectionObserver(entries => {
        if (entries.some(entry => entry.isIntersecting)) { observer.disconnect(); load(); }
      }, { rootMargin: "200px" });
      observer.observe(ref.current);
    }
    return () => { active = false; observer?.disconnect(); };
  }, [plan._id, plan.image]);
  const source = serviceVisual({ ...plan, image: image?.id === plan._id ? image.value : plan.image }, index);
  const fallback = serviceVisual({ ...plan, image: null }, index);
  return <img {...props} ref={ref} src={source} alt={props.alt ?? plan.title} onError={event => {
    if (event.currentTarget.getAttribute("src") !== fallback) event.currentTarget.src = fallback;
  }} />;
}
