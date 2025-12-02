import React from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { X } from 'lucide-react';
import GlassCard from './GlassCard';
import GlowButton from './GlowButton';
import { Shortcut } from '../../hooks/useKeyboardShortcuts';
import { useTheme } from '../../context/ThemeContext';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
  shortcuts: Shortcut[];
}

const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose, shortcuts }) => {
  const { theme } = useTheme();
  const shouldReduceMotion = useReducedMotion();

  // Get theme-aware backdrop color
  const getBackdropColor = () => {
    if (theme === 'christmas') {
      return 'rgba(235, 106, 70, 0.1)';
    }
    if (theme === 'newyear') {
      return 'rgba(252, 211, 77, 0.1)';
    }
    return 'rgba(11, 17, 32, 0.9)';
  };

  // Group shortcuts by category
  const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
    const category = shortcut.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(shortcut);
    return acc;
  }, {} as Record<string, Shortcut[]>);

  const formatKey = (shortcut: Shortcut) => {
    const parts: string[] = [];
    if (shortcut.ctrl || shortcut.meta) parts.push('⌘');
    if (shortcut.shift) parts.push('⇧');
    if (shortcut.alt) parts.push('⌥');
    parts.push(shortcut.key.toUpperCase());
    return parts.join(' + ');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Enhanced backdrop with blur animation */}
          <motion.div
            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            animate={{ opacity: 1, backdropFilter: 'blur(8px)' }}
            exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            className="fixed inset-0 z-50"
            style={{
              background: `linear-gradient(135deg, ${getBackdropColor()} 0%, rgba(11, 17, 32, 0.9) 100%)`,
            }}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ 
              duration: shouldReduceMotion ? 0.2 : 0.3,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            onClick={(e) => e.stopPropagation()}
          >
            <GlassCard className="max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col pointer-events-auto">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <h2 className="text-2xl font-bold text-white">Keyboard Shortcuts</h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  aria-label="Close"
                >
                  <X size={20} className="text-[#94A3B8]" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
                  <div key={category} className="mb-6 last:mb-0">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-[#06B6D4] mb-3">
                      {category}
                    </h3>
                    <div className="space-y-2">
                      {categoryShortcuts.map((shortcut, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 rounded-lg bg-[#0F172A]/50 border border-white/5 hover:bg-white/5 transition-colors"
                        >
                          <span className="text-[#94A3B8] text-sm">{shortcut.description}</span>
                          <kbd className="px-3 py-1.5 bg-[#1E293B] border border-white/10 rounded-lg text-xs font-mono text-white">
                            {formatKey(shortcut)}
                          </kbd>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-white/10">
                <GlowButton variant="secondary" onClick={onClose} fullWidth>
                  Close
                </GlowButton>
              </div>
            </GlassCard>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ShortcutsModal;


