import React from 'react';
import LottieAnimation from './LottieAnimation';

const ChristmasLottieAnimations: React.FC = () => {
  return (
    <>
      {/* Christmas Tree - Large, positioned in hero section background */}
      <LottieAnimation
        src="/assets/Christmas Tree Animation - 1699891737968.lottie"
        position={{ top: '10%', right: '2%' }}
        size={{
          width: '280px',
          height: '280px',
          mobileWidth: '180px',
          mobileHeight: '180px',
        }}
        opacity={0.25}
        parallaxSpeed={0.15}
        zIndex={1}
        loop={true}
        autoplay={true}
        speed={0.8}
        blendMode="soft-light"
      />

      {/* Christmas Gifts - Medium, positioned near hero content */}
      <LottieAnimation
        src="/assets/Christmas Gifts.lottie"
        position={{ bottom: '20%', left: '4%' }}
        size={{
          width: '200px',
          height: '200px',
          mobileWidth: '140px',
          mobileHeight: '140px',
        }}
        opacity={0.22}
        parallaxSpeed={0.25}
        zIndex={2}
        loop={true}
        autoplay={true}
        speed={1}
        blendMode="overlay"
      />

      {/* Wind Chimes - Small, subtle background element */}
      <LottieAnimation
        src="/assets/Christmas wind chimes.lottie"
        position={{ top: '40%', right: '8%' }}
        size={{
          width: '150px',
          height: '150px',
          mobileWidth: '100px',
          mobileHeight: '100px',
        }}
        opacity={0.18}
        parallaxSpeed={0.3}
        zIndex={1}
        loop={true}
        autoplay={true}
        speed={0.9}
        blendMode="soft-light"
      />
    </>
  );
};

export default ChristmasLottieAnimations;








