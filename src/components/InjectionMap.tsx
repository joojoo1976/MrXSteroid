import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Rotate3D, ShieldCheck, AlertTriangle, Target, Zap, Activity, Info, RefreshCw } from 'lucide-react';
import { ContentStrings } from '../types';

interface InjectionMapProps {
  content: ContentStrings;
  lang: string;
}

interface HotspotProps {
  id: string;
  x: string;
  y: string;
  size?: number;
  color?: string;
  suggestedSite: string | null;
  activeSite: string | null;
  lastInjected: string | null;
  setActiveSite: (id: string) => void;
  content: ContentStrings;
}

const Hotspot = ({ id, x, y, size = 6, suggestedSite, activeSite, lastInjected, setActiveSite, content }: HotspotProps) => {
  const getBaseId = (val: string | null) => val?.replace(/_[lr]$/, '');
  const baseId = getBaseId(id);

  const isSuggested = suggestedSite === id || (suggestedSite !== null && suggestedSite === baseId);
  const isActive = activeSite === id;
  const isLast = lastInjected === id || (lastInjected !== null && getBaseId(lastInjected) === baseId);

  return (
    <motion.button
      className={`absolute rounded-full cursor-pointer z-20 flex items-center justify-center
        ${isActive ? 'z-30' : ''}`}
      style={{ left: x, top: y, width: `${size * 4}px`, height: `${size * 4}px` }}
      whileHover={{ scale: 1.4, zIndex: 50 }}
      whileTap={{ scale: 0.9 }}
      onClick={(e) => { e.stopPropagation(); setActiveSite(id); }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
    >
      {/* Outer Glow Ring */}
      <motion.div
        className={`absolute inset-[-8px] rounded-full border-2 opacity-0
          ${isActive ? 'border-gold-500 opacity-100' : isSuggested ? 'border-cyan-400 opacity-100' : 'border-emerald-500/30'}`}
        animate={isActive || isSuggested ? { scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] } : {}}
        transition={{ duration: 2, repeat: Infinity }}
      />

      {/* Main Pulse Circle */}
      <div className={`w-full h-full rounded-full relative shadow-lg transition-colors duration-500
        ${isActive ? 'bg-gold-500 shadow-gold-500/50' :
          isSuggested ? 'bg-cyan-500 shadow-cyan-500/50 animate-pulse' :
            isLast ? 'bg-red-500/60 shadow-red-500/30' :
              'bg-emerald-500/40 shadow-emerald-500/20'}`}>

        {/* Inner Core */}
        <div className="absolute inset-1 rounded-full bg-white/30 backdrop-blur-sm" />

        {/* Scanning Ping */}
        {(isActive || isSuggested) && (
          <span className={`absolute inset-0 rounded-full scale-150 opacity-20 animate-ping
            ${isActive ? 'bg-gold-500' : 'bg-cyan-500'}`} />
        )}
      </div>

      {isActive && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: -45 }}
          className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none"
        >
          <div className="bg-black/90 backdrop-blur-md text-gold-500 text-[10px] font-black px-2 py-1 rounded-md border border-gold-500/50 shadow-[0_0_20px_rgba(234,179,8,0.5)] whitespace-nowrap uppercase tracking-tighter">
            {content.injectionMap.sites.find(s => s.id === id)?.name}
          </div>
          <div className="w-px h-6 bg-gradient-to-t from-gold-500 to-transparent" />
        </motion.div>
      )}
    </motion.button>
  );
};

