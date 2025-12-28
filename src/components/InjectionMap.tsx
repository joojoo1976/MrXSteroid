import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Zap, Activity, Info, AlertTriangle, Move, Save } from 'lucide-react';
import { ContentStrings, InjectionSite } from '../types';

interface InjectionMapProps {
  content: ContentStrings;
  lang: string;
}

interface Hotspot {
  id: string;
  name: string;
  side: 'front' | 'back';
  x: number;
  y: number;
  absorption: number;
  advice: string;
  icon: string;
  needle: string;
  volume: string;
  recoveryDays: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  warning?: string;
  steps?: string[];
  painLevel?: string;
  bestFor?: string;
}

// User-defined fixed coordinates for FRONT view
// Back view uses legacy generation for now
const FIXED_FRONT_POINTS = [
  // Delts (Needle)
  { id: 'delt_side_l', baseId: 'delt_side', x: 28, y: 26 },
  { id: 'delt_side_r', baseId: 'delt_side', x: 69, y: 26 },
  // Pecs (Shield)
  { id: 'pecs_l', baseId: 'pecs', x: 38, y: 29 },
  { id: 'pecs_r', baseId: 'pecs', x: 60, y: 30 },
  // Pecs Lower (Lightning) - actually labeled pecs_lower
  { id: 'pecs_lower_l', baseId: 'pecs_lower', x: 46, y: 27 },
  { id: 'pecs_lower_r', baseId: 'pecs_lower', x: 51, y: 28 },
  // Biceps (Arm)
  { id: 'biceps_l', baseId: 'biceps', x: 30, y: 33 },
  { id: 'biceps_r', baseId: 'biceps', x: 66, y: 33 },
  // Ventro Glute (Fire)
  { id: 'glute_ventro_l', baseId: 'glute_ventro', x: 34, y: 50 },
  { id: 'glute_ventro_r', baseId: 'glute_ventro', x: 63, y: 50 },
  // Quad Outer (Rocket)
  { id: 'quad_outer_l', baseId: 'quad_outer', x: 34, y: 62 },
  { id: 'quad_outer_r', baseId: 'quad_outer', x: 62, y: 62 },
];

const FIXED_BACK_POINTS = [
  // Traps (High)
  { id: 'traps_l', baseId: 'traps', x: 35, y: 23 },
  { id: 'traps_r', baseId: 'traps', x: 60, y: 23 },
  // Rear Delts (Shoulder/Arm Outer)
  { id: 'delt_rear_l', baseId: 'delt_rear', x: 29, y: 31 },
  { id: 'delt_rear_r', baseId: 'delt_rear', x: 67, y: 30 },
  // Triceps (Inner Upper - Mapped per user image layout)
  { id: 'triceps_l', baseId: 'triceps', x: 45, y: 31 },
  { id: 'triceps_r', baseId: 'triceps', x: 51, y: 31 },
  // Lats (Mid Back)
  { id: 'lats_l', baseId: 'lats', x: 37, y: 33 },
  { id: 'lats_r', baseId: 'lats', x: 58, y: 33 },
  // Glutes (Buttocks)
  { id: 'glute_dorso_l', baseId: 'glute_dorso', x: 40, y: 48 },
  { id: 'glute_dorso_r', baseId: 'glute_dorso', x: 58, y: 47 },
  // Calves (Legs)
  { id: 'calves_l', baseId: 'calves', x: 35, y: 81 },
  { id: 'calves_r', baseId: 'calves', x: 58, y: 81 },
];

