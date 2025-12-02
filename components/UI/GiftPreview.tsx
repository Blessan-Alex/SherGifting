import React, { useState, useEffect } from 'react';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { Gift, Sparkles } from 'lucide-react';
import GlassCard from './GlassCard';
import { CARD_TEMPLATES } from '../../lib/cardTemplates';
import { useTheme } from '../../context/ThemeContext';
import { useMotifConfig } from '../../hooks/useMotifConfig';
import RibbonBorder from '../decorative/RibbonBorder';

interface GiftPreviewProps {
  recipient: string;
  amount: string;
  tokenSymbol: string;
  usdValue: number | null;
  selectedCard: string | null;
  message: string;
  tokenPrice: number | null;
}

const GiftPreview: React.FC<GiftPreviewProps> = React.memo(({
  recipient,
  amount,
  tokenSymbol,
  usdValue,
  selectedCard,
  message,
  tokenPrice,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [hasChanged, setHasChanged] = useState(false);
  const { theme } = useTheme();
  const shouldReduceMotion = useReducedMotion();
  const { config } = useMotifConfig();

  const selectedCardTemplate = selectedCard
    ? CARD_TEMPLATES.find(card => card.id === selectedCard)
    : null;

  // Track changes for highlight animation
  useEffect(() => {
    if (amount || recipient || message || selectedCard) {
      setHasChanged(true);
      const timer = setTimeout(() => setHasChanged(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [amount, recipient, message, selectedCard]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const displayAmount = amount && !isNaN(parseFloat(amount))
    ? parseFloat(amount).toFixed(4)
    : '0.0000';

  const displayUsdValue = usdValue !== null && usdValue > 0
    ? formatCurrency(usdValue)
    : tokenPrice && amount && !isNaN(parseFloat(amount))
    ? formatCurrency(parseFloat(amount) * tokenPrice)
    : null;

  // Get theme-aware colors
  const getColors = () => {
    if (theme === 'christmas') {
      return {
        primary: '#EB6A46',
        secondary: '#EF4444',
        glow: 'rgba(235, 106, 70, 0.3)',
      };
    }
    if (theme === 'newyear') {
      return {
        primary: '#FCD34D',
        secondary: '#F59E0B',
        glow: 'rgba(252, 211, 77, 0.3)',
      };
    }
    return {
      primary: '#06B6D4',
      secondary: '#0891B2',
      glow: 'rgba(6, 182, 212, 0.3)',
    };
  };

  const colors = getColors();

  return (
    <aside className="lg:sticky lg:top-20" aria-label="Gift preview">
      <motion.div
        onHoverStart={() => !shouldReduceMotion && setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        animate={{
          rotateY: isHovered && !shouldReduceMotion ? 5 : 0,
          rotateX: isHovered && !shouldReduceMotion ? -2 : 0,
          scale: isHovered && !shouldReduceMotion ? 1.02 : 1,
        }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="perspective-1000"
        style={{
          willChange: isHovered ? 'transform' : 'auto',
        }}
      >
        <GlassCard variant="holiday" className="relative overflow-hidden">
          {/* Ribbon border effect */}
          {config.ribbons.enabled && (
            <RibbonBorder position="top" animated={!shouldReduceMotion} />
          )}
          
          {/* Highlight pulse on change */}
          {hasChanged && !shouldReduceMotion && (
            <motion.div
              className="absolute inset-0 pointer-events-none"
              style={{
                boxShadow: `0 0 40px ${colors.glow}`,
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.5, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
            />
          )}

          {/* Shine effect on hover */}
          {isHovered && !shouldReduceMotion && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none"
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{ duration: 0.6, ease: 'easeInOut' }}
            />
          )}

          {/* Sparkle particles */}
          {isHovered && !shouldReduceMotion && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {Array.from({ length: 6 }, (_, i) => {
                const angle = (i * 60) * (Math.PI / 180);
                const distance = 50;
                const x = Math.cos(angle) * distance;
                const y = Math.sin(angle) * distance;
                return (
                  <motion.div
                    key={i}
                    className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full"
                    style={{
                      background: colors.glow,
                      boxShadow: `0 0 8px ${colors.glow}`,
                    }}
                    animate={{
                      opacity: [0, 1, 0],
                      scale: [0, 1, 0],
                      x: [0, x, 0],
                      y: [0, y, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.2,
                      ease: 'easeInOut',
                    }}
                  />
                );
              })}
            </div>
          )}

          <div className="relative z-10 space-y-4">
            {/* Header */}
            <motion.div
              className="text-center"
              animate={hasChanged && !shouldReduceMotion ? {
                scale: [1, 1.05, 1],
              } : {}}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 text-[#94A3B8] text-sm mb-2">
                <Gift size={16} style={{ color: colors.primary }} />
                <span>To:</span>
              </div>
              <h3 className="text-lg font-bold text-white">
                {recipient || 'Recipient'}
              </h3>
            </motion.div>

            {/* Amount Display */}
            <motion.div
              className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] border border-white/10 rounded-xl p-6 text-center"
              animate={hasChanged && !shouldReduceMotion ? {
                scale: [1, 1.03, 1],
                boxShadow: [`0 0 0px ${colors.glow}`, `0 0 30px ${colors.glow}`, `0 0 0px ${colors.glow}`],
              } : {}}
              transition={{ duration: 0.5 }}
            >
              <p className="text-xs text-[#94A3B8] uppercase tracking-wider mb-2">Gift Amount</p>
              <p className="text-3xl font-bold text-white mb-1">
                {displayAmount} <span className="text-xl" style={{ color: colors.primary }}>{tokenSymbol || 'SOL'}</span>
              </p>
              {displayUsdValue && (
                <motion.p
                  className="text-sm text-[#94A3B8]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {displayUsdValue}
                </motion.p>
              )}
            </motion.div>

            {/* Greeting Card Thumbnail */}
            {selectedCardTemplate && (
              <motion.div
                className="relative rounded-lg overflow-hidden border border-white/10"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <img
                  src={selectedCardTemplate.previewUrl}
                  alt={selectedCardTemplate.displayName}
                  className="w-full h-32 object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                  <p className="text-xs text-white font-medium">{selectedCardTemplate.displayName}</p>
                </div>
              </motion.div>
            )}

            {/* Message Preview */}
            {message && (
              <motion.div
                className="bg-[#0F172A]/30 rounded-lg p-3 border border-white/5"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <p className="text-xs text-[#94A3B8] mb-1">Message:</p>
                <p className="text-sm text-white italic line-clamp-3">"{message}"</p>
              </motion.div>
            )}

            {/* Unwrap hint on hover */}
            {isHovered && !shouldReduceMotion && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center flex items-center justify-center gap-2"
              >
                <Sparkles size={14} style={{ color: colors.primary }} />
                <p className="text-xs font-medium" style={{ color: colors.primary }}>
                  Unwrap to claim
                </p>
              </motion.div>
            )}
          </div>
        </GlassCard>
      </motion.div>
    </aside>
  );
});

GiftPreview.displayName = 'GiftPreview';

export default GiftPreview;
