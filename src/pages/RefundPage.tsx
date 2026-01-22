import React from 'react';
import { motion } from 'framer-motion';
import { DollarSign, ShieldAlert, CheckCircle, PackageX, HelpCircle } from 'lucide-react';
import { Page, ContentStrings } from '../types';
import { usePreferences } from '../context/PreferencesContext';

interface RefundPageProps {
    content: ContentStrings;
    navigateTo: (page: Page) => void;
}

const RefundPage: React.FC<RefundPageProps> = ({ content, navigateTo }) => {
    const { isRTL } = usePreferences();
    return (
        <div className="max-w-4xl mx-auto space-y-12 pb-20">
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-center space-y-4"
            >
                <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto text-emerald-500 mb-6 border border-emerald-500/20">
                    <DollarSign className="w-10 h-10" />
                </div>
                <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">
                    {content.refundTitle}
                </h1>
            </motion.div>

            <div className="grid gap-6">
                <section className="p-8 rounded-[3rem] bg-zinc-900 border border-zinc-800 flex gap-6">
                    <PackageX className="w-12 h-12 text-red-500 shrink-0" />
                    <div className="space-y-2">
                        <h2 className="text-xl font-black uppercase text-white">{isRTL ? "المنتجات الرقمية" : "Digital Products"}</h2>
                        <p className="text-zinc-500">
                            {isRTL
                                ? "نظراً لطبيعة المنتجات الرقمية (كتب إلكترونية، خطط تدريبية)، فإن جميع المبيعات نهائية وغير قابلة للاسترداد بمجرد منح الوصول للمحتوى."
                                : "Due to the nature of digital products (e-books, training plans), all sales are final and non-refundable once access to the content has been granted."}
                        </p>
                    </div>
                </section>

                <section className="p-8 rounded-[3rem] bg-zinc-900 border border-zinc-800 flex gap-6">
                    <CheckCircle className="w-12 h-12 text-green-500 shrink-0" />
                    <div className="space-y-2">
                        <h2 className="text-xl font-black uppercase text-white">{isRTL ? "الخدمات الاستشارية" : "Consulting Services"}</h2>
                        <p className="text-zinc-500">
                            {isRTL
                                ? "يمكن طلب استرداد الأموال للخدمات الاستشارية (Coaching) فقط قبل البدء في تصميم الجدول أو إجراء المكالمة الاستشارية الأولى."
                                : "Refunds for consulting services (Coaching) can only be requested before the start of schedule design or the first consultation call."}
                        </p>
                    </div>
                </section>

                <section className="p-8 rounded-[3rem] bg-amber-500/5 border border-amber-500/20 flex gap-6">
                    <ShieldAlert className="w-12 h-12 text-amber-500 shrink-0" />
                    <div className="space-y-2">
                        <h2 className="text-xl font-black uppercase text-white">{isRTL ? "الحالات الاستثنائية" : "Exceptional Cases"}</h2>
                        <p className="text-zinc-500">
                            {isRTL
                                ? "في حال وجود خطأ تقني في معالجة الدفع أو تكرار العملية، يتم استرداد المبلغ بالكامل بعد التحقق من سجلات البنك."
                                : "In the event of a technical error in payment processing or duplicate operations, the full amount will be refunded after verifying bank records."}
                        </p>
                    </div>
                </section>
            </div>

            <div className="p-10 rounded-[2.5rem] bg-zinc-900 border border-zinc-800 flex flex-col items-center gap-6">
                <HelpCircle className="w-10 h-10 text-zinc-600" />
                <p className="text-zinc-400 text-center max-w-xl">
                    {isRTL
                        ? "إذا كان لديك أي استفسار بخصوص دفعتك، يرجى التواصل مع الدعم الفني فوراً."
                        : "If you have any questions regarding your payment, please contact technical support immediately."}
                </p>
                <button
                    onClick={() => navigateTo(Page.SUPPORT)}
                    className="text-gold-500 font-black uppercase text-sm tracking-widest hover:text-white transition-colors"
                >
                    {isRTL ? "الذهاب لمركز الدعم" : "Go to Support Center"}
                </button>
            </div>
        </div>
    );
};

export default RefundPage;
