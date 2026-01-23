import React from 'react';
import BrandLogo from './BrandLogo';

interface StyledBrandNameProps {
    text: string;
    logoClassName?: string;
}

export const StyledBrandName: React.FC<StyledBrandNameProps> = ({ text, logoClassName }) => {
    if (!text) return <>{text}</>;

    const brandFull = "Mr. X-Steroid";
    const brandShort = "Mr. X";
    const brandArFull = "مستر إكس-ستيرويد";
    const brandArShort = "مستر إكس";
    const regex = new RegExp(`(${brandFull}|${brandArFull}|${brandShort}|${brandArShort})`, 'g');
    const parts = text.split(regex);

    return (
        <>
            {parts.map((part, index) => {
                if (part === brandFull || part === brandArFull) {
                    return <BrandLogo key={index} isLink={true} className={logoClassName || "text-inherit"} />;
                }
                if (part === brandShort || part === brandArShort) {
                    return <BrandLogo key={index} variant="short" isLink={true} className={logoClassName || "text-inherit"} />;
                }
                return part;
            })}
        </>
    );
};
