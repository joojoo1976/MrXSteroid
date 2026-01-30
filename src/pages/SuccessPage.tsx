import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight, Download, BookOpen, ShieldCheck } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Page, ContentStrings } from '../types';
import { usePreferences } from '../context/PreferencesContext';

interface SuccessPageProps {
    content: ContentStrings;
    navigateTo: (page: Page) => void;
}

const SuccessPage: React.FC<SuccessPageProps> = ({ content, navigateTo }) => {
    const { isRTL } = usePreferences();

    useEffect(() => {
        // Analytics or tracking could be placed here
        console.debug("Payment Success Page Mounted");
    }, []);

    return (
        <div className="min-h-screen py-20 px-4 flex items-center justify-center bg-black overflow-hidden relative">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-green-500/10 blur-[120px] rounded-full" />

            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="max-w-xl w-full relative z-10"
            >
                <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-2xl border-2 overflow-hidden shadow-2xl">
                    <div className="h-2 bg-gradient-to-r from-green-500 via-emerald-400 to-green-500 animate-shimmer" />
                    <CardContent className="p-8 md:p-12 text-center space-y-8">
                        <motion.div
                            initial={{ rotate: -10, scale: 0 }}
                            animate={{ rotate: 0, scale: 1 }}
                            transition={{ type: "spring", damping: 12 }}
                            className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto border-2 border-green-500/20"
                        >
                            <CheckCircle className="w-12 h-12 text-green-500" />
                        </motion.div>

                        <div className="space-y-4">
                            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter uppercase">
                                {isRTL ? "تم بنجاح! شكراً لك" : "PAYMENT SUCCESSFUL!"}
                            </h1>
                            <p className="text-zinc-400 font-medium leading-relaxed">
                                {isRTL
                                    ? "تم تفعيل اشتراكك في بروتوكول مستر إكس. ستصلك رسالة تأكيد عبر الواتساب فوراً."
                                    : "Your subscription to the Mr. X protocols has been activated. A welcome WhatsApp message is on its way."}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-left space-y-2">
                                <Download className="w-5 h-5 text-gold-500" />
                                <p className="text-xs font-black text-white uppercase tracking-widest">{isRTL ? "تحميل فوري" : "Instant Access"}</p>
                                <p className="text-[10px] text-zinc-500 font-bold">{isRTL ? "رابط التحميل مُتاح الآن" : "Download link is ready"}</p>
                            </div>
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-left space-y-2">
                                <ShieldCheck className="w-5 h-5 text-gold-500" />
                                <p className="text-xs font-black text-white uppercase tracking-widest">{isRTL ? "بروتوكول محمي" : "Secured Protocol"}</p>
                                <p className="text-[10px] text-zinc-500 font-bold">{isRTL ? "تشفير عالي المستوى" : "High-level encryption"}</p>
                            </div>
                        </div>

                        <div className="space-y-4 pt-4">
                            <Button
                                onClick={() => navigateTo(Page.DASHBOARD)}
                                className="w-full py-8 bg-gold-500 hover:bg-gold-400 text-black font-black text-xl rounded-2xl shadow-[0_0_40px_rgba(234,179,8,0.2)] group"
                            >
                                <BookOpen className="w-6 h-6 mr-2 transition-transform group-hover:scale-110" />
                                {isRTL ? "الدخول للمكتبة" : "ENTER ELITE DASHBOARD"}
                                <ArrowRight className={`ml-2 w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
                            </Button>

                            <button
                                onClick={() => navigateTo(Page.HOME)}
                                className="text-zinc-500 hover:text-white text-xs font-black uppercase tracking-widest transition-colors duration-300"
                            >
                                {isRTL ? "العودة للرئيسية" : "BACK TO HOME"}
                            </button>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
};

export default SuccessPage;
