import React, { useState } from 'react';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { Link2, Sparkles, Gift, Building2 } from 'lucide-react';
import GlassCard from '../UI/GlassCard';
import { useTheme } from '../../context/ThemeContext';
import { createShimmerEffect } from '../../lib/animations';

const WhyCryptoGifting: React.FC = () => {
  const { theme } = useTheme();
  const shouldReduceMotion = useReducedMotion();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const benefits = [
    {
      icon: Link2,
      title: 'No awkward wallet addresses',
      description: 'Send gifts using email or phone. Recipients claim without needing to share complex wallet addresses.',
    },
    {
      icon: Sparkles,
      title: "Works even if they're new to crypto",
      description: 'Perfect for introducing friends and family to crypto. Privy handles wallet creation automatically.',
    },
    {
      icon: Gift,
      title: 'Designed for holidays',
      description: 'Add holiday notes, choose festive themes, and schedule sends. Make every gift feel special.',
    },
    {
      icon: Building2,
      title: 'Built on Sher design system',
      description: "Crafted with attention to detail, using Sher's proven design patterns and security standards.",
    },
  ];

  // Get theme-aware colors
  const getIconColors = () => {
    if (theme === 'christmas') {
      return {
        gradient: 'from-[#EB6A46] to-[#F59E0B]',
        glow: 'rgba(235, 106, 70, 0.3)',
      };
    }
    if (theme === 'newyear') {
      return {
        gradient: 'from-[#FCD34D] to-[#F59E0B]',
        glow: 'rgba(252, 211, 77, 0.3)',
      };
    }
    return {
      gradient: 'from-[#FFB217] to-[#D97706]',
      glow: 'rgba(255, 178, 23, 0.3)',
    };
  };

  const iconColors = getIconColors();

  // Generate sparkle particles
  const sparkles = Array.from({ length: 4 }, (_, i) => ({
    id: i,
    angle: (i * 90) * (Math.PI / 180),
    distance: 35,
  }));

  return (
    <section className="py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-300px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 lg:mb-16"
        >
          <h2 className="text-h2 font-bold text-white mb-4">Why CryptoGifting?</h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            const isHovered = hoveredIndex === index;
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-300px' }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="group"
              >
                <motion.div
                  whileHover={!shouldReduceMotion ? {
                    y: -8,
                    scale: 1.02,
                  } : {}}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                >
                  <GlassCard 
                    className="h-full transition-all duration-300 relative overflow-visible"
                    variant="holiday"
                  >
                    {/* Shimmer effect on scroll reveal */}
                    {!shouldReduceMotion && (
                      <motion.div
                        className="absolute inset-0 rounded-3xl pointer-events-none opacity-0"
                        style={createShimmerEffect(2)}
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: [0, 0.3, 0] }}
                        viewport={{ once: true }}
                        transition={{ duration: 2, delay: index * 0.2 }}
                      />
                    )}

                    <div className="flex flex-col items-center text-center relative z-10">
                      {/* Icon container with enhanced animations */}
                      <motion.div
                        className="relative w-16 h-16 mb-6"
                        whileHover={!shouldReduceMotion ? {
                          scale: 1.15,
                          rotate: [0, -8, 8, -8, 0],
                        } : {}}
                        transition={{ duration: 0.5, ease: 'easeInOut' }}
                      >
                        <motion.div
                          className={`w-16 h-16 rounded-full bg-gradient-to-br ${iconColors.gradient} flex items-center justify-center shadow-lg relative z-10`}
                          animate={!shouldReduceMotion && isHovered ? {
                            boxShadow: `0 0 40px ${iconColors.glow}`,
                            scale: 1.1,
                          } : {}}
                          transition={{ duration: 0.3 }}
                        >
                          <motion.div
                            animate={!shouldReduceMotion && isHovered ? {
                              scale: [1, 1.3, 1],
                              rotate: [0, 15, -15, 0],
                            } : {}}
                            transition={{ duration: 0.6, ease: 'easeInOut' }}
                          >
                            <Icon className="text-[#0B1120]" size={28} />
                          </motion.div>
                        </motion.div>

                        {/* Sparkle particles on hover */}
                        <AnimatePresence>
                          {!shouldReduceMotion && isHovered && sparkles.map((sparkle) => {
                            const x = Math.cos(sparkle.angle) * sparkle.distance;
                            const y = Math.sin(sparkle.angle) * sparkle.distance;
                            return (
                              <motion.div
                                key={sparkle.id}
                                className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full"
                                style={{
                                  background: iconColors.glow,
                                  boxShadow: `0 0 8px ${iconColors.glow}`,
                                }}
                                initial={{ 
                                  opacity: 0, 
                                  scale: 0,
                                  x: 0,
                                  y: 0,
                                }}
                                animate={{ 
                                  opacity: [0, 1, 0],
                                  scale: [0, 1, 0],
                                  x,
                                  y,
                                }}
                                exit={{ opacity: 0, scale: 0 }}
                                transition={{
                                  duration: 0.8,
                                  delay: sparkle.id * 0.1,
                                  ease: 'easeOut',
                                }}
                              />
                            );
                          })}
                        </AnimatePresence>
                      </motion.div>

                      <h3 className="text-h3 font-bold text-white mb-3">{benefit.title}</h3>
                      <p className="text-body text-[#94A3B8] leading-relaxed">{benefit.description}</p>
                    </div>
                  </GlassCard>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WhyCryptoGifting;
