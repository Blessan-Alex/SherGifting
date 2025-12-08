import React, { useRef } from 'react';
import { useScroll, useTransform, motion, useReducedMotion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { useMotifConfig } from '../hooks/useMotifConfig';
import { useEffectsPolicy } from '../hooks/useEffectsPolicy';
import SnowParticles from './decorative/SnowParticles';
import TwinklingLights from './decorative/TwinklingLights';

// Snow particle class
class SnowParticle {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  drift: number;
  driftSpeed: number;

  constructor(canvasWidth: number) {
    this.x = Math.random() * canvasWidth;
    this.y = Math.random() * -100; // Start above viewport
    this.size = Math.random() * 4 + 2; // 2-6px
    this.speed = Math.random() * 2 + 0.5; // 0.5-2.5
    this.opacity = Math.random() * 0.5 + 0.3; // 0.3-0.8
    this.drift = Math.random() * 0.5 - 0.25; // -0.25 to 0.25
    this.driftSpeed = Math.random() * 0.02 + 0.01;
  }

  update(canvasWidth: number, canvasHeight: number, driftEnabled: boolean) {
    this.y += this.speed;
    if (driftEnabled) {
      this.x += this.drift;
      this.drift += Math.sin(Date.now() * this.driftSpeed) * 0.1;
    }

    // Reset if off screen
    if (this.y > canvasHeight) {
      this.y = -10;
      this.x = Math.random() * canvasWidth;
    }
    if (this.x < 0 || this.x > canvasWidth) {
      this.x = Math.random() * canvasWidth;
    }
  }

  draw(ctx: CanvasRenderingContext2D, color: string) {
    ctx.save();
    ctx.globalAlpha = this.opacity;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

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

  // Note: Using local useScroll with target for element-specific scroll tracking.
  // This component tracks scroll relative to its own container, not the page.
  // For page-level scroll, components should use useScrollMotion() from context.
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  // Parallax transforms for different layers
  const snowY = useTransform(scrollYProgress, [0, 1], [0, -40]);
  const bokehY = useTransform(scrollYProgress, [0, 1], [0, -20]);
  const orbY = useTransform(scrollYProgress, [0, 1], [0, -10]);

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

      {/* Subtle gradient orbs with parallax */}
      <motion.div
        className="absolute top-[10%] right-[10%] w-[200px] h-[200px] rounded-full blur-[60px]"
        style={{
          background:
            theme === 'christmas'
              ? 'radial-gradient(circle, rgba(235,106,70,0.15) 0%, transparent 70%)'
              : theme === 'newyear'
              ? 'radial-gradient(circle, rgba(33,217,211,0.15) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(190,18,60,0.1) 0%, transparent 70%)',
          y: orbY,
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
          y: orbY,
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
          y: orbY,
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
