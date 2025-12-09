import React from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import Ornament from './Ornament';
import Holly from './Holly';

interface CornerDecorationsProps {
  corners?: ('top-left' | 'top-right' | 'bottom-left' | 'bottom-right')[];
  type?: 'ornament' | 'holly' | 'mixed';
  ornamentType?: 'ball' | 'star' | 'bell';
  size?: number;
  enabled?: boolean;
  className?: string;
}

const CornerDecorations: React.FC<CornerDecorationsProps> = ({
  corners = ['top-left', 'top-right'],
  type = 'ornament',
  ornamentType = 'ball',
  size = 16,
  enabled = true,
  className = '',
}) => {
  const shouldReduceMotion = useReducedMotion();

  if (!enabled) return null;

  const getPositionClasses = (corner: string) => {
    switch (corner) {
      case 'top-left':
        return 'top-2 left-2';
      case 'top-right':
        return 'top-2 right-2';
      case 'bottom-left':
        return 'bottom-2 left-2';
      case 'bottom-right':
        return 'bottom-2 right-2';
      default:
        return '';
    }
  };

  const renderDecoration = (corner: string, index: number) => {
    const positionClasses = getPositionClasses(corner);
    const isOrnament = type === 'ornament' || (type === 'mixed' && index % 2 === 0);

    return (
      <motion.div
        key={corner}
        className={`absolute ${positionClasses} ${className}`}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0 }}
        transition={{
          duration: shouldReduceMotion ? 0.1 : 0.3,
          delay: index * 0.1,
          ease: 'easeOut',
        }}
        aria-hidden="true"
      >
        {isOrnament ? (
          <Ornament type={ornamentType} size={size} />
        ) : (
          <Holly size={size} />
        )}
      </motion.div>
    );
  };

  return (
    <AnimatePresence>
      {corners.map((corner, index) => renderDecoration(corner, index))}
    </AnimatePresence>
  );
};

export default CornerDecorations;













