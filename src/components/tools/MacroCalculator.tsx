import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BicepsFlexed, Utensils, Droplet, RefreshCw, Calculator, Flame, Activity, Zap, TrendingUp, Info, Clock, Scale, User, UtensilsCrossed } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import BrandLogo from '../shared/BrandLogo';
import AdPlaceholder from '../shared/AdPlaceholder';
import KineticCounter from '../shared/KineticCounter';
import { ContentStrings, Page } from '../../types';
import { usePreferences } from '../../context/PreferencesContext';
import { UnitToggle } from '../shared/UnitToggle';
import { useMacroCalculator } from '../../features/calculators/hooks/useMacroCalculator';

interface MacroCalculatorProps {
  content: ContentStrings;
  navigateTo: (page: Page) => void;
}

const MacroCalculator: React.FC<MacroCalculatorProps> = ({ content, navigateTo }) => {
  const { language: lang, unitSystem } = usePreferences();
  const isAr = lang === 'ar';
  const isImperial = unitSystem === 'imperial';

  const {
    weight,
    handleWeightChange,
    height,
    handleHeightChange,
    age,
    setAge,
    gender,
    setGender,
    activity,
    setActivity,
    goal,
    setGoal,
    trainingTime,
    setTrainingTime,
    result,
    mealPlan,
    isCalculating,
    chartData,
    aiInsight,
    simulationData,
    ecosystemSynced,
    showMealPlan,
    setShowMealPlan,
    calculate,
    generatePlan
  } = useMacroCalculator({ content, unitSystem });

  return (
    <div className="max-w-7xl mx-auto px-4 py-16" dir={isAr ? 'rtl' : 'ltr'}>

      {/* Background kinetic effects */}
      <div className="absolute top-0 start-0 w-96 h-96 bg-gold-500/5 blur-[120px] rounded-full animate-float-slow -z-10"></div>
      <div className="absolute bottom-0 end-0 w-96 h-96 bg-zinc-700/5 blur-[120px] rounded-full animate-float-slow -z-10 [animation-delay:-4s]"></div>

      <motion.div
        initial={{ opacity: 0, y: -40 }}
        whileInView={{ opacity: 1, y: 0 }}
        className="text-center mb-24 relative"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="inline-flex items-center justify-center p-6 mb-8 rounded-[2.5rem] bg-gold-500/10 border-2 border-gold-500/20 backdrop-blur-3xl shadow-2xl animate-glow"
        >
          <Utensils className="w-12 h-12 text-gold-500 animate-pulse" />
        </motion.div>

        <div className="mb-4">
          <BrandLogo className="text-3xl md:text-5xl" onClick={() => navigateTo(Page.HOME)} />
        </div>

        <h1 className="text-5xl md:text-8xl font-black mb-6 bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 via-gold-600 to-zinc-900 dark:from-white dark:via-gold-400 dark:to-white animate-text-flash tracking-tighter">
          {content.calcTitle}
        </h1>
        <p className="text-2xl md:text-3xl text-zinc-500 max-w-3xl mx-auto font-bold italic animate-glow">
          {content.calcSubtitle}
        </p>
      </motion.div>

      {/* AdSlot: Top Banner */}
      <div className="mb-12 relative flex flex-col items-center gap-6">
        <UnitToggle className="scale-125 shadow-2xl border-white/10" />
        <AdPlaceholder slotId="macro_top_banner" format="horizontal" content={content} />
      </div>

      <div className="grid lg:grid-cols-12 gap-12 items-start">
        {/* --- INPUT PANEL --- */}
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          className="lg:col-span-5 bg-white dark:bg-zinc-950/50 p-6 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-2xl space-y-6 lg:sticky lg:top-24 backdrop-blur-xl"
        >
          {/* Ecosystem Status */}
          <AnimatePresence>
            {ecosystemSynced && content.macroEcosystem && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-xl mb-4"
              >
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">{content.macroEcosystem.syncStatus}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex gap-3 p-1.5 bg-zinc-100 dark:bg-black/40 rounded-2xl">
            <button onClick={() => setGender('male')} className={`flex-1 py-3 rounded-xl text-sm font-black transition-all flex items-center justify-center gap-2 ${gender === 'male' ? 'bg-white dark:bg-zinc-800 shadow-lg text-gold-600' : 'text-zinc-400 hover:text-zinc-300'}`}>
              <User className="w-4 h-4" /> {content.calcMale}
            </button>
            <button onClick={() => setGender('female')} className={`flex-1 py-3 rounded-xl text-sm font-black transition-all flex items-center justify-center gap-2 ${gender === 'female' ? 'bg-white dark:bg-zinc-800 shadow-lg text-gold-600' : 'text-zinc-400 hover:text-zinc-300'}`}>
              <User className="w-4 h-4 shadow-sm" /> {content.calcFemale}
            </button>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-1"><Clock className="w-3 h-3" /> {content.calcAge}</label>
              <input type="text" inputMode="numeric" value={age} onChange={e => setAge(e.target.value)} className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 focus:border-gold-500 rounded-xl p-3 text-lg font-black text-center outline-none transition-all shadow-inner h-12" placeholder="25" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest flex items-center justify-between">
                {content.calcWeight} <span className="opacity-50 text-[9px]">{isImperial ? 'lbs' : 'kg'}</span>
              </label>
              <motion.div className="relative">
                <input
                  type="text"
                  inputMode="decimal"
                  value={weight}
                  onChange={(e) => handleWeightChange(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 focus:border-gold-500 rounded-xl p-3 text-center font-mono font-black text-lg outline-none transition-all shadow-inner h-12"
                  placeholder={isImperial ? "176" : "80"}
                />
              </motion.div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest flex items-center justify-between">
                {content.calcHeight} <span className="opacity-50 text-[9px]">{isImperial ? 'in' : 'cm'}</span>
              </label>
              <motion.div className="relative">
                <input
                  type="text"
                  inputMode="decimal"
                  value={height}
                  onChange={(e) => handleHeightChange(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 focus:border-gold-500 rounded-xl p-3 text-center font-mono font-black text-lg outline-none transition-all shadow-inner h-12"
                  placeholder={isImperial ? "70" : "180"}
                />
              </motion.div>
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-gold-500" /> {content.calcActivity || 'Activity Level'}
            </label>
            <div className="grid grid-cols-1 gap-2">
              {content.calcActivityLevels && Object.entries(content.calcActivityLevels).map(([k, v]) => (
                <button
                  key={k}
                  onClick={() => setActivity(k)}
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-start ${activity === k ? 'bg-gold-500/10 border-gold-500 text-gold-500 shadow-lg shadow-gold-500/10' : 'bg-zinc-50 dark:bg-zinc-900/50 border-transparent text-zinc-500 hover:border-zinc-200 dark:hover:border-zinc-800'}`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${activity === k ? 'bg-gold-500 text-black' : 'bg-zinc-200 dark:bg-zinc-800'}`}>
                    <Activity className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-black uppercase tracking-tight leading-none mb-1">{v as string}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
              <Target className="w-3.5 h-3.5 text-gold-500" /> {content.calcGoal || 'Your Goal'}
            </label>
            <div className="grid grid-cols-1 gap-2">
              {content.calcSelectGoal && Object.entries(content.calcSelectGoal).map(([k, v]) => (
                <button
                  key={k}
                  onClick={() => setGoal(k)}
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-start ${goal === k ? 'bg-gold-500/10 border-gold-500 text-gold-500 shadow-lg shadow-gold-500/10' : 'bg-zinc-50 dark:bg-zinc-900/50 border-transparent text-zinc-500 hover:border-zinc-200 dark:hover:border-zinc-800'}`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${goal === k ? 'bg-gold-500 text-black' : 'bg-zinc-200 dark:bg-zinc-800'}`}>
                    <Trophy className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-black uppercase tracking-tight leading-none mb-1">{v as string}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-gold-500" /> {content.calcTrainingTime || 'Training Window'}
            </label>
            <div className="grid grid-cols-1 gap-2">
              {content.calcTrainingWindows && Object.entries(content.calcTrainingWindows).filter(([k]) => k !== 'advice').map(([k, v]) => (
                <button
                  key={k}
                  onClick={() => setTrainingTime(k)}
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-start ${trainingTime === k ? 'bg-gold-500/10 border-gold-500 text-gold-500 shadow-lg shadow-gold-500/10' : 'bg-zinc-50 dark:bg-zinc-900/50 border-transparent text-zinc-500 hover:border-zinc-200 dark:hover:border-zinc-800'}`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${trainingTime === k ? 'bg-gold-500 text-black' : 'bg-zinc-200 dark:bg-zinc-800'}`}>
                    <Clock className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-black uppercase tracking-tight leading-none mb-1">{v as string}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={calculate}
            disabled={isCalculating}
            className="w-full py-8 bg-gold-500 hover:bg-gold-400 text-black font-black text-2xl rounded-[2rem] shadow-[0_0_40px_rgba(234,179,8,0.3)] transition-all flex items-center justify-center gap-4 relative overflow-hidden group animate-glow"
          >
            {isCalculating ? <RefreshCw className="w-8 h-8 animate-spin" /> : <TrendingUp className="w-8 h-8 group-hover:translate-y-[-5px] transition-transform" />}
            {isCalculating ? content.calcAnalyzingLabel : content.calcCalculate}
            <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full ${isCalculating ? 'animate-shimmer' : 'group-hover:animate-shimmer'}`}></div>
          </motion.button>
        </motion.div>

        {/* --- RESULTS DASHBOARD --- */}
        <div className="lg:col-span-7">
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div
                key="results"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                {/* AI Assistant Insight (Compact) */}
                <motion.div
                  initial={{ x: 200, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="p-4 bg-gradient-to-br from-gold-500 to-gold-700 rounded-3xl text-black shadow-2xl relative overflow-hidden group"
                >
                  <div className="absolute top-0 end-0 p-2 opacity-20">
                    <Zap className="w-10 h-10 animate-pulse" />
                  </div>
                  <h4 className="text-[9px] font-black uppercase tracking-widest mb-1 flex items-center gap-2">
                    <Info className="w-3.5 h-3.5" /> {content.calcAiInsightTitle}
                  </h4>
                  <p className="text-xs font-bold leading-tight mb-2">
                    {aiInsight}
                  </p>
                  <div className="text-[8px] font-black uppercase opacity-60">
                    {content.calcPredictiveAccuracy} <span className="ms-1">{content.calcPredictiveAccuracyVal}</span>
                  </div>
                </motion.div>

                {/* Main Stats Hub (Horizontal) */}
                <div className="p-6 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-2xl relative overflow-hidden card-shine animate-glow group bg-zinc-900 text-white dark:bg-zinc-950">
                  <div className="absolute top-0 end-0 w-60 h-60 bg-gold-500/10 rounded-full blur-[80px] animate-float-slow"></div>

                  <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className={isAr ? "text-center md:text-end" : "text-center md:text-start"}>
                      <h3 className="text-[10px] font-black text-gold-500 uppercase tracking-widest mb-1 flex items-center justify-center md:justify-start gap-2">
                        <Flame className="w-3.5 h-3.5 animate-pulse" /> {content.calcCalories}
                      </h3>
                      <div className="text-5xl font-black tracking-tighter mb-1 animate-text-flash font-mono">
                        <KineticCounter value={result.calories || 0} />
                      </div>
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
                        <Activity className="w-2.5 h-2.5 text-green-500 animate-ping" />
                        <span className="text-[9px] font-black uppercase tracking-widest">{content.macroEcosystem.syncStatus}</span>
                      </div>
                    </div>

                    <div className="w-32 h-32 relative group/chart">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'P', value: (result.protein || 0) * 4, fill: '#EAB308' },
                              { name: 'C', value: (result.carbs || 0) * 4, fill: '#3b82f6' },
                              { name: 'F', value: (result.fats || 0) * 9, fill: '#ef4444' },
                            ]}
                            innerRadius={35}
                            outerRadius={60}
                            paddingAngle={6}
                            dataKey="value"
                            stroke="none"
                          >
                            <Cell fill="#EAB308" />
                            <Cell fill="#3b82f6" />
                            <Cell fill="#ef4444" />
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <Zap className="w-4 h-4 text-gold-500 animate-pulse" />
                      </div>
                    </div>
                  </div>

                  {content.calcTrainingWindows?.advice && (
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-6 p-4 bg-gold-500/10 border border-gold-500/20 rounded-2xl flex items-start gap-3"
                    >
                      <Info className="w-4 h-4 text-gold-500 shrink-0 mt-0.5" />
                      <p className="text-xs font-bold text-zinc-300">
                        {(content.calcTrainingWindows.advice as string).replace('{time}', (content.calcTrainingWindows as Record<string, string>)[trainingTime] || trainingTime)}
                      </p>
                    </motion.div>
                  )}

                  <div className="mt-8 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{content.calcAnabolicPotentialLabel}</span>
                      <span className="text-xl font-black text-gold-500 font-mono">{(result.growthPotential || 0)}%</span>
                    </div>
                    <div className="h-4 bg-black/50 rounded-full p-0.5 border border-white/5 shadow-inner relative overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-red-600 via-orange-500 to-gold-600 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${result.growthPotential || 0}%` }}
                        transition={{ duration: 2, ease: "easeOut" }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                    </div>
                  </div>
                </div>

                {/* Macro Detail Grid (Horizontal Compact Style) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { label: content.calcProtein, val: result.protein || 0, colorClass: "text-gold-500", icon: BicepsFlexed, desc: content.calcProteinDesc },
                    { label: content.calcCarbs, val: result.carbs || 0, colorClass: "text-blue-400", icon: Utensils, desc: content.calcCarbsDesc },
                    { label: content.calcFats, val: result.fats || 0, colorClass: "text-rose-500", icon: Droplet, desc: content.calcFatsDesc }
                  ].map((item, i) => (
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      key={i}
                      className="flex items-center gap-3 p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl group transition-all"
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-zinc-100 dark:bg-black/40 ${item.colorClass}`}>
                        <item.icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col items-start text-start">
                        <h4 className="text-[8px] font-black uppercase tracking-widest text-zinc-500">{item.label}</h4>
                        <div className="text-xl font-black font-mono leading-none flex items-baseline gap-1">
                          <KineticCounter value={item.val} />
                          <span className="text-[9px] text-zinc-500 font-black">{isImperial ? 'OZ' : 'G'}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>


                {/* AI Plan Generation */}
                <button
                  onClick={() => {
                    if (!mealPlan) generatePlan();
                    setShowMealPlan(!showMealPlan);
                  }}
                  className="w-full py-5 bg-zinc-900 dark:bg-zinc-800 text-gold-500 font-black text-xl rounded-3xl transition-all shadow-xl hover:scale-105 active:scale-95 flex items-center justify-center gap-4 group border-2 border-gold-500 border-dashed"
                >
                  <UtensilsCrossed className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                  {mealPlan ? (showMealPlan ? content.calcHidePlan : content.calcShowPlan) : content.calcGenerateMealPlan}
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full min-h-[600px] bg-zinc-50 dark:bg-background/20 rounded-[4rem] border-4 border-dashed border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center text-center p-20 animate-glow"
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 4 }}
                  className="w-32 h-32 bg-zinc-100 dark:bg-card rounded-[2.5rem] flex items-center justify-center mb-10 shadow-inner"
                >
                  <Calculator className="w-16 h-16 text-zinc-300 dark:text-zinc-600" />
                </motion.div>
                <h3 className="text-4xl font-black text-zinc-400 uppercase tracking-tighter mb-4">{content.calcAwaitingInputLabel}</h3>
                <p className="text-zinc-500 font-bold max-w-sm italic opacity-40">{content.calcDisclaimer}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* AdSlot: Middle of Results */}
          {result && (
            <div className="my-12">
              <AdPlaceholder slotId="macro_result_mid" format="horizontal" content={content} />
            </div>
          )}

          {/* --- PREDICTIVE SIMULATION --- */}
          <AnimatePresence>
            {simulationData && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-12 p-8 md:p-12 rounded-[3.5rem] border-4 border-zinc-100 dark:border-zinc-800 bg-black text-white shadow-3xl card-shine backdrop-blur-3xl animate-glow overflow-hidden relative"
              >
                <div className="relative z-10">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1 bg-zinc-900 dark:bg-zinc-950 p-6 rounded-3xl flex items-center gap-4 border border-zinc-800">
                      <div className="w-12 h-12 bg-gold-500/10 rounded-2xl flex items-center justify-center shrink-0">
                        <Scale className="w-6 h-6 text-gold-500" />
                      </div>
                      <div className="text-inline-start">
                        <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-1">{content.calcBmiStatusLabel}</p>
                        <p className="text-white text-lg font-black">{result.bmi.toFixed(1)} <span className="text-zinc-500 text-sm font-bold">({result.bmiStatus})</span></p>
                      </div>
                    </div>
                    <div className="flex-1 bg-zinc-900 dark:bg-zinc-950 p-6 rounded-3xl flex items-center gap-4 border border-zinc-800">
                      <div className="w-12 h-12 bg-gold-500/10 rounded-2xl flex items-center justify-center shrink-0">
                        <TrendingUp className="w-6 h-6 text-gold-500" />
                      </div>
                      <div className={isAr ? "text-end" : "text-start"}>
                        <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-1">{content.calcPredictiveAccuracy}</p>
                        <p className="text-white text-lg font-black">{content.calcPredictiveAccuracyVal}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-10 mb-10">
                    <div>
                      <h3 className="text-3xl font-black uppercase tracking-tighter flex items-center gap-4">
                        <Activity className="w-8 h-8 text-gold-500" />
                        {content.calcPredictionTitle}
                      </h3>
                      <p className="text-zinc-500 font-bold">{content.calcPatternAnalysisLabel}</p>
                    </div>
                  </div>

                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={simulationData}>
                        <defs>
                          <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#EAB308" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#EAB308" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} opacity={0.2} />
                        <XAxis dataKey="week" stroke="#555" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis hide domain={['dataMin - 5', 'dataMax + 5']} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '12px' }}
                          itemStyle={{ color: '#EAB308', fontWeight: 'bold' }}
                        />
                        <Area
                          type="monotone"
                          dataKey="weight"
                          stroke="#EAB308"
                          fillOpacity={1}
                          fill="url(#colorWeight)"
                          strokeWidth={4}
                          animationDuration={2000}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="mt-8 grid grid-cols-2 gap-4">
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                      <div className="text-xs font-black uppercase text-zinc-500 mb-1">{content.calcMetabolicEfficiencyLabel}</div>
                      <div className="text-xl font-black text-gold-500">{simulationData[simulationData.length - 1].efficiency}%</div>
                    </div>
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                      <div className="text-xs font-black uppercase text-zinc-500 mb-1">Target Convergence</div>
                      <div className="text-xl font-black text-green-500">OPTIMAL</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* --- STACKED AREA CHART (Daily Distribution) --- */}
          <AnimatePresence>
            {chartData && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-12 p-8 md:p-12 rounded-[3.5rem] border-4 border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 shadow-3xl card-shine backdrop-blur-3xl animate-glow overflow-hidden"
              >
                <h3 className="text-2xl font-black mb-10 uppercase tracking-widest text-zinc-800 dark:text-white flex items-center gap-4">
                  <TrendingUp className="w-8 h-8 text-gold-500" />
                  {content.calcDistributionTitle}
                </h3>
                <div className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={chartData}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorP" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#EAB308" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#EAB308" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorC" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorF" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} opacity={0.1} />
                      <XAxis
                        dataKey="name"
                        stroke="#888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        dy={10}
                      />
                      <YAxis
                        stroke="#888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        label={{ value: isImperial ? 'Ounces' : 'Grams', angle: -90, position: 'insideLeft', offset: 10, fill: '#666', fontSize: 10, fontWeight: 'bold' }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#000',
                          border: 'none',
                          borderRadius: '16px',
                          boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                          color: '#fff'
                        }}
                        itemStyle={{ fontWeight: 'bold' }}
                      />
                      <Area
                        type="monotone"
                        dataKey="protein"
                        name={content.calcProtein}
                        stackId="1"
                        stroke="#EAB308"
                        fillOpacity={1}
                        fill="url(#colorP)"
                        strokeWidth={4}
                      />
                      <Area
                        type="monotone"
                        dataKey="carbs"
                        name={content.calcCarbs}
                        stackId="1"
                        stroke="#3b82f6"
                        fillOpacity={1}
                        fill="url(#colorC)"
                        strokeWidth={4}
                      />
                      <Area
                        type="monotone"
                        dataKey="fats"
                        name={content.calcFats}
                        stackId="1"
                        stroke="#ef4444"
                        fillOpacity={1}
                        fill="url(#colorF)"
                        strokeWidth={4}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Meal Plan List (The BIG one) */}
          <AnimatePresence>
            {showMealPlan && mealPlan && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="mt-12 space-y-10"
              >
                <div className="text-center mb-10">
                  <h3 className="text-4xl font-black uppercase tracking-tighter mb-4 text-zinc-800 dark:text-white">
                    {content.calcMealPlanTitle}
                  </h3>
                  <div className="h-1.5 w-24 bg-gold-500 mx-auto rounded-full"></div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  {mealPlan.map((meal, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="bg-white dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 rounded-[3rem] p-8 shadow-2xl relative overflow-hidden group"
                    >
                      <div className="absolute top-0 right-0 p-8 opacity-5">
                        <ChefHat className="w-20 h-20" />
                      </div>

                      <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 bg-gold-500 rounded-2xl flex items-center justify-center text-black font-black text-xl shadow-lg">
                          {idx + 1}
                        </div>
                        <h4 className="text-2xl font-black uppercase tracking-tight text-zinc-800 dark:text-white">
                          {meal.mealName}
                        </h4>
                      </div>

                      <div className="space-y-6">
                        <div className="grid grid-cols-1 gap-3">
                          {meal.foods.map((food, fidx) => (
                            <div key={fidx} className="flex justify-between items-center p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                              <span className="font-bold text-zinc-600 dark:text-zinc-300">{food.item}</span>
                              <span className="font-black text-gold-600 dark:text-gold-400 font-mono bg-gold-500/10 px-3 py-1 rounded-lg">
                                {food.amount}
                              </span>
                            </div>
                          ))}
                        </div>

                        <div className="space-y-3 pt-4">
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-4">{content.calcPreparationStepsLabel}</p>
                          {meal.steps.map((step, sidx) => (
                            <div key={sidx} className="flex gap-4 group/step">
                              <div className="w-1.5 h-1.5 rounded-full bg-gold-500 mt-2 shrink-0 group-hover/step:scale-150 transition-transform"></div>
                              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 italic leading-relaxed">
                                {step}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="p-10 rounded-[3rem] bg-gradient-to-br from-zinc-900 to-black text-white border-2 border-gold-500/30 shadow-3xl text-center relative overflow-hidden"
                >
                  <div className="relative z-10">
                    <p className="text-gold-500 font-black uppercase tracking-[0.3em] mb-4 text-sm">{content.calcExpertAdviceLabel}</p>
                    <p className="text-lg font-bold italic leading-relaxed text-zinc-300 mb-8 max-w-2xl mx-auto">
                      "{content.calcMealAdvice}"
                    </p>
                    <div className="flex items-center justify-center gap-2 text-zinc-500 text-[10px] font-black uppercase tracking-widest">
                      <Activity className="w-4 h-4 text-gold-500" />
                      {content.calcOptimizedForStack}
                    </div>
                  </div>
                  <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_120%,rgba(234,179,8,0.1),transparent)]"></div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default MacroCalculator;
