import React, { useMemo } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

interface TwinklingLightsProps {
  intensity?: 'low' | 'medium' | 'high';
  pattern?: 'scattered' | 'grid' | 'organic';
  className?: string;
}

const TwinklingLights: React.FC<TwinklingLightsProps> = ({
  intensity = 'medium',
  pattern = 'scattered',
  className = '',
}) => {
  const { theme } = useTheme();
  const shouldReduceMotion = useReducedMotion();
  const containerRef = React.useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const bokehY = useTransform(scrollYProgress, [0, 1], [0, -20]);

  // Get light counts based on intensity
  const getLightCounts = () => {
    if (shouldReduceMotion) {
      return { small: 10, medium: 4, large: 2 };
    }
    switch (intensity) {
      case 'low':
        return { small: 30, medium: 12, large: 5 };
      case 'high':
        return { small: 100, medium: 30, large: 12 };
      case 'medium':
      default:
        return { small: 50, medium: 20, large: 8 };
    }
  };

  const lightCounts = getLightCounts();

  // Get bokeh colors based on theme
  const getBokehGradient = (opacity: number) => {
    if (theme === 'christmas') {
      return `radial-gradient(circle, rgba(255,255,255,${opacity * 0.8}) 0%, rgba(255,215,0,${opacity * 0.4}) 30%, rgba(235,106,70,${opacity * 0.2}) 50%, transparent 100%)`;
    }
    if (theme === 'newyear') {
      return `radial-gradient(circle, rgba(255,215,0,${opacity * 0.9}) 0%, rgba(33,217,211,${opacity * 0.3}) 40%, transparent 100%)`;
    }
    return `radial-gradient(circle, rgba(255,255,255,${opacity * 0.6}) 0%, rgba(255,255,255,${opacity * 0.2}) 50%, transparent 100%)`;
  };

  // Generate light positions based on pattern
  const generatePositions = (count: number, index: number, patternType: string) => {
    switch (patternType) {
      case 'grid':
        const cols = Math.ceil(Math.sqrt(count));
        const row = Math.floor(index / cols);
        const col = index % cols;
        return {
          top: `${(row / cols) * 100}%`,
          left: `${(col / cols) * 100}%`,
        };
      case 'organic':
        // More natural, clustered distribution
        return {
          top: `${(Math.sin(index * 0.5) * 30 + 50 + (index * 7) % 100) % 100}%`,
          left: `${(Math.cos(index * 0.3) * 40 + 50 + (index * 11) % 100) % 100}%`,
        };
      case 'scattered':
      default:
        return {
          top: `${(index * 2) % 100}%`,
          left: `${(index * 3) % 100}%`,
        };
    }
  };

  // Generate bokeh lights
  const bokehLights = useMemo(() => {
    const small = Array.from({ length: lightCounts.small }, (_, i) => ({
      id: `small-${i}`,
      ...generatePositions(lightCounts.small, i, pattern),
      size: Math.random() * 2 + 2, // 2-4px
      delay: `${i * 0.05}s`,
      opacity: Math.random() * 0.4 + 0.2,
      cycle: Math.random() * 1 + 1, // 1-2s cycle
    }));

    const medium = Array.from({ length: lightCounts.medium }, (_, i) => ({
      id: `medium-${i}`,
      ...generatePositions(lightCounts.medium, i, pattern),
      size: Math.random() * 4 + 4, // 4-8px
      delay: `${i * 0.15}s`,
      opacity: Math.random() * 0.5 + 0.3,
      cycle: Math.random() * 1 + 3, // 3-4s cycle
    }));

    const large = Array.from({ length: lightCounts.large }, (_, i) => ({
      id: `large-${i}`,
      ...generatePositions(lightCounts.large, i, pattern),
      size: Math.random() * 20 + 20, // 20-40px
      delay: `${i * 0.8}s`,
      opacity: Math.random() * 0.3 + 0.2,
      cycle: Math.random() * 2 + 6, // 6-8s cycle
    }));

    return { small, medium, large };
  }, [lightCounts, pattern]);

  return (
    <div ref={containerRef} className={`absolute inset-0 pointer-events-none ${className}`} aria-hidden="true">
      {/* Small dots - fast twinkle */}
      {bokehLights.small.map((light) => (
        <motion.div
          key={light.id}
          className="absolute rounded-full"
          style={{
            top: light.top,
            left: light.left,
            width: `${light.size}px`,
            height: `${light.size}px`,
            background: getBokehGradient(light.opacity),
            y: bokehY,
            willChange: !shouldReduceMotion ? 'transform, opacity' : 'auto',
          }}
          animate={
            !shouldReduceMotion
              ? {
                  opacity: [light.opacity * 0.3, light.opacity, light.opacity * 0.3],
                  scale: [0.8, 1.2, 0.8],
                }
              : {}
          }
          transition={{
            duration: light.cycle,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: parseFloat(light.delay),
          }}
        />
      ))}

      {/* Medium dots - medium twinkle */}
      {bokehLights.medium.map((light) => (
        <motion.div
          key={light.id}
          className="absolute rounded-full"
          style={{
            top: light.top,
            left: light.left,
            width: `${light.size}px`,
            height: `${light.size}px`,
            background: getBokehGradient(light.opacity),
            filter: 'blur(2px)',
            y: bokehY,
            willChange: !shouldReduceMotion ? 'transform, opacity' : 'auto',
          }}
          animate={
            !shouldReduceMotion
              ? {
                  opacity: [light.opacity * 0.4, light.opacity, light.opacity * 0.4],
                  scale: [0.9, 1.3, 0.9],
                }
              : {}
          }
          transition={{
            duration: light.cycle,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: parseFloat(light.delay),
          }}
        />
      ))}

      {/* Large bokeh orbs - slow pulse */}
      {bokehLights.large.map((light) => (
        <motion.div
          key={light.id}
          className="absolute rounded-full"
          style={{
            top: light.top,
            left: light.left,
            width: `${light.size}px`,
            height: `${light.size}px`,
            background: getBokehGradient(light.opacity),
            filter: 'blur(8px)',
            y: bokehY,
            willChange: !shouldReduceMotion ? 'transform, opacity' : 'auto',
          }}
          animate={
            !shouldReduceMotion
              ? {
                  opacity: [light.opacity * 0.5, light.opacity * 1.2, light.opacity * 0.5],
                  scale: [0.8, 1.4, 0.8],
                }
              : {}
          }
          transition={{
            duration: light.cycle,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: parseFloat(light.delay),
          }}
        />
      ))}
    </div>
  );
};

export default TwinklingLights;

