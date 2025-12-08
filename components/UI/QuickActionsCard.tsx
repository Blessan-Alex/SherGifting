import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Gift, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import FrostedCard from './FrostedCard';
import GlowButton from './GlowButton';
import { useTheme } from '../../context/ThemeContext';

const QuickActionsCard: React.FC = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const shouldReduceMotion = useReducedMotion();

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
    <FrostedCard variant="holiday" className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Primary: Send Gift */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <GlowButton
            variant="cyan"
            icon={Gift}
            onClick={() => navigate('/gift')}
            className="h-20 text-lg w-full"
            enableRibbonWiggle
            fullWidth
          >
            Send a Gift
          </GlowButton>
        </motion.div>

        {/* Secondary: Add Funds */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <GlowButton
            variant="secondary"
            icon={ArrowUpRight}
            onClick={() => navigate('/add-funds')}
            className="h-20 w-full"
            fullWidth
          >
            Add Funds
          </GlowButton>
        </motion.div>

        {/* Optional: Withdraw */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <GlowButton
            variant="secondary"
            icon={ArrowDownLeft}
            onClick={() => navigate('/withdraw')}
            className="h-20 w-full"
            fullWidth
          >
            Withdraw
          </GlowButton>
        </motion.div>
      </div>
    </FrostedCard>
  );
};

export default QuickActionsCard;





