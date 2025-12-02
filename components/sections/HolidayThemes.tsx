import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ThemeCard from '../ThemeCard';
import { useTheme } from '../../context/ThemeContext';

const HolidayThemes: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [selectedTheme, setSelectedTheme] = useState<'christmas' | 'newyear' | null>(null);

  const themes = [
    {
      id: 'christmas' as const,
      title: 'Christmas',
      description: 'Warm reds and festive cheer',
    },
    {
      id: 'newyear' as const,
      title: 'New Year',
      description: 'Golden sparkles and celebration',
    },
  ];

  const handleThemeClick = (themeId: 'christmas' | 'newyear') => {
    setSelectedTheme(themeId);
    setTheme(themeId);
  };

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
          <h2 className="text-h2 font-bold text-white mb-4">Choose Your Holiday Theme</h2>
          <p className="text-body-lg text-[#94A3B8] max-w-2xl mx-auto">
            Personalize your gift experience with festive themes. Switch between Christmas and New Year styles.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 max-w-4xl mx-auto">
          {themes.map((themeOption, index) => (
            <motion.div
              key={themeOption.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <ThemeCard
                theme={themeOption.id}
                title={themeOption.title}
                description={themeOption.description}
                onClick={() => handleThemeClick(themeOption.id)}
                isSelected={selectedTheme === themeOption.id || theme === themeOption.id}
              />
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-8"
        >
          <p className="text-sm text-[#94A3B8]">
            Theme applies to all gift cards and the entire experience
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default HolidayThemes;




