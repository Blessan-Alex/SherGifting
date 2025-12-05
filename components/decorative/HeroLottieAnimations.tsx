import React, { useRef } from 'react';
import LottieAnimation from './LottieAnimation';

const HeroLottieAnimations: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none overflow-hidden"
      aria-hidden="true"
    >
      {/* Christmas Tree - Top right, complements the gift card */}
      <LottieAnimation
        src="/assets/Christmas Tree Animation - 1699891737968.lottie"
        position={{ top: '5%', right: '0%' }}
        size={{
          width: '240px',
          height: '240px',
          mobileWidth: '160px',
          mobileHeight: '160px',
        }}
        opacity={0.28}
        parallaxSpeed={0}
        zIndex={1}
        loop={true}
        autoplay={true}
        speed={0.75}
        blendMode="soft-light"
      />

      {/* Christmas Gifts - Bottom left, balances the tree */}
      <LottieAnimation
        src="/assets/Christmas Gifts.lottie"
        position={{ bottom: '0%', left: '0%' }}
        size={{
          width: '180px',
          height: '180px',
          mobileWidth: '120px',
          mobileHeight: '120px',
        }}
        opacity={0.24}
        parallaxSpeed={0}
        zIndex={1}
        loop={true}
        autoplay={true}
        speed={1}
        blendMode="overlay"
      />

      {/* Wind Chimes - Top center-right, subtle accent */}
      <LottieAnimation
        src="/assets/Christmas wind chimes.lottie"
        position={{ top: '15%', right: '15%' }}
        size={{
          width: '140px',
          height: '140px',
          mobileWidth: '90px',
          mobileHeight: '90px',
        }}
        opacity={0.2}
        parallaxSpeed={0}
        zIndex={1}
        loop={true}
        autoplay={true}
        speed={0.85}
        blendMode="soft-light"
      />
    </div>
  );
};

export default HeroLottieAnimations;

