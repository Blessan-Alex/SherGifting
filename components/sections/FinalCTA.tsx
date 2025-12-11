import React, { useEffect, useState } from 'react';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import GlowButton from '../UI/GlowButton';
import { useTheme } from '../../context/ThemeContext';

const FinalCTA: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { theme } = useTheme();
  const shouldReduceMotion = useReducedMotion();
  const [sparkleTrigger, setSparkleTrigger] = useState(0);

  const handleCreateGift = async () => {
    try {
      await login();
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  // Periodic sparkle trigger
  useEffect(() => {
    if (shouldReduceMotion) return;
    
    const interval = setInterval(() => {
      setSparkleTrigger((prev) => prev + 1);
    }, 3000);

    return () => clearInterval(interval);
  }, [shouldReduceMotion]);

  // Get theme-aware colors
  const getColors = () => {
    if (theme === 'christmas') {
      return {
        primary: '#EB6A46',
        secondary: '#EF4444',
        accent: '#FCD34D',
        glow: 'rgba(235, 106, 70, 0.3)',
        bg1: 'rgba(235, 106, 70, 0.1)',
        bg2: 'rgba(252, 211, 77, 0.1)',
        bg3: 'rgba(6, 182, 212, 0.1)',
      };
    }
    if (theme === 'newyear') {
      return {
        primary: '#FCD34D',
        secondary: '#F59E0B',
        accent: '#21D9D3',
        glow: 'rgba(252, 211, 77, 0.3)',
        bg1: 'rgba(252, 211, 77, 0.1)',
        bg2: 'rgba(33, 217, 211, 0.1)',
        bg3: 'rgba(255, 178, 23, 0.1)',
      };
    }
    return {
      primary: '#FFB217',
      secondary: '#BE123C',
      accent: '#06B6D4',
      glow: 'rgba(255, 178, 23, 0.3)',
      bg1: 'rgba(255, 178, 23, 0.1)',
      bg2: 'rgba(190, 18, 60, 0.1)',
      bg3: 'rgba(6, 182, 212, 0.1)',
    };
  };

  const colors = getColors();

  // Generate sparkle particles
  const sparkles = Array.from({ length: 6 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    top: Math.random() * 100,
    delay: Math.random() * 2,
    size: Math.random() * 4 + 3,
  }));

  return (
    <section className="relative py-16 lg:py-24 overflow-hidden">
      {/* Enhanced background with animated gradient */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, ${colors.bg1} 0%, ${colors.bg2} 50%, ${colors.bg3} 100%)`,
        }}
        animate={!shouldReduceMotion ? {
          opacity: [0.3, 0.5, 0.3],
        } : {}}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      {/* Animated gradient orbs */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full blur-3xl"
        style={{ backgroundColor: colors.bg1 }}
        animate={!shouldReduceMotion ? {
          x: [0, 30, 0],
          y: [0, 20, 0],
          scale: [1, 1.2, 1],
        } : {}}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl"
        style={{ backgroundColor: colors.bg2 }}
        animate={!shouldReduceMotion ? {
          x: [0, -30, 0],
          y: [0, -20, 0],
          scale: [1, 1.1, 1],
        } : {}}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 2,
        }}
      />

      {/* Sparkle particles */}
      <AnimatePresence>
        {!shouldReduceMotion && sparkles.map((sparkle) => (
          <motion.div
            key={`sparkle-${sparkle.id}-${sparkleTrigger}`}
            className="absolute rounded-full"
            style={{
              left: `${sparkle.left}%`,
              top: `${sparkle.top}%`,
              width: `${sparkle.size}px`,
              height: `${sparkle.size}px`,
              background: `radial-gradient(circle, ${colors.glow} 0%, transparent 70%)`,
              boxShadow: `0 0 ${sparkle.size * 2}px ${colors.glow}`,
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: [0, 1, 0], scale: [0, 1.5, 0] }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 2,
              delay: sparkle.delay,
              ease: 'easeOut',
            }}
          />
        ))}
      </AnimatePresence>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Festive border container */}
        <motion.div
          className="relative rounded-3xl p-[2px]"
          style={{
            backgroundImage: theme === 'christmas'
              ? 'linear-gradient(90deg, #EB6A46 0%, #EF4444 25%, #FCD34D 50%, #EF4444 75%, #EB6A46 100%)'
              : theme === 'newyear'
              ? 'linear-gradient(90deg, #FCD34D 0%, #F59E0B 25%, #21D9D3 50%, #F59E0B 75%, #FCD34D 100%)'
              : 'linear-gradient(90deg, #FFB217 0%, #BE123C 25%, #06B6D4 50%, #BE123C 75%, #FFB217 100%)',
            backgroundSize: '200% 100%',
          }}
          animate={!shouldReduceMotion ? {
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
          } : {}}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          <div className="bg-[#0B1120] rounded-3xl p-12">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-300px' }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <h2 className="text-h2 font-bold text-white mb-6">
                Be the <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#BE123C] via-[#FFB217] to-[#BE123C] bg-size-200 animate-gradient">Coolest Friend</span> They Have.
              </h2>
              <p className="text-body-lg text-[#94A3B8] text-max-width mx-auto mb-8 leading-relaxed">
                Send your first gift in 60 seconds. It's free to try.
              </p>
              <div className="flex justify-center">
                <GlowButton
                  onClick={handleCreateGift}
                  variant="primary"
                  className="text-lg px-8 py-4"
                >
                  Start Gifting Now
                </GlowButton>
              </div>
              <p className="text-sm text-[#64748B] mt-6">
                Free to try
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FinalCTA;
