import { API_BASE } from "../services/apiConfig";
import { serviceVisual } from "../utils/premiumAssets";

export default function ServicePlanImage({ plan, index = null, ...props }) {
  const fallback = serviceVisual({ ...plan, image: null }, index);
  const source = !plan.image && plan._id
    ? `${API_BASE}/service-plans/${encodeURIComponent(plan._id)}/image?v=${encodeURIComponent(plan.updatedAt || "")}`
    : serviceVisual(plan, index);
  return <img decoding="async" {...props} src={source} alt={props.alt ?? plan.title} onError={event => {
    if (event.currentTarget.getAttribute("src") !== fallback) event.currentTarget.src = fallback;
  }} />;
}
