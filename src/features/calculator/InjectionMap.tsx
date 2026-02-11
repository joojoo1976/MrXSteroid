import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Zap, Activity, AlertTriangle } from 'lucide-react';
import BrandLogo from '../shared/BrandLogo';
import { StyledBrandName } from '../shared/StyledBrandName';
import AdPlaceholder from '../shared/AdPlaceholder';
import { convertValue } from '../../utils/logic';
import { ContentStrings, Page } from '../../types';
import { usePreferences } from '../../context/PreferencesContext';
import { useInjectionMap } from '../../features/calculators/hooks/useInjectionMap';


interface InjectionMapProps {
  content: ContentStrings;
  navigateTo: (page: Page) => void;
}

const InjectionMap: React.FC<InjectionMapProps> = ({ content, navigateTo }) => {
  const { unitSystem, language } = usePreferences();

  const {
    rotation,
    setRotation,
    activeSite,
    setActiveSite,
    hoverSite,
    setHoverSite,
    currentView,
    activeHotspots,
    dynamicStats,
    isImperial
  } = useInjectionMap({
    content,
    unitSystem: unitSystem || 'metric',
    language: language || 'en'
  });

  const mapContent = content.injectionMap;

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 relative font-cairo" dir={language === 'ar' ? 'rtl' : 'ltr'}>
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
            <div className="absolute inset-0 rounded-[3rem] bg-zinc-900 border-2 border-yellow-500/20 shadow-2xl overflow-hidden z-0">
              <div className="absolute inset-0 bg-[linear-gradient(rgba(234,179,8,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(234,179,8,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>
              <motion.div
                animate={{ top: ['0%', '100%', '0%'] }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute left-0 w-full h-1 bg-gold-500/50 blur-sm z-20 shadow-[0_0_20px_rgba(234,179,8,0.5)]"
              />
              <div className="relative w-full h-full flex items-center justify-center p-8 overflow-visible">
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
                          transform: 'translate(-50%, -50%)'
                        }}
                      >
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
                          className={`absolute inset-0 w-8 h-8 -left-4 -top-4 rounded-full blur-md ${activeSite?.id === spot.id ? 'bg-gold-400' : 'bg-primary'}`}
                        />

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

            <div className="absolute inset-0 z-50 pointer-events-none overflow-visible">
              <AnimatePresence>
                {hoverSite && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    style={{
                      top: `${(hoverSite.y - 50) * 1.35 + 50 + (56 / 700 * 100)}%`,
                      left: `${(hoverSite.x - 50) * 1.35 + 50}%`,
                    }}
                    className={`absolute pointer-events-none -translate-x-1/2 ${hoverSite.y < 50 ? 'translate-y-[20px]' : '-translate-y-[calc(100%+60px)]'}`}
                  >
                    <div className={`absolute left-1/2 -translate-x-1/2 w-8 h-[50px] flex justify-center ${hoverSite.y < 50 ? 'bottom-full origin-bottom' : 'top-full origin-top'}`}>
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
