import React from 'react';
import { motion } from 'framer-motion';
import { ContentStrings } from '../../types';
import { IconRenderer } from '../../utils/icon-utils';
import RevealOnScroll from '../../shared/ui/RevealOnScroll';
import { StyledBrandName } from '../../shared/ui/StyledBrandName';

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
                                whileHover={{ scale: 1.02 }}
                                className="group relative w-full"
                            >
                                <div className="flex items-center gap-3 p-3 bg-[#1a1a1a] rounded-lg border border-gray-800 hover:border-green-500 transition-all duration-300 w-full group">

                                    {/* حاوية الأيقونة: حجم صغير وثابت */}
                                    <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-green-500/10 rounded-md text-green-500 group-hover:scale-110 transition-transform">
                                        <IconRenderer iconKey={benefit.iconKey} className="w-5 h-5" />
                                    </div>

                                    {/* حاوية النصوص: العنوان بجانب الأيقونة مباشرة */}
                                    <div className="flex flex-col overflow-hidden text-start rtl:text-right ltr:text-left">
                                        <h3 className="text-sm font-bold text-white leading-tight truncate">
                                            <StyledBrandName text={benefit.title} />
                                        </h3>
                                        {/* وصف اختياري صغير جداً إذا أردت */}
                                        <p className="text-[10px] text-gray-400 mt-0.5 line-clamp-1">
                                            <StyledBrandName text={benefit.description} />
                                        </p>
                                    </div>
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
