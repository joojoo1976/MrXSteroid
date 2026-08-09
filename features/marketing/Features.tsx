'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ContentStrings } from '@/shared/types/types';
import RevealOnScroll from '../../shared/ui/RevealOnScroll';
import { IconRenderer } from '../../utils/icon-utils';
import { StyledBrandName } from '../../shared/ui/StyledBrandName';
import { usePreferences } from '../../context/PreferencesContext';
import { ChevronDown, Sparkles } from 'lucide-react';

interface FeaturesProps {
  content: ContentStrings;
}

const accentColors = [
  { border: 'border-gold-500/40', bg: 'bg-gold-500/10', text: 'text-gold-500', glow: 'shadow-[0_0_30px_rgba(234,179,8,0.15)]', num: 'from-gold-400 to-gold-600' },
  { border: 'border-blue-500/40', bg: 'bg-blue-500/10', text: 'text-blue-400', glow: 'shadow-[0_0_30px_rgba(59,130,246,0.15)]', num: 'from-blue-400 to-blue-600' },
  { border: 'border-emerald-500/40', bg: 'bg-emerald-500/10', text: 'text-emerald-400', glow: 'shadow-[0_0_30px_rgba(16,185,129,0.15)]', num: 'from-emerald-400 to-emerald-600' },
  { border: 'border-purple-500/40', bg: 'bg-purple-500/10', text: 'text-purple-400', glow: 'shadow-[0_0_30px_rgba(168,85,247,0.15)]', num: 'from-purple-400 to-purple-600' },
  { border: 'border-rose-500/40', bg: 'bg-rose-500/10', text: 'text-rose-400', glow: 'shadow-[0_0_30px_rgba(244,63,94,0.15)]', num: 'from-rose-400 to-rose-600' },
  { border: 'border-cyan-500/40', bg: 'bg-cyan-500/10', text: 'text-cyan-400', glow: 'shadow-[0_0_30px_rgba(6,182,212,0.15)]', num: 'from-cyan-400 to-cyan-600' },
];

