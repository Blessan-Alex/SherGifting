import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { X } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

interface FilterChipsProps {
  options: FilterOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  multiSelect?: boolean;
  showCount?: boolean;
  className?: string;
}

const FilterChips: React.FC<FilterChipsProps> = ({
  options,
  selected,
  onChange,
  multiSelect = true,
  showCount = false,
  className = '',
}) => {
  const { theme } = useTheme();
  const shouldReduceMotion = useReducedMotion();

  const handleToggle = (value: string) => {
    if (multiSelect) {
      if (selected.includes(value)) {
        onChange(selected.filter((v) => v !== value));
      } else {
        onChange([...selected, value]);
      }
    } else {
      onChange(selected.includes(value) ? [] : [value]);
    }
  };

  const handleClearAll = () => {
    onChange([]);
  };

  const activeCount = selected.length;

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
      selected: '#BE123C',
      glow: 'rgba(190, 18, 60, 0.3)',
    };
  };

  const colors = getColors();

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex flex-wrap items-center gap-2">
        {options.map((option, index) => {
          const isSelected = selected.includes(option.value);
          return (
            <motion.button
              key={option.value}
              type="button"
              onClick={() => handleToggle(option.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleToggle(option.value);
                }
              }}
              aria-label={`Filter by ${option.label}${option.count !== undefined ? ` (${option.count} items)` : ''}`}
              aria-pressed={isSelected}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={!shouldReduceMotion ? { scale: 1.05, y: -2 } : {}}
              whileTap={!shouldReduceMotion ? { scale: 0.95 } : {}}
              className={`
                relative px-4 py-2 rounded-lg text-sm font-medium transition-all overflow-hidden min-h-[44px]
                focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent
                ${isSelected
                  ? 'text-white shadow-lg'
                  : 'text-[#94A3B8] hover:text-white bg-[#0F172A]/50 hover:bg-[#1E293B] border border-white/10'
                }
              `}
              style={{
                backgroundColor: isSelected ? colors.selected : undefined,
                boxShadow: isSelected ? `0 0 20px ${colors.glow}` : undefined,
                '--tw-ring-color': colors.selected,
              } as React.CSSProperties}
            >
              {/* Ribbon accent for selected */}
              {isSelected && (
                <motion.div
                  className="absolute top-0 left-0 right-0 h-0.5"
                  style={{
                    background: theme === 'christmas'
                      ? 'linear-gradient(90deg, #EB6A46 0%, #EF4444 50%, #EB6A46 100%)'
                      : theme === 'newyear'
                      ? 'linear-gradient(90deg, #FCD34D 0%, #F59E0B 50%, #FCD34D 100%)'
                      : 'linear-gradient(90deg, #BE123C 0%, #EF4444 50%, #BE123C 100%)',
                  }}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.3 }}
                />
              )}

              {/* Shine effect on selected */}
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

              <span className="relative z-10">
                {option.label}
                {showCount && option.count !== undefined && (
                  <span className={`ml-2 px-1.5 py-0.5 rounded text-xs ${
                    isSelected ? 'bg-white/20' : 'bg-white/10'
                  }`}>
                    {option.count}
                  </span>
                )}
              </span>
            </motion.button>
          );
        })}
        {activeCount > 0 && (
          <motion.button
            type="button"
            onClick={handleClearAll}
            className="px-3 py-2 rounded-lg text-sm font-medium text-[#94A3B8] hover:text-white hover:bg-[#1E293B] border border-white/10 transition-all flex items-center gap-1"
            whileHover={!shouldReduceMotion ? { scale: 1.05 } : {}}
            whileTap={!shouldReduceMotion ? { scale: 0.95 } : {}}
          >
            <X size={14} />
            Clear ({activeCount})
          </motion.button>
        )}
      </div>
    </div>
  );
};

export default FilterChips;
