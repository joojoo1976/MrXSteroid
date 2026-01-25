import React from 'react';
import { motion } from 'framer-motion';
import { Accessibility, Eye, Ear, Keyboard, MousePointer2 } from 'lucide-react';
import { Page, ContentStrings } from '../types';
import { usePreferences } from '../context/PreferencesContext';
import DynamicBrandLogo from '../components/layout/DynamicBrandLogo';

interface AccessibilityPageProps {
    content: ContentStrings;
    navigateTo: (page: Page) => void;
}

const AccessibilityPage: React.FC<AccessibilityPageProps> = ({ content, navigateTo }) => {
    const { isRTL } = usePreferences();
    const sections = [
        {
            title: isRTL ? "التزامنا" : "Our Commitment",
            content: isRTL
                ? <>يلتزم <DynamicBrandLogo inline variant="full" /> بجعل محتواه العلمي متاحًا للجميع، بغض النظر عن القدرات الجسدية. نحن نسعى دائماً لتحسين تجربة المستخدم لضمان وصول المعلومات للجميع.</>
                : <><DynamicBrandLogo inline variant="full" /> is committed to making its scientific content accessible to everyone, regardless of physical abilities. We strive to improve user experience to ensure information reaches everyone.</>,
            icon: Accessibility
        },
        {
            title: isRTL ? "المعايير التقنية" : "Technical Standards",
            content: isRTL
                ? "نحن نتبع معايير WCAG 2.1 في التصميم، مما يتضمن استخدام تباين ألوان عالٍ، نصوص بديلة للصور، ودعم كامل للتنقل عبر لوحة المفاتيح."
                : "We follow WCAG 2.1 standards in design, including high color contrast, alt text for images, and full keyboard navigation support.",
            icon: Keyboard
        }
    ];

    return (
        <div className="max-w-4xl mx-auto space-y-12 pb-20">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-4"
            >
                <div className="w-20 h-20 bg-gold-500/10 rounded-3xl flex items-center justify-center mx-auto text-gold-500 mb-6">
                    <Accessibility className="w-10 h-10" />
                </div>
                <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">
                    {content.accessibilityTitle}
                </h1>
                <div className="h-1.5 w-24 bg-gold-500 mx-auto rounded-full" />
            </motion.div>

            <div className="grid gap-8">
                {sections.map((section, idx) => (
                    <motion.div
                        key={idx}
                        whileHover={{ scale: 1.02 }}
                        className="p-8 rounded-[2.5rem] bg-zinc-900/50 border border-zinc-800 space-y-6"
                    >
                        <div className="flex items-center gap-4 text-gold-500">
                            <section.icon className="w-6 h-6" />
                            <h2 className="text-2xl font-black uppercase tracking-tight">{section.title}</h2>
                        </div>
                        <p className="text-zinc-400 text-lg leading-relaxed">{section.content}</p>
                    </motion.div>
                ))}
            </div>

            <div className="p-10 rounded-[2.5rem] bg-gold-500/5 border border-gold-500/20">
                <h3 className="text-xl font-bold mb-4">{isRTL ? "تحتاج للمساعدة؟" : "Need Assistance?"}</h3>
                <p className="text-zinc-400">
                    {isRTL
                        ? "إذا واجهت أي صعوبة في الوصول إلى أي جزء من الموقع، يرجى مراسلتنا عبر البريد الإلكتروني الخاص بـ George Mourice وسنقوم بالرد فوراً."
                        : "If you encounter any difficulty accessing any part of the site, please email George Mourice, and we will respond immediately."}
                </p>
            </div>
        </div>
    );
};

export default AccessibilityPage;
