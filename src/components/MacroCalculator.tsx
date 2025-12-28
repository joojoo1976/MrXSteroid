import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BicepsFlexed, Utensils, Droplet, ChefHat, RefreshCw, Calculator, Flame, Activity, Zap, TrendingUp, Info, Clock, Heart, Award, Scale, Ruler, User } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { ContentStrings, Language, DailyMeal } from '../types';

interface MacroCalculatorProps {
  content: ContentStrings;
  lang: Language;
  unitSystem?: 'metric' | 'imperial';
}

interface CalcResult {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  bmr: number;
  tdee: number;
  bmi: number;
  tef: number;
  growthPotential: number;
}

// --- Kinetic Counter ---
const KineticCounter = ({ value, duration = 2, decimals = 0, suffix = "" }: { value: number; duration?: number; decimals?: number; suffix?: string }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    const increment = end / (duration * 60);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setDisplayValue(end);
        clearInterval(timer);
      } else {
        setDisplayValue(start);
      }
    }, 16);
    return () => clearInterval(timer);
  }, [value, duration]);

  return <span>{displayValue.toFixed(decimals).toLocaleString()}{suffix}</span>;
};

const MacroCalculator: React.FC<MacroCalculatorProps> = ({ content, lang, unitSystem = 'metric' }) => {
  const isAr = lang === 'ar';
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('male');
  const [activity, setActivity] = useState('moderate');
  const [goal, setGoal] = useState('maintain');
  const [trainingTime, setTrainingTime] = useState('afternoon');
  const [result, setResult] = useState<CalcResult | null>(null);
  const [mealPlan, setMealPlan] = useState<DailyMeal[] | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const isImperial = unitSystem === 'imperial';

  // --- FOOD DATABASE ---
  const foodDatabase = [
    { id: 'chicken', nameEn: 'Grilled Chicken Breast', nameAr: 'صدور دجاج مشوية', p: 31, c: 0, f: 3.6, type: 'protein' },
    { id: 'beef', nameEn: 'Lean Ground Beef (95%)', nameAr: 'لحم بقري قليل الدسم', p: 26, c: 0, f: 6, type: 'protein' },
    { id: 'egg_whites', nameEn: 'Egg Whites', nameAr: 'بياض بيض', p: 11, c: 0.7, f: 0.2, type: 'protein' },
    { id: 'whey', nameEn: 'Whey Protein Scoop', nameAr: 'واي بروتين (سكوب)', p: 24, c: 3, f: 1, type: 'protein' },
    { id: 'fish', nameEn: 'White Fish (Tilapia)', nameAr: 'سمك أبيض (بلطي)', p: 26, c: 0, f: 2, type: 'protein' },
    { id: 'salmon', nameEn: 'Salmon Fillet', nameAr: 'سلمون', p: 20, c: 0, f: 13, type: 'protein' },
    { id: 'rice', nameEn: 'White Rice (Cooked)', nameAr: 'أرز أبيض مسلوق', p: 2.7, c: 28, f: 0.3, type: 'carb' },
    { id: 'oats', nameEn: 'Oats', nameAr: 'شوفان', p: 16, c: 66, f: 7, type: 'carb' },
    { id: 'potato', nameEn: 'Potato (Baked)', nameAr: 'بطاطس مسلوقة/مشوية', p: 2, c: 17, f: 0.1, type: 'carb' },
    { id: 'sweet_potato', nameEn: 'Sweet Potato', nameAr: 'بطاطا حلوة', p: 1.6, c: 20, f: 0.1, type: 'carb' },
    { id: 'pasta', nameEn: 'Pasta (Cooked)', nameAr: 'مكرونة مسلوقة', p: 5, c: 30, f: 1, type: 'carb' },
    { id: 'olive_oil', nameEn: 'Olive Oil', nameAr: 'زيت زيتون', p: 0, c: 0, f: 100, type: 'fat' },
    { id: 'almonds', nameEn: 'Almonds', nameAr: 'لوز', p: 21, c: 22, f: 50, type: 'fat' },
    { id: 'avocado', nameEn: 'Avocado', nameAr: 'أفوكادو', p: 2, c: 9, f: 15, type: 'fat' },
    { id: 'pb', nameEn: 'Peanut Butter', nameAr: 'زبدة فول سوداني', p: 25, c: 20, f: 50, type: 'fat' }
  ];

  const calculate = () => {
    let w = parseFloat(weight);
    let h = parseFloat(height);
    const a = parseFloat(age);
    if (!w || !h || !a) return;

    setIsCalculating(true);
    setResult(null);

    setTimeout(() => {
      if (isImperial) {
        w = w * 0.453592;
        h = h * 2.54;
      }

      const bmr = 10 * w + 6.25 * h - 5 * a + (gender === 'male' ? 5 : -161);
      const multipliers: Record<string, number> = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, veryActive: 1.9 };
      const tdee = bmr * multipliers[activity];
      const goals: Record<string, number> = { cut: 0.8, maintain: 1, bulk: 1.15 };
      const targetCalories = Math.round(tdee * goals[goal]);

      let protein = Math.round(w * 2.2);
      let fat = Math.round((targetCalories * 0.25) / 9);
      let carbs = Math.round((targetCalories - (protein * 4 + fat * 9)) / 4);

      if (carbs < 10) {
        carbs = Math.max(0, carbs);
        fat = Math.max(Math.round(w * 0.6), Math.round((targetCalories * 0.2) / 9));
        protein = Math.max(20, Math.round((targetCalories - (fat * 9) - (carbs * 4)) / 4));
      }

      const bmi = w / ((h / 100) * (h / 100));
      const potential = 50 + (goal === 'bulk' ? 30 : 0) + (activity.includes('Active') ? 15 : 0);

      setResult({
        calories: targetCalories,
        protein,
        carbs,
        fats: fat,
        bmr: Math.round(bmr),
        tdee: Math.round(tdee),
        bmi: parseFloat(bmi.toFixed(1)),
        tef: Math.round(targetCalories * 0.1),
        growthPotential: Math.min(potential, 98)
      });
      setIsCalculating(false);
      setMealPlan(null);
    }, 2000);
  };

  const generatePlan = () => {
    if (!result) return;
    const meals: DailyMeal[] = [];
    const targetP = result.protein / 4;
    const targetC = result.carbs / 4;
    const targetF = result.fats / 4;

    content.calcMealNames.forEach((name) => {
      const pSource = foodDatabase.filter(f => f.type === 'protein')[Math.floor(Math.random() * 6)];
      const cSource = foodDatabase.filter(f => f.type === 'carb')[Math.floor(Math.random() * 5)];
      const fSource = foodDatabase.filter(f => f.type === 'fat')[Math.floor(Math.random() * 4)];

      const unit = isImperial ? "oz" : "g";
      const factor = isImperial ? 0.0352 : 1;

      meals.push({
        mealName: name,
        foods: [
          { item: isAr ? pSource.nameAr : pSource.nameEn, amount: `${Math.round((targetP / pSource.p) * 100 * factor)}${unit}` },
          { item: isAr ? cSource.nameAr : cSource.nameEn, amount: `${Math.round((targetC / cSource.c) * 100 * factor)}${unit}` },
          { item: isAr ? fSource.nameAr : fSource.nameEn, amount: `${Math.round((targetF / fSource.f) * 100 * factor)}${unit}` },
        ]
      });
    });
    setMealPlan(meals);
  };

  return (
    <div className={`max-w-7xl mx-auto px-4 py-16 ${isAr ? 'font-cairo' : ''}`} dir={isAr ? 'rtl' : 'ltr'}>

      {/* Background kinetic effects */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gold-500/5 blur-[120px] rounded-full animate-float-slow -z-10"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/5 blur-[120px] rounded-full animate-float-slow -z-10 [animation-delay:-4s]"></div>

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
        <h1 className="text-5xl md:text-8xl font-black mb-6 bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 via-gold-600 to-zinc-900 dark:from-white dark:via-gold-400 dark:to-white animate-text-flash tracking-tighter">
          {content.calcTitle}
        </h1>
        <p className="text-2xl md:text-3xl text-zinc-500 max-w-3xl mx-auto font-bold italic animate-glow">
          {content.calcSubtitle}
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-12 gap-12 items-start">
        {/* --- INPUT PANEL --- */}
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          className="lg:col-span-5 bg-white dark:bg-zinc-900/40 p-10 rounded-[4rem] border-4 border-zinc-100 dark:border-zinc-800 shadow-3xl space-y-10 lg:sticky lg:top-32 card-shine backdrop-blur-3xl animate-glow"
        >
          <div className="flex gap-4 p-2 bg-zinc-100 dark:bg-black rounded-[2rem] shadow-inner">
            <button onClick={() => setGender('male')} className={`flex-1 py-5 rounded-2xl text-base font-black transition-all flex items-center justify-center gap-3 ${gender === 'male' ? 'bg-white dark:bg-zinc-800 shadow-2xl text-gold-600' : 'text-zinc-400'}`}>
              <User className="w-5 h-5" /> {content.calcMale}
            </button>
            <button onClick={() => setGender('female')} className={`flex-1 py-5 rounded-2xl text-base font-black transition-all flex items-center justify-center gap-3 ${gender === 'female' ? 'bg-white dark:bg-zinc-800 shadow-2xl text-gold-600' : 'text-zinc-400'}`}>
              <User className="w-5 h-5" /> {content.calcFemale}
            </button>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div className="space-y-4">
              <label className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-2"><Clock className="w-3 h-3" /> {content.calcAge}</label>
              <input type="number" value={age} onChange={e => setAge(e.target.value)} className="w-full bg-zinc-50 dark:bg-black border-2 border-transparent focus:border-gold-500 rounded-2xl p-6 text-2xl font-black text-center outline-none transition-all shadow-inner" placeholder="25" />
            </div>
            <div className="space-y-4">
              <label className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-2"><Scale className="w-3 h-3" /> {isImperial ? 'LB' : 'KG'}</label>
              <input type="number" value={weight} onChange={e => setWeight(e.target.value)} className="w-full bg-zinc-50 dark:bg-black border-2 border-transparent focus:border-gold-500 rounded-2xl p-6 text-2xl font-black text-center outline-none transition-all shadow-inner" placeholder={isImperial ? "175" : "80"} />
            </div>
            <div className="space-y-4">
              <label className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-2"><Ruler className="w-3 h-3" /> {isImperial ? 'IN' : 'CM'}</label>
              <input type="number" value={height} onChange={e => setHeight(e.target.value)} className="w-full bg-zinc-50 dark:bg-black border-2 border-transparent focus:border-gold-500 rounded-2xl p-6 text-2xl font-black text-center outline-none transition-all shadow-inner" placeholder={isImperial ? "70" : "180"} />
            </div>
          </div>

          <div className="space-y-4">
            <label htmlFor="activity-select" className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400">{content.calcActivity}</label>
            <select id="activity-select" title={content.calcActivity} value={activity} onChange={e => setActivity(e.target.value)} className="w-full bg-zinc-50 dark:bg-black border-2 border-transparent focus:border-gold-500 rounded-[1.5rem] p-6 text-xl font-bold outline-none cursor-pointer appearance-none shadow-inner">
              {Object.entries(content.calcActivityLevels).map(([k, v]) => <option key={k} value={k}>{v as string}</option>)}
            </select>
          </div>

          <div className="space-y-4">
            <label htmlFor="goal-select" className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400">{content.calcGoal}</label>
            <select id="goal-select" title={content.calcGoal} value={goal} onChange={e => setGoal(e.target.value)} className="w-full bg-zinc-50 dark:bg-black border-2 border-transparent focus:border-gold-500 rounded-[1.5rem] p-6 text-xl font-bold outline-none cursor-pointer appearance-none shadow-inner">
              {Object.entries(content.calcSelectGoal).map(([k, v]) => <option key={k} value={k}>{v as string}</option>)}
            </select>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={calculate}
            disabled={isCalculating}
            className={`w-full py-8 bg-gold-500 hover:bg-gold-400 text-black font-black text-2xl rounded-[2rem] shadow-[0_0_40px_rgba(234,179,8,0.3)] transition-all flex items-center justify-center gap-4 relative overflow-hidden group animate-glow`}
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
                className="space-y-10"
              >
                {/* Main Stats Hub */}
                <div className={`p-12 rounded-[4rem] border-4 border-zinc-100 dark:border-zinc-800 shadow-3xl relative overflow-hidden card-shine animate-glow group bg-zinc-950 text-white`}>
                  <div className="absolute top-0 right-0 w-80 h-80 bg-gold-500/10 rounded-full blur-[100px] animate-float-slow"></div>

                  <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-12">
                    <div className="text-center md:text-left">
                      <h3 className="text-sm font-black text-gold-500 uppercase tracking-[0.4em] mb-6 flex items-center justify-center md:justify-start gap-3">
                        <Flame className="w-5 h-5 animate-pulse" /> {content.calcCalories}
                      </h3>
                      <div className="text-8xl font-black tracking-tighter mb-4 animate-text-flash font-mono">
                        <KineticCounter value={result.calories} />
                      </div>
                      <div className="inline-flex items-center gap-3 px-6 py-2 bg-white/5 rounded-full border border-white/10">
                        <Activity className="w-4 h-4 text-green-500 animate-ping" />
                        <span className="text-xs font-black uppercase tracking-widest">{content.calcMetabolicActiveLabel}</span>
                      </div>
                    </div>

                    <div className="w-64 h-64 relative group/chart">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'P', value: result.protein * 4, fill: '#EAB308' },
                              { name: 'C', value: result.carbs * 4, fill: '#3b82f6' },
                              { name: 'F', value: result.fats * 9, fill: '#ef4444' },
                            ]}
                            innerRadius={70}
                            outerRadius={100}
                            paddingAngle={8}
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
                        <Zap className="w-10 h-10 text-gold-500 animate-pulse" />
                        <span className="text-[10px] font-black uppercase text-zinc-500 mt-2">Bio-Fuel</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-16 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-black text-zinc-500 uppercase tracking-widest">{content.calcAnabolicPotentialLabel}</span>
                      <span className="text-2xl font-black text-gold-500 font-mono">{result.growthPotential}%</span>
                    </div>
                    <div className="h-6 bg-black/50 rounded-full p-1 border-2 border-white/5 shadow-inner relative overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-red-600 via-orange-500 to-gold-600 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${result.growthPotential}%` }}
                        transition={{ duration: 2, ease: "easeOut" }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                    </div>
                  </div>
                </div>

                {/* Macro Detail Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {[
                    { label: content.calcProtein, val: result.protein, colorClass: "text-yellow-500", icon: BicepsFlexed, desc: "Muscle Tissue Synthesis" },
                    { label: content.calcCarbs, val: result.carbs, colorClass: "text-blue-500", icon: Utensils, desc: "Glycogen Super-compensation" },
                    { label: content.calcFats, val: result.fats, colorClass: "text-red-500", icon: Droplet, desc: "Hormonal Optimization" }
                  ].map((item, i) => (
                    <motion.div
                      whileHover={{ y: -10 }}
                      key={i}
                      className="p-10 rounded-[3rem] bg-white dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 shadow-2xl relative overflow-hidden group"
                    >
                      <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-20 transition-all group-hover:scale-150 rotate-12">
                        <item.icon className="w-24 h-24" />
                      </div>
                      <h4 className={`text-sm font-black uppercase tracking-[0.2em] mb-4 ${item.colorClass}`}>{item.label}</h4>
                      <div className="text-6xl font-black tracking-tighter mb-2 font-mono">
                        <KineticCounter value={item.val} />
                        <span className="text-xl text-zinc-400 ml-2">{isImperial ? 'OZ' : 'G'}</span>
                      </div>
                      <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest">{item.desc}</p>
                    </motion.div>
                  ))}
                </div>

                {/* AI Plan Generation */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={generatePlan}
                  className="w-full py-8 bg-zinc-950 text-white rounded-[2.5rem] font-black text-2xl uppercase tracking-widest shadow-3xl flex items-center justify-center gap-6 group relative overflow-hidden card-shine animate-glow"
                >
                  <ChefHat className="w-10 h-10 group-hover:rotate-12 transition-transform" />
                  {mealPlan ? content.calcShuffleLabel : content.calcGenerateMealPlan}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
                </motion.button>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full min-h-[600px] bg-zinc-50 dark:bg-zinc-900/20 rounded-[4rem] border-4 border-dashed border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center text-center p-20 animate-glow"
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 4 }}
                  className="w-32 h-32 bg-zinc-100 dark:bg-zinc-800 rounded-[2.5rem] flex items-center justify-center mb-10 shadow-inner"
                >
                  <Calculator className="w-16 h-16 text-zinc-300 dark:text-zinc-600" />
                </motion.div>
                <h3 className="text-4xl font-black text-zinc-400 uppercase tracking-tighter mb-4">{content.calcAwaitingInputLabel}</h3>
                <p className="text-zinc-500 font-bold max-w-sm italic opacity-40">{content.calcDisclaimer}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* --- MEAL PLAN DISPLAY --- */}
      <AnimatePresence>
        {mealPlan && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-32"
          >
            <div className="text-center mb-20">
              <h3 className="text-5xl md:text-7xl font-black mb-6 tracking-tight uppercase animate-text-flash">{content.calcMealPlanTitle}</h3>
              <p className="text-2xl text-zinc-500 font-bold italic">{content.calcMealPlanSubtitle}</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {mealPlan.map((meal, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ y: -15 }}
                  className="bg-white dark:bg-zinc-900 p-10 rounded-[3rem] border-2 border-zinc-100 dark:border-zinc-800 shadow-2xl relative overflow-hidden group card-shine animate-glow"
                >
                  <div className="flex items-center gap-5 mb-10">
                    <div className="w-16 h-16 bg-gold-500 text-black rounded-3xl flex items-center justify-center font-black text-2xl shadow-xl group-hover:rotate-12 transition-transform">
                      {idx + 1}
                    </div>
                    <h4 className="font-black text-3xl tracking-tight leading-none uppercase">{meal.mealName}</h4>
                  </div>
                  <ul className="space-y-6">
                    {meal.foods.map((f, fIdx) => (
                      <li key={fIdx} className="flex flex-col gap-2 border-b-2 border-zinc-50 dark:border-zinc-800/50 pb-6 last:border-0">
                        <span className="text-zinc-500 text-sm font-black uppercase tracking-widest opacity-60">Source #{fIdx + 1}</span>
                        <span className="text-2xl font-black text-zinc-900 dark:text-white group-hover:text-gold-500 transition-colors tracking-tight">{f.item}</span>
                        <span className="inline-flex w-fit px-4 py-1.5 bg-gold-500 text-black rounded-xl font-black text-sm uppercase shadow-lg">{f.amount}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="absolute bottom-0 right-0 w-24 h-24 bg-gold-500/5 rounded-tl-full -z-10"></div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MacroCalculator;
