import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Check } from 'lucide-react';
import { Token, TokenBalance } from '../../types';
import { useTheme } from '../../context/ThemeContext';

interface TokenPickerProps {
  tokens: Token[];
  selectedToken: Token | null;
  onSelect: (token: Token) => void;
  balances: TokenBalance[];
}

const TokenPicker: React.FC<TokenPickerProps> = React.memo(({
  tokens,
  selectedToken,
  onSelect,
  balances,
}) => {
  const { theme } = useTheme();
  const shouldReduceMotion = useReducedMotion();

  const getTokenBalance = (token: Token) => {
    const balance = balances.find(b => b.symbol === token.symbol);
    return balance?.balance || 0;
  };

  const getTokenLogo = (token: Token) => {
    const balance = balances.find(b => b.symbol === token.symbol);
    return balance?.logoURI;
  };

  // Get theme-aware colors
  const getColors = () => {
    if (theme === 'christmas') {
      return {
        selected: '#EB6A46',
        glow: 'rgba(235, 106, 70, 0.3)',
      };
    }
    if (theme === 'newyear') {
      return {
        selected: '#FCD34D',
        glow: 'rgba(252, 211, 77, 0.3)',
      };
    }
    return {
      selected: '#06B6D4',
      glow: 'rgba(6, 182, 212, 0.3)',
    };
  };

  const colors = getColors();

  return (
    <div className="grid grid-cols-2 gap-3">
      {tokens.map((token, index) => {
        const isSelected = selectedToken?.mint === token.mint;
        const balance = getTokenBalance(token);
        const logoURI = getTokenLogo(token);

        return (
          <motion.button
            key={token.mint}
            type="button"
            onClick={() => onSelect(token)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelect(token);
              }
            }}
            aria-label={`Select ${token.symbol} token`}
            aria-pressed={isSelected}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            whileHover={!shouldReduceMotion ? {
              y: -4,
              scale: 1.02,
            } : {}}
            whileTap={!shouldReduceMotion ? {
              scale: 0.98,
            } : {}}
            className={`
              relative p-4 rounded-xl border-2 transition-all overflow-hidden min-h-[44px]
              focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent
              ${isSelected
                ? 'shadow-lg'
                : 'border-white/10 bg-[#0F172A]/50 hover:border-white/20 hover:bg-[#1E293B]/50'
              }
            `}
            style={{
              borderColor: isSelected ? colors.selected : undefined,
              backgroundColor: isSelected ? `${colors.selected}15` : undefined,
              boxShadow: isSelected ? `0 0 20px ${colors.glow}` : undefined,
            }}
          >
            {/* Ribbon accent for selected */}
            {isSelected && (
              <motion.div
                className="absolute top-0 left-0 right-0 h-1"
                style={{
                  background: theme === 'christmas'
                    ? 'linear-gradient(90deg, #EB6A46 0%, #EF4444 50%, #EB6A46 100%)'
                    : theme === 'newyear'
                    ? 'linear-gradient(90deg, #FCD34D 0%, #F59E0B 50%, #FCD34D 100%)'
                    : 'linear-gradient(90deg, #06B6D4 0%, #0891B2 50%, #06B6D4 100%)',
                }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.3 }}
              />
            )}

            {/* Selection indicator */}
            {isSelected && (
              <motion.div
                className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center z-10"
                style={{ backgroundColor: colors.selected }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              >
                <Check size={14} className="text-white" />
              </motion.div>
            )}

            {/* Shine effect on selected */}
            {isSelected && !shouldReduceMotion && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  repeatDelay: 2,
                  ease: 'easeInOut',
                }}
              />
            )}

            <div className="flex items-center gap-3">
              <motion.div
                className="w-10 h-10 rounded-full bg-[#1E293B] border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0"
                animate={!shouldReduceMotion && isSelected ? {
                  scale: [1, 1.1, 1],
                  boxShadow: `0 0 15px ${colors.glow}`,
                } : {}}
                transition={{
                  duration: 2,
                  repeat: isSelected ? Infinity : 0,
                  ease: 'easeInOut',
                }}
              >
                {logoURI ? (
                  <img src={logoURI} alt={token.symbol} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white font-bold text-sm">{token.symbol.charAt(0)}</span>
                )}
              </motion.div>
              <div className="flex-1 text-left min-w-0">
                <div className="font-bold text-white text-sm truncate">{token.symbol}</div>
                <div className="text-xs text-[#94A3B8] truncate">{token.name}</div>
                <div className="text-xs text-[#64748B] mt-1">
                  {balance.toFixed(4)} {token.symbol}
                </div>
              </div>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
});

TokenPicker.displayName = 'TokenPicker';

export default TokenPicker;