const InjectionMap: React.FC<InjectionMapProps> = ({ content, lang }) => {
  const [activeSite, setActiveSite] = useState<string | null>(null);
  const [view, setView] = useState<'front' | 'back'>('front');
  const [rotation, setRotation] = useState(0);
  const [cumulativeGrowth, setCumulativeGrowth] = useState(1240); // Starting dummy value

  // Normalize ID for content lookup (strips _l or _r suffix)
  const getBaseId = (id: string | null) => id?.replace(/_[lr]$/, '');

  const siteData = content.injectionMap.sites.find(s => s.id === getBaseId(activeSite));

  // Toggle view and rotation
  const toggleView = (newView: 'front' | 'back') => {
    if (view === newView) return;
    setView(newView);
    setRotation(prev => prev + 180);
  };

  // Auto-suggest logic (Rotation Tracker)
  const [suggestedSite, setSuggestedSite] = useState<string | null>(null);
  const [lastInjected, setLastInjected] = useState<string | null>(null);

  useEffect(() => {
    if (activeSite) {
      // Simulate cumulative growth counter increasing
      const interval = setInterval(() => {
        setCumulativeGrowth(prev => prev + Math.floor(Math.random() * 5));
      }, 200);

      return () => clearInterval(interval);
    }
  }, [activeSite]);

  const handleSuggest = () => {
    const allSites = content.injectionMap.sites;
    // Heuristic: Suggest a low risk site that wasn't the last one and isn't the current active one
    const potentials = allSites.filter(s => s.id !== getBaseId(activeSite) && s.id !== getBaseId(lastInjected) && s.riskLevel === 'Low');
    const random = potentials[Math.floor(Math.random() * potentials.length)];
    if (random) setSuggestedSite(random.id);
  };

  const handleLog = () => {
    if (!activeSite) return;
    setLastInjected(activeSite);
    setSuggestedSite(null);
    // Visual feedback
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3');
    audio.play().catch(() => { });
  };

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 relative">
      {/* Header */}
      <div className="text-center mb-16 relative z-10">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-neon-green to-gold-500 tracking-tight text-glow-cyan animate-hologram"
        >
          {content.injectionMap.title}
        </motion.h1>
        <p className="text-lg text-zinc-500 max-w-2xl mx-auto leading-relaxed">{content.injectionMap.subtitle}</p>
      </div>

      <div className="flex flex-col lg:grid lg:grid-cols-12 gap-12 items-start">

        {/* 3D Map Section */}
        <div className="w-full lg:col-span-7 relative min-h-[500px] lg:min-h-[700px] perspective-2000 border-glow-cyan rounded-[4rem] glass-morphism overflow-hidden">
          {/* Controls */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 flex gap-2 bg-zinc-900/80 backdrop-blur-2xl p-2 rounded-2xl border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
            <button onClick={() => toggleView('front')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'front' ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20' : 'text-zinc-500 hover:text-white'}`}>
              {content.injectionMap.viewFront}
            </button>
            <button onClick={() => toggleView('back')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'back' ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20' : 'text-zinc-500 hover:text-white'}`}>
              {content.injectionMap.viewBack}
            </button>
          </div>

          {/* Scifi Scanning Line Effect */}
          <div className="absolute inset-0 z-10 pointer-events-none opacity-20">
            <motion.div
              animate={{ y: ['0%', '100%', '0%'] }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="w-full h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_rgba(34,211,238,0.5)]"
            />
          </div>

          {/* HUD Corner Accents */}
          <div className="absolute top-8 left-8 w-12 h-12 border-t-2 border-l-2 border-cyan-500/40 rounded-tl-2xl z-20 pointer-events-none" />
          <div className="absolute top-8 right-8 w-12 h-12 border-t-2 border-r-2 border-cyan-500/40 rounded-tr-2xl z-20 pointer-events-none" />
          <div className="absolute bottom-8 left-8 w-12 h-12 border-b-2 border-l-2 border-cyan-500/40 rounded-bl-2xl z-20 pointer-events-none" />
          <div className="absolute bottom-8 right-8 w-12 h-12 border-b-2 border-r-2 border-cyan-500/40 rounded-br-2xl z-20 pointer-events-none" />

          {/* Grid Background Overlay */}
          <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#22d3ee_1px,transparent_1px)] [background-size:20px_20px]" />

          {/* Rotating Container */}
          <motion.div
            className="w-full relative aspect-[3/4] sm:aspect-[4/5] lg:aspect-auto lg:h-[700px]"
            animate={{ rotateY: rotation }}
            transition={{ type: "spring", stiffness: 35, damping: 20 }}
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* Front Face */}
            <div
              className="absolute inset-0 bg-neutral-950 rounded-[4rem] overflow-hidden border border-cyan-500/20 shadow-[0_0_80px_rgba(6,182,212,0.1)] group"
              style={{ backfaceVisibility: 'hidden' }}
            >
              {/* Holographic Body Image with Filters */}
              <div className="relative w-full h-full p-8 md:p-12 transition-transform duration-700 group-hover:scale-105">
                <img
                  src="/Safe_Injection_Map_Face.webp"
                  alt="Body Map Front"
                  className="w-full h-full object-contain filter brightness-110 contrast-125 sepia-[0.3] hue-rotate-[160deg] saturate-150 drop-shadow-[0_0_30px_rgba(34,211,238,0.3)] animate-hologram"
                />
                {/* Holographic Interference Mask */}
                <div className="absolute inset-0 opacity-[0.1] mix-blend-overlay bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(34,211,238,0.5)_3px)] pointer-events-none" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40" />

              {/* Front Hotspots - Anatomically precise positioning for Safe_Injection_Map_Face.webp */}
              <Hotspot id="delt_side_l" x="24%" y="25%" suggestedSite={suggestedSite} activeSite={activeSite} lastInjected={lastInjected} setActiveSite={setActiveSite} content={content} />
              <Hotspot id="delt_side_r" x="76%" y="25%" suggestedSite={suggestedSite} activeSite={activeSite} lastInjected={lastInjected} setActiveSite={setActiveSite} content={content} />

              <Hotspot id="glute_ventro_l" x="32%" y="46%" suggestedSite={suggestedSite} activeSite={activeSite} lastInjected={lastInjected} setActiveSite={setActiveSite} content={content} />
              <Hotspot id="glute_ventro_r" x="68%" y="46%" suggestedSite={suggestedSite} activeSite={activeSite} lastInjected={lastInjected} setActiveSite={setActiveSite} content={content} />

              <Hotspot id="pecs_l" x="37%" y="30%" suggestedSite={suggestedSite} activeSite={activeSite} lastInjected={lastInjected} setActiveSite={setActiveSite} content={content} />
              <Hotspot id="pecs_r" x="63%" y="30%" suggestedSite={suggestedSite} activeSite={activeSite} lastInjected={lastInjected} setActiveSite={setActiveSite} content={content} />

              <Hotspot id="pecs_lower_l" x="37%" y="38%" suggestedSite={suggestedSite} activeSite={activeSite} lastInjected={lastInjected} setActiveSite={setActiveSite} content={content} />
              <Hotspot id="pecs_lower_r" x="63%" y="38%" suggestedSite={suggestedSite} activeSite={activeSite} lastInjected={lastInjected} setActiveSite={setActiveSite} content={content} />

              <Hotspot id="quad_outer_l" x="33%" y="65%" suggestedSite={suggestedSite} activeSite={activeSite} lastInjected={lastInjected} setActiveSite={setActiveSite} content={content} />
              <Hotspot id="quad_outer_r" x="67%" y="65%" suggestedSite={suggestedSite} activeSite={activeSite} lastInjected={lastInjected} setActiveSite={setActiveSite} content={content} />

              <Hotspot id="biceps_l" x="18%" y="36%" suggestedSite={suggestedSite} activeSite={activeSite} lastInjected={lastInjected} setActiveSite={setActiveSite} content={content} />
              <Hotspot id="biceps_r" x="82%" y="36%" suggestedSite={suggestedSite} activeSite={activeSite} lastInjected={lastInjected} setActiveSite={setActiveSite} content={content} />
            </div>

            {/* Back Face */}
            <div
              className="absolute inset-0 bg-neutral-950 rounded-[4rem] overflow-hidden border border-gold-500/20 shadow-[0_0_80px_rgba(234,179,8,0.1)]"
              style={{ transform: 'rotateY(180deg)', backfaceVisibility: 'hidden' }}
            >
              <div className="relative w-full h-full p-8 md:p-12">
                <img
                  src="/Safe_Injection_Map_back.webp"
                  alt="Body Map Back"
                  className="w-full h-full object-contain filter brightness-90 contrast-110 sepia-[0.4] hue-rotate-[180deg] saturate-100 opacity-60"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40" />

              {/* Back Hotspots - Anatomically precise positioning for Safe_Injection_Map_back.webp */}
              <Hotspot id="glute_dorso_l" x="38%" y="50%" size={8} suggestedSite={suggestedSite} activeSite={activeSite} lastInjected={lastInjected} setActiveSite={setActiveSite} content={content} />
              <Hotspot id="glute_dorso_r" x="62%" y="50%" size={8} suggestedSite={suggestedSite} activeSite={activeSite} lastInjected={lastInjected} setActiveSite={setActiveSite} content={content} />

              <Hotspot id="traps_l" x="42%" y="22%" suggestedSite={suggestedSite} activeSite={activeSite} lastInjected={lastInjected} setActiveSite={setActiveSite} content={content} />
              <Hotspot id="traps_r" x="58%" y="22%" suggestedSite={suggestedSite} activeSite={activeSite} lastInjected={lastInjected} setActiveSite={setActiveSite} content={content} />

              <Hotspot id="lats_l" x="35%" y="38%" suggestedSite={suggestedSite} activeSite={activeSite} lastInjected={lastInjected} setActiveSite={setActiveSite} content={content} />
              <Hotspot id="lats_r" x="65%" y="38%" suggestedSite={suggestedSite} activeSite={activeSite} lastInjected={lastInjected} setActiveSite={setActiveSite} content={content} />

              <Hotspot id="triceps_l" x="22%" y="38%" size={7} suggestedSite={suggestedSite} activeSite={activeSite} lastInjected={lastInjected} setActiveSite={setActiveSite} content={content} />
              <Hotspot id="triceps_r" x="78%" y="38%" size={7} suggestedSite={suggestedSite} activeSite={activeSite} lastInjected={lastInjected} setActiveSite={setActiveSite} content={content} />

              <Hotspot id="forearms_l" x="15%" y="50%" suggestedSite={suggestedSite} activeSite={activeSite} lastInjected={lastInjected} setActiveSite={setActiveSite} content={content} />
              <Hotspot id="forearms_r" x="85%" y="50%" suggestedSite={suggestedSite} activeSite={activeSite} lastInjected={lastInjected} setActiveSite={setActiveSite} content={content} />

              <Hotspot id="calves_l" x="43%" y="86%" suggestedSite={suggestedSite} activeSite={activeSite} lastInjected={lastInjected} setActiveSite={setActiveSite} content={content} />
              <Hotspot id="calves_r" x="57%" y="86%" suggestedSite={suggestedSite} activeSite={activeSite} lastInjected={lastInjected} setActiveSite={setActiveSite} content={content} />
            </div>
          </motion.div>

          {/* Biometric Analysis Overlay (Floating) */}
          <div className="absolute top-[20%] right-[-20px] lg:right-[-40px] z-50 pointer-events-none hidden xl:block">
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              className="bg-black/80 backdrop-blur-xl p-4 rounded-xl border border-white/10 shadow-2xl w-48"
            >
              <div className="text-[9px] text-cyan-400 font-black uppercase mb-3 tracking-widest border-b border-white/5 pb-2">Biometric Analysis</div>
              <div className="space-y-4">
                {[
                  { label: "Muscle Density", val: 84 },
                  { label: "Serum Saturation", val: 62 },
                  { label: "Recovery Rate", val: 91 }
                ].map((stat, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-[8px] text-zinc-500 font-bold uppercase">
                      <span>{stat.label}</span>
                      <span className="text-white">{stat.val}%</span>
                    </div>
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${stat.val}%` }}
                        transition={{ duration: 2, delay: i * 0.2 }}
                        className="h-full bg-cyan-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Cumulative Growth Counter */}
          <div className="absolute bottom-8 right-8 z-40">
            <div className="bg-zinc-900/90 backdrop-blur-3xl p-6 rounded-[2.5rem] border border-cyan-400/20 shadow-[0_0_40px_rgba(34,211,238,0.1)] group transition-all hover:scale-105 border-b-4 border-b-cyan-500">
              <div className="text-[10px] text-cyan-400 uppercase tracking-[0.3em] font-black mb-1 opacity-70">Structural Integrity</div>
              <div className="text-3xl font-mono font-black text-white tabular-nums flex items-center gap-3">
                <Activity className="w-5 h-5 text-cyan-400 animate-pulse" />
                {cumulativeGrowth.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Info Panel */}
        <div className="w-full lg:col-span-5 h-full">
          <AnimatePresence mode="wait">
            {siteData ? (
              <motion.div
                key="site-info"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-neutral-900/60 backdrop-blur-3xl border border-white/10 p-8 rounded-[3.5rem] shadow-[0_0_50px_rgba(0,0,0,0.3)] relative overflow-hidden h-full flex flex-col"
              >
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[100px] -mr-32 -mt-32" />
                <div className="absolute -left-10 top-1/2 w-32 h-32 bg-gold-500/5 rounded-full blur-[60px]" />

                <div className="relative z-10 flex flex-col h-full flex-grow">
                  <div className="flex justify-between items-center mb-8">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-1">Anatomy Group</span>
                      <span className="text-white font-black text-lg">{siteData.category}</span>
                    </div>
                    <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase border-2 ${siteData.riskLevel === 'Low' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      siteData.riskLevel === 'Medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                        'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}>
                      {siteData.riskLevel} Risk
                    </div>
                  </div>

                  <h2 className="text-5xl font-black text-white mb-6 tracking-tighter leading-[0.9] border-l-4 border-cyan-500 pl-6 text-glow-cyan">{siteData.name}</h2>
                  <p className="text-zinc-400 text-sm leading-relaxed mb-10 font-bold opacity-80">{siteData.description}</p>

                  <div className="grid grid-cols-2 gap-4 mb-10">
                    <div className="p-6 bg-white/[0.03] rounded-3xl border border-white/5 group hover:bg-white/[0.05] transition-colors">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                        <span className="text-[9px] text-zinc-500 uppercase font-black tracking-tight">{content.injectionMap.maxVolumeLabel}</span>
                      </div>
                      <div className="text-2xl font-black text-white font-mono">{siteData.volume}</div>
                    </div>
                    <div className="p-6 bg-white/[0.03] rounded-3xl border border-white/5 group hover:bg-white/[0.05] transition-colors">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-pink-500" />
                        <span className="text-[9px] text-zinc-500 uppercase font-black tracking-tight">{content.injectionMap.needleSizeLabel}</span>
                      </div>
                      <div className="text-2xl font-black text-white font-mono">{siteData.needle}</div>
                    </div>
                  </div>

                  {/* Scifi Advice Card */}
                  <div className="p-6 bg-gradient-to-br from-gold-500/10 to-transparent border border-gold-500/20 rounded-3xl mb-10 relative group">
                    <div className="absolute top-4 right-4 text-gold-500/20"><Info className="w-12 h-12" /></div>
                    <h3 className="text-gold-500 font-black text-[10px] uppercase mb-3 flex items-center gap-2 tracking-[0.2em]">
                      <Zap className="w-3 h-3" /> System Insight
                    </h3>
                    <p className="text-xs text-white leading-relaxed font-bold italic">
                      {content.injectionMap.goldenHourDesc}
                    </p>
                  </div>

                  <div className="mt-auto pt-6 border-t border-white/5">
                    <div className="flex gap-4">
                      <button
                        onClick={handleLog}
                        className="flex-1 py-4 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-gold-500 transition-all active:scale-95 flex items-center justify-center gap-3 shadow-[0_20px_40px_rgba(255,255,255,0.1)]"
                      >
                        <ShieldCheck className="w-4 h-4" /> {content.injectionMap.logInjectionBtn}
                      </button>
                      <button
                        onClick={handleSuggest}
                        className="p-4 bg-zinc-800 text-white rounded-2xl border border-white/10 hover:border-cyan-500 hover:text-cyan-400 transition-all active:scale-95"
                        title={content.injectionMap.suggestBtn}
                        aria-label={content.injectionMap.suggestBtn}
                      >
                        <RefreshCw className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty-state"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full min-h-[600px] flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-zinc-900 rounded-[3.5rem] bg-zinc-950/20 relative"
              >
                {/* Scanning HUD Element */}
                <div className="absolute top-10 left-10 w-20 h-20 border-t-2 border-l-2 border-white/10 rounded-tl-3xl" />
                <div className="absolute bottom-10 right-10 w-20 h-20 border-b-2 border-r-2 border-white/10 rounded-br-3xl" />

                <div className="relative mb-12">
                  <div className="absolute inset-0 bg-cyan-500 blur-[60px] opacity-10 rounded-full animate-pulse" />
                  <div className="w-40 h-40 bg-zinc-900/80 rounded-full flex items-center justify-center relative border border-white/10 shadow-2xl">
                    <Target className="w-16 h-16 text-cyan-500 animate-spin-slow" />
                  </div>
                </div>
                <h3 className="text-4xl font-black text-white mb-4 tracking-tighter uppercase italic">{content.injectionMap.interactiveMapLabel}</h3>
                <p className="text-zinc-500 max-w-xs leading-relaxed font-bold text-sm opacity-60">
                  {content.injectionMap.tapToExplore}
                </p>
                <button
                  onClick={handleSuggest}
                  className="mt-12 px-12 py-5 bg-neutral-900 text-cyan-400 rounded-2xl border-2 border-cyan-500/20 font-black uppercase text-xs tracking-[0.3em] hover:bg-cyan-500 hover:text-black hover:border-cyan-500 transition-all shadow-lg"
                >
                  Initiate Scan
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default InjectionMap;
