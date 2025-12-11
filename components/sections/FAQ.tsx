import React, { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import GlassCard from '../UI/GlassCard';
import { useTheme } from '../../context/ThemeContext';

const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const { theme } = useTheme();
  const shouldReduceMotion = useReducedMotion();

  const faqs = [
    {
      question: "Do they need an app?",
      answer: "No. They receive an email. They click a link. That's it. A secure account is created for them in the browser instantly.",
    },
    {
      question: "Is it safe?",
      answer: "Yes. The link we send is a secure \"Magic Link\" powered by Privy. Only the person with access to that email address can claim the funds. We never store your private keys or wallet credentials.",
    },
    {
      question: "What can they do after they redeem?",
      answer: "They can hold the crypto, cash it out instantly, or transfer it to their own wallet. Full control, no restrictions.",
    },
    {
      question: "What assets can I send?",
      answer: "You can send any Solana (SPL) tokens you have in your wallet, including SOL, USDC, and other Solana-based cryptocurrencies. The recipient sees the value immediately.",
    },
    {
      question: "What happens if they don't claim it?",
      answer: "If your gift isn't claimed within 48 hours, the funds are automatically refunded to your account. No risk, no hassle.",
    },
    {
      question: "Can I add a personal message?",
      answer: "Yes! Every gift can include a personalized holiday message and you can choose from festive greeting card themes.",
    },
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  // Get theme-aware colors
  const getColors = () => {
    if (theme === 'christmas') {
      return {
        accent: '#EB6A46',
        border: 'rgba(235, 106, 70, 0.3)',
      };
    }
    if (theme === 'newyear') {
      return {
        accent: '#FCD34D',
        border: 'rgba(252, 211, 77, 0.3)',
      };
    }
    return {
      accent: '#BE123C',
      border: 'rgba(190, 18, 60, 0.3)',
    };
  };

  const colors = getColors();

  return (
    <section id="faq" className="py-16 lg:py-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-300px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 lg:mb-16"
        >
          <h2 className="text-h2 font-bold text-white mb-4">Questions You Might Have</h2>
        </motion.div>

        <div className="grid gap-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-300px' }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <motion.div
                  whileHover={!shouldReduceMotion ? {
                    y: -4,
                    scale: 1.01,
                  } : {}}
                  transition={{ duration: 0.2 }}
                >
                  <GlassCard
                    className="overflow-hidden cursor-pointer"
                    variant="holiday"
                    onClick={() => toggleFAQ(index)}
                  >
                    {/* Ribbon accent border */}
                    <div
                      className="h-1"
                      style={{
                        background: theme === 'christmas'
                          ? 'linear-gradient(90deg, #EB6A46 0%, #EF4444 50%, #EB6A46 100%)'
                          : theme === 'newyear'
                          ? 'linear-gradient(90deg, #FCD34D 0%, #F59E0B 50%, #FCD34D 100%)'
                          : 'linear-gradient(90deg, #BE123C 0%, #EF4444 50%, #BE123C 100%)',
                      }}
                    />

                    <div className="p-6">
                      <div className="flex items-center justify-between gap-4">
                        <h3 className="font-bold text-xl text-white flex-1 text-left">
                          {faq.question}
                        </h3>
                        <motion.div
                          animate={!shouldReduceMotion ? {
                            rotate: isOpen ? 180 : 0,
                          } : {}}
                          transition={{ duration: 0.3 }}
                        >
                          <ChevronDown
                            size={24}
                            className="text-[#94A3B8] flex-shrink-0"
                            style={{
                              color: isOpen ? colors.accent : undefined,
                            }}
                          />
                        </motion.div>
                      </div>

                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{
                              duration: shouldReduceMotion ? 0 : 0.3,
                              ease: 'easeInOut',
                            }}
                            style={{ overflow: 'hidden' }}
                          >
                            <motion.p
                              className="text-[#94A3B8] leading-relaxed pt-4"
                              initial={{ y: -10 }}
                              animate={{ y: 0 }}
                              exit={{ y: -10 }}
                              transition={{ duration: 0.2 }}
                            >
                              {faq.answer}
                            </motion.p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </GlassCard>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
