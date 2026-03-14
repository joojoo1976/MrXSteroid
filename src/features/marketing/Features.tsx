import React from 'react';
import { motion } from 'framer-motion';
import { ContentStrings } from '@/shared/types/types';
import RevealOnScroll from '../../shared/ui/RevealOnScroll';
import { IconRenderer } from '../../utils/icon-utils';
import { StyledBrandName } from '../../shared/ui/StyledBrandName';
import { usePreferences } from '../../context/PreferencesContext';

interface FeaturesProps {
  content: ContentStrings;
}

const Features: React.FC<FeaturesProps> = ({ content }) => {
  const { isRTL } = usePreferences(); // Used conditionally based on feature content
  return (
    <section id="features" className="py-24 bg-zinc-50 dark:bg-background border-t border-zinc-200 dark:border-zinc-800 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 start-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] end-[10%] w-96 h-96 bg-gold-500/10 blur-[120px] rounded-full animate-float-slow"></div>
        <div className="absolute bottom-[20%] start-[10%] w-72 h-72 bg-blue-500/10 blur-[120px] rounded-full animate-float-slow [animation-delay:-3s]"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <header className="text-start mb-24">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl font-black mb-8 bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 via-gold-600 to-zinc-900 dark:from-white dark:via-gold-400 dark:to-white animate-text-flash"
          >
            {content.featuresTitle}
          </motion.h2>
          <div className="w-32 h-2 bg-gradient-to-r from-gold-600 to-gold-400 mx-auto rounded-full shadow-[0_0_20px_rgba(255,255,160,0.4)] mb-8 animate-pulse"></div>
        </header>

        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10 tablet-grid-2">
          {content.features.map((feature, idx) => (
            <li key={idx}>
              <RevealOnScroll delay={idx * 150}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group relative"
              >
                <div className="flex items-center gap-3 p-3 bg-[#1a1a1a] rounded-lg border border-gray-800 hover:border-green-500 transition-all duration-300 w-full group">

                  {/* حاوية الأيقونة: حجم صغير وثابت */}
                  <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-green-500/10 rounded-md text-green-500 group-hover:scale-110 transition-transform">
                    <IconRenderer iconKey={feature.iconKey} className="w-5 h-5" />
                  </div>

                  {/* حاوية النصوص: العنوان بجانب الأيقونة مباشرة */}
                  <div className="flex flex-col overflow-hidden text-start rtl:text-right ltr:text-left">
                    <h3 className="text-sm font-bold text-white leading-tight truncate">
                      <StyledBrandName text={feature.title} />
                    </h3>
                    {/* وصف اختياري صغير جداً إذا أردت */}
                    <p className="text-[10px] text-gray-400 mt-0.5 line-clamp-1">
                      <StyledBrandName text={feature.description} />
                    </p>
                  </div>
                </div>
              </motion.div>
            </RevealOnScroll>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default Features;
