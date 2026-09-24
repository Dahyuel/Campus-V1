import { Variants, Transition } from 'framer-motion';

export const easeOut: Transition['ease'] = [0.16, 1, 0.3, 1];
export const easeSoft: Transition['ease'] = [0.22, 1, 0.36, 1];

export const springSoft: Transition = {
  type: 'spring',
  stiffness: 260,
  damping: 26,
  mass: 0.9,
};

export const pageVariants: Variants = {
  hidden: { opacity: 0, y: 12, filter: 'blur(4px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.4, ease: easeSoft },
  },
};

export const listContainer = (stagger = 0.08, delayChildren = 0.05): Variants => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: stagger, delayChildren },
  },
});

export const listItem: Variants = {
  hidden: { opacity: 0, y: 18, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: easeSoft },
  },
};

export const cardHover = {
  whileHover: { y: -5, scale: 1.015, transition: springSoft },
  whileTap: { scale: 0.985, transition: { duration: 0.1 } },
};

export const rowHover = {
  whileHover: { backgroundColor: 'rgba(50,86,168,0.04)' },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.35, ease: easeSoft } },
};

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -24 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: easeSoft } },
};

export const barGrow = (delay = 0): Variants => ({
  hidden: { scaleY: 0, originY: 1 },
  visible: { scaleY: 1, transition: { duration: 0.7, ease: easeSoft, delay } },
});

export const barFill = (delay = 0): Variants => ({
  hidden: { scaleX: 0 },
  visible: { scaleX: 1, transition: { duration: 0.8, ease: easeSoft, delay } },
});
