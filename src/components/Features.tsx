import React from 'react';
import { motion } from 'framer-motion';
import { ContentStrings } from '../types';
import { RevealOnScroll } from '../utils/shared';
import { IconRenderer } from '../utils/icon-utils';

interface FeaturesProps {
  content: ContentStrings;
}

const Features: React.FC<FeaturesProps> = ({ content }) => {
  return (
    <section id="features" className="py-24 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] right-[10%] w-96 h-96 bg-gold-500/10 blur-[120px] rounded-full animate-float-slow"></div>
        <div className="absolute bottom-[20%] left-[10%] w-72 h-72 bg-blue-500/10 blur-[120px] rounded-full animate-float-slow" style={{ animationDelay: '-3s' }}></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-24">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl font-black mb-8 bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 via-gold-600 to-zinc-900 dark:from-white dark:via-gold-400 dark:to-white animate-text-flash"
          >
            {content.featuresTitle}
          </motion.h2>
          <div className="w-32 h-2 bg-gradient-to-r from-gold-600 to-gold-400 mx-auto rounded-full shadow-[0_0_20px_rgba(234,179,8,0.4)] animate-pulse"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {content.features.map((feature, idx) => (
            <RevealOnScroll key={idx} delay={idx * 150}>
              <motion.div
                whileHover={{ scale: 1.05, y: -10, rotate: idx % 2 === 0 ? 1 : -1 }}
                whileTap={{ scale: 0.95 }}
                className="group relative h-full"
              >
                {/* Card Glow Effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-gold-600 via-blue-500 to-purple-600 rounded-[2.5rem] blur opacity-10 group-hover:opacity-40 animate-pulse transition-opacity duration-500"></div>

                <div className="relative p-10 rounded-[2.2rem] bg-white dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800/50 hover:border-gold-500/50 transition-all h-full backdrop-blur-2xl flex flex-col items-start gap-8 shadow-2xl shadow-gold-500/5 dark:shadow-none overflow-hidden card-shine animate-glow">

                  <div className="absolute -top-10 -right-10 p-12 opacity-10 group-hover:opacity-20 transition-all transform group-hover:scale-125 group-hover:rotate-12 duration-700">
                    <IconRenderer iconKey={feature.iconKey} className="w-48 h-48" />
                  </div>

                  {/* Icon Box */}
                  <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-gold-50 to-white dark:from-gold-950/20 dark:to-zinc-900 border-2 border-gold-500/30 flex items-center justify-center shadow-xl group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 relative z-10 animate-float-slow">
                    <div className="text-gold-500 drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]">
                      <IconRenderer iconKey={feature.iconKey} className="w-10 h-10" />
                    </div>
                  </div>

                  <div className="relative z-10">
                    <h3 className="text-3xl font-black mb-4 text-zinc-900 dark:text-white group-hover:text-gold-600 dark:group-hover:text-gold-400 transition-colors tracking-tight">
                      {feature.title}
                    </h3>
                    <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-xl font-medium">
                      {feature.description}
                    </p>
                  </div>

                  {/* Bottom Animated Line */}
                  <div className="absolute bottom-0 left-0 h-1.5 bg-gradient-to-r from-gold-600 via-yellow-400 to-gold-600 group-hover:w-full transition-all duration-700 ease-out animate-shimmer" style={{ width: '20%' }}></div>
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
