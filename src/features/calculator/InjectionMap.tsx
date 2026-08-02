import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Zap, Activity, AlertTriangle, Sparkles, Rotate3d, RefreshCw,
  Stethoscope, Move, Undo2, CheckCircle2
} from 'lucide-react';
import BrandLogo from '../../shared/ui/BrandLogo';
import { StyledBrandName } from '../../shared/ui/StyledBrandName';
import AdPlaceholder from '../../shared/ui/AdPlaceholder';
import SystemGuideCard from '../../shared/ui/SystemGuideCard';
import { convertValue } from '../../shared/lib/logic';
import { ContentStrings, Page } from '@/shared/types/types';
import { usePreferences } from '../../context/PreferencesContext';
import { useInjectionMap, Hotspot } from './hooks/useInjectionMap';


interface InjectionMapProps {
  content: ContentStrings;
  navigateTo: (page: Page) => void;
}

const InjectionMap: React.FC<InjectionMapProps> = ({ content, navigateTo }) => {
  const { unitSystem, language } = usePreferences();
  const isAr = language === 'ar';

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
    isImperial,
    setCustomPosition,
    savePositions,
    hasUnsavedChanges,
    resetCustomPositions,
  } = useInjectionMap({
    content,
    unitSystem: unitSystem || 'metric',
    language: language || 'en'
  });

  const mapContent = content.injectionMap;

  const [editMode, setEditMode] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [showAdvice, setShowAdvice] = useState(true);
  const canvasRef = useRef<HTMLDivElement | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2600);
  };

  const handleDrag = (site: Hotspot, e: React.PointerEvent) => {
    if (!editMode) {
      setActiveSite(site);
      return;
    }
    e.preventDefault();
    e.stopPropagation();

    const update = (clientX: number, clientY: number) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect || rect.width === 0) return;
      let nx = ((clientX - rect.left) / rect.width) * 100;
      let ny = ((clientY - rect.top) / rect.height) * 100;
      nx = Math.min(100, Math.max(0, nx));
      ny = Math.min(100, Math.max(0, ny));
      setCustomPosition(site.id, nx, ny);
    };

    const onMove = (ev: PointerEvent) => {
      ev.preventDefault();
      update(ev.clientX, ev.clientY);
    };
    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  const handleReset = () => {
    resetCustomPositions();
    showToast(mapContent.editPoints?.resetToast || 'Reset Points');
  };

  const handleSave = () => {
    savePositions();
    setEditMode(false);
    showToast(mapContent.editPoints?.savedToast || 'Saved');
  };

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

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-[70] bg-emerald-500 text-black font-black px-6 py-3 rounded-2xl shadow-xl flex items-center gap-2"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span dir="auto">{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── System Guide: خريطة الحقن التفاعلية ── */}
      <div className="mb-8 relative z-10">
        <SystemGuideCard
          isAr={isAr}
          icon={Sparkles}
          title={{
            ar: 'نظام خريطة الحقن التفاعلي الذكي',
            en: 'Smart Interactive Injection Mapping System',
          }}
          subtitle={{
            ar: 'توزيع الحقن العضلي بأمان مع كفاءة امتصاص مثلى',
            en: 'Safe intramuscular injection rotation with optimal absorption efficiency',
          }}
          intro={{
            ar: 'تعتمد هذه الخريطة على نموذج تشريحي ثلاثي الأبعاد ومحرك أمان سريري لترشدك إلى أفضل موقع حقن للاستخدام المفرد والمتكرر، مع تجنّب الأعصاب والأوعية الدموية:',
            en: 'Powered by a 3D anatomical model and a clinical safety engine, this map guides you to optimal single and repeat injection sites while avoiding nerves and vessels:',
          }}
          items={[
            {
              icon: Rotate3d,
              title: { ar: '1. النموذج التشريحي ثلاثي الأبعاد', en: '1. 3D Anatomical Model' },
              body: {
                ar: 'جسد بشري تفاعلي قابل للتدوير (أمامي/خلفي)، ويمكنك تحريك أي نقطة لتدقيق موقع العضلة على جسدك بدقة.',
                en: 'A rotatable front/back human model; you can drag any point to precisely match your own anatomy.',
              },
            },
            {
              icon: Shield,
              title: { ar: '2. محرك الأمان ومستوى الخطر', en: '2. Safety & Risk Engine' },
              body: {
                ar: 'يقيّم كل موقع حسب قربه من الأعصاب والأوردة وحجم العضلة، ويعرض مؤشر أمان رقمياً يحدد صلاحية الاستخدام المتكرر.',
                en: 'Scores every site by proximity to nerves, veins and muscle volume, showing a numeric safety rating for repeat-use suitability.',
              },
            },
            {
              icon: RefreshCw,
              title: { ar: '3. نظام التناوب الذكي (Rotation)', en: '3. Smart Rotation Logic' },
              body: {
                ar: 'يحسب أفضل تسلسل تناوب بين المواقع لمنع التليّف العضلي والندوب الدهنية، ويوزع الأحمال بأمان على العضلات الكبرى.',
                en: 'Computes the optimal rotation sequence across sites to prevent muscle fibrosis and lipohypertrophy while balancing load on major muscles.',
              },
            },
            {
              icon: Zap,
              title: { ar: '4. مؤشرات الامتصاص والتوجيه', en: '4. Absorption Indicators & Guidance' },
              body: {
                ar: 'يعرض كفاءة امتصاص كل موقع وحجم الحقن الآمن وعمق الإبرة المناسب، مع نصائح فورية للجرعة المنفردة والمتكررة.',
                en: 'Shows per-site absorption efficiency, safe injection volume and recommended needle depth with instant dosing guidance.',
              },
            },
          ]}
        />
      </div>

      {/* AdSlot: Top Banner */}
      <div className="mb-8 font-sans">
        <AdPlaceholder slotId="injection_top_banner" format="horizontal" content={content} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch relative z-10">
        <div className="lg:col-span-3 flex flex-col gap-4">
          <StatCard label={mapContent.efficiencyLabel || "Efficiency"} value={`${dynamicStats.absorption}%`} color="text-gold-400" icon={<Zap className="w-4 h-4" />} />
          <StatCard label={mapContent.riskLevelLabel} value={`${dynamicStats.safety}%`} color={dynamicStats.safety > 80 ? "text-green-400" : "text-yellow-400"} icon={<Shield className="w-4 h-4" />} />
          <StatCard label={mapContent.stimulatedCellsLabel} value={dynamicStats.cells} color="text-cyan-400" icon={<Activity className="w-4 h-4" />} />

          {/* Point Editing Panel */}
          <div className={`rounded-[2rem] border p-5 flex flex-col gap-3 transition-colors ${editMode ? 'bg-amber-500/10 border-amber-500/40' : 'bg-zinc-900/40 border-white/5'}`}>
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-zinc-300 font-bold">
              <Move className="w-4 h-4 text-amber-400" />
              {mapContent.editPoints?.eyebrow}
            </div>
            <h4 className="text-lg font-black text-white leading-snug">{mapContent.editPoints?.title}</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">{mapContent.editPoints?.intro}</p>
            {editMode && (
              <p className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                {mapContent.editPoints?.activeLabel}
              </p>
            )}
            <button
              onClick={() => setEditMode(m => !m)}
              className={`w-full py-3 rounded-xl font-black transition-all flex items-center justify-center gap-2 ${editMode ? 'bg-amber-500 text-black' : 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700'}`}
            >
              <Move className="w-4 h-4" />
              {mapContent.editPoints?.[editMode ? 'disableBtn' : 'enableBtn']}
            </button>
            {hasUnsavedChanges && (
              <motion.button
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={handleSave}
                className="w-full py-3 rounded-xl font-black bg-emerald-500 text-black hover:bg-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.4)] flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                {mapContent.editPoints?.saveBtn || "Save Points"}
              </motion.button>
            )}
            <button
              onClick={handleReset}
              className="w-full py-3 rounded-xl font-black text-zinc-300 border border-white/10 hover:bg-white/5 flex items-center justify-center gap-2"
            >
              <Undo2 className="w-4 h-4" />
              {mapContent.editPoints?.resetBtn}
            </button>
          </div>
        </div>

        <div className="lg:col-span-6 flex flex-col items-center">
          <div className="w-full max-w-md mb-4">
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

          <div className="relative w-[450px] h-[700px] group" dir="ltr">
            <div className="absolute inset-0 rounded-[3rem] bg-zinc-900 border-2 border-yellow-500/20 shadow-2xl overflow-hidden z-0">
              <div className="absolute inset-0 bg-[linear-gradient(rgba(234,179,8,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(234,179,8,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>
              <div className="relative w-full h-full flex items-center justify-center p-8 overflow-visible">
                <div ref={canvasRef} className="relative w-full h-full scale-[1.35] translate-y-14 flex items-center justify-center">
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

                  <div
                    className="absolute inset-0 z-30"
                    style={{ pointerEvents: editMode ? 'auto' : 'none' }}
                  >
                    {activeHotspots.filter(h => h.side === currentView).map(spot => (
                      <motion.div
                        key={spot.id}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute"
                        style={{
                          top: `${spot.y}%`,
                          left: `${spot.x}%`,
                          transform: 'translate(-50%, -50%)',
                          touchAction: editMode ? 'none' : 'auto',
                          cursor: editMode ? 'grab' : 'pointer',
                        }}
                        onPointerDown={(e) => handleDrag(spot, e)}
                        onMouseEnter={() => setHoverSite(spot)}
                        onMouseLeave={() => setHoverSite(null)}
                      >
                        <motion.div
                          animate={{
                            scale: [1, 1.5, 1],
                            opacity: [0.5, 0.2, 0.5]
                          }}
                          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                          className={`absolute inset-0 w-8 h-8 -left-4 -top-4 rounded-full blur-md ${activeSite?.id === spot.id ? 'bg-gold-400' : 'bg-primary'}`}
                        />
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => { e.stopPropagation(); if (!editMode) setActiveSite(spot); }}
                          className={`relative w-4 h-4 rounded-full border-2 border-white/20 shadow-lg transition-colors ${editMode ? 'bg-amber-400 border-amber-400 ring-4 ring-amber-400/20' : 'cursor-pointer'} ${activeSite?.id === spot.id && !editMode
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

          {/* Unit / Hint bar */}
          <div className="mt-4 w-full max-w-md text-center">
            <p className="text-xs text-zinc-500 font-bold tracking-widest uppercase flex items-center justify-center gap-2">
              <Move className="w-3.5 h-3.5 text-amber-400" />
              {editMode ? mapContent.editPoints?.dragHint : mapContent.editPoints?.inactiveLabel}
            </p>
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

      {/* Medical & Safety Advisory */}
      <div className="mt-10 relative z-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-black text-emerald-400 flex items-center gap-2">
            <Stethoscope className="w-6 h-6" />
            {mapContent.medicalAdvice?.title}
          </h2>
          <button onClick={() => setShowAdvice(s => !s)} className="text-xs font-bold text-zinc-400 hover:text-white uppercase tracking-widest">
            {showAdvice ? '−' : '+'}
          </button>
        </div>
        <AnimatePresence>
          {showAdvice && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="rounded-[2.5rem] border border-emerald-500/25 bg-emerald-500/5 p-8 shadow-[0_20px_60px_rgba(0,0,0,0.4)]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4">
                  {mapContent.medicalAdvice?.points?.map((point, i) => (
                    <div key={i} className="flex items-start gap-3" dir="auto">
                      <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      </span>
                      <p className="text-sm text-zinc-300 leading-relaxed">{point}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/30" dir="auto">
                  <p className="text-sm font-bold text-red-300 leading-relaxed">{mapContent.medicalAdvice?.warning}</p>
                </div>
                <p className="mt-4 text-xs text-zinc-500 italic leading-relaxed" dir="auto">
                  {mapContent.medicalAdvice?.footer}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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