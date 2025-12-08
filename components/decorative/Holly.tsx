import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

interface HollyProps {
  size?: number;
  berries?: boolean;
  glow?: boolean;
  className?: string;
}

const Holly: React.FC<HollyProps> = ({
  size = 16,
  berries = true,
  glow = true,
  className = '',
}) => {
  const { theme } = useTheme();
  const shouldReduceMotion = useReducedMotion();

  // Get theme-aware colors
  const getColors = () => {
    if (theme === 'christmas') {
      return {
        leaf: '#10B981', // Green
        berry: '#EF4444', // Red
        glow: 'rgba(16, 185, 129, 0.3)',
      };
    }
    // For other themes, use teal/green variants
    return {
      leaf: '#06B6D4',
      berry: '#EB6A46',
      glow: 'rgba(6, 182, 212, 0.3)',
    };
  };

  const colors = getColors();

  return (
    <motion.div
      className={`inline-flex items-center justify-center ${className}`}
      animate={
        !shouldReduceMotion
          ? {
              rotate: [0, 2, -2, 0],
            }
          : {}
      }
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      style={
        glow
          ? {
              filter: `drop-shadow(0 0 3px ${colors.glow})`,
            }
          : {}
      }
      aria-hidden="true"
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Holly leaves */}
        <path
          d="M12 2C10 4 8 6 8 10C8 12 9 14 12 18C15 14 16 12 16 10C16 6 14 4 12 2Z"
          fill={colors.leaf}
          opacity="0.8"
        />
        <path
          d="M8 10C8 8 9 6 11 4C9 6 8 8 8 10Z"
          fill={colors.leaf}
          opacity="0.6"
        />
        <path
          d="M16 10C16 8 15 6 13 4C15 6 16 8 16 10Z"
          fill={colors.leaf}
          opacity="0.6"
        />
        {/* Berries */}
        {berries && (
          <>
            <circle cx="10" cy="12" r="2" fill={colors.berry} />
            <circle cx="14" cy="12" r="2" fill={colors.berry} />
          </>
        )}
      </svg>
    </motion.div>
  );
};

export default Holly;











