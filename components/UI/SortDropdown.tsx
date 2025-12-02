import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ArrowUpDown } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

export type SortDirection = 'asc' | 'desc';

interface SortOption {
  value: string;
  label: string;
}

interface SortDropdownProps {
  options: SortOption[];
  value: string;
  direction: SortDirection;
  onChange: (value: string, direction: SortDirection) => void;
  className?: string;
}

const SortDropdown: React.FC<SortDropdownProps> = ({
  options,
  value,
  direction,
  onChange,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value) || options[0];

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
      primary: '#BE123C',
      glow: 'rgba(190, 18, 60, 0.3)',
    };
  };

  const colors = getColors();

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <motion.button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={(e) => {
          if (e.key === 'Escape' && isOpen) {
            setIsOpen(false);
          }
        }}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0F172A]/50 border border-white/10 text-white hover:bg-[#1E293B] hover:border-white/20 transition-all min-h-[44px] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
        aria-label={`Sort by ${selectedOption.label}`}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        style={{
          borderColor: isOpen ? colors.primary : undefined,
          boxShadow: isOpen ? `0 0 20px ${colors.glow}` : undefined,
          '--tw-ring-color': colors.primary,
        } as React.CSSProperties}
        whileHover={!shouldReduceMotion ? { scale: 1.05 } : {}}
        whileTap={!shouldReduceMotion ? { scale: 0.95 } : {}}
      >
        <ArrowUpDown size={16} className="text-[#94A3B8]" />
        <span className="text-sm font-medium">{selectedOption.label}</span>
        <motion.div
          animate={isOpen ? { rotate: 180 } : { rotate: 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown size={16} className="text-[#94A3B8]" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full mt-2 right-0 z-50 bg-[#1E293B] border border-white/10 rounded-xl shadow-2xl min-w-[200px] overflow-hidden backdrop-blur-xl"
            role="listbox"
            aria-label="Sort options"
            style={{
              borderColor: colors.primary + '40',
            }}
          >
            {options.map((option, index) => {
              const isSelected = value === option.value;
              return (
              <motion.button
                key={option.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(option.value, direction);
                  setIsOpen(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onChange(option.value, direction);
                    setIsOpen(false);
                  }
                }}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`
                  w-full px-4 py-3 text-left text-sm transition-colors relative overflow-hidden min-h-[44px]
                  focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent
                  ${isSelected
                    ? 'text-white font-medium'
                    : 'text-[#94A3B8] hover:bg-white/5 hover:text-white'
                  }
                `}
                style={{
                  backgroundColor: isSelected ? `${colors.primary}20` : undefined,
                  '--tw-ring-color': colors.primary,
                } as React.CSSProperties}
              >
                {/* Ribbon accent for selected */}
                {value === option.value && (
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
                <span className="relative z-10">{option.label}</span>
              </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SortDropdown;
