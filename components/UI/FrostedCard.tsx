import React from 'react';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

interface FrostedCardProps {
  children: React.ReactNode;
  className?: string;
  padding?: string;
  hover?: boolean; // Enable hover effects
  variant?: 'default' | 'holiday';
  shimmer?: boolean; // Enable shimmer overlay effect
  sparkles?: boolean; // Enable sparkle particles on hover
  onClick?: () => void;
}

const FrostedCard: React.FC<FrostedCardProps> = ({
  children,
  className = '',
  padding = 'p-6',
  hover = true,
  variant = 'default',
  shimmer = false,
  sparkles = false,
  onClick,
}) => {
  const shouldReduceMotion = useReducedMotion();
  const { theme } = useTheme();

  // Get theme-aware colors
  const getColors = () => {
    if (theme === 'christmas') {
      return {
        shimmer: 'rgba(235, 106, 70, 0.15)',
        sparkle: '#EB6A46',
        glow: 'rgba(235, 106, 70, 0.3)',
      };
    }
    if (theme === 'newyear') {
      return {
        shimmer: 'rgba(252, 211, 77, 0.15)',
        sparkle: '#FCD34D',
        glow: 'rgba(252, 211, 77, 0.3)',
      };
    }
    return {
      shimmer: 'rgba(6, 182, 212, 0.15)',
      sparkle: '#06B6D4',
      glow: 'rgba(6, 182, 212, 0.3)',
    };
  };

  const colors = getColors();

  const baseStyles = `relative backdrop-blur-xl rounded-3xl overflow-hidden transition-all duration-300 border ${
    variant === 'holiday' 
      ? 'border-[var(--holiday-primary)]/30 bg-[var(--surface-elevated)]' 
      : 'border-[var(--border)] bg-[var(--surface)]'
  } ${hover && !shouldReduceMotion ? 'hover:border-[var(--border-hover)] hover:shadow-[var(--shadow-lg)] hover:-translate-y-1 hover:scale-[1.01] hover:shadow-[var(--shadow-glow)]' : ''}`;

  return (
    <div
      className={`${baseStyles} ${className}`}
      onClick={onClick}
    >
      {/* Inner glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none opacity-50" />
      
      {/* Frosty border highlight on hover */}
      {hover && (
        <div
          className={`absolute inset-0 border-2 rounded-3xl pointer-events-none transition-colors duration-300 ${
            !shouldReduceMotion 
              ? variant === 'holiday' 
                ? (theme === 'christmas' ? 'border-[var(--frost)]/0 hover:border-[rgba(235,106,70,0.4)]' : theme === 'newyear' ? 'border-[var(--frost)]/0 hover:border-[rgba(252,211,77,0.4)]' : 'border-[var(--frost)]/0 hover:border-[rgba(6,182,212,0.4)]')
                : 'border-[var(--frost)]/0 hover:border-white/10'
              : 'border-[var(--frost)]/0'
          }`}
        />
      )}

      {/* Optional shimmer overlay */}
      {shimmer && !shouldReduceMotion && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `linear-gradient(90deg, transparent 0%, ${colors.shimmer} 50%, transparent 100%)`,
            backgroundSize: '200% 100%',
          }}
          animate={{
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      )}

      {/* Optional sparkle particles on hover */}
      {sparkles && hover && !shouldReduceMotion && (
        <AnimatePresence>
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {Array.from({ length: 6 }, (_, i) => {
              const angle = (i * 60) * (Math.PI / 180);
              const distance = 50;
              const x = Math.cos(angle) * distance;
              const y = Math.sin(angle) * distance;
              return (
                <motion.div
                  key={i}
                  className="absolute top-1/2 left-1/2 w-1.5 h-1.5 rounded-full"
                  style={{
                    background: colors.sparkle,
                    boxShadow: `0 0 6px ${colors.glow}`,
                  }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0],
                    x: [0, x, 0],
                    y: [0, y, 0],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.15,
                    ease: 'easeInOut',
                  }}
                />
              );
            })}
          </motion.div>
        </AnimatePresence>
      )}
      
      {/* Content */}
      <div className={`relative z-10 ${padding}`}>
        {children}
      </div>
    </div>
  );
};

export default FrostedCard;

