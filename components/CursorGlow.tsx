import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useTheme } from "../context/ThemeContext";
import { lerp } from "../lib/animations";

interface CursorGlowProps {
  children: React.ReactNode;
  variant?: 'default' | 'spotlight';
}

export function CursorGlow({ children, variant = 'default' }: CursorGlowProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [currentPos, setCurrentPos] = useState({ x: 0, y: 0 });
  const { theme } = useTheme();
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let raf = 0;
    const onMove = (e: MouseEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        setPos({ x: e.clientX - r.left, y: e.clientY - r.top });
      });
    };

    el.addEventListener("mousemove", onMove);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("mousemove", onMove);
    };
  }, []);

  // Smooth interpolation for cursor position
  useEffect(() => {
    if (shouldReduceMotion) {
      setCurrentPos(pos);
      return;
    }

    let raf = 0;
    const updatePosition = () => {
      setCurrentPos((prev) => ({
        x: lerp(prev.x, pos.x, 0.15),
        y: lerp(prev.y, pos.y, 0.15),
      }));
      raf = requestAnimationFrame(updatePosition);
    };

    raf = requestAnimationFrame(updatePosition);
    return () => cancelAnimationFrame(raf);
  }, [pos.x, pos.y, shouldReduceMotion]);

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
    <div ref={ref} className="relative overflow-visible">
      <motion.div
        className={`pointer-events-none absolute -inset-24 ${blurClass} ${opacityClass}`}
        style={{
          background: `radial-gradient(${gradient.size}px circle at ${currentPos.x}px ${currentPos.y}px, ${gradient.colors})`,
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

export default CursorGlow;
