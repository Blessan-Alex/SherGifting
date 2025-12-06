import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Check, Gift } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface StepperProps {
  currentStep: 1 | 2 | 3 | 4;
  completedSteps: number[];
  onStepClick?: (step: number) => void;
}

const steps = [
  { number: 1, label: 'Who', description: 'Recipient' },
  { number: 2, label: 'What', description: 'Token + Amount' },
  { number: 3, label: 'Personalize', description: 'Card + Message' },
  { number: 4, label: 'Review', description: 'Summary' },
];

const Stepper: React.FC<StepperProps> = ({
  currentStep,
  completedSteps,
  onStepClick,
}) => {
  const { theme } = useTheme();
  const shouldReduceMotion = useReducedMotion();
  const [justCompleted, setJustCompleted] = useState<number | null>(null);

  // Track when a step is completed for celebration animation
  useEffect(() => {
    const latestCompleted = completedSteps[completedSteps.length - 1];
    if (latestCompleted && latestCompleted !== justCompleted) {
      setJustCompleted(latestCompleted);
      setTimeout(() => setJustCompleted(null), 1000);
    }
  }, [completedSteps, justCompleted]);

  const getStepState = (stepNumber: number) => {
    if (completedSteps.includes(stepNumber)) return 'completed';
    if (currentStep === stepNumber) return 'active';
    return 'pending';
  };

  const canClickStep = (stepNumber: number) => {
    return completedSteps.includes(stepNumber) && onStepClick;
  };

  // Get theme-aware colors
  const getColors = () => {
    if (theme === 'christmas') {
      return {
        active: '#EB6A46',
        completed: '#10B981',
        pending: '#64748B',
        glow: 'rgba(235, 106, 70, 0.3)',
      };
    }
    if (theme === 'newyear') {
      return {
        active: '#FCD34D',
        completed: '#10B981',
        pending: '#64748B',
        glow: 'rgba(252, 211, 77, 0.3)',
      };
    }
    return {
      active: '#06B6D4',
      completed: '#10B981',
      pending: '#64748B',
      glow: 'rgba(6, 182, 212, 0.3)',
    };
  };

  const colors = getColors();

  // Calculate progress percentage
  const progressPercentage = ((currentStep - 1) / (steps.length - 1)) * 100;

  return (
    <nav className="w-full mb-8" role="navigation" aria-label="Gift sending steps">
      <div role="progressbar" aria-label="Gift sending progress" aria-valuenow={currentStep} aria-valuemin={1} aria-valuemax={4} aria-valuetext={`Step ${currentStep} of ${steps.length}`}>
      <div className="flex items-center justify-between relative">
        {/* Enhanced connector line with gradient */}
        <div className="absolute top-5 left-0 right-0 h-1 bg-white/10 -z-10 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{
              background: theme === 'christmas'
                ? 'linear-gradient(90deg, #EB6A46 0%, #EF4444 50%, #EB6A46 100%)'
                : theme === 'newyear'
                ? 'linear-gradient(90deg, #FCD34D 0%, #F59E0B 50%, #FCD34D 100%)'
                : 'linear-gradient(90deg, #06B6D4 0%, #0891B2 50%, #06B6D4 100%)',
              backgroundSize: '200% 100%',
            }}
            initial={{ width: '0%' }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
          >
            {!shouldReduceMotion && (
              <motion.div
                className="h-full w-full"
                animate={{
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              />
            )}
          </motion.div>
        </div>

        {steps.map((step, index) => {
          const state = getStepState(step.number);
          const isClickable = canClickStep(step.number);
          const isJustCompleted = justCompleted === step.number;

          return (
            <div
              key={step.number}
              className="flex flex-col items-center flex-1 relative"
            >
              {/* Step circle with enhanced animations */}
              <motion.button
                type="button"
                onClick={() => isClickable && onStepClick?.(step.number)}
                disabled={!isClickable}
                aria-label={`Step ${step.number}: ${step.description}`}
                aria-current={state === 'active' ? 'step' : undefined}
                className={`
                  relative w-12 h-12 rounded-full flex items-center justify-center
                  font-bold text-sm transition-all duration-300
                  ${state === 'completed'
                    ? 'bg-[#10B981] text-white shadow-lg'
                    : state === 'active'
                    ? 'text-white shadow-lg ring-4'
                    : 'bg-[#1E293B] text-[#64748B] border-2 border-white/10'
                  }
                  ${isClickable ? 'cursor-pointer' : 'cursor-default'}
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
                style={{
                  backgroundColor: state === 'active' ? colors.active : undefined,
                  boxShadow: state === 'active' 
                    ? `0 0 20px ${colors.glow}, 0 0 40px ${colors.glow}40`
                    : state === 'completed'
                    ? '0 0 20px rgba(16, 185, 129, 0.3)'
                    : undefined,
                  ringColor: state === 'active' ? `${colors.active}30` : undefined,
                }}
                whileHover={!shouldReduceMotion && isClickable ? {
                  scale: 1.15,
                } : {}}
                whileTap={!shouldReduceMotion && isClickable ? {
                  scale: 0.95,
                } : {}}
                transition={{
                  duration: 0.2,
                }}
              >
                {/* Ribbon accent for active step */}
                {state === 'active' && !shouldReduceMotion && (
                  <div
                    className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-3 rounded-t-full"
                    style={{
                      background: theme === 'christmas'
                        ? 'linear-gradient(135deg, #EB6A46 0%, #EF4444 100%)'
                        : theme === 'newyear'
                        ? 'linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)'
                        : 'linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)',
                    }}
                  />
                )}

                {/* Checkmark or number */}
                <AnimatePresence mode="wait">
                  {state === 'completed' ? (
                    <motion.div
                      key="check"
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0, rotate: 180 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                    >
                      <Check size={20} className="text-white" />
                    </motion.div>
                  ) : (
                    <motion.span
                      key="number"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                    >
                      {step.number}
                    </motion.span>
                  )}
                </AnimatePresence>

                {/* Sparkle effects on completion */}
                <AnimatePresence>
                  {isJustCompleted && !shouldReduceMotion && (
                    <>
                      {Array.from({ length: 6 }, (_, i) => {
                        const angle = (i * 60) * (Math.PI / 180);
                        const distance = 30;
                        const x = Math.cos(angle) * distance;
                        const y = Math.sin(angle) * distance;
                        return (
                          <motion.div
                            key={i}
                            className="absolute w-2 h-2 rounded-full"
                            style={{
                              background: colors.completed,
                              boxShadow: `0 0 8px ${colors.completed}`,
                            }}
                            initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                            animate={{ opacity: [0, 1, 0], scale: [0, 1, 0], x, y }}
                            exit={{ opacity: 0 }}
                            transition={{
                              duration: 0.8,
                              delay: i * 0.05,
                              ease: 'easeOut',
                            }}
                          />
                        );
                      })}
                    </>
                  )}
                </AnimatePresence>
              </motion.button>

              {/* Step label */}
              <motion.div
                className="mt-3 text-center"
                animate={!shouldReduceMotion && state === 'active' ? {
                  y: [0, -2, 0],
                } : {}}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                {/* Step X of 4 text */}
                <div
                  className={`
                    text-[10px] mb-1 font-medium
                    ${state === 'active' ? 'text-white' : 'text-[#64748B]'}
                  `}
                >
                  Step {step.number} of {steps.length}
                </div>
                <div
                  className={`
                    text-sm font-bold uppercase tracking-wider
                    ${state === 'active'
                      ? ''
                      : state === 'completed'
                      ? 'text-[#10B981]'
                      : 'text-[#64748B]'
                    }
                  `}
                  style={{
                    color: state === 'active' ? colors.active : undefined,
                  }}
                >
                  {step.label}
                </div>
                <div
                  className={`
                    text-xs mt-0.5
                    ${state === 'active' ? 'text-white' : 'text-[#94A3B8]'}
                  `}
                >
                  {step.description}
                </div>
              </motion.div>
            </div>
          );
        })}
      </div>

      {/* Optional progress percentage */}
      {!shouldReduceMotion && (
        <motion.div
          className="mt-4 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="text-xs text-[#94A3B8]">
            <span className="font-bold" style={{ color: colors.active }}>
              {Math.round(progressPercentage)}%
            </span>
            {' '}complete
          </div>
        </motion.div>
      )}
      </div>
    </nav>
  );
};

export default Stepper;
