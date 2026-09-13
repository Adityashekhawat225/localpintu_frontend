import { lazy, Suspense, useEffect, useRef, useState } from "react";
import Nav from "../layouts/nav";
import Hero from "../layouts/Hero/Hero";
import "../styles/Home/premiumTheme.css";

const Services=lazy(()=>import("../layouts/Services/Services"));
const VideoSection=lazy(()=>import("../layouts/VideoSection/VideoSection"));
const Stats=lazy(()=>import("../layouts/Stats/Stats"));
const LatestBlogs=lazy(()=>import("../layouts/LatestBlogs/LatestBlogs"));
const SeoContent=lazy(()=>import("../components/SeoContent"));
const Footer=lazy(()=>import("../layouts/Footer"));

function DeferredSection({children,minHeight=520,margin="300px"}){
  const ref=useRef(null),[visible,setVisible]=useState(false);
  useEffect(()=>{if(visible)return;const node=ref.current;if(!node)return;const observer=new IntersectionObserver(([entry])=>{if(entry.isIntersecting){setVisible(true);observer.disconnect()}},{rootMargin:`${margin} 0px`});observer.observe(node);return()=>observer.disconnect()},[visible,margin]);
  return <div ref={ref} style={visible?undefined:{minHeight}}>{visible?<Suspense fallback={null}>{children}</Suspense>:null}</div>;
}

export default function Home(){return <><Nav/><main className="premium-home"><Hero/><DeferredSection minHeight={800}><Services/></DeferredSection><DeferredSection><VideoSection/></DeferredSection><DeferredSection><Stats/></DeferredSection><DeferredSection><LatestBlogs/></DeferredSection><DeferredSection minHeight={400}><SeoContent/></DeferredSection></main><DeferredSection minHeight={500}><Footer/></DeferredSection></>}
