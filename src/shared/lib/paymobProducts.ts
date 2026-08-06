/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  🛒 PAYMOB PRODUCT CATALOG — MR. X STEROID                              ║
 * ║  Single source of truth for all 5 Paymob-linked products                ║
 * ║  Prices are in EGP. priceCents = price × 100 (required by Paymob API)  ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

// ═══════════════════════════════════════════════════════════════════════════
//                              TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type PaymobPaymentMethod = 'card' | 'wallet' | 'kiosk';

export interface PaymobProduct {
    /** Paymob product ID */
    productId: number;
    /** Arabic product name (as registered in Paymob dashboard) */
    nameAr: string;
    /** English product name */
    nameEn: string;
    /** Tier ID mapping to the internal checkout system */
    tierId: 'digital' | 'bundle' | 'coaching' | 'coaching_plus' | 'shipping';
    /** Price in EGP */
    priceEGP: number;
    /** Price in fils/cents (EGP × 100) — required by Paymob API */
    priceCents: number;
    /** Short Paymob direct link */
    directLink?: string;
    /** Full Paymob standalone hosted payment URL */
    standaloneUrl: string;
    /** Whether this product requires physical shipping */
    requiresShipping: boolean;
    /** Feature bullet points in Arabic */
    featuresAr: string[];
    /** Feature bullet points in English */
    featuresEn: string[];
    /** Accent color for the card */
    accent: 'gold' | 'blue' | 'purple' | 'green' | 'orange';
}

// ═══════════════════════════════════════════════════════════════════════════
//                         INTEGRATION ID MAP
// ═══════════════════════════════════════════════════════════════════════════

export const PAYMOB_INTEGRATION_IDS: Record<PaymobPaymentMethod, number> = {
    card:   5573815,
    wallet: 5792309,
    kiosk:  5792311,
} as const;

// ═══════════════════════════════════════════════════════════════════════════
//                            PRODUCT CATALOG
// ═══════════════════════════════════════════════════════════════════════════

