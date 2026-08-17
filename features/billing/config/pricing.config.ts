/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  BILLING & PRICING CONFIGURATION (Single Source of Truth)
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { BillingPlanDefinition, PaymentMethodOption } from '../types/billing.types';

export const BILLING_PLANS: BillingPlanDefinition[] = [
    {
        id: 'digital',
        baseId: 'digital',
        nameAr: 'البروتوكول الرقمي',
        nameEn: 'Protocol Lite (Digital)',
        descriptionAr: 'حاسبة بيولوجية متكاملة وتحليل كامل لتركيب الجسم والمغذيات الكبرى.',
        descriptionEn: 'The full BioCalc engine, body composition modeling, and personalized macro targets.',
        prices: {
            EGP: { current: 499, original: 699 },
            USD: { current: 29.00, original: 49.99 }
        },
        coachingAddon: {
            EGP: 9999,
            USD: 200.00
        },
        featuresAr: [
            'الوصول الكامل لمحرك BioCalc الدقيق',
            'أهداف الماكروز اليومية المتكيفة (Protein/Carbs/Fat)',
            'توقعات نسبة دهون الجسم أسبوعياً',
            'دليل البروتوكول الرقمي PDF الفوري',
            'دعم فني كامل عبر البريد الإلكتروني'
        ],
        featuresEn: [
            'Full precision BioCalc engine access',
            'Adaptive daily macro targets (Protein/Carbs/Fat)',
            'Week-by-week body fat projections',
            'Instant Digital Protocol PDF Blueprint',
            'Full email technical support'
        ],
        requiresShipping: false,
        requiresBodyStats: false,
        deliveryType: 'digital_download',
        ctaAr: 'احصل على النسخة الرقمية',
        ctaEn: 'Get Digital Protocol'
    },
    {
        id: 'bundle',
        baseId: 'bundle',
        nameAr: 'الباقة التكتيكية المتكاملة',
        nameEn: 'The Master Protocol (Bundle)',
        descriptionAr: 'المخطط الهندسي الشامل لـ 12 أسبوعاً مع النسخة المطبوعة والشحن المجاني.',
        descriptionEn: '12-week physique blueprint with luxury paperback book & worldwide shipping.',
        badgeAr: 'الأكثر طلباً',
        badgeEn: 'Most Popular',
        isPopular: true,
        isFeatured: true,
        prices: {
            EGP: { current: 749, original: 999 },
            USD: { current: 79.00, original: 100.80 }
        },
        coachingAddon: {
            EGP: 9999,
            USD: 200.00
        },
        featuresAr: [
            'جميع مزايا البروتوكول الرقمي بالكامل',
            'كتاب ورقي فاخر يُشحن لباب منزلك مجاناً',
            'هندسة المراحل الأربع (تحميل، بناء، صقل، كشف)',
            'جداول إعادة التغذية (Refeed) والـ Deload',
            'أولوية الوصول لجميع التحديثات المستقبلية'
        ],
        featuresEn: [
            'Everything included in Digital Lite',
            'Deluxe paperback shipped directly to your door',
            '4-Phase Cycle Blueprint (Load, Build, Refine, Reveal)',
            'Refeed & Deload optimal scheduling windows',
            'Priority access to future system updates'
        ],
        requiresShipping: true,
        requiresBodyStats: false,
        deliveryType: 'physical_and_digital',
        ctaAr: 'اطلب الباقة الشاملة',
        ctaEn: 'Run The Protocol'
    },
    {
        id: 'coaching',
        baseId: 'coaching',
        nameAr: 'المحترف الذكي + إشراف خاص',
        nameEn: 'Coached Elite Protocol',
        descriptionAr: 'البروتوكول الكامل مدعوماً بإشراف مباشر ومراجعة دورية لضمان أقصى تحول.',
        descriptionEn: 'Full system architecture combined with 1-on-1 human coaching oversight.',
        badgeAr: 'للنخبة',
        badgeEn: 'Elite Coached',
        prices: {
            EGP: { current: 849, original: 1149 },
            USD: { current: 149.00, original: 199.00 }
        },
        coachingAddon: {
            EGP: 9999,
            USD: 200.00
        },
        featuresAr: [
            'كل ما تحتويه الباقة التكتيكية والكتاب المطبوع',
            'مراجعة شاملة للخطة من قِبل كبير المدربين',
            'جلسة توجيه فردية (1-on-1 Onboarding Call)',
            'متابعة وتحديث دوري للمغذيات شهرياً',
            'خط اتصال مباشر عبر الواتساب للأعضاء'
        ],
        featuresEn: [
            'Everything in Master Protocol + Physical Book',
            'Expert human coach review of your plan',
            '1-on-1 personalized onboarding consultation',
            'Monthly progress and macro milestone check-ins',
            'Direct VIP WhatsApp line for instant queries'
        ],
        requiresShipping: true,
        requiresBodyStats: true,
        deliveryType: 'coaching_and_digital',
        ctaAr: 'انضم لبرنامج النخبة',
        ctaEn: 'Apply For Coaching'
    }
];

