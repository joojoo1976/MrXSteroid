import React from 'react';
import { ContentStrings } from '../types';
import { getIcon } from '../utils/shared';

const BenefitsSection: React.FC<{ content: ContentStrings }> = ({ content }) => (
    <section className="py-20 bg-zinc-50 dark:bg-zinc-900/30">
        <div className="container mx-auto px-4">
            <div className="text-center mb-16"><h2 className="text-3xl md:text-4xl font-bold mb-4">{content.benefitsTitle}</h2><p className="text-zinc-500 max-w-2xl mx-auto">{content.benefitsSubtitle}</p></div>
            <div className="grid md:grid-cols-3 gap-8">{content.benefits.map((benefit, idx) => (<div key={idx} className="p-8 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1"><div className="w-14 h-14 bg-zinc-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center mb-6 text-gold-500">{getIcon(benefit.iconKey)}</div><h3 className="text-xl font-bold mb-3">{benefit.title}</h3><p className="text-zinc-600 dark:text-zinc-400">{benefit.description}</p></div>))}</div>
        </div>
    </section>
);

export default BenefitsSection;
