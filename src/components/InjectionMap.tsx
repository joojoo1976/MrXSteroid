import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Rotate3D, ShieldCheck, AlertTriangle, Target, Zap, Activity, Info } from 'lucide-react';
import { ContentStrings } from '../types';

interface InjectionMapProps {
  content: ContentStrings;
  lang: string;
}

const InjectionMap: React.FC<InjectionMapProps> = ({ content, lang }) => {
  const [activeSite, setActiveSite] = useState<string | null>(null);
  const [view, setView] = useState<'front' | 'back'>('front');
  const [rotation, setRotation] = useState(0);
  const [cumulativeGrowth, setCumulativeGrowth] = useState(1240); // Starting dummy value
  const siteData = content.injectionMap.sites.find(s => s.id === activeSite);

  // Toggle view and rotation
  const toggleView = (newView: 'front' | 'back') => {
    if (view === newView) return;
    setView(newView);
    setRotation(prev => prev + 180);
  };

  // Auto-suggest logic (Rotation Tracker)
  const [suggestedSite, setSuggestedSite] = useState<string | null>(null);

  useEffect(() => {
    if (activeSite) {
      // Simulate cumulative growth counter increasing
      const interval = setInterval(() => {
        setCumulativeGrowth(prev => prev + Math.floor(Math.random() * 10));
      }, 100);

      // Simple logic: if 'delt_side' is active, suggest 'glute_ventro', etc.
      const currentCategory = siteData?.category;
      const allSites = content.injectionMap.sites;
      const nextSite = allSites.find(s => s.id !== activeSite && s.riskLevel === 'Low')?.id; // Simple heuristic
      setSuggestedSite(nextSite || null);

      return () => clearInterval(interval);
    }
  }, [activeSite, siteData, content.injectionMap.sites]);

  // Hotspot Component
  const Hotspot = ({ id, x, y, size = 6, color = 'bg-neon-green' }: { id: string, x: string, y: string, size?: number, color?: string }) => {
    const isSuggested = suggestedSite === id;
    const isActive = activeSite === id;

    return (
      <motion.button
        className={`absolute rounded-full cursor-pointer z-20 ${isActive ? 'ring-4 ring-gold-500 z-30' : ''} ${isSuggested ? 'ring-2 ring-gold-500 animate-pulse' : ''}`}
        style={{ left: x, top: y, width: `${size * 4}px`, height: `${size * 4}px` }}
        whileHover={{ scale: 1.5 }}
        whileTap={{ scale: 0.9 }}
        onClick={(e) => { e.stopPropagation(); setActiveSite(id); }}
        initial={{ scale: 0 }}
        animate={{ scale: 1, backgroundColor: isActive ? '#EAB308' : isSuggested ? '#EAB308' : '#22c55e' }}
      >
        <span className={`absolute inset-0 rounded-full ${isActive ? 'bg-gold-500' : 'bg-neon-green'} opacity-50 animate-ping`} />
        {isActive && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: -30 }}
            className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black/80 text-gold-500 text-xs font-bold px-2 py-1 rounded whitespace-nowrap backdrop-blur-sm border border-gold-500/30"
          >
            {content.injectionMap.efficiencyLabel}: 98%
          </motion.div>
        )}
      </motion.button>
    );
  };

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 relative">
      {/* Header */}
      <div className="text-center mb-16 relative z-10">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-neon-green to-gold-500"
        >
          {content.injectionMap.title}
        </motion.h1>
        <p className="text-xl text-zinc-400 max-w-2xl mx-auto">{content.injectionMap.subtitle}</p>
      </div>

      <div className="grid lg:grid-cols-12 gap-12 items-start">

        {/* 3D Map Section */}
        <div className="lg:col-span-7 relative min-h-[600px] perspective-1000 group">
          {/* Controls */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 flex gap-4 bg-black/60 backdrop-blur-md p-2 rounded-full border border-white/10">
            <button onClick={() => toggleView('front')} className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${view === 'front' ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.5)]' : 'text-zinc-400 hover:text-white'}`}>
              {content.injectionMap.viewFront}
            </button>
            <button onClick={() => toggleView('back')} className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${view === 'back' ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.5)]' : 'text-zinc-400 hover:text-white'}`}>
              {content.injectionMap.viewBack}
            </button>
          </div>

          {/* Rotating Container */}
          <motion.div
            className="w-full h-full relative preserve-3d transition-transform duration-700 ease-in-out"
            animate={{ rotateY: rotation }}
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* Front Face */}
            <div
              className="absolute inset-0 bg-zinc-900 rounded-[3rem] overflow-hidden border border-zinc-800 shadow-[0_0_50px_rgba(6,182,212,0.1)]"
              style={{ backfaceVisibility: 'hidden' }}
            >
              <img src="/3d_Safe_Injection_Map.jpg" alt="Body Map Front" className="w-full h-full object-cover opacity-80" />

              {/* Front Hotspots (Absolute Positioning %) */}
              {/* Delts */}
              <Hotspot id="delt_side" x="25%" y="22%" />
              <Hotspot id="delt_side" x="75%" y="22%" />

              {/* Pecs */}
              <Hotspot id="pecs" x="35%" y="28%" color="bg-cyan-400" />
              <Hotspot id="pecs" x="65%" y="28%" color="bg-cyan-400" />

              {/* Quads */}
              <Hotspot id="quad_outer" x="30%" y="55%" />
              <Hotspot id="quad_outer" x="70%" y="55%" />

              {/* Biceps */}
              <Hotspot id="biceps" x="18%" y="30%" color="bg-pink-500" />
              <Hotspot id="biceps" x="82%" y="30%" color="bg-pink-500" />
            </div>

            {/* Back Face (Rotated 180deg) */}
            <div
              className="absolute inset-0 bg-zinc-900 rounded-[3rem] overflow-hidden border border-zinc-800 shadow-[0_0_50px_rgba(6,182,212,0.1)]"
              style={{ transform: 'rotateY(180deg)', backfaceVisibility: 'hidden' }}
            >
              {/* Using same image for demo, but logically would be back view */}
              <img src="/3d_Safe_Injection_Map.jpg" alt="Body Map Back" className="w-full h-full object-cover opacity-60 grayscale" />

              {/* Back Hotspots */}
              {/* Glutes */}
              <Hotspot id="glute_dorso" x="35%" y="45%" size={8} />
              <Hotspot id="glute_dorso" x="65%" y="45%" size={8} />

              {/* Traps */}
              <Hotspot id="traps" x="42%" y="18%" />
              <Hotspot id="traps" x="58%" y="18%" />

              {/* Lats */}
              <Hotspot id="lats" x="32%" y="32%" />
              <Hotspot id="lats" x="68%" y="32%" />
            </div>
          </motion.div>

          {/* Cumulative Growth Counter */}
          <div className="absolute bottom-8 right-8 bg-black/80 backdrop-blur-md p-4 rounded-2xl border border-neon-green/30 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
            <div className="text-[10px] text-neon-green uppercase tracking-widest font-bold mb-1">{content.injectionMap.cumulativeGrowthLabel}</div>
            <div className="text-3xl font-mono font-black text-white tabular-nums flex items-center gap-2">
              <Activity className="w-5 h-5 text-neon-green animate-pulse" />
              +{cumulativeGrowth.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Info Panel */}
        <div className="lg:col-span-5 space-y-6">
          <AnimatePresence mode="wait">
            {siteData ? (
              <motion.div
                key="site-info"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                className="bg-black/40 backdrop-blur-xl border border-white/10 p-8 rounded-[2rem] relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/20 rounded-full blur-[50px] -mr-10 -mt-10" />

                <div className="relative z-10">
                  <span className="inline-block px-3 py-1 bg-gold-500/20 text-gold-500 rounded-full text-xs font-bold mb-4 border border-gold-500/50">
                    {siteData.category}
                  </span>
                  <h2 className="text-4xl font-black text-white mb-6 uppercase italic">{siteData.name}</h2>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="p-4 bg-white/5 rounded-xl border border-white/5 hover:border-cyan-500/50 transition-colors">
                      <div className="text-xs text-zinc-400 mb-1">{content.injectionMap.maxVolumeLabel}</div>
                      <div className="text-xl font-bold text-cyan-400 font-mono">{siteData.volume} {content.units.ml}</div>
                    </div>
                    <div className="p-4 bg-white/5 rounded-xl border border-white/5 hover:border-pink-500/50 transition-colors">
                      <div className="text-xs text-zinc-400 mb-1">{content.injectionMap.needleSizeLabel}</div>
                      <div className="text-xl font-bold text-pink-500 font-mono">{siteData.needle}</div>
                    </div>
                  </div>

                  {/* Golden Hour Section */}
                  <div className="p-6 bg-gradient-to-br from-gold-500/10 to-transparent border border-gold-500/20 rounded-2xl mb-6 relative">
                    <Zap className="absolute top-4 right-4 w-5 h-5 text-gold-500" />
                    <h3 className="text-gold-500 font-bold mb-2 flex items-center gap-2">
                      {content.injectionMap.goldenHourTitle}
                    </h3>
                    <p className="text-sm text-zinc-300 leading-relaxed">
                      {content.injectionMap.goldenHourDesc}
                    </p>
                  </div>

                  {/* Smart Rotation Advice */}
                  {suggestedSite && (
                    <div className="flex items-center gap-4 p-4 bg-zinc-900/50 rounded-xl border border-white/10">
                      <div className="w-10 h-10 rounded-full bg-neon-green/20 flex items-center justify-center shrink-0">
                        <Target className="w-5 h-5 text-neon-green" />
                      </div>
                      <div>
                        <div className="text-[10px] text-zinc-400 uppercase tracking-wider">{content.injectionMap.rotationTrackerTitle}</div>
                        <div className="text-sm font-bold text-white">
                          {content.injectionMap.comfortableSpot}: <span className="text-neon-green">{content.injectionMap.sites.find(s => s.id === suggestedSite)?.name}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty-state"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-[600px] flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-zinc-800 rounded-[3rem]"
              >
                <div className="w-24 h-24 bg-zinc-900/50 rounded-full flex items-center justify-center mb-6 animate-pulse">
                  <Target className="w-10 h-10 text-cyan-500" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">{content.injectionMap.interactiveMapLabel}</h3>
                <p className="text-zinc-500 max-w-xs">{content.injectionMap.tapToExplore}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default InjectionMap;
