import React, { useState } from 'react';
import { BicepsFlexed, Utensils, Droplet, ChefHat, RefreshCw, Calculator } from 'lucide-react';
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
}

const MacroCalculator: React.FC<MacroCalculatorProps> = ({ content, lang, unitSystem = 'metric' }) => {
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('male');
  const [activity, setActivity] = useState('moderate');
  const [goal, setGoal] = useState('maintain');
  const [result, setResult] = useState<CalcResult | null>(null);
  const [mealPlan, setMealPlan] = useState<DailyMeal[] | null>(null);

  const isImperial = unitSystem === 'imperial';

  // --- FOOD DATABASE ---
  const foodDatabase = [
    // Proteins
    { id: 'chicken', nameEn: 'Grilled Chicken Breast', nameAr: 'صدور دجاج مشوية', p: 31, c: 0, f: 3.6, type: 'protein' },
    { id: 'beef', nameEn: 'Lean Ground Beef (95%)', nameAr: 'لحم بقري قليل الدسم', p: 26, c: 0, f: 6, type: 'protein' },
    { id: 'egg_whites', nameEn: 'Egg Whites', nameAr: 'بياض بيض', p: 11, c: 0.7, f: 0.2, type: 'protein' },
    { id: 'whey', nameEn: 'Whey Protein Scoop', nameAr: 'واي بروتين (سكوب)', p: 24, c: 3, f: 1, type: 'protein' },
    { id: 'fish', nameEn: 'White Fish (Tilapia)', nameAr: 'سمك أبيض (بلطي)', p: 26, c: 0, f: 2, type: 'protein' },
    { id: 'salmon', nameEn: 'Salmon Fillet', nameAr: 'سلمون', p: 20, c: 0, f: 13, type: 'protein' },

    // Carbs
    { id: 'rice', nameEn: 'White Rice (Cooked)', nameAr: 'أرز أبيض مسلوق', p: 2.7, c: 28, f: 0.3, type: 'carb' },
    { id: 'oats', nameEn: 'Oats', nameAr: 'شوفان', p: 16, c: 66, f: 7, type: 'carb' },
    { id: 'potato', nameEn: 'Potato (Baked)', nameAr: 'بطاطس مسلوقة/مشوية', p: 2, c: 17, f: 0.1, type: 'carb' },
    { id: 'sweet_potato', nameEn: 'Sweet Potato', nameAr: 'بطاطا حلوة', p: 1.6, c: 20, f: 0.1, type: 'carb' },
    { id: 'pasta', nameEn: 'Pasta (Cooked)', nameAr: 'مكرونة مسلوقة', p: 5, c: 30, f: 1, type: 'carb' },

    // Fats
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

    // Convert to metric for standard BMR formula
    if (isImperial) {
      w = w * 0.453592; // lb to kg
      h = h * 2.54;     // inch to cm
    }

    let bmr = 10 * w + 6.25 * h - 5 * a + (gender === 'male' ? 5 : -161);
    const multipliers: any = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, veryActive: 1.9 };
    let tdee = bmr * multipliers[activity];

    const goals: any = { cut: 0.8, maintain: 1, bulk: 1.15 };
    const targetCalories = Math.round(tdee * goals[goal]);

    const protein = Math.round(w * 2.2);
    const fat = Math.round((targetCalories * 0.25) / 9);
    const carbs = Math.round((targetCalories - (protein * 4 + fat * 9)) / 4);

    setResult({ calories: targetCalories, protein, fats: fat, carbs });
    setMealPlan(null);
  };

  const generatePlan = () => {
    if (!result) return;
    const isAr = lang === Language.AR;
    const meals: DailyMeal[] = [];
    const targetP = result.protein / 4;
    const targetC = result.carbs / 4;
    const targetF = result.fats / 4;

    const getRandom = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];
    const proteins = foodDatabase.filter(f => f.type === 'protein');
    const carbs = foodDatabase.filter(f => f.type === 'carb');
    const fats = foodDatabase.filter(f => f.type === 'fat');

    const mealNames = isAr ? ["الإفطار", "الغداء", "قبل التمرين", "العشاء"] : ["Breakfast", "Lunch", "Pre-Workout", "Dinner"];

    mealNames.forEach((name) => {
      const pSource = getRandom(proteins);
      const cSource = getRandom(carbs);
      const fSource = getRandom(fats);

      let pAmount: number | string = pSource.p > 0 ? Math.round((targetP / pSource.p) * 100) : 0;
      let cAmount: number | string = cSource.c > 0 ? Math.round((targetC / cSource.c) * 100) : 0;
      let fAmount: number | string = fSource.f > 0 ? Math.round((targetF / fSource.f) * 100) : 0;

      let unit = "g";
      if (isImperial) {
        // Convert context grams (food weight) to pounds as requested "from gram to pound"
        // However, for single meals, oz is more practical. I'll use Lb but keep 2 decimals.
        pAmount = (parseFloat(pAmount.toString()) * 0.00220462).toFixed(2);
        cAmount = (parseFloat(cAmount.toString()) * 0.00220462).toFixed(2);
        fAmount = (parseFloat(fAmount.toString()) * 0.00220462).toFixed(2);
        unit = "lb";
      }

      const foodItems: MealItem[] = [
        { item: isAr ? pSource.nameAr : pSource.nameEn, amount: `${pAmount}${unit}` },
        { item: isAr ? cSource.nameAr : cSource.nameEn, amount: `${cAmount}${unit}` },
        { item: isAr ? fSource.nameAr : fSource.nameEn, amount: `${fAmount}${unit}` },
      ];
      meals.push({ mealName: name, foods: foodItems });
    });
    setMealPlan(meals);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-2">{content.calcTitle}</h1>
        <p className="text-zinc-500">{content.calcSubtitle}</p>
      </div>
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl shadow-lg border border-zinc-200 dark:border-zinc-800 space-y-6 h-fit">
          <div className="flex gap-4 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
            <button onClick={() => setGender('male')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${gender === 'male' ? 'bg-white dark:bg-zinc-700 shadow-sm' : 'text-zinc-500'}`}>{content.calcMale}</button>
            <button onClick={() => setGender('female')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${gender === 'female' ? 'bg-white dark:bg-zinc-700 shadow-sm' : 'text-zinc-500'}`}>{content.calcFemale}</button>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2"><label htmlFor="calc-age" className="text-xs font-bold text-zinc-500">{content.calcAge}</label><input id="calc-age" type="number" value={age} onChange={e => setAge(e.target.value)} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 text-center font-mono focus:border-gold-500 outline-none" placeholder="25" /></div>
            <div className="space-y-2"><label htmlFor="calc-weight" className="text-xs font-bold text-zinc-500">{content.calcWeight} ({isImperial ? 'lb' : 'kg'})</label><input id="calc-weight" type="number" value={weight} onChange={e => setWeight(e.target.value)} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 text-center font-mono focus:border-gold-500 outline-none" placeholder={isImperial ? "175" : "80"} /></div>
            <div className="space-y-2"><label htmlFor="calc-height" className="text-xs font-bold text-zinc-500">{content.calcHeight} ({isImperial ? 'in' : 'cm'})</label><input id="calc-height" type="number" value={height} onChange={e => setHeight(e.target.value)} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 text-center font-mono focus:border-gold-500 outline-none" placeholder={isImperial ? "70" : "180"} /></div>
          </div>
          <div className="space-y-2"><label htmlFor="calc-activity" className="text-xs font-bold text-zinc-500">{content.calcActivity}</label><select id="calc-activity" title={content.calcActivity} value={activity} onChange={e => setActivity(e.target.value)} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 outline-none">{Object.entries(content.calcActivityLevels).map(([k, v]) => <option key={k} value={k}>{v as string}</option>)}</select></div>
          <div className="space-y-2"><label htmlFor="calc-goal" className="text-xs font-bold text-zinc-500">{content.calcGoal}</label><select id="calc-goal" title={content.calcGoal} value={goal} onChange={e => setGoal(e.target.value)} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 outline-none">{Object.entries(content.calcSelectGoal).map(([k, v]) => <option key={k} value={k}>{v as string}</option>)}</select></div>
          <button onClick={calculate} className="w-full py-4 bg-gold-500 hover:bg-gold-400 text-black font-bold rounded-xl shadow-lg transition-transform hover:scale-[1.02]">{content.calcCalculate}</button>
        </div>
        <div className="flex flex-col justify-start space-y-6">
          {result ? (
            <>
              <div className="bg-zinc-900 text-white p-8 rounded-3xl shadow-2xl relative overflow-hidden animate-fade-in">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/20 rounded-bl-full"></div>
                <h3 className="text-lg font-bold mb-6 text-zinc-400">{content.calcResults}</h3>
                <div className="text-5xl font-black mb-2">{result.calories}</div>
                <div className="text-sm text-gold-500 font-bold uppercase tracking-wider mb-8">{content.calcCalories} / Day</div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center"><span className="flex items-center gap-2"><BicepsFlexed className="w-4 h-4 text-purple-500" /> {content.calcProtein}</span><span className="font-mono font-bold text-xl">{isImperial ? (result.protein * 0.035274).toFixed(1) + ' oz' : result.protein + 'g'}</span></div>
                  <div className="flex justify-between items-center"><span className="flex items-center gap-2"><Utensils className="w-4 h-4 text-blue-500" /> {content.calcCarbs}</span><span className="font-mono font-bold text-xl">{isImperial ? (result.carbs * 0.035274).toFixed(1) + ' oz' : result.carbs + 'g'}</span></div>
                  <div className="flex justify-between items-center"><span className="flex items-center gap-2"><Droplet className="w-4 h-4 text-yellow-500" /> {content.calcFats}</span><span className="font-mono font-bold text-xl">{isImperial ? (result.fats * 0.035274).toFixed(1) + ' oz' : result.fats + 'g'}</span></div>
                </div>
              </div>
              {!mealPlan ? (
                <button onClick={generatePlan} className="w-full py-4 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors animate-fade-in-up">
                  <ChefHat className="w-5 h-5" /> {content.calcGenerateMealPlan}
                </button>
              ) : (
                <button onClick={generatePlan} className="w-full py-4 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-gold-600 dark:text-gold-500 font-bold rounded-xl flex items-center justify-center gap-2 transition-colors animate-pulse">
                  <RefreshCw className="w-5 h-5" /> {lang === Language.AR ? "تغيير الأصناف (Shuffle)" : "Shuffle Meals"}
                </button>
              )}
            </>
          ) : (
            <div className="h-full bg-zinc-100 dark:bg-zinc-800/50 rounded-3xl border border-dashed border-zinc-300 dark:border-zinc-700 flex flex-col items-center justify-center text-zinc-400">
              <Calculator className="w-12 h-12 mb-4 opacity-50" />
              <p>{content.calcDisclaimer}</p>
            </div>
          )}
        </div>
      </div>
      {mealPlan && (
        <div className="mt-12 animate-fade-in-up">
          <div className="text-center mb-8"><h3 className="text-2xl font-bold mb-2">{content.calcMealPlanTitle}</h3><p className="text-zinc-500">{content.calcMealPlanSubtitle}</p></div>
          <div className="grid md:grid-cols-2 gap-6">
            {mealPlan.map((meal, idx) => (
              <div key={idx} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl hover:border-gold-500/50 transition-colors">
                <div className="flex items-center gap-3 mb-4"><div className="w-10 h-10 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center text-gold-500 font-bold">{idx + 1}</div><h4 className="font-bold text-lg">{meal.mealName}</h4></div>
                <ul className="space-y-3">{meal.foods.map((f, fIdx) => (<li key={fIdx} className="flex justify-between items-center text-sm"><span className="text-zinc-700 dark:text-zinc-300">{f.item}</span><span className="font-mono font-bold bg-zinc-100 dark:bg-zinc-950 px-2 py-1 rounded text-zinc-500">{f.amount}</span></li>))}</ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MacroCalculator;
