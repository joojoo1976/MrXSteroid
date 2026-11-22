import type { ContentStrings, Language, PricingTier, ProductVariant } from '@/shared/types/types';
import type { useCheckout } from './hooks/useCheckout';

/** Full return surface of the checkout controller hook. */
export type CheckoutController = ReturnType<typeof useCheckout>;

/** State and validation for the optional InstaPay transfer receipt. */
export interface InstapayReceiptState {
    ref: string;
    setRef: (value: string) => void;
    file: File | null;
    error: string;
    handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export interface NewPricingTier extends PricingTier {
    id: ProductVariant;
    requiresShipping: boolean;
    requiresBodyStats: boolean;
    selectedLanguage: 'en' | 'ar';
}

export interface CheckoutFormProps {
    content: ContentStrings;
    lang: Language;
    selectedTier: NewPricingTier;
    onSuccess: () => void;
    productVariant: ProductVariant;
    quantity: number;
    isEg: boolean;
    onLocationChange: (isEgypt: boolean) => void;
    onShippingChange?: (cost: number) => void;
    onDiscountChange?: (discountAmount: number) => void;
    totalAmount: number;
    openLegal?: (key: 'privacy' | 'terms' | 'refund' | 'disclaimer') => void;
}
