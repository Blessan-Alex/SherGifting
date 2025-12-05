import React from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';

interface DecorationItem {
  src: string;
  alt: string;
  position: {
    top?: string;
    bottom?: string;
    left?: string;
    right?: string;
  };
  size: {
    width: string;
    height: string;
  };
  opacity: number;
  rotation: number;
  animationDelay: number;
  animationDuration: number;
  parallaxSpeed: number;
  zIndex: number;
  blur?: number;
}

const ChristmasDecorations: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();
  
  // Use window scroll instead of container ref to avoid jitter
  const { scrollYProgress } = useScroll();

  // Decoration configurations following UI/UX principles:
  // - Asymmetric distribution for visual interest
  // - Different sizes for depth perception
  // - Varied opacity for layering (reduced for better blending)
  // - Strategic placement to not block content
  const decorations: DecorationItem[] = [
    {
      src: '/assets/gifts.png',
      alt: 'Christmas gifts',
      position: { top: '8%', right: '5%' },
      size: { width: '120px', height: 'auto' },
      opacity: 0.15, // Reduced for better blending
      rotation: -12,
      animationDelay: 0,
      animationDuration: 15,
      parallaxSpeed: 0.3,
      zIndex: 1,
      blur: 1, // Added blur for better blending
    },
    {
      src: '/assets/gifts2.png',
      alt: 'Christmas gifts',
      position: { top: '25%', left: '3%' },
      size: { width: '100px', height: 'auto' },
      opacity: 0.12, // Reduced for better blending
      rotation: 8,
      animationDelay: 2,
      animationDuration: 18,
      parallaxSpeed: 0.5,
      zIndex: 1,
      blur: 2, // Increased blur
    },
    {
      src: '/assets/gingerbread.png',
      alt: 'Gingerbread cookie',
      position: { bottom: '35%', right: '8%' },
      size: { width: '90px', height: 'auto' },
      opacity: 0.18, // Reduced for better blending
      rotation: -5,
      animationDelay: 1,
      animationDuration: 12,
      parallaxSpeed: 0.4,
      zIndex: 2,
      blur: 1.5, // Added blur
    },
    {
      src: '/assets/gloves.png',
      alt: 'Winter gloves',
      position: { top: '50%', left: '2%' },
      size: { width: '80px', height: 'auto' },
      opacity: 0.14, // Reduced for better blending
      rotation: 15,
      animationDelay: 3,
      animationDuration: 16,
      parallaxSpeed: 0.35,
      zIndex: 1,
      blur: 2.5, // Increased blur
    },
    {
      src: '/assets/snowman.png',
      alt: 'Snowman',
      position: { bottom: '15%', left: '6%' },
      size: { width: '110px', height: 'auto' },
      opacity: 0.16, // Reduced for better blending
      rotation: -8,
      animationDelay: 1.5,
      animationDuration: 20,
      parallaxSpeed: 0.25,
      zIndex: 2,
      blur: 1.5, // Added blur
    },
  ];

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden z-[1]"
      aria-hidden="true"
    >
      {decorations.map((decoration, index) => {
        // Parallax effect based on scroll - smoother with clamp
        const parallaxY = useTransform(
          scrollYProgress,
          [0, 1],
          [0, decoration.parallaxSpeed * 50], // Reduced multiplier for smoother motion
          { clamp: true }
        );
        
        // Subtle opacity change on scroll for depth - smoother transition
        const scrollOpacity = useTransform(
          scrollYProgress,
          [0, 0.3, 0.7, 1],
          [
            decoration.opacity,
            decoration.opacity * 1.1,
            decoration.opacity * 1.15,
            decoration.opacity * 0.9,
          ],
          { clamp: true }
        );

        return (
          <motion.div
            key={index}
            className="absolute"
            style={{
              ...decoration.position,
              zIndex: decoration.zIndex,
            }}
            // Separate parallax from floating animation to avoid conflicts
            animate={
              shouldReduceMotion
                ? {}
                : {
                    // Only animate rotation and scale, NOT y (that's handled by parallax)
                    rotate: [
                      decoration.rotation,
                      decoration.rotation + 2,
                      decoration.rotation,
                      decoration.rotation - 1.5,
                      decoration.rotation,
                    ],
                    scale: [1, 1.03, 1, 0.99, 1],
                  }
            }
            transition={{
              duration: decoration.animationDuration,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: decoration.animationDelay,
            }}
          >
            <motion.img
              src={decoration.src}
              alt={decoration.alt}
              className="select-none"
              style={{
                width: decoration.size.width,
                height: decoration.size.height,
                filter: decoration.blur
                  ? `blur(${decoration.blur}px) brightness(1.05) saturate(0.9)`
                  : 'brightness(1.05) saturate(0.9)',
                mixBlendMode: 'overlay', // Changed to overlay for better blending
                willChange: 'transform',
                imageRendering: 'auto',
                // Apply parallax and opacity transforms on the image
                y: shouldReduceMotion ? 0 : parallaxY,
                opacity: shouldReduceMotion ? decoration.opacity : scrollOpacity,
              }}
              loading="lazy"
              decoding="async"
            />
          </motion.div>
        );
      })}
    </div>
  );
};

export default ChristmasDecorations;


