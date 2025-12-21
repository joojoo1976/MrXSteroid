import React from 'react';
import { User } from 'lucide-react';

const AuthorImage: React.FC<{ name: string }> = ({ name }) => {
    return (
        <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-3xl overflow-hidden border-4 border-gold-500 shadow-[0_0_30px_rgba(234,179,8,0.3)] transform rotate-3 hover:rotate-0 transition-transform duration-500 bg-zinc-800">
            <div className="w-full h-full bg-zinc-900 flex flex-col items-center justify-center text-zinc-500 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-black opacity-50"></div>
                <div className="relative z-10 flex flex-col items-center">
                    <div className="w-32 h-32 bg-zinc-800 rounded-full flex items-center justify-center mb-4 border-2 border-zinc-700 shadow-inner">
                        <User className="w-16 h-16 text-gold-500" />
                    </div>
                    <span className="text-lg font-bold text-zinc-300">{name}</span>
                    <span className="text-xs text-gold-500 uppercase tracking-widest mt-1">Author & Coach</span>
                </div>
            </div>
        </div>
    );
};

export default AuthorImage;
