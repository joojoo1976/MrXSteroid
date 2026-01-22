import React from 'react';
import { motion } from 'framer-motion';
import { Shield, EyeOff, Info, Scale } from 'lucide-react';
import { Page, ContentStrings } from '../types';
import { usePreferences } from '../context/PreferencesContext';

interface CCPAPageProps {
    content: ContentStrings;
    navigateTo: (page: Page) => void;
}

const CCPAPage: React.FC<CCPAPageProps> = ({ content, navigateTo }) => {
    const { isRTL } = usePreferences();
    return (
        <div className="max-w-4xl mx-auto space-y-12 pb-20">
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-8 mb-12"
            >
                <div className="w-20 h-20 rounded-[2rem] bg-indigo-500/20 flex items-center justify-center text-indigo-500 shadow-[0_0_50px_-12px_rgba(99,102,241,0.5)]">
                    <Scale className="w-10 h-10" />
                </div>
                <div>
                    <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">
                        {content.ccpaTitle}
                    </h1>
                    <p className="text-zinc-500 font-bold uppercase tracking-widest text-sm">
                        {isRTL ? "حقوق المستهلك في كاليفورنيا" : "California Consumer Privacy Rights"}
                    </p>
                </div>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8">
                <div className="p-8 rounded-[2.5rem] bg-zinc-900 border border-zinc-800 space-y-4">
                    <div className="flex items-center gap-3 text-indigo-400">
                        <Info className="w-5 h-5" />
                        <h3 className="font-black uppercase tracking-tight">{isRTL ? "حق المعرفة" : "Right to Know"}</h3>
                    </div>
                    <p className="text-zinc-400">
                        {isRTL ? "لك الحق في معرفة البيانات الشخصية التي نجمعها عنك والجهة التي يتم مشاركتها معها." : "You have the right to know what personal data we collect about you and who it's shared with."}
                    </p>
                </div>

                <div className="p-8 rounded-[2.5rem] bg-zinc-900 border border-zinc-800 space-y-4">
                    <div className="flex items-center gap-3 text-indigo-400">
                        <EyeOff className="w-5 h-5" />
                        <h3 className="font-black uppercase tracking-tight">{isRTL ? "حق الرفض" : "Right to Opt-Out"}</h3>
                    </div>
                    <p className="text-zinc-400">
                        {isRTL ? "يمكنك في أي وقت طلب التوقف عن معالجة بياناتك الشخصية لأغراض تجارية." : "You can at any time request to stop processing your personal data for commercial purposes."}
                    </p>
                </div>
            </div>

            <section className="p-12 rounded-[3.5rem] bg-gradient-to-br from-indigo-500/5 via-zinc-900 to-transparent border border-zinc-800 relative overflow-hidden">
                <div className="relative z-10 space-y-6">
                    <h2 className="text-3xl font-black uppercase">{isRTL ? "سياسة عدم الحذف" : "Anti-Discrimination Policy"}</h2>
                    <p className="text-zinc-400 text-lg leading-relaxed">
                        {isRTL
                            ? "نؤكد في منصة Mr. X-Steroid أننا لن نمارس أي تمييز ضدك بسبب ممارسة حقوقك في الخصوصية، بما في ذلك تقديم نفس مستوى جودة الخدمة لجميع المستخدمين."
                            : "We confirm on the Mr. X-Steroid platform that we will not discriminate against you for exercising your privacy rights, including providing the same level of service quality to all users."}
                    </p>
                </div>
                <Shield className="absolute -bottom-10 -right-10 w-64 h-64 text-indigo-500/5 rotate-12" />
            </section>
        </div>
    );
};

export default CCPAPage;
