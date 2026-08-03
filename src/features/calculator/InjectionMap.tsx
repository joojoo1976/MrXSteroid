import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Zap, Activity, AlertTriangle, Sparkles, Rotate3d, RefreshCw,
  Stethoscope, CheckCircle2, Syringe, Crosshair, Clock, TrendingUp,
  ScanLine, BrainCircuit, X, Ruler, MousePointerClick
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
  } = useInjectionMap({
    content,
    unitSystem: unitSystem || 'metric',
    language: language || 'en'
  });

  const mapContent = content.injectionMap;
  const deep = mapContent.deepLabels;
  const canvasRef = useRef<HTMLDivElement | null>(null);

  const [showAdvice, setShowAdvice] = useState(true);

  const formatVolume = (site: Hotspot) => {
    const ml = site.maxVolumeMl ?? parseFloat(site.volume.match(/[0-9.]+/)?.[0] || "1");
    if (isImperial) {
      return `${convertValue(ml, 'volume', 'imperial').toFixed(2)} oz`;
    }
    return `${ml} ml`;
  };

  const formatNeedleLength = (site: Hotspot): string => {
    const inchArr = site.needleLengthInch;
    if (!inchArr || inchArr.length === 0) return '';
    const fmt = (inch: number) => {
      if (isImperial) return `${inch}"`;
      const cm = (inch * 2.54);
      return `${cm % 1 === 0 ? cm.toFixed(0) : cm.toFixed(1)} cm`;
    };
    if (inchArr.length === 1) return fmt(inchArr[0]);
    return `${fmt(inchArr[0])} – ${fmt(inchArr[1])}`;
  };

  const formatNeedle = (site: Hotspot): string => {
    if (site.needleGauge && site.needleLengthInch && site.needleLengthInch.length > 0) {
      return `${site.needleGauge} (${formatNeedleLength(site)})`;
    }
    return site.needleSpecs || site.needle;
  };

  const formatDepth = (site: Hotspot): string => {
    const inch = site.depthInch;
    if (!inch) return '';
    if (isImperial) return `${inch}"`;
    const cm = inch * 2.54;
    const unit = isAr ? ' سم' : ' cm';
    return `${cm % 1 === 0 ? cm.toFixed(0) : cm.toFixed(2)}${unit}`;
  };

  const renderAngleDepth = (site: Hotspot): string => {
    const depth = formatDepth(site);
    return site.angleDepth ? site.angleDepth.replace('{depth}', depth || '') : '';
  };

  const muscleTypeLabel = (site: Hotspot) => {
    if (site.muscleType === 'Small') return deep.smallMuscle;
    if (site.muscleType === 'Large') return deep.largeMuscle;
    return deep.mediumMuscle;
  };

  const riskMeta = (risk: string) => {
    if (risk === 'Low') return { label: 'Low', color: 'text-emerald-400', bar: 'w-[90%] bg-emerald-500', chip: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' };
    if (risk === 'Medium') return { label: 'Medium', color: 'text-amber-400', bar: 'w-[60%] bg-amber-500', chip: 'bg-amber-500/10 border-amber-500/30 text-amber-400' };
    return { label: 'High', color: 'text-red-400', bar: 'w-[30%] bg-red-500', chip: 'bg-red-500/10 border-red-500/30 text-red-400' };
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
            ar: 'نموذج تشريحي تفاعلي مدعوم بمحرك تحليل سريري عميق: مرّر فوق أي نقطة لمعاينة فورية، وانقر لفتح البروتوكول الطبي الكامل — المعالم، الأعصاب المجاورة، الإبرة، الحجم، الزاوية، والتناوب. كل القيم تُعرض تلقائيًا وفق نظام القياس النشط (متري/إمبراطوري):',
            en: 'An interactive anatomical model powered by a deep clinical analysis engine: hover any point for an instant preview, and click to open the full medical protocol — landmarks, nearby nerves, needle, volume, angle and rotation. Every value renders automatically in your active measurement system (Metric/Imperial):',
          }}
          items={[
            {
              icon: Rotate3d,
              title: { ar: '1. النموذج التشريحي ثلاثي الأبعاد', en: '1. 3D Anatomical Model' },
              body: {
                ar: 'جسد بشري تفاعلي قابل للتدوير (أمامي/خلفي) بنقاط تشريحية مُعايَرة ومثبتة بدقة فوق العضلات المستهدفة دون الحاجة لأي تحريك يدوي.',
                en: 'A rotatable front/back human model with calibrated anatomical points anchored precisely over the target muscles — no manual dragging needed.',
              },
            },
            {
              icon: MousePointerClick,
              title: { ar: '2. معاينة فورية بالتلميح الزجاجي', en: '2. Instant Glass Preview' },
              body: {
                ar: 'مرّر المؤشر فوق أي نقطة لفتح تلميح زجاجي متصل بسهم مع الوصف، الحجم الآمن، مواصفات الإبرة، ومستوى الأمان في لحظة.',
                en: 'Hover any point to open a glass tooltip with a connector arrow showing description, safe volume, needle specs and safety level instantly.',
              },
            },
            {
              icon: BrainCircuit,
              title: { ar: '3. لوحة التحليل السريري العميق', en: '3. Deep Intelligence Panel' },
              body: {
                ar: 'انقر أي موقع لعرض البروتوكول الكامل: المعالم التشريحية، البنى المجاورة من أعصاب وأوعية، نوع العضلة، حدود الحجم، زاوية الحقن، إرشادات التناوب، وقواعد الشفط والأمان.',
                en: 'Click any site for the full protocol: anatomical landmarks, nearby nerves and vessels, muscle type, volume limits, injection angle, rotation guidance, and aspiration safety rules.',
              },
            },
            {
              icon: Shield,
              title: { ar: '4. محرك الأمان ومستوى الخطر', en: '4. Safety & Risk Engine' },
              body: {
                ar: 'يقيّم كل موقع حسب قربه من الأعصاب والأوردة وحجم العضلة، ويعرض مؤشر أمان رقمياً يحدد صلاحية الاستخدام المتكرر.',
                en: 'Scores every site by proximity to nerves, veins and muscle volume, showing a numeric safety rating for repeat-use suitability.',
              },
            },
            {
              icon: RefreshCw,
              title: { ar: '5. نظام التناوب الذكي (Rotation)', en: '5. Smart Rotation Logic' },
              body: {
                ar: 'يحسب أفضل تسلسل تناوب بين المواقع لمنع التليّف العضلي والندوب الدهنية، ويوزع الأحمال بأمان على العضلات الكبرى.',
                en: 'Computes the optimal rotation sequence across sites to prevent muscle fibrosis and lipohypertrophy while balancing load on major muscles.',
              },
            },
            {
              icon: Zap,
              title: { ar: '6. مؤشرات الامتصاص والتوجيه', en: '6. Absorption Indicators & Guidance' },
              body: {
                ar: 'يعرض كفاءة امتصاص كل موقع وحجم الحقن الآمن ومواصفات الإبرة المناسبة، مع توجيه فوري للجرعة المنفردة والمتكررة.',
                en: 'Shows per-site absorption efficiency, safe injection volume and recommended needle specs with instant single and repeat dosing guidance.',
              },
            },
            {
              icon: Ruler,
              title: { ar: '7. نظام قياس ذكي (متري/إمبراطوري)', en: '7. Smart Unit System (Metric/Imperial)' },
              body: {
                ar: 'تحويل تلقائي لحظي لكل القيم مع تغيير نظام القياس: الأحجام (مل/أوقية) وأطوال الإبر (سم/بوصة) تُعرض فورًا بالوحدة المناسبة.',
                en: 'Instant automatic conversion of every value on unit-system switch: volumes (ml/oz) and needle lengths (cm/in) render immediately in the right unit.',
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
          {activeSite && (
            <motion.div
              key={activeSite.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-[2rem] border border-gold-500/25 bg-gold-500/5 p-5"
            >
              <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-gold-300 font-bold mb-2">
                <TrendingUp className="w-4 h-4" />
                {deep.absorptionLabel}
              </div>
              <p className="text-3xl font-black text-gold-400 mb-1">{dynamicStats.absorption}%</p>
              <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-gold-500 to-amber-400 shadow-[0_0_10px_rgba(255,215,0,0.6)]"
                  initial={{ width: 0 }}
                  animate={{ width: `${dynamicStats.absorption}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />
              </div>
              <p className="text-xs text-zinc-400 mt-3 leading-relaxed">{activeSite.bestFor}</p>
            </motion.div>
          )}
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

                  <div className="absolute inset-0 z-30">
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
                          cursor: 'pointer',
                          touchAction: 'auto',
                        }}
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
                          onClick={(e) => { e.stopPropagation(); setActiveSite(spot); }}
                          className={`relative w-4 h-4 rounded-full border-2 border-white/20 shadow-lg transition-colors cursor-pointer ${activeSite?.id === spot.id
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

            {/* Glassmorphism Hover Tooltip with connector arrow */}
            <div className="absolute inset-0 z-50 pointer-events-none overflow-visible">
              <AnimatePresence>
                {hoverSite && (
                  <motion.div
                    key={hoverSite.id}
                    initial={{ opacity: 0, scale: 0.9, y: 4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 4 }}
                    style={{
                      top: `${(hoverSite.y - 50) * 1.35 + 50 + (56 / 700 * 100)}%`,
                      left: `${(hoverSite.x - 50) * 1.35 + 50}%`,
                    }}
                    className={`absolute pointer-events-none -translate-x-1/2 ${hoverSite.y < 50 ? 'translate-y-[20px]' : '-translate-y-[calc(100%+60px)]'}`}
                  >
                    <div className={`absolute left-1/2 -translate-x-1/2 w-8 h-[50px] flex justify-center ${hoverSite.y < 50 ? 'bottom-full origin-bottom' : 'top-full origin-top'}`}>
                      <svg width="20" height="50" viewBox="0 0 20 50" className={`overflow-visible ${hoverSite.y < 50 ? 'rotate-180' : ''}`}>
                        <line x1="10" y1="0" x2="10" y2="45" stroke="#fbbf24" strokeWidth="2" strokeDasharray="3 3" />
                        <path d="M 10 50 L 5 42 L 15 42 Z" fill="#fbbf24" />
                        <circle cx="10" cy="0" r="3" fill="#fbbf24" />
                      </svg>
                    </div>

                    <div className="relative w-64 bg-zinc-950/70 backdrop-blur-2xl border border-gold-500/40 rounded-2xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.9)] ring-1 ring-white/10">
                      <div className="flex items-center justify-between mb-3 pb-3 border-b border-white/10">
                        <span className="text-gold-400 font-black text-xl tracking-tight">{hoverSite.name}</span>
                        {hoverSite.icon && <span className="text-2xl filter drop-shadow-md">{hoverSite.icon}</span>}
                      </div>
                      <div className="text-zinc-200 text-sm font-medium leading-relaxed" dir="auto">
                        {hoverSite.description}
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <div className="flex items-center gap-1.5 text-xs text-zinc-300 font-bold">
                          <Syringe className="w-3.5 h-3.5 text-gold-400" />
                          {formatVolume(hoverSite)}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-zinc-300 font-bold">
                          <Crosshair className="w-3.5 h-3.5 text-gold-400" />
                          {formatNeedle(hoverSite)}
                        </div>
                      </div>
                      {hoverSite.riskLevel && (
                        <div className="mt-3 flex items-center gap-2">
                          <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">{deep.safetyLabel}</span>
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

          {/* Hint bar */}
          <div className="mt-4 w-full max-w-md text-center">
            <p className="text-xs text-zinc-500 font-bold tracking-widest uppercase flex items-center justify-center gap-2">
              <ScanLine className="w-3.5 h-3.5 text-gold-400" />
              {hoverSite ? deep.hoverHint : mapContent.labels?.selectPoint || deep.selectPointHint}
            </p>
          </div>
        </div>

        {/* Deep Intelligence Side Panel */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            {activeSite ? (
              <motion.div
                key={activeSite.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 16 }}
                className="h-full max-h-[700px] bg-zinc-900/40 border border-yellow-500/20 rounded-[2.5rem] p-6 flex flex-col shadow-2xl overflow-y-auto"
              >
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-gold-400 font-black mb-1">
                  <BrainCircuit className="w-4 h-4" />
                  {deep.sidebarEyebrow}
                </div>
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="text-xl font-black text-gold-400 leading-tight">{activeSite.name}</h3>
                  <button onClick={() => setActiveSite(null)} className="flex-shrink-0 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors" aria-label={deep.closeBtn}>
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-[11px] text-zinc-500 font-bold mb-4 leading-relaxed">{deep.sidebarSubtitle}</p>

                <div className="space-y-3 text-sm">
                  {/* Muscle type + risk chips */}
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-300 text-xs font-black">
                      {deep.muscleTypeLabel}: {muscleTypeLabel(activeSite)}
                    </span>
                    <span className={`px-3 py-1 rounded-full border text-xs font-black ${riskMeta(activeSite.riskLevel).chip}`}>
                      {deep.safetyLabel}: {riskMeta(activeSite.riskLevel).label}
                    </span>
                  </div>

                  {/* Anatomical Landmarks */}
                  <div className="p-4 bg-zinc-800/50 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-2 text-xs text-zinc-400 font-bold uppercase tracking-widest mb-2">
                      <Crosshair className="w-4 h-4 text-gold-400" />
                      {deep.anatomicalLabel}
                    </div>
                    <p className="text-zinc-200 font-medium leading-relaxed" dir="auto">{activeSite.landmarks}</p>
                  </div>

                  {/* Nearby Structures */}
                  {activeSite.nearbyStructures && (
                    <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-2xl">
                      <div className="flex items-center gap-2 text-xs text-red-400 font-bold uppercase tracking-widest mb-2">
                        <AlertTriangle className="w-4 h-4" />
                        {deep.nearNerves}
                      </div>
                      <p className="text-zinc-300 font-medium leading-relaxed" dir="auto">{activeSite.nearbyStructures}</p>
                    </div>
                  )}

                  {/* Volume + Needle */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-4 bg-zinc-800/50 rounded-2xl border border-white/5">
                      <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-bold uppercase tracking-widest mb-1.5">
                        <Syringe className="w-3.5 h-3.5 text-gold-400" />
                        {deep.volumeLabel}
                      </div>
                      <p className="text-xl font-black text-white">{formatVolume(activeSite)}</p>
                      <p className="text-[10px] text-zinc-500 font-bold mt-1">{mapContent.maxVolumeLabel}</p>
                    </div>
                    <div className="p-4 bg-zinc-800/50 rounded-2xl border border-white/5">
                      <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-bold uppercase tracking-widest mb-1.5">
                        <ScanLine className="w-3.5 h-3.5 text-gold-400" />
                        {deep.needleLabel}
                      </div>
                      <p className="text-xl font-black text-white">{formatNeedle(activeSite)}</p>
                      {activeSite.needleSpecs && (
                        <p className="text-[10px] text-zinc-500 font-bold mt-1 leading-snug" dir="auto">{activeSite.needleSpecs}</p>
                      )}
                    </div>
                  </div>

                  {/* Absorption */}
                  <div className="p-4 bg-zinc-800/50 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-2 text-xs text-zinc-400 font-bold uppercase tracking-widest mb-2">
                      <Zap className="w-4 h-4 text-gold-400" />
                      {deep.absorptionLabel}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-black text-gold-400">{activeSite.absorption}%</span>
                      <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-gold-500 to-amber-400 shadow-[0_0_10px_rgba(255,215,0,0.6)]"
                          initial={{ width: 0 }}
                          animate={{ width: `${activeSite.absorption}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Angle & Depth */}
                  <div className="p-4 bg-zinc-800/50 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-2 text-xs text-zinc-400 font-bold uppercase tracking-widest mb-2">
                      <Activity className="w-4 h-4 text-gold-400" />
                      {deep.angleLabel}
                    </div>
                    <p className="text-zinc-200 font-medium leading-relaxed" dir="auto">{renderAngleDepth(activeSite)}</p>
                  </div>

                  {/* Rotation & Recovery */}
                  <div className="p-4 bg-zinc-800/50 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-2 text-xs text-zinc-400 font-bold uppercase tracking-widest mb-2">
                      <Clock className="w-4 h-4 text-gold-400" />
                      {deep.rotationLabel}
                    </div>
                    <p className="text-zinc-200 font-medium leading-relaxed" dir="auto">{activeSite.rotationAdvice}</p>
                  </div>

                  {/* Precautions */}
                  {activeSite.precautions && activeSite.precautions.length > 0 && (
                    <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl">
                      <div className="flex items-center gap-2 text-xs text-emerald-400 font-bold uppercase tracking-widest mb-2">
                        <Shield className="w-4 h-4" />
                        {deep.precautionsLabel}
                      </div>
                      <ul className="space-y-2">
                        {activeSite.precautions.map((prec, i) => (
                          <li key={i} className="flex items-start gap-2" dir="auto">
                            <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-400" />
                            <span className="text-zinc-300 font-medium leading-relaxed">{prec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Advice quote */}
                  <div className="relative p-4 bg-gold-500/10 border border-gold-500/20 rounded-2xl">
                    <p className="text-sm text-zinc-200 font-black italic leading-relaxed">
                      "<StyledBrandName text={activeSite.advice} />"
                    </p>
                  </div>
                </div>

                <button onClick={() => setActiveSite(null)} className="mt-4 w-full py-3 bg-gold-500 text-black font-black rounded-2xl hover:bg-gold-400 transition-colors">
                  {deep.closeBtn}
                </button>
              </motion.div>
            ) : (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8 bg-zinc-900/20 border-2 border-dashed border-white/5 rounded-[2.5rem]">
                <div className="relative mb-4">
                  <div className="absolute inset-0 bg-gold-500/20 blur-2xl rounded-full"></div>
                  <div className="relative w-16 h-16 rounded-2xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center">
                    <BrainCircuit className="w-8 h-8 text-gold-500/80" />
                  </div>
                </div>
                <span className="text-[10px] uppercase tracking-[0.2em] text-gold-400 font-black mb-2">
                  {deep.sidebarEyebrow}
                </span>
                <h4 className="text-lg font-black text-white leading-snug mb-2">{deep.sidebarTitle}</h4>
                <p className="text-xs text-zinc-400 font-bold leading-relaxed mb-2" dir="auto">
                  {deep.sidebarSubtitle}
                </p>
                <p className="text-zinc-200 font-black leading-relaxed" dir="auto">
                  {deep.selectPointHint}
                </p>
                <div className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-zinc-300" dir="ltr">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold-400 animate-pulse"></span>
                  {deep.measurementLabel}: {isImperial ? deep.measurementImperial : deep.measurementMetric}
                </div>
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
