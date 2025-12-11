import React, { createContext, useContext, ReactNode } from 'react';
import { useScroll, MotionValue } from 'framer-motion';

/**
 * ScrollMotionContext provides centralized scroll tracking for the entire page.
 * 
 * This avoids multiple useScroll() hooks scattered across components, which can
 * cause performance issues. Instead, we call useScroll() once at the page level
 * and provide the scrollYProgress via context.
 * 
 * Use this for page-level scroll. Element-specific tracking (with target option)
 * should be rare and documented.
 */
interface ScrollMotionContextValue {
  scrollYProgress: MotionValue<number>;
}

const ScrollMotionContext = createContext<ScrollMotionContextValue | undefined>(undefined);

/**
 * ScrollMotionProvider - Centralized scroll tracking provider.
 * 
 * Wraps the page content and provides scrollYProgress from Framer Motion's useScroll.
 * Should be placed at the page level (e.g., in LoginPage.tsx).
 */
export const ScrollMotionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Call useScroll() once at the page level
  const { scrollYProgress } = useScroll();

  return (
    <ScrollMotionContext.Provider value={{ scrollYProgress }}>
      {children}
    </ScrollMotionContext.Provider>
  );
};

/**
 * useScrollMotion - Hook to consume centralized scroll motion values.
 * 
 * @returns ScrollMotionContextValue with scrollYProgress
 * @throws Error if used outside ScrollMotionProvider
 */
export const useScrollMotion = (): ScrollMotionContextValue => {
  const context = useContext(ScrollMotionContext);
  if (context === undefined) {
    throw new Error('useScrollMotion must be used within a ScrollMotionProvider');
  }
  return context;
};

/**
 * useScrollMotionOptional - Optional hook that returns null if ScrollMotionProvider is not available.
 * 
 * Use this when the component may be rendered outside ScrollMotionProvider (e.g., in loading screens).
 * @returns ScrollMotionContextValue with scrollYProgress, or null if provider is not available
 */
export const useScrollMotionOptional = (): ScrollMotionContextValue | null => {
  const context = useContext(ScrollMotionContext);
  return context ?? null;
};

