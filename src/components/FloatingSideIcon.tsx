import React from 'react';

const FloatingSideIcon: React.FC<{ isRTL: boolean }> = ({ isRTL }) => {
    return (
        <div
            className={`fixed top-1/2 -translate-y-1/2 ${isRTL ? 'left-0' : 'right-0'} z-50 hidden md:block`}
        >
            <div className={`bg-white dark:bg-zinc-900 p-2 shadow-2xl border ${isRTL ? 'border-l-0 rounded-r-[2rem]' : 'border-r-0 rounded-l-[2rem]'} border-zinc-200 dark:border-zinc-800 transition-all hover:pr-4 hover:pl-4 group`}>
                <img
                    src="/icon.webp"
                    alt="Mr. X Icon"
                    className="w-10 h-10 object-contain rounded-2xl animate-pulse-slow group-hover:scale-110 transition-transform"
                />
            </div>
        </div>
    );
};

export default FloatingSideIcon;
