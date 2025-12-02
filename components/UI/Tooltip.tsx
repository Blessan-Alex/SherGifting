import React, { useState, useRef, useEffect, ReactNode } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

type TooltipPosition = 'top' | 'bottom' | 'left' | 'right' | 'auto';

interface TooltipProps {
  content: ReactNode;
  children: React.ReactElement;
  position?: TooltipPosition;
  delay?: number;
  disabled?: boolean;
  className?: string;
}

const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'auto',
  delay = 200,
  disabled = false,
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [calculatedPosition, setCalculatedPosition] = useState<TooltipPosition>(position);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const shouldReduceMotion = useReducedMotion();

  // Get theme-aware colors
  const getColors = () => {
    if (theme === 'christmas') {
      return {
        primary: '#EB6A46',
        glow: 'rgba(235, 106, 70, 0.3)',
        background: 'rgba(30, 41, 59, 0.95)',
        border: 'rgba(235, 106, 70, 0.3)',
      };
    }
    if (theme === 'newyear') {
      return {
        primary: '#FCD34D',
        glow: 'rgba(252, 211, 77, 0.3)',
        background: 'rgba(30, 41, 59, 0.95)',
        border: 'rgba(252, 211, 77, 0.3)',
      };
    }
    return {
      primary: '#06B6D4',
      glow: 'rgba(6, 182, 212, 0.3)',
      background: 'rgba(30, 41, 59, 0.95)',
      border: 'rgba(6, 182, 212, 0.3)',
    };
  };

  const colors = getColors();

  // Calculate position based on viewport
  useEffect(() => {
    if (isVisible && position === 'auto' && tooltipRef.current && triggerRef.current) {
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let newPosition: TooltipPosition = 'top';

      // Check available space
      const spaceTop = triggerRect.top;
      const spaceBottom = viewportHeight - triggerRect.bottom;
      const spaceLeft = triggerRect.left;
      const spaceRight = viewportWidth - triggerRect.right;

      if (spaceBottom >= tooltipRect.height + 10) {
        newPosition = 'bottom';
      } else if (spaceTop >= tooltipRect.height + 10) {
        newPosition = 'top';
      } else if (spaceRight >= tooltipRect.width + 10) {
        newPosition = 'right';
      } else if (spaceLeft >= tooltipRect.width + 10) {
        newPosition = 'left';
      } else {
        newPosition = 'bottom'; // Default fallback
      }

      setCalculatedPosition(newPosition);
    } else if (position !== 'auto') {
      setCalculatedPosition(position);
    }
  }, [isVisible, position]);

  const handleMouseEnter = () => {
    if (disabled) return;
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    const id = setTimeout(() => setIsVisible(true), delay);
    setTimeoutId(id);
  };

  const handleMouseLeave = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    setIsVisible(false);
  };

  const handleClick = () => {
    // On mobile, toggle on click
    if (window.innerWidth < 768) {
      setIsVisible(!isVisible);
    }
  };

  const getPositionClasses = (pos: TooltipPosition) => {
    switch (pos) {
      case 'top':
        return 'bottom-full left-1/2 -translate-x-1/2 mb-2';
      case 'bottom':
        return 'top-full left-1/2 -translate-x-1/2 mt-2';
      case 'left':
        return 'right-full top-1/2 -translate-y-1/2 mr-2';
      case 'right':
        return 'left-full top-1/2 -translate-y-1/2 ml-2';
      default:
        return 'bottom-full left-1/2 -translate-x-1/2 mb-2';
    }
  };

  const getArrowClasses = (pos: TooltipPosition) => {
    switch (pos) {
      case 'top':
        return 'top-full left-1/2 -translate-x-1/2 border-t-[#1E293B] border-l-transparent border-r-transparent border-b-transparent';
      case 'bottom':
        return 'bottom-full left-1/2 -translate-x-1/2 border-b-[#1E293B] border-l-transparent border-r-transparent border-t-transparent';
      case 'left':
        return 'left-full top-1/2 -translate-y-1/2 border-l-[#1E293B] border-t-transparent border-b-transparent border-r-transparent';
      case 'right':
        return 'right-full top-1/2 -translate-y-1/2 border-r-[#1E293B] border-t-transparent border-b-transparent border-l-transparent';
      default:
        return 'top-full left-1/2 -translate-x-1/2 border-t-[#1E293B] border-l-transparent border-r-transparent border-b-transparent';
    }
  };

  return (
    <div
      ref={triggerRef}
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      {children}
      <AnimatePresence>
        {isVisible && !disabled && (
          <motion.div
            ref={tooltipRef}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ 
              duration: shouldReduceMotion ? 0.1 : 0.2,
              ease: [0.16, 1, 0.3, 1],
            }}
            className={`absolute z-50 ${getPositionClasses(calculatedPosition)} ${className}`}
            role="tooltip"
            aria-live="polite"
          >
            <div
              className="relative backdrop-blur-xl rounded-lg px-3 py-2 text-sm text-white shadow-xl max-w-xs border overflow-hidden"
              style={{
                background: colors.background,
                borderColor: colors.border,
              }}
            >
              {/* Ribbon accent */}
              <div
                className="absolute top-0 left-0 right-0 h-0.5"
                style={{
                  background: theme === 'christmas'
                    ? 'linear-gradient(90deg, #EB6A46 0%, #EF4444 50%, #EB6A46 100%)'
                    : theme === 'newyear'
                    ? 'linear-gradient(90deg, #FCD34D 0%, #F59E0B 50%, #FCD34D 100%)'
                    : 'linear-gradient(90deg, #06B6D4 0%, #0891B2 50%, #06B6D4 100%)',
                }}
              />

              {/* Sparkle effects on show */}
              {!shouldReduceMotion && (
                <motion.div
                  className="absolute inset-0 pointer-events-none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {Array.from({ length: 3 }, (_, i) => {
                    const angle = (i * 120) * (Math.PI / 180);
                    const distance = 20;
                    const x = Math.cos(angle) * distance;
                    const y = Math.sin(angle) * distance;
                    return (
                      <motion.div
                        key={i}
                        className="absolute top-1/2 left-1/2 w-1 h-1 rounded-full"
                        style={{
                          background: colors.primary,
                          boxShadow: `0 0 4px ${colors.glow}`,
                        }}
                        animate={{
                          opacity: [0, 1, 0],
                          scale: [0, 1, 0],
                          x: [0, x, 0],
                          y: [0, y, 0],
                        }}
                        transition={{
                          duration: 0.8,
                          delay: i * 0.1,
                          ease: 'easeOut',
                        }}
                      />
                    );
                  })}
                </motion.div>
              )}

              <div className="relative z-10 flex items-center gap-2">
                {!shouldReduceMotion && (
                  <motion.div
                    animate={{
                      rotate: [0, 360],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                  >
                    <Sparkles size={12} style={{ color: colors.primary }} />
                  </motion.div>
                )}
                <span>{content}</span>
              </div>
            </div>
            {/* Arrow */}
            <div
              className={`absolute w-0 h-0 border-4 ${getArrowClasses(calculatedPosition)}`}
              style={{
                borderColor: calculatedPosition === 'top' 
                  ? `${colors.background} transparent transparent transparent`
                  : calculatedPosition === 'bottom'
                  ? `transparent transparent ${colors.background} transparent`
                  : calculatedPosition === 'left'
                  ? `transparent transparent transparent ${colors.background}`
                  : `${colors.background} transparent transparent transparent`,
              }}
              aria-hidden="true"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Tooltip;
