import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

interface StarburstProps {
  size?: number;
  rays?: number;
  animated?: boolean;
  className?: string;
}

const Starburst: React.FC<StarburstProps> = ({
  size = 40,
  rays = 8,
  animated = true,
  className = '',
}) => {
  const { theme } = useTheme();
  const shouldReduceMotion = useReducedMotion();

  // Get theme-aware colors
  const getColors = () => {
    if (theme === 'christmas') {
      return {
        primary: '#EB6A46',
        secondary: '#FCD34D',
      };
    }
    if (theme === 'newyear') {
      return {
        primary: '#FCD34D',
        secondary: '#21D9D3',
      };
    }
    return {
      primary: '#06B6D4',
      secondary: '#FCD34D',
    };
  };

  const colors = getColors();
  const center = size / 2;
  const rayLength = size * 0.4;
  const innerRadius = size * 0.15;

  // Generate star rays
  const generateStarPath = () => {
    const points: string[] = [];
    const angleStep = (Math.PI * 2) / rays;

    for (let i = 0; i < rays * 2; i++) {
      const angle = i * angleStep;
      const radius = i % 2 === 0 ? rayLength : innerRadius;
      const x = center + Math.cos(angle) * radius;
      const y = center + Math.sin(angle) * radius;
      points.push(`${x},${y}`);
    }

    return `M ${center},${center} L ${points.join(' L ')} Z`;
  };

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={className}
      animate={
        animated && !shouldReduceMotion
          ? {
              rotate: [0, 360],
            }
          : {}
      }
      transition={{
        duration: 20,
        repeat: Infinity,
        ease: 'linear',
      }}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id={`starburst-gradient-${theme}`}>
          <stop offset="0%" stopColor={colors.primary} stopOpacity="1" />
          <stop offset="50%" stopColor={colors.secondary} stopOpacity="0.8" />
          <stop offset="100%" stopColor={colors.primary} stopOpacity="0.3" />
        </radialGradient>
      </defs>
      <path
        d={generateStarPath()}
        fill={`url(#starburst-gradient-${theme})`}
        opacity="0.7"
      />
    </motion.svg>
  );
};

export default Starburst;











