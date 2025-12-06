import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { X, Check, Sparkles } from 'lucide-react';
import GlassCard from './GlassCard';
import GlowButton from './GlowButton';
import FrostedCard from './FrostedCard';
import { CARD_TEMPLATES, CardTemplate } from '../../lib/cardTemplates';
import { useTheme } from '../../context/ThemeContext';

interface GreetingCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCard: string | null;
  onSelect: (cardId: string) => void;
  recipientName?: string;
}

const CATEGORIES = [
  { id: 'all', label: 'All Cards' },
  { id: 'christmas', label: 'Christmas' },
  { id: 'newyear', label: 'New Year' },
  { id: 'classic', label: 'Classic' },
];

const GreetingCardModal: React.FC<GreetingCardModalProps> = ({
  isOpen,
  onClose,
  selectedCard,
  onSelect,
  recipientName,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { theme } = useTheme();
  const shouldReduceMotion = useReducedMotion();

  const handleCardSelect = (card: CardTemplate) => {
    onSelect(card.id);
  };

  const handleRemoveCard = () => {
    onSelect('');
    onClose();
  };

  // Filter cards by category
  const filteredCards = useMemo(() => {
    if (selectedCategory === 'all') return CARD_TEMPLATES;
    return CARD_TEMPLATES.filter(card => {
      const cardCategory = card.occasion?.toLowerCase() || '';
      if (selectedCategory === 'christmas') {
        return cardCategory.includes('christmas') || cardCategory.includes('holiday');
      }
      if (selectedCategory === 'newyear') {
        return cardCategory.includes('new year') || cardCategory.includes('newyear');
      }
      if (selectedCategory === 'classic') {
        return !cardCategory.includes('christmas') && !cardCategory.includes('new year') && !cardCategory.includes('newyear');
      }
      return true;
    });
  }, [selectedCategory]);

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

  if (!isOpen) return null;

  // Get theme-aware backdrop color
  const getBackdropColor = () => {
    if (theme === 'christmas') {
      return 'rgba(235, 106, 70, 0.15)';
    }
    if (theme === 'newyear') {
      return 'rgba(252, 211, 77, 0.15)';
    }
    return 'rgba(0, 0, 0, 0.75)'; // Darker backdrop for better contrast
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
            className="fixed inset-0 z-50"
            style={{
              background: `linear-gradient(135deg, ${getBackdropColor()} 0%, rgba(0, 0, 0, 0.75) 100%)`,
            }}
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="greeting-card-modal-title"
          />
          
          {/* Modal content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ 
              duration: shouldReduceMotion ? 0.2 : 0.3,
              ease: [0.16, 1, 0.3, 1],
            }}
            onClick={(e) => e.stopPropagation()}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div 
              className="w-full max-w-4xl max-h-[85vh] pointer-events-auto"
              role="dialog"
              aria-modal="true"
              aria-labelledby="greeting-card-modal-title"
            >
            <div className="relative flex flex-col max-h-[85vh] bg-[#0F172A] border border-white/20 rounded-3xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between mb-6 flex-shrink-0 p-6 pb-0">
                <div>
                  <h2 id="greeting-card-modal-title" className="text-2xl font-bold text-white flex items-center gap-2">
                    <Sparkles size={24} className={colors.primary} />
                    Choose a Greeting Card
                  </h2>
                  <p className="text-sm text-[#94A3B8] mt-1">
                    Greeting cards are $1 (applied at checkout)
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                  aria-label="Close modal"
                >
                  <X size={18} className="text-[#94A3B8]" />
                </button>
              </div>

              {/* Category Filters */}
              <div className="flex flex-wrap gap-2 mb-6 flex-shrink-0 px-6">
                {CATEGORIES.map((category) => {
                  const isActive = selectedCategory === category.id;
                  return (
                    <motion.button
                      key={category.id}
                      type="button"
                      onClick={() => setSelectedCategory(category.id)}
                      aria-label={`Filter by ${category.label}`}
                      aria-pressed={isActive}
                      className={`
                        px-4 py-2 rounded-lg text-sm font-medium transition-all min-h-[44px]
                        focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent
                        ${isActive
                          ? 'text-white shadow-lg'
                          : 'text-[#94A3B8] hover:text-white bg-[#0F172A]/50 hover:bg-[#1E293B]/50'
                        }
                      `}
                      style={{
                        backgroundColor: isActive ? colors.primary : undefined,
                        boxShadow: isActive ? `0 0 20px ${colors.glow}` : undefined,
                        '--tw-ring-color': colors.primary,
                      } as React.CSSProperties}
                      whileHover={!shouldReduceMotion ? { scale: 1.05 } : {}}
                      whileTap={!shouldReduceMotion ? { scale: 0.95 } : {}}
                    >
                      {category.label}
                    </motion.button>
                  );
                })}
              </div>

              {/* Card Grid - Scrollable */}
              <div className="overflow-y-auto flex-1 min-h-0 mb-6 px-6" style={{ maxHeight: 'calc(85vh - 200px)' }}>
                <motion.div
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                  layout
                >
                  <AnimatePresence mode="popLayout">
                    {filteredCards.map((card, index) => {
                      const isSelected = selectedCard === card.id;

                      return (
                        <motion.button
                          key={card.id}
                          type="button"
                          onClick={() => handleCardSelect(card)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              handleCardSelect(card);
                            }
                          }}
                          aria-label={`Select ${card.name || card.id} greeting card`}
                          aria-pressed={isSelected}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          layout
                          whileHover={!shouldReduceMotion ? {
                            y: -8,
                            scale: 1.02,
                          } : {}}
                          whileTap={!shouldReduceMotion ? {
                            scale: 0.98,
                          } : {}}
                          className={`
                            relative rounded-xl overflow-hidden border-2 transition-all min-h-[44px]
                            focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent
                            ${isSelected
                              ? 'ring-4'
                              : 'border-white/10 hover:border-white/20'
                            }
                          `}
                          style={{
                            borderColor: isSelected ? colors.primary : undefined,
                            ringColor: isSelected ? `${colors.primary}30` : undefined,
                            boxShadow: isSelected ? `0 0 30px ${colors.glow}` : undefined,
                            '--tw-ring-color': colors.primary,
                          } as React.CSSProperties}
                        >
                          {/* Ribbon accent */}
                          {isSelected && (
                            <motion.div
                              className="absolute top-0 left-0 right-0 h-1 z-10"
                              style={{
                                background: theme === 'christmas'
                                  ? 'linear-gradient(90deg, #EB6A46 0%, #EF4444 50%, #EB6A46 100%)'
                                  : theme === 'newyear'
                                  ? 'linear-gradient(90deg, #FCD34D 0%, #F59E0B 50%, #FCD34D 100%)'
                                  : 'linear-gradient(90deg, #06B6D4 0%, #0891B2 50%, #06B6D4 100%)',
                              }}
                              initial={{ scaleX: 0 }}
                              animate={{ scaleX: 1 }}
                              transition={{ duration: 0.3 }}
                            />
                          )}

                          <div className="relative">
                            <img
                              src={card.previewUrl}
                              alt={card.displayName}
                              className="w-full h-48 object-cover"
                            />
                            
                            {/* Selection indicator */}
                            {isSelected && (
                              <motion.div
                                className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center z-10"
                                style={{ backgroundColor: colors.primary }}
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                              >
                                <Check size={18} className="text-white" />
                              </motion.div>
                            )}

                            {/* Hover overlay */}
                            {!shouldReduceMotion && (
                              <motion.div
                                className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0"
                                whileHover={{ opacity: 1 }}
                                transition={{ duration: 0.2 }}
                              />
                            )}
                          </div>

                          <div className="p-4 bg-[#0F172A]/50">
                            <h3 className="font-bold text-white text-sm">{card.displayName}</h3>
                            <p className="text-xs text-[#94A3B8] mt-1">{card.occasion}</p>
                          </div>

                          {/* Shine effect on selected */}
                          {isSelected && !shouldReduceMotion && (
                            <motion.div
                              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none"
                              initial={{ x: '-100%' }}
                              animate={{ x: '100%' }}
                              transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                repeatDelay: 2,
                                ease: 'easeInOut',
                              }}
                            />
                          )}
                        </motion.button>
                      );
                    })}
                  </AnimatePresence>
                </motion.div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-white/10 flex-shrink-0 px-6 pb-6">
                {selectedCard ? (
                  <>
                    <GlowButton
                      variant="cyan"
                      onClick={onClose}
                      className="flex-1"
                      enableRibbonWiggle
                    >
                      Use selected card
                    </GlowButton>
                    <button
                      type="button"
                      onClick={handleRemoveCard}
                      className="px-4 py-2 text-sm text-[#94A3B8] hover:text-white transition-colors"
                    >
                      Skip Card
                    </button>
                  </>
                ) : (
                  <GlowButton
                    variant="secondary"
                    onClick={onClose}
                    className="flex-1"
                  >
                    Skip Card
                  </GlowButton>
                )}
              </div>
            </div>
          </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default GreetingCardModal;
