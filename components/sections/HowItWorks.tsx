import React, { useState } from 'react';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { Mail, Sparkles, CheckCircle } from 'lucide-react';
import GlassCard from '../UI/GlassCard';
import { useTheme } from '../../context/ThemeContext';

const HowItWorks: React.FC = () => {
  const { theme } = useTheme();
  const shouldReduceMotion = useReducedMotion();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const steps = [
    {
      icon: Mail,
      title: 'Enter Email',
      description: 'Type their email address and choose an amount. $100 in Bitcoin, USDC, or SOL.',
    },
    {
      icon: Sparkles,
      title: 'We Magic Link It',
      description: 'They receive a premium email with a secure "Magic Link." No app download required.',
    },
    {
      icon: CheckCircle,
      title: 'They Own It',
      description: 'One click and the assets are theirs. They can hold for growth, save, or cash out instantly.',
    },
  ];

  // Get theme-aware icon colors
  const getIconColors = () => {
    if (theme === 'christmas') {
      return {
        gradient: 'from-[#EB6A46] to-[#EF4444]',
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
      gradient: 'from-[#BE123C] to-[#EF4444]',
      glow: 'rgba(190, 18, 60, 0.3)',
    };
  };

  const iconColors = getIconColors();

  // Generate sparkle particles for hover effect
  const sparkles = Array.from({ length: 6 }, (_, i) => ({
    id: i,
    angle: (i * 60) * (Math.PI / 180),
    distance: 40,
  }));

  return (
    <section id="how-it-works" className="py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 lg:mb-16"
        >
          <h2 className="text-h2 font-bold text-white mb-4">Send Wealth Like An Email</h2>
          <p className="text-body-lg text-[#94A3B8] max-w-2xl mx-auto">
            No tech skills required. If you can send a Gmail, you can send an asset.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-12">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isHovered = hoveredIndex === index;
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="group"
              >
                <GlassCard 
                  className="h-full text-center relative overflow-visible" 
                  variant="holiday"
                >
                  {/* Ribbon accent border */}
                  <div 
                    className="absolute top-0 left-1/2 -translate-x-1/2 h-1 w-3/4 rounded-full"
                    style={{
                      background: theme === 'christmas' 
                        ? 'linear-gradient(90deg, #EB6A46 0%, #EF4444 50%, #EB6A46 100%)'
                        : theme === 'newyear'
                        ? 'linear-gradient(90deg, #FCD34D 0%, #F59E0B 50%, #FCD34D 100%)'
                        : 'linear-gradient(90deg, #BE123C 0%, #EF4444 50%, #BE123C 100%)',
                    }}
                  />

                  <div className="flex flex-col items-center pt-6">
                    {/* Icon container with animations */}
                    <motion.div
                      className="relative w-16 h-16 mb-6"
                      whileHover={!shouldReduceMotion ? {
                        scale: 1.1,
                        rotate: [0, -5, 5, -5, 0],
                      } : {}}
                      transition={{ duration: 0.5, ease: 'easeInOut' }}
                    >
                      <motion.div
                        className={`w-16 h-16 rounded-full bg-gradient-to-br ${iconColors.gradient} flex items-center justify-center shadow-lg relative z-10`}
                        animate={!shouldReduceMotion && isHovered ? {
                          boxShadow: `0 0 30px ${iconColors.glow}`,
                        } : {}}
                        transition={{ duration: 0.3 }}
                      >
                        <motion.div
                          animate={!shouldReduceMotion && isHovered ? {
                            scale: [1, 1.2, 1],
                            rotate: [0, 10, -10, 0],
                          } : {}}
                          transition={{ duration: 0.6, ease: 'easeInOut' }}
                        >
                          <Icon className="text-white" size={28} />
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

                    <h3 className="text-h3 font-bold text-white mb-3">{step.title}</h3>
                    <p className="text-body text-[#94A3B8] leading-relaxed">{step.description}</p>
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center"
        >
          <motion.div
            className="inline-flex items-center gap-3 px-6 py-4 rounded-full border"
            style={{
              background: theme === 'christmas' 
                ? 'rgba(235, 106, 70, 0.1)'
                : theme === 'newyear'
                ? 'rgba(252, 211, 77, 0.1)'
                : 'rgba(255, 178, 23, 0.1)',
              borderColor: theme === 'christmas'
                ? 'rgba(235, 106, 70, 0.3)'
                : theme === 'newyear'
                ? 'rgba(252, 211, 77, 0.3)'
                : 'rgba(255, 178, 23, 0.3)',
            }}
            whileHover={!shouldReduceMotion ? { scale: 1.05 } : {}}
            transition={{ duration: 0.2 }}
          >
            <CheckCircle 
              size={20} 
              style={{
                color: theme === 'christmas' 
                  ? '#EB6A46'
                  : theme === 'newyear'
                  ? '#FCD34D'
                  : '#FFB217',
              }}
            />
            <span
              className="text-lg font-bold"
              style={{
                color: theme === 'christmas' 
                  ? '#EB6A46'
                  : theme === 'newyear'
                  ? '#FCD34D'
                  : '#FFB217',
              }}
            >
              No wallet address required
            </span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorks;
