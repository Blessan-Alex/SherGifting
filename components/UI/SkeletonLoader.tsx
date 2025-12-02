import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

interface SkeletonLoaderProps {
  type?: 'text' | 'circle' | 'rect' | 'list-item';
  rows?: number;
  className?: string;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  type = 'rect',
  rows = 1,
  className = '',
}) => {
  const { theme } = useTheme();
  const shouldReduceMotion = useReducedMotion();

  // Get theme-aware colors
  const getColors = () => {
    if (theme === 'christmas') {
      return {
        shimmer: 'linear-gradient(90deg, rgba(235, 106, 70, 0.1) 0%, rgba(235, 106, 70, 0.2) 50%, rgba(235, 106, 70, 0.1) 100%)',
        base: 'rgba(30, 41, 59, 0.4)',
      };
    }
    if (theme === 'newyear') {
      return {
        shimmer: 'linear-gradient(90deg, rgba(252, 211, 77, 0.1) 0%, rgba(252, 211, 77, 0.2) 50%, rgba(252, 211, 77, 0.1) 100%)',
        base: 'rgba(30, 41, 59, 0.4)',
      };
    }
    return {
      shimmer: 'linear-gradient(90deg, rgba(6, 182, 212, 0.1) 0%, rgba(6, 182, 212, 0.2) 50%, rgba(6, 182, 212, 0.1) 100%)',
      base: 'rgba(30, 41, 59, 0.4)',
    };
  };

  const colors = getColors();

  const baseClasses = `rounded-xl ${className}`;
  const shimmerClasses = shouldReduceMotion
    ? ''
    : 'animate-shimmer';

  if (type === 'list-item') {
    return (
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, index) => (
          <motion.div
            key={index}
            className={`h-16 ${baseClasses}`}
            style={{
              background: colors.base,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            {!shouldReduceMotion && (
              <motion.div
                className={`h-full w-full ${shimmerClasses}`}
                style={{
                  background: colors.shimmer,
                  backgroundSize: '200% 100%',
                }}
                animate={{
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              />
            )}
          </motion.div>
        ))}
      </div>
    );
  }

  if (type === 'circle') {
    return (
      <motion.div
        className={`w-12 h-12 rounded-full ${baseClasses}`}
        style={{
          background: colors.base,
        }}
        animate={!shouldReduceMotion ? {
          scale: [1, 1.05, 1],
        } : {}}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        {!shouldReduceMotion && (
          <motion.div
            className={`h-full w-full rounded-full ${shimmerClasses}`}
            style={{
              background: colors.shimmer,
              backgroundSize: '200% 100%',
            }}
            animate={{
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        )}
      </motion.div>
    );
  }

  if (type === 'text') {
    return (
      <div className="space-y-2">
        {Array.from({ length: rows }).map((_, index) => (
          <motion.div
            key={index}
            className={`h-4 ${baseClasses}`}
            style={{
              background: colors.base,
              width: index === rows - 1 ? '60%' : '100%',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            {!shouldReduceMotion && (
              <motion.div
                className={`h-full w-full ${shimmerClasses}`}
                style={{
                  background: colors.shimmer,
                  backgroundSize: '200% 100%',
                }}
                animate={{
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              />
            )}
          </motion.div>
        ))}
      </div>
    );
  }

  // Default: rect
  return (
    <motion.div
      className={`h-24 ${baseClasses}`}
      style={{
        background: colors.base,
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {!shouldReduceMotion && (
        <motion.div
          className={`h-full w-full ${shimmerClasses}`}
          style={{
            background: colors.shimmer,
            backgroundSize: '200% 100%',
          }}
          animate={{
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      )}
    </motion.div>
  );
};

export default SkeletonLoader;
