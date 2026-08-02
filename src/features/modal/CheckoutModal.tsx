import React, { useState } from 'react';
import { CheckCircle, Lock, X, Download } from 'lucide-react';
import { PricingTier, ContentStrings, Page, Language } from '@/shared/types/types';
import { StyledBrandName } from '../../shared/ui/StyledBrandName';
import { CheckoutForm, NewPricingTier } from '../checkout/CheckoutForm';
import { usePreferences } from '../../context/PreferencesContext';

interface CheckoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    tier: PricingTier | null;
    content: ContentStrings;
    formattedPrice: string;
    onSuccess: () => void;
    openLegal: (key: 'privacy' | 'terms' | 'refund' | 'disclaimer') => void;
    navigateTo: (page: Page) => void;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, tier, content, formattedPrice, onSuccess, openLegal, navigateTo }) => {
    const { language: lang } = usePreferences();
    const [step, setStep] = useState<'form' | 'success'>('form');
    const [isEgypt, setIsEgypt] = useState(false); // Used for location-specific logic

    if (!isOpen || !tier) return null;

    const handleSuccess = () => {
        setStep('success');
        onSuccess();
    };

    const newTier = tier as NewPricingTier;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
            <div className="bg-white dark:bg-card w-full max-w-md rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 relative z-10 overflow-hidden animate-fade-in-up">
                <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-zinc-50 dark:bg-background">
                    <h3 className="font-bold text-lg flex items-center gap-2">{step === 'success' ? <CheckCircle className="text-green-500" /> : <Lock className="text-gold-500 w-5 h-5" />}{step === 'success' ? content.purchaseSuccess.split('!')[0] : content.checkoutTitle}</h3><button onClick={onClose} aria-label="Close modal" title="Close modal" className="text-zinc-500 hover:text-red-500"><X className="w-5 h-5" /></button>
                </div>
                <div className="p-0 max-h-[85vh] overflow-y-auto">
                    {step === 'form' && (
                        <div className="p-6">
                            <CheckoutForm
                                content={content}
                                lang={lang as Language}
                                selectedTier={newTier}
                                onSuccess={handleSuccess}
                                productVariant={newTier.id || 'digital'}
                                quantity={1}
                                isEg={isEgypt}
                                onLocationChange={setIsEgypt}
                                totalAmount={tier.price}
                                openLegal={openLegal}
                            />
                        </div>
                    )}

                    {step === 'success' && <div className="flex flex-col items-center justify-center py-6 space-y-6 text-center animate-fade-in"><div className="w-20 h-20 bg-green-100 dark:bg-green-500/20 rounded-full flex items-center justify-center"><CheckCircle className="w-10 h-10 text-green-500" /></div><div><h4 className="text-xl font-bold mb-2"><StyledBrandName text={content.purchaseSuccess} /></h4><p className="text-sm text-zinc-500 dark:text-zinc-400">Please check your email for the receipt.</p></div><a href="/dummy-book.pdf" download className="w-full py-4 bg-zinc-900 dark:bg-white text-white dark:text-black font-bold rounded-xl flex items-center justify-center gap-2 hover:scale-105 transition-transform"><Download className="w-5 h-5" />{content.downloadFullBook}</a></div>}
                </div>
            </div>
        </div>
    );
};

export default CheckoutModal;
