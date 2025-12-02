import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { AlertTriangle, ArrowUpRight, TrendingUp } from 'lucide-react';
import GlassCard from './GlassCard';
import GlowButton from './GlowButton';
import { useTheme } from '../../context/ThemeContext';

interface BalanceResolutionPanelProps {
  balanceError: string | null;
  requiredAmount?: number;
  currentBalance?: number;
  onAddFunds?: () => void;
}

const BalanceResolutionPanel: React.FC<BalanceResolutionPanelProps> = ({
  balanceError,
  requiredAmount,
  currentBalance,
  onAddFunds,
}) => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const shouldReduceMotion = useReducedMotion();

  if (!balanceError) return null;

  const handleAddFunds = () => {
    if (onAddFunds) {
      onAddFunds();
    } else {
      navigate('/add-funds');
    }
  };

  // Extract shortfall from error message if not provided
  const extractShortfall = (error: string): number | null => {
    const match = error.match(/need ([\d.]+)/i);
    return match ? parseFloat(match[1]) : null;
  };

  const shortfall = requiredAmount || extractShortfall(balanceError) || 0;
  const balance = currentBalance || 0;
  const total = balance + shortfall;

  // Calculate progress percentage
  const progressPercentage = total > 0 ? (balance / total) * 100 : 0;

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
      primary: '#FFB217',
      glow: 'rgba(255, 178, 23, 0.3)',
    };
  };

  const colors = getColors();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
    >
      <GlassCard
        variant="holiday"
        className="border-[#EF4444]/30 bg-[#7F1D1D]/10 relative overflow-hidden"
        role="alert"
        aria-live="polite"
        aria-label="Balance resolution panel"
      >
        {/* Ribbon accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#EF4444] via-[#F87171] to-[#EF4444]" />

        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <motion.div
              className="w-12 h-12 rounded-full bg-[#EF4444]/20 flex items-center justify-center flex-shrink-0"
              animate={!shouldReduceMotion ? {
                scale: [1, 1.1, 1],
              } : {}}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <AlertTriangle size={24} className="text-[#EF4444]" />
            </motion.div>
            <div className="flex-1">
              <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
                Insufficient Balance
                <TrendingUp size={16} className="text-[#EF4444]" aria-hidden="true" />
              </h3>
              <p className="text-sm text-[#94A3B8] mb-4" role="status">
                {balanceError}
              </p>
              
              {/* Progress indicator */}
              {shortfall > 0 && (
                <div className="space-y-3 mb-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-[#94A3B8]">Current Balance:</span>
                      <span className="text-white font-medium">{balance.toFixed(4)} SOL</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-[#94A3B8]">Required:</span>
                      <span className="text-white font-medium">{total.toFixed(4)} SOL</span>
                    </div>
                    <div className="h-2 bg-[#1E293B] rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-[#EF4444] to-[#F87171]"
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercentage}%` }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center pt-2 border-t border-white/10">
                    <span className="text-sm font-medium text-[#FCD34D]">You need:</span>
                    <span className="text-lg font-bold text-[#FCD34D]">
                      ~{shortfall.toFixed(4)} SOL
                    </span>
                  </div>
                </div>
              )}

              <GlowButton
                variant="primary"
                fullWidth
                icon={ArrowUpRight}
                onClick={handleAddFunds}
                enableRibbonWiggle
                className="mt-4"
              >
                Add Funds
              </GlowButton>
              <p className="text-xs text-[#64748B] mt-2 text-center">
                Add funds to your wallet to continue
              </p>
            </div>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
};

export default BalanceResolutionPanel;
