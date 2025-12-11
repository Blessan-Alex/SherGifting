import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import GlassCard from '../UI/GlassCard';

const TheProblem: React.FC = () => {
  const problems = [
    {
      title: "The 'Lost Card' Problem",
      description: "30% of gift cards are never redeemed.",
    },
    {
      title: "The 'Setup' Headache",
      description: "Download this app, scan this code...",
    },
  ];

  return (
    <section id="the-problem" className="py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Column - Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-300px' }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <h2 className="text-h2 font-bold text-white leading-tight">
              The "Old Way" <br /> is <span className="text-[#BE123C]">Broken.</span>
            </h2>
            <p className="text-body-lg text-[#94A3B8] leading-relaxed">
              Gift cards get lost. Cash loses value. The old way is broken.
            </p>

            <div className="space-y-4">
              {problems.map((problem, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-300px' }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <GlassCard className="group hover:border-[#BE123C]/20 transition-colors duration-300">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-[#0F172A] flex items-center justify-center text-[#BE123C] shrink-0 border border-white/10 group-hover:border-[#BE123C]/50 transition-colors">
                        <X size={24} />
                      </div>
                      <div>
                        <h4 className="font-bold text-white mb-1 group-hover:text-[#BE123C]/80 transition-colors">
                          {problem.title}
                        </h4>
                        <p className="text-sm text-[#64748B]">{problem.description}</p>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right Column - Simplified Static Visual with One-Time Entrance */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative h-[400px] lg:h-[500px] w-full"
          >
            {/* Soft red glow background */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[#BE123C]/20 to-transparent rounded-full blur-[70px] pointer-events-none" />
            
            <GlassCard className="h-full flex flex-col items-center justify-center text-center relative old-way-card">
              {/* Static gradient background */}
              <div className="absolute inset-0 bg-gradient-to-tr from-[#BE123C]/10 to-transparent rounded-3xl pointer-events-none" />
              
              <div className="relative z-10 space-y-4 px-6">
                <p className="text-xs uppercase tracking-[0.25em] text-[#64748B] mb-2">
                  The old way
                </p>
                
                <div className="relative">
                  <div className="text-6xl lg:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-[#94A3B8] to-[#64748B]">
                    $50.00
                  </div>
                  
                  {/* EXPIRED stripe */}
                  <div className="expired-stripe">
                    EXPIRED
                  </div>
                </div>
                
                <p className="text-sm text-[#64748B] max-w-xs mx-auto pt-2">
                  Lost gift card balances, forgotten emails, and funds stuck in limbo.
                </p>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default TheProblem;

