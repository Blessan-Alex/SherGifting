import React, { useState } from 'react';
import { LucideIcon } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';

interface GhostButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  icon?: LucideIcon;
  fullWidth?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

const GhostButton: React.FC<GhostButtonProps> = ({
  children,
  onClick,
  className = '',
  icon: Icon,
  fullWidth = false,
  disabled = false,
  type = 'button',
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
    focus-visible:ring-white/20
    bg-transparent
    text-[var(--text-muted)]
    hover:text-white
    hover:bg-[var(--surface)]
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
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      animate={!shouldReduceMotion && isPressed ? { scale: 0.98 } : { scale: 1 }}
      transition={{ duration: 0.1 }}
      className={`${baseStyles} ${fullWidth ? 'w-full' : ''} ${className}`}
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
    </motion.button>
  );
};

export default GhostButton;

