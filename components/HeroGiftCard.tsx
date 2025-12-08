import React, { useState, useRef, useEffect, useMemo, useCallback, forwardRef, useImperativeHandle } from 'react';
import { Gift, Coins } from 'lucide-react';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import GlassCard from './UI/GlassCard';
import { useTheme } from '../context/ThemeContext';

interface HeroGiftCardProps {
  onUnwrapTrigger?: () => void;
}

export interface HeroGiftCardRef {
  triggerUnwrap: () => void;
}

/**
 * HeroGiftCard - Interactive gift card with tilt and sparkle effects.
 * 
 * Performance optimizations:
 * - rAF batching: Mouse position stored in ref, updates batched via requestAnimationFrame
 * - Direct style updates: Tilt transform applied directly (no React state/re-renders)
 * - Sparkles memoized: Generated once per trigger, not on every render
 * - forwardRef: Allows external control without prop drilling
 */
const HeroGiftCard = forwardRef<HeroGiftCardRef, HeroGiftCardProps>(({ onUnwrapTrigger }, ref) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isUnwrapping, setIsUnwrapping] = useState(false);
  const [sparkleTrigger, setSparkleTrigger] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);
  const motionDivRef = useRef<HTMLDivElement>(null);
  const mousePosRef = useRef({ x: 0, y: 0 });
  const rafIdRef = useRef<number | null>(null);
  const { theme } = useTheme();
  const shouldReduceMotion = useReducedMotion();

  // Theme-aware colors
  const getRibbonColors = () => {
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
      primary: '#BE123C',
      secondary: '#EF4444',
      glow: 'rgba(190, 18, 60, 0.3)',
    };
  };

  const ribbonColors = getRibbonColors();

  // Handle pointer move with rAF batching (no state updates = no re-renders)
  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!cardRef.current || shouldReduceMotion || !isHovered) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    // Store in ref (no state update)
    mousePosRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    
    // Schedule single rAF update (batches multiple moves into one frame)
    if (rafIdRef.current === null) {
      rafIdRef.current = requestAnimationFrame(() => {
        if (!motionDivRef.current || !cardRef.current) {
          rafIdRef.current = null;
          return;
        }
        
        const centerX = cardRef.current.offsetWidth / 2;
        const centerY = cardRef.current.offsetHeight / 2;
        
        // Calculate tilt
        const tiltX = ((mousePosRef.current.y - centerY) / centerY) * 12;
        const tiltY = ((centerX - mousePosRef.current.x) / centerX) * 12;
        
        // Apply transform directly via style (no React re-render)
        // Use transform3d for better performance
        motionDivRef.current.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(1.05)`;
        
        rafIdRef.current = null;
      });
    }
  }, [shouldReduceMotion, isHovered]);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    mousePosRef.current = { x: 0, y: 0 };
    // Reset tilt with smooth transition
    if (motionDivRef.current) {
      motionDivRef.current.style.transition = 'transform 0.3s ease-out';
      motionDivRef.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
      // Remove transition after animation completes
      setTimeout(() => {
        if (motionDivRef.current) {
          motionDivRef.current.style.transition = '';
        }
      }, 300);
    }
    // Cancel pending rAF
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
  }, []);

  // Periodic sparkle trigger
  useEffect(() => {
    if (shouldReduceMotion) return;
    
    const interval = setInterval(() => {
      setSparkleTrigger((prev) => prev + 1);
    }, 4000); // Every 4 seconds

    return () => clearInterval(interval);
  }, [shouldReduceMotion]);

  // Unwrap animation trigger
  const triggerUnwrap = useCallback(() => {
    if (shouldReduceMotion) {
      if (onUnwrapTrigger) onUnwrapTrigger();
      return;
    }

    setIsUnwrapping(true);
    
    setTimeout(() => {
      setIsUnwrapping(false);
      if (onUnwrapTrigger) onUnwrapTrigger();
    }, 800);
  }, [onUnwrapTrigger, shouldReduceMotion]);

  // Expose unwrap trigger via ref (for external triggers)
  useImperativeHandle(ref, () => ({
    triggerUnwrap,
  }), [triggerUnwrap]);

  // Sparkle particles
  const sparkles = useMemo(() => {
    if (shouldReduceMotion) return [];
    return Array.from({ length: 6 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 2,
      size: Math.random() * 4 + 3,
    }));
  }, [shouldReduceMotion, sparkleTrigger]);

  return (
    <div
      ref={cardRef}
      className="relative perspective-1000 pt-8"
      onPointerMove={handlePointerMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={triggerUnwrap}
      style={{ cursor: 'pointer' }}
    >
      <motion.div
        ref={motionDivRef}
        // Tilt is handled via direct style updates in rAF (no React re-renders)
        // Only use Framer Motion for scale animation on hover
        animate={
          !shouldReduceMotion && isHovered
            ? {
                scale: 1.05,
              }
            : {
                scale: 1,
              }
        }
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 30,
        }}
        style={{
          transformStyle: 'preserve-3d',
        }}
      >
        <GlassCard
          className="relative overflow-hidden"
          variant="gift"
        >
          {/* Enhanced shine effect with sparkle trail */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            initial={{ x: '-100%' }}
            animate={
              !shouldReduceMotion && isHovered
                ? { x: '100%' }
                : { x: '-100%' }
            }
            transition={{ duration: 0.7, ease: 'easeInOut' }}
          />

          {/* Sparkle particles */}
          <AnimatePresence>
            {!shouldReduceMotion && (isHovered || sparkleTrigger > 0) && sparkles.map((sparkle) => (
              <motion.div
                key={`sparkle-${sparkle.id}-${sparkleTrigger}`}
                className="absolute rounded-full"
                style={{
                  left: `${sparkle.left}%`,
                  top: `${sparkle.top}%`,
                  width: `${sparkle.size}px`,
                  height: `${sparkle.size}px`,
                  background: `radial-gradient(circle, ${ribbonColors.primary} 0%, transparent 70%)`,
                  boxShadow: `0 0 ${sparkle.size * 2}px ${ribbonColors.glow}`,
                }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: [0, 1, 0], scale: [0, 1.5, 0] }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 1.5,
                  delay: sparkle.delay,
                  ease: 'easeOut',
                }}
              />
            ))}
          </AnimatePresence>

          {/* Unwrap animation overlay */}
          <AnimatePresence>
            {isUnwrapping && !shouldReduceMotion && (
              <motion.div
                className="absolute inset-0 z-30 flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
              >
                <motion.div
                  className="w-32 h-32 rounded-full"
                  style={{
                    background: `radial-gradient(circle, ${ribbonColors.glow} 0%, transparent 70%)`,
                  }}
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 2, 3] }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Card content */}
          <motion.div
            className="relative z-10 pt-12 pb-8 px-6"
            animate={
              !shouldReduceMotion && isUnwrapping
                ? {
                    scale: [1, 1.1, 1],
                  }
                : {}
            }
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <div className="text-center mb-6">
              <div className="text-3xl font-bold text-white mb-2">$50.00</div>
              <div className="text-sm text-[#94A3B8] flex items-center justify-center gap-2">
                <Coins size={16} />
                <span>USDC</span>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center py-2 border-b border-white/10">
                <span className="text-xs text-[#94A3B8]">From</span>
                <span className="text-sm text-white font-medium">You</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/10">
                <span className="text-xs text-[#94A3B8]">To</span>
                <span className="text-sm text-white font-medium">Recipient</span>
              </div>
            </div>

            <div className="text-center">
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border"
                style={{
                  backgroundColor: `${ribbonColors.primary}20`,
                  borderColor: `${ribbonColors.primary}30`,
                }}
              >
                <span
                  className="text-xs font-medium"
                  style={{ color: ribbonColors.primary }}
                >
                  Wrapped
                </span>
              </div>
            </div>
          </motion.div>
        </GlassCard>
      </motion.div>
    </div>
  );
});

HeroGiftCard.displayName = 'HeroGiftCard';

export default HeroGiftCard;
