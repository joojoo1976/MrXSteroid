import React from 'react';
import { ContentStrings } from '../types';

interface AdPlaceholderProps {
    slotId: string; // For future real Adsense integration
    format?: 'auto' | 'horizontal' | 'vertical' | 'rectangle';
    className?: string; // For layout positioning
    content?: ContentStrings;
}

const AdPlaceholder: React.FC<AdPlaceholderProps> = ({ slotId, format = 'auto', className = '', content }) => {
    // Determine dimensions based on format mock
    let sizeClass = 'w-full h-24'; // default horizontal banner
    if (format === 'vertical') sizeClass = 'w-full h-full min-h-[400px]';
    if (format === 'rectangle') sizeClass = 'w-full h-64';

    // If content is provided, use the localized label, otherwise fallback
    const label = content?.adLabel || "Advertisement";

    return (
        <div className={`bg-zinc-100 dark:bg-zinc-800/50 border-2 border-dashed border-zinc-300 dark:border-zinc-700 flex flex-col items-center justify-center p-4 text-center select-none overflow-hidden group relative ${sizeClass} ${className}`}>
            <div className="text-xs font-black uppercase tracking-widest text-zinc-400 group-hover:text-zinc-500 transition-colors z-10">
                {label}
            </div>
            <div className="text-[10px] font-mono text-zinc-300 dark:text-zinc-600 mt-1 z-10">
                Slot: {slotId}
            </div>

            {/* Subtle patterned background */}
            <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#000_1px,transparent_1px)] dark:bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        </div>
    );
};

export default AdPlaceholder;
