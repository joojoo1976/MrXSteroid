import React from 'react';
import { motion } from 'framer-motion';
import { RefreshCcw, ShieldAlert, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { Page, ContentStrings } from '../types';
import { usePreferences } from '../context/PreferencesContext';

interface ReturnPolicyPageProps {
    content: ContentStrings;
    navigateTo: (page: Page) => void;
}

const ReturnPolicyPage: React.FC<ReturnPolicyPageProps> = ({ content, navigateTo }) => {
    const { isRTL } = usePreferences();
    return (
        <div className="max-w-4xl mx-auto space-y-12 pb-20">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-4"
            >
                <div className="w-20 h-20 bg-orange-500/10 rounded-[2rem] flex items-center justify-center mx-auto text-orange-500 mb-6 border border-orange-500/20">
                    <RefreshCcw className="w-10 h-10" />
                </div>
                <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">
                    {content.returnPolicyTitle}
                </h1>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8">
                <section className="p-8 rounded-[3rem] bg-zinc-900 border border-zinc-800 space-y-6">
                    <div className="flex items-center gap-4 text-green-500">
                        <CheckCircle2 className="w-6 h-6" />
                        <h2 className="text-2xl font-black uppercase tracking-tight">
                            {content.returnPolicyExchangeAllowed || (isRTL ? "مسموح بالاستبدال" : "Exchange Allowed")}
                        </h2>
                    </div>
                    <ul className="space-y-4 text-zinc-400">
                        <li className="flex gap-3"><AlertCircle className="w-5 h-5 shrink-0" /> {content.returnPolicyExchangeReason1 || (isRTL ? "إذا وصل المنتج تالفاً أو ناقصاً." : "If the product arrives damaged or incomplete.")}</li>
                        <li className="flex gap-3"><AlertCircle className="w-5 h-5 shrink-0" /> {content.returnPolicyExchangeReason2 || (isRTL ? "إذا كان هناك خطأ في نوع المنتج المرسل." : "If there is an error in the type of product sent.")}</li>
                        <li className="flex gap-3"><AlertCircle className="w-5 h-5 shrink-0" /> {content.returnPolicyExchangeReason3 || (isRTL ? "خلال 7 أيام من تاريخ الاستلام." : "Within 7 days of the date of receipt.")}</li>
                    </ul>
                </section>

                <section className="p-8 rounded-[3rem] bg-zinc-900 border border-zinc-800 space-y-6">
                    <div className="flex items-center gap-4 text-red-500">
                        <XCircle className="w-6 h-6" />
                        <h2 className="text-2xl font-black uppercase tracking-tight">
                            {content.returnPolicyNonReturnable || (isRTL ? "غير قابل للإرجاع" : "Non-Returnable")}
                        </h2>
                    </div>
                    <ul className="space-y-4 text-zinc-400">
                        <li className="flex gap-3"><ShieldAlert className="w-5 h-5 shrink-0" /> {content.returnPolicyNonReturnableReason1 || (isRTL ? "المنتجات الرقمية (كتب إلكترونية وجداول)." : "Digital products (e-books and spreadsheets).")}</li>
                        <li className="flex gap-3"><ShieldAlert className="w-5 h-5 shrink-0" /> {content.returnPolicyNonReturnableReason2 || (isRTL ? "المنتجات التي تم فتح غلافها الأصلي." : "Products whose original packaging has been opened.")}</li>
                        <li className="flex gap-3"><ShieldAlert className="w-5 h-5 shrink-0" /> {content.returnPolicyNonReturnableReason3 || (isRTL ? "طلبات الكوتشينج التي تم البدء فيها." : "Coaching requests that have been started.")}</li>
                    </ul>
                </section>
            </div>

            <div className="p-10 rounded-[3rem] bg-zinc-900 border border-zinc-800">
                <h3 className="text-2xl font-black mb-6 uppercase text-gold-500">
                    {content.returnPolicyHowToStepsTitle || (isRTL ? "خطوات تقديم الطلب" : "How to Request?")}
                </h3>
                <div className="space-y-6">
                    <p className="text-zinc-400 text-lg leading-relaxed">
                        {content.returnPolicyHowToStepsText || (isRTL
                            ? "يرجى مراسلتنا عبر البريد الإلكتروني المخصص للدعم الفني مع تزويدنا برقم الطلب وصور توضيحية للمشكلة إن وجدت. سيتم الرد على طلبك خلال 24 ساعة عمل."
                            : "Please contact us via the dedicated support email with your order number and explanatory photos of the problem, if any. Your request will be answered within 24 business hours.")}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ReturnPolicyPage;
