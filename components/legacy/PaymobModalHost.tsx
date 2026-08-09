/**
 * PaymobModalHost — listens for the legacy `mrx_open_paymob` custom event
 * (dispatched by the restored PricingSection "Quick Pay" buttons) and renders
 * the PaymobProductModal exactly like the old App.tsx did. Keeps the restored
 * quick-pay flow working in the App Router.
 */
'use client';

import React, { useEffect, useState } from 'react';
import PaymobProductModal from '../../features/modal/PaymobProductModal';
import { usePreferences } from '../../context/PreferencesContext';

export default function PaymobModalHost() {
    const [isOpen, setIsOpen] = useState(false);
    const [productId, setProductId] = useState<number | undefined>(undefined);
    const { language } = usePreferences();

    useEffect(() => {
        const handleOpen = (e: Event) => {
            const customEvent = e as CustomEvent<{ productId?: number | string }>;
            const raw = customEvent.detail?.productId;
            const num = typeof raw === 'string' ? parseInt(raw, 10) : raw;
            setProductId(typeof num === 'number' && !Number.isNaN(num) ? num : undefined);
            setIsOpen(true);
        };
        window.addEventListener('mrx_open_paymob', handleOpen);
        return () => window.removeEventListener('mrx_open_paymob', handleOpen);
    }, []);

    return (
        <PaymobProductModal
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            defaultProductId={productId}
            lang={language}
        />
    );
}
