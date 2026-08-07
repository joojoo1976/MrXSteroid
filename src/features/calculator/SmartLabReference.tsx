import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  FlaskConical,
  Beaker,
  ShieldCheck,
  HeartPulse,
  Pill,
  Atom,
  Gauge,
  Flame,
  Bone,
  Sparkles,
  ArrowRightLeft,
  Activity,
  X,
  CheckCircle2,
  ArrowUpToLine,
  ArrowDownToLine,
  Ruler,
  Globe,
  ScanSearch,
  Info,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import BrandLogo from '../../shared/ui/BrandLogo';
import AdPlaceholder from '../../shared/ui/AdPlaceholder';
import SystemGuideCard from '../../shared/ui/SystemGuideCard';
import { ContentStrings, Page } from '@/shared/types/types';
import { usePreferences } from '../../context/PreferencesContext';
import { LabTestData, BilingualText } from '@/data/labReference';
import { LAB_CATEGORIES } from '@/data/labReference';
import { LabUnitSystem, formatLabNumber } from '@/shared/lib/lab';
import { useSmartLabReference, LAB_UI } from './hooks/useSmartLabReference';

interface SmartLabReferenceProps {
  content: ContentStrings;
  navigateTo: (page: Page) => void;
}

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  Activity,
  ShieldCheck,
  HeartPulse,
  Pill,
  Atom,
  Gauge,
  Flame,
  Bone,
};

// Category cards use `cat.icon` (an icon *name*); test cards key off the
// category *id* — build the id→icon lookup from the category metadata.
const CATEGORY_ICONS_BY_ID: Record<string, React.ElementType> = Object.fromEntries(
  LAB_CATEGORIES.map((cat) => [cat.id, CATEGORY_ICONS[cat.icon] ?? FlaskConical]),
);

const DIRECTION_META = {
  high: {
    icon: TrendingUp,
    labelKey: 'highTitle' as const,
    color: 'rose',
  },
  low: {
    icon: TrendingDown,
    labelKey: 'lowTitle' as const,
    color: 'sky',
  },
} as const;

const STATUS_META = {
  low: {
    icon: ArrowDownToLine,
    labelKey: 'statusLow' as const,
    text: 'text-sky-500',
    bg: 'bg-sky-500/10',
    border: 'border-sky-500/30',
    bar: 'from-sky-400 to-sky-500',
  },
  normal: {
    icon: CheckCircle2,
    labelKey: 'statusNormal' as const,
    text: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    bar: 'from-emerald-400 to-emerald-500',
  },
  high: {
    icon: ArrowUpToLine,
    labelKey: 'statusHigh' as const,
    text: 'text-rose-500',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/30',
    bar: 'from-rose-400 to-rose-500',
  },
} as const;

