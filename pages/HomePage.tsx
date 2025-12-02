import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { heliusService } from '../services/api';
import { TokenBalance, Token } from '../types';
import { ArrowUpRight, ArrowDownLeft, Gift, Sparkles } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion, useInView } from 'framer-motion';
import FrostedCard from '../components/UI/FrostedCard';
import GlowButton from '../components/UI/GlowButton';
import BalanceBreakdown from '../components/UI/BalanceBreakdown';
import QuickSendCard from '../components/UI/QuickSendCard';
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
  const showSkeleton = authLoading || isLoading || !user?.wallet_address;
  const balanceRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(balanceRef, { once: true, margin: '-100px' });

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

      {/* Row 1: Enhanced Balance Card */}
      <motion.div
        ref={balanceRef}
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-8"
      >
        <FrostedCard variant="holiday" className="w-full relative overflow-hidden">
          {/* Ribbon accent */}
          {config.ribbons.enabled && (
            <RibbonBorder position="top" animated={!shouldReduceMotion} />
          )}
          
          {/* Corner decorations */}
          {config.ornaments.enabled && theme === 'christmas' && (
            <CornerDecorations 
              corners={['top-left', 'top-right']} 
              type="ornament"
              enabled={config.ornaments.enabled}
            />
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

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative z-10">
            <div className="flex-1">
              <motion.span
                className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] flex items-center gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Sparkles size={14} style={{ color: colors.primary }} />
                Total Balance
              </motion.span>
              {showSkeleton ? (
                <div className="mt-2 h-12 w-40 rounded-lg bg-[#1E293B]/40 animate-pulse" />
              ) : (
                <motion.h2
                  key={totalBalanceUSD}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, type: 'spring', stiffness: 100 }}
                  className="text-5xl font-bold text-white mt-2"
                  style={{
                    textShadow: `0 0 20px ${colors.glow}`,
                  }}
                >
                  <AnimatedBalance value={totalBalanceUSD} />
                </motion.h2>
              )}
              {!showSkeleton && balances.length > 0 && (
                <motion.div
                  className="mt-3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <BalanceBreakdown
                    balances={balances}
                    lastUpdated={lastBalanceUpdate}
                    totalBalance={totalBalanceUSD}
                  />
                </motion.div>
              )}
            </div>

            <motion.div
              className="flex flex-col sm:flex-row gap-3 md:flex-col md:min-w-[200px]"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <GlowButton 
                fullWidth 
                variant="cyan" 
                icon={Gift} 
                onClick={() => navigate('/gift')}
                className="md:order-1"
                enableRibbonWiggle
              >
                Send Gift
              </GlowButton>
              <GlowButton 
                fullWidth 
                variant="secondary" 
                icon={ArrowUpRight} 
                onClick={() => navigate('/add-funds')}
                className="md:order-2"
              >
                Add Funds
              </GlowButton>
              <GlowButton 
                fullWidth 
                variant="secondary" 
                icon={ArrowDownLeft} 
                onClick={() => navigate('/withdraw')}
                className="md:order-3 !py-2 !px-4 !text-sm"
              >
                Withdraw
              </GlowButton>
            </motion.div>
          </div>
        </FrostedCard>
      </motion.div>

      {/* Row 2: Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Quick Send + Recent Gifts */}
        <motion.div
          className="lg:col-span-5 space-y-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {tokens.length > 0 && (
            <QuickSendCard
              tokens={tokens}
              defaultToken={defaultToken}
            />
          )}
          <RecentGiftsTimeline maxItems={5} />
        </motion.div>

        {/* Right Column: Assets Table */}
        <motion.div
          className="lg:col-span-7"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <FrostedCard variant="holiday" className="h-full relative overflow-hidden">
            {/* Ribbon accent */}
            {config.ribbons.enabled && (
              <RibbonBorder position="top" animated={!shouldReduceMotion} />
            )}

            <div className="relative z-10">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <Sparkles size={18} style={{ color: colors.primary }} />
                Your Assets
              </h3>
              {showSkeleton ? (
                <SkeletonLoader type="list-item" rows={3} />
              ) : error ? (
                <div className="flex justify-center items-center h-64">
                  <p className="text-center text-[#EF4444] px-6">{error}</p>
                </div>
              ) : balances.length === 0 ? (
                <div className="flex flex-col justify-center items-center h-64 space-y-4">
                  <motion.div
                    className="w-16 h-16 rounded-full bg-[#1E293B]/40 flex items-center justify-center"
                    animate={!shouldReduceMotion ? {
                      scale: [1, 1.1, 1],
                    } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Gift size={24} className="text-[#64748B]" />
                  </motion.div>
                  <p className="text-center text-[#94A3B8] px-6">
                    You don't have any tokens yet. Click "Add Funds" to get started.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between text-xs font-bold uppercase text-[#64748B] px-5 pb-3 border-b border-white/5">
                    <span>Asset</span>
                    <div className="flex gap-12">
                      <span>Balance</span>
                      <span>Value</span>
                    </div>
                  </div>
                  
                  {balances.map((token, index) => (
                    <motion.div
                      key={token.address}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      whileHover={!shouldReduceMotion ? {
                        y: -4,
                        scale: 1.01,
                        boxShadow: `0 8px 24px ${colors.glow}40`,
                      } : {}}
                      className="flex items-center justify-between p-5 rounded-xl hover:bg-white/10 hover:border-white/20 border border-transparent transition-all group cursor-pointer relative overflow-hidden"
                      style={{
                        borderColor: 'transparent',
                      }}
                    >
                      {/* Enhanced shimmer effect on hover */}
                      {!shouldReduceMotion && (
                        <>
                          {/* Primary shimmer sweep */}
                          <motion.div
                            className="absolute inset-0 opacity-0 group-hover:opacity-100"
                            style={{
                              background: theme === 'christmas'
                                ? 'linear-gradient(90deg, transparent 0%, rgba(235, 106, 70, 0.15) 50%, transparent 100%)'
                                : theme === 'newyear'
                                ? 'linear-gradient(90deg, transparent 0%, rgba(252, 211, 77, 0.15) 50%, transparent 100%)'
                                : 'linear-gradient(90deg, transparent 0%, rgba(6, 182, 212, 0.15) 50%, transparent 100%)',
                            }}
                            initial={{ x: '-100%' }}
                            whileHover={{ x: '100%' }}
                            transition={{ duration: 0.8, ease: 'easeInOut' }}
                          />
                          {/* Secondary shimmer layer */}
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100"
                            initial={{ x: '-100%' }}
                            whileHover={{ x: '100%' }}
                            transition={{ duration: 1.2, delay: 0.2, ease: 'easeInOut' }}
                          />
                        </>
                      )}

                      {/* Border brighten on hover */}
                      {!shouldReduceMotion && (
                        <motion.div
                          className="absolute inset-0 rounded-xl pointer-events-none"
                          style={{
                            border: `1px solid transparent`,
                          }}
                          whileHover={{
                            borderColor: theme === 'christmas'
                              ? 'rgba(235, 106, 70, 0.3)'
                              : theme === 'newyear'
                              ? 'rgba(252, 211, 77, 0.3)'
                              : 'rgba(6, 182, 212, 0.3)',
                          }}
                          transition={{ duration: 0.3 }}
                        />
                      )}

                      <div className="flex items-center gap-4 relative z-10">
                        <motion.div
                          className="w-10 h-10 rounded-full bg-[#0F172A] border border-white/10 flex items-center justify-center overflow-hidden"
                          whileHover={!shouldReduceMotion ? {
                            scale: 1.1,
                            boxShadow: `0 0 15px ${colors.glow}`,
                          } : {}}
                        >
                          {token.logoURI ? (
                            <img src={token.logoURI} alt={token.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-white font-bold text-xs">{token.symbol.charAt(0)}</span>
                          )}
                        </motion.div>
                        <div>
                          <div className="font-bold text-white text-base">{token.symbol}</div>
                          <div className="text-xs text-[#94A3B8]">{token.name}</div>
                        </div>
                      </div>
                      <div className="flex gap-8 text-right relative z-10">
                        <div>
                          <motion.div
                            className="font-bold text-white text-base"
                            key={token.balance}
                            initial={{ scale: 1 }}
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ duration: 0.3 }}
                          >
                            {token.balance.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                          </motion.div>
                          <div className="text-xs text-[#94A3B8]">{token.symbol}</div>
                        </div>
                        <div className="w-20">
                          <motion.div
                            className="font-bold text-white text-base"
                            key={token.usdValue}
                            initial={{ scale: 1 }}
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ duration: 0.3 }}
                          >
                            {formatCurrency(token.usdValue || 0)}
                          </motion.div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </FrostedCard>
        </motion.div>
      </div>
    </div>
  );
};

export default HomePage;
