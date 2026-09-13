import { AnimatePresence, motion } from "./motionLite";

export { AnimatePresence, motion };
export const ease = [0.22, 1, 0.36, 1];
export const pageTransition = { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -6 }, transition: { duration: 0.34, ease } };
export const sectionReveal = { initial: { opacity: 0, y: 28 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.14 }, transition: { duration: 0.56, ease } };
export const cardMotion = { initial: { opacity: 0, y: 18 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.14 }, whileHover: { y: -6 }, whileTap: { scale: 0.985 }, layout: true, transition: { duration: 0.3, ease } };
export const buttonMotion = { whileHover: { y: -2, scale: 1.015 }, whileTap: { y: 0, scale: 0.98 }, transition: { duration: 0.18, ease } };
export const imageMotion = { initial: { opacity: 0, scale: 0.97 }, whileInView: { opacity: 1, scale: 1 }, viewport: { once: true, amount: 0.18 }, whileHover: { scale: 1.025 }, transition: { duration: 0.48, ease } };