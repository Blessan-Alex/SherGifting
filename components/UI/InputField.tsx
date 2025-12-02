import React, { useState } from 'react';
import { LucideIcon, CheckCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

interface InputFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon?: LucideIcon;
  rightElement?: React.ReactNode;
  subLabel?: string;
  helperText?: string;
  error?: string;
  success?: boolean;
  className?: string;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  icon: Icon,
  rightElement,
  subLabel,
  helperText,
  error,
  success = false,
  className = "",
  ...inputProps
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const { theme } = useTheme();
  const shouldReduceMotion = useReducedMotion();
  
  const hasError = Boolean(error);
  const hasSuccess = success && !hasError && value.length > 0;
  const showHelper = Boolean(helperText || error);

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

  const borderColor = hasError
    ? 'border-[#EF4444]'
    : hasSuccess
    ? 'border-[#10B981]'
    : isFocused
    ? ''
    : 'border-white/10';
  
  const ringColor = hasError
    ? 'ring-[#EF4444]/20'
    : hasSuccess
    ? 'ring-[#10B981]/20'
    : isFocused
    ? ''
    : '';

  return (
    <div className={`group space-y-2 w-full ${className}`}>
      <div className="flex justify-between items-baseline">
        {label && (
          <motion.label
            htmlFor={inputProps.id}
            className="text-xs font-bold uppercase tracking-widest text-[#94A3B8] ml-1"
            animate={isFocused && !shouldReduceMotion ? {
              color: hasError ? '#EF4444' : hasSuccess ? '#10B981' : colors.focus,
            } : {}}
            transition={{ duration: 0.2 }}
          >
            {label}
          </motion.label>
        )}
        {subLabel && <span className="text-xs text-[#64748B]">{subLabel}</span>}
      </div>
      
      <div className="relative">
        <motion.div
          className={`
            relative flex items-center bg-[#0F172A]/50 border rounded-xl px-4 py-3.5
            transition-all duration-300
            ${borderColor}
            ${isFocused ? 'bg-[#0F172A]' : ''}
          `}
          animate={!shouldReduceMotion && isFocused ? {
            boxShadow: hasError
              ? '0 0 20px rgba(239, 68, 68, 0.2)'
              : hasSuccess
              ? '0 0 20px rgba(16, 185, 129, 0.2)'
              : `0 0 20px ${colors.glow}`,
            ringWidth: '4px',
          } : {}}
          style={{
            ringColor: isFocused
              ? (hasError ? 'rgba(239, 68, 68, 0.2)' : hasSuccess ? 'rgba(16, 185, 129, 0.2)' : colors.glow)
              : undefined,
          }}
        >
          {/* Frosty glow effect on focus */}
          {isFocused && !shouldReduceMotion && !hasError && !hasSuccess && (
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

          {Icon && (
            <motion.div
              animate={!shouldReduceMotion && isFocused ? {
                scale: 1.1,
              } : {}}
              transition={{ duration: 0.2 }}
            >
              <Icon
                size={18}
                className={`
                  mr-3 transition-colors
                  ${hasError
                    ? 'text-[#EF4444]'
                    : hasSuccess
                    ? 'text-[#10B981]'
                    : isFocused
                    ? ''
                    : 'text-[#64748B]'
                  }
                `}
                style={{
                  color: isFocused && !hasError && !hasSuccess ? colors.focus : undefined,
                }}
              />
            </motion.div>
          )}

          <input
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="w-full bg-transparent outline-none text-white placeholder:text-[#64748B] font-medium disabled:opacity-50 disabled:cursor-not-allowed relative z-10 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
            style={{
              '--tw-ring-color': isFocused
                ? (hasError ? 'rgba(239, 68, 68, 0.5)' : hasSuccess ? 'rgba(16, 185, 129, 0.5)' : colors.focus)
                : undefined,
            } as React.CSSProperties}
            aria-invalid={hasError}
            aria-describedby={showHelper ? `${inputProps.id || 'input'}-helper` : undefined}
            {...inputProps}
          />

          {/* Success/Error icon */}
          <AnimatePresence>
            {hasSuccess && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                className="ml-2"
              >
                <CheckCircle size={18} className="text-[#10B981]" />
              </motion.div>
            )}
            {hasError && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                className="ml-2"
              >
                <AlertCircle size={18} className="text-[#EF4444]" />
              </motion.div>
            )}
          </AnimatePresence>

          {rightElement}
        </motion.div>
      </div>

      {/* Helper text with smooth transitions */}
      <AnimatePresence>
        {showHelper && (
          <motion.p
            id={`${inputProps.id || 'input'}-helper`}
            role={hasError ? 'alert' : undefined}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
            className={`text-xs mt-1 ml-1 ${hasError ? 'text-[#EF4444]' : 'text-[#94A3B8]'}`}
          >
            {error || helperText}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InputField;
