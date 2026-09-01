import { type Transition, type Variants } from "framer-motion";

// Spring Physics Presets
export const springSnappy: Transition = {
  type: "spring",
  stiffness: 400,
  damping: 30,
};

export const springSmooth: Transition = {
  type: "spring",
  stiffness: 260,
  damping: 20,
};

export const springGentle: Transition = {
  type: "spring",
  stiffness: 180,
  damping: 24,
};

export const springDrawer: Transition = {
  type: "spring",
  damping: 30,
  stiffness: 300,
};

// View Transition Variants
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.2, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.15, ease: "easeIn" },
  },
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.15, ease: "easeIn" },
  },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: springSmooth,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.15, ease: "easeIn" },
  },
};

export const popIn: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: springSnappy,
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    transition: { duration: 0.15 },
  },
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.02,
    },
  },
};

// Micro-interaction Tokens
export const cardHover = {
  y: -2,
  transition: springSnappy,
};

export const cardTap = {
  scale: 0.98,
  transition: springSnappy,
};

export const buttonHover = {
  scale: 1.02,
  transition: springSnappy,
};

export const buttonTap = {
  scale: 0.96,
  transition: springSnappy,
};

export const chipTap = {
  scale: 0.94,
  transition: springSnappy,
};
