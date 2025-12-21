import React from 'react';
import { MessageCircle } from 'lucide-react';

const WhatsAppButton: React.FC<{ isRTL: boolean }> = ({ isRTL }) => (
    <a
        href="https://wa.me/201000722050"
        target="_blank"
        rel="noopener noreferrer"
        className={`fixed bottom-24 ${isRTL ? 'right-6' : 'left-6'} z-40 bg-green-500 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform flex items-center justify-center`}
        aria-label="Contact on WhatsApp"
    >
        <MessageCircle className="w-6 h-6" />
    </a>
);

export default WhatsAppButton;
