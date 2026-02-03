import React from 'react';
import { motion } from 'framer-motion';
import { ContentStrings } from '../../types';
import RevealOnScroll from '../shared/RevealOnScroll';
import { IconRenderer } from '../../utils/icon-utils';
import { StyledBrandName } from '../shared/StyledBrandName';
import { usePreferences } from '../../context/PreferencesContext';

interface FeaturesProps {
  content: ContentStrings;
}

const Features: React.FC<FeaturesProps> = ({ content }) => {
  const { isRTL } = usePreferences();
  return (
    <section id="features" className="py-24 bg-zinc-50 dark:bg-background border-t border-zinc-200 dark:border-zinc-800 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 start-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] end-[10%] w-96 h-96 bg-gold-500/10 blur-[120px] rounded-full animate-float-slow"></div>
        <div className="absolute bottom-[20%] start-[10%] w-72 h-72 bg-blue-500/10 blur-[120px] rounded-full animate-float-slow [animation-delay:-3s]"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-start mb-24">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl font-black mb-8 bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 via-gold-600 to-zinc-900 dark:from-white dark:via-gold-400 dark:to-white animate-text-flash"
          >
            {content.featuresTitle}
          </motion.h2>
          <div className="w-32 h-2 bg-gradient-to-r from-gold-600 to-gold-400 mx-auto rounded-full shadow-[0_0_20px_rgba(255,255,160,0.4)] mb-8 animate-pulse"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10 tablet-grid-2">
          {content.features.map((feature, idx) => (
            <RevealOnScroll key={idx} delay={idx * 150}>
              <motion.div
                whileHover={{ y: -10 }}
                whileTap={{ scale: 0.98 }}
                className="group relative h-full"
              >
                {/* Card Glow Effect */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-gold-600 via-yellow-400 to-gold-600 rounded-[2.5rem] blur opacity-0 group-hover:opacity-30 transition-opacity duration-500"></div>

                <div className="relative p-5 rounded-[1.5rem] bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/50 hover:border-gold-500/50 transition-all h-full glass-morphism-premium flex flex-col items-start gap-3 shadow-xl hover:shadow-2xl overflow-hidden">

                  {/* Header: Icon + Title */}
                  <div className="flex flex-row items-center gap-3 w-full">
                    <div className={`flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-gold-50 to-white dark:from-gold-950/20 dark:to-zinc-900 border border-gold-500/30 flex items-center justify-center shadow-md group-hover:scale-110 transition-all duration-500 relative z-10 ${isRTL ? 'group-hover:-rotate-6' : 'group-hover:rotate-6'}`}>
                      <div className="text-gold-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.4)]">
                        <IconRenderer iconKey={feature.iconKey} className="w-5 h-5" />
                      </div>
                    </div>

                    <h3 className="text-lg md:text-xl font-black text-zinc-900 dark:text-white group-hover:text-gold-600 dark:group-hover:text-gold-400 transition-colors tracking-tight flex-1">
                      <StyledBrandName text={feature.title} />
                    </h3>
                  </div>

                  <div className="relative z-10 w-full">
                    <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-sm md:text-base font-medium">
                      <StyledBrandName text={feature.description} />
                    </p>
                  </div>

                  {/* Bottom Animated Line */}
                  <div className="absolute bottom-0 start-0 h-1 bg-gradient-to-r from-gold-600 via-yellow-400 to-gold-600 w-0 group-hover:w-full transition-all duration-700 ease-out"></div>
                </div>
              </motion.div>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
