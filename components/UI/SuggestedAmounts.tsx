import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Gift, Sparkles, Star } from 'lucide-react';
import FrostedCard from './FrostedCard';
import { useTheme } from '../../context/ThemeContext';

interface SuggestedAmountsProps {
  onAmountSelect: (amount: number) => void;
  selectedAmount: number | null;
  tokenPrice: number | null;
}

const suggestions = [
  {
    id: 'stocking',
    label: 'Stocking Stuffer',
    amount: 10,
    icon: Gift,
    description: 'A small surprise',
  },
  {
    id: 'warm',
    label: 'Warm Wishes',
    amount: 50,
    icon: Sparkles,
    description: 'A thoughtful gift',
  },
  {
    id: 'surprise',
    label: 'Big Surprise',
    amount: 100,
    icon: Star,
    description: 'Make it memorable',
  },
];

const SuggestedAmounts: React.FC<SuggestedAmountsProps> = ({
  onAmountSelect,
  selectedAmount,
  tokenPrice,
}) => {
  const { theme } = useTheme();
  const shouldReduceMotion = useReducedMotion();

  // Get theme-aware colors
  const getColors = () => {
    if (theme === 'christmas') {
      return {
        primary: '#EB6A46',
        secondary: '#EF4444',
        glow: 'rgba(235, 106, 70, 0.3)',
      };
    }
    if (theme === 'newyear') {
      return {
        primary: '#FCD34D',
        secondary: '#F59E0B',
        glow: 'rgba(252, 211, 77, 0.3)',
      };
    }
    return {
      primary: '#FFB217',
      secondary: '#D97706',
      glow: 'rgba(255, 178, 23, 0.3)',
    };
  };

  const colors = getColors();

  const handleSelect = (amount: number) => {
    onAmountSelect(amount);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles size={16} className="text-[#94A3B8]" />
        <span className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
          Suggested Holiday Amounts
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {suggestions.map((suggestion, index) => {
          const Icon = suggestion.icon;
          const isSelected = selectedAmount === suggestion.amount;
          const tokenAmount = tokenPrice ? suggestion.amount / tokenPrice : null;

          return (
            <motion.div
              key={suggestion.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              whileHover={!shouldReduceMotion ? {
                y: -8,
                scale: 1.02,
              } : {}}
              whileTap={!shouldReduceMotion ? {
                scale: 0.98,
              } : {}}
              onClick={() => handleSelect(suggestion.amount)}
              className="cursor-pointer"
            >
              <FrostedCard
                variant="holiday"
                className={`relative overflow-hidden transition-all duration-300 ${
                  isSelected ? 'ring-2' : ''
                }`}
                style={{
                  ...(isSelected ? {
                    ringColor: colors.primary,
                    background: `${colors.primary}10`,
                    borderColor: colors.primary,
                    boxShadow: `0 0 20px ${colors.glow}`,
                  } : {}),
                }}
              >
                {/* Ribbon accent */}
                <div
                  className="absolute top-0 left-0 right-0 h-1"
                  style={{
                    background: theme === 'christmas'
                      ? 'linear-gradient(90deg, #EB6A46 0%, #EF4444 50%, #EB6A46 100%)'
                      : theme === 'newyear'
                      ? 'linear-gradient(90deg, #FCD34D 0%, #F59E0B 50%, #FCD34D 100%)'
                      : 'linear-gradient(90deg, #FFB217 0%, #D97706 50%, #FFB217 100%)',
                  }}
                />

                <div className="flex flex-col items-center text-center pt-4 pb-3">
                  {/* Icon */}
                  <motion.div
                    className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 shadow-lg`}
                    style={{
                      background: isSelected
                        ? `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`
                        : 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                      border: `2px solid ${isSelected ? colors.primary : 'rgba(255,255,255,0.1)'}`,
                    }}
                    animate={!shouldReduceMotion && isSelected ? {
                      scale: [1, 1.15, 1],
                      boxShadow: `0 0 30px ${colors.glow}`,
                    } : {}}
                    transition={{
                      duration: 2,
                      repeat: isSelected ? Infinity : 0,
                      ease: 'easeInOut',
                    }}
                  >
                    <Icon
                      size={24}
                      style={{
                        color: isSelected ? '#FFFFFF' : '#94A3B8',
                      }}
                    />
                  </motion.div>

                  {/* Amount */}
                  <h3 className="text-lg font-bold text-white mb-1">
                    ${suggestion.amount}
                  </h3>
                  {tokenAmount && (
                    <p className="text-xs text-[#94A3B8] mb-2">
                      ≈ {tokenAmount.toFixed(4)} tokens
                    </p>
                  )}

                  {/* Label */}
                  <p
                    className="text-xs font-semibold mb-1"
                    style={{
                      color: isSelected ? colors.primary : '#94A3B8',
                    }}
                  >
                    {suggestion.label}
                  </p>
                  <p className="text-[10px] text-[#64748B]">
                    {suggestion.description}
                  </p>
                </div>

                {/* Selection indicator */}
                {isSelected && (
                  <motion.div
                    className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center"
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

                {/* Sparkle effects on hover */}
                {!shouldReduceMotion && (
                  <motion.div
                    className="absolute inset-0 pointer-events-none"
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                  >
                    {Array.from({ length: 4 }, (_, i) => {
                      const angle = (i * 90) * (Math.PI / 180);
                      const distance = 25;
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
              </FrostedCard>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default SuggestedAmounts;