const Features: React.FC<FeaturesProps> = ({ content }) => {
  const { isRTL } = usePreferences();
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  return (
    <section id="features" className="py-24 md:py-36 bg-zinc-50 dark:bg-background border-t border-zinc-200 dark:border-zinc-800 relative overflow-hidden">

      {/* Background Decor */}
      <div className="absolute top-0 start-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] end-[5%] w-[500px] h-[500px] bg-gold-500/5 blur-[140px] rounded-full animate-float-slow" />
        <div className="absolute bottom-[10%] start-[5%] w-[400px] h-[400px] bg-blue-500/8 blur-[120px] rounded-full animate-float-slow [animation-delay:-4s]" />
        <div className="absolute top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gold-500/3 blur-[180px] rounded-full pointer-events-none" />
      </div>

      <div className="container mx-auto px-4 relative z-10">

        {/* ── Section Header ── */}
        <RevealOnScroll>
          <header className="text-center mb-16 md:mb-24">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gold-500/10 border border-gold-500/20 text-gold-500 text-sm font-black uppercase tracking-widest mb-6"
            >
              <Sparkles className="w-4 h-4" />
              {isRTL ? 'محتوى حصري داخل الكتاب' : 'Exclusive Book Contents'}
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-6xl lg:text-7xl font-black mb-6 bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 via-gold-600 to-zinc-900 dark:from-white dark:via-gold-400 dark:to-white animate-text-flash tracking-tight"
            >
              {content.featuresTitle}
            </motion.h2>

            <div className="w-24 h-1.5 bg-gradient-to-r from-gold-600 to-gold-400 mx-auto rounded-full shadow-[0_0_20px_rgba(255,200,0,0.4)] mb-6 animate-pulse" />

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-lg md:text-2xl text-zinc-500 dark:text-zinc-400 max-w-3xl mx-auto font-semibold leading-relaxed"
            >
              {isRTL
                ? 'كل ما تحتاجه في مرجع واحد موثوق — جداول دقيقة، بروتوكولات آمنة، وأسرار لا تُباع في أي مكان آخر.'
                : 'Everything you need in one trusted reference — precise charts, safe protocols, and secrets not sold anywhere else.'}
            </motion.p>
          </header>
        </RevealOnScroll>

        {/* ── Feature Cards Grid ── */}
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {content.features.map((feature, idx) => {
            const accent = accentColors[idx % accentColors.length];
            const num = String(idx + 1).padStart(2, '0');
            const isExpanded = expandedIdx === idx;

            return (
              <li key={idx}>
                <RevealOnScroll delay={idx * 120}>
                  <motion.div
                    whileHover={{ y: -6, scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    className={`group relative rounded-3xl bg-white dark:bg-zinc-900/80 border-2 ${accent.border} ${accent.glow} backdrop-blur-sm overflow-hidden transition-all duration-500 cursor-pointer`}
                    onClick={() => setExpandedIdx(isExpanded ? null : idx)}
                  >
                    {/* Top gradient line */}
                    <div className={`absolute top-0 start-0 end-0 h-1 bg-gradient-to-r ${accent.num} opacity-70 group-hover:opacity-100 transition-opacity`} />

                    {/* Glow orb on hover */}
                    <div className={`absolute -top-10 -end-10 w-32 h-32 ${accent.bg} blur-[40px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none`} />

                    <div className="p-6 md:p-8">
                      {/* Number + Icon row */}
                      <div className="flex items-start justify-between mb-5">
                        {/* Serial number */}
                        <span className={`text-5xl md:text-6xl font-black bg-clip-text text-transparent bg-gradient-to-br ${accent.num} opacity-20 group-hover:opacity-40 transition-opacity leading-none select-none`}>
                          {num}
                        </span>

                        {/* Icon container */}
                        <div className={`w-14 h-14 md:w-16 md:h-16 flex items-center justify-center ${accent.bg} rounded-2xl ${accent.text} group-hover:scale-110 transition-transform duration-300 shadow-lg ring-1 ${accent.border}`}>
                          <IconRenderer iconKey={feature.iconKey} className="w-7 h-7 md:w-8 md:h-8" />
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="text-lg md:text-xl font-black text-zinc-900 dark:text-white leading-tight mb-3 group-hover:text-zinc-800 dark:group-hover:text-zinc-100 transition-colors">
                        <StyledBrandName text={feature.title} />
                      </h3>

                      {/* Description — always visible but more visible on expand */}
                      <p className="text-sm md:text-base text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium line-clamp-3 group-hover:line-clamp-none transition-all duration-500">
                        <StyledBrandName text={feature.description} />
                      </p>

                      {/* Expandable full description */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.35, ease: 'easeInOut' }}
                            className="overflow-hidden"
                          >
                            <div className={`mt-5 pt-5 border-t ${accent.border}`}>
                              <p className="text-sm md:text-base text-zinc-600 dark:text-zinc-300 leading-relaxed font-medium">
                                <StyledBrandName text={feature.description} />
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Read more toggle */}
                      <button
                        className={`mt-4 flex items-center gap-1.5 text-xs font-black uppercase tracking-widest ${accent.text} opacity-60 hover:opacity-100 transition-opacity`}
                        onClick={(e) => { e.stopPropagation(); setExpandedIdx(isExpanded ? null : idx); }}
                        aria-label={isExpanded ? 'collapse' : 'expand'}
                      >
                        {isRTL ? (isExpanded ? 'أقل' : 'اقرأ أكثر') : (isExpanded ? 'Show less' : 'Read more')}
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                      </button>
                    </div>
                  </motion.div>
                </RevealOnScroll>
              </li>
            );
          })}
        </ul>

        {/* ── Bottom trust bar ── */}
        <RevealOnScroll delay={400}>
          <div className="mt-16 md:mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 text-center">
            {[
              { num: '300+', label: isRTL ? 'صفحة محتوى علمي' : 'Pages of Science' },
              { num: '6', label: isRTL ? 'أقسام متخصصة' : 'Specialized Chapters' },
              { num: '100%', label: isRTL ? 'مدعوم بالأبحاث' : 'Research-Backed' },
              { num: '2', label: isRTL ? 'لغة — عربي وإنجليزي' : 'Languages — AR & EN' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-5 rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 hover:border-gold-500/30 transition-colors"
              >
                <div className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-gold-600 mb-1">
                  {stat.num}
                </div>
                <div className="text-xs md:text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </RevealOnScroll>

      </div>
    </section>
  );
};

export default Features;
