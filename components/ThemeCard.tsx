import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Gift } from 'lucide-react';
import FrostedCard from './UI/FrostedCard';
import { useTheme } from '../context/ThemeContext';

interface ThemeCardProps {
  theme: 'christmas' | 'newyear';
  title: string;
  description: string;
  onClick?: () => void;
  isSelected?: boolean;
}

const ThemeCard: React.FC<ThemeCardProps> = ({
  theme,
  title,
  description,
  onClick,
  isSelected = false,
}) => {
  const { theme: currentTheme } = useTheme();
  const shouldReduceMotion = useReducedMotion();

  const getThemeColors = () => {
    if (theme === 'christmas') {
      return {
        primary: '#EB6A46',
        secondary: '#EF4444',
        bg: 'rgba(235, 106, 70, 0.1)',
        border: 'rgba(235, 106, 70, 0.3)',
        glow: 'rgba(235, 106, 70, 0.4)',
      };
    }
    return {
      primary: '#FCD34D',
      secondary: '#F59E0B',
      bg: 'rgba(252, 211, 77, 0.1)',
      border: 'rgba(252, 211, 77, 0.3)',
      glow: 'rgba(252, 211, 77, 0.4)',
    };
  };

  const colors = getThemeColors();
  const isActive = currentTheme === theme;

  return (
    <motion.div
      onClick={onClick}
      className="cursor-pointer"
      whileHover={!shouldReduceMotion ? {
        scale: 1.05,
        y: -8,
      } : {}}
      whileTap={!shouldReduceMotion ? { scale: 0.98 } : {}}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        className="relative"
        style={{
          ...(isSelected || isActive ? {
            boxShadow: `0 0 0 2px ${colors.primary}, 0 0 20px ${colors.glow}`,
          } : {}),
        }}
      >
        <FrostedCard
          variant="holiday"
          className="relative overflow-hidden transition-all duration-300"
          style={{
            ...(isSelected || isActive ? {
              background: colors.bg,
              borderColor: colors.border,
            } : {}),
          }}
        >
        {/* Preview card mockup */}
        <div className="relative h-48 mb-6 flex items-center justify-center">
          <div
            className="w-32 h-40 rounded-xl p-4 shadow-lg relative"
            style={{
              background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
            }}
          >
            {/* Card content preview */}
            <div className="text-center text-white">
              <Gift size={32} className="mx-auto mb-2" />
              <div className="text-lg font-bold">$50</div>
              <div className="text-xs opacity-80">USDC</div>
            </div>

            {/* Ribbon decoration */}
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
              style={{ backgroundColor: colors.primary }}
            >
              <Gift size={16} className="text-white" />
            </div>
          </div>

          {/* Sparkle effects on hover */}
          {!shouldReduceMotion && (
            <motion.div
              className="absolute inset-0 pointer-events-none"
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
            >
              {Array.from({ length: 4 }, (_, i) => {
                const angle = (i * 90) * (Math.PI / 180);
                const distance = 30;
                const x = Math.cos(angle) * distance;
                const y = Math.sin(angle) * distance;
                return (
                  <motion.div
                    key={i}
                    className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full"
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
                      duration: 1.5,
                      repeat: Infinity,
                      delay: i * 0.2,
                      ease: 'easeInOut',
                    }}
                  />
                );
              })}
            </motion.div>
          )}
        </div>

        <div className="text-center">
          <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
          <p className="text-sm text-[#94A3B8]">{description}</p>
        </div>

        {/* Selection indicator */}
        {(isSelected || isActive) && (
          <motion.div
            className="absolute top-4 right-4 w-6 h-6 rounded-full flex items-center justify-center"
            style={{ backgroundColor: colors.primary }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          >
            <motion.div
              className="w-2 h-2 rounded-full bg-white"
              animate={!shouldReduceMotion ? {
                scale: [1, 1.2, 1],
              } : {}}
              transition={{ duration: 1, repeat: Infinity }}
            />
          </motion.div>
        )}
        </FrostedCard>
      </motion.div>
    </motion.div>
  );
};

export default ThemeCard;

