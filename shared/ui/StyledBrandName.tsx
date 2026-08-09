'use client';

import React from 'react';
import BrandLogo from './BrandLogo';
import { replaceBrandWithStructuredData } from '../lib/logic';

interface StyledBrandNameProps {
    text: string;
    logoClassName?: string;
}

export const StyledBrandName: React.FC<StyledBrandNameProps> = ({ text, logoClassName }) => {
    if (!text) return <>{text}</>;

    const { parts } = replaceBrandWithStructuredData(text);

    return (
        <>
            {parts.map((part, index) => {
                if (part.isBrand) {
                    if (part.brandType === 'full' || part.brandType === 'ar-full') {
                        return <BrandLogo key={index} isLink={false} className={logoClassName || "text-inherit"} />;
                    }
                    if (part.brandType === 'short' || part.brandType === 'ar-short') {
                        return <BrandLogo key={index} variant="short" isLink={false} className={logoClassName || "text-inherit"} />;
                    }
                }
                // Render text parts safely to prevent XSS
                return <React.Fragment key={index}>{part.text}</React.Fragment>;
            })}
        </>
    );
};
