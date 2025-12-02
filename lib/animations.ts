import { useReducedMotion as useFramerReducedMotion } from 'framer-motion';
import { Variants } from 'framer-motion';

/**
 * Wrapper around Framer Motion's useReducedMotion hook
 * Returns true if user prefers reduced motion
 */
export const useReducedMotion = (): boolean => {
  return useFramerReducedMotion() ?? false;
};

/**
 * Creates a shimmer effect configuration
 * @param duration - Animation duration in seconds (default: 2)
 */
export const createShimmerEffect = (duration = 2) => ({
  background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)',
  backgroundSize: '200% 100%',
  animation: `shimmer ${duration}s infinite linear`,
});

/**
 * Creates a pulse effect configuration
 * @param minOpacity - Minimum opacity (default: 0.5)
 * @param maxOpacity - Maximum opacity (default: 1)
 * @param duration - Animation duration in seconds (default: 2)
 */
export const createPulseEffect = (minOpacity = 0.5, maxOpacity = 1, duration = 2) => ({
  animation: `pulse ${duration}s infinite ease-in-out`,
  opacity: minOpacity,
});

/**
 * Creates a floating effect configuration
 * @param distance - Vertical distance in pixels (default: 20)
 * @param duration - Animation duration in seconds (default: 3)
 */
export const createFloatEffect = (distance = 20, duration = 3) => ({
  animation: `float ${duration}s infinite ease-in-out`,
  transform: `translateY(0)`,
});

/**
 * Linear interpolation utility
 * @param start - Starting value
 * @param end - Ending value
 * @param factor - Interpolation factor (0-1)
 * @returns Interpolated value
 */
export const lerp = (start: number, end: number, factor: number): number => {
  return start + (end - start) * factor;
};

/**
 * Animation variants for scroll reveals
 */
export const scrollRevealVariants: Record<string, Variants> = {
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
    },
  },
  slideUp: {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
    },
  },
  slideLeft: {
    hidden: { opacity: 0, x: -30 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
    },
  },
  slideRight: {
    hidden: { opacity: 0, x: 30 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
    },
  },
  scaleIn: {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
    },
  },
};

/**
 * Animation variants for modals
 */
export const modalVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: 20,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.16, 1, 0.3, 1],
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: {
      duration: 0.2,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

/**
 * Animation variants for backdrop
 */
export const backdropVariants: Variants = {
  hidden: {
    opacity: 0,
    backdropFilter: 'blur(0px)',
  },
  visible: {
    opacity: 1,
    backdropFilter: 'blur(8px)',
    transition: {
      duration: 0.3,
    },
  },
  exit: {
    opacity: 0,
    backdropFilter: 'blur(0px)',
    transition: {
      duration: 0.2,
    },
  },
};

/**
 * Animation variants for toasts
 */
export const toastVariants: Variants = {
  hidden: {
    opacity: 0,
    x: 300,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      duration: 0.2,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    x: 300,
    scale: 0.95,
    transition: {
      duration: 0.2,
      ease: 'easeIn',
    },
  },
};

/**
 * Common transition presets
 */
export const transitions = {
  spring: {
    type: 'spring' as const,
    stiffness: 300,
    damping: 30,
  },
  smooth: {
    duration: 0.3,
    ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
  },
  bounce: {
    type: 'spring' as const,
    stiffness: 400,
    damping: 10,
  },
  gentle: {
    duration: 0.5,
    ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
  },
};

/**
 * Get theme-aware animation colors
 * @param theme - Current theme ('christmas' | 'newyear' | 'classic')
 * @returns Object with theme-aware colors
 */
export const getThemeAnimationColors = (theme: 'christmas' | 'newyear' | 'classic') => {
  if (theme === 'christmas') {
    return {
      primary: '#EB6A46',
      secondary: '#EF4444',
      glow: 'rgba(235, 106, 70, 0.3)',
      shimmer: 'rgba(235, 106, 70, 0.15)',
    };
  }
  if (theme === 'newyear') {
    return {
      primary: '#FCD34D',
      secondary: '#F59E0B',
      glow: 'rgba(252, 211, 77, 0.3)',
      shimmer: 'rgba(252, 211, 77, 0.15)',
    };
  }
  return {
    primary: '#06B6D4',
    secondary: '#0891B2',
    glow: 'rgba(6, 182, 212, 0.3)',
    shimmer: 'rgba(6, 182, 212, 0.15)',
  };
};

/**
 * Stagger animation helper
 * @param delay - Delay between each item (default: 0.1)
 * @returns Stagger configuration
 */
export const createStagger = (delay: number = 0.1) => ({
  delayChildren: 0,
  staggerChildren: delay,
});
