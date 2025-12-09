import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock } from 'lucide-react';
import GlassCard from '../UI/GlassCard';
import { useTheme } from '../../context/ThemeContext';

const TrustSecurity: React.FC = () => {
  const { theme } = useTheme();

  const features = [
    {
      icon: Shield,
      title: 'Powered by Privy',
      description: 'Bank-grade security with industry-leading authentication. Your gifts are protected by the same technology trusted by Fortune 500 companies.',
    },
    {
      icon: Lock,
      title: 'Secure Magic Links',
      description: 'Each gift link is encrypted and can only be claimed by the intended recipient. No wallet addresses needed—just email or phone.',
    },
  ];

  // Get theme-aware colors
  const getColors = () => {
    if (theme === 'christmas') {
      return {
        accent: '#EB6A46',
        bg: 'rgba(235, 106, 70, 0.1)',
        border: 'rgba(235, 106, 70, 0.3)',
      };
    }
    if (theme === 'newyear') {
      return {
        accent: '#FCD34D',
        bg: 'rgba(252, 211, 77, 0.1)',
        border: 'rgba(252, 211, 77, 0.3)',
      };
    }
    return {
      accent: '#10B981',
      bg: 'rgba(16, 185, 129, 0.1)',
      border: 'rgba(16, 185, 129, 0.3)',
    };
  };

  const colors = getColors();

  return (
    <section className="py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 lg:mb-16"
        >
          <h2 className="text-h2 font-bold text-white mb-4">Trust & Security</h2>
          <p className="text-body-lg text-[#94A3B8] max-w-2xl mx-auto">
            Your security and privacy are our top priorities. Built with enterprise-grade technology.
          </p>
        </motion.div>

        {/* Security Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mb-12 max-w-4xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <GlassCard className="h-full" variant="holiday">
                  <div className="flex flex-col items-center text-center">
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center mb-6 shadow-lg"
                      style={{
                        background: `linear-gradient(135deg, ${colors.accent}20 0%, ${colors.accent}10 100%)`,
                        border: `2px solid ${colors.border}`,
                      }}
                    >
                      <Icon size={28} style={{ color: colors.accent }} />
                    </div>
                    <h3 className="text-h3 font-bold text-white mb-3">{feature.title}</h3>
                    <p className="text-body text-[#94A3B8] leading-relaxed">{feature.description}</p>
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>

        {/* Privy Branding */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mb-12"
        >
          <div
            className="inline-flex items-center gap-3 px-6 py-4 rounded-full border"
            style={{
              background: colors.bg,
              borderColor: colors.border,
            }}
          >
            <Shield size={20} style={{ color: colors.accent }} />
            <span className="text-lg font-bold" style={{ color: colors.accent }}>
              Powered by Privy
            </span>
          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default TrustSecurity;













