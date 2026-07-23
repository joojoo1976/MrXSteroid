export interface Governorate {
    id: string;
    nameAr: string;
    nameEn: string;
}

export interface CountryOption {
    code: string;
    nameAr: string;
    nameEn: string;
    flag: string;
    dialCode: string;
    defaultShippingUsd: number;
    postalCodeRequired: boolean;
}

export const EGYPT_GOVERNORATES: Governorate[] = [
    { id: 'cairo', nameAr: 'القاهرة', nameEn: 'Cairo' },
    { id: 'giza', nameAr: 'الجيزة', nameEn: 'Giza' },
    { id: 'alexandria', nameAr: 'الإسكندرية', nameEn: 'Alexandria' },
    { id: 'dakahlia', nameAr: 'الدقهلية', nameEn: 'Dakahlia' },
    { id: 'red_sea', nameAr: 'البحر الأحمر', nameEn: 'Red Sea' },
    { id: 'beheira', nameAr: 'البحيرة', nameEn: 'Beheira' },
    { id: 'fayoum', nameAr: 'الفيوم', nameEn: 'Fayoum' },
    { id: 'gharbia', nameAr: 'الغربية', nameEn: 'Gharbia' },
    { id: 'ismailia', nameAr: 'الإسماعيلية', nameEn: 'Ismailia' },
    { id: 'monufia', nameAr: 'المنوفية', nameEn: 'Monufia' },
    { id: 'minya', nameAr: 'المنيا', nameEn: 'Minya' },
    { id: 'qalyubia', nameAr: 'القليوبية', nameEn: 'Qalyubia' },
    { id: 'new_valley', nameAr: 'الوادي الجديد', nameEn: 'New Valley' },
    { id: 'suez', nameAr: 'السويس', nameEn: 'Suez' },
    { id: 'aswan', nameAr: 'أسوان', nameEn: 'Aswan' },
    { id: 'assiut', nameAr: 'أسيوط', nameEn: 'Assiut' },
    { id: 'beni_suef', nameAr: 'بني سويف', nameEn: 'Beni Suef' },
    { id: 'port_said', nameAr: 'بورسعيد', nameEn: 'Port Said' },
    { id: 'damietta', nameAr: 'دمياط', nameEn: 'Damietta' },
    { id: 'sharqia', nameAr: 'الشرقية', nameEn: 'Sharqia' },
    { id: 'south_sinai', nameAr: 'جنوب سيناء', nameEn: 'South Sinai' },
    { id: 'kafr_el_sheikh', nameAr: 'كفر الشيخ', nameEn: 'Kafr El Sheikh' },
    { id: 'matrouh', nameAr: 'مطروح', nameEn: 'Matrouh' },
    { id: 'qena', nameAr: 'قنا', nameEn: 'Qena' },
    { id: 'north_sinai', nameAr: 'شمال سيناء', nameEn: 'North Sinai' },
    { id: 'sohag', nameAr: 'سوهاج', nameEn: 'Sohag' },
    { id: 'luxor', nameAr: 'الأقصر', nameEn: 'Luxor' },
];

export const WORLD_COUNTRIES: CountryOption[] = [
    { code: 'EG', nameAr: 'جمهورية مصر العربية 🇪🇬', nameEn: 'Egypt', flag: '🇪🇬', dialCode: '+20', defaultShippingUsd: 0, postalCodeRequired: false },
    { code: 'SA', nameAr: 'المملكة العربية السعودية 🇸🇦', nameEn: 'Saudi Arabia', flag: '🇸🇦', dialCode: '+966', defaultShippingUsd: 25, postalCodeRequired: true },
    { code: 'AE', nameAr: 'الإمارات العربية المتحدة 🇦🇪', nameEn: 'United Arab Emirates', flag: '🇦🇪', dialCode: '+971', defaultShippingUsd: 25, postalCodeRequired: true },
    { code: 'KW', nameAr: 'الكويت 🇰🇼', nameEn: 'Kuwait', flag: '🇰🇼', dialCode: '+965', defaultShippingUsd: 25, postalCodeRequired: true },
    { code: 'QA', nameAr: 'قطر 🇶🇦', nameEn: 'Qatar', flag: '🇶🇦', dialCode: '+974', defaultShippingUsd: 25, postalCodeRequired: true },
    { code: 'OM', nameAr: 'عُمان 🇴🇲', nameEn: 'Oman', flag: '🇴🇲', dialCode: '+968', defaultShippingUsd: 25, postalCodeRequired: true },
    { code: 'BH', nameAr: 'البحرين 🇧🇭', nameEn: 'Bahrain', flag: '🇧🇭', dialCode: '+973', defaultShippingUsd: 25, postalCodeRequired: true },
    { code: 'JO', nameAr: 'الأردن 🇯🇴', nameEn: 'Jordan', flag: '🇯🇴', dialCode: '+962', defaultShippingUsd: 30, postalCodeRequired: true },
    { code: 'US', nameAr: 'الولايات المتحدة الأمريكية 🇺🇸', nameEn: 'United States', flag: '🇺🇸', dialCode: '+1', defaultShippingUsd: 35, postalCodeRequired: true },
    { code: 'GB', nameAr: 'المملكة المتحدة 🇬🇧', nameEn: 'United Kingdom', flag: '🇬🇧', dialCode: '+44', defaultShippingUsd: 35, postalCodeRequired: true },
    { code: 'CA', nameAr: 'كندا 🇨🇦', nameEn: 'Canada', flag: '🇨🇦', dialCode: '+1', defaultShippingUsd: 35, postalCodeRequired: true },
    { code: 'DE', nameAr: 'ألمانيا 🇩🇪', nameEn: 'Germany', flag: '🇩🇪', dialCode: '+49', defaultShippingUsd: 35, postalCodeRequired: true },
    { code: 'FR', nameAr: 'فرنسا 🇫🇷', nameEn: 'France', flag: '🇫🇷', dialCode: '+33', defaultShippingUsd: 35, postalCodeRequired: true },
    { code: 'IQ', nameAr: 'العراق 🇮🇶', nameEn: 'Iraq', flag: '🇮🇶', dialCode: '+964', defaultShippingUsd: 30, postalCodeRequired: true },
    { code: 'LY', nameAr: 'ليبيا 🇱🇾', nameEn: 'Libya', flag: '🇱🇾', dialCode: '+218', defaultShippingUsd: 30, postalCodeRequired: true },
    { code: 'MA', nameAr: 'المغرب 🇲🇦', nameEn: 'Morocco', flag: '🇲🇦', dialCode: '+212', defaultShippingUsd: 35, postalCodeRequired: true },
    { code: 'DZ', nameAr: 'الجزائر 🇩🇿', nameEn: 'Algeria', flag: '🇩🇿', dialCode: '+213', defaultShippingUsd: 35, postalCodeRequired: true },
    { code: 'TN', nameAr: 'تونس 🇹🇳', nameEn: 'Tunisia', flag: '🇹🇳', dialCode: '+216', defaultShippingUsd: 35, postalCodeRequired: true },
    { code: 'TR', nameAr: 'تركيا 🇹🇷', nameEn: 'Turkey', flag: '🇹🇷', dialCode: '+90', defaultShippingUsd: 30, postalCodeRequired: true },
    { code: 'AU', nameAr: 'أستراليا 🇦🇺', nameEn: 'Australia', flag: '🇦🇺', dialCode: '+61', defaultShippingUsd: 40, postalCodeRequired: true },
];

export const EGYPT_FIXED_SHIPPING_EGP = 239;
