import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

interface MidnightGlowProps {
  type?: 'radial' | 'linear';
  intensity?: 'low' | 'medium' | 'high';
  animated?: boolean;
  className?: string;
}

const MidnightGlow: React.FC<MidnightGlowProps> = ({
  type = 'radial',
  intensity = 'medium',
  animated = true,
  className = '',
}) => {
  const { theme } = useTheme();
  const shouldReduceMotion = useReducedMotion();

  // Get theme-aware gradient colors
  const getGradient = () => {
    if (theme === 'newyear') {
      if (type === 'radial') {
        return 'radial-gradient(circle at center, rgba(33, 217, 211, 0.2) 0%, rgba(252, 211, 77, 0.1) 40%, transparent 70%)';
      }
      return 'linear-gradient(135deg, rgba(33, 217, 211, 0.2) 0%, rgba(252, 211, 77, 0.1) 50%, transparent 100%)';
    }
    if (theme === 'christmas') {
      if (type === 'radial') {
        return 'radial-gradient(circle at center, rgba(235, 106, 70, 0.15) 0%, rgba(255, 215, 0, 0.1) 40%, transparent 70%)';
      }
      return 'linear-gradient(135deg, rgba(235, 106, 70, 0.15) 0%, rgba(255, 215, 0, 0.1) 50%, transparent 100%)';
    }
    // Classic theme
    if (type === 'radial') {
      return 'radial-gradient(circle at center, rgba(6, 182, 212, 0.15) 0%, rgba(190, 18, 60, 0.1) 40%, transparent 70%)';
    }
    return 'linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(190, 18, 60, 0.1) 50%, transparent 100%)';
  };

  // Get opacity based on intensity
  const getOpacity = () => {
    switch (intensity) {
      case 'low': return 0.5;
      case 'high': return 1.5;
      case 'medium':
      default: return 1;
    }
  };

  const gradient = getGradient();
  const opacity = getOpacity();

  return (
    <motion.div
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{
        background: gradient,
        opacity,
      }}
      animate={
        animated && !shouldReduceMotion
          ? {
              opacity: [opacity * 0.8, opacity * 1.2, opacity * 0.8],
            }
          : {}
      }
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      aria-hidden="true"
    />
  );
};

export default MidnightGlow;











