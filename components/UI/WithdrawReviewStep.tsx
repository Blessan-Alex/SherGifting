import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Edit2, ArrowUpRight, Sparkles } from 'lucide-react';
import FrostedCard from './FrostedCard';
import GlowButton from './GlowButton';
import { useTheme } from '../../context/ThemeContext';

interface WithdrawReviewStepProps {
  withdrawalAddress: string;
  amount: number;
  tokenSymbol: string;
  tokenName: string;
  usdValue: number | null;
  fee: number;
  total: number;
  usdFee: number | null;
  usdTotal: number | null;
  remainingBalance: number;
  remainingBalanceUsd: number | null;
  onEditStep: (step: number) => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
  disabled?: boolean;
}

const WithdrawReviewStep: React.FC<WithdrawReviewStepProps> = ({
  withdrawalAddress,
  amount,
  tokenSymbol,
  tokenName,
  usdValue,
  fee,
  total,
  usdFee,
  usdTotal,
  remainingBalance,
  remainingBalanceUsd,
  onEditStep,
  onSubmit,
  isSubmitting = false,
  disabled = false,
}) => {
  const { theme } = useTheme();
  const shouldReduceMotion = useReducedMotion();

  const formatCurrency = (value: number | null) => {
    if (value === null) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

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
      primary: '#06B6D4',
      glow: 'rgba(6, 182, 212, 0.3)',
    };
  };

  const colors = getColors();

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div>
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
          <Sparkles size={24} style={{ color: colors.primary }} />
          Review Withdrawal
        </h2>
        <p className="text-[#94A3B8] text-sm">Double-check everything before sending</p>
      </div>

      <FrostedCard variant="holiday" className="relative overflow-hidden">
        {/* Ribbon accent */}
        <div
          className="absolute top-0 left-0 right-0 h-1 z-10"
          style={{
            background: theme === 'christmas'
              ? 'linear-gradient(90deg, #EB6A46 0%, #EF4444 50%, #EB6A46 100%)'
              : theme === 'newyear'
              ? 'linear-gradient(90deg, #FCD34D 0%, #F59E0B 50%, #FCD34D 100%)'
              : 'linear-gradient(90deg, #06B6D4 0%, #0891B2 50%, #06B6D4 100%)',
          }}
        />

        <div className="space-y-6 relative z-10">
          {/* Recipient Address */}
          <motion.div
            className="flex items-start justify-between"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <ArrowUpRight size={16} className="text-[#94A3B8]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">Withdrawal Address</span>
              </div>
              <p className="text-white font-mono text-sm break-all">{withdrawalAddress}</p>
              <p className="text-xs text-[#64748B] mt-1">Solana network</p>
            </div>
            <motion.button
              type="button"
              onClick={() => onEditStep(3)}
              className="flex items-center gap-1 text-xs transition-colors"
              style={{ color: colors.primary }}
              whileHover={!shouldReduceMotion ? { scale: 1.05 } : {}}
              whileTap={!shouldReduceMotion ? { scale: 0.95 } : {}}
            >
              <Edit2 size={12} />
              Edit
            </motion.button>
          </motion.div>

          <div className="h-px bg-white/10" />

          {/* Amount */}
          <motion.div
            className="flex items-start justify-between"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">Amount</span>
              </div>
              <p className="text-white font-bold text-lg">
                {amount.toFixed(4)} {tokenSymbol}
              </p>
              {usdValue && (
                <p className="text-sm text-[#94A3B8]">{formatCurrency(usdValue)}</p>
              )}
              <p className="text-xs text-[#64748B] mt-1">{tokenName}</p>
            </div>
            <motion.button
              type="button"
              onClick={() => onEditStep(2)}
              className="flex items-center gap-1 text-xs transition-colors"
              style={{ color: colors.primary }}
              whileHover={!shouldReduceMotion ? { scale: 1.05 } : {}}
              whileTap={!shouldReduceMotion ? { scale: 0.95 } : {}}
            >
              <Edit2 size={12} />
              Edit
            </motion.button>
          </motion.div>

          {/* Cost Breakdown */}
          <div className="h-px bg-white/10" />
          <motion.div
            className="space-y-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <span className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] block mb-3">Cost Breakdown</span>
            
            <div className="flex justify-between text-sm">
              <span className="text-[#94A3B8]">Withdrawal amount</span>
              <span className="text-white font-medium">
                {amount.toFixed(4)} {tokenSymbol}
                {usdValue && <span className="ml-2 text-[#94A3B8]">({formatCurrency(usdValue)})</span>}
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-[#94A3B8]">Network fee</span>
              <span className="text-white font-medium">
                {fee.toFixed(6)} SOL
                {usdFee && <span className="ml-2 text-[#94A3B8]">({formatCurrency(usdFee)})</span>}
              </span>
            </div>

            <div className="flex justify-between text-base font-bold pt-2 border-t border-white/10">
              <span className="text-white">Total</span>
              <span className="text-white">
                {total.toFixed(6)} SOL
                {usdTotal && <span className="ml-2" style={{ color: colors.primary }}>({formatCurrency(usdTotal)})</span>}
              </span>
            </div>
          </motion.div>

          {/* Remaining Balance */}
          <motion.div
            className="bg-[#0F172A]/30 rounded-lg p-3 border border-white/5"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex justify-between text-sm">
              <span className="text-[#94A3B8]">Remaining balance</span>
              <span className="text-white font-medium">
                {remainingBalance.toFixed(4)} {tokenSymbol}
                {remainingBalanceUsd && <span className="ml-2 text-[#94A3B8]">({formatCurrency(remainingBalanceUsd)})</span>}
              </span>
            </div>
          </motion.div>
        </div>
      </FrostedCard>

      {/* Submit Button */}
      <GlowButton
        variant="cyan"
        fullWidth
        onClick={onSubmit}
        disabled={disabled || isSubmitting}
        type="button"
        enableRibbonWiggle
      >
        {isSubmitting ? 'Processing Withdrawal...' : 'Confirm Withdrawal'}
      </GlowButton>
    </motion.div>
  );
};

export default WithdrawReviewStep;
