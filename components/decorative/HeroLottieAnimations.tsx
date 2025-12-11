import React, { useRef } from 'react';
import LazyLottie from './LazyLottie';

const HeroLottieAnimations: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none overflow-hidden"
      aria-hidden="true"
    >
      {/* Christmas Tree - Top right, complements the gift card */}
      {/* High priority: load immediately above the fold */}
      <LazyLottie
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
        priority="high"
      />
    </div>
  );
};

export default HeroLottieAnimations;

