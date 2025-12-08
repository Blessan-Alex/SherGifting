import { useState, useEffect } from 'react';

/**
 * Effects policy hook that determines which animations and effects should be mounted
 * based on user preferences and device capabilities.
 * 
 * Key principle: Mount policy over pause logic - if an effect shouldn't run,
 * don't mount the component at all.
 */
export interface EffectsPolicy {
  /** User prefers reduced motion */
  reduceMotion: boolean;
  /** Device is mobile (max-width: 768px) */
  isMobile: boolean;
  /** Data saver mode is enabled (if available) */
  saveData: boolean;
  /** Allow heavy effects (Lottie, SnowParticles, CursorGlow, TwinklingLights) */
  allowHeavyEffects: boolean;
  /** Allow medium effects (some animations, but reduced) */
  allowMediumEffects: boolean;
}

/**
 * Hook to determine effects policy based on user preferences and device capabilities.
 * 
 * - Heavy effects are disabled if: reduceMotion OR isMobile OR saveData
 * - Medium effects are disabled if: reduceMotion
 * 
 * @returns EffectsPolicy object with flags for conditional mounting
 */
export const useEffectsPolicy = (): EffectsPolicy => {
  const [reduceMotion, setReduceMotion] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [saveData, setSaveData] = useState(false);

  useEffect(() => {
    // Check prefers-reduced-motion
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduceMotion(reducedMotionQuery.matches);

    const handleReducedMotionChange = (e: MediaQueryListEvent) => {
      setReduceMotion(e.matches);
    };
    reducedMotionQuery.addEventListener('change', handleReducedMotionChange);

    // Check mobile viewport
    const mobileQuery = window.matchMedia('(max-width: 768px)');
    setIsMobile(mobileQuery.matches);

    const handleMobileChange = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches);
    };
    mobileQuery.addEventListener('change', handleMobileChange);

    // Check data saver mode (if available)
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    if (connection?.saveData !== undefined) {
      setSaveData(connection.saveData);
      
      // Listen for changes (if supported)
      if (connection.addEventListener) {
        const handleSaveDataChange = () => {
          setSaveData(connection.saveData);
        };
        connection.addEventListener('change', handleSaveDataChange);
        return () => {
          connection.removeEventListener('change', handleSaveDataChange);
          reducedMotionQuery.removeEventListener('change', handleReducedMotionChange);
          mobileQuery.removeEventListener('change', handleMobileChange);
        };
      }
    }

    return () => {
      reducedMotionQuery.removeEventListener('change', handleReducedMotionChange);
      mobileQuery.removeEventListener('change', handleMobileChange);
    };
  }, []);

  // Policy logic:
  // - Heavy effects: disabled if reduceMotion OR isMobile OR saveData
  // - Medium effects: disabled if reduceMotion
  const allowHeavyEffects = !reduceMotion && !isMobile && !saveData;
  const allowMediumEffects = !reduceMotion;

  return {
    reduceMotion,
    isMobile,
    saveData,
    allowHeavyEffects,
    allowMediumEffects,
  };
};

