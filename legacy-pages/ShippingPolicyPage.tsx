'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Truck, Globe, ShieldCheck, Box, Clock } from 'lucide-react';
import { Page, ContentStrings } from '@/shared/types/types';
import { usePreferences } from '../context/PreferencesContext';

interface ShippingPolicyPageProps {
    content: ContentStrings;
    navigateTo: (page: Page) => void;
}

const ShippingPolicyPage: React.FC<ShippingPolicyPageProps> = ({ content }) => {
    const { isRTL } = usePreferences();
    const shippingDetails = [
        {
            title: isRTL ? "الشحن الدولي" : "International Shipping",
            content: isRTL ? "نشحن إلى أكثر من 150 دولة حول العالم عبر شركائنا المعتمدين (DHL, FedEx). جميع الشحنات يتم تتبعها بالكامل." : "We ship to over 150 countries worldwide via our certified partners (DHL, FedEx). All shipments are fully tracked.",
            icon: Globe
        },
        {
            title: isRTL ? "زمن التجهيز" : "Processing Time",
            content: isRTL ? "يتم تجهيز الطلبات الرقمية فوراً، بينما الطلبات المادية تستغرق 24-48 ساعة للتجهيز قبل الشحن." : "Digital orders are processed immediately, while physical orders take 24-48 hours to process before shipping.",
            icon: Clock
        },
        {
            title: isRTL ? "التغليف السري" : "Discreet Packaging",
            content: isRTL ? "نحن ندرك أهمية الخصوصية؛ لذا يتم تغليف جميع الطلبات بشكل سري تماماً دون أي إشارة إلى محتويات الشحنة." : "We understand the importance of privacy; so all orders are packaged completely discreetly with no indication of shipment contents.",
            icon: ShieldCheck
        }
    ];

    return (
        <div className="max-w-4xl mx-auto space-y-12 pb-20">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-4"
            >
                <div className="w-20 h-20 bg-green-500/10 rounded-[2rem] flex items-center justify-center mx-auto text-green-500 mb-6 border border-green-500/20">
                    <Truck className="w-10 h-10" />
                </div>
                <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">
                    {content.shippingPolicyTitle}
                </h1>
                <p className="text-zinc-500 font-bold uppercase tracking-widest text-sm">
                    {isRTL ? "توصيل آمن وسريع حول العالم" : "Secure and Fast Worldwide Delivery"}
                </p>
            </motion.div>

            <div className="grid gap-6">
                {shippingDetails.map((detail, idx) => (
                    <motion.div
                        key={idx}
                        whileHover={{ x: isRTL ? -10 : 10 }}
                        className="p-8 rounded-[2.5rem] bg-zinc-900/50 border border-zinc-800 flex gap-8 items-start hover:border-green-500/30 transition-all"
                    >
                        <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-green-500 shrink-0">
                            <detail.icon className="w-6 h-6" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-black uppercase tracking-tight">{detail.title}</h3>
                            <p className="text-zinc-400 text-lg leading-relaxed">{detail.content}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            <section className="p-10 rounded-[3rem] bg-green-500/5 border border-green-500/20 relative overflow-hidden">
                <h2 className="text-2xl font-black mb-4 uppercase">{isRTL ? "الرسوم والضرائب" : "Customs & Duties"}</h2>
                <p className="text-zinc-400 leading-relaxed">
                    {isRTL
                        ? "يتحمل العميل أي رسوم جمركية أو ضرائب محلية قد تفرضها دولته عند دخول الشحنة. نحن نوفر كافة الأوراق الرسمية اللازمة لتسهيل عملية التخليص."
                        : "The customer is responsible for any customs duties or local taxes that their country may impose upon shipment entry. We provide all necessary official paperwork to facilitate the clearance process."}
                </p>
                <Box className="absolute -bottom-10 -right-10 w-48 h-48 text-green-500/5 rotate-12" />
            </section>
        </div>
    );
};

export default ShippingPolicyPage;
