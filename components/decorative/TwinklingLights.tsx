import React, { useMemo, useEffect, useRef } from 'react';
import { motion, useTransform, useMotionValue } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { useEffectsPolicy } from '../../hooks/useEffectsPolicy';
import { useScrollMotionOptional } from '../../context/ScrollMotionProvider';

interface TwinklingLightsProps {
  intensity?: 'low' | 'medium' | 'high';
  pattern?: 'scattered' | 'grid' | 'organic';
  className?: string;
}

// CSS keyframe animations injected via style tag
const injectKeyframes = () => {
  if (document.getElementById('twinkling-lights-keyframes')) return;

  const style = document.createElement('style');
  style.id = 'twinkling-lights-keyframes';
  style.textContent = `
    @keyframes twinkle-small {
      0%, 100% {
        opacity: 0.3;
        transform: scale(0.8);
      }
      50% {
        opacity: 1;
        transform: scale(1.2);
      }
    }
    @keyframes twinkle-medium {
      0%, 100% {
        opacity: 0.4;
        transform: scale(0.9);
      }
      50% {
        opacity: 1;
        transform: scale(1.3);
      }
    }
    @keyframes twinkle-large {
      0%, 100% {
        opacity: 0.5;
        transform: scale(0.8);
      }
      50% {
        opacity: 1.2;
        transform: scale(1.4);
      }
    }
  `;
  document.head.appendChild(style);
};

/**
 * TwinklingLights - CSS keyframe-based twinkling light effects.
 * 
 * Performance optimizations:
 * - Mount policy: Only mounts if allowHeavyEffects is true (disabled on mobile/reduced motion)
 * - CSS keyframes: No JS animation loops, uses CSS animations for twinkling
 * - Centralized scroll: Uses ScrollMotionProvider for parallax (no manual scroll listeners)
 * - Reduced DOM count: 20/8/3 lights instead of 78+ animated elements
 * - React.memo: Prevents re-renders when parent updates
 * 
 * Mount policy over pause logic: If effects shouldn't run, component doesn't mount at all.
 */
const TwinklingLights: React.FC<TwinklingLightsProps> = ({
  intensity = 'medium',
  pattern = 'scattered',
  className = '',
}) => {
  const { theme } = useTheme();
  const { allowHeavyEffects, allowMediumEffects } = useEffectsPolicy();
  const containerRef = useRef<HTMLDivElement>(null);

  // Don't mount if heavy effects are not allowed
  if (!allowHeavyEffects) {
    return null;
  }

  // Inject CSS keyframes on mount
  useEffect(() => {
    injectKeyframes();
  }, []);

  // Use centralized scroll tracking for parallax (no manual scroll listeners)
  // Parallax effect: subtle vertical movement based on scroll
  // Optional: if ScrollMotionProvider is not available (e.g., in loading screens), skip parallax
  const scrollMotion = useScrollMotionOptional();
  const parallaxY = scrollMotion
    ? useTransform(
        scrollMotion.scrollYProgress,
        [0, 1],
        [0, -100], // Subtle parallax: move up to 100px as user scrolls
        { clamp: true }
      )
    : useMotionValue(0); // No parallax when provider is not available

  // Get light counts - reduced DOM count: 20/8/3
  const getLightCounts = () => {
    switch (intensity) {
      case 'low':
        return { small: 15, medium: 6, large: 2 };
      case 'high':
        return { small: 25, medium: 10, large: 4 };
      case 'medium':
      default:
        return { small: 20, medium: 8, large: 3 };
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

  // Generate bokeh lights with CSS animation properties
  const bokehLights = useMemo(() => {
    const small = Array.from({ length: lightCounts.small }, (_, i) => ({
      id: `small-${i}`,
      ...generatePositions(lightCounts.small, i, pattern),
      size: Math.random() * 2 + 2, // 2-4px
      delay: i * 0.05, // seconds
      duration: Math.random() * 1 + 1, // 1-2s cycle
      opacity: Math.random() * 0.4 + 0.2,
    }));

    const medium = Array.from({ length: lightCounts.medium }, (_, i) => ({
      id: `medium-${i}`,
      ...generatePositions(lightCounts.medium, i, pattern),
      size: Math.random() * 4 + 4, // 4-8px
      delay: i * 0.15, // seconds
      duration: Math.random() * 1 + 3, // 3-4s cycle
      opacity: Math.random() * 0.5 + 0.3,
    }));

    const large = Array.from({ length: lightCounts.large }, (_, i) => ({
      id: `large-${i}`,
      ...generatePositions(lightCounts.large, i, pattern),
      size: Math.random() * 20 + 20, // 20-40px
      delay: i * 0.8, // seconds
      duration: Math.random() * 2 + 6, // 6-8s cycle
      opacity: Math.random() * 0.3 + 0.2,
    }));

    return { small, medium, large };
  }, [lightCounts, pattern]);

  return (
    <div ref={containerRef} className={`absolute inset-0 pointer-events-none ${className}`} aria-hidden="true">
      <motion.div
        className="absolute inset-0"
        style={{
          y: allowMediumEffects ? parallaxY : 0,
        }}
      >
        {/* Small dots - fast twinkle */}
        {bokehLights.small.map((light) => (
          <div
            key={light.id}
            className="absolute rounded-full"
            style={{
              top: light.top,
              left: light.left,
              width: `${light.size}px`,
              height: `${light.size}px`,
              background: getBokehGradient(light.opacity),
              animation: allowMediumEffects
                ? `twinkle-small ${light.duration}s ease-in-out infinite`
                : 'none',
              animationDelay: `${light.delay}s`,
              willChange: allowMediumEffects ? 'transform, opacity' : 'auto',
            }}
          />
        ))}

        {/* Medium dots - medium twinkle */}
        {bokehLights.medium.map((light) => (
          <div
            key={light.id}
            className="absolute rounded-full"
            style={{
              top: light.top,
              left: light.left,
              width: `${light.size}px`,
              height: `${light.size}px`,
              background: getBokehGradient(light.opacity),
              filter: 'blur(2px)',
              animation: allowMediumEffects
                ? `twinkle-medium ${light.duration}s ease-in-out infinite`
                : 'none',
              animationDelay: `${light.delay}s`,
              willChange: allowMediumEffects ? 'transform, opacity' : 'auto',
            }}
          />
        ))}

        {/* Large bokeh orbs - slow pulse */}
        {bokehLights.large.map((light) => (
          <div
            key={light.id}
            className="absolute rounded-full"
            style={{
              top: light.top,
              left: light.left,
              width: `${light.size}px`,
              height: `${light.size}px`,
              background: getBokehGradient(light.opacity),
              filter: 'blur(8px)',
              animation: allowMediumEffects
                ? `twinkle-large ${light.duration}s ease-in-out infinite`
                : 'none',
              animationDelay: `${light.delay}s`,
              willChange: allowMediumEffects ? 'transform, opacity' : 'auto',
            }}
            />
        ))}
      </motion.div>
    </div>
  );
};

// Memoize to prevent unnecessary re-renders when parent re-renders
// Props are stable (intensity, pattern, className don't change frequently)
export default React.memo(TwinklingLights, (prevProps, nextProps) => {
  return (
    prevProps.intensity === nextProps.intensity &&
    prevProps.pattern === nextProps.pattern &&
    prevProps.className === nextProps.className
  );
});

