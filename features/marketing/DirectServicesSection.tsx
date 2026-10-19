'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Crown, Stethoscope, Check, AlertCircle, ShieldAlert } from 'lucide-react';
import { usePreferences } from '../../context/PreferencesContext';
import { getKashierServicePaymentLink } from '../../server/payments/paymentLinkConfig';

export const DirectServicesSection: React.FC = () => {
    const { isRTL } = usePreferences();

    const coachingLink = getKashierServicePaymentLink('coaching_addon');
    const consultationLink = getKashierServicePaymentLink('consultation');

    // CONFIGURED = env-verified; UNVERIFIED = owner-approved static link (see paymentLinkConfig.ts fallbacks)
    const isCoachingActive = coachingLink.status === 'CONFIGURED' || coachingLink.status === 'UNVERIFIED';
    const isConsultationActive = consultationLink.status === 'CONFIGURED' || consultationLink.status === 'UNVERIFIED';

    return (
        <div className="mt-16 pt-12 border-t border-zinc-800/80">
            <div className="text-center mb-10">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-black uppercase tracking-widest text-[11px] mb-3">
                    <Crown className="w-3.5 h-3.5 fill-current" />
                    <span>{isRTL ? 'الخدمات الاستشارية والتدريبية المباشرة (GLOBAL / USD)' : 'Direct Professional Services (GLOBAL / USD)'}</span>
                </div>
                <h3 className="text-xl md:text-3xl font-black text-white uppercase tracking-tight">
                    {isRTL ? 'استشارات وبرامج تدريب خاصة مستقلة' : 'Dedicated 1-on-1 Coaching & Assessments'}
                </h3>
                <p className="text-zinc-400 text-xs md:text-sm max-w-xl mx-auto mt-2">
                    {isRTL
                        ? 'خدمات تخصصية مستقلة تقدم مباشرة دون الحاجة لشراء الباقات الكاملة. الفوترة بالدولار الأمريكي (USD).'
                        : 'Standalone expert services delivered directly without requiring full package purchases. Billed in USD.'
                    }
                </p>
                <div className="mt-2 text-[10px] text-zinc-500 font-medium">
                    {isRTL
                        ? '⚠️ ملاحظة مالية: الرسوم تُحصّل بالدولار للعميل الدولي، وتخضع التسوية المصرفية لضوابط حساب التاجر لدى بوابة الدفع.'
                        : '⚠️ Financial note: Charges are billed in USD to the buyer; merchant settlement follows provider banking rules.'
                    }
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                {/* 1. VIP Coaching Card */}
                <div className="bg-zinc-900/60 rounded-3xl p-6 md:p-8 border border-zinc-800 relative flex flex-col justify-between hover:border-emerald-500/30 transition-all shadow-xl">
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <span className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20">
                                <Crown className="w-6 h-6" />
                            </span>
                            <span className="text-[10px] uppercase font-black tracking-widest px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700">
                                {isRTL ? 'دورة كاملة' : 'Full Cycle'}
                            </span>
                        </div>

                        <h4 className="text-lg md:text-xl font-black text-white mb-1">
                            {isRTL ? 'تدريب شخصي 1-على-1 (دورة كاملة)' : 'VIP 1-on-1 Cycle Coaching'}
                        </h4>
                        <p className="text-xs text-zinc-400 mb-4">
                            {isRTL
                                ? 'إشراف وتوجيه مباشر وتعديل أسبوعي للجرعات والمؤشرات الحيوية.'
                                : 'Direct expert oversight with weekly adjustments and health monitoring.'}
                        </p>

                        <div className="mb-6 p-4 bg-black/40 rounded-2xl border border-zinc-800">
                            <div className="text-3xl font-black text-white tracking-tight">
                                $349.99 <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">USD</span>
                            </div>
                            <div className="text-[10px] text-zinc-500 mt-1">
                                {isRTL ? 'دفعة واحدة لكامل مدة الدورة + المتابعة' : 'Single payment for entire cycle duration'}
                            </div>
                        </div>

                        <ul className="space-y-2.5 mb-6 text-xs text-zinc-300">
                            <li className="flex items-start gap-2">
                                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                                <span>{isRTL ? 'متابعة دورية مباشرة عبر تيليجرام / واتساب مخصص' : 'Direct weekly check-ins via dedicated channel'}</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                                <span>{isRTL ? 'تحليل معمق لفحوصات الدم الدورية قبل وأثناء وبعد الدورة' : 'Comprehensive pre, intra, and post bloodwork reviews'}</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                                <span>{isRTL ? 'تصميم بروتوكول التنظيف (PCT) المخصص وحماية الخصوبة' : 'Tailored Safe-Exit PCT and fertility preservation'}</span>
                            </li>
                        </ul>
                    </div>

                    <div>
                        {isCoachingActive ? (
                            <a
                                href={coachingLink.liveUrl || '#'}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full py-3.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                            >
                                <span>{isRTL ? 'حجز التدريب الشخصي الآن' : 'Enroll in VIP Coaching'}</span>
                            </a>
                        ) : (
                            <button
                                type="button"
                                disabled
                                className="w-full py-3.5 px-4 rounded-xl bg-zinc-800/80 border border-zinc-700/60 text-zinc-400 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-not-allowed opacity-80"
                            >
                                <AlertCircle className="w-4 h-4 text-amber-400" />
                                <span>{isRTL ? 'الدفع غير متاح مؤقتًا — سيتم التفعيل قريبًا' : 'Payment temporarily unavailable — Activating soon'}</span>
                            </button>
                        )}
                        <p className="text-[9px] text-zinc-500 text-center mt-2">
                            {coachingLink.verificationNotice}
                        </p>
                    </div>
                </div>

                {/* 2. Custom Consultation Card */}
                <div className="bg-zinc-900/60 rounded-3xl p-6 md:p-8 border border-zinc-800 relative flex flex-col justify-between hover:border-cyan-500/30 transition-all shadow-xl">
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <span className="p-3 bg-cyan-500/10 text-cyan-400 rounded-2xl border border-cyan-500/20">
                                <Stethoscope className="w-6 h-6" />
                            </span>
                            <span className="text-[10px] uppercase font-black tracking-widest px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700">
                                {isRTL ? 'جلسة واحدة' : 'Single Session'}
                            </span>
                        </div>

                        <h4 className="text-lg md:text-xl font-black text-white mb-1">
                            {isRTL ? 'جلسة تقييم واستشارة مخصصة' : 'Custom Consultation & Assessment'}
                        </h4>
                        <p className="text-xs text-zinc-400 mb-4">
                            {isRTL
                                ? 'مراجعة ملفك الصحي وتحاليلك الطبية ووضع خطة تصحيحية محكمة.'
                                : 'Single comprehensive assessment covering bloodwork & protocols.'}
                        </p>

                        <div className="mb-6 p-4 bg-black/40 rounded-2xl border border-zinc-800">
                            <div className="text-3xl font-black text-white tracking-tight">
                                $30.00 <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">USD</span>
                            </div>
                            <div className="text-[10px] text-zinc-500 mt-1">
                                {isRTL ? 'جلسة تقييم تفصيلية شاملة' : 'Single comprehensive assessment session'}
                            </div>
                        </div>

                        <ul className="space-y-2.5 mb-6 text-xs text-zinc-300">
                            <li className="flex items-start gap-2">
                                <Check className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                                <span>{isRTL ? 'مراجعة تحاليل الدم وتحديد الخلل الهرموني بدقة' : 'In-depth blood panel diagnostic review'}</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <Check className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                                <span>{isRTL ? 'إرشادات موازنة الإستروجين والبرولاكتين ومثبطات الأروماتاز' : 'Estrogen & prolactin balance remediation'}</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <Check className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                                <span>{isRTL ? 'تقرير مكتوب بالتوصيات وخطة العمل الآمنة' : 'Detailed written recommendations & action plan'}</span>
                            </li>
                        </ul>
                    </div>

                    <div>
                        {isConsultationActive ? (
                            <a
                                href={consultationLink.liveUrl || '#'}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full py-3.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20"
                            >
                                <span>{isRTL ? 'حجز جلسة الاستشارة الآن' : 'Book Consultation Session'}</span>
                            </a>
                        ) : (
                            <button
                                type="button"
                                disabled
                                className="w-full py-3.5 px-4 rounded-xl bg-zinc-800/80 border border-zinc-700/60 text-zinc-400 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-not-allowed opacity-80"
                            >
                                <AlertCircle className="w-4 h-4 text-amber-400" />
                                <span>{isRTL ? 'الدفع غير متاح مؤقتًا — سيتم التفعيل قريبًا' : 'Payment temporarily unavailable — Activating soon'}</span>
                            </button>
                        )}
                        <p className="text-[9px] text-zinc-500 text-center mt-2">
                            {consultationLink.verificationNotice}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
