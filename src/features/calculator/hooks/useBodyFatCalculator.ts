import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { ContentStrings } from '@/shared/types/types';
import { convertValue, toMetric, toDisplayUnit, getWeightUnitLabel, getLengthUnitLabel } from '../../../shared/lib/logic';
import { usePreferences } from '../../../context/PreferencesContext';
import { saveCalculatorResult } from '../../../shared/lib/calculator-history';
import { navyBodyFatPct } from '../lib/navyFormula';

export interface BodyFatResult {
  bodyFatPercentage: number;
  bodyFatMass: number;   // metric kg
  leanBodyMass: number;  // metric kg
  bmi: number;
  bmr: number;
  tdee: number;
  idealBodyFat: number;
  idealBodyFatMin: number;
  idealBodyFatMax: number;
  kgToLose: number;      // metric kg
  category: string;
  categoryKey: 'essential' | 'athletes' | 'fitness' | 'average' | 'obese';
}

/** Result enriched with live unit-system/language-aware display values. */
export interface BodyFatDisplayResult extends BodyFatResult {
  displayBodyFatMass: number;  // kg or lbs
  displayLeanBodyMass: number; // kg or lbs
  displayWeightToLose: number; // kg or lbs
  weightUnit: string;          // 'كجم' | 'رطل' | 'kg' | 'lbs'
  lengthUnit: string;          // 'سم' | 'بوصة' | 'cm' | 'in'
}

interface UseBodyFatCalculatorOptions {
  content: ContentStrings;
  unitSystem: 'metric' | 'imperial';
}

const ACTIVITY_MULTIPLIERS: Record<string, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  veryActive: 1.9,
};

