import React, { useState } from 'react';
import { LucideIcon, Gift } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

interface GlowButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'cyan' | 'gold' | 'ghost' | 'holiday-primary' | 'holiday-secondary' | 'frost';
  className?: string;
  icon?: LucideIcon;
  fullWidth?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  enableRibbonWiggle?: boolean; // For CTA buttons that should have ribbon animation
}

const GlowButton: React.FC<GlowButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  className = '',
  icon: Icon,
  fullWidth = false,
  disabled = false,
  type = 'button',
  enableRibbonWiggle = false,
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const { theme } = useTheme();

  // Get ribbon color based on theme
  const getRibbonColor = () => {
    if (theme === 'christmas') return '#EB6A46';
    if (theme === 'newyear') return '#FCD34D';
    return '#BE123C';
  };
  
  const base = "relative overflow-hidden transition-all duration-300 ease-out font-medium tracking-wide rounded-xl flex items-center justify-center gap-3 py-4 px-6 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent min-h-[44px]";
  
  const variants = {
    primary: `bg-[#BE123C] text-white shadow-[0_0_20px_rgba(245,158,11,0.15)] hover:shadow-[0_0_30px_rgba(245,158,11,0.3)] hover:-translate-y-0.5 border border-white/10 focus:ring-[#BE123C]`,
    secondary: "bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-white/20 focus:ring-white/20",
    ghost: "bg-transparent text-[#94A3B8] hover:text-white hover:bg-white/5 focus:ring-white/20",
    gold: "bg-[#F59E0B] text-[#0B1120] hover:bg-[#D97706] shadow-lg shadow-amber-500/20 focus:ring-[#F59E0B]",
    cyan: "bg-[#06B6D4] text-white hover:bg-[#0891B2] shadow-[0_0_20px_rgba(6,182,212,0.15)] focus:ring-[#06B6D4]",
    'holiday-primary': `bg-[var(--holiday-red)] text-white shadow-[var(--shadow-holiday)] hover:shadow-[0_0_40px_var(--glow-holiday)] hover:-translate-y-0.5 border border-white/10 focus:ring-[var(--holiday-red)]`,
    'holiday-secondary': `bg-[var(--brand)] text-[#0B1120] shadow-[var(--shadow-glow)] hover:shadow-[0_0_30px_var(--glow)] hover:-translate-y-0.5 border border-white/10 focus:ring-[var(--brand)]`,
    'frost': `bg-[var(--frost)]/10 text-[var(--frost)] border border-[var(--frost)]/30 hover:bg-[var(--frost)]/20 hover:border-[var(--frost)]/50 shadow-[var(--shadow-glow)] focus:ring-[var(--frost)]`
  };

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
      whileTap={!shouldReduceMotion && !disabled ? { scale: 0.92 } : {}}
      animate={!shouldReduceMotion && isPressed ? { scale: 0.92 } : { scale: 1 }}
      transition={{ duration: 0.1, ease: 'easeOut' }}
      className={`${base} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className} group relative`}
      style={{
        boxShadow: isPressed && !shouldReduceMotion
          ? '0 2px 8px rgba(0, 0, 0, 0.2)'
          : undefined,
      }}
    >
      <span className="relative z-10 flex items-center gap-2">
        {Icon && (
          <motion.div
            whileHover={!shouldReduceMotion ? { rotate: 12 } : {}}
            transition={{ duration: 0.3 }}
          >
            <Icon size={18} />
          </motion.div>
        )}
        {children}
      </span>
      
      {/* Enhanced shine sweep effect with periodic animation */}
      {(variant === 'primary' || variant === 'holiday-primary' || variant === 'holiday-secondary') && !disabled && (
        <>
          {/* Periodic shine (every 3-4 seconds when not hovered) */}
          <motion.div 
            className="absolute inset-0 pointer-events-none"
            style={{
              background: theme === 'christmas'
                ? 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.25) 50%, transparent 100%)'
                : theme === 'newyear'
                ? 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100%)'
                : 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.2) 50%, transparent 100%)',
            }}
            animate={!shouldReduceMotion ? {
              x: ['-100%', '100%'],
            } : {}}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              repeatDelay: 3,
              ease: 'easeInOut',
            }}
          />
          {/* Hover shine sweep */}
          <motion.div 
            className="absolute inset-0 pointer-events-none"
            style={{
              background: theme === 'christmas'
                ? 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100%)'
                : theme === 'newyear'
                ? 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.35) 50%, transparent 100%)'
                : 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.25) 50%, transparent 100%)',
            }}
            initial={{ x: '-100%' }}
            whileHover={!shouldReduceMotion ? { x: '100%' } : {}}
            transition={{ duration: 0.7, ease: 'easeInOut' }}
          />
        </>
      )}
      
      {/* Enhanced Ribbon decoration with wiggle animation */}
      {enableRibbonWiggle && !disabled && (variant === 'primary' || variant === 'holiday-primary' || variant === 'holiday-secondary') && (
        <motion.div
          className="absolute -top-4 left-1/2 -translate-x-1/2 pointer-events-none z-20"
          animate={
            !shouldReduceMotion
              ? {
                  rotate: [0, -3, 3, -3, 3, 0],
                  y: [0, -2, 0, -2, 0],
                }
              : {}
          }
          transition={{
            duration: 0.6,
            ease: 'easeInOut',
            repeat: Infinity,
            repeatDelay: 1.5,
          }}
        >
          <motion.div
            className="w-12 h-4 rounded-t-full"
            style={{
              backgroundColor: getRibbonColor(),
              boxShadow: `0 0 10px ${getRibbonColor()}40`,
            }}
          />
          <motion.div
            className="absolute top-2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${getRibbonColor()} 0%, ${getRibbonColor()}dd 100%)`,
              boxShadow: `0 0 15px ${getRibbonColor()}50`,
            }}
            animate={
              !shouldReduceMotion
                ? {
                    scale: [1, 1.1, 1],
                  }
                : {}
            }
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <Gift size={12} className="text-white" />
          </motion.div>
        </motion.div>
      )}
    </motion.button>
  );
};

export default GlowButton;

