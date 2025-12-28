import React from 'react';
import { motion } from 'framer-motion';
import { ContentStrings } from '../types';
import { IconRenderer } from '../utils/icon-utils';
import { RevealOnScroll } from '../utils/shared';

const BenefitsSection: React.FC<{ content: ContentStrings }> = ({ content }) => (
    <section className="py-24 bg-zinc-50 dark:bg-zinc-950 relative overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute top-[30%] left-[5%] w-96 h-96 bg-gold-500/10 blur-[130px] rounded-full animate-float-slow"></div>
            <div className="absolute bottom-[10%] right-[5%] w-80 h-80 bg-blue-500/10 blur-[120px] rounded-full animate-float-slow" style={{ animationDelay: '-4s' }}></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-24">
                <motion.h2
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="text-4xl md:text-6xl font-black mb-8 bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 via-gold-600 to-zinc-900 dark:from-white dark:via-gold-400 dark:to-white animate-text-flash"
                >
                    {content.benefitsTitle}
                </motion.h2>
                <div className="w-32 h-2 bg-gradient-to-r from-gold-600 to-gold-400 mx-auto rounded-full shadow-[0_0_20px_rgba(234,179,8,0.4)] mb-8 animate-pulse"></div>
                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-2xl text-zinc-600 dark:text-zinc-400 max-w-3xl mx-auto leading-relaxed font-bold italic animate-glow"
                >
                    {content.benefitsSubtitle}
                </motion.p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-10">
                {content.benefits.map((benefit, idx) => (
                    <RevealOnScroll key={idx} delay={idx * 150}>
                        <motion.div
                            whileHover={{ scale: 1.1, rotate: idx % 2 === 0 ? 2 : -2, y: -20 }}
                            whileTap={{ scale: 0.9 }}
                            className="group relative h-full"
                        >
                            {/* Animated Background Glow */}
                            <div className="absolute -inset-1 bg-gradient-to-r from-gold-600 via-blue-500 to-purple-600 rounded-[2.5rem] blur opacity-20 group-hover:opacity-50 animate-pulse transition-opacity duration-500"></div>

                            <div className="relative p-10 bg-white dark:bg-zinc-900/90 backdrop-blur-3xl rounded-[2.2rem] border-2 border-zinc-200 dark:border-zinc-800/50 hover:border-gold-500/50 transition-all duration-500 h-full shadow-2xl flex flex-col items-center text-center card-shine animate-glow overflow-hidden">

                                <div className="w-24 h-24 bg-gradient-to-br from-gold-50 to-white dark:from-gold-950/20 dark:to-zinc-900 rounded-3xl flex items-center justify-center mb-10 text-gold-500 shadow-2xl group-hover:scale-125 group-hover:rotate-12 transition-all duration-700 border-2 border-gold-500/20 relative overflow-hidden animate-float-slow">
                                    <div className="absolute inset-0 bg-gold-500/10 animate-pulse"></div>
                                    <IconRenderer iconKey={benefit.iconKey} className="w-12 h-12 relative z-10 drop-shadow-[0_0_15px_rgba(234,179,8,0.4)]" />
                                </div>

                                <h3 className="text-2xl font-black mb-6 text-zinc-900 dark:text-white group-hover:text-gold-500 transition-colors duration-300 uppercase tracking-tighter leading-none animate-text-flash">
                                    {benefit.title}
                                </h3>

                                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-lg font-bold">
                                    {benefit.description}
                                </p>

                                {/* Interactive Accent Line */}
                                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-0 group-hover:w-3/4 h-2 bg-gradient-to-r from-gold-600 to-yellow-300 rounded-full transition-all duration-700 opacity-0 group-hover:opacity-100 shadow-[0_0_25px_rgba(234,179,8,0.6)] animate-shimmer"></div>
                            </div>
                        </motion.div>
                    </RevealOnScroll>
                ))}
            </div>
        </div>
    </section>
);

export default BenefitsSection;