const SmartLabReference: React.FC<SmartLabReferenceProps> = ({ content, navigateTo }) => {
  const { isRTL } = usePreferences();
  const {
    t,
    search,
    setSearch,
    activeCategory,
    setActiveCategory,
    categories,
    filteredTests,
    selectedId,
    selectedTest,
    openDetails,
    closeDetails,
    unitSystem,
    setUnitSystem,
    value,
    setValue,
    getAnalysis,
    formatRangeFor,
  } = useSmartLabReference();

  const analysis = selectedId ? getAnalysis() : null;

  const gridRangeFor = useMemo(
    () => (test: LabTestData) => formatRangeFor(test, unitSystem),
    [formatRangeFor, unitSystem]
  );

  return (
    <div className={`max-w-6xl mx-auto px-4 ${isRTL ? 'font-cairo' : ''} relative`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Background Kinetic Effects */}
      <div className="absolute top-0 inset-inline-end-0 w-[500px] h-[500px] bg-gold-500/5 blur-[120px] rounded-full animate-float-slow -z-10"></div>
      <div className="absolute bottom-0 inset-inline-start-0 w-[500px] h-[500px] bg-blue-500/5 blur-[120px] rounded-full animate-float-slow -z-10 [animation-delay:-4s]"></div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-start mb-12 relative"
      >
        <div className="mb-4">
          <BrandLogo className="text-2xl md:text-3xl" onClick={() => navigateTo(Page.HOME)} />
        </div>
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ repeat: Infinity, duration: 5 }}
          className="inline-flex items-center justify-center p-4 mb-6 rounded-2xl bg-gold-500/10 border-2 border-gold-500/20 shadow-xl backdrop-blur-3xl animate-glow"
        >
          <Beaker className="w-8 h-8 text-gold-500 animate-pulse" />
        </motion.div>
        <h1 className="text-4xl md:text-6xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-br from-zinc-900 via-gold-600 to-zinc-900 dark:from-white dark:via-gold-400 dark:to-white animate-text-flash tracking-tighter">
          {t(LAB_UI.title)}
        </h1>
        <p className="text-lg md:text-xl text-zinc-500 max-w-3xl font-bold italic animate-glow text-start">
          {t(LAB_UI.subtitle)}
        </p>
      </motion.div>

      {/* ── System Guide: Reference Engine ── */}
      <div className="mb-10">
        <SystemGuideCard
          isAr={isRTL}
          icon={Sparkles}
          title={{
            ar: 'محرك التفسير المخبري الذكي',
            en: 'Smart Lab Interpretation Engine',
          }}
          subtitle={{
            ar: 'مكتبة سريرية كاملة + محول وحدات + خطة عمل لكل انحراف',
            en: 'Full clinical database + unit converter + an action plan for every deviation',
          }}
          intro={{
            ar: 'تعمل هذه الموسوعة على قاعدة بيانات سريرية ثنائية اللغة ومحرك رياضيات نقي يحوّل الوحدات ويقيّم القيم بدقة:',
            en: 'This encyclopedia runs on a bilingual clinical database and a pure math engine that converts units and evaluates values with precision:',
          }}
          items={[
            {
              icon: FlaskConical,
              title: {
                ar: '1. قاعدة بيانات ثنائية اللغة شاملة',
                en: '1. Comprehensive Bilingual Database',
              },
              body: {
                ar: 'أكثر من ٩٠ مؤشراً حيوياً عبر ٨ فئات سريرية (هرمونات، كبد وكلى، قلب ودم، فيتامينات، معادن، درقية، التهاب، عظام).',
                en: '90+ biomarkers across 8 clinical categories (hormones, liver & kidney, heart & blood, vitamins, minerals, thyroid, inflammation, bone).',
              },
            },
            {
              icon: ArrowRightLeft,
              title: {
                ar: '2. وحدات مزدوجة دقيقة (SI/US)',
                en: '2. Precise Dual Units (SI/US)',
              },
              body: {
                ar: 'كل مؤشر مخزّن بالنظامين مع معاملات تحويل دقيقة — تبديل فوري للقيم والنطاقات دون انحراف في الأرقام.',
                en: 'Every marker stores both systems with exact conversion factors — instant value & range switching with zero rounding drift.',
              },
            },
            {
              icon: Activity,
              title: {
                ar: '3. تقييم فوري مع شريط بصري',
                en: '3. Instant Evaluation with Visual Gauge',
              },
              body: {
                ar: 'قارن قيمتك بالنطاق المرجعي واحصل على التصنيف (منخفض / مثالي / مرتفع) مع مؤشر بصري لموقعك داخل النطاق.',
                en: 'Compare your value against the reference range and get a low / normal / high verdict with a visual position gauge.',
              },
            },
            {
              icon: ShieldCheck,
              title: {
                ar: '4. خطط عمل طبية ورياضية',
                en: '4. Medical & Athletic Action Plans',
              },
              body: {
                ar: 'لكل انحراف: الأسباب العلمية، الأعراض والآثار، وخطة عمل منسقة تضبط الدواء والمكملات والتدريب.',
                en: 'For every deviation: scientific causes, symptoms & effects, and a coordinated plan tuning drugs, supplements and training.',
              },
            },
          ]}
        />
      </div>

      {/* AdSlot: Search Top */}
      <div className="mb-10">
        <AdPlaceholder slotId="lab_search_top" format="horizontal" content={content} />
      </div>

      {/* Search + Unit System Control */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="space-y-6 mb-8"
      >
        <div className="relative group max-w-2xl mx-auto">
          <div className="absolute -inset-1.5 bg-gradient-to-r from-gold-500 via-blue-500 to-purple-600 rounded-3xl blur-lg opacity-20 group-hover:opacity-100 transition duration-700 animate-pulse"></div>
          <div className="relative bg-white dark:bg-background/90 rounded-2xl border-2 border-zinc-100 dark:border-zinc-800 shadow-xl overflow-hidden flex items-center p-1.5 backdrop-blur-2xl">
            <Search className={`absolute inset-inline-start-6 w-6 h-6 text-zinc-300 group-hover:text-gold-500 transition-colors`} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t(LAB_UI.searchPlaceholder)}
              className={`w-full bg-transparent py-4 ps-16 pe-6 outline-none text-xl font-black tracking-tight placeholder-zinc-400`}
            />
          </div>
        </div>

        {/* Unit System Toggle */}
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-1 p-1.5 rounded-2xl bg-zinc-100/80 dark:bg-background/80 border border-zinc-200 dark:border-zinc-800 backdrop-blur-xl shadow-inner">
            <UnitToggleButton
              active={unitSystem === 'metric'}
              onClick={() => setUnitSystem('metric')}
              label={t(LAB_UI.metric)}
            />
            <UnitToggleButton
              active={unitSystem === 'imperial'}
              onClick={() => setUnitSystem('imperial')}
              label={t(LAB_UI.imperial)}
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap justify-center gap-2.5">
          <CategoryPill
            active={activeCategory === 'all'}
            onClick={() => setActiveCategory('all')}
            icon={FlaskConical}
            label={t(LAB_UI.allMarkers)}
            count={categories.reduce((sum, c) => sum + c.count, 0)}
          />
          {categories.map(cat => {
            const Icon = CATEGORY_ICONS[cat.icon] || FlaskConical;
            return (
              <CategoryPill
                key={cat.id}
                active={activeCategory === cat.id}
                onClick={() => setActiveCategory(cat.id)}
                icon={Icon}
                label={t(cat.label)}
                count={cat.count}
              />
            );
          })}
        </div>
      </motion.div>

      {/* AdSlot: Above Grid */}
      <div className="mb-12">
        <AdPlaceholder slotId="lab_grid_top" format="horizontal" content={content} />
      </div>

      {/* Test Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredTests.map((test, idx) => {
            const CategoryIcon = CATEGORY_ICONS_BY_ID[test.category] || FlaskConical;
            const highHint = t(test.high.causes[0]);
            const lowHint = t(test.low.causes[0]);
            return (
              <motion.button
                layout
                key={test.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: idx * 0.02 }}
                onClick={() => openDetails(test.id)}
                className="group relative bg-white dark:bg-zinc-900/60 p-5 rounded-3xl border border-zinc-200 dark:border-zinc-800 hover:border-gold-500/50 transition-all duration-300 shadow-sm hover:shadow-2xl hover:-translate-y-0.5 overflow-hidden backdrop-blur-xl text-start cursor-pointer"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-gold-500/[0.03] via-transparent to-blue-500/[0.03] pointer-events-none"></div>

                <div className="flex items-start gap-4 relative">
                  <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-gold-500/10 rounded-2xl text-gold-500 group-hover:scale-110 group-hover:rotate-3 transition-transform">
                    <CategoryIcon className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h3 className="text-sm font-black tracking-tight text-zinc-900 dark:text-white truncate">{t(test.name)}</h3>
                      <span className="text-[8px] font-black text-gold-600 dark:text-gold-500 uppercase tracking-widest bg-gold-500/5 px-2 py-0.5 rounded-lg border border-gold-500/10 shrink-0 whitespace-nowrap">
                        {gridRangeFor(test)}
                      </span>
                    </div>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold leading-tight line-clamp-2 mb-3">
                      {t(test.description)}
                    </p>

                    <div className="flex gap-2">
                      <HintChip
                        icon={TrendingUp}
                        tone="rose"
                        label={t(LAB_UI.highTitle)}
                        text={highHint}
                      />
                      <HintChip
                        icon={TrendingDown}
                        tone="sky"
                        label={t(LAB_UI.lowTitle)}
                        text={lowHint}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-4 relative">
                  <span className="inline-flex items-center gap-2 py-2.5 px-4 rounded-xl bg-zinc-900 dark:bg-zinc-800 text-white font-black text-[9px] uppercase tracking-[0.2em] shadow-md w-full justify-center group-hover:bg-gold-500 group-hover:text-black transition-all duration-300">
                    <ScanSearch className="w-3.5 h-3.5" />
                    {t(LAB_UI.analyzeBtn)}
                  </span>
                </div>
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filteredTests.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-40 bg-zinc-50 dark:bg-background/50 rounded-[4rem] border-4 border-dashed border-zinc-200 dark:border-zinc-800 mt-20"
        >
          <div className="w-32 h-32 bg-zinc-100 dark:bg-card rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-inner animate-bounce">
            <Search className="w-14 h-14 text-zinc-300 dark:text-zinc-600" />
          </div>
          <p className="text-zinc-500 font-black text-2xl uppercase tracking-tighter opacity-50">
            {t(LAB_UI.noResults)}
          </p>
          <button
            onClick={() => setSearch('')}
            className="mt-8 text-gold-500 font-black text-lg underline underline-offset-8 decoration-4"
          >
            {t(LAB_UI.clearSearch)}
          </button>
        </motion.div>
      )}

      {/* Detail + Analyzer Modal */}
      <AnimatePresence>
        {selectedTest && (
          <DetailModal
            test={selectedTest}
            unitSystem={unitSystem}
            setUnitSystem={setUnitSystem}
            value={value}
            setValue={setValue}
            analysis={analysis}
            closeDetails={closeDetails}
            t={t}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

/* ─────────────── Small Presentational Pieces ─────────────── */

const UnitToggleButton: React.FC<{
  active: boolean;
  onClick: () => void;
  label: string;
}> = ({ active, onClick, label }) => (
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.96 }}
    onClick={onClick}
    className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
      active
        ? 'bg-gold-500 text-black shadow-lg shadow-gold-500/30'
        : 'text-zinc-500 dark:text-zinc-400 hover:text-gold-500'
    }`}
  >
    {active ? <Globe className="w-3.5 h-3.5" /> : <Ruler className="w-3.5 h-3.5" />}
    {label}
  </motion.button>
);

const CategoryPill: React.FC<{
  active: boolean;
  onClick: () => void;
  icon: React.ElementType;
  label: string;
  count: number;
}> = ({ active, onClick, icon: Icon, label, count }) => (
  <motion.button
    whileHover={{ scale: 1.04 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border-2 transition-all duration-500 shadow-lg ${
      active
        ? 'bg-gold-500 border-gold-500 text-black font-black shadow-gold-500/30'
        : 'bg-zinc-100/50 dark:bg-background/50 border-transparent text-zinc-500 dark:text-zinc-400 hover:border-gold-500/40 hover:text-gold-500 backdrop-blur-xl'
    }`}
  >
    <Icon className={`w-4 h-4 ${active ? 'text-black' : 'text-zinc-400'}`} />
    <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
    <span
      className={`text-[8px] font-black px-1.5 py-0.5 rounded-md ${
        active ? 'bg-black/15 text-black' : 'bg-zinc-500/10 text-zinc-400'
      }`}
    >
      {count}
    </span>
  </motion.button>
);

