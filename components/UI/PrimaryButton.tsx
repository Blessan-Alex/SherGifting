import React, { useState } from 'react';
import { LucideIcon } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';

interface PrimaryButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  icon?: LucideIcon;
  fullWidth?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'default' | 'holiday';
}

const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  children,
  onClick,
  className = '',
  icon: Icon,
  fullWidth = false,
  disabled = false,
  type = 'button',
  variant = 'default',
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  
  const baseStyles = `
    relative
    overflow-hidden
    transition-all
    duration-300
    ease-out
    font-medium
    tracking-wide
    rounded-xl
    flex
    items-center
    justify-center
    gap-3
    py-4
    px-6
    min-h-[44px]
    disabled:opacity-50
    disabled:cursor-not-allowed
    focus:outline-none
    focus-visible:ring-2
    focus-visible:ring-offset-2
    focus-visible:ring-offset-transparent
    ${variant === 'holiday' 
      ? 'bg-[var(--holiday-red)] text-white shadow-[var(--shadow-holiday)] hover:shadow-[0_0_40px_var(--glow-holiday)] focus:ring-[var(--holiday-red)]' 
      : 'bg-[var(--brand)] text-[#0B1120] shadow-[var(--shadow-glow)] hover:shadow-[0_0_30px_var(--glow)] focus:ring-[var(--brand)]'
    }
    hover:-translate-y-0.5
    border
    border-white/10
    group
  `;

  const handleMouseDown = () => {
    if (!disabled && !shouldReduceMotion) {
      setIsPressed(true);
    }
  };

  const handleMouseUp = () => {
    setIsPressed(false);
  };

  const handleMouseLeave = () => {
    setIsPressed(false);
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      className={`${baseStyles} ${fullWidth ? 'w-full' : ''} ${!shouldReduceMotion && isPressed ? 'scale-[0.98]' : 'scale-100'} ${className}`}
    >
      <span className="relative z-10 flex items-center gap-2">
        {Icon && (
          <motion.div
            animate={!shouldReduceMotion ? { rotate: [0, 12, 0] } : {}}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="group-hover:rotate-12"
          >
            <Icon size={18} />
          </motion.div>
        )}
        {children}
      </span>
      
      {/* Shine sweep effect */}
      {!disabled && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          initial={{ x: '-100%' }}
          whileHover={!shouldReduceMotion ? { x: '100%' } : {}}
          transition={{ duration: 0.7, ease: 'easeInOut' }}
        />
      )}
    </motion.button>
  );
};

export default PrimaryButton;

