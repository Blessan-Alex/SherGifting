import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { heliusService } from '../services/api';
import { TokenBalance, Token } from '../types';
import { ArrowUpRight, ArrowDownLeft, Gift, Sparkles } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion, useInView } from 'framer-motion';
import FrostedCard from '../components/UI/FrostedCard';
import GlowButton from '../components/UI/GlowButton';
import QuickSendCard from '../components/UI/QuickSendCard';
import QuickActionsCard from '../components/UI/QuickActionsCard';
import RecentGiftsTimeline from '../components/UI/RecentGiftsTimeline';
import SkeletonLoader from '../components/UI/SkeletonLoader';
import PageHeader from '../components/UI/PageHeader';
import { useTheme } from '../context/ThemeContext';
import RibbonBorder from '../components/decorative/RibbonBorder';
import { useMotifConfig } from '../hooks/useMotifConfig';
import CornerDecorations from '../components/decorative/CornerDecorations';

const HomePage: React.FC = () => {
  const { user, isLoading: authLoading } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();
  const { config } = useMotifConfig();
  const [balances, setBalances] = useState<TokenBalance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastBalanceUpdate, setLastBalanceUpdate] = useState<number | null>(null);
  const [previousBalance, setPreviousBalance] = useState<number>(0);
  const [hasBalanceChanged, setHasBalanceChanged] = useState(false);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const showSkeleton = authLoading || isLoading || !user?.wallet_address;
  const balanceRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(balanceRef, { once: true, margin: '-100px' });

  // Timer to update currentTime every second for "Updated X seconds ago" display
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!user?.wallet_address) {
      setBalances([]);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    let idleHandle: number | null = null;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const fetchBalances = async () => {
      if (cancelled) return;
      setIsLoading(true);
      setError(null);
      try {
        const fetchedBalances = await heliusService.getTokenBalances(user.wallet_address!);
        const nonZeroBalances = fetchedBalances
          .filter((b) => b.balance > 0)
          .sort((a, b) => a.symbol.localeCompare(b.symbol));
        setBalances(nonZeroBalances);
        setLastBalanceUpdate(Date.now());
      } catch (e) {
        setError('Failed to fetch token balances.');
        console.error(e);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    const scheduleFetch = () => {
      if (typeof window !== 'undefined' && (window as any).requestIdleCallback) {
        idleHandle = (window as any).requestIdleCallback(() => {
          if (!cancelled) {
            fetchBalances();
          }
        }, { timeout: 1000 });
      } else {
        timeoutId = setTimeout(() => {
          if (!cancelled) {
            fetchBalances();
          }
        }, 50);
      }
    };

    scheduleFetch();

    return () => {
      cancelled = true;
      if (idleHandle !== null && typeof (window as any).cancelIdleCallback === 'function') {
        (window as any).cancelIdleCallback(idleHandle);
      }
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [user]);

  const totalBalanceUSD = useMemo(() => {
    return balances.reduce((acc, token) => acc + token.usdValue, 0);
  }, [balances]);

  // Track balance changes for sparkle effect
  useEffect(() => {
    if (previousBalance > 0 && Math.abs(totalBalanceUSD - previousBalance) > 0.01) {
      setHasBalanceChanged(true);
      setTimeout(() => setHasBalanceChanged(false), 2000);
    }
    setPreviousBalance(totalBalanceUSD);
  }, [totalBalanceUSD, previousBalance]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 3,
      maximumFractionDigits: 3
    }).format(value);
  };

  // Animated number counting
  const AnimatedBalance = ({ value }: { value: number }) => {
    const [displayValue, setDisplayValue] = useState(value);

    useEffect(() => {
      const startValue = displayValue;
      const endValue = value;
      const duration = 1000;
      const startTime = Date.now();

      const animate = () => {
        const now = Date.now();
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const currentValue = startValue + (endValue - startValue) * easeOutQuart;
        
        setDisplayValue(currentValue);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      if (Math.abs(endValue - startValue) > 0.01) {
        requestAnimationFrame(animate);
      }
    }, [value]);

    return <>{formatCurrency(displayValue)}</>;
  };

  // Convert balances to Token format for QuickSendCard
  const tokens: Token[] = useMemo(() => {
    return balances.map(b => ({
      mint: b.address,
      symbol: b.symbol,
      name: b.name,
      decimals: b.decimals,
      isNative: b.symbol === 'SOL',
    }));
  }, [balances]);

  const defaultToken = tokens.find(t => t.symbol === 'SOL') || tokens[0] || null;

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
    <div className="max-w-6xl mx-auto px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <PageHeader
          title="Dashboard"
          subtitle="Manage your crypto gifts and assets"
        />
      </motion.div>

      {/* Row 1: Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="mb-8"
      >
        <QuickActionsCard />
      </motion.div>

      {/* Row 2: Available to gift (moved here) */}
      <motion.div
        ref={balanceRef}
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="mb-8"
      >
        <FrostedCard variant="holiday" className="w-full relative overflow-hidden">
          {/* Ribbon accent */}
          {config.ribbons.enabled && (
            <RibbonBorder position="top" animated={!shouldReduceMotion} />
          )}

          {/* Sparkle effects on balance change */}
          <AnimatePresence>
            {hasBalanceChanged && !shouldReduceMotion && (
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {Array.from({ length: 8 }, (_, i) => {
                  const angle = (i * 45) * (Math.PI / 180);
                  const distance = 100;
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
                      initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                      animate={{ opacity: [0, 1, 0], scale: [0, 1, 0], x, y }}
                      exit={{ opacity: 0 }}
                      transition={{
                        duration: 1,
                        delay: i * 0.1,
                        ease: 'easeOut',
                      }}
                    />
                  );
                })}
              </div>
            )}
          </AnimatePresence>

          <div className="text-center relative z-10 py-6">
            <motion.span
              className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] flex items-center justify-center gap-2 mb-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Sparkles size={14} style={{ color: colors.primary }} />
              Available to gift
            </motion.span>
            {showSkeleton ? (
              <div className="mt-2 h-12 w-40 mx-auto rounded-lg bg-[#1E293B]/40 animate-pulse" />
            ) : (
              <motion.h2
                key={totalBalanceUSD}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, type: 'spring', stiffness: 100 }}
                className="text-4xl font-bold text-white mb-1"
                style={{
                  textShadow: `0 0 20px ${colors.glow}`,
                }}
              >
                <AnimatedBalance value={totalBalanceUSD} />
              </motion.h2>
            )}
            {!showSkeleton && balances.length > 0 && (
              <motion.p
                className="text-sm text-[#94A3B8] mt-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {(() => {
                  const solBalance = balances.find(b => b.symbol === 'SOL');
                  if (solBalance) {
                    // Format with 4 decimal places, remove trailing zeros
                    const formatted = solBalance.balance.toFixed(4).replace(/\.?0+$/, '');
                    return `≈${formatted} SOL`;
                  }
                  return `≈ ${balances.length} token${balances.length !== 1 ? 's' : ''}`;
                })()}
              </motion.p>
            )}

            {/* Last updated timestamp */}
            {!showSkeleton && lastBalanceUpdate && (
              <motion.p
                className="text-xs text-[#64748B] mt-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                {(() => {
                  const seconds = Math.floor((currentTime - lastBalanceUpdate) / 1000);
                  if (seconds < 60) return `Updated ${seconds} second${seconds !== 1 ? 's' : ''} ago`;
                  const minutes = Math.floor(seconds / 60);
                  if (minutes < 60) return `Updated ${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
                  const hours = Math.floor(minutes / 60);
                  if (hours < 24) return `Updated ${hours} hour${hours !== 1 ? 's' : ''} ago`;
                  const days = Math.floor(hours / 24);
                  return `Updated ${days} day${days !== 1 ? 's' : ''} ago`;
                })()}
              </motion.p>
            )}
          </div>
        </FrostedCard>
      </motion.div>

      {/* Row 3: Recent Gifts Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="mb-8"
      >
        <RecentGiftsTimeline maxItems={5} />
      </motion.div>
    </div>
  );
};

export default HomePage;
