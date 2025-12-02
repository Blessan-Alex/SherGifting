import React, { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { TokenBalance } from '../../types';
import { useTheme } from '../../context/ThemeContext';

interface BalanceBreakdownProps {
  balances: TokenBalance[];
  lastUpdated: number | null;
  totalBalance: number;
}

const BalanceBreakdown: React.FC<BalanceBreakdownProps> = ({
  balances,
  lastUpdated,
  totalBalance,
}) => {
  const [currentTime, setCurrentTime] = useState(Date.now());
  const { theme } = useTheme();
  const shouldReduceMotion = useReducedMotion();

  // Update current time every second to refresh "Last updated" display
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const getRelativeTime = (timestamp: number) => {
    const seconds = Math.floor((currentTime - timestamp) / 1000);
    if (seconds < 60) return `${seconds} second${seconds !== 1 ? 's' : ''} ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  };

  // Get SOL balance first, then other tokens
  const solBalance = balances.find(b => b.symbol === 'SOL');
  const otherTokens = balances
    .filter((b) => b.symbol !== 'SOL' && b.usdValue && b.usdValue > 0)
    .sort((a, b) => (b.usdValue || 0) - (a.usdValue || 0))
    .slice(0, 2); // Show SOL + 2 other tokens

  // Get theme-aware colors
  const getColors = () => {
    if (theme === 'christmas') {
      return {
        primary: '#EB6A46',
        glow: 'rgba(235, 106, 70, 0.2)',
      };
    }
    if (theme === 'newyear') {
      return {
        primary: '#FCD34D',
        glow: 'rgba(252, 211, 77, 0.2)',
      };
    }
    return {
      primary: '#06B6D4',
      glow: 'rgba(6, 182, 212, 0.2)',
    };
  };

  const colors = getColors();

  return (
    <motion.div
      className="space-y-2"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Token breakdown */}
      {(solBalance || otherTokens.length > 0) && (
        <div className="flex flex-wrap items-center gap-3 text-sm">
          {/* Show SOL balance with actual amount */}
          {solBalance && (
            <motion.div
              className="flex items-center gap-2"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <span className="text-white font-medium">{solBalance.symbol}</span>
              <span className="text-[#94A3B8]">
                {solBalance.balance.toFixed(4)}
              </span>
            </motion.div>
          )}
          
          {/* Show other tokens with USD value */}
          {otherTokens.map((token, index) => (
            <motion.div
              key={token.address}
              className="flex items-center gap-2"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 + (index + 1) * 0.1 }}
            >
              {(solBalance || index > 0) && (
                <span className="text-[#64748B]">•</span>
              )}
              <span className="text-white font-medium">{token.symbol}</span>
              <span className="text-[#94A3B8]">
                {formatCurrency(token.usdValue || 0)}
              </span>
            </motion.div>
          ))}
          
          {balances.length > (solBalance ? 3 : 2) && (
            <motion.div
              className="flex items-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <span className="text-[#64748B]">•</span>
              <span className="text-[#64748B] text-xs">
                +{balances.length - (solBalance ? 3 : 2)} more
              </span>
            </motion.div>
          )}
        </div>
      )}

      {/* Last updated timestamp */}
      {lastUpdated && (
        <motion.p
          className="text-xs text-[#64748B]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          Last updated: {getRelativeTime(lastUpdated)}
        </motion.p>
      )}
    </motion.div>
  );
};

export default BalanceBreakdown;
