import React from 'react';
import { motion } from 'framer-motion';
import { Gift, Instagram, Youtube, Linkedin, Twitter, Music } from 'lucide-react';
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

  // Social media links
  const socialLinks = [
    {
      name: 'Instagram',
      url: 'https://www.instagram.com/cryptogiftingapp/',
      icon: Instagram,
    },
    {
      name: 'YouTube',
      url: 'https://www.youtube.com/@CryptoGiftingApp',
      icon: Youtube,
    },
    {
      name: 'LinkedIn',
      url: '#', // TODO: Add LinkedIn URL
      icon: Linkedin,
    },
    {
      name: 'X (Twitter)',
      url: '#', // TODO: Add X/Twitter URL
      icon: Twitter,
    },
    {
      name: 'TikTok',
      url: '#', // TODO: Add TikTok URL
      icon: Music, // Using Music icon as TikTok icon may not be available
    },
  ];

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

        {/* Social Media Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex justify-center items-center gap-4 mb-8"
        >
          {socialLinks.map((social, index) => {
            const Icon = social.icon;
            return (
              <motion.a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#94A3B8] hover:text-white transition-colors"
                whileHover={{ scale: 1.15, y: -2 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                aria-label={social.name}
              >
                <Icon size={20} strokeWidth={2} />
              </motion.a>
            );
          })}
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
