import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { GiftStatus, Gift } from '../../types';
import { useTheme } from '../../context/ThemeContext';

interface StatusChipProps {
  status: GiftStatus;
  gift?: Gift; // Optional gift object to check expiration
  size?: 'sm' | 'md';
  className?: string;
}

const StatusChip: React.FC<StatusChipProps> = ({
  status,
  gift,
  size = 'md',
  className = '',
}) => {
  const { theme } = useTheme();
  const shouldReduceMotion = useReducedMotion();

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2 py-1 text-xs',
  };

  // Check if SENT status gift is actually expired
  const isExpired = status === GiftStatus.SENT && gift?.expires_at
    ? new Date(gift.expires_at) < new Date()
    : false;

  const getStatusStyles = () => {
    if (isExpired) {
      return 'bg-[#7F1D1D]/20 text-[#EF4444] border-[#EF4444]/20';
    }
    
    switch (status) {
      case GiftStatus.SENT:
        return 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20';
      case GiftStatus.CLAIMED:
        return 'bg-[#064E3B]/20 text-[#10B981] border-[#10B981]/20';
      case GiftStatus.REFUNDED:
        return 'bg-blue-500/10 text-blue-400 border-blue-400/20';
      case GiftStatus.EXPIRED:
      case GiftStatus.EXPIRED_EMPTY:
      case GiftStatus.EXPIRED_LOW_BALANCE:
        return 'bg-[#7F1D1D]/20 text-[#EF4444] border-[#EF4444]/20';
      default:
        return 'bg-[#1E293B]/40 text-[#94A3B8] border-white/10';
    }
  };

  const getStatusText = () => {
    if (isExpired) return 'Expired';
    if (status === GiftStatus.CLAIMED) return 'Claimed';
    if (status === GiftStatus.REFUNDED) return 'Refunded';
    if (status === GiftStatus.EXPIRED || status === GiftStatus.EXPIRED_EMPTY || status === GiftStatus.EXPIRED_LOW_BALANCE) return 'Expired';
    return 'Sent';
  };

  // Get ribbon color based on status
  const getRibbonColor = () => {
    if (isExpired || status === GiftStatus.EXPIRED || status === GiftStatus.EXPIRED_EMPTY || status === GiftStatus.EXPIRED_LOW_BALANCE) {
      return 'linear-gradient(90deg, #EF4444 0%, #DC2626 50%, #EF4444 100%)';
    }
    if (status === GiftStatus.CLAIMED) {
      return 'linear-gradient(90deg, #10B981 0%, #059669 50%, #10B981 100%)';
    }
    if (status === GiftStatus.SENT) {
      return theme === 'christmas'
        ? 'linear-gradient(90deg, #EB6A46 0%, #EF4444 50%, #EB6A46 100%)'
        : theme === 'newyear'
        ? 'linear-gradient(90deg, #FCD34D 0%, #F59E0B 50%, #FCD34D 100%)'
        : 'linear-gradient(90deg, #F59E0B 0%, #D97706 50%, #F59E0B 100%)';
    }
    return 'linear-gradient(90deg, #64748B 0%, #475569 50%, #64748B 100%)';
  };

  const statusText = getStatusText();
  
  return (
    <motion.span
      className={`inline-flex items-center rounded-full font-bold border relative overflow-hidden ${sizeClasses[size]} ${getStatusStyles()} ${className}`}
      whileHover={!shouldReduceMotion ? {
        scale: 1.05,
      } : {}}
      animate={!shouldReduceMotion && status === GiftStatus.CLAIMED ? {
        boxShadow: ['0 0 0px rgba(16, 185, 129, 0.3)', '0 0 15px rgba(16, 185, 129, 0.5)', '0 0 0px rgba(16, 185, 129, 0.3)'],
      } : {}}
      transition={{
        duration: 2,
        repeat: status === GiftStatus.CLAIMED ? Infinity : 0,
        ease: 'easeInOut',
      }}
      role="status"
      aria-label={`Gift status: ${statusText}`}
    >
      {/* Ribbon accent for certain statuses */}
      {(status === GiftStatus.SENT || status === GiftStatus.CLAIMED) && !shouldReduceMotion && (
        <motion.div
          className="absolute top-0 left-0 right-0 h-0.5"
          style={{
            background: getRibbonColor(),
          }}
          animate={{
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      )}
      <span className="relative z-10">{statusText}</span>
    </motion.span>
  );
};

export default StatusChip;
