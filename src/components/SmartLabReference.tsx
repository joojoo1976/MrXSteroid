import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Info, AlertCircle, CheckCircle2, FlaskConical, Thermometer, ShieldCheck, Heart, Droplets, User, Activity, Zap, Beaker } from 'lucide-react';
import { ContentStrings, LabTest } from '../types';

interface SmartLabReferenceProps {
  content: ContentStrings;
  isRTL?: boolean;
}

const SmartLabReference: React.FC<SmartLabReferenceProps> = ({ content, isRTL }) => {
  const [search, setSearch] = useState('');
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [value, setValue] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

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

  const filteredTests = useMemo(() => {
    return content.labReference.tests.filter(test => {
      const matchesSearch = test.name.toLowerCase().includes(search.toLowerCase()) ||
        test.id.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = activeCategory === 'all' || test.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [content.labReference.tests, search, activeCategory]);

  const getAnalysis = (test: LabTest) => {
    const val = parseFloat(value);
    if (isNaN(val)) return null;
    if (val < test.min) return { text: content.labReference.status.low, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/30', shadow: 'shadow-blue-500/20', icon: AlertCircle };
    if (val > test.max) return { text: content.labReference.status.high, color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/30', shadow: 'shadow-red-500/20', icon: AlertCircle };
    return { text: content.labReference.status.normal, color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/30', shadow: 'shadow-green-500/20', icon: CheckCircle2 };
  };

  return (
    <div className={`max-w-6xl mx-auto px-4 ${isRTL ? 'font-cairo' : ''} relative`} dir={isRTL ? 'rtl' : 'ltr'}>

      {/* Background Kinetic Elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gold-500/5 blur-[120px] rounded-full animate-float-slow -z-10"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 blur-[120px] rounded-full animate-float-slow -z-10" style={{ animationDelay: '-4s' }}></div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-20 relative"
      >
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ repeat: Infinity, duration: 5 }}
          className="inline-flex items-center justify-center p-6 mb-8 rounded-[2rem] bg-gold-500/10 border-2 border-gold-500/20 shadow-2xl backdrop-blur-3xl animate-glow"
        >
          <Beaker className="w-12 h-12 text-gold-500 animate-pulse" />
        </motion.div>
        <h1 className="text-5xl md:text-8xl font-black mb-6 bg-clip-text text-transparent bg-gradient-to-br from-zinc-900 via-gold-600 to-zinc-900 dark:from-white dark:via-gold-400 dark:to-white animate-text-flash tracking-tighter">
          {content.labReference.title}
        </h1>
        <p className="text-xl md:text-3xl text-zinc-500 max-w-3xl mx-auto font-bold italic animate-glow">
          {content.labReference.subtitle}
        </p>
      </motion.div>

      {/* Search and Filter Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="space-y-10 mb-20"
      >
        <div className="relative group max-w-3xl mx-auto">
          <div className="absolute -inset-2 bg-gradient-to-r from-gold-500 via-blue-500 to-purple-600 rounded-[2.5rem] blur-xl opacity-20 group-hover:opacity-100 transition duration-700 animate-pulse"></div>
          <div className="relative bg-white dark:bg-zinc-900/90 rounded-[2rem] border-2 border-zinc-100 dark:border-zinc-800 shadow-2xl overflow-hidden flex items-center p-2 backdrop-blur-2xl">
            <Search className={`absolute ${isRTL ? 'right-8' : 'left-8'} w-8 h-8 text-zinc-300 group-hover:text-gold-500 transition-colors`} />
            <input
              type="text"
              value={search}
              onChange={e => { setSearch(e.target.value); setAnalyzingId(null); }}
              placeholder={content.labReference.searchPlaceholder}
              className={`w-full bg-transparent py-6 ${isRTL ? 'pr-20 pl-8' : 'pl-20 pr-8'} outline-none text-2xl font-black tracking-tight placeholder-zinc-400`}
            />
          </div>
        </div>

        {/* Dynamic Category Tabs */}
        <div className="flex flex-wrap justify-center gap-4 py-4 px-4">
          {Object.entries(categories).map(([key, label], index) => {
            const Icon = categoryIcons[key] || FlaskConical;
            const IsActive = activeCategory === key;
            return (
              <motion.button
                key={key}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => { setActiveCategory(key); setAnalyzingId(null); }}
                className={`flex items-center gap-3 px-8 py-4 rounded-2xl border-2 transition-all duration-500 shadow-xl ${IsActive
                  ? 'bg-gold-500 border-gold-500 text-black font-black shadow-gold-500/30 animate-glow'
                  : 'bg-zinc-100/50 dark:bg-zinc-900/50 border-transparent text-zinc-500 dark:text-zinc-400 hover:border-gold-500/40 hover:text-gold-500 backdrop-blur-xl'
                  }`}
              >
                <Icon className={`w-6 h-6 ${IsActive ? 'text-black' : 'text-zinc-400 group-hover:text-gold-500'}`} />
                <span className="text-sm font-black uppercase tracking-widest">{label}</span>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Lab Tests Grid */}
      <div className="grid gap-10">
        <AnimatePresence mode="popLayout">
          {filteredTests.map((test, idx) => {
            const isAnalyzing = analyzingId === test.id;
            const analysis = isAnalyzing ? getAnalysis(test) : null;

            return (
              <motion.div
                layout
                key={test.id}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: idx * 0.05 }}
                className="group relative bg-white/80 dark:bg-zinc-900/80 p-10 rounded-[4rem] border-2 border-zinc-100 dark:border-zinc-800 hover:border-gold-500/50 transition-all duration-500 shadow-2xl overflow-hidden card-shine backdrop-blur-3xl animate-glow"
              >
                <div className="relative z-10">
                  <div className="flex flex-col lg:flex-row justify-between items-start gap-10 mb-10">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-4">
                        <span className="px-4 py-1.5 rounded-xl bg-gold-500/10 text-xs font-black text-gold-600 dark:text-gold-500 uppercase tracking-[0.2em] border border-gold-500/20">
                          {categories[test.category as keyof typeof categories] || test.category}
                        </span>
                        <div className="w-2 h-2 rounded-full bg-gold-500 animate-pulse"></div>
                        <span className="text-xs text-zinc-400 font-black font-mono tracking-widest uppercase opacity-50">ID: {test.id}</span>
                      </div>
                      <h3 className="text-4xl font-black tracking-tight text-zinc-900 dark:text-white mb-4">{test.name}</h3>
                      <p className="text-xl text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed italic">
                        {test.description}
                      </p>
                    </div>

                    <div className={`text-center ${isRTL ? 'lg:text-left' : 'lg:text-right'} p-8 rounded-[2.5rem] bg-zinc-950 text-white border-2 border-white/5 shadow-2xl min-w-[240px] animate-glow`}>
                      <div className="text-5xl font-black text-gold-500 font-mono tracking-tighter mb-2 animate-text-flash">
                        {test.range}
                      </div>
                      <div className="text-xs text-zinc-500 font-black uppercase tracking-[0.3em] flex items-center justify-center lg:justify-end gap-2">
                        <Activity className="w-4 h-4 text-gold-500" />
                        {test.unit}
                      </div>
                    </div>
                  </div>

                  {/* High/Low Explanations */}
                  <div className="grid md:grid-cols-2 gap-6 mb-12">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="p-8 rounded-[2.5rem] bg-red-500/5 border-2 border-red-500/10 hover:bg-red-500/10 transition-all"
                    >
                      <div className="flex items-center gap-3 mb-4 text-red-500">
                        <AlertCircle className="w-6 h-6 animate-pulse" />
                        <span className="text-sm font-black uppercase tracking-[0.2em]">{content.labReference.labels.high}</span>
                      </div>
                      <p className="text-lg text-zinc-700 dark:text-zinc-300 font-bold leading-relaxed">{test.elevationMeaning}</p>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="p-8 rounded-[2.5rem] bg-blue-500/5 border-2 border-blue-500/10 hover:bg-blue-500/10 transition-all"
                    >
                      <div className="flex items-center gap-3 mb-4 text-blue-500">
                        <AlertCircle className="w-6 h-6 animate-pulse" />
                        <span className="text-sm font-black uppercase tracking-[0.2em]">{content.labReference.labels.low}</span>
                      </div>
                      <p className="text-lg text-zinc-700 dark:text-zinc-300 font-bold leading-relaxed">{test.lowMeaning}</p>
                    </motion.div>
                  </div>

                  {/* AI Lab Analyzer Integration */}
                  <AnimatePresence mode="wait">
                    {!isAnalyzing ? (
                      <motion.button
                        key="analyze-btn"
                        whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(255,255,255,0.1)" }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => { setAnalyzingId(test.id); setValue(''); }}
                        className="w-full py-6 rounded-[2rem] bg-zinc-900 dark:bg-white text-white dark:text-black font-black text-lg uppercase tracking-[0.3em] shadow-2xl transition-all flex items-center justify-center gap-4 relative overflow-hidden group"
                      >
                        <FlaskConical className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                        {content.labReference.analyzeBtn}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
                      </motion.button>
                    ) : (
                      <motion.div
                        key="analyze-interface"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-10 rounded-[3rem] bg-zinc-50 dark:bg-black/40 border-4 border-dashed border-zinc-200 dark:border-zinc-800 relative"
                      >
                        <div className="flex justify-between items-center mb-10">
                          <h4 className="font-black text-sm uppercase tracking-[0.4em] text-gold-500 flex items-center gap-3">
                            <Zap className="w-5 h-5 fill-gold-500" />
                            {content.labReference.analyzeTitle}
                          </h4>
                          <motion.button
                            whileHover={{ rotate: 90, scale: 1.2 }}
                            onClick={() => setAnalyzingId(null)}
                            className="p-3 rounded-full bg-zinc-200 dark:bg-zinc-800 hover:bg-red-500/20 text-zinc-500 hover:text-red-500 transition-colors"
                          >
                            <div className="w-6 h-0.5 bg-current rotate-45 translate-y-0.5"></div>
                            <div className="w-6 h-0.5 bg-current -rotate-45 -translate-y-0.5"></div>
                          </motion.button>
                        </div>

                        <div className="relative mb-10 group/input">
                          <div className="absolute -inset-1 bg-gradient-to-r from-gold-500 to-amber-500 rounded-3xl blur opacity-0 group-focus-within/input:opacity-30 transition-opacity"></div>
                          <input
                            type="number"
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            placeholder={content.labReference.enterValue}
                            autoFocus
                            className="w-full bg-white dark:bg-zinc-900 border-4 border-zinc-100 dark:border-zinc-800 rounded-3xl px-8 py-6 text-4xl font-black outline-none focus:border-gold-500 shadow-inner transition-all relative z-10"
                          />
                          <div className="absolute right-8 top-1/2 -translate-y-1/2 font-black text-zinc-300 dark:text-zinc-600 uppercase tracking-widest text-xl pointer-events-none z-20">
                            {test.unit}
                          </div>
                        </div>

                        <AnimatePresence>
                          {analysis && (
                            <motion.div
                              initial={{ scale: 0.8, opacity: 0, rotateX: 45 }}
                              animate={{ scale: 1, opacity: 1, rotateX: 0 }}
                              className={`p-10 rounded-[2.5rem] ${analysis.bg} ${analysis.border} border-4 ${analysis.color} ${analysis.shadow} shadow-2xl flex flex-col items-center justify-center text-center animate-glow`}
                            >
                              <motion.div
                                animate={{
                                  scale: [1, 1.3, 1],
                                  rotate: [0, 15, -15, 0]
                                }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                className="mb-6"
                              >
                                <analysis.icon className="w-16 h-16" />
                              </motion.div>
                              <span className="text-5xl font-black uppercase tracking-tighter mb-3 animate-text-flash">
                                {analysis.text}
                              </span>
                              <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-current animate-ping"></div>
                                <span className="text-xs font-black opacity-60 uppercase tracking-[0.3em]">
                                  {content.labReference.resultLabel}
                                </span>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    )}
                  </AnimatePresence>
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
          className="text-center py-40 bg-zinc-50 dark:bg-zinc-900/50 rounded-[4rem] border-4 border-dashed border-zinc-200 dark:border-zinc-800 mt-20"
        >
          <div className="w-32 h-32 bg-zinc-100 dark:bg-zinc-800 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-inner animate-bounce">
            <Search className="w-14 h-14 text-zinc-300 dark:text-zinc-600" />
          </div>
          <p className="text-zinc-500 font-black text-3xl uppercase tracking-tighter opacity-50">
            {content.labReference.noResults || "NO ENCRYPTED MATCHES FOUND"}
          </p>
          <button onClick={() => { setSearch(''); setActiveCategory('all'); }} className="mt-8 text-gold-500 font-black text-lg underline underline-offset-8 decoration-4">RE-START SCAN</button>
        </motion.div>
      )}
    </div>
  );
};

export default SmartLabReference;
