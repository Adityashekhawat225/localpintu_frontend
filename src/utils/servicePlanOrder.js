// Keep other plans in their existing slots; group only washing machine variants.
export function orderServicePlans(plans) {
  const rank = (plan) => {
    const title = String(plan.title || plan.slug || "").toLowerCase().replace(/-/g, " ");
    if (!/washing\s+machine/.test(title)) return null;
    const type = /\bsemi\s*auto(?:matic)?\b/.test(title) ? 0
      : /\bfully?\s*auto(?:matic)?\b/.test(title) ? 2 : null;
    return type === null ? null : type + (/\bdeep\b/.test(title) ? 1 : 0);
  };
  const washingPlans = plans.filter(plan => rank(plan) !== null).sort((a, b) => rank(a) - rank(b));
  let next = 0;
  return plans.map(plan => rank(plan) === null ? plan : washingPlans[next++]);
}
