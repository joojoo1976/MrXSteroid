import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Zap, Activity, Info, AlertTriangle } from 'lucide-react';
import BrandLogo from './BrandLogo';
import { StyledBrandName } from './StyledBrandName';
import AdPlaceholder from './AdPlaceholder';
import { convertValue, formatUnit } from '../utils/logic';
import { ContentStrings, InjectionSite, Page, Language } from '../types';
import { usePreferences } from '../context/PreferencesContext';


interface InjectionMapProps {
  content: ContentStrings;
  navigateTo: (page: Page) => void;
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
  description?: string;
}

const FIXED_FRONT_POINTS = [
  { id: 'delt_side_l', baseId: 'delt_side', x: 28, y: 26 },
  { id: 'delt_side_r', baseId: 'delt_side', x: 69, y: 26 },
  { id: 'pecs_l', baseId: 'pecs', x: 38, y: 29 },
  { id: 'pecs_r', baseId: 'pecs', x: 60, y: 30 },
  { id: 'pecs_lower_l', baseId: 'pecs_lower', x: 46, y: 27 },
  { id: 'pecs_lower_r', baseId: 'pecs_lower', x: 51, y: 28 },
  { id: 'biceps_l', baseId: 'biceps', x: 30, y: 33 },
  { id: 'biceps_r', baseId: 'biceps', x: 66, y: 33 },
  { id: 'glute_ventro_l', baseId: 'glute_ventro', x: 34, y: 50 },
  { id: 'glute_ventro_r', baseId: 'glute_ventro', x: 63, y: 50 },
  { id: 'quad_outer_l', baseId: 'quad_outer', x: 34, y: 62 },
  { id: 'quad_outer_r', baseId: 'quad_outer', x: 62, y: 62 },
];

const FIXED_BACK_POINTS = [
  { id: 'traps_l', baseId: 'traps', x: 35, y: 23 },
  { id: 'traps_r', baseId: 'traps', x: 60, y: 23 },
  { id: 'delt_rear_l', baseId: 'delt_rear', x: 29, y: 31 },
  { id: 'delt_rear_r', baseId: 'delt_rear', x: 67, y: 30 },
  { id: 'triceps_l', baseId: 'triceps', x: 45, y: 31 },
  { id: 'triceps_r', baseId: 'triceps', x: 51, y: 31 },
  { id: 'lats_l', baseId: 'lats', x: 37, y: 33 },
  { id: 'lats_r', baseId: 'lats', x: 58, y: 33 },
  { id: 'glute_dorso_l', baseId: 'glute_dorso', x: 40, y: 48 },
  { id: 'glute_dorso_r', baseId: 'glute_dorso', x: 58, y: 47 },
  { id: 'calves_l', baseId: 'calves', x: 35, y: 81 },
  { id: 'calves_r', baseId: 'calves', x: 58, y: 81 },
];

