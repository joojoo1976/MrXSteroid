import React from 'react';

interface BrandLogoProps {
    className?: string; // For font size mainly
}

const BrandLogo: React.FC<BrandLogoProps> = ({ className = "text-2xl" }) => {
    // Colors based on user attachment
    // M (Yellow), r (Cyan), . (Blue)
    // X (Blue), - (Blue)
    // S (Yellow), t (Green), e (Red), r (Yellow), o (Blue), i (Cyan), d (Red)

    const spanClass = ""; // Base class for spans

    return (
        <span className={`font-black tracking-tighter font-permanent-marker ${className}`}>
            <span className="text-yellow-400">M</span>
            <span className="text-cyan-400">r</span>
            <span className="text-blue-600">.</span>
            <span className="text-blue-600 mx-1">X</span>
            <span className="text-blue-600">-</span>
            <span className="text-yellow-400">S</span>
            <span className="text-green-500">t</span>
            <span className="text-red-500">e</span>
            <span className="text-yellow-400">r</span>
            <span className="text-blue-600">o</span>
            <span className="text-cyan-400">i</span>
            <span className="text-red-500">d</span>
        </span>
    );
};

export default BrandLogo;
