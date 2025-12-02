import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Token } from '../../types';
import FrostedCard from './FrostedCard';
import GlowButton from './GlowButton';
import InputField from './InputField';
import { Gift, Mail, Sparkles } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface QuickSendCardProps {
  tokens: Token[];
  defaultToken?: Token | null;
  className?: string;
}

const QuickSendCard: React.FC<QuickSendCardProps> = ({
  tokens,
  defaultToken,
  className = '',
}) => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const shouldReduceMotion = useReducedMotion();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedToken, setSelectedToken] = useState<Token | null>(defaultToken || tokens[0] || null);
  const [selectedChip, setSelectedChip] = useState<string | null>(null);

  useEffect(() => {
    if (tokens.length > 0 && !selectedToken) {
      const solToken = tokens.find(t => t.symbol === 'SOL') || tokens[0];
      setSelectedToken(solToken);
    }
  }, [tokens, selectedToken]);

  const quickAmounts = [
    { label: '$10', value: '10' },
    { label: '$25', value: '25' },
    { label: '$50', value: '50' },
    { label: '$100', value: '100' },
    { label: 'Custom', value: 'custom' },
  ];

  const handleChipClick = (value: string) => {
    if (value === 'custom') {
      setSelectedChip('custom');
      setAmount('');
    } else {
      setSelectedChip(value);
      setAmount(value);
    }
  };

  const handleSendGift = () => {
    if (!recipient.trim() || !amount || !selectedToken) {
      return;
    }

    // Navigate to gift page with pre-filled state
    navigate('/gift', {
      state: {
        recipient: recipient.trim(),
        amount: amount,
        tokenMint: selectedToken.mint,
        tokenSymbol: selectedToken.symbol,
      },
    });
  };

  const canSend = recipient.trim().length > 0 && 
                  amount.trim().length > 0 && 
                  !isNaN(parseFloat(amount)) && 
                  parseFloat(amount) > 0 && 
                  selectedToken;

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
    <FrostedCard variant="holiday" className={className} hover>
      <div className="space-y-4 relative">
        {/* Ribbon accent */}
        <div
          className="absolute top-0 left-0 right-0 h-1"
          style={{
            background: theme === 'christmas'
              ? 'linear-gradient(90deg, #EB6A46 0%, #EF4444 50%, #EB6A46 100%)'
              : theme === 'newyear'
              ? 'linear-gradient(90deg, #FCD34D 0%, #F59E0B 50%, #FCD34D 100%)'
              : 'linear-gradient(90deg, #BE123C 0%, #06B6D4 50%, #BE123C 100%)',
          }}
        />

        <div className="flex items-center gap-2 mb-2 pt-2">
          <Gift size={18} style={{ color: colors.primary }} />
          <h3 className="text-lg font-bold text-white">Quick Send</h3>
        </div>

        {/* Recipient Input */}
        <InputField
          label="Recipient"
          placeholder="recipient@example.com or @username"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          icon={Mail}
          helperText="We'll send a secure claim link"
        />

        {/* Amount Input with Quick Chips */}
        <div>
          <label className="text-xs font-bold uppercase tracking-widest text-[#94A3B8] ml-1 mb-2 block">
            Amount (USD)
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            {quickAmounts.map((chip, index) => (
              <motion.button
                key={chip.value}
                type="button"
                onClick={() => handleChipClick(chip.value)}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                whileHover={!shouldReduceMotion ? { scale: 1.05, y: -2 } : {}}
                whileTap={!shouldReduceMotion ? { scale: 0.95 } : {}}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all relative overflow-hidden ${
                  selectedChip === chip.value
                    ? 'text-white shadow-lg'
                    : 'text-[#94A3B8] hover:text-white bg-[#0F172A]/50 hover:bg-[#1E293B] border border-white/10'
                }`}
                style={{
                  backgroundColor: selectedChip === chip.value ? colors.primary : undefined,
                  boxShadow: selectedChip === chip.value ? `0 0 20px ${colors.glow}` : undefined,
                }}
              >
                {/* Ribbon accent for selected */}
                {selectedChip === chip.value && (
                  <motion.div
                    className="absolute top-0 left-0 right-0 h-0.5"
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

                {/* Shine effect on selected */}
                {selectedChip === chip.value && !shouldReduceMotion && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
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

                <span className="relative z-10">{chip.label}</span>
              </motion.button>
            ))}
          </div>
          {selectedChip === 'custom' && (
            <InputField
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              helperText="Amount in USD"
            />
          )}
        </div>

        {/* Token Selector */}
        {tokens.length > 0 && (
          <div>
            <label htmlFor="quick-token" className="text-xs font-bold uppercase tracking-widest text-[#94A3B8] ml-1 mb-2 block">
              Token
            </label>
            <div className="relative">
              <select
                id="quick-token"
                value={selectedToken?.mint || ''}
                onChange={(e) => {
                  const token = tokens.find(t => t.mint === e.target.value);
                  setSelectedToken(token || null);
                }}
                className="w-full bg-[#0F172A]/50 border border-white/10 rounded-xl px-4 py-3.5 text-white outline-none appearance-none focus:border-[#BE123C] focus:ring-4 focus:ring-[#BE123C]/10 transition"
              >
                {tokens.map(token => (
                  <option key={token.mint} value={token.mint}>
                    {token.symbol} - {token.name}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#94A3B8]">▼</div>
            </div>
          </div>
        )}

        {/* Send Gift Button */}
        <GlowButton
          variant="cyan"
          fullWidth
          icon={Gift}
          onClick={handleSendGift}
          disabled={!canSend}
          enableRibbonWiggle
        >
          Send Gift
        </GlowButton>
      </div>
    </FrostedCard>
  );
};

export default QuickSendCard;
