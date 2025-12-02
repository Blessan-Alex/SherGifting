import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { Gift } from '../../types';
import { giftService } from '../../services/api';
import FrostedCard from './FrostedCard';
import StatusChip from './StatusChip';
import SkeletonLoader from './SkeletonLoader';
import GlowButton from './GlowButton';
import { Gift as GiftIcon, ArrowRight, Sparkles } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface RecentGiftsTimelineProps {
  maxItems?: number;
  className?: string;
}

const RecentGiftsTimeline: React.FC<RecentGiftsTimelineProps> = ({
  maxItems = 5,
  className = '',
}) => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const shouldReduceMotion = useReducedMotion();
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGifts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const allGifts = await giftService.getGiftHistory();
        // Sort by created_at descending and take first maxItems
        const sortedGifts = allGifts
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, maxItems);
        setGifts(sortedGifts);
      } catch (err) {
        setError('Failed to load recent gifts');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGifts();
  }, [maxItems]);

  const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    
    // For older dates, show formatted date
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const truncateEmail = (email: string, maxLength: number = 25) => {
    if (email.length <= maxLength) return email;
    return `${email.slice(0, maxLength - 3)}...`;
  };

  const handleGiftClick = (gift: Gift) => {
    navigate('/history');
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

  // Get ribbon color based on status
  const getRibbonColor = (status: string) => {
    if (status === 'claimed') {
      return theme === 'christmas'
        ? 'linear-gradient(90deg, #10B981 0%, #059669 50%, #10B981 100%)'
        : theme === 'newyear'
        ? 'linear-gradient(90deg, #10B981 0%, #059669 50%, #10B981 100%)'
        : 'linear-gradient(90deg, #10B981 0%, #059669 50%, #10B981 100%)';
    }
    if (status === 'pending') {
      return theme === 'christmas'
        ? 'linear-gradient(90deg, #FCD34D 0%, #F59E0B 50%, #FCD34D 100%)'
        : theme === 'newyear'
        ? 'linear-gradient(90deg, #FCD34D 0%, #F59E0B 50%, #FCD34D 100%)'
        : 'linear-gradient(90deg, #FCD34D 0%, #F59E0B 50%, #FCD34D 100%)';
    }
    return theme === 'christmas'
      ? 'linear-gradient(90deg, #EB6A46 0%, #EF4444 50%, #EB6A46 100%)'
      : theme === 'newyear'
      ? 'linear-gradient(90deg, #FCD34D 0%, #F59E0B 50%, #FCD34D 100%)'
      : 'linear-gradient(90deg, #06B6D4 0%, #0891B2 50%, #06B6D4 100%)';
  };

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

        <div className="flex items-center justify-between mb-4 pt-2">
          <div className="flex items-center gap-2">
            <GiftIcon size={18} style={{ color: colors.primary }} />
            <h3 className="text-lg font-bold text-white">Recent Gifts</h3>
          </div>
          {gifts.length > 0 && (
            <motion.button
              onClick={() => navigate('/history')}
              className="text-xs text-[#94A3B8] hover:text-white transition-colors flex items-center gap-1"
              whileHover={!shouldReduceMotion ? { x: 4 } : {}}
              whileTap={!shouldReduceMotion ? { scale: 0.95 } : {}}
            >
              View all
              <ArrowRight size={12} />
            </motion.button>
          )}
        </div>

        {isLoading ? (
          <SkeletonLoader type="list-item" rows={3} />
        ) : error ? (
          <div className="text-center py-4">
            <p className="text-sm text-[#EF4444]">{error}</p>
          </div>
        ) : gifts.length === 0 ? (
          <div className="text-center py-8 space-y-4">
            <motion.div
              className="w-16 h-16 mx-auto bg-[#1E293B]/40 rounded-full flex items-center justify-center"
              animate={!shouldReduceMotion ? {
                scale: [1, 1.1, 1],
              } : {}}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <GiftIcon size={24} className="text-[#64748B]" />
            </motion.div>
            <div>
              <p className="text-sm text-[#94A3B8] mb-2">No gifts sent yet</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {gifts.map((gift, index) => (
                <motion.div
                  key={gift.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  onClick={() => handleGiftClick(gift)}
                  whileHover={!shouldReduceMotion ? {
                    y: -4,
                    scale: 1.02,
                  } : {}}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group relative overflow-hidden"
                >
                  {/* Ribbon accent based on status */}
                  <div
                    className="absolute top-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{
                      background: getRibbonColor(gift.status),
                    }}
                  />

                  {/* Sparkle effects on hover */}
                  {!shouldReduceMotion && (
                    <motion.div
                      className="absolute inset-0 pointer-events-none"
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                    >
                      {Array.from({ length: 3 }, (_, i) => {
                        const angle = (i * 120) * (Math.PI / 180);
                        const distance = 30;
                        const x = Math.cos(angle) * distance;
                        const y = Math.sin(angle) * distance;
                        return (
                          <motion.div
                            key={i}
                            className="absolute top-1/2 left-1/2 w-1.5 h-1.5 rounded-full"
                            style={{
                              background: colors.glow,
                              boxShadow: `0 0 6px ${colors.glow}`,
                            }}
                            animate={{
                              opacity: [0, 1, 0],
                              scale: [0, 1, 0],
                              x: [0, x, 0],
                              y: [0, y, 0],
                            }}
                            transition={{
                              duration: 1.5,
                              repeat: Infinity,
                              delay: i * 0.2,
                              ease: 'easeInOut',
                            }}
                          />
                        );
                      })}
                    </motion.div>
                  )}

                  {/* Timeline dot */}
                  <div className="flex flex-col items-center relative z-10">
                    <motion.div
                      className="w-2 h-2 rounded-full"
                      style={{
                        backgroundColor: gift.status === 'claimed' ? '#10B981' : colors.primary,
                        boxShadow: `0 0 8px ${gift.status === 'claimed' ? 'rgba(16, 185, 129, 0.5)' : colors.glow}`,
                      }}
                      animate={!shouldReduceMotion ? {
                        scale: [1, 1.2, 1],
                      } : {}}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                    />
                    {index < gifts.length - 1 && (
                      <div className="w-px h-8 bg-white/10 mt-1" />
                    )}
                  </div>

                  {/* Gift info */}
                  <div className="flex-1 min-w-0 relative z-10">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="text-sm font-medium text-white truncate">
                        {truncateEmail(gift.recipient_email)}
                      </p>
                      <StatusChip status={gift.status} gift={gift} size="sm" />
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs text-[#94A3B8]">
                        {gift.amount.toFixed(4)} {gift.token_symbol}
                        {gift.usd_value && (
                          <span className="ml-1">({formatCurrency(gift.usd_value)})</span>
                        )}
                      </p>
                      <p className="text-xs text-[#64748B]">
                        {getRelativeTime(gift.created_at)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </FrostedCard>
  );
};

export default RecentGiftsTimeline;
