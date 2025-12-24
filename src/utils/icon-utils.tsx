import React from 'react';
import {
    Dumbbell, Heart, Activity, ShieldAlert, ShieldCheck, Clock, TestTube2,
    BookOpen, Map, TrendingUp, RotateCcw, Zap, BicepsFlexed, Trophy, Flag, Star
} from 'lucide-react';

export const USFlag = () => (
    <svg viewBox="0 0 16 12" className="w-5 h-3.5 rounded-[2px] shadow-sm flex-shrink-0 border border-zinc-100 dark:border-zinc-800" xmlns="http://www.w3.org/2000/svg">
        <rect width="16" height="12" fill="#fff" />
        <path d="M0 0h16v1H0zm0 2h16v1H0zm0 2h16v1H0zm0 2h16v1H0zm0 2h16v1H0z" fill="#bf0a30" />
        <rect width="7" height="6" fill="#002868" />
        <g fill="#fff">
            <circle cx="1.5" cy="1" r=".5" />
            <circle cx="3.5" cy="1" r=".5" />
            <circle cx="5.5" cy="1" r=".5" />
            <circle cx="2.5" cy="3" r=".5" />
            <circle cx="4.5" cy="3" r=".5" />
            <circle cx="1.5" cy="5" r=".5" />
            <circle cx="3.5" cy="5" r=".5" />
            <circle cx="5.5" cy="5" r=".5" />
        </g>
    </svg>
);

export const EGFlag = () => (
    <svg viewBox="0 0 12 9" className="w-5 h-3.5 rounded-[2px] shadow-sm flex-shrink-0 border border-zinc-100 dark:border-zinc-800" xmlns="http://www.w3.org/2000/svg">
        <rect width="12" height="9" fill="#fff" />
        <rect width="12" height="3" fill="#ce1126" />
        <rect width="12" height="3" y="6" fill="#000" />
        <circle cx="6" cy="4.5" r="1.2" fill="#c09300" />
    </svg>
);

export const ILFlag = () => (
    <svg viewBox="0 0 22 16" className="w-5 h-3.5 rounded-[2px] shadow-sm flex-shrink-0 border border-zinc-100 dark:border-zinc-800" xmlns="http://www.w3.org/2000/svg">
        <rect width="22" height="16" fill="#fff" />
        <rect y="2" width="22" height="2" fill="#005eb8" />
        <rect y="12" width="22" height="2" fill="#005eb8" />
        <g transform="translate(11,8) scale(0.5)">
            <polygon points="0,-6 5.2,3 -5.2,3" fill="none" stroke="#005eb8" strokeWidth="1.5" />
            <polygon points="0,6 5.2,-3 -5.2,-3" fill="none" stroke="#005eb8" strokeWidth="1.5" />
        </g>
    </svg>
);

export const IconRenderer = ({ iconKey }: { iconKey: string }) => {
    switch (iconKey) {
        case 'athlete': return <Dumbbell className="w-8 h-8 text-gold-500" />;
        case 'women': return <Heart className="w-8 h-8 text-pink-500" />;
        case 'coach': return <Activity className="w-8 h-8 text-blue-500" />;
        case 'truth': return <ShieldAlert className="w-8 h-8 text-red-500" />;
        case 'shield': return <ShieldCheck className="w-8 h-8 text-green-500" />;
        case 'time': return <Clock className="w-8 h-8 text-gold-500" />;
        case 'science': return <TestTube2 className="w-8 h-8 text-purple-500" />;
        case 'source': return <BookOpen className="w-8 h-8 text-blue-500" />;
        case 'health': return <Heart className="w-8 h-8 text-red-500" />;
        case 'guide': return <Map className="w-8 h-8 text-green-500" />;
        case 'chart': return <TrendingUp className="w-8 h-8 text-gold-500" />;
        case 'exit': return <RotateCcw className="w-8 h-8 text-blue-500" />;
        case 'spark': return <Zap className="w-8 h-8 text-gold-500" />;
        case 'muscle': return <BicepsFlexed className="w-8 h-8 text-gold-500" />;
        case 'trophy': return <Trophy className="w-8 h-8 text-gold-500" />;
        case 'flag': return <Flag className="w-8 h-8 text-gold-500" />;
        default: return <Star className="w-8 h-8 text-gold-500" />;
    }
};
