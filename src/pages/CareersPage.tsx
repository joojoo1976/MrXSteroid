import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Rocket, Users, Target, Code, Brain } from 'lucide-react';
import { Page, ContentStrings } from '../types';
import { usePreferences } from '../context/PreferencesContext';

interface CareersPageProps {
    content: ContentStrings;
    navigateTo: (page: Page) => void;
}

const CareersPage: React.FC<CareersPageProps> = ({ content, navigateTo }) => {
    const { isRTL } = usePreferences();
    const jobs = [
        {
            title: isRTL ? "باحث في الفيزياء الحيوية" : "Biophysics Researcher",
            type: isRTL ? "عن بعد" : "Remote",
            icon: Brain
        },
        {
            title: isRTL ? "محلل استجابة جينية" : "Genetic Response Analyst",
            type: isRTL ? "دوام كامل" : "Full Time",
            icon: Target
        },
        {
            title: isRTL ? "مطور محركات بروتوكولات" : "Protocol Engine Developer",
            type: isRTL ? "عقد" : "Contract",
            icon: Code
        }
    ];

    return (
        <div className="max-w-6xl mx-auto space-y-16 pb-20">
            <header className="relative py-20 px-8 rounded-[4rem] bg-zinc-900 border border-zinc-800 text-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-gold-500/10 via-transparent to-blue-500/10 opacity-50" />
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative z-10 space-y-6">
                    <Briefcase className="w-16 h-16 text-gold-500 mx-auto animate-bounce" />
                    <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter">
                        {content.careersTitle}
                    </h1>
                    <p className="text-zinc-500 text-xl font-bold max-w-2xl mx-auto tracking-widest italic animate-pulse">
                        {isRTL ? "ساهم في تعريف مستقبل الأداء البشري" : "Contribute to defining the future of human performance"}
                    </p>
                </motion.div>
            </header>

            <div className="grid md:grid-cols-2 gap-12">
                <div className="space-y-8">
                    <h2 className="text-3xl font-black uppercase tracking-tight flex items-center gap-4">
                        <Users className="text-gold-500" />
                        {isRTL ? "ثقافتنا" : "Our Culture"}
                    </h2>
                    <p className="text-zinc-400 text-lg leading-relaxed">
                        {isRTL
                            ? "في Mr. X-Steroid، نحن لا نوظف موظفين عاديين؛ نحن نبحث عن المبدعين والمتحمسين للعلوم الذين يرون ما وراء الحدود التقليدية للأداء البدني."
                            : "At Mr. X-Steroid, we don't just hire ordinary employees; we look for innovators and science enthusiasts who see beyond traditional boundaries of physical performance."}
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { title: isRTL ? "ابتكار" : "innovation", color: "bg-gold-500/10 text-gold-500" },
                            { title: isRTL ? "دقة" : "Precision", color: "bg-blue-500/10 text-blue-500" },
                            { title: isRTL ? "سرية" : "Secrecy", color: "bg-zinc-800 text-white" },
                            { title: isRTL ? "تأثير" : "Impact", color: "bg-white/10 text-white" }
                        ].map((trait, idx) => (
                            <div key={idx} className={`p-4 rounded-2xl text-center font-black uppercase text-xs tracking-widest ${trait.color}`}>
                                {trait.title}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-6">
                    <h2 className="text-2xl font-black uppercase tracking-tight mb-8">
                        {isRTL ? "الشواغر الحالية" : "Current Openings"}
                    </h2>
                    {jobs.map((job, idx) => (
                        <motion.div
                            key={idx}
                            whileHover={{ scale: 1.02, x: isRTL ? -10 : 10 }}
                            className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 flex items-center justify-between group cursor-pointer"
                        >
                            <div className="flex items-center gap-5">
                                <div className="w-12 h-12 rounded-xl bg-zinc-950 flex items-center justify-center text-zinc-500 group-hover:text-gold-500 transition-colors">
                                    <job.icon className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-black text-white uppercase tracking-tight">{job.title}</h4>
                                    <span className="text-xs text-zinc-600 font-bold uppercase">{job.type}</span>
                                </div>
                            </div>
                            <button title={isRTL ? "تقدم الآن" : "Apply Now"} className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center group-hover:bg-gold-500 group-hover:text-black transition-all">
                                <Rocket className="w-4 h-4" />
                            </button>
                        </motion.div>
                    ))}
                </div>
            </div>

            <div className="p-12 rounded-[4rem] bg-gradient-to-b from-zinc-900 to-black border border-zinc-800 text-center">
                <h3 className="text-2xl font-black mb-4">{isRTL ? "لم تجد تخصصك؟" : "Didn't find your specialty?"}</h3>
                <p className="text-zinc-500 mb-8 max-w-xl mx-auto">
                    {isRTL
                        ? "نحن دائماً منفتحون على المواهب الاستثنائية. أرسل لنا سيرتك الذاتية وخطاب اهتمام يوضح كيف يمكنك تغيير اللعبة."
                        : "We are always open to exceptional talents. Send us your CV and a letter of interest explaining how you can change the game."}
                </p>
                <a href="mailto:talent@mrxsteroid.com" className="text-gold-500 font-black uppercase tracking-[0.2em] border-b-2 border-gold-500/30 hover:border-gold-500 transition-all pb-2">
                    talent@mrxsteroid.com
                </a>
            </div>
        </div>
    );
};

export default CareersPage;
