'use client';

import { useState } from 'react';
import type { ChangeEvent } from 'react';
import type { InstapayReceiptState } from '../checkoutFormTypes';

const MAX_RECEIPT_BYTES = 10 * 1024 * 1024;
const ALLOWED_RECEIPT_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'application/pdf'];

/**
 * Owns the optional InstaPay transfer reference and the required receipt upload.
 * Validation errors are surfaced to the InstaPay panel; invalid files are never stored.
 */
export function useInstapayReceipt(isAr: boolean): InstapayReceiptState {
    const [ref, setRef] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState('');

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        setError('');
        const selected = event.target.files?.[0] || null;
        if (!selected) {
            setFile(null);
            return;
        }
        if (!ALLOWED_RECEIPT_TYPES.includes(selected.type)) {
            setError(isAr ? 'صيغة غير مدعومة. المسموح: PNG, JPG, WEBP, PDF' : 'Unsupported file type. Allowed: PNG, JPG, WEBP, PDF');
            setFile(null);
            event.target.value = '';
            return;
        }
        if (selected.size > MAX_RECEIPT_BYTES) {
            setError(isAr ? 'حجم الملف أكبر من 10 ميجابايت' : 'File is larger than 10MB');
            setFile(null);
            event.target.value = '';
            return;
        }
        setFile(selected);
    };

    return { ref, setRef, file, error, handleFileChange };
}
