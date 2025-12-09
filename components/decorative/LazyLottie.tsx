import React, { useRef, useEffect, useState, useMemo } from 'react';
import { motion, useTransform, useReducedMotion } from 'framer-motion';
import { useScrollMotion } from '../../context/ScrollMotionProvider';
import { useEffectsPolicy } from '../../hooks/useEffectsPolicy';

interface LazyLottieProps {
  src: string;
  position: {
    top?: string;
    bottom?: string;
    left?: string;
    right?: string;
  };
  size: {
    width: string;
    height: string;
    mobileWidth?: string;
    mobileHeight?: string;
  };
  opacity?: number;
  parallaxSpeed?: number;
  zIndex?: number;
  loop?: boolean;
  autoplay?: boolean;
  speed?: number;
  className?: string;
  blendMode?: 'normal' | 'multiply' | 'screen' | 'overlay' | 'soft-light';
  /** Optional static image path to show as placeholder */
  poster?: string;
  /** Priority: 'high' loads immediately, 'low' waits for idle/scroll */
  priority?: 'high' | 'low';
}

/**
 * Lazy-loaded Lottie animation wrapper.
 * 
 * - Shows static poster image by default (prevents layout shift)
 * - Uses IntersectionObserver to detect when near viewport
 * - Dynamically imports Lottie player code when needed
 * - Respects effects policy (shows static only if heavy effects disabled)
 * - High priority: loads immediately when in view
 * - Low priority: waits for requestIdleCallback or scroll
 */
const LazyLottie: React.FC<LazyLottieProps> = ({
  src,
  position,
  size,
  opacity = 0.3,
  parallaxSpeed = 0.2,
  zIndex = 1,
  loop = true,
  autoplay = true,
  speed = 1,
  className = '',
  blendMode = 'soft-light',
  poster,
  priority = 'low',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const { allowHeavyEffects } = useEffectsPolicy();
  const [isInView, setIsInView] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(priority === 'high');
  const [LottieComponent, setLottieComponent] = useState<React.ComponentType<any> | null>(null);
  const [animationData, setAnimationData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Use centralized scroll tracking from context (no element-specific tracking needed)
  const { scrollYProgress } = useScrollMotion();

  // IntersectionObserver to detect when component is near viewport
  useEffect(() => {
    if (!containerRef.current || shouldLoad) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            // For low priority, wait for idle callback
            if (priority === 'low') {
              const loadOnIdle = () => {
                if ('requestIdleCallback' in window) {
                  requestIdleCallback(() => {
                    setShouldLoad(true);
                  }, { timeout: 2000 });
                } else {
                  // Fallback for browsers without requestIdleCallback
                  setTimeout(() => {
                    setShouldLoad(true);
                  }, 1000);
                }
              };
              loadOnIdle();
            } else {
              setShouldLoad(true);
            }
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '200px', // Start loading when 200px away from viewport
      }
    );

    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
    };
  }, [priority, shouldLoad]);

  // Load Lottie component and animation data when shouldLoad is true
  useEffect(() => {
    if (!shouldLoad || !allowHeavyEffects) return;

    const loadLottie = async () => {
      try {
        // Dynamically import Lottie player
        const LottieModule = await import('lottie-react');
        const Lottie = LottieModule.default;
        setLottieComponent(() => Lottie);

        // Load animation data
        const response = await fetch(src);
        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.statusText}`);
        }

        // Handle .lottie (ZIP) files
        if (src.endsWith('.lottie')) {
          const JSZip = (await import('jszip')).default;
          const arrayBuffer = await response.arrayBuffer();
          const zip = await JSZip.loadAsync(arrayBuffer);
          
          const animationFiles = Object.keys(zip.files).filter(
            f => f.startsWith('animations/') && f.endsWith('.json')
          );
          
          if (animationFiles.length === 0) {
            throw new Error('No animation JSON found in .lottie file');
          }
          
          const animationPath = animationFiles[0];
          const animationFile = zip.file(animationPath);
          
          if (!animationFile) {
            throw new Error(`Animation file not found: ${animationPath}`);
          }
          
          const animationJson = JSON.parse(await animationFile.async('string'));
          setAnimationData(animationJson);
        } else {
          // Regular JSON file
          const data = await response.json();
          setAnimationData(data);
        }
      } catch (err) {
        console.error(`Failed to load Lottie animation from ${src}:`, err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    };

    loadLottie();
  }, [shouldLoad, allowHeavyEffects, src]);

  // Parallax effect
  const parallaxY = useTransform(
    scrollYProgress,
    [0, 1],
    [0, parallaxSpeed * 30],
    { clamp: true }
  );

  // Opacity on scroll
  const scrollOpacity = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [opacity, opacity * 1.1, opacity * 0.9],
    { clamp: true }
  );

  // Memoize container style to prevent re-renders
  const containerStyle = useMemo(
    () => ({
      ...position,
      zIndex,
      width: size.width,
      height: size.height,
    }),
    [position, zIndex, size.width, size.height]
  );

  // If heavy effects are not allowed, show static poster or nothing
  if (!allowHeavyEffects) {
    if (poster) {
      return (
        <div
          ref={containerRef}
          className={`absolute pointer-events-none ${className}`}
          style={{
            ...containerStyle,
            opacity,
          }}
          aria-hidden="true"
        >
          <img
            src={poster}
            alt=""
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              mixBlendMode: blendMode,
            }}
          />
        </div>
      );
    }
    return null;
  }

  // Show static poster while loading
  const showPoster = !LottieComponent || !animationData || error;

  if (error) {
    // Silently fail - show poster if available, otherwise nothing
    if (poster) {
      return (
        <div
          ref={containerRef}
          className={`absolute pointer-events-none ${className}`}
          style={{
            ...containerStyle,
            opacity,
          }}
          aria-hidden="true"
        >
          <img
            src={poster}
            alt=""
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              mixBlendMode: blendMode,
            }}
          />
        </div>
      );
    }
    return null;
  }

  return (
    <motion.div
      ref={containerRef}
      className={`absolute pointer-events-none ${className}`}
      style={{
        ...containerStyle,
        y: shouldReduceMotion ? 0 : parallaxY,
        opacity: shouldReduceMotion ? opacity : scrollOpacity,
      }}
      aria-hidden="true"
    >
      <div
        className="w-full h-full lottie-container"
        style={{
          width: '100%',
          height: '100%',
          mixBlendMode: blendMode,
          filter: 'brightness(1.1)',
        }}
      >
        {showPoster && poster ? (
          <img
            src={poster}
            alt=""
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
            }}
          />
        ) : LottieComponent && animationData ? (
          <LottieComponent
            animationData={animationData}
            loop={loop}
            autoplay={autoplay && !shouldReduceMotion}
            speed={speed}
            style={{
              width: '100%',
              height: '100%',
            }}
            className="lottie-animation"
          />
        ) : null}
      </div>
    </motion.div>
  );
};

export default React.memo(LazyLottie);

