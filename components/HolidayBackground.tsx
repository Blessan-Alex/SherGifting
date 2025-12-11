import React, { useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { useMotifConfig } from '../hooks/useMotifConfig';
import { useEffectsPolicy } from '../hooks/useEffectsPolicy';
import SnowParticles from './decorative/SnowParticles';
import TwinklingLights from './decorative/TwinklingLights';

interface HolidayBackgroundProps {
  snowIntensity?: 'low' | 'medium' | 'high';
  lightIntensity?: 'low' | 'medium' | 'high';
}

const HolidayBackground: React.FC<HolidayBackgroundProps> = ({
  snowIntensity: propSnowIntensity,
  lightIntensity: propLightIntensity,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const shouldReduceMotion = useReducedMotion();
  const { config } = useMotifConfig();
  const { allowHeavyEffects } = useEffectsPolicy();
  
  // Use config if available, otherwise use props or defaults
  const snowIntensity = propSnowIntensity || config.snow.intensity;
  const lightIntensity = propLightIntensity || config.lights.intensity;

  // Theme-based configuration
  const shouldShowSnow = config.snow.enabled && (theme === 'christmas' || theme === 'newyear');
  const shouldShowBokeh = config.lights.enabled && theme !== 'classic';


  return (
    <div ref={containerRef} className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Snow particles - only mount if heavy effects allowed */}
      {shouldShowSnow && allowHeavyEffects && (
        <SnowParticles intensity={snowIntensity} />
      )}

      {/* Twinkling lights - only mount if heavy effects allowed */}
      {shouldShowBokeh && allowHeavyEffects && (
        <TwinklingLights intensity={lightIntensity} />
      )}

      {/* Subtle gradient orbs - static positioning, CSS-only animations */}
      <motion.div
        className="absolute top-[10%] right-[10%] w-[200px] h-[200px] rounded-full blur-[60px]"
        style={{
          background:
            theme === 'christmas'
              ? 'radial-gradient(circle, rgba(235,106,70,0.15) 0%, transparent 70%)'
              : theme === 'newyear'
              ? 'radial-gradient(circle, rgba(33,217,211,0.15) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(190,18,60,0.1) 0%, transparent 70%)',
        }}
        animate={
          !shouldReduceMotion
            ? {
                opacity: [0.15, 0.25, 0.15],
                scale: [1, 1.1, 1],
              }
            : {}
        }
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="absolute bottom-[15%] left-[15%] w-[150px] h-[150px] rounded-full blur-[50px]"
        style={{
          background:
            theme === 'christmas' || theme === 'newyear'
              ? 'radial-gradient(circle, rgba(255,215,0,0.15) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(252,211,77,0.1) 0%, transparent 70%)',
        }}
        animate={
          !shouldReduceMotion
            ? {
                opacity: [0.15, 0.25, 0.15],
                scale: [1, 1.1, 1],
              }
            : {}
        }
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 2,
        }}
      />
      <motion.div
        className="absolute top-[50%] left-[50%] w-[180px] h-[180px] rounded-full blur-[55px]"
        style={{
          background:
            theme === 'newyear'
              ? 'radial-gradient(circle, rgba(33,217,211,0.2) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 70%)',
        }}
        animate={
          !shouldReduceMotion
            ? {
                opacity: [0.15, 0.25, 0.15],
                scale: [1, 1.1, 1],
              }
            : {}
        }
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 4,
        }}
      />
    </div>
  );
};

export default HolidayBackground;
