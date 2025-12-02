import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
  className?: string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = 'Search...',
  debounceMs = 300,
  className = '',
  onKeyDown,
}) => {
  const [localValue, setLocalValue] = useState(value);
  const [isFocused, setIsFocused] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { theme } = useTheme();
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      onChange(localValue);
    }, debounceMs);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [localValue, debounceMs, onChange]);

  const handleClear = () => {
    setLocalValue('');
    onChange('');
    inputRef.current?.focus();
  };

  // Get theme-aware colors
  const getColors = () => {
    if (theme === 'christmas') {
      return {
        focus: '#EB6A46',
        glow: 'rgba(235, 106, 70, 0.2)',
      };
    }
    if (theme === 'newyear') {
      return {
        focus: '#FCD34D',
        glow: 'rgba(252, 211, 77, 0.2)',
      };
    }
    return {
      focus: '#BE123C',
      glow: 'rgba(190, 18, 60, 0.2)',
    };
  };

  const colors = getColors();

  return (
    <div className={`relative ${className}`}>
      <motion.div
        className="relative flex items-center"
        animate={isFocused && !shouldReduceMotion ? {
          scale: 1.01,
        } : {}}
        transition={{ duration: 0.2 }}
      >
        <motion.div
          animate={isFocused && !shouldReduceMotion ? {
            scale: 1.1,
            color: colors.focus,
          } : {}}
          transition={{ duration: 0.2 }}
        >
          <Search size={18} className="absolute left-4 text-[#64748B] pointer-events-none z-10" />
        </motion.div>
        <input
          ref={inputRef}
          type="text"
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          onKeyDown={onKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="w-full bg-[#0F172A]/50 border border-white/10 rounded-xl px-12 py-3 text-white placeholder:text-[#475569] outline-none focus:ring-4 transition pl-12 relative z-10"
          style={{
            borderColor: isFocused ? colors.focus : undefined,
            ringColor: isFocused ? colors.glow : undefined,
            boxShadow: isFocused ? `0 0 20px ${colors.glow}` : undefined,
          }}
          aria-label="Search"
        />
        {/* Frosty glow effect on focus */}
        {isFocused && !shouldReduceMotion && (
          <motion.div
            className="absolute inset-0 rounded-xl pointer-events-none"
            style={{
              background: `radial-gradient(circle at center, ${colors.glow} 0%, transparent 70%)`,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.3, 0.5, 0.3] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        )}
        <AnimatePresence>
          {localValue && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={handleClear}
              className="absolute right-4 p-1 rounded-lg hover:bg-white/10 transition-colors z-10"
              aria-label="Clear search"
              whileHover={!shouldReduceMotion ? { scale: 1.1 } : {}}
              whileTap={!shouldReduceMotion ? { scale: 0.9 } : {}}
            >
              <X size={16} className="text-[#94A3B8]" />
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default SearchBar;
