import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

interface SparklesProps {
  mode?: 'burst' | 'continuous' | 'hover';
  count?: number;
  duration?: number;
  className?: string;
}

const Sparkles: React.FC<SparklesProps> = ({
  mode = 'continuous',
  count = 12,
  duration = 2000,
  className = '',
}) => {
  const { theme } = useTheme();
  const shouldReduceMotion = useReducedMotion();
  const [isHovered, setIsHovered] = useState(false);
  const [sparkles, setSparkles] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Get theme-aware colors
  const getColors = () => {
    if (theme === 'christmas') {
      return {
        primary: '#EB6A46',
        secondary: '#FCD34D',
        glow: 'rgba(235, 106, 70, 0.5)',
      };
    }
    if (theme === 'newyear') {
      return {
        primary: '#FCD34D',
        secondary: '#21D9D3',
        glow: 'rgba(252, 211, 77, 0.5)',
      };
    }
    return {
      primary: '#06B6D4',
      secondary: '#FCD34D',
      glow: 'rgba(6, 182, 212, 0.5)',
    };
  };

  const colors = getColors();

  // Generate sparkles
  useEffect(() => {
    if (shouldReduceMotion) return;

    const generateSparkles = () => {
      const newSparkles = Array.from({ length: count }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: (i / count) * 0.2,
      }));
      setSparkles(newSparkles);
    };

    if (mode === 'burst') {
      generateSparkles();
      const timer = setTimeout(() => setSparkles([]), duration);
      return () => clearTimeout(timer);
    } else if (mode === 'continuous') {
      generateSparkles();
      const interval = setInterval(generateSparkles, duration);
      return () => clearInterval(interval);
    } else if (mode === 'hover' && isHovered) {
      generateSparkles();
    }
  }, [mode, count, duration, shouldReduceMotion, isHovered]);

  if (shouldReduceMotion) return null;

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}
      onMouseEnter={() => mode === 'hover' && setIsHovered(true)}
      onMouseLeave={() => mode === 'hover' && setIsHovered(false)}
      aria-hidden="true"
    >
      <AnimatePresence>
        {sparkles.map((sparkle) => {
          const angle = (sparkle.id * (360 / count)) * (Math.PI / 180);
          const distance = 30 + Math.random() * 20;
          const x = Math.cos(angle) * distance;
          const y = Math.sin(angle) * distance;

          return (
            <motion.div
              key={sparkle.id}
              className="absolute w-1.5 h-1.5 rounded-full"
              style={{
                left: `${sparkle.x}%`,
                top: `${sparkle.y}%`,
                background: colors.primary,
                boxShadow: `0 0 6px ${colors.glow}`,
              }}
              initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
                x: [0, x, 0],
                y: [0, y, 0],
              }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{
                duration: duration / 1000,
                delay: sparkle.delay,
                ease: 'easeOut',
              }}
            />
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default Sparkles;






