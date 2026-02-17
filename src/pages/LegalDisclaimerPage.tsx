import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Gavel, ShieldCheck, HeartPulse, Scale } from 'lucide-react';
import { Page, ContentStrings } from '../types';
import { usePreferences } from '../context/PreferencesContext';
import DynamicBrandLogo from '../shared/ui/DynamicBrandLogo';

interface LegalDisclaimerPageProps {
    content: ContentStrings;
    navigateTo: (page: Page) => void;
}

const LegalDisclaimerPage: React.FC<LegalDisclaimerPageProps> = ({ content, navigateTo }) => {
    const { isRTL } = usePreferences();
    return (
        <div className="max-w-4xl mx-auto space-y-12 pb-20">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-4"
            >
                <div className="w-24 h-24 bg-red-500/10 rounded-[3rem] flex items-center justify-center mx-auto text-red-500 mb-6 border border-red-500/20 shadow-[0_0_50px_-10px_rgba(239,68,68,0.3)]">
                    <AlertCircle className="w-12 h-12" />
                </div>
                <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-red-500">
                    {content.legalDisclaimerTitle}
                </h1>
            </motion.div>

            <div className="space-y-6">
                <section className="p-10 rounded-[4rem] bg-zinc-900 border border-zinc-800 relative overflow-hidden">
                    <div className="relative z-10 space-y-8">
                        <div className="flex items-center gap-4 text-white">
                            <Gavel className="w-8 h-8 text-gold-500" />
                            <h2 className="text-3xl font-black uppercase">{isRTL ? "إخلاء مسؤولية عام" : "General Disclaimer"}</h2>
                        </div>
                        <p className="text-zinc-400 text-xl leading-relaxed italic">
                            {isRTL
                                ? <>المحتوى المنشور على منصة <DynamicBrandLogo inline variant="full" /> مخصص حصرياً للأغراض التعليمية، العلمية، والبحثية. نحن لا نشجع، لا نؤيد، ولا نحث على استخدام أي مواد غير قانونية أو طبية دون استشارة طبية متخصصة.</>
                                : <>The content published on the <DynamicBrandLogo inline variant="full" /> platform is intended exclusively for educational, scientific, and research purposes. We do not encourage, endorse, or urge the use of any illegal or medical substances without specialized medical consultation.</>}
                        </p>
                    </div>
                    <Scale className="absolute -bottom-10 -right-10 w-64 h-64 text-zinc-900/50 -rotate-12" />
                </section>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="p-8 rounded-[3rem] bg-zinc-900/50 border border-zinc-800 space-y-4">
                        <HeartPulse className="w-8 h-8 text-red-500" />
                        <h3 className="text-xl font-black uppercase">{isRTL ? "المسؤولية الطبية" : "Medical Responsibility"}</h3>
                        <p className="text-zinc-500 leading-relaxed">
                            {isRTL
                                ? "يجب عليك دائماً استشارة طبيب مؤهل قبل بدء أي نظام غذائي أو رياضي. أنت تتحمل المسؤولية الكاملة عن أي قرارات تتخذها بناءً على المعلومات المتاحة هنا."
                                : "You must always consult a qualified physician before starting any diet or exercise regimen. You assume full responsibility for any decisions you make based on the information available here."}
                        </p>
                    </div>

                    <div className="p-8 rounded-[3rem] bg-zinc-900/50 border border-zinc-800 space-y-4">
                        <ShieldCheck className="w-8 h-8 text-blue-500" />
                        <h3 className="text-xl font-black uppercase">{isRTL ? "الدقة والموثوقية" : "Accuracy & Reliability"}</h3>
                        <p className="text-zinc-500 leading-relaxed">
                            {isRTL
                                ? "بينما نسعى جاهدين لتقديم أدق الدراسات العلمية، فإن العلوم الرياضية تتطور باستمرار. لا نضمن أن تكون كافة المعلومات محدثة لحظياً بنسبة 100%."
                                : "While we strive to provide the most accurate scientific studies, sports science is constantly evolving. We do not guarantee that all information is updated 100% instantaneously."}
                        </p>
                    </div>
                </div>
            </div>

            <div className="text-center p-8 border-t border-zinc-900">
                <button
                    onClick={() => navigateTo(Page.TERMS)}
                    className="text-zinc-500 hover:text-white font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 mx-auto"
                >
                    {isRTL ? "عرض شروط الاستخدام كاملة" : "View Full Terms of Service"}
                    <Scale className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export default LegalDisclaimerPage;