const InjectionMap: React.FC<InjectionMapProps> = ({ content, lang }) => {
  const [rotation, setRotation] = useState(0);
  const [activeSite, setActiveSite] = useState<Hotspot | null>(null);
  const [hoverSite, setHoverSite] = useState<Hotspot | null>(null);

  // Hotspots state derived from content
  const activeHotspots = useMemo(() => {
    const mapContent = content.injectionMap;
    if (mapContent.sites) {
      const sites = mapContent.sites;
      const findSite = (id: string) => sites.find(s => s.id === id);
      const result: Hotspot[] = [];
      const absorptionMap: Record<string, number> = {
        'glute_dorso': 98, 'delt_side': 95, 'quad_outer': 92, 'pecs': 88,
        'lats': 85, 'traps': 90, 'glute_ventro': 93, 'biceps': 82,
        'triceps': 84, 'calves': 78, 'forearms': 75, 'pecs_lower': 86,
        'delt_rear': 87
      };

      const getName = (data: InjectionSite, sideLabel: string) => `${data.name} (${sideLabel})`;
      const leftLabel = mapContent.labels?.left || "L";
      const rightLabel = mapContent.labels?.right || "R";

      // 1. Process Fixed Front Points
      FIXED_FRONT_POINTS.forEach(fixed => {
        const data = findSite(fixed.baseId);
        if (data) {
          const abs = absorptionMap[fixed.baseId] || 85;
          const isRight = fixed.id.endsWith('_r');
          const sideName = isRight ? rightLabel : leftLabel;

          result.push({
            ...data,
            id: fixed.id,
            name: getName(data, sideName),
            side: 'front',
            x: fixed.x,
            y: fixed.y,
            absorption: abs,
            icon: data.icon || "💉", // Fallback incase icon missing in data
            riskLevel: data.riskLevel as 'Low' | 'Medium' | 'High',
            steps: data.steps,
            painLevel: data.painLevel,
            bestFor: data.bestFor,
            needle: data.needle,
            volume: data.volume,
            recoveryDays: data.recoveryDays,
            advice: data.advice || "",
            warning: data.warning
          });
        }
      });

      // 2. Process Fixed Back Points
      FIXED_BACK_POINTS.forEach(fixed => {
        const data = findSite(fixed.baseId);
        if (data) {
          const abs = absorptionMap[fixed.baseId] || 85;
          const isRight = fixed.id.endsWith('_r');
          const sideName = isRight ? rightLabel : leftLabel;

          result.push({
            ...data,
            id: fixed.id,
            name: getName(data, sideName),
            side: 'back', // Explicitly Back
            x: fixed.x,
            y: fixed.y,
            absorption: abs,
            icon: data.icon || "💉",
            riskLevel: data.riskLevel as 'Low' | 'Medium' | 'High',
            steps: data.steps,
            painLevel: data.painLevel,
            bestFor: data.bestFor,
            needle: data.needle,
            volume: data.volume,
            recoveryDays: data.recoveryDays,
            advice: data.advice || "",
            warning: data.warning
          });
        }
      });
      return result;
    }
    return [];
  }, [content.injectionMap]);

  const mapContent = content.injectionMap;


  const currentView = rotation <= 50 ? 'front' : 'back';

  // Dynamic values derived from Active Site or Rotation (fallback)
  const dynamicStats = useMemo(() => {
    if (activeSite) {
      // Logic for active site
      const baseAbs = activeSite.absorption || 85;
      const riskMap = { 'Low': 98, 'Medium': 75, 'High': 45 };
      const baseSafety = riskMap[activeSite.riskLevel] || 70;

      // Calculate "Cells" based on volume capacity (proxy for muscle size)
      // e.g. "3.0 - 4.0 ml" -> approx 3.5 -> larger count
      const volNum = parseFloat(activeSite.volume.match(/[0-9.]+/)?.[0] || "1.0");
      const baseCells = Math.floor(volNum * 1250000 + 500000); // 1ml = 1.75M, 4ml = 5.5M etc

      return {
        absorption: baseAbs,
        safety: baseSafety,
        cells: baseCells.toLocaleString(),
        // Dynamic footer texts
        powerDesc: `${mapContent.featureCards?.power.desc.split('...')[0]} ${lang === 'ar' ? 'في' : 'in'} ${activeSite.name}`,
        tissueDesc: `${mapContent.featureCards?.tissue.desc.split('...')[0]} (${activeSite.bestFor || 'Hypertrophy'})`,
        burnDesc: `${mapContent.featureCards?.burn.desc.split('...')[0]} [${activeSite.riskLevel} Risk]`
      };
    } else {
      // Fallback relative to rotation (current behavior)
      return {
        absorption: Math.floor(rotation * 0.9 + 10),
        safety: 100 - Math.floor(rotation / 10),
        cells: (rotation * 12500 + 100000).toLocaleString(),
        powerDesc: mapContent.featureCards?.power.desc || "Within minutes...",
        tissueDesc: mapContent.featureCards?.tissue.desc || "Muscle fibers...",
        burnDesc: mapContent.featureCards?.burn.desc || "Metabolism spikes..."
      };
    }
  }, [activeSite, rotation, mapContent, lang]);

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 relative font-cairo overflow-hidden" dir={lang === 'ar' || lang === 'he' ? 'rtl' : 'ltr'}>

      {/* Background Glows */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-gold-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-primary/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Main Header */}
      <header className="text-center mb-12 relative z-10">
        <motion.h1
          initial={{ opacity: 0, y: -20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
          className="text-4xl md:text-6xl font-black text-gold-500 mb-4 drop-shadow-[0_0_15px_rgba(255,215,0,0.3)]"
        >
          {mapContent.title}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-primary font-bold tracking-widest text-sm uppercase"
        >
          {mapContent.subtitle}
        </motion.p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch relative z-10">

        {/* Left Stats Panel (Absorption, Safety, Cells) */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <AnimatePresence mode="wait">
            <StatCard
              key={`stat-abs-${activeSite?.id || 'none'}`}
              label={mapContent.efficiencyLabel || mapContent.labels?.efficiency || "Efficiency"}
              value={`${dynamicStats.absorption}%`}
              color="text-gold-400"
              icon={<Zap className="w-4 h-4" />}
              delay={0}
            />
            <StatCard
              key={`stat-safe-${activeSite?.id || 'none'}`}
              label={mapContent.riskLevelLabel}
              value={`${dynamicStats.safety}%`}
              color={dynamicStats.safety > 80 ? "text-green-400" : dynamicStats.safety > 50 ? "text-yellow-400" : "text-red-400"}
              icon={<Shield className="w-4 h-4" />}
              delay={0.1}
            />
            <StatCard
              key={`stat-cells-${activeSite?.id || 'none'}`}
              label={mapContent.stimulatedCellsLabel}
              value={dynamicStats.cells}
              color="text-cyan-400"
              icon={<Activity className="w-4 h-4" />}
              delay={0.2}
            />
          </AnimatePresence>
        </div>

        {/* Center 3D Viewport */}
        <div className="lg:col-span-6 flex flex-col items-center">
          <div className="w-full max-w-md mb-8 space-y-2">
            <div className="flex justify-between text-[10px] font-black text-gold-500/80 uppercase tracking-widest">
              <span>{mapContent.viewFront} 0°</span>
              <span className="animate-bounce">{mapContent.rotateHint}</span>
              <span>{mapContent.viewBack} 180°</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={rotation}
              onChange={(e) => setRotation(parseInt(e.target.value))}
              className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-gold-500 border border-gold-500/20 shadow-[0_0_15px_hsl(var(--gold-500)/0.2)]"
              title={mapContent.medicalInsightLabel}
              aria-label={mapContent.medicalInsightLabel}
            />
          </div>

          <div className="relative group perspective-1000">
            {/* Viewport Frame */}
            <div className="relative w-[450px] h-[700px] rounded-[3rem] bg-gradient-to-b from-zinc-900 to-black border-2 border-yellow-500/20 shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden" id="map-container">

              {/* Biometric Overlays */}
              <div className="absolute top-10 left-8 z-30 font-mono text-[8px] text-cyan-500/40 flex flex-col gap-0.5 tracking-tighter uppercase pointer-events-none">
                <div className="flex gap-2"><span>SCANNING_ID:</span> <span className="text-cyan-400/60">BODY_PRO_X</span></div>
                <div className="flex gap-2"><span>DNA_AUTH:</span> <span className="text-cyan-400/60">VERIFIED</span></div>
                <div className="flex gap-2"><span>BIOMETRIC:</span> <span className="text-cyan-400/60">SYNCED</span></div>
              </div>

              <div className="absolute bottom-12 right-8 z-30 font-mono text-[8px] text-yellow-500/40 flex flex-col gap-0.5 tracking-tighter uppercase items-end pointer-events-none">
                <div className="flex gap-2"><span className="text-yellow-400/60">ACTIVE</span> <span>SEC_LOCKED</span></div>
                <div className="flex gap-2"><span className="text-yellow-400/60">v4.2.0</span> <span>FIRMWARE</span></div>
              </div>

              {/* Laser Scanner Effect */}
              <motion.div
                animate={{ top: ['-10%', '110%'] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="absolute left-0 right-0 h-[2px] bg-cyan-400/30 shadow-[0_0_20px_rgba(34,211,238,0.5)] z-20 pointer-events-none"
              />

              {/* Body Images Container */}
              <div className="relative w-full h-full flex items-center justify-center p-8">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentView}
                    initial={{ opacity: 0, rotateY: currentView === 'front' ? -45 : 45 }}
                    animate={{ opacity: 1, rotateY: 0 }}
                    exit={{ opacity: 0, rotateY: currentView === 'front' ? 45 : -45 }}
                    transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
                    className="w-full h-full flex items-center justify-center"
                  >
                    <img
                      src={currentView === 'front' ? "/Safe_Injection_Map_Face.webp" : "/Safe_Injection_Map_back.webp"}
                      alt="Body Map"
                      className="max-w-full max-h-full object-contain scale-[1.35] translate-y-14 filter drop-shadow-[0_0_30px_rgba(255,215,0,0.15)] contrast-110 brightness-110"
                    />
                  </motion.div>
                </AnimatePresence>

                {/* Hotspots */}
                {activeHotspots.filter(h => h.side === currentView).map(spot => {
                  return (
                    <React.Fragment key={spot.id}>
                      {/* Connection Line & Box when Hovered */}
                      <AnimatePresence>
                        {hoverSite?.id === spot.id && (
                          <>
                            <motion.svg
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="absolute inset-0 pointer-events-none z-20 overflow-visible"
                              style={{ width: '100%', height: '100%' }}
                            >
                              <motion.line
                                x1={`${spot.x}%`}
                                y1={`${spot.y}%`}
                                x2={`${spot.x > 50 ? spot.x - 25 : spot.x + 25}%`}
                                y2={`${spot.y - 15}%`}
                                stroke="url(#gradient-line)"
                                strokeWidth="2"
                                strokeLinecap="round"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 0.3 }}
                              />
                              <defs>
                                <linearGradient id="gradient-line" x1="0%" y1="0%" x2="100%" y2="0%">
                                  <stop offset="0%" stopColor="hsl(var(--gold-500))" stopOpacity="0" />
                                  <stop offset="50%" stopColor="hsl(var(--gold-500))" stopOpacity="1" />
                                  <stop offset="100%" stopColor="hsl(var(--gold-500))" stopOpacity="0" />
                                </linearGradient>
                              </defs>
                            </motion.svg>

                            <motion.div
                              initial={{ opacity: 0, scale: 0.8, y: 10 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.8, y: 10 }}
                              className="absolute z-50 bg-zinc-900/90 backdrop-blur-md border border-gold-500/50 rounded-xl p-3 shadow-2xl flex flex-col gap-1 w-40 pointer-events-none"
                              style={{
                                top: `${spot.y - 15}%`,
                                left: `${spot.x > 50 ? spot.x - 25 : spot.x + 25}%`,
                                transform: 'translate(-50%, -100%)'
                              }}
                            >
                              <div className="text-[10px] font-black text-gold-500 uppercase tracking-wider">{spot.name}</div>
                              <div className="flex gap-2">
                                <span className={`text-[9px] font-bold px-1.5 rounded-md ${spot.riskLevel === 'Low' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                  {mapContent.riskLevelLabel}: {spot.riskLevel}
                                </span>
                              </div>
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>

                      <motion.div
                        className={`absolute w-5 h-5 rounded-full z-30 flex items-center justify-center cursor-pointer
                        ${activeSite?.id === spot.id ? 'bg-gold-400' : 'bg-primary'}
                        shadow-[0_0_15px_hsl(var(--primary)/0.6)] border border-white/20`}
                        style={{
                          top: `${spot.y}%`,
                          left: `${spot.x}%`,
                          touchAction: 'none',
                          zIndex: activeSite?.id === spot.id ? 50 : 30
                        }}
                        onClick={() => {
                          setActiveSite(spot);
                        }}
                        onMouseEnter={() => setHoverSite(spot)}
                        onMouseLeave={() => setHoverSite(null)}
                        whileHover={{ scale: 1.5, rotate: 15, zIndex: 40 }}
                        whileTap={{ scale: 0.8 }}
                      >

                        <>
                          <div className="absolute inset-0 rounded-full bg-inherit animate-ping opacity-40" />
                          <div className="w-2 h-2 rounded-full bg-white opacity-40" />
                        </>

                      </motion.div>
                    </React.Fragment>
                  );
                })}
              </div>

              {/* Grid Overlay */}
              <div className="absolute inset-0 z-10 pointer-events-none opacity-[0.05] bg-[radial-gradient(#ffd700_1px,transparent_1px)] [background-size:20px_20px]" />
            </div>

            {/* Corner HUD Details */}
            <div className="absolute -top-4 -left-4 w-12 h-12 border-t-2 border-l-2 border-yellow-500/40 rounded-tl-2xl pointer-events-none" />
            <div className="absolute -bottom-4 -right-4 w-12 h-12 border-b-2 border-r-2 border-yellow-500/40 rounded-br-2xl pointer-events-none" />
          </div>
        </div>

        {/* Right Info Panel */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            {activeSite ? (
              <motion.div
                key={activeSite.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="h-full bg-zinc-900/40 backdrop-blur-xl border border-yellow-500/20 rounded-[2.5rem] p-6 flex flex-col shadow-2xl relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/5 blur-3xl rounded-full" />

                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-gold-500/10 flex items-center justify-center text-2xl border border-gold-500/20">
                    {activeSite.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-gold-400 leading-tight">{activeSite.name}</h3>
                    <div className="flex gap-2">
                      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase
                             ${activeSite.riskLevel === 'Low' ? 'bg-green-500/20 text-green-400' :
                          activeSite.riskLevel === 'Medium' ? 'bg-gold-500/20 text-gold-400' : 'bg-red-500/20 text-red-400'}`}>
                        {mapContent.riskLevelLabel}: {activeSite.riskLevel}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 flex-grow overflow-y-auto custom-scrollbar pr-2">
                  {/* Absorption Bar */}
                  <div className="p-4 bg-black/40 rounded-2xl border border-white/5">
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-[10px] text-zinc-400 font-bold uppercase">{mapContent.efficiencyLabel || mapContent.labels?.efficiency}</span>
                      <span className="text-lg font-black text-green-400">{activeSite.absorption}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${activeSite.absorption}%` }}
                        className="h-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"
                      />
                    </div>
                  </div>

                  {/* Technical Specs */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-3 bg-zinc-800/50 rounded-xl border border-white/5">
                      <p className="text-[8px] text-zinc-500 font-bold uppercase mb-1">{mapContent.needleSizeLabel}</p>
                      <p className="text-xs font-black text-white">{activeSite.needle}</p>
                    </div>
                    <div className="p-3 bg-zinc-800/50 rounded-xl border border-white/5">
                      <p className="text-[8px] text-zinc-500 font-bold uppercase mb-1">{mapContent.maxVolumeLabel}</p>
                      <p className="text-xs font-black text-white">{activeSite.volume}</p>
                    </div>
                    <div className="p-3 bg-zinc-800/50 rounded-xl border border-white/5">
                      <p className="text-[8px] text-zinc-500 font-bold uppercase mb-1">{mapContent.recoveryLabel}</p>
                      <p className="text-xs font-black text-white">{activeSite.recoveryDays} {mapContent.labels?.days || "Days"}</p>
                    </div>
                    <div className="p-3 bg-zinc-800/50 rounded-xl border border-white/5">
                      <p className="text-[8px] text-zinc-500 font-bold uppercase mb-1">{mapContent.riskLevelLabel}</p>
                      <p className={`text-xs font-black ${activeSite.riskLevel === 'Low' ? 'text-green-400' : activeSite.riskLevel === 'Medium' ? 'text-yellow-400' : 'text-red-400'}`}>
                        {activeSite.riskLevel}
                      </p>
                    </div>
                  </div>

                  {/* Warnings */}
                  {activeSite.warning && (
                    <div className="p-4 bg-red-500/10 rounded-2xl border border-red-500/20 flex gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
                      <p className="text-xs text-red-200 font-bold leading-tight">{activeSite.warning}</p>
                    </div>
                  )}

                  {/* Mr. X Advice */}
                  <div className="p-4 bg-yellow-500/5 rounded-2xl border border-yellow-500/10 relative">
                    <div className="flex items-center gap-2 mb-2 text-yellow-500">
                      <Zap className="w-3 h-3" />
                      <span className="text-[10px] font-black uppercase tracking-tighter">{mapContent.mrxInsightLabel}</span>
                    </div>
                    <p className="text-sm text-zinc-200 font-bold leading-relaxed italic">
                      "{activeSite.advice}"
                    </p>
                  </div>


                  {/* Enhanced Data: Best For & Pain Level */}
                  {(activeSite.bestFor || activeSite.painLevel) && (
                    <div className="grid grid-cols-2 gap-4">
                      {activeSite.bestFor && (
                        <div className="p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                          <p className="text-[9px] text-blue-300 font-bold uppercase mb-1">{mapContent.labels?.bestFor || "Best For"}</p>
                          <p className="text-xs font-bold text-white leading-snug">{activeSite.bestFor}</p>
                        </div>
                      )}
                      {activeSite.painLevel && (
                        <div className="p-4 bg-purple-500/10 rounded-2xl border border-purple-500/20">
                          <p className="text-[9px] text-purple-300 font-bold uppercase mb-1">{mapContent.labels?.painLevel || "Pain Level"}</p>
                          <p className="text-xs font-bold text-white leading-snug">{activeSite.painLevel}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Step-by-Step Guide */}
                  {activeSite.steps && (
                    <div className="p-5 bg-zinc-800/30 rounded-3xl border border-white/5">
                      <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Activity className="w-3 h-3" /> {mapContent.labels?.injectionSteps || "Injection Steps"}
                      </h4>
                      <ul className={`space-y-3 relative before:absolute before:inset-y-0 ${lang === 'ar' || lang === 'he' ? 'before:right-[7px]' : 'before:left-[7px]'} before:w-[2px] before:bg-zinc-800`}>
                        {activeSite.steps.map((step, idx) => (
                          <li key={idx} className={`relative text-xs text-zinc-300 leading-relaxed font-medium ${lang === 'ar' || lang === 'he' ? 'pr-6 text-right' : 'pl-6 text-left'}`}>
                            <span className={`absolute top-1.5 w-3.5 h-3.5 bg-zinc-700 rounded-full border-2 border-black z-10 ${lang === 'ar' || lang === 'he' ? 'right-0' : 'left-0'}`}></span>
                            {step}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveSite(null)}
                  className="mt-6 w-full py-4 bg-gold-500 text-black font-black uppercase text-xs rounded-2xl hover:bg-gold-400 transition-all flex items-center justify-center gap-2 shadow-lg shadow-gold-500/20"
                >
                  {mapContent.closeDetailsBtn}
                </motion.button>
              </motion.div>

            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex flex-col items-center justify-center text-center p-8 bg-zinc-900/20 border-2 border-dashed border-white/5 rounded-[2.5rem]"
              >
                <div className="w-20 h-20 rounded-full bg-zinc-900 flex items-center justify-center mb-6 border border-white/10 animate-blob">
                  <Info className="w-10 h-10 text-gold-500/50" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{mapContent.labels?.selectPoint || "Select Injection Point"}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed max-w-[200px]">
                  {mapContent.tapToExplore}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div >

      {/* Footer Section: What happens after? */}
      <footer className="mt-16 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 blur-[100px] pointer-events-none" />
        <div className="relative p-8 md:p-12 bg-zinc-950/50 backdrop-blur-3xl border border-white/5 rounded-[4rem] overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />

          <h2 className="text-3xl md:text-4xl font-black text-center mb-10 text-glow-white">
            {mapContent.goldenHourTitle}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
              <FeatureCard
                key={`feat-power-${activeSite?.id || 'all'}`}
                icon="🚀"
                title={mapContent.featureCards?.power.title || "Power Explosion"}
                desc={dynamicStats.powerDesc}
                color="bg-blue-500/10 border-blue-500/20"
                glow="shadow-blue-500/20"
              />
              <FeatureCard
                key={`feat-tissue-${activeSite?.id || 'all'}`}
                icon="🛡️"
                title={mapContent.featureCards?.tissue.title || "Tissue Building"}
                desc={dynamicStats.tissueDesc}
                color="bg-green-500/10 border-green-500/20"
                glow="shadow-green-500/20"
              />
              <FeatureCard
                key={`feat-burn-${activeSite?.id || 'all'}`}
                icon="🔥"
                title={mapContent.featureCards?.burn.title || "Burn & Define"}
                desc={dynamicStats.burnDesc}
                color="bg-red-500/10 border-red-500/20"
                glow="shadow-red-500/20"
              />
            </AnimatePresence>
          </div>
        </div>
      </footer>
    </div >
  );
};

// Sub-components for cleaner structure

const StatCard = ({ label, value, color, icon, delay = 0 }: { label: string, value: string, color: string, icon: React.ReactNode, delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, x: -20, scale: 0.9 }}
    animate={{ opacity: 1, x: 0, scale: 1 }}
    transition={{ delay, type: "spring", stiffness: 200 }}
    whileHover={{ scale: 1.05, x: 5 }}
    className="flex-1 bg-zinc-900/60 backdrop-blur-md border border-white/5 rounded-3xl p-5 hover:border-gold-500/30 transition-colors group relative overflow-hidden"
  >
    <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    <div className="flex items-center gap-2 mb-2 text-zinc-300 font-bold text-[11px] uppercase tracking-widest relative z-10">
      {icon}
      {label}
    </div>
    <div className={`text-2xl font-black ${color} relative z-10 drop-shadow-sm`}>
      {value}
    </div>
  </motion.div>
);

const FeatureCard = ({ icon, title, desc, color, glow }: { icon: string, title: string, desc: string, color: string, glow: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3 }}
    className={`p-6 rounded-[2.5rem] border ${color} shadow-lg ${glow} transition-all hover:-translate-y-2 relative overflow-hidden`}
  >
    <div className="absolute inset-0 opacity-0 hover:opacity-10 transition-opacity bg-white"></div>
    <div className="text-4xl mb-4 p-4 bg-black/20 w-fit rounded-2xl animate-bounce-slow">{icon}</div>
    <h4 className="text-xl font-black text-white mb-2">{title}</h4>
    <p className="text-sm text-zinc-400 leading-relaxed font-bold">{desc}</p>
  </motion.div>
);

export default InjectionMap;
