import {writeFile} from "node:fs/promises";
const site=(process.env.VITE_SITE_URL||"https://localpintu.com").replace(/\/$/,"");const api=(process.env.VITE_API_BASE_URL||"https://api.localpintu.com/api").replace(/\/$/,"");
const urls=new Map([["/",{}],["/about",{}],["/blogs",{}],["/faqs",{}],["/contact",{}]]);
const id=(value)=>typeof value==="object"&&value?String(value._id||value.id||""):String(value||"");
const add=(path,modified)=>{if(path&&!urls.has(path))urls.set(path,{modified});};
const lastmod=(value)=>{const date=new Date(value);return Number.isNaN(date.getTime())?"":date.toISOString();};
try{
  const get=(path)=>fetch(`${api}${path}`).then(response=>response.ok?response.json():{});
  const [serviceResponse,categoryResponse,childResponse,planResponse,blogResponse]=await Promise.all([
    get("/appliance-services"),get("/service-categories"),get("/child-services"),get("/service-plans"),get("/blogs")
  ]);
  const services=(serviceResponse.services||[]).filter(item=>item.isActive!==false&&item.slug);
  const categories=(categoryResponse.serviceCategories||[]).filter(item=>item.isActive!==false&&item.slug);
  const children=(childResponse.childServices||[]).filter(item=>item.isActive!==false&&item.slug);
  const plans=(planResponse.servicePlans||[]).filter(item=>item.isActive!==false&&item.slug);
  const serviceById=new Map(services.map(item=>[id(item._id),item]));
  const categoryById=new Map(categories.map(item=>[id(item._id),item]));
  for(const service of services)add(`/applications/${service.slug}`,service.updatedAt);
  for(const category of categories){const service=serviceById.get(id(category.serviceId));if(service)add(`/applications/${service.slug}/${category.slug}`,category.updatedAt||service.updatedAt);}
  for(const child of children){const category=categoryById.get(id(child.categoryId));const service=category&&serviceById.get(id(category.serviceId));if(service&&category)add(`/applications/${service.slug}/${category.slug}/${child.slug}`,child.updatedAt||category.updatedAt);}
  for(const plan of plans){const child=children.find(item=>id(item._id)===id(plan.childServiceId));const category=child&&categoryById.get(id(child.categoryId));const service=category&&serviceById.get(id(category.serviceId));if(service&&category&&child)add(`/applications/${service.slug}/${category.slug}/${child.slug}/${plan.slug}`,plan.updatedAt||child.updatedAt);}
  for(const blog of blogResponse.blogs||[])if(blog.isActive!==false&&blog.slug)add(`/blogs/${blog.slug}`,blog.updatedAt||blog.createdAt);
}catch{console.warn("SEO sitemap: API unavailable; generated core public URLs only.");}
const body=[...urls].map(([path,data])=>`  <url><loc>${site}${path==="/"?"":path}</loc>${lastmod(data.modified)?`<lastmod>${lastmod(data.modified)}</lastmod>`:""}</url>`).join("\n");
await writeFile(new URL("../public/sitemap.xml",import.meta.url),`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`);
console.log(`SEO sitemap: ${urls.size} canonical URLs generated.`);
