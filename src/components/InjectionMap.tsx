import React, { useState } from 'react';
import { Rotate3D, ShieldCheck, AlertTriangle, Target } from 'lucide-react';
import { ContentStrings } from '../types';

interface InjectionMapProps {
  content: ContentStrings;
  lang: string;
}

const InjectionMap: React.FC<InjectionMapProps> = ({ content, lang }) => {
  const [activeSite, setActiveSite] = useState<string | null>(null);
  const [view, setView] = useState<'front' | 'back'>('front');
  const siteData = content.injectionMap.sites.find(s => s.id === activeSite);

  // Simplified body representation for demo (Using simpler shapes to construct a body map)
  const BodySVG = ({ isBack }: { isBack: boolean }) => (
    <svg viewBox="0 0 200 400" className="w-full h-full drop-shadow-2xl">
      <defs>
        <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#52525b" />
          <stop offset="50%" stopColor="#71717a" />
          <stop offset="100%" stopColor="#52525b" />
        </linearGradient>
      </defs>

      {/* Head */}
      <circle cx="100" cy="30" r="15" fill="url(#bodyGrad)" />

      {/* Neck */}
      <rect x="90" y="45" width="20" height="10" fill="url(#bodyGrad)" />

      {/* Torso */}
      <path d={isBack
        ? "M70 60 L130 60 L120 140 L80 140 Z" // Back Traps/Lats shape
        : "M70 60 L130 60 L115 140 L85 140 Z" // Chest/Abs shape
      } fill="url(#bodyGrad)" />

      {/* Arms */}
      <path d="M65 65 L45 100 L50 160 L60 160 L60 100" fill="url(#bodyGrad)" /> {/* Left Arm */}
      <path d="M135 65 L155 100 L150 160 L140 160 L140 100" fill="url(#bodyGrad)" /> {/* Right Arm */}

      {/* Hips/Glutes area */}
      <path d={isBack
        ? "M80 140 L120 140 L125 180 C125 200, 75 200, 75 180 Z" // Glutes
        : "M85 140 L115 140 L120 170 L80 170 Z" // Pelvis
      } fill="url(#bodyGrad)" />

      {/* Legs */}
      <path d="M80 180 L75 280 L85 360 L105 360 L110 280 L120 180" fill="transparent" /> {/* Outline Ref */}
      {/* Left Leg */}
      <path d="M80 170 L70 260 L75 350 L90 350 L95 260 L95 170 Z" fill="url(#bodyGrad)" />
      {/* Right Leg */}
      <path d="M120 170 L130 260 L125 350 L110 350 L105 260 L105 170 Z" fill="url(#bodyGrad)" />

      {/* Interactive Points */}
      {!isBack && (
        <>
          {/* Delts (Side) */}
          <circle
            cx="55" cy="80" r="6"
            className={`cursor-pointer transition-all origin-center hover:scale-125 ${activeSite === 'delt_side' ? 'fill-gold-500 animate-pulse' : 'fill-green-500/50 hover:fill-green-500'}`}
            onClick={() => setActiveSite('delt_side')}
          />
          <circle
            cx="145" cy="80" r="6"
            className={`cursor-pointer transition-all origin-center hover:scale-125 ${activeSite === 'delt_side' ? 'fill-gold-500 animate-pulse' : 'fill-green-500/50 hover:fill-green-500'}`}
            onClick={() => setActiveSite('delt_side')}
          />

          {/* Pecs */}
          <circle
            cx="85" cy="90" r="7"
            className={`cursor-pointer transition-all origin-center hover:scale-125 ${activeSite === 'pecs' ? 'fill-gold-500 animate-pulse' : 'fill-blue-500/50 hover:fill-blue-500'}`}
            onClick={() => setActiveSite('pecs')}
          />
          <circle
            cx="115" cy="90" r="7"
            className={`cursor-pointer transition-all origin-center hover:scale-125 ${activeSite === 'pecs' ? 'fill-gold-500 animate-pulse' : 'fill-blue-500/50 hover:fill-blue-500'}`}
            onClick={() => setActiveSite('pecs')}
          />

          {/* Ventro Glute (Hip side) */}
          <circle
            cx="70" cy="160" r="6"
            className={`cursor-pointer transition-all origin-center hover:scale-125 ${activeSite === 'glute_ventro' ? 'fill-gold-500 animate-pulse' : 'fill-green-500/50 hover:fill-green-500'}`}
            onClick={() => setActiveSite('glute_ventro')}
          />
          <circle
            cx="130" cy="160" r="6"
            className={`cursor-pointer transition-all origin-center hover:scale-125 ${activeSite === 'glute_ventro' ? 'fill-gold-500 animate-pulse' : 'fill-green-500/50 hover:fill-green-500'}`}
            onClick={() => setActiveSite('glute_ventro')}
          />

          {/* Quad Outer */}
          <circle
            cx="75" cy="220" r="8"
            className={`cursor-pointer transition-all origin-center hover:scale-125 ${activeSite === 'quad_outer' ? 'fill-gold-500 animate-pulse' : 'fill-green-500/50 hover:fill-green-500'}`}
            onClick={() => setActiveSite('quad_outer')}
          />
          <circle
            cx="125" cy="220" r="8"
            className={`cursor-pointer transition-all origin-center hover:scale-125 ${activeSite === 'quad_outer' ? 'fill-gold-500 animate-pulse' : 'fill-green-500/50 hover:fill-green-500'}`}
            onClick={() => setActiveSite('quad_outer')}
          />
          {/* Biceps */}
          <circle
            cx="50" cy="120" r="5"
            className={`cursor-pointer transition-all origin-center hover:scale-125 ${activeSite === 'biceps' ? 'fill-gold-500 animate-pulse' : 'fill-red-500/50 hover:fill-red-500'}`}
            onClick={() => setActiveSite('biceps')}
          />
          <circle
            cx="150" cy="120" r="5"
            className={`cursor-pointer transition-all origin-center hover:scale-125 ${activeSite === 'biceps' ? 'fill-gold-500 animate-pulse' : 'fill-red-500/50 hover:fill-red-500'}`}
            onClick={() => setActiveSite('biceps')}
          />
        </>
      )}

      {isBack && (
        <>
          {/* Traps */}
          <circle
            cx="85" cy="55" r="6"
            className={`cursor-pointer transition-all origin-center hover:scale-125 ${activeSite === 'traps' ? 'fill-gold-500 animate-pulse' : 'fill-blue-500/50 hover:fill-blue-500'}`}
            onClick={() => setActiveSite('traps')}
          />
          <circle
            cx="115" cy="55" r="6"
            className={`cursor-pointer transition-all origin-center hover:scale-125 ${activeSite === 'traps' ? 'fill-gold-500 animate-pulse' : 'fill-blue-500/50 hover:fill-blue-500'}`}
            onClick={() => setActiveSite('traps')}
          />

          {/* Lats */}
          <circle
            cx="80" cy="110" r="8"
            className={`cursor-pointer transition-all origin-center hover:scale-125 ${activeSite === 'lats' ? 'fill-gold-500 animate-pulse' : 'fill-blue-500/50 hover:fill-blue-500'}`}
            onClick={() => setActiveSite('lats')}
          />
          <circle
            cx="120" cy="110" r="8"
            className={`cursor-pointer transition-all origin-center hover:scale-125 ${activeSite === 'lats' ? 'fill-gold-500 animate-pulse' : 'fill-blue-500/50 hover:fill-blue-500'}`}
            onClick={() => setActiveSite('lats')}
          />

          {/* Triceps */}
          <circle
            cx="48" cy="115" r="5"
            className={`cursor-pointer transition-all origin-center hover:scale-125 ${activeSite === 'triceps' ? 'fill-gold-500 animate-pulse' : 'fill-blue-500/50 hover:fill-blue-500'}`}
            onClick={() => setActiveSite('triceps')}
          />
          <circle
            cx="152" cy="115" r="5"
            className={`cursor-pointer transition-all origin-center hover:scale-125 ${activeSite === 'triceps' ? 'fill-gold-500 animate-pulse' : 'fill-blue-500/50 hover:fill-blue-500'}`}
            onClick={() => setActiveSite('triceps')}
          />

          {/* Dorso Glute (Upper Outer Quadrant) */}
          <circle
            cx="85" cy="175" r="9"
            className={`cursor-pointer transition-all origin-center hover:scale-125 ${activeSite === 'glute_dorso' ? 'fill-gold-500 animate-pulse' : 'fill-green-500/50 hover:fill-green-500'}`}
            onClick={() => setActiveSite('glute_dorso')}
          />
          <circle
            cx="115" cy="175" r="9"
            className={`cursor-pointer transition-all origin-center hover:scale-125 ${activeSite === 'glute_dorso' ? 'fill-gold-500 animate-pulse' : 'fill-green-500/50 hover:fill-green-500'}`}
            onClick={() => setActiveSite('glute_dorso')}
          />

          {/* Calves */}
          <circle
            cx="75" cy="310" r="6"
            className={`cursor-pointer transition-all origin-center hover:scale-125 ${activeSite === 'calves' ? 'fill-gold-500 animate-pulse' : 'fill-red-500/50 hover:fill-red-500'}`}
            onClick={() => setActiveSite('calves')}
          />
          <circle
            cx="125" cy="310" r="6"
            className={`cursor-pointer transition-all origin-center hover:scale-125 ${activeSite === 'calves' ? 'fill-gold-500 animate-pulse' : 'fill-red-500/50 hover:fill-red-500'}`}
            onClick={() => setActiveSite('calves')}
          />
        </>
      )}
    </svg>
  );

  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      <div className="text-center mb-10"><h1 className="text-3xl font-bold mb-2">{content.injectionMap.title}</h1><p className="text-zinc-500">{content.injectionMap.subtitle}</p></div>
      <div className="grid lg:grid-cols-2 gap-8 items-start">
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 relative min-h-[500px] flex flex-col items-center justify-center overflow-hidden">

          {/* 3D Toggle */}
          <div className="absolute top-6 z-10 flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-700">
            <button onClick={() => setView('front')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${view === 'front' ? 'bg-white dark:bg-zinc-700 shadow-sm text-black dark:text-white' : 'text-zinc-500'}`}>
              {content.injectionMap.viewFront}
            </button>
            <button onClick={() => setView('back')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${view === 'back' ? 'bg-white dark:bg-zinc-700 shadow-sm text-black dark:text-white' : 'text-zinc-500'}`}>
              {content.injectionMap.viewBack}
            </button>
          </div>

          <div className="relative w-full h-[450px] flex items-center justify-center mt-10 transition-all duration-500">
            {/* Body Map SVG */}
            <div className={`w-64 h-full transition-transform duration-500 ${view === 'back' ? 'scale-x-[-1]' : ''}`}> {/* Flip horizontally logic or component swap */}
              <BodySVG isBack={view === 'back'} />
            </div>
          </div>

          <div className="absolute bottom-6 left-6 flex items-center gap-2 text-[10px] text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-full border border-zinc-200 dark:border-zinc-700">
            <Rotate3D className="w-3 h-3" /> {content.injectionMap.interactiveMapLabel}
          </div>
        </div>
        <div>
          {siteData ? (
            <div className="bg-zinc-900 text-white p-8 rounded-3xl shadow-xl animate-fade-in border-t-4 border-gold-500">
              <div className="flex justify-between items-start mb-6"><div><h3 className="text-2xl font-bold">{siteData.name}</h3><span className="text-gold-500 text-sm font-bold uppercase tracking-wider">{siteData.category}</span></div>{siteData.riskLevel === 'Low' ? <ShieldCheck className="text-green-500 w-8 h-8" /> : <AlertTriangle className="text-orange-500 w-8 h-8" />}</div>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4"><div className="bg-zinc-800 p-4 rounded-xl"><div className="text-xs text-zinc-400 mb-1">{content.injectionMap.needleSizeLabel}</div><div className="font-bold font-mono text-lg">{siteData.needle}</div></div><div className="bg-zinc-800 p-4 rounded-xl"><div className="text-xs text-zinc-400 mb-1">{content.injectionMap.maxVolumeLabel}</div><div className="font-bold font-mono text-lg">{siteData.volume} {content.units.ml}</div></div></div>
                <div className="bg-zinc-800 p-4 rounded-xl border-l-4 border-blue-500"><div className="text-xs text-zinc-400 mb-2 font-bold uppercase tracking-wider">{content.injectionMap.medicalInsightLabel}</div><p className="text-sm leading-relaxed text-zinc-300">{siteData.description}</p></div>
                {siteData.warning && (<div className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl flex gap-3 items-start"><AlertTriangle className="w-5 h-5 text-red-500 shrink-0" /><p className="text-sm text-red-200">{siteData.warning}</p></div>)}

                <div className="pt-4 border-t border-zinc-800 flex justify-between items-center text-xs text-zinc-500">
                  <span>{content.injectionMap.recoveryLabel}: <span className="text-white font-bold">{siteData.recoveryDays} {content.units.days}</span></span>
                  <span>{content.injectionMap.riskLevelLabel}: <span className={`font-bold ${siteData.riskLevel === 'Low' ? 'text-green-500' : 'text-orange-500'}`}>{siteData.riskLevel === 'Low' ? content.injectionMap.riskLevels.low : content.injectionMap.riskLevels.high}</span></span>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-zinc-400 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl"><Target className="w-16 h-16 mb-4 opacity-20" /><p>{content.injectionMap.tapToExplore}</p></div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InjectionMap;
