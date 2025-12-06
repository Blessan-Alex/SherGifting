import React, { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';
import TokenPicker from './TokenPicker';
import { Token, TokenBalance } from '../../types';
import { useTheme } from '../../context/ThemeContext';

interface AssetSelectorProps {
  tokens: Token[];
  selectedToken: Token | null;
  onSelect: (token: Token) => void;
  balances: TokenBalance[];
  defaultToken?: Token | null;
}

const AssetSelector: React.FC<AssetSelectorProps> = ({
  tokens,
  selectedToken,
  onSelect,
  balances,
  defaultToken,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { theme } = useTheme();
  const shouldReduceMotion = useReducedMotion();

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

  const token = selectedToken || defaultToken;
  const tokenBalance = token ? balances.find(b => 
    b.address === token.mint || b.symbol === token.symbol
  ) : null;

  // Determine if token is recommended (USDC or stablecoin)
  const isRecommended = token?.symbol === 'USDC' || token?.symbol === 'USDT' || token?.isNative;

  return (
    <div className="space-y-3">
      <label className="text-xs font-bold uppercase tracking-widest text-[#94A3B8] ml-1 block">
        Delivery Asset
      </label>

      {/* Collapsed state: Chip display */}
      {!isExpanded && (
        <motion.button
          type="button"
          onClick={() => setIsExpanded(true)}
          className="w-full bg-[#0F172A]/30 border border-white/10 rounded-xl p-4 flex items-center justify-between hover:border-white/20 transition-colors"
          whileHover={!shouldReduceMotion ? { scale: 1.01 } : {}}
          whileTap={!shouldReduceMotion ? { scale: 0.99 } : {}}
        >
          <div className="flex items-center gap-3">
            {token ? (
              <>
                <div className="w-10 h-10 rounded-full bg-[#1E293B] border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {token.symbol === 'SOL' ? (
                    <span className="text-white font-bold text-sm">SOL</span>
                  ) : (
                    <span className="text-white font-bold text-sm">{token.symbol.charAt(0)}</span>
                  )}
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{token.symbol}</span>
                    {isRecommended && (
                      <span className="text-xs px-2 py-0.5 rounded bg-[#10B981]/20 text-[#10B981] font-medium">
                        Recommended
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-[#94A3B8]">{token.name}</div>
                  {tokenBalance && (
                    <div className="text-xs text-[#64748B] mt-1">
                      {tokenBalance.balance.toFixed(4)} {token.symbol}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <span className="text-[#94A3B8] text-sm">Select an asset</span>
            )}
          </div>
          <ChevronDown size={20} className="text-[#94A3B8]" />
        </motion.button>
      )}

      {/* Expanded state: Full token picker */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="bg-[#0F172A]/30 border border-white/10 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-white">Change Asset</span>
                <button
                  type="button"
                  onClick={() => setIsExpanded(false)}
                  className="text-[#94A3B8] hover:text-white transition-colors"
                >
                  <ChevronUp size={20} />
                </button>
              </div>
              <TokenPicker
                tokens={tokens}
                selectedToken={selectedToken}
                onSelect={(token) => {
                  onSelect(token);
                  setIsExpanded(false);
                }}
                balances={balances}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AssetSelector;

