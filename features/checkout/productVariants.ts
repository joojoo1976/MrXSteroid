import { Smartphone, Package, Crown, type LucideIcon } from 'lucide-react';
import type { ProductVariant } from '@/shared/types/types';

export interface VariantDef {
    id: ProductVariant;
    labelAr: string;
    labelEn: string;
    icon: LucideIcon;
    featuresAr: string[];
    featuresEn: string[];
}

export const VARIANTS: VariantDef[] = [
    {
        id: 'digital',
        labelAr: 'البروتوكول الرقمي',
        labelEn: 'Digital Protocol (PDF)',
        icon: Smartphone,
        featuresAr: [
            '📖 الكتاب الإلكتروني بصيغتي PDF / EPUB',
            '⚡ تسليم فوري وتلقائي',
            '📋 القوالب الأساسية لدورة العمل (Basic Cycle Templates)',
        ],
        featuresEn: [
            '📖 eBook PDF / EPUB',
            '⚡ Instant digital delivery',
            '📋 Basic Cycle Templates',
        ],
    },
    {
        id: 'bundle',
        labelAr: 'الباقة التكتيكية',
        labelEn: 'Tactical Bundle',
        icon: Package,
        featuresAr: [
            '📚 النسخة الورقية الفاخرة (Glossy Paperback)',
            '🚚 شحن وتوصيل سريع داخل مصر',
            '🎁 هدية مجانية: النسخة الرقمية (تسليم فوري)',
            '🎧 مكافأة إضافية: النسخة الصوتية الكاملة (Audiobook)',
            '💪 مكافأة إضافية: دليل التمارين المنزلية PDF',
        ],
        featuresEn: [
            '📚 Glossy Paperback copy',
            '🚚 Fast shipping (Egypt) / Int\'l shipping available',
            '🎁 Free digital edition included',
            '🎧 Audiobook bonus',
            '💪 Home Workout Guide PDF',
        ],
    },
    {
        id: 'coaching',
        labelAr: 'المحترف الذكي',
        labelEn: 'Smart Professional (VIP)',
        icon: Crown,
        featuresAr: [
            '📗 النسخة الورقية ذات الغلاف المقوى الفاخر (Hardcover Premium)',
            '🚀 شحن ذو أولوية فائقة داخل مصر',
            '🎁 هدية مجانية: النسخة الرقمية (تسليم فوري)',
            '👑 انضمام حصري لمجتمع كبار الأعضاء (VIP Access)',
            '🛡️ بروتوكول الخروج الآمن المتكامل (Safe Exit Protocol)',
            '🎧 مكافأة إضافية: النسخة الصوتية الكاملة',
            '💪 مكافأة إضافية: دليل التمارين المنزلية PDF',
        ],
        featuresEn: [
            '📗 Hardcover Premium edition',
            '🚀 Priority shipping inside Egypt',
            '🎁 Free digital edition included',
            '👑 Exclusive VIP Community Access',
            '🛡️ Safe Exit Protocol (Full PCT)',
            '🎧 Audiobook bonus',
            '💪 Home Workout Guide PDF',
        ],
    },
];

