import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

interface RibbonBorderProps {
  position?: 'top' | 'bottom' | 'left' | 'right' | 'all';
  animated?: boolean;
  className?: string;
  height?: string;
}

const RibbonBorder: React.FC<RibbonBorderProps> = ({
  position = 'top',
  animated = true,
  className = '',
  height = 'h-1',
}) => {
  const { theme } = useTheme();
  const shouldReduceMotion = useReducedMotion();

  // Get theme-aware ribbon colors
  const getRibbonGradient = () => {
    if (theme === 'christmas') {
      return 'linear-gradient(90deg, #EB6A46 0%, #EF4444 50%, #EB6A46 100%)';
    }
    if (theme === 'newyear') {
      return 'linear-gradient(90deg, #FCD34D 0%, #F59E0B 50%, #FCD34D 100%)';
    }
    return 'linear-gradient(90deg, #BE123C 0%, #06B6D4 50%, #BE123C 100%)';
  };

  // Get position classes
  const getPositionClasses = () => {
    switch (position) {
      case 'top':
        return 'top-0 left-0 right-0';
      case 'bottom':
        return 'bottom-0 left-0 right-0';
      case 'left':
        return 'top-0 bottom-0 left-0';
      case 'right':
        return 'top-0 bottom-0 right-0';
      case 'all':
        return 'inset-0';
      default:
        return 'top-0 left-0 right-0';
    }
  };

  // Get width/height based on position
  const getDimensions = () => {
    if (position === 'left' || position === 'right') {
      return { width: 'w-1', height: 'h-full' };
    }
    return { width: 'w-full', height };
  };

  const dimensions = getDimensions();
  const gradient = getRibbonGradient();

  const borderContent = (
    <motion.div
      className={`absolute ${getPositionClasses()} ${dimensions.width} ${dimensions.height} z-10 ${className}`}
      style={{
        background: gradient,
      }}
      animate={
        animated && !shouldReduceMotion
          ? {
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            }
          : {}
      }
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: 'linear',
      }}
      aria-hidden="true"
    />
  );

  if (position === 'all') {
    return (
      <>
        {/* Top */}
        <motion.div
          className={`absolute top-0 left-0 right-0 ${height} z-10 ${className}`}
          style={{ background: gradient }}
          animate={
            animated && !shouldReduceMotion
              ? { backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }
              : {}
          }
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          aria-hidden="true"
        />
        {/* Bottom */}
        <motion.div
          className={`absolute bottom-0 left-0 right-0 ${height} z-10 ${className}`}
          style={{ background: gradient }}
          animate={
            animated && !shouldReduceMotion
              ? { backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }
              : {}
          }
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          aria-hidden="true"
        />
        {/* Left */}
        <motion.div
          className={`absolute top-0 bottom-0 left-0 w-1 z-10 ${className}`}
          style={{ background: gradient }}
          animate={
            animated && !shouldReduceMotion
              ? { backgroundPosition: ['50% 0%', '50% 100%', '50% 0%'] }
              : {}
          }
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          aria-hidden="true"
        />
        {/* Right */}
        <motion.div
          className={`absolute top-0 bottom-0 right-0 w-1 z-10 ${className}`}
          style={{ background: gradient }}
          animate={
            animated && !shouldReduceMotion
              ? { backgroundPosition: ['50% 0%', '50% 100%', '50% 0%'] }
              : {}
          }
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          aria-hidden="true"
        />
      </>
    );
  }

  return borderContent;
};

export default RibbonBorder;