export const useBodyFatCalculator = ({ content, unitSystem }: UseBodyFatCalculatorOptions) => {
  const { language } = usePreferences();
  const isAr = language === 'ar';
  const isImperial = unitSystem === 'imperial';

  // Wizard step
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Inputs
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [waist, setWaist] = useState('');
  const [hip, setHip] = useState('');
  const [neck, setNeck] = useState('');
  const [activityLevel, setActivityLevel] = useState<string>('moderate');

  // Base (metric) values
  const [baseWeight, setBaseWeight] = useState<number>(0);
  const [baseHeight, setBaseHeight] = useState<number>(0);
  const [baseWaist, setBaseWaist] = useState<number>(0);
  const [baseHip, setBaseHip] = useState<number>(0);
  const [baseNeck, setBaseNeck] = useState<number>(0);

  const [lastUnitSystem, setLastUnitSystem] = useState(unitSystem);
  const [result, setResult] = useState<BodyFatResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [ecosystemSynced, setEcosystemSynced] = useState(false);

  // Unit conversion on toggle for inputs
  if (lastUnitSystem !== unitSystem) {
    setLastUnitSystem(unitSystem);
    if (baseWeight > 0) setWeight(convertValue(baseWeight, 'weight', unitSystem).toFixed(1));
    if (baseHeight > 0) setHeight(convertValue(baseHeight, 'height', unitSystem).toFixed(1));
    if (baseWaist > 0) setWaist(convertValue(baseWaist, 'length', unitSystem).toFixed(1));
    if (baseHip > 0) setHip(convertValue(baseHip, 'length', unitSystem).toFixed(1));
    if (baseNeck > 0) setNeck(convertValue(baseNeck, 'length', unitSystem).toFixed(1));
  }

  // Live unit/language-aware display metrics (pure derivation, no effect needed)
  const displayResult = useMemo<BodyFatDisplayResult | null>(() => {
    if (!result) return null;
    return {
      ...result,
      displayBodyFatMass: toDisplayUnit(result.bodyFatMass, 'weight', unitSystem),
      displayLeanBodyMass: toDisplayUnit(result.leanBodyMass, 'weight', unitSystem),
      displayWeightToLose: toDisplayUnit(result.kgToLose, 'weight', unitSystem),
      weightUnit: getWeightUnitLabel(unitSystem, isAr),
      lengthUnit: getLengthUnitLabel(unitSystem, isAr),
    };
  }, [result, unitSystem, isAr]);

  const normalizeNum = (str: string) =>
    str
      .replace(/[٠-٩]/g, (d) => '0123456789'['٠١٢٣٤٥٦٧٨٩'.indexOf(d)])
      .replace(/[۰-۹]/g, (d) => '0123456789'['۰۱۲۳۴۵۶۷۸۹'.indexOf(d)]);

  const handleWeightChange = (val: string) => {
    setWeight(val);
    const num = parseFloat(normalizeNum(val));
    setBaseWeight(!isNaN(num) ? (isImperial ? toMetric(num, 'weight') : num) : 0);
  };
  const handleHeightChange = (val: string) => {
    setHeight(val);
    const num = parseFloat(normalizeNum(val));
    setBaseHeight(!isNaN(num) ? (isImperial ? toMetric(num, 'height') : num) : 0);
  };
  const handleWaistChange = (val: string) => {
    setWaist(val);
    const num = parseFloat(normalizeNum(val));
    setBaseWaist(!isNaN(num) ? (isImperial ? toMetric(num, 'length') : num) : 0);
  };
  const handleHipChange = (val: string) => {
    setHip(val);
    const num = parseFloat(normalizeNum(val));
    setBaseHip(!isNaN(num) ? (isImperial ? toMetric(num, 'length') : num) : 0);
  };
  const handleNeckChange = (val: string) => {
    setNeck(val);
    const num = parseFloat(normalizeNum(val));
    setBaseNeck(!isNaN(num) ? (isImperial ? toMetric(num, 'length') : num) : 0);
  };

  // Validate step 1
  const validateStep1 = (): boolean => {
    const a = parseFloat(normalizeNum(age));
    if (!a || a < 10 || a > 100) {
      toast.error(isAr ? 'أدخل عمراً صحيحاً بين ١٠ و١٠٠ سنة' : 'Enter a valid age (10–100)');
      return false;
    }
    if (!baseWeight || baseWeight < 30 || baseWeight > 300) {
      toast.error(isAr ? 'أدخل وزناً صحيحاً' : 'Enter a valid weight');
      return false;
    }
    if (!baseHeight || baseHeight < 100 || baseHeight > 250) {
      toast.error(isAr ? 'أدخل طولاً صحيحاً' : 'Enter a valid height');
      return false;
    }
    return true;
  };

  // Validate step 2
  const validateStep2 = (): boolean => {
    if (!baseWaist || baseWaist < 40 || baseWaist > 200) {
      toast.error(isAr ? 'أدخل قياس خصر صحيح' : 'Enter a valid waist circumference');
      return false;
    }
    if (!baseNeck || baseNeck < 20 || baseNeck > 80) {
      toast.error(isAr ? 'أدخل قياس رقبة صحيح' : 'Enter a valid neck circumference');
      return false;
    }
    if (gender === 'female' && (!baseHip || baseHip < 50 || baseHip > 200)) {
      toast.error(isAr ? 'أدخل قياس حوض صحيح' : 'Enter a valid hip circumference');
      return false;
    }
    return true;
  };

  const nextStep = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    setStep((prev) => Math.min(prev + 1, 3) as 1 | 2 | 3);
  };

  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1) as 1 | 2 | 3);

  const calculate = () => {
    const a = parseFloat(normalizeNum(age));
    const w = baseWeight;
    const h = baseHeight;
    const wi = baseWaist;
    const hi = baseHip;
    const n = baseNeck;

    if (!validateStep1() || !validateStep2()) return;

    setIsCalculating(true);
    setResult(null);

    setTimeout(() => {
      // ── US Navy Body Fat Formula (metric inputs converted internally) ──
      const bodyFatPercentage = navyBodyFatPct(gender, wi, n, hi, h);

      const bodyFatMass = (w * bodyFatPercentage) / 100;
      const leanBodyMass = w - bodyFatMass;

      // BMI
      const bmi = w / ((h / 100) * (h / 100));

      // ── BMR (Mifflin-St Jeor) ──
      let bmr = 0;
      if (gender === 'male') {
        bmr = 10 * w + 6.25 * h - 5 * a + 5;
      } else {
        bmr = 10 * w + 6.25 * h - 5 * a - 161;
      }

      // TDEE
      const tdee = Math.round(bmr * (ACTIVITY_MULTIPLIERS[activityLevel] ?? 1.55));
      bmr = Math.round(bmr);

      // Ideal body fat range
      const idealBodyFatMin = gender === 'male' ? 10 : 18;
      const idealBodyFatMax = gender === 'male' ? 17 : 24;
      const idealBodyFat = (idealBodyFatMin + idealBodyFatMax) / 2;

      // kg to lose to reach ideal
      const idealFatMass = (leanBodyMass / (1 - idealBodyFat / 100)) * (idealBodyFat / 100);
      const kgToLose = Math.max(0, parseFloat((bodyFatMass - idealFatMass).toFixed(1)));

      // Category
      let categoryKey: BodyFatResult['categoryKey'];
      if (gender === 'male') {
        if (bodyFatPercentage < 6) categoryKey = 'essential';
        else if (bodyFatPercentage < 13) categoryKey = 'athletes';
        else if (bodyFatPercentage < 17) categoryKey = 'fitness';
        else if (bodyFatPercentage < 25) categoryKey = 'average';
        else categoryKey = 'obese';
      } else {
        if (bodyFatPercentage < 16) categoryKey = 'essential';
        else if (bodyFatPercentage < 23) categoryKey = 'athletes';
        else if (bodyFatPercentage < 28) categoryKey = 'fitness';
        else if (bodyFatPercentage < 35) categoryKey = 'average';
        else categoryKey = 'obese';
      }

      const category = content.bfCategories[categoryKey];

      const finalResult: BodyFatResult = {
        bodyFatPercentage: parseFloat(bodyFatPercentage.toFixed(1)),
        bodyFatMass: parseFloat(bodyFatMass.toFixed(1)),
        leanBodyMass: parseFloat(leanBodyMass.toFixed(1)),
        bmi: parseFloat(bmi.toFixed(1)),
        bmr,
        tdee,
        idealBodyFat,
        idealBodyFatMin,
        idealBodyFatMax,
        kgToLose,
        category,
        categoryKey,
      };

      setResult(finalResult);

      // Auto-save assessment to the user's calculator history
      saveCalculatorResult({
        tool: 'bodyfat',
        title: isAr ? 'حاسبة نسبة الدهون' : 'Body Fat Calculator',
        inputs: { gender, age: a, weight: w, height: h, waist: wi, hip: hi, neck: n, activityLevel },
        result: finalResult as unknown as Record<string, unknown>,
      });

      window.dispatchEvent(
        new CustomEvent('bodyfat_calculated', {
          detail: {
            bodyFatPercentage: finalResult.bodyFatPercentage,
            leanBodyMass: finalResult.leanBodyMass,
            bmi: finalResult.bmi,
            category,
          },
        })
      );

      setIsCalculating(false);
      setStep(3);
      setTimeout(() => setEcosystemSynced(true), 1000);
    }, 1400);
  };

  const reset = () => {
    setStep(1);
    setResult(null);
    setAge('');
    setWeight('');
    setHeight('');
    setWaist('');
    setHip('');
    setNeck('');
    setBaseWeight(0);
    setBaseHeight(0);
    setBaseWaist(0);
    setBaseHip(0);
    setBaseNeck(0);
    setEcosystemSynced(false);
  };

  const getCategoryConfig = () => {
    const key = result?.categoryKey ?? 'average';
    const configs: Record<string, { color: string; bg: string; border: string; gradient: string; gaugeColor: string }> = {
      essential: {
        color: 'text-blue-400',
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/30',
        gradient: 'from-blue-500/20 to-blue-500/5',
        gaugeColor: '#60A5FA',
      },
      athletes: {
        color: 'text-green-400',
        bg: 'bg-green-500/10',
        border: 'border-green-500/30',
        gradient: 'from-green-500/20 to-green-500/5',
        gaugeColor: '#4ADE80',
      },
      fitness: {
        color: 'text-gold-400',
        bg: 'bg-gold-500/10',
        border: 'border-gold-500/30',
        gradient: 'from-gold-500/20 to-gold-500/5',
        gaugeColor: '#FBBF24',
      },
      average: {
        color: 'text-orange-400',
        bg: 'bg-orange-500/10',
        border: 'border-orange-500/30',
        gradient: 'from-orange-500/20 to-orange-500/5',
        gaugeColor: '#FB923C',
      },
      obese: {
        color: 'text-red-400',
        bg: 'bg-red-500/10',
        border: 'border-red-500/30',
        gradient: 'from-red-500/20 to-red-500/5',
        gaugeColor: '#F87171',
      },
    };
    return configs[key] ?? configs.average;
  };

  const getEmpathyMessage = (): { title: string; body: string; emoji: string } => {
    const key = result?.categoryKey ?? 'average';
    if (isAr) {
      const msgs: Record<string, { title: string; body: string; emoji: string }> = {
        essential: {
          emoji: '⚡',
          title: 'في القمة الفيزيائية!',
          body: 'أنت في مستوى لا يصله سوى نخبة الرياضيين المحترفين. حافظ على هذا المستوى بتغذية دقيقة ورقابة دورية.',
        },
        athletes: {
          emoji: '🏆',
          title: 'مستوى رياضي احترافي!',
          body: 'تحديد عضلي ممتاز ونسبة دهون تحسد عليها. أنت على الطريق الصحيح تماماً، استمر في الضغط!',
        },
        fitness: {
          emoji: '💪',
          title: 'شكل لياقة مثالي!',
          body: 'أنت في المنطقة الصحية الرائعة. مع القليل من الجهد الإضافي ستصل إلى المستوى الرياضي الاحترافي.',
        },
        average: {
          emoji: '🎯',
          title: 'لديك إمكانات كبيرة!',
          body: 'أنت في النطاق الصحي العام. مع برنامج تغذية وتمرين منظم ستشهد تحولاً ملحوظاً خلال ١٢ أسبوعاً فقط.',
        },
        obese: {
          emoji: '🌱',
          title: 'كل رحلة تبدأ بخطوة!',
          body: 'الإدراك هو أول خطوة للتغيير. جسمك يستجيب بسرعة للتدريب الصحيح والتغذية السليمة. دعنا نضع خطة واقعية معاً.',
        },
      };
      return msgs[key] ?? msgs.average;
    } else {
      const msgs: Record<string, { title: string; body: string; emoji: string }> = {
        essential: {
          emoji: '⚡',
          title: 'Peak Physique Level!',
          body: 'You are at a level only elite competitive athletes reach. Maintain it with precise nutrition and regular monitoring.',
        },
        athletes: {
          emoji: '🏆',
          title: 'Professional Athletic Level!',
          body: 'Excellent muscle definition and an enviable body fat ratio. You are exactly on the right track — keep pushing!',
        },
        fitness: {
          emoji: '💪',
          title: 'Ideal Fitness Shape!',
          body: 'You are in the excellent healthy zone. With a little extra effort you will reach the professional athletic level.',
        },
        average: {
          emoji: '🎯',
          title: 'Great Potential Ahead!',
          body: 'You are in the general healthy range. With a structured nutrition and training plan you will see a noticeable transformation in just 12 weeks.',
        },
        obese: {
          emoji: '🌱',
          title: 'Every Journey Starts With a Step!',
          body: 'Awareness is the first step toward change. Your body responds quickly to proper training and nutrition. Let us build a realistic plan together.',
        },
      };
      return msgs[key] ?? msgs.average;
    }
  };

  return {
    step,
    setStep,
    nextStep,
    prevStep,
    gender,
    setGender,
    age,
    setAge,
    weight,
    handleWeightChange,
    height,
    handleHeightChange,
    waist,
    handleWaistChange,
    hip,
    handleHipChange,
    neck,
    handleNeckChange,
    activityLevel,
    setActivityLevel,
    result,
    displayResult,
    isCalculating,
    ecosystemSynced,
    calculate,
    reset,
    getCategoryConfig,
    getEmpathyMessage,
  };
};
