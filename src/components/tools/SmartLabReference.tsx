import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  FlaskConical,
  Beaker,
  User,
  ShieldCheck,
  Heart,
  Droplets,
  Thermometer,
  Activity,
  Zap
} from 'lucide-react';
import BrandLogo from '../shared/BrandLogo';
import AdPlaceholder from '../shared/AdPlaceholder';
import { ContentStrings, Page } from '../../types';
import { usePreferences } from '../../context/PreferencesContext';
import { StyledBrandName } from '../shared/StyledBrandName';
import { formatLabRange } from '../../utils/logic';
import { useSmartLabReference } from '../../features/calculators/hooks/useSmartLabReference';

interface SmartLabReferenceProps {
  content: ContentStrings;
  navigateTo: (page: Page) => void;
}

const SmartLabReference: React.FC<SmartLabReferenceProps> = ({ content, navigateTo }) => {
  const { unitSystem, isRTL } = usePreferences();

  const {
    search,
    setSearch,
    analyzingId,
    setAnalyzingId,
    closeAnalysis,
    value,
    setValue,
    activeCategory,
    setActiveCategory,
    filteredTests,
    getAnalysis
  } = useSmartLabReference({ content });

  const categories = content.labReference.categories;

  const categoryIcons: Record<string, React.ElementType> = {
    all: FlaskConical,
    hormones: User,
    organs: ShieldCheck,
    blood: Heart,
    vitamins: Droplets,
    minerals: Thermometer,
    thyroid: Activity,
  };

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
          {content.labReference.title}
        </h1>
        <p className="text-lg md:text-xl text-zinc-500 max-w-2xl font-bold italic animate-glow text-start">
          {content.labReference.subtitle}
        </p>
      </motion.div>

      {/* AdSlot: Search Top */}
      <div className="mb-10">
        <AdPlaceholder slotId="lab_search_top" format="horizontal" content={content} />
      </div>

      {/* Search and Filter Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="space-y-6 mb-12"
      >
        <div className="relative group max-w-2xl mx-auto">
          <div className="absolute -inset-1.5 bg-gradient-to-r from-gold-500 via-blue-500 to-purple-600 rounded-3xl blur-lg opacity-20 group-hover:opacity-100 transition duration-700 animate-pulse"></div>
          <div className="relative bg-white dark:bg-background/90 rounded-2xl border-2 border-zinc-100 dark:border-zinc-800 shadow-xl overflow-hidden flex items-center p-1.5 backdrop-blur-2xl">
            <Search className={`absolute inset-inline-start-6 w-6 h-6 text-zinc-300 group-hover:text-gold-500 transition-colors`} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={content.labReference.searchPlaceholder}
              className={`w-full bg-transparent py-4 ps-16 pe-6 outline-none text-xl font-black tracking-tight placeholder-zinc-400`}
            />
          </div>
        </div>

        {/* Dynamic Category Tabs */}
        <div className="flex flex-wrap justify-center gap-3 py-2 px-2">
          {Object.entries(categories).map(([key, label]) => {
            const Icon = categoryIcons[key] || FlaskConical;
            const IsActive = activeCategory === key;
            return (
              <motion.button
                key={key}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveCategory(key)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl border-2 transition-all duration-500 shadow-lg ${IsActive
                  ? 'bg-gold-500 border-gold-500 text-black font-black shadow-gold-500/30'
                  : 'bg-zinc-100/50 dark:bg-background/50 border-transparent text-zinc-500 dark:text-zinc-400 hover:border-gold-500/40 hover:text-gold-500 backdrop-blur-xl'
                  }`}
              >
                <Icon className={`w-5 h-5 ${IsActive ? 'text-black' : 'text-zinc-400 group-hover:text-gold-500'}`} />
                <span className="text-xs font-black uppercase tracking-widest">{label}</span>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* AdSlot: Above Grid */}
      <div className="mb-12">
        <AdPlaceholder slotId="lab_grid_top" format="horizontal" content={content} />
      </div>

      {/* Lab Tests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <AnimatePresence mode="popLayout">
          {filteredTests.map((test, idx) => {
            const isAnalyzing = analyzingId === test.id;
            const { range, unit: displayUnit, min: convMin, max: convMax } = formatLabRange(test.min, test.max, test.unit, unitSystem || 'metric');
            const activeTest = { ...test, min: convMin, max: convMax };
            const analysis = isAnalyzing ? getAnalysis(activeTest) : null;
            const CategoryIcon = categoryIcons[test.category as keyof typeof categoryIcons] || FlaskConical;

            return (
              <motion.div
                layout
                key={test.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: idx * 0.02 }}
                className="group relative bg-white dark:bg-zinc-900/60 p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-gold-500/50 transition-all duration-300 shadow-sm hover:shadow-xl overflow-hidden backdrop-blur-xl"
              >
                <div className="flex items-center gap-4">
                  {/* Icon Column */}
                  <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-gold-500/10 rounded-xl text-gold-500 group-hover:scale-110 transition-transform">
                    <CategoryIcon className="w-6 h-6" />
                  </div>

                  {/* Info Column */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <h3 className="text-sm font-black tracking-tight text-zinc-900 dark:text-white truncate">{test.name}</h3>
                      <span className="text-[8px] font-black text-gold-600 dark:text-gold-500 uppercase tracking-widest bg-gold-500/5 px-1.5 py-0.5 rounded border border-gold-500/10 shrink-0">
                        {range} {displayUnit}
                      </span>
                    </div>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold leading-tight line-clamp-1 mb-2">
                      {test.description}
                    </p>

                    <div className="flex gap-2">
                      {/* High Meaning */}
                      <div className="flex-1 flex items-center gap-2 p-1.5 bg-red-500/5 rounded-lg border border-red-500/10">
                        <Thermometer className="w-2.5 h-2.5 text-red-500 shrink-0" />
                        <span className="text-[8px] text-red-500/80 font-black uppercase tracking-widest shrink-0">{content.labReference.labels.high}</span>
                        <p className="text-[9px] text-zinc-500 dark:text-zinc-400 font-bold truncate">
                          {test.elevationMeaning}
                        </p>
                      </div>
                      {/* Low Meaning */}
                      <div className="flex-1 flex items-center gap-2 p-1.5 bg-blue-500/5 rounded-lg border border-blue-500/10">
                        <Droplets className="w-2.5 h-2.5 text-blue-500 shrink-0" />
                        <span className="text-[8px] text-blue-500/80 font-black uppercase tracking-widest shrink-0">{content.labReference.labels.low}</span>
                        <p className="text-[9px] text-zinc-500 dark:text-zinc-400 font-bold truncate">
                          {test.lowMeaning}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-auto pt-3">
                  {!isAnalyzing ? (
                    <motion.button
                      key="analyze-btn"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setAnalyzingId(test.id)}
                      className="w-full py-2.5 rounded-xl bg-zinc-900 dark:bg-zinc-800 text-white font-black text-[9px] uppercase tracking-[0.2em] shadow-md transition-all flex items-center justify-center gap-2 relative overflow-hidden group/btn border border-white/5 active:scale-95"
                    >
                      <FlaskConical className="w-3.5 h-3.5 group-hover/btn:rotate-12 transition-transform" />
                      {content.labReference.analyzeBtn}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:animate-shimmer"></div>
                    </motion.button>
                  ) : (
                    <motion.div
                      key="analyze-interface"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 rounded-xl bg-zinc-50 dark:bg-background/40 border border-zinc-200 dark:border-zinc-800 relative"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-black text-[8px] uppercase tracking-widest text-gold-500 flex items-center gap-1.5">
                          <Zap className="w-2.5 h-2.5 fill-gold-500" />
                          {content.labReference.analyzeTitle}
                        </h4>
                        <button
                          type="button"
                          aria-label={content.labClose}
                          onClick={closeAnalysis}
                          className="p-1 rounded-md bg-zinc-200 dark:bg-zinc-800 hover:bg-red-500/20 text-zinc-500 hover:text-red-500 transition-colors"
                        >
                          <div className="w-2 h-2 relative">
                            <div className="absolute inset-0 m-auto w-full h-0.5 bg-current rotate-45"></div>
                            <div className="absolute inset-0 m-auto w-full h-0.5 bg-current -rotate-45"></div>
                          </div>
                        </button>
                      </div>

                      <div className="relative mb-2">
                        <input
                          type="number"
                          value={value}
                          onChange={(e) => setValue(e.target.value)}
                          placeholder={content.labReference.enterValue}
                          autoFocus
                          className="w-full bg-white dark:bg-background border border-zinc-100 dark:border-zinc-800 rounded-lg px-2 py-1.5 text-lg font-black outline-none focus:border-gold-500 shadow-inner"
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 font-black text-zinc-300 dark:text-zinc-600 uppercase tracking-widest text-[8px] pointer-events-none">
                          {displayUnit}
                        </div>
                      </div>

                      <AnimatePresence>
                        {analysis && (
                          <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className={`p-2.5 rounded-lg ${analysis.bg} ${analysis.border} border ${analysis.color} flex flex-col items-center justify-center text-center`}
                          >
                            <div className="mb-1">
                              <analysis.icon className="w-5 h-5" />
                            </div>
                            <span className="text-base font-black uppercase tracking-tighter mb-0.5">
                              <StyledBrandName text={analysis.text} />
                            </span>
                            <div className="flex items-center gap-1">
                              <span className="text-[7px] font-black opacity-60 uppercase tracking-widest">
                                {content.labReference.resultLabel}
                              </span>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )}
                </div>
              </motion.div>
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
          <p className="text-zinc-500 font-black text-3xl uppercase tracking-tighter opacity-50">
            {content.labReference.noResults || "NO ENCRYPTED MATCHES FOUND"}
          </p>
          <button onClick={() => setSearch('')} className="mt-8 text-gold-500 font-black text-lg underline underline-offset-8 decoration-4">{content.labRestartScan}</button>
        </motion.div>
      )}
    </div>
  );
};

export default SmartLabReference;
