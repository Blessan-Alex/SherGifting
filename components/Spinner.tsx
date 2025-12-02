import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'holiday' | 'success';
  color?: string;
}

const Spinner: React.FC<SpinnerProps> = ({ 
  size = 'md', 
  variant = 'default',
  color,
}) => {
  const { theme } = useTheme();
  const shouldReduceMotion = useReducedMotion();

  // Size mappings
  const sizeMap = {
    sm: { spinner: 16, sparkles: 8, particles: 3 },
    md: { spinner: 24, sparkles: 12, particles: 4 },
    lg: { spinner: 32, sparkles: 16, particles: 5 },
    xl: { spinner: 48, sparkles: 20, particles: 6 },
  };

  const dimensions = sizeMap[size] || sizeMap.md;

  // Get theme-aware colors
  const getColors = () => {
    if (color) {
      return {
        primary: color,
        glow: `${color}40`,
      };
    }

    if (variant === 'success') {
      return {
        primary: '#10B981',
        glow: 'rgba(16, 185, 129, 0.4)',
      };
    }

    if (variant === 'holiday') {
      if (theme === 'christmas') {
        return {
          primary: '#EB6A46',
          glow: 'rgba(235, 106, 70, 0.4)',
        };
      }
      if (theme === 'newyear') {
        return {
          primary: '#FCD34D',
          glow: 'rgba(252, 211, 77, 0.4)',
        };
      }
    }

    return {
      primary: '#06B6D4',
      glow: 'rgba(6, 182, 212, 0.4)',
    };
  };

  const colors = getColors();

  if (shouldReduceMotion) {
    return (
      <div
        className="rounded-full border-2 border-t-transparent animate-spin"
        style={{
          width: dimensions.spinner,
          height: dimensions.spinner,
          borderColor: colors.primary,
          borderTopColor: 'transparent',
        }}
      />
    );
  }

  return (
    <div className="relative inline-flex items-center justify-center">
      {/* Main spinner */}
      <motion.div
        className="rounded-full border-2 border-t-transparent"
        style={{
          width: dimensions.spinner,
          height: dimensions.spinner,
          borderColor: colors.primary,
          borderTopColor: 'transparent',
        }}
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'linear',
        }}
      />

      {/* Rotating sparkle particles */}
      {Array.from({ length: dimensions.particles }, (_, i) => {
        const angle = (i * (360 / dimensions.particles)) * (Math.PI / 180);
        const radius = dimensions.spinner / 2 + 8;
        return (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full"
            style={{
              background: colors.primary,
              boxShadow: `0 0 4px ${colors.glow}`,
            }}
            animate={{
              x: [
                Math.cos(angle) * radius,
                Math.cos(angle + Math.PI * 2) * radius,
              ],
              y: [
                Math.sin(angle) * radius,
                Math.sin(angle + Math.PI * 2) * radius,
              ],
              opacity: [0.3, 1, 0.3],
              scale: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.2,
              ease: 'easeInOut',
            }}
          />
        );
      })}

      {/* Central sparkle icon for holiday variant */}
      {variant === 'holiday' && (
        <motion.div
          className="absolute"
          animate={{
            rotate: [0, 360],
            scale: [1, 1.2, 1],
          }}
          transition={{
            rotate: {
              duration: 3,
              repeat: Infinity,
              ease: 'linear',
            },
            scale: {
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            },
          }}
        >
          <Sparkles size={dimensions.sparkles} style={{ color: colors.primary }} />
        </motion.div>
      )}
    </div>
  );
};

export default Spinner;
