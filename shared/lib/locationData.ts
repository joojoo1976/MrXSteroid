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
    // 🇪🇬 Local - Egypt
    { code: 'EG', nameAr: 'جمهورية مصر العربية 🇪🇬', nameEn: 'Egypt 🇪🇬', flag: '🇪🇬', dialCode: '+20', defaultShippingUsd: 0, postalCodeRequired: false },

    // 🇸🇦 🇦🇪 🇰🇼 Arab & Gulf Countries
    { code: 'SA', nameAr: 'المملكة العربية السعودية 🇸🇦', nameEn: 'Saudi Arabia 🇸🇦', flag: '🇸🇦', dialCode: '+966', defaultShippingUsd: 25, postalCodeRequired: true },
    { code: 'AE', nameAr: 'الإمارات العربية المتحدة 🇦🇪', nameEn: 'United Arab Emirates 🇦🇪', flag: '🇦🇪', dialCode: '+971', defaultShippingUsd: 25, postalCodeRequired: true },
    { code: 'KW', nameAr: 'الكويت 🇰🇼', nameEn: 'Kuwait 🇰🇼', flag: '🇰🇼', dialCode: '+965', defaultShippingUsd: 25, postalCodeRequired: true },
    { code: 'QA', nameAr: 'قطر 🇶🇦', nameEn: 'Qatar 🇶🇦', flag: '🇶🇦', dialCode: '+974', defaultShippingUsd: 25, postalCodeRequired: true },
    { code: 'OM', nameAr: 'سلطنة عُمان 🇴🇲', nameEn: 'Oman 🇴🇲', flag: '🇴🇲', dialCode: '+968', defaultShippingUsd: 25, postalCodeRequired: true },
    { code: 'BH', nameAr: 'مملكة البحرين 🇧🇭', nameEn: 'Bahrain 🇧🇭', flag: '🇧🇭', dialCode: '+973', defaultShippingUsd: 25, postalCodeRequired: true },
    { code: 'JO', nameAr: 'الأردن 🇯🇴', nameEn: 'Jordan 🇯🇴', flag: '🇯🇴', dialCode: '+962', defaultShippingUsd: 30, postalCodeRequired: true },
    { code: 'IQ', nameAr: 'العراق 🇮🇶', nameEn: 'Iraq 🇮🇶', flag: '🇮🇶', dialCode: '+964', defaultShippingUsd: 30, postalCodeRequired: true },
    { code: 'LB', nameAr: 'لبنان 🇱🇧', nameEn: 'Lebanon 🇱🇧', flag: '🇱🇧', dialCode: '+961', defaultShippingUsd: 30, postalCodeRequired: true },
    { code: 'SY', nameAr: 'سوريا 🇸🇾', nameEn: 'Syria 🇸🇾', flag: '🇸🇾', dialCode: '+963', defaultShippingUsd: 30, postalCodeRequired: true },
    { code: 'PS', nameAr: 'فلسطين 🇵🇸', nameEn: 'Palestine 🇵🇸', flag: '🇵🇸', dialCode: '+970', defaultShippingUsd: 30, postalCodeRequired: true },
    { code: 'YE', nameAr: 'اليمن 🇾🇪', nameEn: 'Yemen 🇾🇪', flag: '🇾🇪', dialCode: '+967', defaultShippingUsd: 30, postalCodeRequired: true },
    { code: 'LY', nameAr: 'ليبيا 🇱🇾', nameEn: 'Libya 🇱🇾', flag: '🇱🇾', dialCode: '+218', defaultShippingUsd: 30, postalCodeRequired: true },
    { code: 'SD', nameAr: 'السودان 🇸🇩', nameEn: 'Sudan 🇸🇩', flag: '🇸🇩', dialCode: '+249', defaultShippingUsd: 30, postalCodeRequired: true },
    { code: 'MA', nameAr: 'المغرب 🇲🇦', nameEn: 'Morocco 🇲🇦', flag: '🇲🇦', dialCode: '+212', defaultShippingUsd: 35, postalCodeRequired: true },
    { code: 'DZ', nameAr: 'الجزائر 🇩🇿', nameEn: 'Algeria 🇩🇿', flag: '🇩🇿', dialCode: '+213', defaultShippingUsd: 35, postalCodeRequired: true },
    { code: 'TN', nameAr: 'تونس 🇹🇳', nameEn: 'Tunisia 🇹🇳', flag: '🇹🇳', dialCode: '+216', defaultShippingUsd: 35, postalCodeRequired: true },
    { code: 'MR', nameAr: 'موريتانيا 🇲🇷', nameEn: 'Mauritania 🇲🇷', flag: '🇲🇷', dialCode: '+222', defaultShippingUsd: 35, postalCodeRequired: true },
    { code: 'SO', nameAr: 'الصومال 🇸🇴', nameEn: 'Somalia 🇸🇴', flag: '🇸🇴', dialCode: '+252', defaultShippingUsd: 35, postalCodeRequired: true },
    { code: 'DJ', nameAr: 'جيبوتي 🇩🇯', nameEn: 'Djibouti 🇩🇯', flag: '🇩🇯', dialCode: '+253', defaultShippingUsd: 35, postalCodeRequired: true },
    { code: 'KM', nameAr: 'جزر القمر 🇰🇲', nameEn: 'Comoros 🇰🇲', flag: '🇰🇲', dialCode: '+269', defaultShippingUsd: 35, postalCodeRequired: true },
    { code: 'TR', nameAr: 'تركيا 🇹🇷', nameEn: 'Turkey 🇹🇷', flag: '🇹🇷', dialCode: '+90', defaultShippingUsd: 30, postalCodeRequired: true },

    // 🇺🇸 🇨🇦 North America
    { code: 'US', nameAr: 'الولايات المتحدة الأمريكية 🇺🇸', nameEn: 'United States 🇺🇸', flag: '🇺🇸', dialCode: '+1', defaultShippingUsd: 35, postalCodeRequired: true },
    { code: 'CA', nameAr: 'كندا 🇨🇦', nameEn: 'Canada 🇨🇦', flag: '🇨🇦', dialCode: '+1', defaultShippingUsd: 35, postalCodeRequired: true },
    { code: 'MX', nameAr: 'المكسيك 🇲🇽', nameEn: 'Mexico 🇲🇽', flag: '🇲🇽', dialCode: '+52', defaultShippingUsd: 40, postalCodeRequired: true },

    // 🇬🇧 🇩🇪 🇫🇷 Europe
    { code: 'GB', nameAr: 'المملكة المتحدة 🇬🇧', nameEn: 'United Kingdom 🇬🇧', flag: '🇬🇧', dialCode: '+44', defaultShippingUsd: 35, postalCodeRequired: true },
    { code: 'DE', nameAr: 'ألمانيا 🇩🇪', nameEn: 'Germany 🇩🇪', flag: '🇩🇪', dialCode: '+49', defaultShippingUsd: 35, postalCodeRequired: true },
    { code: 'FR', nameAr: 'فرنسا 🇫🇷', nameEn: 'France 🇫🇷', flag: '🇫🇷', dialCode: '+33', defaultShippingUsd: 35, postalCodeRequired: true },
    { code: 'IT', nameAr: 'إيطاليا 🇮🇹', nameEn: 'Italy 🇮🇹', flag: '🇮🇹', dialCode: '+39', defaultShippingUsd: 35, postalCodeRequired: true },
    { code: 'ES', nameAr: 'إسبانيا 🇪🇸', nameEn: 'Spain 🇪🇸', flag: '🇪🇸', dialCode: '+34', defaultShippingUsd: 35, postalCodeRequired: true },
    { code: 'NL', nameAr: 'هولندا 🇳🇱', nameEn: 'Netherlands 🇳🇱', flag: '🇳🇱', dialCode: '+31', defaultShippingUsd: 35, postalCodeRequired: true },
    { code: 'BE', nameAr: 'بلجيكا 🇧🇪', nameEn: 'Belgium 🇧🇪', flag: '🇧🇪', dialCode: '+32', defaultShippingUsd: 35, postalCodeRequired: true },
    { code: 'CH', nameAr: 'سويسرا 🇨🇭', nameEn: 'Switzerland 🇨🇭', flag: '🇨🇭', dialCode: '+41', defaultShippingUsd: 35, postalCodeRequired: true },
    { code: 'AT', nameAr: 'النمسا 🇦🇹', nameEn: 'Austria 🇦🇹', flag: '🇦🇹', dialCode: '+43', defaultShippingUsd: 35, postalCodeRequired: true },
    { code: 'SE', nameAr: 'السويد 🇸🇪', nameEn: 'Sweden 🇸🇪', flag: '🇸🇪', dialCode: '+46', defaultShippingUsd: 35, postalCodeRequired: true },
    { code: 'NO', nameAr: 'النرويج 🇳🇴', nameEn: 'Norway 🇳🇴', flag: '🇳🇴', dialCode: '+47', defaultShippingUsd: 35, postalCodeRequired: true },
    { code: 'DK', nameAr: 'الدنمارك 🇩🇰', nameEn: 'Denmark 🇩🇰', flag: '🇩🇰', dialCode: '+45', defaultShippingUsd: 35, postalCodeRequired: true },
    { code: 'FI', nameAr: 'فنلندا 🇫🇮', nameEn: 'Finland 🇫🇮', flag: '🇫🇮', dialCode: '+358', defaultShippingUsd: 35, postalCodeRequired: true },
    { code: 'IE', nameAr: 'أيرلندا 🇮🇪', nameEn: 'Ireland 🇮🇪', flag: '🇮🇪', dialCode: '+353', defaultShippingUsd: 35, postalCodeRequired: true },
    { code: 'PT', nameAr: 'البرتغال 🇵🇹', nameEn: 'Portugal 🇵🇹', flag: '🇵🇹', dialCode: '+351', defaultShippingUsd: 35, postalCodeRequired: true },
    { code: 'GR', nameAr: 'اليونان 🇬🇷', nameEn: 'Greece 🇬🇷', flag: '🇬🇷', dialCode: '+30', defaultShippingUsd: 35, postalCodeRequired: true },
    { code: 'PL', nameAr: 'بولندا 🇵🇱', nameEn: 'Poland 🇵🇱', flag: '🇵🇱', dialCode: '+48', defaultShippingUsd: 35, postalCodeRequired: true },
    { code: 'CZ', nameAr: 'جمهورية التشيك 🇨🇿', nameEn: 'Czech Republic 🇨🇿', flag: '🇨🇿', dialCode: '+420', defaultShippingUsd: 35, postalCodeRequired: true },
    { code: 'HU', nameAr: 'المجر 🇭🇺', nameEn: 'Hungary 🇭🇺', flag: '🇭🇺', dialCode: '+36', defaultShippingUsd: 35, postalCodeRequired: true },
    { code: 'RO', nameAr: 'رومانيا 🇷🇴', nameEn: 'Romania 🇷🇴', flag: '🇷🇴', dialCode: '+40', defaultShippingUsd: 35, postalCodeRequired: true },
    { code: 'BG', nameAr: 'بلغاريا 🇧🇬', nameEn: 'Bulgaria 🇧🇬', flag: '🇧🇬', dialCode: '+359', defaultShippingUsd: 35, postalCodeRequired: true },
    { code: 'HR', nameAr: 'كرواتيا 🇭🇷', nameEn: 'Croatia 🇭🇷', flag: '🇭🇷', dialCode: '+385', defaultShippingUsd: 35, postalCodeRequired: true },
    { code: 'SK', nameAr: 'سلوفاكيا 🇸🇰', nameEn: 'Slovakia 🇸🇰', flag: '🇸🇰', dialCode: '+421', defaultShippingUsd: 35, postalCodeRequired: true },
    { code: 'SI', nameAr: 'سلوفينيا 🇸🇮', nameEn: 'Slovenia 🇸🇮', flag: '🇸🇮', dialCode: '+386', defaultShippingUsd: 35, postalCodeRequired: true },
    { code: 'CY', nameAr: 'قبرص 🇨🇾', nameEn: 'Cyprus 🇨🇾', flag: '🇨🇾', dialCode: '+357', defaultShippingUsd: 35, postalCodeRequired: true },
    { code: 'MT', nameAr: 'مالطا 🇲🇹', nameEn: 'Malta 🇲🇹', flag: '🇲🇹', dialCode: '+356', defaultShippingUsd: 35, postalCodeRequired: true },
    { code: 'LU', nameAr: 'لوكسمبورغ 🇱🇺', nameEn: 'Luxembourg 🇱🇺', flag: '🇱🇺', dialCode: '+352', defaultShippingUsd: 35, postalCodeRequired: true },
    { code: 'IS', nameAr: 'أيسلندا 🇮🇸', nameEn: 'Iceland 🇮🇸', flag: '🇮🇸', dialCode: '+354', defaultShippingUsd: 35, postalCodeRequired: true },
    { code: 'RU', nameAr: 'روسيا 🇷🇺', nameEn: 'Russia 🇷🇺', flag: '🇷🇺', dialCode: '+7', defaultShippingUsd: 40, postalCodeRequired: true },
    { code: 'UA', nameAr: 'أوكرانيا 🇺🇦', nameEn: 'Ukraine 🇺🇦', flag: '🇺🇦', dialCode: '+380', defaultShippingUsd: 40, postalCodeRequired: true },
    { code: 'BY', nameAr: 'بيلاروسيا 🇧🇾', nameEn: 'Belarus 🇧🇾', flag: '🇧🇾', dialCode: '+375', defaultShippingUsd: 40, postalCodeRequired: true },
    { code: 'RS', nameAr: 'صربيا 🇷🇸', nameEn: 'Serbia 🇷🇸', flag: '🇷🇸', dialCode: '+381', defaultShippingUsd: 35, postalCodeRequired: true },
    { code: 'BA', nameAr: 'البوسنة والهرسك 🇧🇦', nameEn: 'Bosnia and Herzegovina 🇧🇦', flag: '🇧🇦', dialCode: '+387', defaultShippingUsd: 35, postalCodeRequired: true },
    { code: 'AL', nameAr: 'ألبانيا 🇦🇱', nameEn: 'Albania 🇦🇱', flag: '🇦🇱', dialCode: '+355', defaultShippingUsd: 35, postalCodeRequired: true },
    { code: 'MK', nameAr: 'مقدونيا الشمالية 🇲🇰', nameEn: 'North Macedonia 🇲🇰', flag: '🇲🇰', dialCode: '+389', defaultShippingUsd: 35, postalCodeRequired: true },
    { code: 'ME', nameAr: 'الجبل الأسود 🇲🇪', nameEn: 'Montenegro 🇲🇪', flag: '🇲🇪', dialCode: '+382', defaultShippingUsd: 35, postalCodeRequired: true },
    { code: 'MD', nameAr: 'مولدوفا 🇲🇩', nameEn: 'Moldova 🇲🇩', flag: '🇲🇩', dialCode: '+373', defaultShippingUsd: 35, postalCodeRequired: true },
    { code: 'GE', nameAr: 'جورجيا 🇬🇪', nameEn: 'Georgia 🇬🇪', flag: '🇬🇪', dialCode: '+995', defaultShippingUsd: 35, postalCodeRequired: true },
    { code: 'AM', nameAr: 'أرمينيا 🇦🇲', nameEn: 'Armenia 🇦🇲', flag: '🇦🇲', dialCode: '+374', defaultShippingUsd: 35, postalCodeRequired: true },
    { code: 'AZ', nameAr: 'أذربيجان 🇦🇿', nameEn: 'Azerbaijan 🇦🇿', flag: '🇦🇿', dialCode: '+994', defaultShippingUsd: 35, postalCodeRequired: true },

    // 🇨🇳 🇯🇵 🇰🇷 🇮🇳 Asia & Pacific
    { code: 'CN', nameAr: 'الصين 🇨🇳', nameEn: 'China 🇨🇳', flag: '🇨🇳', dialCode: '+86', defaultShippingUsd: 40, postalCodeRequired: true },
    { code: 'JP', nameAr: 'اليابان 🇯🇵', nameEn: 'Japan 🇯🇵', flag: '🇯🇵', dialCode: '+81', defaultShippingUsd: 40, postalCodeRequired: true },
    { code: 'KR', nameAr: 'كوريا الجنوبية 🇰🇷', nameEn: 'South Korea 🇰🇷', flag: '🇰🇷', dialCode: '+82', defaultShippingUsd: 40, postalCodeRequired: true },
    { code: 'IN', nameAr: 'الهند 🇮🇳', nameEn: 'India 🇮🇳', flag: '🇮🇳', dialCode: '+91', defaultShippingUsd: 35, postalCodeRequired: true },
    { code: 'PK', nameAr: 'باكستان 🇵🇰', nameEn: 'Pakistan 🇵🇰', flag: '🇵🇰', dialCode: '+92', defaultShippingUsd: 35, postalCodeRequired: true },
    { code: 'BD', nameAr: 'بغلاديش 🇧🇩', nameEn: 'Bangladesh 🇧🇩', flag: '🇧🇩', dialCode: '+880', defaultShippingUsd: 35, postalCodeRequired: true },
    { code: 'ID', nameAr: 'إندونيسيا 🇮🇩', nameEn: 'Indonesia 🇮🇩', flag: '🇮🇩', dialCode: '+62', defaultShippingUsd: 40, postalCodeRequired: true },
    { code: 'MY', nameAr: 'ماليزيا 🇲🇾', nameEn: 'Malaysia 🇲🇾', flag: '🇲🇾', dialCode: '+60', defaultShippingUsd: 40, postalCodeRequired: true },
    { code: 'SG', nameAr: 'سنغافورة 🇸🇬', nameEn: 'Singapore 🇸🇬', flag: '🇸🇬', dialCode: '+65', defaultShippingUsd: 40, postalCodeRequired: true },
    { code: 'TH', nameAr: 'تايلاند 🇹🇭', nameEn: 'Thailand 🇹🇭', flag: '🇹🇭', dialCode: '+66', defaultShippingUsd: 40, postalCodeRequired: true },
    { code: 'VN', nameAr: 'فيتنام 🇻🇳', nameEn: 'Vietnam 🇻🇳', flag: '🇻🇳', dialCode: '+84', defaultShippingUsd: 40, postalCodeRequired: true },
    { code: 'PH', nameAr: 'الفلبين 🇵🇭', nameEn: 'Philippines 🇵🇭', flag: '🇵🇭', dialCode: '+63', defaultShippingUsd: 40, postalCodeRequired: true },
    { code: 'LK', nameAr: 'سريلانكا 🇱🇰', nameEn: 'Sri Lanka 🇱🇰', flag: '🇱🇰', dialCode: '+94', defaultShippingUsd: 40, postalCodeRequired: true },
    { code: 'NP', nameAr: 'نيبال 🇳🇵', nameEn: 'Nepal 🇳🇵', flag: '🇳🇵', dialCode: '+977', defaultShippingUsd: 40, postalCodeRequired: true },
    { code: 'KZ', nameAr: 'كازاخستان 🇰🇿', nameEn: 'Kazakhstan 🇰🇿', flag: '🇰🇿', dialCode: '+7', defaultShippingUsd: 40, postalCodeRequired: true },
    { code: 'UZ', nameAr: 'أوزبكستان 🇺🇿', nameEn: 'Uzbekistan 🇺🇿', flag: '🇺🇿', dialCode: '+998', defaultShippingUsd: 40, postalCodeRequired: true },

    // 🇦🇺 🇳🇿 Oceania
    { code: 'AU', nameAr: 'أستراليا 🇦🇺', nameEn: 'Australia 🇦🇺', flag: '🇦🇺', dialCode: '+61', defaultShippingUsd: 40, postalCodeRequired: true },
    { code: 'NZ', nameAr: 'نيوزيلندا 🇳🇿', nameEn: 'New Zealand 🇳🇿', flag: '🇳🇿', dialCode: '+64', defaultShippingUsd: 40, postalCodeRequired: true },

    // 🇧🇷 🇦🇷 Latin America & Caribbean
    { code: 'BR', nameAr: 'البرازيل 🇧🇷', nameEn: 'Brazil 🇧🇷', flag: '🇧🇷', dialCode: '+55', defaultShippingUsd: 40, postalCodeRequired: true },
    { code: 'AR', nameAr: 'الأرجنتين 🇦🇷', nameEn: 'Argentina 🇦🇷', flag: '🇦🇷', dialCode: '+54', defaultShippingUsd: 40, postalCodeRequired: true },
    { code: 'CL', nameAr: 'تشيلي 🇨🇱', nameEn: 'Chile 🇨🇱', flag: '🇨🇱', dialCode: '+56', defaultShippingUsd: 40, postalCodeRequired: true },
    { code: 'CO', nameAr: 'كولومبيا 🇨🇴', nameEn: 'Colombia 🇨🇴', flag: '🇨🇴', dialCode: '+57', defaultShippingUsd: 40, postalCodeRequired: true },
    { code: 'PE', nameAr: 'بيرو 🇵🇪', nameEn: 'Peru 🇵🇪', flag: '🇵🇪', dialCode: '+51', defaultShippingUsd: 40, postalCodeRequired: true },
    { code: 'VE', nameAr: 'فنزويلا 🇻🇪', nameEn: 'Venezuela 🇻🇪', flag: '🇻🇪', dialCode: '+58', defaultShippingUsd: 40, postalCodeRequired: true },
    { code: 'EC', nameAr: 'إكوادور 🇪🇨', nameEn: 'Ecuador 🇪🇨', flag: '🇪🇨', dialCode: '+593', defaultShippingUsd: 40, postalCodeRequired: true },
    { code: 'UY', nameAr: 'أوروغواي 🇺🇾', nameEn: 'Uruguay 🇺🇾', flag: '🇺🇾', dialCode: '+598', defaultShippingUsd: 40, postalCodeRequired: true },
    { code: 'PY', nameAr: 'باراغواي 🇵🇾', nameEn: 'Paraguay 🇵🇾', flag: '🇵🇾', dialCode: '+595', defaultShippingUsd: 40, postalCodeRequired: true },
    { code: 'BO', nameAr: 'بوليفيا 🇧🇴', nameEn: 'Bolivia 🇧🇴', flag: '🇧🇴', dialCode: '+591', defaultShippingUsd: 40, postalCodeRequired: true },
    { code: 'CR', nameAr: 'كوستاريكا 🇨🇷', nameEn: 'Costa Rica 🇨🇷', flag: '🇨🇷', dialCode: '+506', defaultShippingUsd: 40, postalCodeRequired: true },
    { code: 'PA', nameAr: 'بنما 🇵🇦', nameEn: 'Panama 🇵🇦', flag: '🇵🇦', dialCode: '+507', defaultShippingUsd: 40, postalCodeRequired: true },
    { code: 'DO', nameAr: 'جمهورية الدومينيكان 🇩🇴', nameEn: 'Dominican Republic 🇩🇴', flag: '🇩🇴', dialCode: '+1', defaultShippingUsd: 40, postalCodeRequired: true },
    { code: 'PR', nameAr: 'بورتوريكو 🇵🇷', nameEn: 'Puerto Rico 🇵🇷', flag: '🇵🇷', dialCode: '+1', defaultShippingUsd: 40, postalCodeRequired: true },
    { code: 'JM', nameAr: 'جاميكا 🇯🇲', nameEn: 'Jamaica 🇯🇲', flag: '🇯🇲', dialCode: '+1', defaultShippingUsd: 40, postalCodeRequired: true },
    { code: 'TT', nameAr: 'ترينيداد وتوباغو 🇹🇹', nameEn: 'Trinidad and Tobago 🇹🇹', flag: '🇹🇹', dialCode: '+1', defaultShippingUsd: 40, postalCodeRequired: true },

    // 🇳🇬 🇿🇦 Africa
    { code: 'NG', nameAr: 'نيجيريا 🇳🇬', nameEn: 'Nigeria 🇳🇬', flag: '🇳🇬', dialCode: '+234', defaultShippingUsd: 40, postalCodeRequired: true },
    { code: 'ZA', nameAr: 'جنوب أفريقيا 🇿🇦', nameEn: 'South Africa 🇿🇦', flag: '🇿🇦', dialCode: '+27', defaultShippingUsd: 40, postalCodeRequired: true },
    { code: 'KE', nameAr: 'كينيا 🇰🇪', nameEn: 'Kenya 🇰🇪', flag: '🇰🇪', dialCode: '+254', defaultShippingUsd: 40, postalCodeRequired: true },
    { code: 'GH', nameAr: 'غانا 🇬🇭', nameEn: 'Ghana 🇬🇭', flag: '🇬🇭', dialCode: '+233', defaultShippingUsd: 40, postalCodeRequired: true },
    { code: 'ET', nameAr: 'إثيوبيا 🇪🇹', nameEn: 'Ethiopia 🇪🇹', flag: '🇪🇹', dialCode: '+251', defaultShippingUsd: 40, postalCodeRequired: true },
    { code: 'TZ', nameAr: 'تنزانيا 🇹🇿', nameEn: 'Tanzania 🇹🇿', flag: '🇹🇿', dialCode: '+255', defaultShippingUsd: 40, postalCodeRequired: true },
    { code: 'UG', nameAr: 'أوغندا 🇺🇬', nameEn: 'Uganda 🇺🇬', flag: '🇺🇬', dialCode: '+256', defaultShippingUsd: 40, postalCodeRequired: true },
    { code: 'CM', nameAr: 'الكاميرون 🇨🇲', nameEn: 'Cameroon 🇨🇲', flag: '🇨🇲', dialCode: '+237', defaultShippingUsd: 40, postalCodeRequired: true },
    { code: 'CI', nameAr: 'ساحل العاج 🇨🇮', nameEn: 'Ivory Coast 🇨🇮', flag: '🇨🇮', dialCode: '+225', defaultShippingUsd: 40, postalCodeRequired: true },
    { code: 'SN', nameAr: 'السنغال 🇸🇳', nameEn: 'Senegal 🇸🇳', flag: '🇸🇳', dialCode: '+221', defaultShippingUsd: 40, postalCodeRequired: true },
    { code: 'AO', nameAr: 'أنغولا 🇦🇴', nameEn: 'Angola 🇦🇴', flag: '🇦🇴', dialCode: '+244', defaultShippingUsd: 40, postalCodeRequired: true },
    { code: 'MZ', nameAr: 'موزمبيق 🇲🇿', nameEn: 'Mozambique 🇲🇿', flag: '🇲🇿', dialCode: '+258', defaultShippingUsd: 40, postalCodeRequired: true },
    { code: 'ZW', nameAr: 'زيمبابوي 🇿🇼', nameEn: 'Zimbabwe 🇿🇼', flag: '🇿🇼', dialCode: '+263', defaultShippingUsd: 40, postalCodeRequired: true },
    { code: 'ZM', nameAr: 'زامبيا 🇿🇲', nameEn: 'Zambia 🇿🇲', flag: '🇿🇲', dialCode: '+260', defaultShippingUsd: 40, postalCodeRequired: true },
    { code: 'NA', nameAr: 'ناميبيا 🇳🇦', nameEn: 'Namibia 🇳🇦', flag: '🇳🇦', dialCode: '+264', defaultShippingUsd: 40, postalCodeRequired: true },
    { code: 'BW', nameAr: 'بوتسوانا 🇧🇼', nameEn: 'Botswana 🇧🇼', flag: '🇧🇼', dialCode: '+267', defaultShippingUsd: 40, postalCodeRequired: true },
    { code: 'RW', nameAr: 'رواندا 🇷🇼', nameEn: 'Rwanda 🇷🇼', flag: '🇷🇼', dialCode: '+250', defaultShippingUsd: 40, postalCodeRequired: true },
    { code: 'MU', nameAr: 'موريتشيوس 🇲🇺', nameEn: 'Mauritius 🇲🇺', flag: '🇲🇺', dialCode: '+230', defaultShippingUsd: 40, postalCodeRequired: true }
];

export const EGYPT_FIXED_SHIPPING_EGP = 239;
