import React from 'react';
import { useReducedMotion } from 'framer-motion';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
  padding?: string;
  variant?: 'default' | 'gift' | 'balance' | 'holiday';
  hover?: boolean; // Enable hover effects
  onClick?: () => void;
}

const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = "",
  glow = false,
  padding = "p-6",
  variant = 'default',
  hover = true,
  onClick,
}) => {
  const shouldReduceMotion = useReducedMotion();
  
  const getVariantStyles = () => {
    switch (variant) {
      case 'gift':
        return {
          background: 'bg-[var(--surface-elevated)]',
          border: 'border border-[var(--border)]',
          decoration: 'before:absolute before:inset-0 before:border-t-2 before:border-[var(--holiday-red)]/30 before:rounded-t-3xl',
          glow: 'bg-gradient-to-br from-[var(--holiday-red)]/5 via-[var(--accent)]/5 to-transparent'
        };
      case 'balance':
        return {
          background: 'bg-gradient-to-br from-[var(--surface-elevated)] to-[var(--bg-secondary)]',
          border: 'border border-[var(--border)]',
          decoration: '',
          glow: 'bg-gradient-to-br from-[var(--brand)]/10 to-transparent'
        };
      case 'holiday':
        return {
          background: 'bg-[var(--surface-elevated)]',
          border: 'border border-[var(--holiday-primary)]/30',
          decoration: '',
          glow: 'bg-gradient-to-br from-[var(--holiday-primary)]/10 via-[var(--holiday-secondary)]/5 to-transparent'
        };
      default:
        return {
          background: 'bg-[var(--surface)]',
          border: 'border border-[var(--border)]',
          decoration: '',
          glow: 'bg-gradient-to-br from-[var(--brand)]/5 to-transparent'
        };
    }
  };

  const styles = getVariantStyles();
  const shouldShowGlow = glow || variant === 'gift' || variant === 'balance' || variant === 'holiday';

  return (
    <div 
      className={`relative ${styles.background} backdrop-blur-xl ${styles.border} shadow-2xl rounded-3xl overflow-hidden transition-all duration-300 ease-out ${
        hover && !shouldReduceMotion 
          ? 'hover:scale-[1.01] hover:shadow-[var(--shadow-glow)] hover:border-[var(--border-hover)]' 
          : ''
      } ${className}`}
      onClick={onClick}
    >
      <div className="absolute inset-0 border border-white/5 rounded-3xl pointer-events-none" />
      {variant === 'gift' && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[var(--holiday-red)]/40 via-[var(--accent)]/40 to-[var(--holiday-red)]/40 rounded-t-3xl" />
      )}
      {shouldShowGlow && (
        <div className={`absolute inset-0 ${styles.glow} opacity-50 pointer-events-none`} />
      )}
      <div className={`relative z-10 ${padding}`}>
        {children}
      </div>
    </div>
  );
};

export default GlassCard;