const InjectionMap: React.FC<InjectionMapProps> = ({ content, navigateTo }) => {
  const { unitSystem, language } = usePreferences();
  const lang = language as Language;
  const isImperial = unitSystem === 'imperial';
  const [rotation, setRotation] = useState(0);
  const [activeSite, setActiveSite] = useState<Hotspot | null>(null);
  const [hoverSite, setHoverSite] = useState<Hotspot | null>(null);

  const mapContent = content.injectionMap;
  const currentView = rotation <= 50 ? 'front' : 'back';

  const activeHotspots = useMemo(() => {
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

      FIXED_FRONT_POINTS.forEach(fixed => {
        const data = findSite(fixed.baseId);
        if (data) {
          const abs = absorptionMap[fixed.baseId] || 85;
          const isRight = fixed.id.endsWith('_r');
          result.push({
            ...data,
            id: fixed.id,
            name: getName(data, isRight ? rightLabel : leftLabel),
            side: 'front',
            x: fixed.x,
            y: fixed.y,
            absorption: abs,
            icon: data.icon || "💉",
            riskLevel: data.riskLevel as 'Low' | 'Medium' | 'High',
            advice: data.advice || "",
            description: data.description || ""
          });
        }
      });

      FIXED_BACK_POINTS.forEach(fixed => {
        const data = findSite(fixed.baseId);
        if (data) {
          const abs = absorptionMap[fixed.baseId] || 85;
          const isRight = fixed.id.endsWith('_r');
          result.push({
            ...data,
            id: fixed.id,
            name: getName(data, isRight ? rightLabel : leftLabel),
            side: 'back',
            x: fixed.x,
            y: fixed.y,
            absorption: abs,
            icon: data.icon || "💉",
            riskLevel: data.riskLevel as 'Low' | 'Medium' | 'High',
            advice: data.advice || "",
            description: data.description || ""
          });
        }
      });
      return result;
    }
    return [];
  }, [mapContent]);

  const dynamicStats = useMemo(() => {
    if (activeSite) {
      const baseAbs = activeSite.absorption || 85;
      const riskMap = { 'Low': 98, 'Medium': 75, 'High': 45 };
      const baseSafety = riskMap[activeSite.riskLevel] || 70;
      const volNum = parseFloat(activeSite.volume.match(/[0-9.]+/)?.[0] || "1.0");

      const convertedVol = isImperial ? convertValue(volNum, 'volume', 'imperial') : volNum;
      const displayVol = `${convertedVol.toFixed(isImperial ? 2 : 1)} ${isImperial ? 'oz' : 'ml'}`;

      const baseCells = Math.floor(volNum * 1250000 + 500000);

      return {
        absorption: baseAbs,
        safety: baseSafety,
        cells: baseCells.toLocaleString(),
        powerDesc: `${mapContent.featureCards?.power.desc.split('...')[0]} ${lang === 'ar' ? 'في' : 'in'} ${activeSite.name}`,
        tissueDesc: `${mapContent.featureCards?.tissue.desc.split('...')[0]} (${activeSite.bestFor || 'Hypertrophy'})`,
        burnDesc: `${mapContent.featureCards?.burn.desc.split('...')[0]} [${activeSite.riskLevel} Risk]`
      };
    }
    return {
      absorption: Math.floor(rotation * 0.9 + 10),
      safety: 100 - Math.floor(rotation / 10),
      cells: (rotation * 12500 + 100000).toLocaleString(),
      powerDesc: mapContent.featureCards?.power.desc || "Within minutes...",
      tissueDesc: mapContent.featureCards?.tissue.desc || "Muscle fibers...",
      burnDesc: mapContent.featureCards?.burn.desc || "Metabolism spikes..."
    };
  }, [activeSite, rotation, mapContent, lang, isImperial]);

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 relative font-cairo" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Background Kinetic Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gold-500/5 blur-[150px] rounded-full animate-float-slow"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/5 blur-[150px] rounded-full animate-float-slow [animation-delay:-5s]"></div>
      </div>
      <header className="text-center mb-12 relative z-10">
        <div className="mb-4">
          <BrandLogo className="text-3xl md:text-5xl" onClick={() => navigateTo(Page.HOME)} />
        </div>
        <motion.h1 className="text-4xl md:text-6xl font-black text-gold-500 mb-4 drop-shadow-[0_0_15px_rgba(255,215,0,0.3)]">

          {mapContent.title}
        </motion.h1>
        <motion.p className="text-primary font-bold tracking-widest text-sm uppercase">
          {mapContent.subtitle}
        </motion.p>
      </header>

      {/* AdSlot: Top Banner */}
      <div className="mb-8 font-sans">
        <AdPlaceholder slotId="injection_top_banner" format="horizontal" content={content} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch relative z-10">
        <div className="lg:col-span-3 flex flex-col gap-4">
          <StatCard label={mapContent.efficiencyLabel || "Efficiency"} value={`${dynamicStats.absorption}%`} color="text-gold-400" icon={<Zap className="w-4 h-4" />} />
          <StatCard label={mapContent.riskLevelLabel} value={`${dynamicStats.safety}%`} color={dynamicStats.safety > 80 ? "text-green-400" : "text-yellow-400"} icon={<Shield className="w-4 h-4" />} />
          <StatCard label={mapContent.stimulatedCellsLabel} value={dynamicStats.cells} color="text-cyan-400" icon={<Activity className="w-4 h-4" />} />
        </div>

        <div className="lg:col-span-6 flex flex-col items-center">
          <div className="w-full max-w-md mb-8">
            <div className="flex justify-between px-2 mb-2 text-gold-400 font-bold text-sm uppercase tracking-widest">
              <span className="cursor-pointer hover:text-white transition-colors" onClick={() => setRotation(0)}>
                {mapContent.viewFront || "Front View"}
              </span>
              <span className="cursor-pointer hover:text-white transition-colors" onClick={() => setRotation(100)}>
                {mapContent.viewBack || "Back View"}
              </span>
            </div>
            <input type="range" min="0" max="100" value={rotation} onChange={(e) => setRotation(parseInt(e.target.value))} aria-label="Rotation Control" className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-gold-500" />
          </div>

          <div className="relative w-[450px] h-[700px] group">
            {/* Background & Mask Layer */}
            <div className="absolute inset-0 rounded-[3rem] bg-zinc-900 border-2 border-yellow-500/20 shadow-2xl overflow-hidden z-0">
              <div className="absolute inset-0 bg-[linear-gradient(rgba(234,179,8,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(234,179,8,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>
              <motion.div
                animate={{ top: ['0%', '100%', '0%'] }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute left-0 w-full h-1 bg-gold-500/50 blur-sm z-20 shadow-[0_0_20px_rgba(234,179,8,0.5)]"
              />
              <div className="relative w-full h-full flex items-center justify-center p-8 overflow-visible">
                {/* Transformed Wrapper for Image and Hotspots */}
                <div className="relative w-full h-full scale-[1.35] translate-y-14 flex items-center justify-center">
                  <AnimatePresence mode="wait">
                    <motion.div key={currentView} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full h-full flex items-center justify-center">
                      <img
                        src={currentView === 'front' ? "/Safe_Injection_Map_Face.webp" : "/Safe_Injection_Map_back.webp"}
                        alt="Body Map"
                        className="max-w-full max-h-full object-contain shadow-[0_0_50px_rgba(0,0,0,0.5)]"
                        loading="lazy"
                      />
                    </motion.div>
                  </AnimatePresence>

                  {/* Hotspots Layer - Positioned inside the same transformed space */}
                  <div className="absolute inset-0 z-30 pointer-events-none">
                    {activeHotspots.filter(h => h.side === currentView).map(spot => (
                      <motion.div
                        key={spot.id}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute pointer-events-auto"
                        style={{
                          top: `${spot.y}%`,
                          left: `${spot.x}%`,
                          transform: 'translate(-50%, -50%)' // Center the dot on the coordinate
                        }}
                      >
                        {/* Glow Effect */}
                        <motion.div
                          animate={{
                            scale: [1, 1.5, 1],
                            opacity: [0.5, 0.2, 0.5]
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                          className={`absolute inset-0 w-8 h-8 -left-4 -top-4 rounded-full blur-md ${activeSite?.id === spot.id ? 'bg-gold-400' : 'bg-primary'
                            }`}
                        />

                        {/* Main Dot */}
                        <motion.button
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setActiveSite(spot)}
                          onMouseEnter={() => setHoverSite(spot)}
                          onMouseLeave={() => setHoverSite(null)}
                          className={`relative w-4 h-4 rounded-full border-2 border-white/20 shadow-lg cursor-pointer transition-colors ${activeSite?.id === spot.id
                            ? 'bg-gold-400 ring-4 ring-gold-400/30'
                            : 'bg-primary ring-4 ring-primary/20 hover:bg-gold-500 hover:ring-gold-500/30'
                            }`}
                        />
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Tooltip Layer - Outside the transform to avoid scaling the tooltip box */}
            <div className="absolute inset-0 z-40 pointer-events-none">
              <AnimatePresence>
                {hoverSite && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 10 }}
                    style={{
                      // We need to calculate the transformed position for the tooltip
                      // Since we can't easily do that in CSS, we use a simpler approach:
                      // Put it near the dot in the scaled container but unscale it.
                      // Wait, let's keep it simple: put it inside the scaled container but wrap content in an unscale div.
                      display: 'none' // We'll move the tooltip back inside below for better precision
                    }}
                  />
                )}
              </AnimatePresence>
            </div>

            <div className="absolute inset-0 z-50 pointer-events-none overflow-visible">
              <AnimatePresence>
                {hoverSite && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    style={{
                      // Transformed coordinate mapping:
                      // y_transformed = (y% * height - center_y) * 1.35 + center_y + translate_y
                      top: `${(hoverSite.y - 50) * 1.35 + 50 + (56 / 700 * 100)}%`,
                      left: `${(hoverSite.x - 50) * 1.35 + 50}%`,
                    }}
                    className={`absolute pointer-events-none -translate-x-1/2 ${hoverSite.y < 50 ? 'translate-y-[20px]' : '-translate-y-[calc(100%+60px)]'
                      }`}
                  >
                    {/* SVG Arrow Connector */}
                    <div className={`absolute left-1/2 -translate-x-1/2 w-8 h-[50px] flex justify-center ${hoverSite.y < 50 ? 'bottom-full origin-bottom' : 'top-full origin-top'
                      }`}>
                      <svg width="20" height="50" viewBox="0 0 20 50" className={`overflow-visible ${hoverSite.y < 50 ? 'rotate-180' : ''}`}>
                        <line x1="10" y1="0" x2="10" y2="45" stroke="#fbbf24" strokeWidth="2" />
                        <path d="M 10 50 L 5 42 L 15 42 Z" fill="#fbbf24" />
                        <circle cx="10" cy="0" r="3" fill="#fbbf24" />
                      </svg>
                    </div>

                    <div className="relative w-64 bg-zinc-950/98 border border-gold-500/50 rounded-2xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.9)] backdrop-blur-xl ring-1 ring-white/10">
                      <div className="flex items-center justify-between mb-3 pb-3 border-b border-white/10">
                        <span className="text-gold-400 font-black text-xl tracking-tight">{hoverSite.name}</span>
                        {hoverSite.icon && <span className="text-2xl filter drop-shadow-md">{hoverSite.icon}</span>}
                      </div>
                      <div className="text-zinc-200 text-sm font-medium leading-relaxed" dir="auto">
                        {hoverSite.description}
                      </div>
                      {hoverSite.riskLevel && (
                        <div className="mt-3 flex items-center gap-2">
                          <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Safe Level</span>
                          <div className="flex-1 h-1 bg-zinc-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full bg-gold-500 shadow-[0_0_10px_#ea7e08] ${hoverSite.riskLevel === 'Low' ? 'w-[90%]' :
                                hoverSite.riskLevel === 'Medium' ? 'w-[60%]' : 'w-[30%]'
                                }`}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            {activeSite ? (
              <motion.div key={activeSite.id} className="h-full bg-zinc-900/40 border border-yellow-500/20 rounded-[2.5rem] p-6 flex flex-col shadow-2xl overflow-y-auto">
                <h3 className="text-xl font-black text-gold-400 mb-4">{activeSite.name}</h3>
                <div className="space-y-6">
                  <div className="p-5 bg-zinc-800/50 rounded-2xl border border-white/5">
                    <p className="text-sm text-zinc-400 font-bold uppercase tracking-widest mb-2">{mapContent.needleSizeLabel}</p>
                    <p className="text-3xl font-black text-white">{activeSite.needle}</p>
                  </div>
                  <div className="p-5 bg-zinc-800/50 rounded-2xl border border-white/5">
                    <p className="text-sm text-zinc-400 font-bold uppercase tracking-widest mb-2">{mapContent.maxVolumeLabel}</p>
                    <p className="text-3xl font-black text-white">
                      {isImperial
                        ? `${convertValue(parseFloat(activeSite.volume.match(/[0-9.]+/)?.[0] || "1"), 'volume', 'imperial').toFixed(2)} oz`
                        : activeSite.volume
                      }
                    </p>
                  </div>
                  {activeSite.warning && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
                      <p className="text-lg text-red-400 font-black leading-relaxed flex items-center gap-3">
                        <AlertTriangle className="w-6 h-6 flex-shrink-0" />
                        <StyledBrandName text={activeSite.warning} />
                      </p>
                    </div>
                  )}
                  <div className="relative p-6 bg-gold-500/10 border border-gold-500/20 rounded-2xl">
                    <p className="text-xl md:text-2xl text-zinc-200 mt-2 font-black italic leading-relaxed">
                      "<StyledBrandName text={activeSite.advice} />"
                    </p>
                  </div>
                </div>
                <button onClick={() => setActiveSite(null)} className="mt-auto w-full py-4 bg-gold-500 text-black font-black rounded-2xl">
                  {mapContent.closeDetailsBtn}
                </button>
              </motion.div>
            ) : (
              <div className="h-full flex items-center justify-center text-center p-8 bg-zinc-900/20 border-2 border-dashed border-white/5 rounded-[2.5rem]">
                <p className="text-zinc-400 font-bold">{mapContent.labels?.selectPoint || "Select Point"}</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* AdSlot: Middle Banner */}
      <div className="mt-12 font-sans">
        <AdPlaceholder slotId="injection_mid_banner" format="horizontal" content={content} />
      </div>

      <footer className="mt-16">
        <div className="relative p-8 bg-zinc-950/50 border border-white/5 rounded-[4rem]">
          <h2 className="text-3xl font-black text-center mb-10">{mapContent.goldenHourTitle}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard icon="🚀" title={mapContent.featureCards?.power.title || "Power"} desc={<StyledBrandName text={dynamicStats.powerDesc} />} color="bg-blue-500/10 border-blue-500/20" glow="shadow-blue-500/20" />
            <FeatureCard icon="🛡️" title={mapContent.featureCards?.tissue.title || "Tissue"} desc={<StyledBrandName text={dynamicStats.tissueDesc} />} color="bg-green-500/10 border-green-500/20" glow="shadow-green-500/20" />
            <FeatureCard icon="🔥" title={mapContent.featureCards?.burn.title || "Burn"} desc={<StyledBrandName text={dynamicStats.burnDesc} />} color="bg-red-500/10 border-red-500/20" glow="shadow-red-500/20" />
          </div>
        </div>
      </footer>
    </div>
  );
};

const StatCard = ({ label, value, color, icon }: { label: string, value: string, color: string, icon: React.ReactNode }) => (
  <div className="flex-1 bg-zinc-900/60 border border-white/5 rounded-3xl p-5">
    <div className="flex items-center gap-2 mb-2 text-zinc-300 font-bold text-xs uppercase tracking-widest">
      {icon} {label}
    </div>
    <div className={`text-2xl font-black ${color}`}>{value}</div>
  </div>
);

const FeatureCard = ({ icon, title, desc, color, glow }: { icon: string, title: string, desc: React.ReactNode, color: string, glow: string }) => (
  <div className={`p-6 rounded-[2.5rem] border ${color} shadow-lg ${glow}`}>
    <div className="text-4xl mb-4">{icon}</div>
    <h4 className="text-xl font-black text-white mb-2">{title}</h4>
    <p className="text-sm text-zinc-400 leading-relaxed font-bold">{desc}</p>
  </div>
);

export default InjectionMap;
