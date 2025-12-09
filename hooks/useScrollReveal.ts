import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '../lib/animations';

interface UseScrollRevealOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
  disabled?: boolean;
}

interface UseScrollRevealReturn {
  ref: React.RefObject<HTMLElement>;
  isVisible: boolean;
}

/**
 * Hook for scroll-triggered animations using Intersection Observer
 * @param options Configuration options
 * @returns Object with ref and isVisible state
 */
export const useScrollReveal = (
  options: UseScrollRevealOptions = {}
): UseScrollRevealReturn => {
  const {
    threshold = 0.1,
    rootMargin = '0px',
    triggerOnce = true,
    disabled = false,
  } = options;

  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLElement>(null);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (disabled || shouldReduceMotion || !ref.current) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            if (triggerOnce) {
              observer.unobserve(entry.target);
            }
          } else if (!triggerOnce) {
            setIsVisible(false);
          }
        });
      },
      {
        threshold,
        rootMargin,
      }
    );

    const currentRef = ref.current;
    observer.observe(currentRef);

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [threshold, rootMargin, triggerOnce, disabled, shouldReduceMotion]);

  return { ref, isVisible };
};

export default useScrollReveal;













