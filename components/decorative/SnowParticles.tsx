import React, { useRef, useEffect } from 'react';
import { useReducedMotion } from '../../lib/animations';
import { useTheme } from '../../context/ThemeContext';

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

const SnowParticles: React.FC<SnowParticlesProps> = ({
  intensity = 'medium',
  speed,
  size = { min: 2, max: 6 },
  color,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();
  const shouldReduceMotion = useReducedMotion();

  // Get particle count based on intensity
  const getParticleCount = () => {
    if (shouldReduceMotion) return 5;
    switch (intensity) {
      case 'low': return 20;
      case 'high': return 60;
      case 'medium':
      default: return 40;
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
    if (!canvasRef.current) return;

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
    let animationFrameId: number;
    let lastTime = performance.now();
    const targetFPS = 60;
    const frameInterval = 1000 / targetFPS;

    const animate = (currentTime: number) => {
      const deltaTime = currentTime - lastTime;
      
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

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resizeHandler);
      cancelAnimationFrame(animationFrameId);
    };
  }, [intensity, speed, size, color, theme, shouldReduceMotion]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{ 
        willChange: 'transform',
        imageRendering: 'pixelated',
      }}
      aria-hidden="true"
    />
  );
};

export default SnowParticles;




