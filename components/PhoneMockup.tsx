import React, { ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

interface PhoneMockupProps {
  children: ReactNode;
  className?: string;
}

const PhoneMockup: React.FC<PhoneMockupProps> = ({ children, className = '' }) => {
  const { theme } = useTheme();
  const shouldReduceMotion = useReducedMotion();

  // Get theme-aware colors for phone frame
  const getFrameColors = () => {
    if (theme === 'christmas') {
      return {
        border: 'rgba(235, 106, 70, 0.2)',
        glow: 'rgba(235, 106, 70, 0.1)',
      };
    }
    if (theme === 'newyear') {
      return {
        border: 'rgba(252, 211, 77, 0.2)',
        glow: 'rgba(252, 211, 77, 0.1)',
      };
    }
    return {
      border: 'rgba(255, 255, 255, 0.1)',
      glow: 'rgba(255, 255, 255, 0.05)',
    };
  };

  const frameColors = getFrameColors();

  return (
    <div className={`relative w-full max-w-sm ${className}`}>
      {/* Phone frame with holiday accents */}
      <motion.div
        className="relative rounded-[2.5rem] p-2 shadow-2xl"
        style={{
          background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
          border: `2px solid ${frameColors.border}`,
          boxShadow: `0 0 40px ${frameColors.glow}, 0 20px 60px rgba(0, 0, 0, 0.5)`,
        }}
        whileHover={!shouldReduceMotion ? {
          scale: 1.02,
          boxShadow: `0 0 60px ${frameColors.glow}, 0 20px 80px rgba(0, 0, 0, 0.6)`,
        } : {}}
        transition={{ duration: 0.3 }}
      >
        <div className="bg-[#0B1120] rounded-[2rem] overflow-hidden">
          {/* Phone notch */}
          <div className="h-6 bg-[#0F172A] rounded-t-[2rem] flex items-center justify-center">
            <div className="w-32 h-1.5 bg-[#1E293B] rounded-full"></div>
          </div>

          {/* Screen content */}
          <div className="p-6 min-h-[500px] relative">
            {/* Screen glow effect */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `radial-gradient(circle at center, ${frameColors.glow} 0%, transparent 70%)`,
              }}
              animate={!shouldReduceMotion ? {
                opacity: [0.3, 0.5, 0.3],
              } : {}}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            {children}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PhoneMockup;