const HintChip: React.FC<{
  icon: React.ElementType;
  tone: 'rose' | 'sky';
  label: string;
  text: string;
}> = ({ icon: Icon, tone, label, text }) => (
  <div
    className={`flex-1 min-w-0 flex items-center gap-2 p-2 rounded-xl border ${
      tone === 'rose' ? 'bg-rose-500/5 border-rose-500/10' : 'bg-sky-500/5 border-sky-500/10'
    }`}
  >
    <Icon className={`w-3 h-3 ${tone === 'rose' ? 'text-rose-500' : 'text-sky-500'} shrink-0`} />
    <span
      className={`text-[7px] ${tone === 'rose' ? 'text-rose-500/80' : 'text-sky-500/80'} font-black uppercase tracking-widest shrink-0`}
    >
      {label}
    </span>
    <p className="text-[9px] text-zinc-500 dark:text-zinc-400 font-bold truncate">{text}</p>
  </div>
);

/* ─────────────── Detail Modal ─────────────── */

interface DetailModalProps {
  test: LabTestData;
  unitSystem: LabUnitSystem;
  setUnitSystem: (system: LabUnitSystem) => void;
  value: string;
  setValue: (val: string) => void;
  analysis: ReturnType<ReturnType<typeof useSmartLabReference>['getAnalysis']> | null;
  closeDetails: () => void;
  t: (text: BilingualText) => string;
}

