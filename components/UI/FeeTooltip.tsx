import React, { useState } from 'react';
import { Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FeeTooltipProps {
  content: string;
  className?: string;
}

const FeeTooltip: React.FC<FeeTooltipProps> = ({ content, className = '' }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <button
        type="button"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onFocus={() => setIsHovered(true)}
        onBlur={() => setIsHovered(false)}
        className="text-[#64748B] hover:text-[#94A3B8] transition-colors focus:outline-none focus:ring-2 focus:ring-[#06B6D4] focus:ring-offset-2 focus:ring-offset-transparent rounded"
        aria-label="Fee information"
      >
        <Info size={14} />
      </button>
      
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-3 bg-[#1E293B] border border-white/10 rounded-lg shadow-xl z-50 pointer-events-none"
            style={{ marginBottom: '0.5rem' }}
          >
            <p className="text-xs text-white leading-relaxed">{content}</p>
            {/* Arrow */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
              <div className="w-2 h-2 bg-[#1E293B] border-r border-b border-white/10 transform rotate-45"></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FeeTooltip;

