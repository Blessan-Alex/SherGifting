import React, { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useTheme } from "../context/ThemeContext";
import { useEffectsPolicy } from "../hooks/useEffectsPolicy";

interface CursorGlowProps {
  children: React.ReactNode;
  variant?: 'default' | 'spotlight';
}

/**
 * CursorGlow component that follows the cursor with a radial gradient glow.
 * 
 * Performance optimizations:
 * - No continuous RAF loop: updates only on pointer move, max once per frame
 * - Uses CSS variables for positioning (no state-driven re-renders)
 * - Disabled entirely on mobile and reduced motion (mount policy)
 */
export function CursorGlow({ children, variant = 'default' }: CursorGlowProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const posRef = useRef({ x: 0, y: 0 });
  const rafIdRef = useRef<number | null>(null);
  const { theme } = useTheme();
  const shouldReduceMotion = useReducedMotion();
  const { allowHeavyEffects } = useEffectsPolicy();

  // Don't mount if heavy effects are not allowed (mount policy over pause logic)
  if (!allowHeavyEffects) {
    return <>{children}</>;
  }

  useEffect(() => {
    const container = containerRef.current;
    const glow = glowRef.current;
    if (!container || !glow) return;

    const onPointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      // Store position in ref (no state update = no re-render)
      posRef.current = { 
        x: e.clientX - rect.left, 
        y: e.clientY - rect.top 
      };
      
      // Schedule single rAF update (batches multiple moves into one frame)
      if (rafIdRef.current === null) {
        rafIdRef.current = requestAnimationFrame(() => {
          // Write CSS variables directly (no React re-render)
          glow.style.setProperty('--cursor-x', `${posRef.current.x}px`);
          glow.style.setProperty('--cursor-y', `${posRef.current.y}px`);
          rafIdRef.current = null;
        });
      }
    };

    container.addEventListener("pointermove", onPointerMove, { passive: true });
    
    return () => {
      container.removeEventListener("pointermove", onPointerMove);
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, []);

  // Get gradient colors based on theme and variant
  const getGradientColors = () => {
    const isSpotlight = variant === 'spotlight';
    const size = isSpotlight ? 800 : 600;

    if (theme === 'christmas') {
      return {
        size,
        colors: isSpotlight
          ? `rgba(255,215,0,0.3), rgba(235,106,70,0.15) 35%, rgba(0,0,0,0) 60%`
          : `rgba(255,178,23,0.22), rgba(235,106,70,0.10) 35%, rgba(0,0,0,0) 60%`,
      };
    }

    if (theme === 'newyear') {
      return {
        size,
        colors: isSpotlight
          ? `rgba(255,215,0,0.35), rgba(33,217,211,0.18) 40%, rgba(0,0,0,0) 65%`
          : `rgba(255,178,23,0.22), rgba(33,217,211,0.12) 40%, rgba(0,0,0,0) 60%`,
      };
    }

    // Classic theme
    return {
      size,
      colors: isSpotlight
        ? `rgba(255,178,23,0.28), rgba(33,217,211,0.14) 35%, rgba(0,0,0,0) 60%`
        : `rgba(255,178,23,0.22), rgba(33,217,211,0.10) 35%, rgba(0,0,0,0) 60%`,
    };
  };

  const gradient = getGradientColors();
  const blurClass = variant === 'spotlight' ? 'blur-[100px]' : 'blur-3xl';
  const opacityClass = variant === 'spotlight' ? 'opacity-70' : 'opacity-60';

  return (
    <div ref={containerRef} className="relative overflow-visible">
      <motion.div
        ref={glowRef}
        className={`pointer-events-none absolute -inset-24 ${blurClass} ${opacityClass}`}
        style={{
          // Use CSS variables for positioning (updated via rAF, no React re-renders)
          background: `radial-gradient(${gradient.size}px circle at var(--cursor-x, 50%) var(--cursor-y, 50%), ${gradient.colors})`,
          // Smooth transition for CSS variable changes
          transition: shouldReduceMotion ? 'none' : 'background 0.1s ease-out',
        }}
        animate={
          !shouldReduceMotion && variant === 'spotlight'
            ? {
                opacity: [0.6, 0.75, 0.6],
              }
            : {}
        }
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      {children}
    </div>
  );
}

// Memoize to prevent unnecessary re-renders when parent re-renders
// Props are stable (variant doesn't change frequently, children handled separately)
export default React.memo(CursorGlow, (prevProps, nextProps) => {
  return prevProps.variant === nextProps.variant;
});
