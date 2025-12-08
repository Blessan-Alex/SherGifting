import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

interface CandyCaneStripeProps {
  orientation?: 'horizontal' | 'vertical';
  width?: string;
  height?: string;
  animated?: boolean;
  className?: string;
}

const CandyCaneStripe: React.FC<CandyCaneStripeProps> = ({
  orientation = 'horizontal',
  width = 'w-full',
  height = 'h-0.5',
  animated = false,
  className = '',
}) => {
  const { theme } = useTheme();
  const shouldReduceMotion = useReducedMotion();

  // Only show on Christmas theme
  if (theme !== 'christmas') return null;

  const stripeWidth = orientation === 'horizontal' ? width : height;
  const stripeHeight = orientation === 'horizontal' ? height : width;

  // Candy-cane colors: red and white/cream
  const stripePattern = 'repeating-linear-gradient(' +
    (orientation === 'horizontal' ? '90deg' : '0deg') + ', ' +
    '#EB6A46 0px, #EB6A46 4px, ' +
    'rgba(255, 255, 255, 0.9) 4px, rgba(255, 255, 255, 0.9) 8px' +
    ')';

  return (
    <motion.div
      className={`${stripeWidth} ${stripeHeight} ${className}`}
      style={{
        background: stripePattern,
      }}
      animate={
        animated && !shouldReduceMotion
          ? {
              backgroundPosition: orientation === 'horizontal' 
                ? ['0% 0%', '100% 0%', '0% 0%']
                : ['0% 0%', '0% 100%', '0% 0%'],
            }
          : {}
      }
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'linear',
      }}
      aria-hidden="true"
    />
  );
};

export default CandyCaneStripe;











