import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, useAnimationControls, useReducedMotion } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, Copy, Sparkles } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  id: string;
  type: ToastType;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  onDismiss: (id: string) => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({
  id,
  type,
  message,
  actionLabel,
  onAction,
  onDismiss,
  duration = 5000,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(duration);
  const { theme } = useTheme();
  const shouldReduceMotion = useReducedMotion();
  const progressControls = useAnimationControls();

  // Get theme-aware colors
  const getColors = () => {
    if (theme === 'christmas') {
      return {
        sparkle: '#EB6A46',
        glow: 'rgba(235, 106, 70, 0.3)',
        progress: 'linear-gradient(90deg, #EB6A46 0%, #EF4444 100%)',
      };
    }
    if (theme === 'newyear') {
      return {
        sparkle: '#FCD34D',
        glow: 'rgba(252, 211, 77, 0.3)',
        progress: 'linear-gradient(90deg, #FCD34D 0%, #F59E0B 100%)',
      };
    }
    return {
      sparkle: '#10B981',
      glow: 'rgba(16, 185, 129, 0.3)',
      progress: 'linear-gradient(90deg, #10B981 0%, #059669 100%)',
    };
  };

  const colors = getColors();

  // Progress bar animation
  useEffect(() => {
    if (duration > 0 && !shouldReduceMotion) {
      progressControls.start({
        width: '0%',
        transition: {
          duration: duration / 1000,
          ease: 'linear',
        },
      });
    }
  }, [duration, progressControls, shouldReduceMotion]);

  // Pause/resume progress on hover
  useEffect(() => {
    if (isHovered) {
      progressControls.stop();
    } else if (duration > 0 && !shouldReduceMotion) {
      const remaining = (timeRemaining / duration) * 100;
      progressControls.start({
        width: `${remaining}%`,
        transition: {
          duration: timeRemaining / 1000,
          ease: 'linear',
        },
      });
    }
  }, [isHovered, progressControls, duration, timeRemaining, shouldReduceMotion]);

  // Timer for auto-dismiss
  useEffect(() => {
    if (duration > 0 && !isHovered) {
      const interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 100) {
            onDismiss(id);
            return 0;
          }
          return prev - 100;
        });
      }, 100);

      return () => clearInterval(interval);
    }
  }, [id, duration, isHovered, onDismiss]);

  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info,
  };

  const styles = {
    success: 'bg-[#064E3B]/20 border-[#10B981]/20 text-[#10B981]',
    error: 'bg-[#7F1D1D]/20 border-[#EF4444]/20 text-[#EF4444]',
    info: 'bg-[#1E3A8A]/20 border-[#3B82F6]/20 text-[#3B82F6]',
  };

  const Icon = icons[type];
  const isSuccess = type === 'success';

  return (
    <motion.div
      initial={{ opacity: 0, x: 300, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 300, scale: 0.95 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        relative flex items-center gap-3 p-4 rounded-xl border backdrop-blur-xl overflow-hidden
        ${styles[type]}
        shadow-lg min-w-[300px] max-w-md
      `}
      role="alert"
      aria-live={type === 'error' ? 'assertive' : 'polite'}
    >
      {/* Progress bar */}
      {duration > 0 && !shouldReduceMotion && (
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-1"
          style={{
            background: type === 'success' ? colors.progress : type === 'error' ? 'linear-gradient(90deg, #EF4444 0%, #DC2626 100%)' : 'linear-gradient(90deg, #3B82F6 0%, #2563EB 100%)',
          }}
          initial={{ width: '100%' }}
          animate={progressControls}
        />
      )}

      {/* Icon with sparkle animation for success */}
      <div className="relative flex-shrink-0">
        {isSuccess && !shouldReduceMotion ? (
          <motion.div
            className="relative"
            animate={{
              rotate: [0, 360],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'linear',
            }}
          >
            <Icon size={20} className="relative z-10" />
            
            {/* Sparkle particles orbiting the icon */}
            {Array.from({ length: 4 }, (_, i) => {
              const angle = (i * 90) * (Math.PI / 180);
              const radius = 15;
              return (
                <motion.div
                  key={i}
                  className="absolute top-1/2 left-1/2 w-1.5 h-1.5 rounded-full"
                  style={{
                    background: colors.sparkle,
                    boxShadow: `0 0 6px ${colors.glow}`,
                  }}
                  animate={{
                    x: [Math.cos(angle) * radius, Math.cos(angle + Math.PI * 2) * radius],
                    y: [Math.sin(angle) * radius, Math.sin(angle + Math.PI * 2) * radius],
                    opacity: [0, 1, 0.5, 1, 0],
                    scale: [0, 1, 0.8, 1, 0],
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

            {/* Central sparkle icon */}
            <motion.div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.7, 1, 0.7],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <Sparkles size={12} style={{ color: colors.sparkle }} />
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            animate={isSuccess && !shouldReduceMotion ? {
              scale: [1, 1.1, 1],
            } : {}}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <Icon size={20} />
          </motion.div>
        )}
      </div>

      <p className="flex-1 text-sm font-medium">{message}</p>
      
      <div className="flex items-center gap-2">
        {actionLabel && onAction && (
          <motion.button
            onClick={onAction}
            className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-medium transition-colors flex items-center gap-1"
            whileHover={!shouldReduceMotion ? { scale: 1.05 } : {}}
            whileTap={!shouldReduceMotion ? { scale: 0.95 } : {}}
          >
            {actionLabel === 'Copy' && <Copy size={12} />}
            {actionLabel}
          </motion.button>
        )}
        <motion.button
          onClick={() => onDismiss(id)}
          className="p-1 rounded-lg hover:bg-white/10 transition-colors"
          aria-label="Dismiss notification"
          whileHover={!shouldReduceMotion ? { scale: 1.1 } : {}}
          whileTap={!shouldReduceMotion ? { scale: 0.9 } : {}}
        >
          <X size={16} />
        </motion.button>
      </div>
    </motion.div>
  );
};

export default Toast;
