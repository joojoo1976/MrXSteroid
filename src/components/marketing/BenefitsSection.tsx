import React from 'react';
import { motion } from 'framer-motion';
import { ContentStrings } from '../../types';
import { IconRenderer } from '../../utils/icon-utils';
import RevealOnScroll from '../shared/RevealOnScroll';
import { StyledBrandName } from '../shared/StyledBrandName';

const BenefitsSection: React.FC<{ content: ContentStrings }> = ({ content }) => {
    return (
        <section className="min-h-screen flex flex-col justify-center bg-zinc-50 dark:bg-zinc-950 relative overflow-hidden py-4 md:py-0">
            {/* Decorative Background */}
            <div className="absolute top-0 start-0 w-full h-full overflow-hidden pointer-events-none opacity-50">
                <div className="absolute top-[10%] start-[5%] w-72 h-72 bg-gold-500/10 blur-[100px] rounded-full"></div>
                <div className="absolute bottom-[10%] end-[5%] w-72 h-72 bg-emerald-500/10 blur-[100px] rounded-full"></div>
            </div>

            <div className="container max-w-screen-2xl mx-auto px-4 relative z-10">
                {/* Header Area - Ultra Compact */}
                <div className="text-center mb-8">
                    <motion.h2
                        initial={{ opacity: 0, y: -20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-5xl lg:text-6xl font-black mb-2 bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 via-gold-600 to-zinc-900 dark:from-white dark:via-gold-400 dark:to-white"
                    >
                        <StyledBrandName text={content.benefitsTitle} />
                    </motion.h2>
                    <div className="w-24 h-1.5 bg-gradient-to-r from-gold-600 to-gold-400 mx-auto rounded-full mb-4"></div>
                    <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="text-lg md:text-xl text-zinc-600 dark:text-zinc-400 max-w-4xl mx-auto italic font-medium leading-tight"
                    >
                        {content.benefitsSubtitle}
                    </motion.p>
                </div>

                {/* Grid Area - 3 Columns on Desktop to spread width */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                    {content.benefits.map((benefit, idx) => (
                        <RevealOnScroll key={idx} delay={idx * 50}>
                            <motion.div
                                whileHover={{ scale: 1.02, y: -5 }}
                                className="group relative h-full flex items-start"
                            >
                                {/* Compact Card */}
                                <div className="flex flex-row items-center gap-4 p-4 lg:p-5 bg-white dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-lg relative overflow-hidden transition-all duration-300 w-full min-h-[140px] lg:min-h-[160px]">
                                    {/* Small Side Icon Container */}
                                    <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-gold-500/10 to-transparent rounded-xl flex items-center justify-center text-gold-500 border border-gold-500/20 shadow-inner group-hover:scale-110 group-hover:bg-gold-500 group-hover:text-white transition-all duration-500">
                                        <IconRenderer iconKey={benefit.iconKey} className="w-8 h-8" />
                                    </div>

                                    {/* Text Content */}
                                    <div className="flex-1 space-y-1">
                                        <h3 className="text-lg lg:text-xl font-black text-zinc-900 dark:text-white leading-tight group-hover:text-gold-500 transition-colors">
                                            {benefit.title}
                                        </h3>
                                        <div className="text-sm lg:text-base text-zinc-600 dark:text-zinc-400 leading-snug font-bold">
                                            <StyledBrandName text={benefit.description} />
                                        </div>
                                    </div>

                                    {/* Subtle Accent Glow on Hover */}
                                    <div className="absolute inset-0 bg-gradient-to-tr from-gold-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                                </div>
                            </motion.div>
                        </RevealOnScroll>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default BenefitsSection;
