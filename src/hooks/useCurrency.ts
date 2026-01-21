import { useState, useEffect } from 'react';

export interface CurrencyData {
    displayCurrency: string;
    rate: number;
    billingCurrency: 'USD';
    countryCode: string;
}

const MOCK_RATES: Record<string, { code: string; rate: number }> = {
    'EG': { code: 'EGP', rate: 48.5 },
    'SA': { code: 'SAR', rate: 3.75 },
    'AE': { code: 'AED', rate: 3.67 },
    'DE': { code: 'EUR', rate: 0.92 },
    'UK': { code: 'GBP', rate: 0.79 },
    'US': { code: 'USD', rate: 1 },
};

export const useCurrency = () => {
    const [currency, setCurrency] = useState<CurrencyData>({
        displayCurrency: 'USD',
        rate: 1,
        billingCurrency: 'USD',
        countryCode: 'US'
    });

    useEffect(() => {
        // Simulate GeoIP Check
        const detectLocation = async () => {
            // In production, this would be an API call
            // For now, we'll mock based on a potential cookie or default to US
            // If we had a real IP API, we'd use it here.

            // Simulating a delay
            await new Promise(r => setTimeout(r, 500));

            // Fallback/Mock logic:
            // You can manually test by setting window.localStorage.setItem('mrx_country', 'EG')
            const mockCountry = localStorage.getItem('mrx_country') || 'US';
            const data = MOCK_RATES[mockCountry] || MOCK_RATES['US'];

            setCurrency({
                displayCurrency: data.code,
                rate: data.rate,
                billingCurrency: 'USD',
                countryCode: mockCountry
            });
        };

        detectLocation();
    }, []);

    const formatPrice = (priceInUSD: number) => {
        if (currency.displayCurrency === 'USD') {
            return `$${priceInUSD.toFixed(2)}`;
        }
        const localPrice = (priceInUSD * currency.rate).toFixed(0);
        return `${localPrice} ${currency.displayCurrency}`; // e.g. "2400 EGP"
    };

    return { ...currency, formatPrice };
};
