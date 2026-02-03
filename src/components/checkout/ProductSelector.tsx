import React from 'react';
import { Smartphone, Plus, Minus, Check, LucideIcon, Package, Crown } from 'lucide-react';
import { cn } from '../../lib/utils';
import { ProductVariant } from '../../types';

interface ProductSelectorProps {
    selectedVariant: ProductVariant;
    onSelectVariant: (variant: ProductVariant) => void;
    quantity: number;
    setQuantity: (q: number) => void;
    isAr: boolean;
}

const VARIANTS: { id: ProductVariant; labelAr: string; labelEn: string; price: number; icon: LucideIcon; featuresAr: string[]; featuresEn: string[] }[] = [
    {
        id: 'digital',
        labelAr: 'البروتوكول الرقمي (PDF)',
        labelEn: 'Digital Protocol (PDF)',
        price: 49.99,
        icon: Smartphone,
        featuresAr: ['تسليم فوري (PDF/EPUB)', 'قوالب دورات أساسية', 'بدون مصاريف شحن'],
        featuresEn: ['eBook (PDF/EPUB)', 'Instant Delivery', 'Basic Cycle Templates']
    },
    {
        id: 'bundle',
        labelAr: 'الحزمة التكتيكية',
        labelEn: 'Tactical Bundle',
        price: 72.00,
        icon: Package,
        featuresAr: ['نسخة ورقية + رقمية', 'كتاب صوتي (هدية)', 'شحن مجاني'],
        featuresEn: ['Paperback + Digital', 'Audiobook Bonus', 'Free Shipping']
    },
    {
        id: 'coaching',
        labelAr: 'الاحتراف الذكي (VIP)',
        labelEn: 'Smart Professional (VIP)',
        price: 82.00,
        icon: Crown,
        featuresAr: ['نسخة غلاف مقوى', 'مجتمع VIP حصري', 'شحن ذو أولوية'],
        featuresEn: ['Hardcover Premium', 'VIP Community Access', 'Priority Shipping']
    }
];

export const ProductSelector: React.FC<ProductSelectorProps> = ({ selectedVariant, onSelectVariant, quantity, setQuantity, isAr }) => {
    return (
        <div className="space-y-6">
            <h3 className="text-xl font-black text-white flex items-center gap-2">
                <span className="text-gold-500">01.</span>
                {isAr ? "اختر نسختك" : "Select Your Edition"}
            </h3>

            <div className="grid md:grid-cols-3 gap-4">
                {VARIANTS.map((variant) => {
                    const Icon = variant.icon;
                    const isSelected = selectedVariant === variant.id;

                    return (
                        <div
                            key={variant.id}
                            onClick={() => onSelectVariant(variant.id)}
                            className={cn(
                                "relative cursor-pointer rounded-2xl border-2 transition-all duration-300 p-6 flex flex-col justify-between h-full group overflow-hidden",
                                isSelected
                                    ? "bg-gradient-to-br from-gold-500/20 via-black to-black border-gold-500 shadow-[0_0_30px_rgba(234,179,8,0.2)]"
                                    : "bg-zinc-900/50 border-zinc-800 hover:border-gold-500/50 hover:bg-zinc-900"
                            )}
                        >
                            {/* Selected Indicator */}
                            {isSelected && (
                                <div className="absolute top-4 right-4 bg-gold-500 text-black rounded-full p-1 animate-in zoom-in shadow-[0_0_20px_rgba(234,179,8,0.5)]">
                                    <Check className="w-3 h-3 md:w-4 md:h-4 stroke-[4]" />
                                </div>
                            )}

                            <div>
                                <div className={cn(
                                    "w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors",
                                    isSelected ? "bg-gold-500 text-black shadow-lg shadow-gold-500/20" : "bg-zinc-800 text-zinc-400 group-hover:text-white"
                                )}>
                                    <Icon className="w-6 h-6" />
                                </div>
                                <h4 className={cn("font-black text-lg text-white mb-2 leading-tight uppercase tracking-tight", isSelected ? "text-gold-100" : "")}>
                                    {isAr ? variant.labelAr : variant.labelEn}
                                </h4>
                                <div className="text-2xl font-black text-gold-500 mb-4 tracking-tighter shadow-gold-500/10">
                                    ${variant.price}
                                </div>
                                <ul className="space-y-2 mb-4">
                                    {(isAr ? variant.featuresAr : variant.featuresEn).map((feature, i) => (
                                        <li key={i} className="flex items-start gap-2 text-[10px] md:text-xs text-zinc-400 font-bold">
                                            <div className={cn("w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 transition-colors", isSelected ? "bg-gold-500 shadow-[0_0_10px_rgba(234,179,8,0.4)]" : "bg-zinc-700")} />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center justify-between bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl">
                <span className="font-bold text-zinc-400 uppercase tracking-widest text-sm">
                    {isAr ? "الكمية" : "Quantity"}
                </span>
                <div className="flex items-center gap-4 bg-black rounded-lg p-1 border border-zinc-800">
                    <button
                        type="button"
                        aria-label={isAr ? "تقليل الكمية" : "Decrease quantity"}
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-zinc-800 text-zinc-400 transition-colors"
                    >
                        <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-black text-white">{quantity}</span>
                    <button
                        type="button"
                        aria-label={isAr ? "زيادة الكمية" : "Increase quantity"}
                        onClick={() => setQuantity(Math.min(10, quantity + 1))}
                        className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-zinc-800 text-white transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};
