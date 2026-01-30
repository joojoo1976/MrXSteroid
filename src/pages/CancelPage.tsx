import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowLeft, RotateCcw, MessageSquare, ShieldAlert } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Page, ContentStrings } from '../types';
import { usePreferences } from '../context/PreferencesContext';

interface CancelPageProps {
    content: ContentStrings;
    navigateTo: (page: Page) => void;
}

const CancelPage: React.FC<CancelPageProps> = ({ content, navigateTo }) => {
    const { isRTL } = usePreferences();

    return (
        <div className="min-h-screen py-20 px-4 flex items-center justify-center bg-black overflow-hidden relative">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-500/5 blur-[120px] rounded-full" />

            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="max-w-xl w-full relative z-10"
            >
                <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-2xl border-2 overflow-hidden shadow-2xl">
                    <div className="h-2 bg-gradient-to-r from-red-500 via-orange-400 to-red-500" />
                    <CardContent className="p-8 md:p-12 text-center space-y-8">
                        <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mx-auto border-2 border-red-500/20">
                            <ShieldAlert className="w-12 h-12 text-red-500" />
                        </div>

                        <div className="space-y-4">
                            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter uppercase">
                                {isRTL ? "تم إلغاء الدفع" : "PAYMENT CANCELLED"}
                            </h1>
                            <p className="text-zinc-400 font-medium leading-relaxed">
                                {isRTL
                                    ? "يبدو أنه تم إلغاء عملية الدفع قبل انتهائها. إذا واجهت أي مشكلة تقنية، نحن هنا للمساعدة."
                                    : "It looks like the payment was cancelled. If you encountered a technical issue, our support team is ready to help."}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div
                                onClick={() => navigateTo(Page.CHECKOUT)}
                                className="p-4 bg-white/5 rounded-2xl border border-white/10 text-left space-y-2 cursor-pointer hover:bg-white/10 transition-all group"
                            >
                                <RotateCcw className="w-5 h-5 text-gold-500 group-hover:rotate-[-45deg] transition-transform" />
                                <p className="text-xs font-black text-white uppercase tracking-widest">{isRTL ? "إعادة المحاولة" : "RETRY PAYMENT"}</p>
                                <p className="text-[10px] text-zinc-500 font-bold">{isRTL ? "العودة لصفحة الدفع" : "Return to checkout"}</p>
                            </div>
                            <div
                                onClick={() => navigateTo(Page.SUPPORT)}
                                className="p-4 bg-white/5 rounded-2xl border border-white/10 text-left space-y-2 cursor-pointer hover:bg-white/10 transition-all group"
                            >
                                <MessageSquare className="w-5 h-5 text-gold-500 group-hover:scale-110 transition-transform" />
                                <p className="text-xs font-black text-white uppercase tracking-widest">{isRTL ? "دعم فني" : "GET SUPPORT"}</p>
                                <p className="text-[10px] text-zinc-500 font-bold">{isRTL ? "تحدث مع الفريق" : "Chat with our team"}</p>
                            </div>
                        </div>

                        <div className="pt-4 flex flex-col items-center gap-4">
                            <Button
                                onClick={() => navigateTo(Page.HOME)}
                                variant="outline"
                                className="w-full py-6 border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white font-bold text-lg rounded-xl transition-all"
                            >
                                <ArrowLeft className={`mr-2 w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
                                {isRTL ? "العودة للرئيسية" : "RETURN TO HOME"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
};

export default CancelPage;
