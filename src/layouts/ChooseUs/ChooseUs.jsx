// // import "../../styles/Home/ChooseUs.css";
// // import chooseUsImg from  "../../assets/images/choose_us_img.optimized.webp"

// // import {
// //   FaCalendarAlt,
// //   FaTags,
// //   FaShieldAlt,
// //   FaHeadset,
// //   FaThumbsUp,
// //   FaPhoneAlt,
// //   FaClock,
// //   FaUserCog,
// // } from "react-icons/fa";

// // const cards = [
// //   {
// //     icon: <FaCalendarAlt />,
// //     title: "Same-Day Repair Visits",
// //     desc: "Quick and reliable doorstep service.",
// //   },
// //   {
// //     icon: <FaTags />,
// //     title: "Affordable Pricing",
// //     desc: "Transparent pricing with no hidden charges.",
// //   },
// //   {
// //     icon: <FaShieldAlt />,
// //     title: "Verified Technicians",
// //     desc: "Certified and background verified.",
// //   },
// //   {
// //     icon: <FaHeadset />,
// //     title: "Quick Support",
// //     desc: "Fast assistance even after service.",
// //   },
// // ];

// // const ChooseUs = () => {
// //   return (
// //     <section className="choose-us">

// //       <div className="choose-container">

// //         {/* LEFT */}

// //         <div className="choose-left">
// //           <img src={chooseUsImg} alt="" />
// //         </div>

// //         {/* RIGHT */}

// //         <div className="choose-right">

// //           <span className="choose-badge">
// //             WHY CHOOSE US
// //           </span>

// //           <h2>
// //             Trusted Service. Genuine Care.
// //             <span> Complete Peace of Mind.</span>
// //           </h2>

// //           <p>
// //             We provide a 3-Month Free Service Warranty on all
// //             home appliance repairs.
// //           </p>

// //           <div className="choose-grid">
// //             {cards.map((item, index) => (
// //               <div className="choose-card" key={index}>
// //                 <div className="choose-icon">
// //                   {item.icon}
// //                 </div>

// //                 <div>
// //                   <h4>{item.title}</h4>
// //                   <p>{item.desc}</p>
// //                 </div>
// //               </div>
// //             ))}
// //           </div>

// //           <div className="choose-bottom-box">
// //             <div>
// //               <FaShieldAlt />
// //               <div>
// //                 <h4>100% Satisfaction</h4>
// //                 <p>Guaranteed Service</p>
// //               </div>
// //             </div>

// //             <div>
// //               <FaThumbsUp />
// //               <div>
// //                 <h4>No Fix, No Charge</h4>
// //                 <p>Honest Service Policy</p>
// //               </div>
// //             </div>
// //           </div>

// //         </div>
// //       </div>

// //       {/* Bottom Bar */}

// //       <div className="choose-features">

// //         <div>
// //           <FaPhoneAlt />
// //           <span>90 Days Warranty</span>
// //         </div>

// //         <div>
// //           <FaUserCog />
// //           <span>Expert Technicians</span>
// //         </div>

// //         <div>
// //           <FaClock />
// //           <span>Same Day Service</span>
// //         </div>

// //         <div>
// //           <FaTags />
// //           <span>Affordable Pricing</span>
// //         </div>

// //       </div>
// //     </section>
// //   );
// // };

// // export default ChooseUs;











// import "../../styles/Home/ChooseUs.css";

// import chooseUsImg from  "../../assets/images/choose_us_img.optimized.webp"

// import {
//   FaCalendarAlt,
//   FaTags,
//   FaShieldAlt,
//   FaHeadset,
//   FaThumbsUp,
//   FaPhoneAlt,
//   FaClock,
//   FaUserCog,
// } from "react-icons/fa";

// const cards = [
//   {
//     icon: <FaCalendarAlt />,
//     title: "Same-Day Repair Visits",
//     desc: "We value your time and ensure quick doorstep service.",
//   },
//   {
//     icon: <FaTags />,
//     title: "Affordable & Clear Pricing",
//     desc: "Transparent pricing with no hidden charges.",
//   },
//   {
//     icon: <FaShieldAlt />,
//     title: "Verified Technicians",
//     desc: "Certified and background verified experts.",
//   },
//   {
//     icon: <FaHeadset />,
//     title: "Quick Support",
//     desc: "We're always here to help after service.",
//   },
// ];

// const ChooseUs = () => {
//   return (
//     <section className="choose-us">
//       <div className="choose-container">

//         {/* LEFT IMAGE */}

//         <div className="choose-left" data-reveal="left">
//           <img src={chooseUsImg} alt="Choose Us" />

//           <div className="choose-overlay">
//             <span className="choose-badge">
//               WHY CHOOSE US
//             </span>

          

//           <p>
//  Enjoy a <span>3-Month Free Service Warranty</span>. If the same issue returns, we provide a free revisit and repair.
// </p>
//           </div>
//         </div>

//         {/* RIGHT SIDE */}

//         <div className="choose-right">

//           <div className="choose-grid">
//             {cards.map((item, index) => (
//               <div
//                 className="choose-card"
//                 key={item.title}
//                 data-reveal="up"
//                 style={{ "--reveal-delay": `${index * 80}ms` }}
//               >
//                 <div className="choose-icon">
//                   {item.icon}
//                 </div>

//                 <div>
//                   <h4>{item.title}</h4>
//                   <p>{item.desc}</p>
//                 </div>
//               </div>
//             ))}
//           </div>

//           <div className="choose-bottom-box" data-reveal="up">

//             <div>
//               <FaShieldAlt />
//               <div>
//                 <h4>100% Satisfaction</h4>
//                 <p>Guaranteed Service</p>
//               </div>
//             </div>

//             <div>
//               <FaThumbsUp />
//               <div>
//                 <h4>No Fix, No Charge</h4>
//                 <p>Honest Service Policy</p>
//               </div>
//             </div>

//           </div>
//         </div>
//       </div>

//       {/* Bottom Features */}

//       <div className="choose-features">

//         <div data-reveal="up" style={{ "--reveal-delay": "0ms" }}>
//           <FaPhoneAlt />
//           <div>
//             <h4>90 Days Warranty</h4>
//             <p>On All Repairs</p>
//           </div>
//         </div>

//         <div data-reveal="up" style={{ "--reveal-delay": "80ms" }}>
//           <FaUserCog />
//           <div>
//             <h4>Expert Technicians</h4>
//             <p>Verified Professionals</p>
//           </div>
//         </div>

//         <div data-reveal="up" style={{ "--reveal-delay": "160ms" }}>
//           <FaClock />
//           <div>
//             <h4>Same Day Service</h4>
//             <p>Quick & Reliable</p>
//           </div>
//         </div>

//         <div data-reveal="up" style={{ "--reveal-delay": "240ms" }}>
//           <FaTags />
//           <div>
//             <h4>Affordable Pricing</h4>
//             <p>No Hidden Charges</p>
//           </div>
//         </div>

//       </div>
//     </section>
//   );
// };

// export default ChooseUs;