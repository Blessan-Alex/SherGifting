import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

interface OrnamentProps {
  type?: 'ball' | 'star' | 'bell';
  size?: number;
  glow?: boolean;
  className?: string;
}

const Ornament: React.FC<OrnamentProps> = ({
  type = 'ball',
  size = 16,
  glow = true,
  className = '',
}) => {
  const { theme } = useTheme();
  const shouldReduceMotion = useReducedMotion();

  // Get theme-aware colors
  const getColors = () => {
    if (theme === 'christmas') {
      return {
        primary: '#EB6A46',
        secondary: '#EF4444',
        glow: 'rgba(235, 106, 70, 0.4)',
      };
    }
    if (theme === 'newyear') {
      return {
        primary: '#FCD34D',
        secondary: '#F59E0B',
        glow: 'rgba(252, 211, 77, 0.4)',
      };
    }
    return {
      primary: '#06B6D4',
      secondary: '#0891B2',
      glow: 'rgba(6, 182, 212, 0.4)',
    };
  };

  const colors = getColors();

  // Render different ornament types
  const renderOrnament = () => {
    switch (type) {
      case 'star':
        return (
          <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
              fill={colors.primary}
              stroke={colors.secondary}
              strokeWidth="0.5"
            />
          </svg>
        );
      case 'bell':
        return (
          <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 2C8.13 2 5 5.13 5 9C5 14.25 3 15.5 3 17H21C21 15.5 19 14.25 19 9C19 5.13 15.87 2 12 2Z"
              fill={colors.primary}
              stroke={colors.secondary}
              strokeWidth="0.5"
            />
            <path
              d="M9 21C9 22.1 9.9 23 11 23H13C14.1 23 15 22.1 15 21"
              stroke={colors.secondary}
              strokeWidth="1"
              strokeLinecap="round"
            />
          </svg>
        );
      case 'ball':
      default:
        return (
          <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              fill={colors.primary}
              stroke={colors.secondary}
              strokeWidth="0.5"
            />
            <circle
              cx="12"
              cy="8"
              r="2"
              fill={colors.secondary}
              opacity="0.6"
            />
            <path
              d="M12 2L12 6"
              stroke={colors.secondary}
              strokeWidth="1"
              strokeLinecap="round"
            />
          </svg>
        );
    }
  };

  return (
    <motion.div
      className={`inline-flex items-center justify-center ${className}`}
      animate={
        !shouldReduceMotion
          ? {
              rotate: [0, 5, -5, 0],
              scale: [1, 1.05, 1],
            }
          : {}
      }
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      style={
        glow
          ? {
              filter: `drop-shadow(0 0 4px ${colors.glow})`,
            }
          : {}
      }
      aria-hidden="true"
    >
      {renderOrnament()}
    </motion.div>
  );
};

export default Ornament;











