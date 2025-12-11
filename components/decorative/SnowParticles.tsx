import React, { useRef, useEffect } from 'react';
import { useReducedMotion } from '../../lib/animations';
import { useTheme } from '../../context/ThemeContext';
import { useEffectsPolicy } from '../../hooks/useEffectsPolicy';

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

interface SnowParticlesProps {
  intensity?: 'low' | 'medium' | 'high';
  speed?: number;
  size?: { min: number; max: number };
  color?: string;
  className?: string;
}

/**
 * SnowParticles - Canvas-based snow particle animation.
 * 
 * Performance optimizations:
 * - Mount policy: Only mounts if allowHeavyEffects is true (disabled on mobile/reduced motion)
 * - IntersectionObserver: Pauses animation when offscreen (stops RAF loop)
 * - FPS throttling: Capped at 30fps for decorative background
 * - Reduced particle count on mobile (if mounted)
 * 
 * Mount policy over pause logic: If effects shouldn't run, component doesn't mount at all.
 */
const SnowParticles: React.FC<SnowParticlesProps> = ({
  intensity = 'medium',
  speed,
  size = { min: 2, max: 6 },
  color,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const shouldReduceMotion = useReducedMotion();
  const { allowHeavyEffects, isMobile } = useEffectsPolicy();

  // Don't mount if heavy effects are not allowed
  if (!allowHeavyEffects) {
    return null;
  }

  // Get particle count based on intensity and device
  const getParticleCount = () => {
    if (shouldReduceMotion) return 0;
    // Mobile: prefer not mounting, but if mounted, use fewer particles
    if (isMobile) {
      switch (intensity) {
        case 'low': return 5;
        case 'high': return 8;
        case 'medium':
        default: return 6;
      }
    }
    // Desktop: reduced counts
    switch (intensity) {
      case 'low': return 8;
      case 'high': return 12;
      case 'medium':
      default: return 10;
    }
  };

  // Get snow color based on theme
  const getSnowColor = () => {
    if (color) return color;
    if (theme === 'christmas') return 'rgba(255, 255, 255, 0.9)';
    if (theme === 'newyear') return 'rgba(255, 215, 0, 0.8)';
    return 'rgba(255, 255, 255, 0.7)';
  };

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    // Performance optimizations
    ctx.imageSmoothingEnabled = false;

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      
      ctx.scale(dpr, dpr);
    };

    resizeCanvas();
    const resizeHandler = () => resizeCanvas();
    window.addEventListener('resize', resizeHandler, { passive: true });

    // Initialize particles
    const particleCount = getParticleCount();
    const particles: SnowParticle[] = [];
    const canvasWidth = canvas.width / (window.devicePixelRatio || 1);
    
    for (let i = 0; i < particleCount; i++) {
      const particle = new SnowParticle(canvasWidth);
      // Override size if provided
      if (size) {
        particle.size = Math.random() * (size.max - size.min) + size.min;
      }
      // Override speed if provided
      if (speed !== undefined) {
        particle.speed = speed;
      }
      particles.push(particle);
    }

    const snowColor = getSnowColor();
    let animationFrameId: number | null = null;
    let lastTime = performance.now();
    const targetFPS = 20; // Reduced to 20fps for better performance
    const frameInterval = 1000 / targetFPS;
    let isRunning = false;

    // Explicit start/stop methods
    const start = () => {
      if (isRunning) return;
      isRunning = true;
      lastTime = performance.now();
      animationFrameId = requestAnimationFrame(animate);
    };

    const stop = () => {
      if (!isRunning) return;
      isRunning = false;
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
    };

    const animate = (currentTime: number) => {
      if (!isRunning) return;

      const deltaTime = currentTime - lastTime;
      
      // FPS throttle: only draw if enough time has passed
      if (deltaTime >= frameInterval) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const canvasWidth = canvas.width / (window.devicePixelRatio || 1);
        const canvasHeight = canvas.height / (window.devicePixelRatio || 1);

        particles.forEach((particle) => {
          particle.update(canvasWidth, canvasHeight, !shouldReduceMotion);
          particle.draw(ctx, snowColor);
        });

        lastTime = currentTime - (deltaTime % frameInterval);
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    // IntersectionObserver to pause when offscreen
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            start();
          } else {
            stop();
          }
        });
      },
      {
        rootMargin: '50px', // Start/stop 50px before entering/exiting viewport
      }
    );

    observer.observe(containerRef.current);

    // Start animation initially if visible
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
      if (isVisible) {
        start();
      }
    }

    return () => {
      window.removeEventListener('resize', resizeHandler);
      observer.disconnect();
      stop();
    };
  }, [intensity, speed, size, color, theme, shouldReduceMotion]);

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none">
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 ${className}`}
        style={{ 
          willChange: 'transform',
          imageRendering: 'pixelated',
        }}
        aria-hidden="true"
      />
    </div>
  );
};

// Memoize to prevent unnecessary re-renders when parent re-renders
// Props are stable (intensity, speed, size, color, className don't change frequently)
export default React.memo(SnowParticles, (prevProps, nextProps) => {
  const sizeEqual = 
    prevProps.size === nextProps.size ||
    (prevProps.size?.min === nextProps.size?.min && prevProps.size?.max === nextProps.size?.max);
  
  return (
    prevProps.intensity === nextProps.intensity &&
    prevProps.speed === nextProps.speed &&
    sizeEqual &&
    prevProps.color === nextProps.color &&
    prevProps.className === nextProps.className
  );
});