const DetailModal: React.FC<DetailModalProps> = ({
  test,
  unitSystem,
  setUnitSystem,
  value,
  setValue,
  analysis,
  closeDetails,
  t,
}) => {
  const CategoryIcon = CATEGORY_ICONS_BY_ID[test.category] || FlaskConical;
  const statusMeta = analysis ? STATUS_META[analysis.status] : null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-8"
      role="dialog"
      aria-modal="true"
    >
      <motion.div
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        onClick={closeDetails}
      />
      <motion.div
        initial={{ opacity: 0, y: 60, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 60, scale: 0.98 }}
        transition={{ type: 'spring', damping: 28, stiffness: 260 }}
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white dark:bg-zinc-950 rounded-t-[2.5rem] md:rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-2xl"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-2xl border-b border-zinc-100 dark:border-zinc-800 p-5 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex-shrink-0 w-11 h-11 flex items-center justify-center bg-gold-500/10 rounded-2xl text-gold-500">
              <CategoryIcon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-xl md:text-2xl font-black tracking-tighter text-zinc-900 dark:text-white truncate">
                {t(test.name)}
              </h2>
              <p className="text-[10px] font-black uppercase tracking-widest text-gold-600 dark:text-gold-500">
                {t(test.description)}
              </p>
            </div>
          </div>
          <button
            onClick={closeDetails}
            aria-label={t(LAB_UI.close)}
            className="flex-shrink-0 p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-rose-500/15 hover:text-rose-500 text-zinc-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 md:p-6 space-y-6">
          {/* Unit Toggle + Reference Range */}
          <div className="rounded-3xl bg-zinc-50 dark:bg-background/40 border border-zinc-200 dark:border-zinc-800 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-zinc-700 dark:text-zinc-300">
                <Ruler className="w-4 h-4 text-gold-500" />
                {t(LAB_UI.referenceRange)}
              </h3>
              <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-inner">
                <ModalUnitToggle
                  active={unitSystem === 'metric'}
                  onClick={() => setUnitSystem('metric')}
                  label={t(LAB_UI.metric)}
                />
                <ModalUnitToggle
                  active={unitSystem === 'imperial'}
                  onClick={() => setUnitSystem('imperial')}
                  label={t(LAB_UI.imperial)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {(['si', 'us'] as const).map(system => {
                const isActive = (system === 'si') === (unitSystem === 'metric');
                const slice = system === 'si' ? test.range.si : test.range.us;
                return (
                  <div
                    key={system}
                    className={`rounded-2xl p-4 border-2 transition-all duration-300 ${
                      isActive
                        ? 'bg-gold-500/10 border-gold-500/40 shadow-lg shadow-gold-500/10'
                        : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 opacity-70'
                    }`}
                  >
                    <p className="text-[8px] font-black uppercase tracking-widest text-zinc-400 mb-1">
                      {system === 'si' ? t(LAB_UI.metric) : t(LAB_UI.imperial)}
                    </p>
                    <p className="text-lg font-black tracking-tight text-zinc-900 dark:text-white">
                      {formatLabNumber(slice.min, slice.decimals)} – {formatLabNumber(slice.max, slice.decimals)}{' '}
                      <span className="text-sm text-gold-600 dark:text-gold-500">{slice.unit}</span>
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Value Analyzer */}
          <div className="rounded-3xl bg-zinc-50 dark:bg-background/40 border border-zinc-200 dark:border-zinc-800 p-5">
            <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-zinc-700 dark:text-zinc-300 mb-4">
              <Activity className="w-4 h-4 text-gold-500" />
              {t(LAB_UI.analyzeBtn)}
            </h3>

            <div className="flex items-stretch gap-2 mb-4">
              <div className="flex-1 relative">
                <input
                  type="number"
                  value={value}
                  onChange={e => setValue(e.target.value)}
                  placeholder={t(LAB_UI.enterValue)}
                  className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-4 py-3.5 text-2xl font-black outline-none focus:border-gold-500 shadow-inner text-center"
                />
                <span className="absolute inset-inline-end-4 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase tracking-widest text-zinc-400 pointer-events-none">
                  {unitSystem === 'metric' ? test.range.si.unit : test.range.us.unit}
                </span>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {analysis && statusMeta ? (
                <motion.div
                  key="verdict"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className={`rounded-2xl border p-4 ${statusMeta.bg} ${statusMeta.border}`}
                >
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <span className={`flex items-center gap-2 text-sm font-black uppercase tracking-widest ${statusMeta.text}`}>
                      <statusMeta.icon className="w-5 h-5" />
                      {t(LAB_UI[statusMeta.labelKey])}
                    </span>
                    <span className="text-xs font-black text-zinc-500 dark:text-zinc-400">
                      {analysis.value} {analysis.range.unit}
                    </span>
                  </div>

                  {/* Position gauge */}
                  <div className="relative">
                    <div className="relative h-2.5 rounded-full bg-gradient-to-r from-sky-400 via-emerald-400 to-rose-400 opacity-60">
                      <motion.div
                        initial={false}
                        animate={{ left: `${Math.max(2, Math.min(98, analysis.position * 100))}%` }}
                        transition={{ type: 'spring', damping: 24, stiffness: 220 }}
                        className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 rounded-full border-[3px] border-white dark:border-zinc-950 shadow-xl bg-gradient-to-br ${statusMeta.bar}`}
                      />
                    </div>
                    <div className="flex justify-between text-[9px] font-black text-zinc-400 mt-1.5">
                      <span>
                        {formatLabNumber(analysis.range.min, analysis.range.decimals)} {analysis.range.unit}
                      </span>
                      <span className="text-gold-600 dark:text-gold-500">
                        {t(LAB_UI.resultVsRange)}
                      </span>
                      <span>
                        {formatLabNumber(analysis.range.max, analysis.range.decimals)} {analysis.range.unit}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.p
                  key="hint"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center text-xs font-bold text-zinc-400"
                >
                  {t(LAB_UI.enterValue)}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* High / Low Direction Panels */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(Object.keys(DIRECTION_META) as Array<'high' | 'low'>).map(direction => {
              const meta = DIRECTION_META[direction];
              const data = test[direction];
              const Icon = meta.icon;
              return (
                <div
                  key={direction}
                  className={`rounded-3xl border p-5 ${
                    direction === 'high'
                      ? 'bg-rose-500/[0.04] border-rose-500/15'
                      : 'bg-sky-500/[0.04] border-sky-500/15'
                  }`}
                >
                  <h3
                    className={`flex items-center gap-2 text-sm font-black uppercase tracking-widest mb-4 ${
                      direction === 'high' ? 'text-rose-500' : 'text-sky-500'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {t(LAB_UI[meta.labelKey])}
                  </h3>
                  <DirectionSection icon={Info} title={t(LAB_UI.causes)} items={data.causes} t={t} />
                  <DirectionSection
                    icon={Activity}
                    title={t(LAB_UI.symptoms)}
                    items={data.symptoms}
                    t={t}
                  />
                  <DirectionSection
                    icon={CheckCircle2}
                    title={t(LAB_UI.actionPlan)}
                    items={data.advice}
                    t={t}
                  />
                </div>
              );
            })}
          </div>

          {/* Disclaimer */}
          <div className="flex items-start gap-3 rounded-2xl bg-zinc-100/80 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 p-4">
            <Info className="w-4 h-4 text-zinc-400 mt-0.5 shrink-0" />
            <p className="text-[10px] font-bold text-zinc-400 leading-relaxed">
              {t({
                en: 'Educational reference only — not medical advice. Always consult a qualified physician before changing any protocol or medication.',
                ar: 'مرجع تعليمي فقط وليس استشارة طبية. استشر طبيبك دائماً قبل تعديل أي بروتوكول أو دواء.',
              })}
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const ModalUnitToggle: React.FC<{
  active: boolean;
  onClick: () => void;
  label: string;
}> = ({ active, onClick, label }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all duration-300 ${
      active
        ? 'bg-gold-500 text-black shadow'
        : 'text-zinc-400 hover:text-gold-500'
    }`}
  >
    {label}
  </button>
);

const DirectionSection: React.FC<{
  icon: React.ElementType;
  title: string;
  items: BilingualText[];
  t: (text: BilingualText) => string;
}> = ({ icon: Icon, title, items, t }) => (
  <div className="mb-4 last:mb-0">
    <p className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mb-2">
      <Icon className="w-3 h-3" />
      {title}
    </p>
    <ul className="space-y-1.5">
      {items.map((item, idx) => (
        <li
          key={idx}
          className="flex items-start gap-2 text-[11px] font-bold text-zinc-600 dark:text-zinc-300 leading-relaxed"
        >
          <span className="mt-1.5 w-1 h-1 rounded-full bg-gold-500 shrink-0" />
          {t(item)}
        </li>
      ))}
    </ul>
  </div>
);

export default SmartLabReference;
