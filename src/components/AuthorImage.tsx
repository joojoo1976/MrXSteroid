import React from 'react';
import { User } from 'lucide-react';

const AuthorImage: React.FC<{ name: string }> = ({ name }) => {
    return (
        <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-3xl overflow-hidden border-4 border-gold-500 shadow-[0_0_30px_rgba(234,179,8,0.3)] transform rotate-3 hover:rotate-0 transition-transform duration-500 bg-zinc-800">
            <div className="absolute inset-0">
                <img
                    src="/Author_MrXSteroid.jpg"
                    alt={name}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-6 z-10 text-center">
                <span className="text-xl font-black text-white block leading-tight">{name}</span>
                <span className="text-xs text-gold-500 uppercase tracking-[0.2em] font-bold mt-1 block">Author & Coach</span>
            </div>
        </div>
    );
};

export default AuthorImage;
