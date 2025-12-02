import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Toast, { ToastType } from './Toast';

interface ToastData {
  id: string;
  type: ToastType;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  duration?: number;
}

interface ToastContextType {
  showToast: (toast: Omit<ToastData, 'id'>) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const MAX_TOASTS = 4;

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const showToast = useCallback((toast: Omit<ToastData, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => {
      const newToasts = [...prev, { ...toast, id }];
      // Auto-dismiss oldest if limit reached
      if (newToasts.length > MAX_TOASTS) {
        return newToasts.slice(1);
      }
      return newToasts;
    });
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  // Position classes based on device
  const positionClasses = isMobile
    ? 'fixed bottom-4 left-4 right-4 z-[100]'
    : 'fixed top-4 right-4 z-[100]';

  const containerClasses = isMobile
    ? 'flex flex-col-reverse gap-2 pointer-events-none'
    : 'flex flex-col gap-2 pointer-events-none';

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className={positionClasses}>
        <div className={containerClasses}>
          <AnimatePresence mode="popLayout">
            {toasts.map((toast, index) => (
              <motion.div
                key={toast.id}
                layout
                initial={{ opacity: 0, y: isMobile ? 50 : -20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: isMobile ? 50 : -20, scale: 0.9 }}
                transition={{
                  duration: 0.3,
                  delay: index * 0.05,
                  ease: 'easeOut',
                }}
                className="pointer-events-auto"
              >
                <Toast
                  {...toast}
                  onDismiss={dismissToast}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </ToastContext.Provider>
  );
};
