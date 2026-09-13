import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiArrowRight, FiCheck, FiClock, FiCopy, FiGift, FiShield, FiX } from "react-icons/fi";
import { Link } from "react-router-dom";
import { toast } from "../utils/toast";
import { getOffers } from "../services/api";
import "./OfferPopup.css";
const targetName=(offer)=>offer.productId?.name||offer.servicePlanId?.title||offer.childServiceId?.title||offer.categoryId?.title||offer.serviceId?.title||"All LocalPintu services";
const discount=(offer)=>offer.discountType==="percentage"?`${offer.discountValue}% OFF`:offer.discountType==="flat"?`₹${Number(offer.discountValue).toLocaleString("en-IN")} OFF`:"SPECIAL OFFER";
const keyFor=(offer)=>`localpintu-offer-${offer._id}-${new Date(offer.updatedAt||offer.createdAt||0).getTime()}`;
const wasSeen=(offer)=>{if(offer.displayRule==="always")return false;if(offer.displayRule==="session")return sessionStorage.getItem(keyFor(offer))==="1";return localStorage.getItem(keyFor(offer))===new Date().toISOString().slice(0,10)};
const markSeen=(offer)=>{if(offer.displayRule==="session")sessionStorage.setItem(keyFor(offer),"1");if(offer.displayRule==="daily")localStorage.setItem(keyFor(offer),new Date().toISOString().slice(0,10));};
export default function OfferPopup(){
 const[offer,setOffer]=useState(null),[open,setOpen]=useState(false),[remaining,setRemaining]=useState("");
 useEffect(()=>{let alive=true,openTimer;getOffers({active:true,popup:true}).then((items)=>{const eligible=items.find((item)=>!wasSeen(item));if(alive&&eligible){setOffer(eligible);openTimer=setTimeout(()=>setOpen(true),800)}}).catch(()=>{});return()=>{alive=false;clearTimeout(openTimer)}},[]);
 useEffect(()=>{if(!offer)return;const tick=()=>{const ms=Math.max(0,new Date(offer.endsAt)-Date.now()),days=Math.floor(ms/86400000),hours=Math.floor(ms%86400000/3600000),minutes=Math.floor(ms%3600000/60000);setRemaining(days?`${days}d ${hours}h left`:`${hours}h ${minutes}m left`)};tick();const id=setInterval(tick,60000);return()=>clearInterval(id)},[offer]);
 useEffect(()=>{if(!open)return;document.body.classList.add("offer-popup-open");const close=(event)=>{if(event.key==="Escape"){markSeen(offer);setOpen(false)}};window.addEventListener("keydown",close);return()=>{document.body.classList.remove("offer-popup-open");window.removeEventListener("keydown",close)}},[open,offer]);
 const visual=useMemo(()=>offer?.image||offer?.productId?.image||"",[offer]);const close=()=>{markSeen(offer);setOpen(false)};const copy=async()=>{localStorage.setItem("localpintu-pending-coupon",offer.couponCode);await navigator.clipboard.writeText(offer.couponCode);toast.success("Offer code copied",{description:offer.couponCode})};
 return <AnimatePresence>{open&&offer?<motion.div className="offer-popup" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onMouseDown={(e)=>{if(e.target===e.currentTarget)close()}}><motion.section role="dialog" aria-modal="true" aria-labelledby="offer-popup-title" initial={{opacity:0,y:28,scale:.96}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,y:16,scale:.97}} transition={{duration:.34,ease:[.22,1,.36,1]}}>
 <button className="offer-popup__close" onClick={close} aria-label="Close offer"><FiX/></button>
 <div className="offer-popup__visual">{visual?<img src={visual} alt={offer.imageAlt} loading="lazy" decoding="async"/>:<div><FiGift/><span>{discount(offer)}</span></div>}<i>{offer.badge}</i><small><FiClock/>{remaining}</small></div>
 <div className="offer-popup__content"><span className="offer-popup__eyebrow"><FiGift/> Exclusive LocalPintu offer</span><h2 id="offer-popup-title">{offer.title}</h2><p>{offer.subtitle}</p><div className="offer-popup__target"><FiCheck/><span><small>Valid on</small><strong>{targetName(offer)}</strong></span></div>
 {offer.couponCode?<button className="offer-popup__code" onClick={copy}><span><small>Use code</small><strong>{offer.couponCode}</strong></span><FiCopy/></button>:null}
 <div className="offer-popup__actions"><Link to={offer.ctaPath||"/applications"} onClick={close}>{offer.ctaLabel||"Explore offer"}<FiArrowRight/></Link><button onClick={close}>Maybe later</button></div>
 <footer><FiShield/><span>{offer.terms}</span></footer></div>
 </motion.section></motion.div>:null}</AnimatePresence>
}
