import React, { useRef, useEffect, useState } from 'react';
import { useReducedMotion } from 'framer-motion';

interface LottieAnimationProps {
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
  zIndex?: number;
  loop?: boolean;
  autoplay?: boolean;
  speed?: number;
  className?: string;
  blendMode?: 'normal' | 'multiply' | 'screen' | 'overlay' | 'soft-light';
}

const LottieAnimation: React.FC<LottieAnimationProps> = React.memo(({
  src,
  position,
  size,
  opacity = 0.3,
  zIndex = 1,
  loop = true,
  autoplay = true,
  speed = 1,
  className = '',
  blendMode = 'soft-light',
}) => {
  const lottieRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const [LottieComponent, setLottieComponent] = useState<React.ComponentType<any> | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [animationData, setAnimationData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Load Lottie component and animation data - handle both .json and .lottie (ZIP) files
  useEffect(() => {
    const loadAnimation = async () => {
      try {
        // Dynamically import Lottie player
        const LottieModule = await import('lottie-react');
        const Lottie = LottieModule.default;
        setLottieComponent(() => Lottie);

        const response = await fetch(src);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.statusText}`);
        }

        // Check if it's a .lottie file (ZIP archive)
        if (src.endsWith('.lottie')) {
          const JSZip = (await import('jszip')).default;
          const arrayBuffer = await response.arrayBuffer();
          const zip = await JSZip.loadAsync(arrayBuffer);
          
          // Find the animation JSON file
          // First, try to find any JSON file in the animations folder
          const animationFiles = Object.keys(zip.files).filter(
            f => f.startsWith('animations/') && f.endsWith('.json')
          );
          
          if (animationFiles.length === 0) {
            throw new Error('No animation JSON found in .lottie file');
          }
          
          // Use the first animation file found
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
        
        setIsLoaded(true);
        setError(null);
      } catch (err) {
        console.error(`Failed to load Lottie animation from ${src}:`, err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    };

    loadAnimation();
  }, [src]);

  // Control animation based on reduced motion preference
  useEffect(() => {
    if (lottieRef.current && isLoaded) {
      if (shouldReduceMotion) {
        lottieRef.current.pause();
      } else if (autoplay) {
        lottieRef.current.play();
      }
    }
  }, [isLoaded, shouldReduceMotion, autoplay]);


  if (error) {
    // Silently fail - don't render anything on error
    return null;
  }

  if (!isLoaded || !animationData || !LottieComponent) {
    return null;
  }

  /**
   * Use Lottie only for hero-level motion. Max 1 Lottie per screen. 
   * Prefer static WebP/PNG or CSS animations for decorative elements.
   */
  return (
    <div
      ref={containerRef}
      className={`absolute pointer-events-none ${className}`}
      style={{
        ...position,
        zIndex,
        opacity,
      }}
      aria-hidden="true"
    >
      <div
        className="w-full h-full lottie-container"
        style={{
          width: size.width,
          height: size.height,
          mixBlendMode: blendMode,
          filter: 'brightness(1.1)',
        }}
      >
        {LottieComponent && (
          <LottieComponent
            lottieRef={lottieRef}
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
        )}
      </div>
    </div>
  );
});

LottieAnimation.displayName = 'LottieAnimation';

export default LottieAnimation;

