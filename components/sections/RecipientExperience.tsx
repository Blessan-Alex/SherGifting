import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Gift, CheckCircle, Mail, Smartphone, RefreshCw } from 'lucide-react';
import GlassCard from '../UI/GlassCard';
import PhoneMockup from '../PhoneMockup';
import { useTheme } from '../../context/ThemeContext';

const RecipientExperience: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isUnwrapping, setIsUnwrapping] = useState(false);
  const [sparkleTrigger, setSparkleTrigger] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const shouldReduceMotion = useReducedMotion();
  
  // Note: Using local useScroll with target for element-specific scroll tracking.
  // This component tracks scroll relative to its own section, not the page.
  // For page-level scroll, components should use useScrollMotion() from context.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, -30]);

  // Get theme-aware ribbon colors
  const getRibbonColors = () => {
    if (theme === 'christmas') {
      return {
        primary: '#EB6A46',
        secondary: '#EF4444',
        glow: 'rgba(235, 106, 70, 0.4)',
      };
    }
    if (theme === 'newyear') {
      return {
        primary: '#FCD34D',
        secondary: '#F59E0B',
        glow: 'rgba(252, 211, 77, 0.4)',
      };
    }
    return {
      primary: '#BE123C',
      secondary: '#EF4444',
      glow: 'rgba(190, 18, 60, 0.4)',
    };
  };

  const ribbonColors = getRibbonColors();

  // Auto-advance through steps for demo
  useEffect(() => {
    if (currentStep === 0) {
      const timer = setTimeout(() => {
        setIsUnwrapping(true);
        setSparkleTrigger(prev => prev + 1);
        setTimeout(() => {
          setCurrentStep(1);
          setIsUnwrapping(false);
        }, 600);
      }, 2000);
      return () => clearTimeout(timer);
    } else if (currentStep === 1) {
      const timer = setTimeout(() => setCurrentStep(2), 2000);
      return () => clearTimeout(timer);
    } else if (currentStep === 2) {
      const timer = setTimeout(() => setCurrentStep(3), 2000);
      return () => clearTimeout(timer);
    } else if (currentStep === 3) {
      const timer = setTimeout(() => {
        setCurrentStep(0);
        setIsUnwrapping(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [currentStep, shouldReduceMotion]);

  // Reset animation
  const resetAnimation = () => {
    setCurrentStep(0);
    setIsUnwrapping(false);
    setSparkleTrigger(prev => prev + 1);
  };

  // Generate sparkle particles
  const sparkles = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    angle: (i * 45) * (Math.PI / 180),
    distance: 50,
  }));

  // Step indicators
  const steps = [0, 1, 2, 3];

  return (
    <section id="preview" className="py-16 lg:py-24" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left: Description */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-left"
          >
            <h2 className="text-h2 font-bold text-white mb-6">What recipients see</h2>
            <p className="text-body-lg text-[#CBD5E1] text-max-width mx-auto lg:mx-0 mb-6 leading-relaxed">
              When someone receives your gift link, they see a beautiful, wrapped gift card. With one click, they can claim it using their email or phone—no wallet needed.
            </p>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#BE123C]/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <Gift size={16} className="text-[#BE123C]" />
                </div>
                <div>
                  <h3 className="text-h3 font-bold text-white mb-1">Unwrap the gift</h3>
                  <p className="text-body text-[#94A3B8]">Beautiful gift card with your holiday note</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#06B6D4]/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <Smartphone size={16} className="text-[#06B6D4]" />
                </div>
                <div>
                  <h3 className="text-h3 font-bold text-white mb-1">Claim with email or phone</h3>
                  <p className="text-body text-[#94A3B8]">Powered by Privy—secure and instant</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#10B981]/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <CheckCircle size={16} className="text-[#10B981]" />
                </div>
                <div>
                  <h3 className="text-h3 font-bold text-white mb-1">Receive instantly</h3>
                  <p className="text-body text-[#94A3B8]">Crypto appears in their wallet automatically</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right: Phone Mock/Preview */}
          <motion.div
            style={{ y }}
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center lg:items-end gap-4"
          >
            <PhoneMockup>
              <AnimatePresence mode="wait">
                {currentStep === 0 && (
                  <motion.div
                    key="wrapped"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="h-full flex items-center justify-center relative"
                  >
                    <GlassCard className="w-full relative overflow-visible">
                      <div className="relative">
                        {/* Enhanced Ribbon that unwraps */}
                        <motion.div
                          className="absolute top-0 left-1/2 -translate-x-1/2 z-20"
                          style={{ top: '-20px' }}
                          animate={isUnwrapping ? {
                            scale: [1, 1.3, 0],
                            rotate: [0, 20, 45],
                            opacity: [1, 0.7, 0],
                            y: [-10, -30, -50],
                          } : {}}
                          transition={{ duration: 0.6, ease: 'easeOut' }}
                        >
                          <motion.div
                            className="w-20 h-20 rounded-full flex items-center justify-center shadow-lg"
                            style={{
                              background: `linear-gradient(135deg, ${ribbonColors.primary} 0%, ${ribbonColors.secondary} 100%)`,
                              boxShadow: `0 0 30px ${ribbonColors.glow}`,
                            }}
                          >
                            <Gift className="text-white" size={32} />
                          </motion.div>
                          <div
                            className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-6 rounded-t-full"
                            style={{ backgroundColor: ribbonColors.primary }}
                          />
                        </motion.div>

                        {/* Sparkle burst on unwrap */}
                        <AnimatePresence>
                          {isUnwrapping && !shouldReduceMotion && sparkles.map((sparkle) => {
                            const x = Math.cos(sparkle.angle) * sparkle.distance;
                            const y = Math.sin(sparkle.angle) * sparkle.distance;
                            return (
                              <motion.div
                                key={`sparkle-${sparkle.id}-${sparkleTrigger}`}
                                className="absolute top-1/2 left-1/2 w-3 h-3 rounded-full"
                                style={{
                                  background: ribbonColors.glow,
                                  boxShadow: `0 0 10px ${ribbonColors.glow}`,
                                }}
                                initial={{ 
                                  opacity: 0, 
                                  scale: 0,
                                  x: 0,
                                  y: 0,
                                }}
                                animate={{ 
                                  opacity: [0, 1, 0],
                                  scale: [0, 1.5, 0],
                                  x,
                                  y,
                                }}
                                exit={{ opacity: 0, scale: 0 }}
                                transition={{
                                  duration: 0.8,
                                  delay: sparkle.id * 0.05,
                                  ease: 'easeOut',
                                }}
                              />
                            );
                          })}
                        </AnimatePresence>

                        {/* Glow pulse on unwrap */}
                        {isUnwrapping && !shouldReduceMotion && (
                          <motion.div
                            className="absolute inset-0 rounded-3xl pointer-events-none"
                            style={{
                              background: `radial-gradient(circle, ${ribbonColors.glow} 0%, transparent 70%)`,
                            }}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ 
                              opacity: [0, 0.6, 0],
                              scale: [0.8, 1.5, 2],
                            }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                          />
                        )}

                        <motion.div
                          className="pt-16 pb-8 text-center"
                          animate={isUnwrapping && !shouldReduceMotion ? {
                            scale: [1, 1.05, 1],
                          } : {}}
                          transition={{ duration: 0.6 }}
                        >
                          <div className="text-2xl font-bold text-white mb-2">$50.00</div>
                          <div className="text-sm text-[#94A3B8] mb-4">USDC</div>
                          <div className="text-xs text-[#94A3B8]">From: You</div>
                        </motion.div>
                      </div>
                    </GlassCard>
                  </motion.div>
                )}

                {currentStep === 1 && (
                  <motion.div
                    key="claim"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="h-full flex flex-col items-center justify-center space-y-6"
                  >
                    <GlassCard className="w-full">
                      <div className="text-center py-8">
                        <div className="text-3xl font-bold text-white mb-2">$50.00</div>
                        <div className="text-sm text-[#94A3B8] mb-6">USDC Gift</div>
                        <div className="text-xs text-[#94A3B8] mb-6">From: You</div>
                        <button className="w-full bg-[#06B6D4] text-white py-3 px-6 rounded-xl font-medium hover:bg-[#0891B2] transition-colors">
                          Claim Gift
                        </button>
                      </div>
                    </GlassCard>
                  </motion.div>
                )}

                {currentStep === 2 && (
                  <motion.div
                    key="privy"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="h-full flex flex-col items-center justify-center space-y-4"
                  >
                    <GlassCard className="w-full">
                      <div className="py-8 px-6">
                        <h3 className="text-lg font-bold text-white mb-4 text-center">Sign in to claim</h3>
                        <div className="space-y-3">
                          <button className="w-full flex items-center justify-center gap-3 bg-white/10 border border-white/20 text-white py-3 px-4 rounded-lg hover:bg-white/20 transition-colors">
                            <Mail size={20} />
                            <span>Continue with Email</span>
                          </button>
                          <button className="w-full flex items-center justify-center gap-3 bg-white/10 border border-white/20 text-white py-3 px-4 rounded-lg hover:bg-white/20 transition-colors">
                            <Smartphone size={20} />
                            <span>Continue with Phone</span>
                          </button>
                        </div>
                        <p className="text-xs text-[#94A3B8] text-center mt-4">Powered by Privy</p>
                      </div>
                    </GlassCard>
                  </motion.div>
                )}

                {currentStep === 3 && (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="h-full flex flex-col items-center justify-center space-y-6"
                  >
                    <GlassCard className="w-full">
                      <div className="text-center py-8">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                          className="w-16 h-16 bg-[#10B981] rounded-full flex items-center justify-center mx-auto mb-4"
                        >
                          <CheckCircle className="text-white" size={32} />
                        </motion.div>
                        <h3 className="text-xl font-bold text-white mb-2">Gift Claimed!</h3>
                        <p className="text-sm text-[#94A3B8] mb-4">$50.00 USDC has been added to your wallet</p>
                        <div className="text-xs text-[#64748B]">Transaction confirmed on Solana</div>
                      </div>
                    </GlassCard>
                  </motion.div>
                )}
              </AnimatePresence>
            </PhoneMockup>

            {/* Controls */}
            <div className="flex items-center gap-4">
              {/* Step indicators */}
              <div className="flex items-center gap-2">
                {steps.map((step) => (
                  <button
                    key={step}
                    onClick={() => {
                      setCurrentStep(step);
                      setIsUnwrapping(step === 0);
                    }}
                    className={`w-2 h-2 rounded-full transition-all ${
                      currentStep === step
                        ? 'w-6 bg-[#06B6D4]'
                        : 'bg-white/20 hover:bg-white/40'
                    }`}
                    aria-label={`Step ${step + 1}`}
                  />
                ))}
              </div>

              {/* Reset button */}
              <button
                onClick={resetAnimation}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors text-sm"
                aria-label="Reset animation"
              >
                <RefreshCw size={16} />
                <span>Replay</span>
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default RecipientExperience;
