import React, { ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useScrollReveal } from '../../hooks/useScrollReveal';

interface ScrollRevealProps {
  children: ReactNode;
  variant?: 'fade-in' | 'slide-up' | 'slide-left' | 'slide-right' | 'scale-in';
  delay?: number;
  duration?: number;
  stagger?: boolean;
  staggerDelay?: number;
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
  disabled?: boolean;
  className?: string;
}

const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  variant = 'fade-in',
  delay = 0,
  duration = 0.5,
  stagger = false,
  staggerDelay = 0.1,
  threshold = 0.1,
  rootMargin = '0px',
  triggerOnce = true,
  disabled = false,
  className = '',
}) => {
  const shouldReduceMotion = useReducedMotion();
  const { ref, isVisible } = useScrollReveal({
    threshold,
    rootMargin,
    triggerOnce,
    disabled: disabled || shouldReduceMotion,
  });

  // Animation variants
  const getVariants = () => {
    if (shouldReduceMotion) {
      return {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
      };
    }

    switch (variant) {
      case 'slide-up':
        return {
          hidden: { opacity: 0, y: 30 },
          visible: { opacity: 1, y: 0 },
        };
      case 'slide-left':
        return {
          hidden: { opacity: 0, x: -30 },
          visible: { opacity: 1, x: 0 },
        };
      case 'slide-right':
        return {
          hidden: { opacity: 0, x: 30 },
          visible: { opacity: 1, x: 0 },
        };
      case 'scale-in':
        return {
          hidden: { opacity: 0, scale: 0.9 },
          visible: { opacity: 1, scale: 1 },
        };
      case 'fade-in':
      default:
        return {
          hidden: { opacity: 0 },
          visible: { opacity: 1 },
        };
    }
  };

  const variants = getVariants();

  // Handle stagger for children
  if (stagger && React.Children.count(children) > 1) {
    return (
      <div ref={ref as React.RefObject<HTMLDivElement>} className={className}>
        {React.Children.map(children, (child, index) => (
          <motion.div
            key={index}
            initial="hidden"
            animate={isVisible ? 'visible' : 'hidden'}
            variants={variants}
            transition={{
              duration,
              delay: delay + index * staggerDelay,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            {child}
          </motion.div>
        ))}
      </div>
    );
  }

  return (
    <motion.div
      ref={ref as React.RefObject<HTMLDivElement>}
      initial="hidden"
      animate={isVisible ? 'visible' : 'hidden'}
      variants={variants}
      transition={{
        duration,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default ScrollReveal;




