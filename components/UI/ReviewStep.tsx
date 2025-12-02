import React from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Edit2, Gift, Mail, Sparkles, CheckCircle } from 'lucide-react';
import GlassCard from './GlassCard';
import GlowButton from './GlowButton';
import { CARD_TEMPLATES } from '../../lib/cardTemplates';
import { useTheme } from '../../context/ThemeContext';

interface ReviewStepProps {
  recipientLabel: string;
  recipientEmail: string;
  amount: number;
  tokenSymbol: string;
  tokenName: string;
  usdValue: number | null;
  message: string;
  selectedCard: string | null;
  serviceFee: number;
  cardFee: number;
  total: number;
  usdServiceFee: number | null;
  usdCardFee: number | null;
  usdTotal: number | null;
  remainingBalance: number;
  remainingBalanceUsd: number | null;
  onEditStep: (step: number) => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
  disabled?: boolean;
}

const ReviewStep: React.FC<ReviewStepProps> = React.memo(({
  recipientLabel,
  recipientEmail,
  amount,
  tokenSymbol,
  tokenName,
  usdValue,
  message,
  selectedCard,
  serviceFee,
  cardFee,
  total,
  usdServiceFee,
  usdCardFee,
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

  const selectedCardTemplate = selectedCard
    ? CARD_TEMPLATES.find(card => card.id === selectedCard)
    : null;

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

  const sections = [
    {
      id: 'recipient',
      icon: Mail,
      title: 'Recipient',
      content: (
        <>
          <p className="text-white font-medium">{recipientLabel}</p>
          <p className="text-sm text-[#94A3B8]">{recipientEmail}</p>
        </>
      ),
      editStep: 1,
    },
    {
      id: 'amount',
      icon: Gift,
      title: 'Gift Amount',
      content: (
        <>
          <p className="text-white font-bold text-lg">
            {amount.toFixed(4)} {tokenSymbol}
          </p>
          {usdValue && (
            <p className="text-sm text-[#94A3B8]">{formatCurrency(usdValue)}</p>
          )}
          <p className="text-xs text-[#64748B] mt-1">{tokenName}</p>
        </>
      ),
      editStep: 2,
    },
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
          <Sparkles size={24} style={{ color: colors.primary }} />
          Review Your Gift
        </h2>
        <p className="text-[#94A3B8] text-sm">Double-check everything before sending</p>
      </motion.div>

      <GlassCard variant="holiday">
        <div className="space-y-6">
          {/* Animated sections */}
          {sections.map((section, index) => {
            const Icon = section.icon;
            return (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon size={16} className="text-[#94A3B8]" />
                      <span className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
                        {section.title}
                      </span>
                    </div>
                    {section.content}
                  </div>
                  <motion.button
                    type="button"
                    onClick={() => onEditStep(section.editStep)}
                    className="flex items-center gap-1 text-xs transition-colors"
                    style={{
                      color: colors.primary,
                    }}
                    whileHover={!shouldReduceMotion ? { scale: 1.1 } : {}}
                    whileTap={!shouldReduceMotion ? { scale: 0.9 } : {}}
                  >
                    <Edit2 size={12} />
                    Edit
                  </motion.button>
                </div>
                {index < sections.length - 1 && (
                  <div className="h-px bg-white/10 mt-6" />
                )}
              </motion.div>
            );
          })}

          {/* Greeting Card */}
          {selectedCardTemplate && (
            <>
              <div className="h-px bg-white/10" />
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="flex items-start justify-between"
              >
                <div className="flex-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] mb-2 block">
                    Greeting Card
                  </span>
                  <div className="flex items-center gap-3">
                    <motion.img
                      src={selectedCardTemplate.previewUrl}
                      alt={selectedCardTemplate.displayName}
                      className="w-16 h-16 rounded-lg object-cover border border-white/10"
                      whileHover={!shouldReduceMotion ? { scale: 1.1 } : {}}
                      transition={{ duration: 0.2 }}
                    />
                    <div>
                      <p className="text-white font-medium text-sm">{selectedCardTemplate.displayName}</p>
                      <p className="text-xs text-[#94A3B8]">{selectedCardTemplate.occasion}</p>
                    </div>
                  </div>
                </div>
                <motion.button
                  type="button"
                  onClick={() => onEditStep(3)}
                  className="flex items-center gap-1 text-xs transition-colors"
                  style={{
                    color: colors.primary,
                  }}
                  whileHover={!shouldReduceMotion ? { scale: 1.1 } : {}}
                  whileTap={!shouldReduceMotion ? { scale: 0.9 } : {}}
                >
                  <Edit2 size={12} />
                  Edit
                </motion.button>
              </motion.div>
            </>
          )}

          {/* Message */}
          {message && (
            <>
              <div className="h-px bg-white/10" />
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="flex items-start justify-between"
              >
                <div className="flex-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] mb-2 block">
                    Message
                  </span>
                  <p className="text-sm text-white italic line-clamp-3">"{message}"</p>
                </div>
                <motion.button
                  type="button"
                  onClick={() => onEditStep(3)}
                  className="flex items-center gap-1 text-xs transition-colors"
                  style={{
                    color: colors.primary,
                  }}
                  whileHover={!shouldReduceMotion ? { scale: 1.1 } : {}}
                  whileTap={!shouldReduceMotion ? { scale: 0.9 } : {}}
                >
                  <Edit2 size={12} />
                  Edit
                </motion.button>
              </motion.div>
            </>
          )}

          {/* Cost Breakdown */}
          <div className="h-px bg-white/10" />
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="space-y-2"
          >
            <span className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] block mb-3">
              Cost Breakdown
            </span>
            
            <div className="flex justify-between text-sm">
              <span className="text-[#94A3B8]">Gift amount</span>
              <span className="text-white font-medium">
                {amount.toFixed(4)} {tokenSymbol}
                {usdValue && <span className="ml-2 text-[#94A3B8]">({formatCurrency(usdValue)})</span>}
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-[#94A3B8]">Service fee</span>
              <span className="text-white font-medium">
                {serviceFee.toFixed(4)} {tokenSymbol}
                {usdServiceFee && <span className="ml-2 text-[#94A3B8]">({formatCurrency(usdServiceFee)})</span>}
              </span>
            </div>

            {cardFee > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-[#94A3B8]">Card fee</span>
                <span className="text-white font-medium">
                  {cardFee.toFixed(4)} {tokenSymbol}
                  {usdCardFee && <span className="ml-2 text-[#94A3B8]">({formatCurrency(usdCardFee)})</span>}
                </span>
              </div>
            )}

            <div className="flex justify-between items-center pt-3 border-t border-white/10">
              <span className="text-base font-bold text-white">Total</span>
              <span className="text-lg font-bold" style={{ color: colors.primary }}>
                {total.toFixed(4)} {tokenSymbol}
                {usdTotal && <span className="ml-2 text-white text-base">({formatCurrency(usdTotal)})</span>}
              </span>
            </div>
          </motion.div>

          {/* Remaining Balance */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
            className="bg-[#0F172A]/30 rounded-lg p-3 border border-white/5"
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
      </GlassCard>

      {/* Submit Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.6 }}
      >
        <GlowButton
          variant="cyan"
          fullWidth
          onClick={onSubmit}
          disabled={disabled || isSubmitting}
          type="button"
          enableRibbonWiggle
          icon={isSubmitting ? undefined : Gift}
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <motion.div
                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
              Creating Gift Link...
            </span>
          ) : (
            'Create Gift Link'
          )}
        </GlowButton>
      </motion.div>
    </div>
  );
});

ReviewStep.displayName = 'ReviewStep';

export default ReviewStep;
