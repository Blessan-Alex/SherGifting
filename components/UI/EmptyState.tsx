import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { LucideIcon, Sparkles } from 'lucide-react';
import GlowButton from './GlowButton';
import { useTheme } from '../../context/ThemeContext';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
  className = '',
}) => {
  const { theme } = useTheme();
  const shouldReduceMotion = useReducedMotion();

  // Get theme-aware colors
  const getColors = () => {
    if (theme === 'christmas') {
      return {
        primary: '#EB6A46',
        glow: 'rgba(235, 106, 70, 0.3)',
      };
    }
    if (theme === 'newyear') {
      return {
        primary: '#FCD34D',
        glow: 'rgba(252, 211, 77, 0.3)',
      };
    }
    return {
      primary: '#06B6D4',
      glow: 'rgba(6, 182, 212, 0.3)',
    };
  };

  const colors = getColors();

  return (
    <motion.div
      className={`flex flex-col items-center justify-center py-16 px-6 text-center ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <motion.div
        className="w-20 h-20 rounded-full bg-[#1E293B]/40 border border-white/10 flex items-center justify-center mb-6 relative"
        animate={!shouldReduceMotion ? {
          scale: [1, 1.1, 1],
        } : {}}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        {/* Sparkle effects */}
        {!shouldReduceMotion && (
          <>
            {Array.from({ length: 4 }, (_, i) => {
              const angle = (i * 90) * (Math.PI / 180);
              const distance = 50;
              const x = Math.cos(angle) * distance;
              const y = Math.sin(angle) * distance;
              return (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 rounded-full"
                  style={{
                    background: colors.glow,
                    boxShadow: `0 0 8px ${colors.glow}`,
                  }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0],
                    x: [0, x, 0],
                    y: [0, y, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.3,
                    ease: 'easeInOut',
                  }}
                />
              );
            })}
          </>
        )}
        <Icon size={40} className="text-[#64748B] relative z-10" />
      </motion.div>
      <motion.h3
        className="text-xl font-bold text-white mb-2 flex items-center justify-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Sparkles size={20} style={{ color: colors.primary }} />
        {title}
      </motion.h3>
      <motion.p
        className="text-[#94A3B8] text-sm max-w-md mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {description}
      </motion.p>
      {action && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <GlowButton variant="cyan" onClick={action.onClick} enableRibbonWiggle>
            {action.label}
          </GlowButton>
        </motion.div>
      )}
    </motion.div>
  );
};

export default EmptyState;