export const PAYMOB_PRODUCTS: PaymobProduct[] = [
    {
        productId: 308488,
        nameAr: 'البروتوكول الرقمي',
        nameEn: 'Digital Protocol',
        tierId: 'digital',
        priceEGP: 499,
        priceCents: 49900,
        directLink: 'https://paymob.link/ZQyqO',
        standaloneUrl: 'https://accept.paymobsolutions.com/standalone?ref=p_LRR2KzlSNGRHdHVaZFRheDRKQVNvYzNVUT09X1dRVGs5dnZLWmZFYVpremh4ZndJOUE9PQ',
        requiresShipping: false,
        featuresAr: [
            '📖 الكتاب الإلكتروني بصيغتي PDF / EPUB',
            '⚡ تسليم فوري وتلقائي',
            '📋 القوالب الأساسية لدورة العمل',
        ],
        featuresEn: [
            '📖 eBook PDF / EPUB',
            '⚡ Instant digital delivery',
            '📋 Basic Cycle Templates',
        ],
        accent: 'gold',
    },
    {
        productId: 308489,
        nameAr: 'الباقة التكتيكية',
        nameEn: 'Tactical Bundle',
        tierId: 'bundle',
        priceEGP: 749,
        priceCents: 74900,
        directLink: 'https://paymob.link/iOuJf',
        standaloneUrl: 'https://accept.paymobsolutions.com/standalone?ref=p_LRR2eFZxTkJoUWtMTXVzandmYUw4TmdZZz09X3g1YUVqR0xFMFUwMi9MVzNBV3gyVHc9PQ',
        requiresShipping: true,
        featuresAr: [
            '📚 النسخة الورقية الفاخرة (Glossy Paperback)',
            '🚚 شحن وتوصيل سريع داخل مصر',
            '🎁 هدية: النسخة الرقمية (تسليم فوري)',
            '🎧 مكافأة: النسخة الصوتية الكاملة',
        ],
        featuresEn: [
            '📚 Glossy Paperback copy',
            '🚚 Fast shipping inside Egypt',
            '🎁 Free digital edition included',
            '🎧 Audiobook bonus',
        ],
        accent: 'blue',
    },
    {
        productId: 308490,
        nameAr: 'المحترف الذكي',
        nameEn: 'Smart Professional (VIP)',
        tierId: 'coaching',
        priceEGP: 849,
        priceCents: 84900,
        directLink: 'https://paymob.link/y11b8',
        standaloneUrl: 'https://accept.paymobsolutions.com/standalone?ref=p_LRR2NG05emdjRkFKSFNsU3ZHL01vMVdKZz09X2JvM0hkeDFNS00vOUpJTXUxTDRCSWc9PQ',
        requiresShipping: true,
        featuresAr: [
            '📗 الغلاف المقوى الفاخر (Hardcover Premium)',
            '🚀 شحن ذو أولوية داخل مصر',
            '👑 انضمام حصري لمجتمع VIP',
            '🛡️ بروتوكول الخروج الآمن المتكامل',
            '🎧 النسخة الصوتية الكاملة',
        ],
        featuresEn: [
            '📗 Hardcover Premium edition',
            '🚀 Priority shipping inside Egypt',
            '👑 Exclusive VIP community access',
            '🛡️ Safe Exit Protocol included',
            '🎧 Full Audiobook',
        ],
        accent: 'purple',
    },
    {
        productId: 315204,
        nameAr: 'تدريب شخصي أونلاين لمدة كورس واحد',
        nameEn: 'Personal Online Coaching (1 Course)',
        tierId: 'coaching_plus',
        priceEGP: 9999,
        priceCents: 999900,
        directLink: 'https://paymob.link/StYD4',
        standaloneUrl: 'https://accept.paymobsolutions.com/standalone?ref=p_LRR2U0Q5cDI3WGFyRzR4MXFHcGNRWmhmUT09XzAvbjh0Zjc5Zlh5TGpBcjUxRzA0Zmc9PQ',
        requiresShipping: false,
        featuresAr: [
            '🏋️ تدريب شخصي مباشر أونلاين',
            '📅 كورس كامل مع مدرب متخصص',
            '📊 خطة غذائية وتدريبية مخصصة',
            '💬 متابعة يومية عبر واتساب',
        ],
        featuresEn: [
            '🏋️ 1-on-1 online personal coaching',
            '📅 Full coaching course with specialist',
            '📊 Custom nutrition & training plan',
            '💬 Daily WhatsApp follow-up',
        ],
        accent: 'green',
    },
    {
        productId: 315206,
        nameAr: 'الشحن داخل مصر',
        nameEn: 'Egypt Shipping Add-on',
        tierId: 'shipping',
        priceEGP: 239,
        priceCents: 23900,
        standaloneUrl: 'https://accept.paymobsolutions.com/standalone?ref=p_LRR2QjhLZFVKbDhQeTJZU2FSSGExa211Zz09X1krNVc2MTltd2JKWmtOQzExaG1YYmc9PQ',
        requiresShipping: false,
        featuresAr: [
            '🚚 شحن سريع داخل جمهورية مصر العربية',
            '📦 توصيل بواسطة شركة شحن معتمدة',
            '📍 تتبع الشحنة حتى وصولها',
        ],
        featuresEn: [
            '🚚 Fast domestic shipping across Egypt',
            '📦 Delivery via certified carrier',
            '📍 Full parcel tracking included',
        ],
        accent: 'orange',
    },
];

// ═══════════════════════════════════════════════════════════════════════════
//                            HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/** Find a product by Paymob product ID */
export const getProductById = (id: number): PaymobProduct | undefined =>
    PAYMOB_PRODUCTS.find(p => p.productId === id);

/** Find a product by internal tier ID */
export const getProductByTier = (tierId: string): PaymobProduct | undefined =>
    PAYMOB_PRODUCTS.find(p => p.tierId === tierId);

/** Get the Paymob integration ID for a given payment method */
export const getIntegrationId = (method: PaymobPaymentMethod): number =>
    PAYMOB_INTEGRATION_IDS[method];

/**
 * Build the redirect URL for a given product and payment method.
 * For standalone-supported products, returns the pre-built Paymob hosted URL directly.
 * This is the fastest checkout path — no API round-trip needed.
 */
export const buildPaymobRedirectUrl = (
    product: PaymobProduct,
    _method: PaymobPaymentMethod
): string => {
    // Standalone URL is always the primary path — Paymob handles auth internally
    return product.standaloneUrl;
};
