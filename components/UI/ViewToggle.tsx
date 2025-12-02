import React, { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { List, Grid } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

type ViewMode = 'list' | 'grid';

interface ViewToggleProps {
  viewMode: ViewMode;
  onViewChange: (mode: ViewMode) => void;
  storageKey?: string;
  className?: string;
}

const ViewToggle: React.FC<ViewToggleProps> = ({
  viewMode,
  onViewChange,
  storageKey = 'view_preference',
  className = '',
}) => {
  const { theme } = useTheme();
  const shouldReduceMotion = useReducedMotion();

  // Load preference from localStorage on mount
  useEffect(() => {
    if (storageKey) {
      const saved = localStorage.getItem(storageKey);
      if (saved && (saved === 'list' || saved === 'grid')) {
        onViewChange(saved as ViewMode);
      }
    }
  }, [storageKey, onViewChange]);

  // Save preference to localStorage when it changes
  useEffect(() => {
    if (storageKey) {
      localStorage.setItem(storageKey, viewMode);
    }
  }, [viewMode, storageKey]);

  // Get theme-aware colors
  const getColors = () => {
    if (theme === 'christmas') {
      return {
        selected: '#EB6A46',
        glow: 'rgba(235, 106, 70, 0.3)',
      };
    }
    if (theme === 'newyear') {
      return {
        selected: '#FCD34D',
        glow: 'rgba(252, 211, 77, 0.3)',
      };
    }
    return {
      selected: '#06B6D4',
      glow: 'rgba(6, 182, 212, 0.3)',
    };
  };

  const colors = getColors();

  return (
    <div className={`flex items-center gap-2 bg-[#0F172A] p-1 rounded-xl border border-white/10 relative overflow-hidden ${className}`}>
      {/* Animated background slider */}
      <motion.div
        className="absolute inset-y-1 rounded-lg"
        style={{
          background: theme === 'christmas'
            ? 'linear-gradient(90deg, #EB6A46 0%, #EF4444 100%)'
            : theme === 'newyear'
            ? 'linear-gradient(90deg, #FCD34D 0%, #F59E0B 100%)'
            : 'linear-gradient(90deg, #06B6D4 0%, #0891B2 100%)',
          willChange: 'transform, left, right',
        }}
        layout
        animate={{
          left: viewMode === 'list' ? '0.25rem' : '50%',
          right: viewMode === 'list' ? '50%' : '0.25rem',
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      />
      <motion.button
        type="button"
        onClick={() => onViewChange('list')}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onViewChange('list');
          }
        }}
        className={`p-2 rounded-lg transition-all relative z-10 min-h-[44px] min-w-[44px] flex items-center justify-center
          focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent ${
          viewMode === 'list'
            ? 'text-white shadow-lg'
            : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
        }`}
        aria-label="List view"
        aria-pressed={viewMode === 'list'}
        style={{
          boxShadow: viewMode === 'list' ? `0 0 20px ${colors.glow}` : undefined,
          '--tw-ring-color': colors.selected,
        } as React.CSSProperties}
        whileHover={!shouldReduceMotion && viewMode !== 'list' ? { scale: 1.1 } : {}}
        whileTap={!shouldReduceMotion ? { scale: 0.95 } : {}}
      >
        <List size={18} />
      </motion.button>
      <motion.button
        type="button"
        onClick={() => onViewChange('grid')}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onViewChange('grid');
          }
        }}
        className={`p-2 rounded-lg transition-all relative z-10 min-h-[44px] min-w-[44px] flex items-center justify-center
          focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent ${
          viewMode === 'grid'
            ? 'text-white shadow-lg'
            : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
        }`}
        aria-label="Grid view"
        aria-pressed={viewMode === 'grid'}
        style={{
          boxShadow: viewMode === 'grid' ? `0 0 20px ${colors.glow}` : undefined,
          '--tw-ring-color': colors.selected,
        } as React.CSSProperties}
        whileHover={!shouldReduceMotion && viewMode !== 'grid' ? { scale: 1.1 } : {}}
        whileTap={!shouldReduceMotion ? { scale: 0.95 } : {}}
      >
        <Grid size={18} />
      </motion.button>
    </div>
  );
};

export default ViewToggle;
