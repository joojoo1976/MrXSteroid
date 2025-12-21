import React from 'react';
import { ContentStrings } from '../types';
import { RevealOnScroll, getIcon } from '../utils/shared';

interface FeaturesProps {
  content: ContentStrings;
}

const Features: React.FC<FeaturesProps> = ({ content }) => {
  return (
    <section id="features" className="py-20 bg-white dark:bg-zinc-900/50 border-t border-zinc-200 dark:border-zinc-800">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{content.featuresTitle}</h2>
          <div className="w-20 h-1 bg-gold-500 mx-auto rounded-full"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {content.features.map((feature, idx) => (
            <RevealOnScroll key={idx} delay={idx * 100}>
              <div className="p-8 rounded-3xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 hover:border-gold-500/30 transition-all hover:shadow-2xl hover:-translate-y-1 h-full group">
                <div className="w-14 h-14 bg-white dark:bg-zinc-800 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300">
                  {getIcon(feature.iconKey)}
                </div>
                <h3 className="text-xl font-bold mb-4 group-hover:text-gold-600 dark:group-hover:text-gold-500 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
