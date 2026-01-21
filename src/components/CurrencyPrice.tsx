import React, { useEffect, useState } from 'react';
import { Currency } from '../types';
import { formatCurrencyWithLocale, convertCurrency, CURRENCY_RATES } from '../utils/logic';

interface CurrencyPriceProps {
    basePrice: number;           // Base price in USD
    baseCurrency?: Currency;     // Base currency (default: USD)
    targetCurrency: Currency;    // Target currency to display
    locale: string;              // Locale for formatting
    isLoading?: boolean;         // External loading state
    className?: string;          // Additional CSS classes
    showTransition?: boolean;    // Enable transition effect
}

const CurrencyPrice: React.FC<CurrencyPriceProps> = ({
    basePrice,
    baseCurrency = Currency.USD,
    targetCurrency,
    locale,
    isLoading = false,
    className = '',
    showTransition = true,
}) => {
    const [internalLoading, setInternalLoading] = useState(false);
    const [prevCurrency, setPrevCurrency] = useState<Currency>(targetCurrency);
    // Use useMemo for the formatted price to avoid useEffect and cascading renders
    const displayPrice = React.useMemo(() => {
        try {
            // Convert from base currency to target currency
            const convertedAmount = convertCurrency(basePrice, baseCurrency, targetCurrency);
            // Format using Intl.NumberFormat with proper locale
            return formatCurrencyWithLocale(convertedAmount, targetCurrency, locale);
        } catch (error) {
            console.error('Currency formatting error:', error);
            // Fallback formatting
            const rate = CURRENCY_RATES[targetCurrency].rate / CURRENCY_RATES[baseCurrency].rate;
            const symbol = CURRENCY_RATES[targetCurrency].symbol;
            return `${symbol}${(basePrice * rate).toFixed(2)}`;
        }
    }, [basePrice, baseCurrency, targetCurrency, locale]);

    // Track currency change for transition effect
    useEffect(() => {
        if (prevCurrency !== targetCurrency && showTransition) {
            // Use a slight delay to avoid synchronous setState warning and ensure smooth transition
            const loadingTimer = setTimeout(() => {
                setInternalLoading(true);
                const clearTimer = setTimeout(() => {
                    setInternalLoading(false);
                }, 400);
                return () => clearTimeout(clearTimer);
            }, 0);

            // Wrap in setTimeout(0) to avoid synchronous setState warning
            const prevCurrencyTimer = setTimeout(() => {
                setPrevCurrency(targetCurrency);
            }, 0);

            return () => {
                clearTimeout(loadingTimer);
                clearTimeout(prevCurrencyTimer);
            };
        }
    }, [targetCurrency, prevCurrency, showTransition]);

    const isBlurred = isLoading || internalLoading;

    return (
        <span
            className={`currency-price inline-block transition-all duration-[400ms] ease-in-out ${isBlurred ? 'blur-[4px] opacity-60' : 'blur-0 opacity-100'
                } ${className}`}
        >
            {displayPrice}
        </span>
    );
};

export default CurrencyPrice;
