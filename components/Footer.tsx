import React from 'react';
import { motion } from 'framer-motion';
import { Gift } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Footer: React.FC = () => {
  const { theme } = useTheme();

  // Get theme-aware colors
  const getColors = () => {
    if (theme === 'christmas') {
      return {
        accent: '#EB6A46',
        brand: '#D97706',
      };
    }
    if (theme === 'newyear') {
      return {
        accent: '#FCD34D',
        brand: '#D97706',
      };
    }
    return {
      accent: '#BE123C',
      brand: '#D97706',
    };
  };

  const colors = getColors();

  return (
    <footer className="border-t border-white/10 py-8 px-4 sm:px-6 lg:px-8 relative">
      {/* Subtle background glow */}
      <div className="absolute inset-0 opacity-5 pointer-events-none" style={{
        background: `radial-gradient(circle at center, ${colors.accent} 0%, transparent 70%)`,
      }} />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Brand Lockup */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center mb-8"
        >
          <div className="flex items-center gap-2 mb-2">
            <Gift 
              strokeWidth={2.5} 
              className="drop-shadow-[0_0_8px_rgba(190,18,60,0.5)]"
              style={{ color: colors.accent }}
            />
            <span className="font-bold text-xl tracking-tight text-white">
              Crypto<span style={{ color: colors.accent }}>Gifting</span>
            </span>
          </div>
          <p className="text-sm text-[#94A3B8]">
            by <span style={{ color: colors.brand }} className="font-semibold">Sher</span>
          </p>
        </motion.div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-[#64748B] text-center md:text-left">
            © 2025 CryptoGifting. All rights reserved.
          </div>
          <div className="flex items-center gap-6 text-sm">
            <motion.a
              href="#"
              className="text-[#94A3B8] hover:text-white transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Terms of Service
            </motion.a>
            <span className="text-[#64748B]">•</span>
            <motion.a
              href="#"
              className="text-[#94A3B8] hover:text-white transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Privacy Policy
            </motion.a>
            <span className="text-[#64748B]">•</span>
            <span className="text-[#94A3B8]">
              Built by <span style={{ color: colors.brand }} className="font-semibold">Sher</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
