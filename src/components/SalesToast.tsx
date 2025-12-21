import React, { useState, useEffect } from 'react';
import { CheckCircle } from 'lucide-react';
import { ContentStrings, SalesNotificationData } from '../types';

const SalesToast: React.FC<{ content: ContentStrings, data: SalesNotificationData[], isRTL: boolean }> = ({ content, data, isRTL }) => {
    const [visible, setVisible] = useState(false);
    const [currentSale, setCurrentSale] = useState<SalesNotificationData | null>(null);

    useEffect(() => {
        const interval = setInterval(() => {
            const random = data[Math.floor(Math.random() * data.length)];
            setCurrentSale(random);
            setVisible(true);
            setTimeout(() => setVisible(false), 5000);
        }, 20000);
        return () => clearInterval(interval);
    }, [data]);

    if (!visible || !currentSale) return null;

    return (
        <div className={`fixed bottom-6 ${isRTL ? 'right-6' : 'left-6'} z-40 bg-white dark:bg-zinc-800 border-l-4 border-gold-500 p-4 rounded-lg shadow-xl flex items-center gap-4 animate-fade-in-up max-w-xs`}>
            <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full"><CheckCircle className="w-5 h-5 text-green-500" /></div>
            <div>
                <p className="text-xs font-bold text-zinc-900 dark:text-white">{currentSale.name} <span className="text-zinc-400 font-normal">from {currentSale.location}</span></p>
                <p className="text-[10px] text-zinc-500">{content.salesToast.purchased}</p>
                <span className="text-[10px] text-zinc-400">{content.salesToast.justNow}</span>
            </div>
        </div>
    );
};

export default SalesToast;
