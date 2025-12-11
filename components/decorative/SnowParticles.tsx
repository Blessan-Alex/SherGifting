import React, { useMemo, useEffect } from 'react';
import { useReducedMotion } from '../../lib/animations';
import { useTheme } from '../../context/ThemeContext';
import { useEffectsPolicy } from '../../hooks/useEffectsPolicy';

interface SnowParticlesProps {
  intensity?: 'low' | 'medium' | 'high';
  speed?: number;
  size?: { min: number; max: number };
  color?: string;
  className?: string;
}

// Inject CSS keyframes for snow animation
const injectKeyframes = () => {
  if (document.getElementById('snow-particles-keyframes')) return;

  const style = document.createElement('style');
  style.id = 'snow-particles-keyframes';
  style.textContent = `
    @keyframes snow-fall {
      0% {
        transform: translateY(-100vh) translateX(0);
        opacity: 0.8;
      }
      100% {
        transform: translateY(100vh) translateX(var(--snow-drift, 0px));
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
};

/**
 * SnowParticles - CSS keyframe-based snow particle animation.
 * 
 * Performance optimizations:
 * - Mount policy: Only mounts if allowHeavyEffects is true (disabled on mobile/reduced motion)
 * - CSS keyframes: No JS animation loops, no RAF, uses CSS animations only
 * - Reduced particle count: 10-15 max particles
 * - Animate only transform and opacity (GPU-accelerated)
 * 
 * Mount policy over pause logic: If effects shouldn't run, component doesn't mount at all.
 */
const SnowParticles: React.FC<SnowParticlesProps> = ({
  intensity = 'medium',
  speed,
  size = { min: 2, max: 6 },
  color,
  className = '',
}) => {
  const { theme } = useTheme();
  const shouldReduceMotion = useReducedMotion();
  const { allowHeavyEffects, isMobile } = useEffectsPolicy();

  // Don't mount if heavy effects are not allowed
  if (!allowHeavyEffects) {
    return null;
  }

  // Inject CSS keyframes on mount
  useEffect(() => {
    injectKeyframes();
  }, []);

  // Get particle count based on intensity and device (10-15 max)
  const getParticleCount = () => {
    if (shouldReduceMotion) return 0;
    // Mobile: fewer particles
    if (isMobile) {
      switch (intensity) {
        case 'low': return 8;
        case 'high': return 12;
        case 'medium':
        default: return 10;
      }
    }
    // Desktop: 10-15 particles
    switch (intensity) {
      case 'low': return 10;
      case 'high': return 15;
      case 'medium':
      default: return 12;
    }
  };

  // Get snow color based on theme
  const getSnowColor = () => {
    if (color) return color;
    if (theme === 'christmas') return 'rgba(255, 255, 255, 0.9)';
    if (theme === 'newyear') return 'rgba(255, 215, 0, 0.8)';
    return 'rgba(255, 255, 255, 0.7)';
  };

  const particleCount = getParticleCount();
  const snowColor = getSnowColor();

  // Generate snowflake particles with random properties
  const particles = useMemo(() => {
    if (particleCount === 0) return [];
    
    return Array.from({ length: particleCount }, (_, i) => {
      const particleSize = size 
        ? Math.random() * (size.max - size.min) + size.min
        : Math.random() * 4 + 2; // 2-6px default
      
      const baseDuration = speed 
        ? Math.max(5, 15 / speed) // Adjust duration based on speed prop
        : Math.random() * 5 + 10; // 10-15s default
      
      const drift = (Math.random() - 0.5) * 100; // -50px to 50px horizontal drift
      const left = Math.random() * 100; // 0-100% horizontal position
      const delay = Math.random() * 5; // 0-5s delay for staggered start
      const opacity = Math.random() * 0.5 + 0.3; // 0.3-0.8

      return {
        id: `snow-${i}`,
        size: particleSize,
        left: `${left}%`,
        duration: `${baseDuration}s`,
        delay: `${delay}s`,
        drift: `${drift}px`,
        opacity,
      };
    });
  }, [particleCount, size, speed, shouldReduceMotion]);

  if (particles.length === 0) {
    return null;
  }

  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`} aria-hidden="true">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            left: particle.left,
            top: '-10px',
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: snowColor,
            opacity: particle.opacity,
            '--snow-drift': particle.drift,
            animation: shouldReduceMotion 
              ? 'none' 
              : `snow-fall ${particle.duration} linear infinite`,
            animationDelay: particle.delay,
            willChange: shouldReduceMotion ? 'auto' : 'transform, opacity',
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
};

// Memoize to prevent unnecessary re-renders when parent re-renders
// Props are stable (intensity, speed, size, color, className don't change frequently)
export default React.memo(SnowParticles, (prevProps, nextProps) => {
  const sizeEqual = 
    prevProps.size === nextProps.size ||
    (prevProps.size?.min === nextProps.size?.min && prevProps.size?.max === nextProps.size?.max);
  
  return (
    prevProps.intensity === nextProps.intensity &&
    prevProps.speed === nextProps.speed &&
    sizeEqual &&
    prevProps.color === nextProps.color &&
    prevProps.className === nextProps.className
  );
});
