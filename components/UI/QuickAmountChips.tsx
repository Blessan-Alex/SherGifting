import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

interface QuickAmountChipsProps {
  onAmountSelect: (amount: string | null) => void;
  selectedAmount: string | null;
  className?: string;
  tokenPrice?: number | null;
}

const quickAmounts = [
  { label: '$10', value: '10' },
  { label: '$25', value: '25' },
  { label: '$50', value: '50' },
  { label: '$100', value: '100' },
  { label: 'Custom', value: 'custom' },
];

const QuickAmountChips: React.FC<QuickAmountChipsProps> = ({
  onAmountSelect,
  selectedAmount,
  className = '',
  tokenPrice,
}) => {
  const { theme } = useTheme();
  const shouldReduceMotion = useReducedMotion();

  const handleChipClick = (value: string) => {
    if (value === 'custom') {
      onAmountSelect(null);
    } else {
      onAmountSelect(value);
    }
  };

  // Get theme-aware colors
  const getColors = () => {
    if (theme === 'christmas') {
      return {
        selected: '#EB6A46',
        glow: 'rgba(235, 106, 70, 0.3)',
      };
    }
    if (theme === 'newyear') {
      return {
        selected: '#FCD34D',
        glow: 'rgba(252, 211, 77, 0.3)',
      };
    }
    return {
      selected: '#06B6D4',
      glow: 'rgba(6, 182, 212, 0.3)',
    };
  };

  const colors = getColors();

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex flex-wrap gap-2">
        {quickAmounts.map((chip) => {
          const isSelected = selectedAmount === chip.value || 
            (chip.value !== 'custom' && selectedAmount === chip.value);
          
          return (
            <motion.button
              key={chip.value}
              type="button"
              onClick={() => handleChipClick(chip.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleChipClick(chip.value);
                }
              }}
              aria-label={`Select ${chip.label} amount`}
              aria-pressed={isSelected}
              className={`
                relative px-5 py-2.5 rounded-xl text-sm font-medium transition-all
                overflow-hidden min-h-[44px]
                focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent
                ${isSelected
                  ? 'text-white shadow-lg'
                  : 'text-[#94A3B8] hover:text-white border border-white/10 hover:border-white/20'
                }
                active:scale-95
              `}
              style={{
                backgroundColor: isSelected ? colors.selected : 'rgba(15, 23, 42, 0.5)',
                boxShadow: isSelected ? `0 0 20px ${colors.glow}` : undefined,
                '--tw-ring-color': colors.selected,
              } as React.CSSProperties}
              whileHover={!shouldReduceMotion ? {
                scale: 1.05,
                y: -2,
              } : {}}
              whileTap={!shouldReduceMotion ? {
                scale: 0.95,
              } : {}}
              animate={!shouldReduceMotion && isSelected ? {
                boxShadow: [`0 0 20px ${colors.glow}`, `0 0 30px ${colors.glow}`, `0 0 20px ${colors.glow}`],
              } : {}}
              transition={{
                duration: 2,
                repeat: isSelected ? Infinity : 0,
                ease: 'easeInOut',
              }}
            >
              {/* Ribbon accent for selected */}
              {isSelected && (
                <motion.div
                  className="absolute top-0 left-0 right-0 h-1"
                  style={{
                    background: theme === 'christmas'
                      ? 'linear-gradient(90deg, #EB6A46 0%, #EF4444 50%, #EB6A46 100%)'
                      : theme === 'newyear'
                      ? 'linear-gradient(90deg, #FCD34D 0%, #F59E0B 50%, #FCD34D 100%)'
                      : 'linear-gradient(90deg, #06B6D4 0%, #0891B2 50%, #06B6D4 100%)',
                  }}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.3 }}
                />
              )}

              {/* Shine sweep effect */}
              {isSelected && !shouldReduceMotion && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  initial={{ x: '-100%' }}
                  animate={{ x: '100%' }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    repeatDelay: 2,
                    ease: 'easeInOut',
                  }}
                />
              )}

              <span className="relative z-10">{chip.label}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default QuickAmountChips;
