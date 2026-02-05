import React from 'react';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';

export const ArabicVideoSection: React.FC = () => {
    return (
        <section className="container mx-auto px-4 mb-20">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative overflow-hidden rounded-[2.5rem] md:rounded-[3.5rem] bg-zinc-900 border border-zinc-800/50 p-6 md:p-12 shadow-[0_0_50px_rgba(0,0,0,0.5)] group"
            >
                {/* Visual accents */}
                <div className="absolute top-0 start-0 w-full h-[1px] bg-gradient-to-r from-transparent via-gold-500/50 to-transparent"></div>
                <div className="absolute -bottom-24 -end-24 w-64 h-64 bg-gold-500/5 blur-[100px] rounded-full"></div>

                <div className="flex flex-col xl:flex-row items-center gap-10 xl:gap-20">
                    <div className="flex-1 space-y-6 md:space-y-8">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="flex items-center gap-3 text-gold-500"
                        >
                            <div className="p-2.5 rounded-xl bg-gold-500/10 border border-gold-500/20 shadow-[0_0_15px_rgba(234,179,8,0.1)]">
                                <Play className="w-5 h-5 fill-current" />
                            </div>
                            <span className="text-xs md:text-sm font-black uppercase tracking-[0.2em] text-gold-500 drop-shadow-sm">فيديو تعريفي حصري</span>
                        </motion.div>

                        <h2 className="text-3xl md:text-5xl xl:text-6xl font-black tracking-tight text-white leading-[1.1]">
                            اكتشف ثورة <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-gold-600">التدريب الذكي</span> مع مستر إكس
                        </h2>

                        <p className="text-zinc-400 text-base md:text-xl leading-relaxed font-medium max-w-2xl">
                            انضم إلينا في هذه الجولة السريعة لتكتشف كيف ندمج العلم بالتكنولوجيا لتغيير قواعد اللعبة في عالم كمال الأجسام. شاهد الفيديو للتعرف على رؤيتنا وأدواتنا المتطورة.
                        </p>

                        <div className="flex flex-wrap gap-4 pt-4">
                            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-800/50 border border-zinc-700/50 text-[10px] md:text-xs font-bold text-zinc-300">
                                <span className="w-1.5 h-1.5 rounded-full bg-gold-500 animate-pulse"></span>
                                جودة عالية 4K
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-800/50 border border-zinc-700/50 text-[10px] md:text-xs font-bold text-zinc-300">
                                <span className="w-1.5 h-1.5 rounded-full bg-gold-500 animate-pulse"></span>
                                شرح تفصيلي
                            </div>
                        </div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4, duration: 0.6 }}
                        className="flex-1 w-full aspect-video rounded-[2rem] overflow-hidden border border-zinc-800/80 shadow-[0_20px_60px_rgba(0,0,0,0.8)] relative group/video cursor-pointer active:scale-[0.98] transition-transform"
                    >
                        <div className="absolute inset-0 bg-gold-500/5 group-hover/video:bg-transparent transition-colors z-10 pointer-events-none"></div>
                        <iframe
                            width="100%"
                            height="100%"
                            src="https://www.youtube.com/embed/CBU1p650G7I?si=1dRgij4qZgJxiG3H"
                            title="YouTube video player"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            referrerPolicy="strict-origin-when-cross-origin"
                            allowFullScreen
                            className="w-full h-full relative z-20"
                        ></iframe>

                        {/* Interactive overlay (subtle) */}
                        <div className="absolute inset-0 border-[1px] border-white/5 rounded-[2rem] pointer-events-none z-30"></div>
                    </motion.div>
                </div>
            </motion.div>
        </section>
    );
};

export default ArabicVideoSection;
