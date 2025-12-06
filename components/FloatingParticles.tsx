import React, { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

interface FloatingParticlesProps {
  count?: number;
  variant?: 'snow' | 'sparkle' | 'bubble';
  speed?: 'slow' | 'medium' | 'fast';
}

const FloatingParticles: React.FC<FloatingParticlesProps> = ({
  count = 10,
  variant = 'sparkle',
  speed = 'medium',
}) => {
  const { theme } = useTheme();
  const shouldReduceMotion = useReducedMotion();

  const actualCount = shouldReduceMotion ? Math.min(count, 3) : count;

  const speedMap = {
    slow: { duration: 8, distance: 30 },
    medium: { duration: 5, distance: 50 },
    fast: { duration: 3, distance: 80 },
  };

  const speedConfig = speedMap[speed];

  const particles = useMemo(() => {
    return Array.from({ length: actualCount }, (_, i) => ({
      id: i,
      left: `${(i * 10 + Math.random() * 20) % 100}%`,
      top: `${(i * 8 + Math.random() * 15) % 100}%`,
      delay: `${i * 0.3}s`,
      size: variant === 'bubble' ? Math.random() * 8 + 4 : Math.random() * 4 + 2,
      opacity: Math.random() * 0.5 + 0.3,
    }));
  }, [actualCount, variant]);

  const getParticleColor = () => {
    if (variant === 'snow') {
      return theme === 'newyear' ? 'rgba(255, 215, 0, 0.8)' : 'rgba(255, 255, 255, 0.9)';
    }
    if (variant === 'sparkle') {
      if (theme === 'christmas') return 'rgba(255, 215, 0, 0.9)';
      if (theme === 'newyear') return 'rgba(33, 217, 211, 0.8)';
      return 'rgba(255, 178, 23, 0.7)';
    }
    // bubble
    if (theme === 'christmas') return 'rgba(235, 106, 70, 0.4)';
    if (theme === 'newyear') return 'rgba(33, 217, 211, 0.3)';
    return 'rgba(6, 182, 212, 0.3)';
  };

  const particleColor = getParticleColor();

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            left: particle.left,
            top: particle.top,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: particleColor,
            opacity: particle.opacity,
            filter: variant === 'bubble' ? 'blur(2px)' : 'none',
          }}
          animate={
            !shouldReduceMotion
              ? {
                  y: [
                    -speedConfig.distance,
                    -speedConfig.distance * 1.5,
                    -speedConfig.distance,
                  ],
                  x: [
                    Math.sin(particle.id) * 20,
                    Math.sin(particle.id + Math.PI) * 20,
                    Math.sin(particle.id) * 20,
                  ],
                  opacity: [
                    particle.opacity * 0.5,
                    particle.opacity,
                    particle.opacity * 0.5,
                  ],
                  scale: variant === 'sparkle' ? [0.8, 1.2, 0.8] : [1, 1.1, 1],
                }
              : {}
          }
          transition={{
            duration: speedConfig.duration,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: parseFloat(particle.delay),
          }}
        />
      ))}
    </div>
  );
};

export default FloatingParticles;









