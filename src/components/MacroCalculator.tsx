import React, { useState, useEffect, useRef } from 'react';
import { BicepsFlexed, Utensils, Droplet, ChefHat, RefreshCw, Calculator, Flame, Activity, Zap, TrendingUp, Info, Clock, Heart, Award } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { ContentStrings, Language, DailyMeal, MealItem } from '../types';

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
  growthPotential: number; // 0-100
}

// --- Animation Components ---
const CountUp: React.FC<{ value: number; duration?: number }> = ({ value, duration = 1000 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [value, duration]);

  return <>{count.toLocaleString()}</>;
};

const FloatingIcon: React.FC<{ children: React.ReactNode; color: string }> = ({ children, color }) => (
  <div className={`transition-transform duration-300 hover:scale-125 hover:rotate-12 cursor-pointer ${color}`}>
    {children}
  </div>
);

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
  // const isAr = lang === Language.AR; // Removed unused variable

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

    // Simulate AI processing
    setTimeout(() => {
      if (isImperial) {
        w = w * 0.453592; // lb to kg
        h = h * 2.54;     // inch to cm
      }

      const bmr = 10 * w + 6.25 * h - 5 * a + (gender === 'male' ? 5 : -161);
      const multipliers: any = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, veryActive: 1.9 };
      const tdee = bmr * multipliers[activity];

      const goals: any = { cut: 0.8, maintain: 1, bulk: 1.15 };
      const targetCalories = Math.round(tdee * goals[goal]);

      const protein = Math.round(w * 2.2);
      const fat = Math.round((targetCalories * 0.25) / 9);
      const carbs = Math.round((targetCalories - (protein * 4 + fat * 9)) / 4);

      const bmi = w / ((h / 100) * (h / 100));
      const tef = targetCalories * 0.1; // 10% estimation

      // Calculate "Growth Potential" based on activity, calories vs TDEE, and protein
      let potential = 50;
      if (goal === 'bulk') potential += 30;
      if (activity === 'active' || activity === 'veryActive') potential += 15;
      if (protein / w > 1.8) potential += 5;
      potential = Math.min(potential, 98); // Max 98% because there is always room

      setResult({
        calories: targetCalories,
        protein,
        carbs,
        fats: fat,
        bmr: Math.round(bmr),
        tdee: Math.round(tdee),
        bmi: parseFloat(bmi.toFixed(1)),
        tef: Math.round(tef),
        growthPotential: potential
      });
      setIsCalculating(false);
      setMealPlan(null);
    }, 1500);
  };

  const generatePlan = () => {
    if (!result) return;
    const meals: DailyMeal[] = [];
    const targetP = result.protein / 4;
    const targetC = result.carbs / 4;
    const targetF = result.fats / 4;

    const proteins = foodDatabase.filter(f => f.type === 'protein');
    const carbs = foodDatabase.filter(f => f.type === 'carb');
    const fats = foodDatabase.filter(f => f.type === 'fat');

    const mealNames = content.calcMealNames;

    mealNames.forEach((name) => {
      const pSource = proteins[Math.floor(Math.random() * proteins.length)];
      const cSource = carbs[Math.floor(Math.random() * carbs.length)];
      const fSource = fats[Math.floor(Math.random() * fats.length)];

      let pAmount: number | string = pSource.p > 0 ? Math.round((targetP / pSource.p) * 100) : 0;
      let cAmount: number | string = cSource.c > 0 ? Math.round((targetC / cSource.c) * 100) : 0;
      let fAmount: number | string = fSource.f > 0 ? Math.round((targetF / fSource.f) * 100) : 0;

      let unit = "g";
      if (isImperial) {
        pAmount = (parseFloat(pAmount.toString()) * 0.00220462).toFixed(2);
        cAmount = (parseFloat(cAmount.toString()) * 0.00220462).toFixed(2);
        fAmount = (parseFloat(fAmount.toString()) * 0.00220462).toFixed(2);
        unit = "lb";
      }

      meals.push({
        mealName: name,
        foods: [
          { item: isAr ? pSource.nameAr : pSource.nameEn, amount: `${pAmount}${unit}` },
          { item: isAr ? cSource.nameAr : cSource.nameEn, amount: `${cAmount}${unit}` },
          { item: isAr ? fSource.nameAr : fSource.nameEn, amount: `${fAmount}${unit}` },
        ]
      });
    });
    setMealPlan(meals);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-12 animate-fade-in">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gold-500/10 text-gold-500 rounded-full text-sm font-bold mb-4 border border-gold-500/20">
          <Zap className="w-4 h-4" /> {content.calcAiEngineLabel}
        </div>
        <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">{content.calcTitle}</h1>
        <p className="text-zinc-500 text-lg max-w-2xl mx-auto">{content.calcSubtitle}</p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* --- INPUT PANEL --- */}
        <div className="lg:col-span-5 bg-white dark:bg-zinc-900/50 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-2xl border border-zinc-200 dark:border-zinc-800 space-y-6 h-fit sticky top-24">
          <div className="flex gap-4 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-2xl">
            <button onClick={() => setGender('male')} className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${gender === 'male' ? 'bg-white dark:bg-zinc-700 shadow-xl text-gold-600 dark:text-gold-400' : 'text-zinc-500'}`}>{content.calcMale}</button>
            <button onClick={() => setGender('female')} className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${gender === 'female' ? 'bg-white dark:bg-zinc-700 shadow-xl text-gold-600 dark:text-gold-400' : 'text-zinc-500'}`}>{content.calcFemale}</button>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-black text-zinc-400">{content.calcAge}</label>
              <input type="number" value={age} onChange={e => setAge(e.target.value)} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 text-center font-black focus:border-gold-500 outline-none transition-all" placeholder="25" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-black text-zinc-400">{content.calcWeight} ({isImperial ? 'lb' : content.units.mg === 'מ״ג' ? 'ק״ג' : 'kg'})</label>
              <input type="number" value={weight} onChange={e => setWeight(e.target.value)} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 text-center font-black focus:border-gold-500 outline-none transition-all" placeholder={isImperial ? "175" : "80"} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-black text-zinc-400">{content.calcHeight} ({isImperial ? 'in' : content.units.mg === 'מ״ג' ? 'ס״מ' : 'cm'})</label>
              <input type="number" value={height} onChange={e => setHeight(e.target.value)} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 text-center font-black focus:border-gold-500 outline-none transition-all" placeholder={isImperial ? "70" : "180"} />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-black text-zinc-400">{content.calcActivity}</label>
            <select title={content.calcActivity} value={activity} onChange={e => setActivity(e.target.value)} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 font-bold outline-none cursor-pointer hover:border-gold-500/50 transition-colors">
              {Object.entries(content.calcActivityLevels).map(([k, v]) => <option key={k} value={k}>{v as string}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-black text-zinc-400">{content.calcGoal}</label>
            <select title={content.calcGoal} value={goal} onChange={e => setGoal(e.target.value)} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 font-bold outline-none cursor-pointer hover:border-gold-500/50 transition-colors">
              {Object.entries(content.calcSelectGoal).map(([k, v]) => <option key={k} value={k}>{v as string}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-black text-zinc-400">{content.calcTrainingTime}</label>
            <select title={content.calcTrainingTime} value={trainingTime} onChange={e => setTrainingTime(e.target.value)} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 font-bold outline-none cursor-pointer hover:border-gold-500/50 transition-colors">
              <option value="morning">{content.calcTrainingWindows.morning}</option>
              <option value="afternoon">{content.calcTrainingWindows.afternoon}</option>
              <option value="evening">{content.calcTrainingWindows.evening}</option>
            </select>
          </div>

          <button
            onClick={calculate}
            disabled={isCalculating}
            className={`w-full py-5 bg-gold-500 hover:bg-gold-400 text-black font-black text-lg rounded-2xl shadow-2xl shadow-gold-500/20 transition-all flex items-center justify-center gap-3 active:scale-95 ${isCalculating ? 'opacity-50' : 'hover:-translate-y-1'}`}
          >
            {isCalculating ? <RefreshCw className="w-6 h-6 animate-spin text-black" /> : <TrendingUp className="w-6 h-6" />}
            {isCalculating ? content.calcAnalyzingLabel : content.calcCalculate}
          </button>
        </div>

        {/* --- RESULTS DASHBOARD --- */}
        <div className="lg:col-span-7">
          {result ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
              {/* Main Calories Card */}
              <div className={`relative p-10 rounded-[3rem] overflow-hidden border border-zinc-800 shadow-2xl transition-all duration-1000 ${goal === 'bulk' ? 'bg-zinc-900 animate-pulse-background' : 'bg-black'}`}>
                {/* Heartbeat pattern background if Bulk */}
                {goal === 'bulk' && (
                  <div className="absolute inset-0 opacity-10 flex items-center justify-center pointer-events-none">
                    <Heart className="w-96 h-96 text-gold-500 animate-ping" />
                  </div>
                )}

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                  <div className="flex-1 flex flex-col md:flex-row items-center gap-8">
                    <div>
                      <h3 className="text-zinc-500 font-bold uppercase tracking-widest text-sm mb-4 flex items-center gap-2">
                        <Flame className="w-4 h-4 text-orange-500" /> {content.calcResults}
                      </h3>
                      <div className="text-7xl font-black text-white tracking-tighter mb-2">
                        <CountUp value={result.calories} />
                      </div>
                      <p className="text-gold-500 font-black tracking-widest">{content.calcCalories} / {content.units.ed}</p>
                    </div>

                    {/* Pie Chart Visualization */}
                    <div className="w-40 h-40 hidden sm:block">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Protein', value: result.protein * 4, fill: '#3b82f6' },
                              { name: 'Carbs', value: result.carbs * 4, fill: '#a855f7' },
                              { name: 'Fats', value: result.fats * 9, fill: '#f59e0b' },
                            ]}
                            innerRadius={50}
                            outerRadius={70}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="bg-zinc-800/50 backdrop-blur-md p-6 rounded-3xl border border-zinc-700 w-full md:w-auto text-center md:text-left">
                    <p className="text-zinc-400 text-xs font-black uppercase mb-2">{content.calcBeastTitle}</p>
                    <div className="text-2xl font-black text-gold-400 mb-1 flex items-center justify-center md:justify-start gap-2">
                      <Award className="w-6 h-6" /> {goal === 'cut' ? content.calcBeastNames.cut : goal === 'bulk' ? content.calcBeastNames.bulk : content.calcBeastNames.maintain}
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-[10px] font-bold">
                      <Activity className="w-3 h-3" /> {content.calcMetabolicActiveLabel}
                    </div>
                  </div>
                </div>

                {/* Progress Bar: Muscle Growth Potential */}
                <div className="mt-12 space-y-3">
                  <div className="flex justify-between text-xs font-black tracking-tighter">
                    <span className="text-zinc-500 uppercase">{content.calcAnabolicPotentialLabel}</span>
                    <span className="text-gold-500">{result.growthPotential}%</span>
                  </div>
                  <div className="h-4 bg-zinc-800 rounded-full overflow-hidden p-1 shadow-inner">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-red-600 via-orange-500 to-gold-500 shadow-[0_0_20px_rgba(234,179,8,0.4)] transition-all duration-1000 ease-out animate-pulse dynamic-width"
                      style={{ "--dynamic-width": `${result.growthPotential}%` } as React.CSSProperties}
                    />
                  </div>
                </div>
              </div>

              {/* Macro Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { label: content.calcProtein, value: result.protein, icon: <BicepsFlexed className="w-6 h-6" />, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20", unit: isImperial ? 'oz' : content.units.g, factor: isImperial ? 0.035274 : 1 },
                  { label: content.calcCarbs, value: result.carbs, icon: <Utensils className="w-6 h-6" />, color: "text-purple-500", bg: "bg-purple-500/10", border: "border-purple-500/20", unit: isImperial ? 'oz' : content.units.g, factor: isImperial ? 0.035274 : 1 },
                  { label: content.calcFats, value: result.fats, icon: <Droplet className="w-6 h-6" />, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20", unit: isImperial ? 'oz' : content.units.g, factor: isImperial ? 0.035274 : 1 },
                ].map((item, idx) => (
                  <div key={idx} className={`p-6 rounded-[2rem] border ${item.border} ${item.bg} group transition-all duration-300 hover:scale-105 active:scale-95 cursor-default relative overflow-hidden`}>
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 group-hover:rotate-12 transition-all group-hover:scale-150">
                      {item.icon}
                    </div>
                    <p className={`text-xs font-black uppercase tracking-widest ${item.color} mb-3`}>{item.label}</p>
                    <div className="text-4xl font-black tracking-tighter mb-1">
                      <CountUp value={Math.round(item.value * item.factor)} />
                      <span className="text-lg opacity-50 ml-1 font-bold">{item.unit}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Advanced Data Dashboard */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] p-8 shadow-xl">
                <h4 className="flex items-center gap-2 font-black text-lg mb-8 uppercase tracking-tight">
                  <Activity className="w-5 h-5 text-gold-500" /> {content.calcAnalysisLabel}
                </h4>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="space-y-1">
                    <p className="text-[10px] text-zinc-500 font-black uppercase flex items-center gap-1">
                      BMR <span title="Basal Metabolic Rate"><Info className="w-3 h-3 cursor-help" /></span>
                    </p>
                    <p className="text-xl font-black"><CountUp value={result.bmr} /></p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-zinc-500 font-black uppercase flex items-center gap-1">
                      TDEE <span title="Total Daily Energy Expenditure"><Info className="w-3 h-3 cursor-help" /></span>
                    </p>
                    <p className="text-xl font-black text-gold-500"><CountUp value={result.tdee} /></p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-zinc-500 font-black uppercase">{content.calcBmiStatusLabel}</p>
                    <p className={`text-xl font-black ${result.bmi < 18.5 || result.bmi > 25 ? 'text-red-500' : 'text-green-500'}`}>{result.bmi}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-zinc-500 font-black uppercase">{content.calcTefLabel}</p>
                    <p className="text-xl font-black text-orange-500">+<CountUp value={result.tef} /></p>
                  </div>
                </div>

                {/* 12 Week Prediction Section */}
                <div className="mt-10 p-6 bg-zinc-50 dark:bg-zinc-950 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-125 transition-transform">
                    <TrendingUp className="w-20 h-20" />
                  </div>
                  <h5 className="font-black text-sm uppercase tracking-widest text-gold-600 mb-3 flex items-center gap-2">
                    <Calculator className="w-4 h-4" /> {content.calcPredictionTitle}
                  </h5>
                  <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed relative z-10 font-bold">
                    {goal === 'cut' ? content.calcPredictions.cut : goal === 'bulk' ? content.calcPredictions.bulk : content.calcPredictions.maintain}
                  </p>
                </div>

                {/* Metabolic Window Section */}
                <div className="mt-6 p-6 bg-gold-500/5 rounded-[2rem] border border-gold-500/10 flex flex-col md:flex-row items-center gap-6">
                  <div className="w-14 h-14 bg-gold-500 text-black rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-gold-500/20">
                    <Clock className="w-8 h-8" />
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h5 className="font-black text-sm tracking-widest text-gold-500 mb-1">{content.calcWindowBtn}</h5>
                    <p className="text-xs text-zinc-500 font-bold">
                      {content.calcTrainingWindows.advice.replace('{time}', content.calcTrainingWindows[trainingTime as keyof typeof content.calcTrainingWindows] as string)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Meal Plan Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                {!mealPlan ? (
                  <button onClick={generatePlan} className="flex-1 py-5 bg-zinc-900 border border-zinc-700 text-white font-black rounded-3xl flex items-center justify-center gap-3 transition-all hover:bg-black hover:scale-105 active:scale-95 group">
                    <ChefHat className="w-6 h-6 group-hover:rotate-12 transition-transform" /> {content.calcGenerateMealPlan}
                  </button>
                ) : (
                  <button onClick={generatePlan} className="flex-1 py-5 bg-gold-500/10 border border-gold-500/20 text-gold-600 font-black rounded-3xl flex items-center justify-center gap-3 transition-all hover:bg-gold-500/20 group">
                    <RefreshCw className="w-6 h-6 group-hover:rotate-180 transition-transform duration-500" /> {content.calcShuffleLabel}
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full bg-zinc-100 dark:bg-zinc-800/10 rounded-[3rem] border-4 border-dashed border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center text-zinc-400 p-12 text-center animate-pulse">
              <div className="w-24 h-24 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-8">
                <Calculator className="w-12 h-12 opacity-50" />
              </div>
              <h3 className="text-xl font-black text-zinc-500 mb-3 uppercase tracking-tighter">{content.calcAwaitingInputLabel}</h3>
              <p className="max-w-xs text-sm font-bold opacity-50">{content.calcDisclaimer}</p>
            </div>
          )}
        </div>
      </div>

      {/* --- MEAL PLAN DISPLAY --- */}
      {mealPlan && (
        <div className="mt-20 animate-in fade-in zoom-in duration-500">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-black mb-2 uppercase tracking-tight">{content.calcMealPlanTitle}</h3>
            <p className="text-zinc-500 font-bold">{content.calcMealPlanSubtitle}</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {mealPlan.map((meal, idx) => (
              <div key={idx} className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-8 rounded-[2rem] hover:border-gold-500 transition-all group hover:-translate-y-2 shadow-xl shadow-black/5">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-900 rounded-2xl flex items-center justify-center text-gold-500 font-black text-xl shadow-inner group-hover:bg-gold-500 group-hover:text-black transition-colors">
                    {idx + 1}
                  </div>
                  <h4 className="font-black text-lg tracking-tight">{meal.mealName}</h4>
                </div>
                <ul className="space-y-4">
                  {meal.foods.map((f, fIdx) => (
                    <li key={fIdx} className="flex flex-col gap-1 border-b border-zinc-100 dark:border-zinc-800 pb-3 last:border-0">
                      <span className="text-zinc-800 dark:text-zinc-200 font-bold text-sm group-hover:text-gold-500 transition-colors uppercase">{f.item}</span>
                      <span className="font-black text-gold-600 dark:text-gold-400 text-xs bg-gold-500/5 inline-block w-fit px-2 py-0.5 rounded-lg">{f.amount}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MacroCalculator;