export const PAYMENT_METHODS: PaymentMethodOption[] = [
    // --- داخل مصر (EG) ---
    {
        id: 'paymob_card',
        gateway: 'paymob',
        nameAr: 'البطاقات البنكية المصرية (Visa / MasterCard / Meeza)',
        nameEn: 'Egyptian Bank Cards (Visa / MC / Meeza)',
        descriptionAr: 'دفع آمن وفوري بالجنيه المصري عبر بوابة Paymob المعتمدة بنكياً.',
        descriptionEn: 'Instant secure checkout in EGP via official Central Bank gateway.',
        icon: 'CreditCard',
        badge: 'فوري وآمن',
        supportedCurrencies: ['EGP'],
        supportedRegions: ['EG'],
        isInstant: true
    },
    {
        id: 'vodafone_cash',
        gateway: 'paymob',
        nameAr: 'المحافظ الإلكترونية (Vodafone Cash / Orange / Etisalat / WE)',
        nameEn: 'Mobile Wallets (Vodafone Cash, Orange, WE)',
        descriptionAr: 'الدفع المباشر من محفظة الهاتف المحمول برقم هاتفك بكل سهولة.',
        descriptionEn: 'Direct instant mobile wallet payment with OTP verification.',
        icon: 'Smartphone',
        badge: 'الأكثر استخداماً في مصر',
        supportedCurrencies: ['EGP'],
        supportedRegions: ['EG'],
        isInstant: true
    },
    {
        id: 'instapay',
        gateway: 'instapay',
        nameAr: 'تحويل إنستاباي الفوري (InstaPay IPN)',
        nameEn: 'InstaPay Instant Transfer (jan.ghattas@instapay)',
        descriptionAr: 'تحويل بنكي فوري ومباشر إلى عنوان الدفع jan.ghattas@instapay أو مسح الـ QR بدون رسوم إضافية.',
        descriptionEn: 'Direct instant bank transfer to jan.ghattas@instapay or via QR scan with 0% extra fees.',
        icon: 'QrCode',
        badge: 'فوري ومباشر ⚡',
        supportedCurrencies: ['EGP'],
        supportedRegions: ['EG'],
        isInstant: true
    },

    // --- خارج مصر (GLOBAL) ---
    {
        id: 'stripe_global',
        gateway: 'stripe',
        nameAr: 'البطاقات الائتمانية الدولية (Stripe Apple Pay / Google Pay)',
        nameEn: 'Global Credit Cards & Apple Pay (Stripe)',
        descriptionAr: 'معالجة مشفرة بـ 256-bit تقبل جميع البطاقات الدولية وأبل باي.',
        descriptionEn: '256-bit encrypted global checkout with Apple Pay & Google Pay.',
        icon: 'ShieldCheck',
        badge: 'Global Secure',
        supportedCurrencies: ['USD', 'EUR', 'GBP', 'SAR', 'AED'],
        supportedRegions: ['GLOBAL'],
        isInstant: true
    },
    {
        id: 'paypal_global',
        gateway: 'paypal',
        nameAr: 'حساب PayPal العالمي',
        nameEn: 'PayPal Express Checkout',
        descriptionAr: 'حماية المشتري الكاملة والدفع السريع من رصيد أو بطاقات PayPal.',
        descriptionEn: 'Full buyer protection with instant 1-click PayPal checkout.',
        icon: 'Wallet',
        badge: 'Buyer Protection',
        supportedCurrencies: ['USD', 'EUR', 'GBP'],
        supportedRegions: ['GLOBAL'],
        isInstant: true
    }
];

export const REGIONAL_CONFIG = {
    EG: {
        currency: 'EGP',
        currencySymbol: 'ج.م',
        locale: 'ar-EG',
        defaultShipping: 50,
        taxRate: 0.14,
        phonePrefix: '+20'
    },
    GLOBAL: {
        currency: 'USD',
        currencySymbol: '$',
        locale: 'en-US',
        defaultShipping: 15,
        taxRate: 0.00,
        phonePrefix: '+1'
    }
};
