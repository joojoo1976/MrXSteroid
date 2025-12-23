
import { ContentStrings, TeaserTableData, LabTest, InjectionSite, Compound } from './types';
import {
  seoKeywordsArabic,
  seoKeywordsEnglish,
  footerKeywordsPoolAr,
  footerKeywordsPoolEn,
  salesDataAr,
  salesDataEn,
  fullArabicDisclaimer,
  fullEnglishDisclaimer
} from './content-data';

export { seoKeywordsArabic, seoKeywordsEnglish, footerKeywordsPoolAr, footerKeywordsPoolEn, salesDataAr, salesDataEn, fullArabicDisclaimer, fullEnglishDisclaimer };

export const teaserTablesAR: TeaserTableData[] = [
  {
    title: "جدول تضخيم للمبتدئين (عيّنة)",
    headers: ["الأسبوع", "المادة", "الجرعة"],
    rows: [
      { col1: "1-5", col2: "Testosterone Enanthate", col3: "500mg / أسبوع" },
      { col1: "1-5", col2: "Dianabol (Kickstart)", col3: "30mg / يوم" },
      { col1: "1-12", col2: "Arimidex", col3: "0.5mg / يوم بعد يوم" },
      { col1: "6-12", col2: "Testosterone Enanthate", col3: "500mg / أسبوع" },
      { col1: "13-15", col2: "فترة الانتظار (Clearance)", col3: "بدون مواد" },
      { col1: "16-17", col2: "PCT: Nolvadex", col3: "40mg / يوم" },
      { col1: "18-19", col2: "PCT: Clomid", col3: "50mg / يوم" }
    ]
  },
  {
    title: "جدول تنشيف متقدم (عيّنة)",
    headers: ["الأسبوع", "المادة", "الجرعة"],
    rows: [
      { col1: "1-4", col2: "Testosterone Propionate", col3: "100mg / يوم بعد يوم" },
      { col1: "1-4", col2: "Trenbolone Acetate", col3: "75mg / يوم بعد يوم" },
      { col1: "1-8", col2: "Masteron Propionate", col3: "100mg / يوم بعد يوم" },
      { col1: "5-10", col2: "Winstrol (Injectable)", col3: "50mg / يوم بعد يوم" },
      { col1: "1-10", col2: "T3 (Cytomel)", col3: "25mcg (تدرج هرمي)" },
      { col1: "11-14", col2: "PCT Protocol", col3: "HCG + SERMs" }
    ]
  }
];

export const teaserTablesEN: TeaserTableData[] = [
  {
    title: "Beginner Bulking Cycle (Sample)",
    headers: ["Week", "Compound", "Dosage"],
    rows: [
      { col1: "1-5", col2: "Testosterone Enanthate", col3: "500mg / week" },
      { col1: "1-5", col2: "Dianabol (Kickstart)", col3: "30mg / day" },
      { col1: "1-12", col2: "Arimidex", col3: "0.5mg / EOD" },
      { col1: "6-12", col2: "Testosterone Enanthate", col3: "500mg / week" },
      { col1: "13-15", col2: "Clearance Period", col3: "No Compounds" },
      { col1: "16-17", col2: "PCT: Nolvadex", col3: "40mg / day" },
      { col1: "18-19", col2: "PCT: Clomid", col3: "50mg / day" }
    ]
  },
  {
    title: "Advanced Cutting Cycle (Sample)",
    headers: ["Week", "Compound", "Dosage"],
    rows: [
      { col1: "1-4", col2: "Testosterone Propionate", col3: "100mg / EOD" },
      { col1: "1-4", col2: "Trenbolone Acetate", col3: "75mg / EOD" },
      { col1: "1-8", col2: "Masteron Propionate", col3: "100mg / EOD" },
      { col1: "5-10", col2: "Winstrol (Injectable)", col3: "50mg / EOD" },
      { col1: "1-10", col2: "T3 (Cytomel)", col3: "25mcg (Pyramid)" },
      { col1: "11-14", col2: "PCT Protocol", col3: "HCG + SERMs" }
    ]
  }
];

export const teaserTablesHE: TeaserTableData[] = [
  {
    title: "טבלת מסה למתחילים (דוגמה)",
    headers: ["שבוע", "חומר", "מינון"],
    rows: [
      { col1: "1-5", col2: "Testosterone Enanthate", col3: "500 מ״ג / שבוע" },
      { col1: "1-5", col2: "Dianabol (Kickstart)", col3: "30 מ״ג / יום" },
      { col1: "1-12", col2: "Arimidex", col3: "0.5 מ״ג / פעם ביומיים" },
      { col1: "6-12", col2: "Testosterone Enanthate", col3: "500 מ״ג / שבוע" },
      { col1: "13-15", col2: "תקופת המתנה (Clearance)", col3: "ללא חומרים" },
      { col1: "16-17", col2: "PCT: Nolvadex", col3: "40 מ״ג / יום" },
      { col1: "18-19", col2: "PCT: Clomid", col3: "50 מ״ג / יום" }
    ]
  },
  {
    title: "טבלת חיטוב מתקדם (דוגמה)",
    headers: ["שבוע", "חומר", "מינון"],
    rows: [
      { col1: "1-4", col2: "Testosterone Propionate", col3: "100 מ״ג / פעם ביומיים" },
      { col1: "1-4", col2: "Trenbolone Acetate", col3: "75 מ״ג / פעם ביומיים" },
      { col1: "1-8", col2: "Masteron Propionate", col3: "100 מ״ג / פעם ביומיים" },
      { col1: "5-10", col2: "Winstrol (Injectable)", col3: "50 מ״ג / פעם ביומיים" },
      { col1: "1-10", col2: "T3 (Cytomel)", col3: "25 mcg (פירמידה)" },
      { col1: "11-14", col2: "פרוטוקול PCT", col3: "HCG + SERMs" }
    ]
  }
];

const commonCompounds: Compound[] = [
  { id: 'test_e', name: 'Testosterone Enanthate', halfLife: 4.5 },
  { id: 'test_p', name: 'Testosterone Propionate', halfLife: 0.8 },
  { id: 'test_c', name: 'Testosterone Cypionate', halfLife: 5 },
  { id: 'tren_a', name: 'Trenbolone Acetate', halfLife: 1 },
  { id: 'tren_e', name: 'Trenbolone Enanthate', halfLife: 5 },
  { id: 'deca', name: 'Deca Durabolin', halfLife: 6 },
  { id: 'npp', name: 'NPP (Nandrolone Phenyl)', halfLife: 2.5 },
  { id: 'eq', name: 'Equipoise (Boldenone)', halfLife: 14 },
  { id: 'mast_p', name: 'Masteron Propionate', halfLife: 0.8 },
  { id: 'primo', name: 'Primobolan Enanthate', halfLife: 5 }
];

const injectionSitesAr: InjectionSite[] = [
  { id: 'glute_dorso', name: 'المؤخرة (Dorso)', category: 'Lower Body', view: 'back', needle: '23G - 25G (1.5")', volume: '3.0 - 4.0 ml', recoveryDays: 7, riskLevel: 'Low', description: 'أفضل مكان للحقن. عضلة كبيرة جداً، قليلة الأعصاب، وتتحمل كميات زيت كبيرة.', pathD: '' },
  { id: 'glute_ventro', name: 'الورك الجانبي (Ventro)', category: 'Lower Body', view: 'front', needle: '23G - 25G (1.5")', volume: '2.5 - 3.0 ml', recoveryDays: 7, riskLevel: 'Low', description: 'آمن جداً وبعيد عن الأعصاب الرئيسية. ممتاز لتجنب تليف المؤخرة الخلفية.', pathD: '' },
  { id: 'delt_side', name: 'الكتف الجانبي', category: 'Upper Body', view: 'front', needle: '25G - 27G (1")', volume: '1.0 - 1.5 ml', recoveryDays: 5, riskLevel: 'Low', description: 'مكان شائع وسهل الوصول إليه. مناسب للكميات المتوسطة.', pathD: '' },
  { id: 'quad_outer', name: 'الفخذ الخارجي', category: 'Lower Body', view: 'front', needle: '23G - 25G (1")', volume: '2.0 - 3.0 ml', recoveryDays: 7, riskLevel: 'Medium', warning: 'تجنب الحقن في الداخل! خطر إصابة أعصاب.', description: 'سهل الوصول إليه وأنت جالس. مؤلم قليلاً بعد الحقن (PIP).', pathD: '' },
  { id: 'pecs', name: 'الصدر', category: 'Upper Body', view: 'front', needle: '25G - 27G (1")', volume: '1.0 - 1.5 ml', recoveryDays: 5, riskLevel: 'Medium', warning: 'للمحترفين فقط.', description: 'يستخدم لتوزيع الحقن وتجنب الندبات في الأماكن الأخرى.', pathD: '' },
  { id: 'lats', name: 'اللاتس (الظهر الجانبي)', category: 'Upper Body', view: 'back', needle: '25G (1")', volume: '2.0 - 3.0 ml', recoveryDays: 6, riskLevel: 'Medium', description: 'عضلة كبيرة وتتحمل كميات جيدة. تتطلب مرونة للوصول إليها.', pathD: '' },
  { id: 'triceps', name: 'التراي (الرأس الطويل)', category: 'Upper Body', view: 'back', needle: '27G - 29G (0.5")', volume: '1.0 ml', recoveryDays: 4, riskLevel: 'Medium', description: 'ممتازة للكميات الصغيرة (Insulin Pin). تجنب الرأس الجانبي لتفادي الأعصاب.', pathD: '' },
  { id: 'biceps', name: 'البايسبس', category: 'Upper Body', view: 'front', needle: '27G - 30G (0.5")', volume: '1.0 ml', recoveryDays: 5, riskLevel: 'High', warning: 'خطر! مليئة بالأوردة والأعصاب.', description: 'للمحترفين جداً. تستخدم للحقن الموضعي (Site Enhancement).', pathD: '' },
  { id: 'traps', name: 'الترابيس', category: 'Upper Body', view: 'back', needle: '25G (1")', volume: '1.5 - 2.0 ml', recoveryDays: 5, riskLevel: 'Medium', description: 'سهلة جداً وحقنها غير مؤلم غالباً. تعطي مظهراً ممتلئاً للمنطقة.', pathD: '' },
  { id: 'calves', name: 'السمانة', category: 'Lower Body', view: 'back', needle: '27G (1")', volume: '1.0 ml', recoveryDays: 8, riskLevel: 'High', warning: 'مؤلمة جداً (High PIP).', description: 'قد تعيق المشي لعدة أيام. تستخدم فقط عند استنفاد الأماكن الأخرى.', pathD: '' }
];

const injectionSitesEn: InjectionSite[] = [
  { id: 'glute_dorso', name: 'Glute (Dorsogluteal)', category: 'Lower Body', view: 'back', needle: '23G - 25G (1.5")', volume: '3.0 - 4.0 ml', recoveryDays: 7, riskLevel: 'Low', description: 'The gold standard. Huge muscle belly, fewer nerves, handles high volume.', pathD: '' },
  { id: 'glute_ventro', name: 'Glute (Ventrogluteal)', category: 'Lower Body', view: 'front', needle: '23G - 25G (1.5")', volume: '2.5 - 3.0 ml', recoveryDays: 7, riskLevel: 'Low', description: 'Extremely safe, far from sciatic nerve. Best rotation site.', pathD: '' },
  { id: 'delt_side', name: 'Side Delt', category: 'Upper Body', view: 'front', needle: '25G - 27G (1")', volume: '1.0 - 2.0 ml', recoveryDays: 5, riskLevel: 'Low', description: 'Very accessible. Good for medium volumes.', pathD: '' },
  { id: 'quad_outer', name: 'Outer Quad (Vastus Lateralis)', category: 'Lower Body', view: 'front', needle: '23G - 25G (1")', volume: '2.0 - 3.0 ml', recoveryDays: 7, riskLevel: 'Medium', warning: 'Stay outer! Inner thigh has major nerves.', description: 'Easy to access while sitting. Can have higher PIP.', pathD: '' },
  { id: 'pecs', name: 'Pecs', category: 'Upper Body', view: 'front', needle: '25G - 27G (1")', volume: '1.0 - 1.5 ml', recoveryDays: 5, riskLevel: 'Medium', warning: 'Advanced users only.', description: 'Used for site rotation to avoid scar tissue elsewhere.', pathD: '' },
  { id: 'lats', name: 'Lats', category: 'Upper Body', view: 'back', needle: '25G (1")', volume: '2.0 - 3.0 ml', recoveryDays: 6, riskLevel: 'Medium', description: 'Great site for volume. Requires some flexibility to reach.', pathD: '' },
  { id: 'triceps', name: 'Triceps (Long Head)', category: 'Upper Body', view: 'back', needle: '27G - 29G (0.5")', volume: '1.0 ml', recoveryDays: 4, riskLevel: 'Medium', description: 'Excellent for small volumes using insulin pins. Avoid lateral head.', pathD: '' },
  { id: 'biceps', name: 'Biceps', category: 'Upper Body', view: 'front', needle: '27G - 30G (0.5")', volume: '1.0 ml', recoveryDays: 5, riskLevel: 'High', warning: 'Danger zone! Many nerves and veins.', description: 'Expert only. Often used for site enhancement protocols.', pathD: '' },
  { id: 'traps', name: 'Traps', category: 'Upper Body', view: 'back', needle: '25G (1")', volume: '1.5 - 2.0 ml', recoveryDays: 5, riskLevel: 'Medium', description: 'Very easy access and usually painless. Visual "pop" effect.', pathD: '' },
  { id: 'calves', name: 'Calves', category: 'Lower Body', view: 'back', needle: '27G (1")', volume: '1.0 ml', recoveryDays: 8, riskLevel: 'High', warning: 'Extreme PIP warning.', description: 'Can make walking difficult. Last resort for rotation.', pathD: '' }
];

const labTestsAr: LabTest[] = [
  { id: 'test_total', name: 'Testosterone, Total', category: 'hormones', range: '264 - 916', unit: 'ng/dL', min: 264, max: 916, description: 'مستوى التستوستيرون الكلي في الدم.', elevationMeaning: 'نتيجة طبيعية للكورس. إذا كان > 1500، الكورس فعال.', lowMeaning: 'ضعف جنسي، اكتئاب، خسارة عضلية. (علامة فشل PCT)', management: 'إذا مرتفع: استمر. إذا منخفض: ابدأ PCT فوراً.' },
  { id: 'e2', name: 'Estradiol (E2)', category: 'hormones', range: '7.6 - 42.6', unit: 'pg/mL', min: 7.6, max: 42.6, description: 'هرمون الأنوثة. يتحول من التستوستيرون.', elevationMeaning: 'خطر الجينو (تثدي)، احتباس ماء، ضغط دم.', lowMeaning: 'ألم مفاصل، ضعف انتصاب، جفاف.', management: 'مرتفع: خذ Arimidex 0.5mg. منخفض: وقف الـ AI.' },
  { id: 'alt', name: 'ALT (SGPT)', category: 'organs', range: '7 - 56', unit: 'U/L', min: 7, max: 56, description: 'إنزيم كبد رئيسي.', elevationMeaning: 'إجهاد كبد. شائع مع الحبوب (Orals).', lowMeaning: 'نادر وغير مقلق.', management: 'أوقف الحبوب، خذ TUDCA + NAC.' },
  { id: 'ast', name: 'AST (SGOT)', category: 'organs', range: '8 - 48', unit: 'U/L', min: 8, max: 48, description: 'إنزيم كبد وعضلات.', elevationMeaning: 'إجهاد كبد أو تدمير عضلي شديد من التمرين.', lowMeaning: 'غير مقلق.', management: 'قيم الـ ALT معه للتأكد من الكبد.' },
  { id: 'creatinine', name: 'Creatinine', category: 'organs', range: '0.74 - 1.35', unit: 'mg/dL', min: 0.74, max: 1.35, description: 'مؤشر وظائف كلى.', elevationMeaning: 'إجهاد كلوي، أو جفاف، أو كتلة عضلية ضخمة.', lowMeaning: 'ضمور عضلي.', management: 'اشرب ماء أكثر (4-5 لتر). قلل البروتين قليلاً.' },
  { id: 'hdl', name: 'HDL Cholesterol', category: 'blood', range: '> 40', unit: 'mg/dL', min: 40, max: 100, description: 'الكوليسترول النافع.', elevationMeaning: 'ممتاز لصحة القلب.', lowMeaning: 'خطر! شائع جداً في الكورسات.', management: 'زيت سمك 4g/يوم، كارديو، Niacin.' },
  { id: 'hematocrit', name: 'Hematocrit', category: 'blood', range: '38.3 - 48.6', unit: '%', min: 38.3, max: 52, description: 'لزوجة الدم.', elevationMeaning: 'دم ثقيل = خطر جلطات.', lowMeaning: 'أنيميا.', management: 'تبرع بالدم فوراً إذا تجاوز 52%.' }
];

const labTestsEn: LabTest[] = [
  { id: 'test_total', name: 'Testosterone, Total', category: 'hormones', range: '264 - 916', unit: 'ng/dL', min: 264, max: 916, description: 'Total circulating testosterone.', elevationMeaning: 'Expected on cycle. >1500 means gear is real.', lowMeaning: 'Hypogonadism, depression, muscle loss.', management: 'High: Good on cycle. Low: Start PCT.' },
  { id: 'e2', name: 'Estradiol (E2)', category: 'hormones', range: '7.6 - 42.6', unit: 'pg/mL', min: 7.6, max: 42.6, description: 'Estrogen converted from Test.', elevationMeaning: 'Gyno risk, water retention, high BP.', lowMeaning: 'Joint pain, ED, dry skin.', management: 'High: Take AI (Arimidex). Low: Stop AI.' },
  { id: 'alt', name: 'ALT (SGPT)', category: 'organs', range: '7 - 56', unit: 'U/L', min: 7, max: 56, description: 'Liver enzyme.', elevationMeaning: 'Liver stress (common with orals).', lowMeaning: 'Not concerning.', management: 'Stop orals, add TUDCA/NAC.' },
  { id: 'ast', name: 'AST (SGOT)', category: 'organs', range: '8 - 48', unit: 'U/L', min: 8, max: 48, description: 'Liver & Muscle enzyme.', elevationMeaning: 'Liver stress or hard training damage.', lowMeaning: 'Not concerning.', management: 'Check ALT to confirm liver.' },
  { id: 'creatinine', name: 'Creatinine', category: 'organs', range: '0.74 - 1.35', unit: 'mg/dL', min: 0.74, max: 1.35, description: 'Kidney function marker.', elevationMeaning: 'Kidney stress, dehydration, or high muscle mass.', lowMeaning: 'Low muscle mass.', management: 'Hydrate (4L+). Monitor BP.' },
  { id: 'hdl', name: 'HDL Cholesterol', category: 'blood', range: '> 40', unit: 'mg/dL', min: 40, max: 100, description: 'Good cholesterol.', elevationMeaning: 'Heart protective.', lowMeaning: 'DANGER. Very common on cycle.', management: 'Fish Oil 4g, Cardio, Niacin.' },
  { id: 'hematocrit', name: 'Hematocrit', category: 'blood', range: '38.3 - 48.6', unit: '%', min: 38.3, max: 52, description: 'Blood viscosity (thickness).', elevationMeaning: 'Thick blood = Clot risk.', lowMeaning: 'Anemia.', management: 'Donate blood if > 52%.' }
];

const injectionSitesHe: InjectionSite[] = [
  { id: 'glute_dorso', name: 'גלוט (Dorsogluteal)', category: 'פלג גוף תחתון', view: 'back', needle: '23G - 25G (1.5")', volume: '3.0 - 4.0 ml', recoveryDays: 7, riskLevel: 'Low', description: 'הסטנדרט המוזהב. שריר גדול, פחות עצבים, מתמודד עם נפח גבוה.', pathD: '' },
  { id: 'glute_ventro', name: 'גלוט (Ventrogluteal)', category: 'פלג גוף תחתון', view: 'front', needle: '23G - 25G (1.5")', volume: '2.5 - 3.0 ml', recoveryDays: 7, riskLevel: 'Low', description: 'בטוח מאוד, רחוק מעצב השת. האתר הטוב ביותר לרוטציה.', pathD: '' },
  { id: 'delt_side', name: 'כתף צידית', category: 'פלג גוף עליון', view: 'front', needle: '25G - 27G (1")', volume: '1.0 - 2.0 ml', recoveryDays: 5, riskLevel: 'Low', description: 'אתר נגיש מאוד. טוב לנפחים בינוניים.', pathD: '' },
  { id: 'quad_outer', name: 'ירך חיצונית', category: 'פלג גוף תחתון', view: 'front', needle: '23G - 25G (1")', volume: '2.0 - 3.0 ml', recoveryDays: 7, riskLevel: 'Medium', warning: 'הישאר חיצוני! הירך הפנימית מכילה עצבים מרכזיים.', description: 'גישה קלה בזמן ישיבה. עלול לגרום לכאב לאחר הזרקה (PIP).', pathD: '' },
  { id: 'pecs', name: 'חזה', category: 'פלג גוף עליון', view: 'front', needle: '25G - 27G (1")', volume: '1.0 - 1.5 ml', recoveryDays: 5, riskLevel: 'Medium', warning: 'למשתמשים מתקדמים בלבד.', description: 'משמש לרוטציה כדי למנוע רקמה צלקתית באתרים אחרים.', pathD: '' },
  { id: 'lats', name: 'לת׳ס (גב)', category: 'פלג גוף עליון', view: 'back', needle: '25G (1")', volume: '2.0 - 3.0 ml', recoveryDays: 6, riskLevel: 'Medium', description: 'אתר מעולה לנפח. דורש גמישות מסוימת כדי להגיע.', pathD: '' },
  { id: 'triceps', name: 'תלת-ראשי', category: 'פלג גוף עליון', view: 'back', needle: '27G - 29G (0.5")', volume: '1.0 ml', recoveryDays: 4, riskLevel: 'Medium', description: 'מצוין לנפחים קטנים עם מחטי אינסולין. הימנע מהראש הצידי.', pathD: '' },
  { id: 'biceps', name: 'דו-ראשי', category: 'פלג גוף עליון', view: 'front', needle: '27G - 30G (0.5")', volume: '1.0 ml', recoveryDays: 5, riskLevel: 'High', warning: 'אזור סכנה! עצבים וכלי דם רבים.', description: 'למומחים בלבד. משמש לעיתים לשיפור מראה האתר.', pathD: '' },
  { id: 'traps', name: 'טרפזים', category: 'פלג גוף עליון', view: 'back', needle: '25G (1")', volume: '1.5 - 2.0 ml', recoveryDays: 5, riskLevel: 'Medium', description: 'גישה קלה מאוד ובדרך כלל ללא כאב. נותן מראה בולט.', pathD: '' },
  { id: 'calves', name: 'תאומים', category: 'פלג גוף תחתון', view: 'back', needle: '27G (1")', volume: '1.0 ml', recoveryDays: 8, riskLevel: 'High', warning: 'אזהרת PIP קיצונית.', description: 'עלול להקשות על הליכה. מוצא אחרון לרוטציה.', pathD: '' }
];

const labTestsHe: LabTest[] = [
  { id: 'test_total', name: 'טסטוסטרון כללי', category: 'hormones', range: '264 - 916', unit: 'ng/dL', min: 264, max: 916, description: 'טסטוסטרון כללי במחזור הדם.', elevationMeaning: 'צפוי בסייקל. מעל 1500 אומר שהחומרים אמיתיים.', lowMeaning: 'היפוגונדיזם, דיכאון, איבוד שריר.', management: 'גבוה: טוב בסייקל. נמוך: התחל PCT.' },
  { id: 'e2', name: 'אסטרדיול (E2)', category: 'hormones', range: '7.6 - 42.6', unit: 'pg/mL', min: 7.6, max: 42.6, description: 'אסטרוגן המומר מטסטוסטרון.', elevationMeaning: 'סיכון לג׳ינו, אגירת נוזלים, לחץ דם גבוה.', lowMeaning: 'כאבי מפרקים, בעיות זקפה, עור יבש.', management: 'גבוה: קח AI (ארימידקס). נמוך: הפסק AI.' },
  { id: 'alt', name: 'ALT (SGPT)', category: 'organs', range: '7 - 56', unit: 'U/L', min: 7, max: 56, description: 'אנזים כבד.', elevationMeaning: 'לחץ על הכבד (נפוץ עם כדורים).', lowMeaning: 'לא מדאיג.', management: 'הפסק כדורים, הוסף TUDCA/NAC.' },
  { id: 'ast', name: 'AST (SGOT)', category: 'organs', range: '8 - 48', unit: 'U/L', min: 8, max: 48, description: 'אנזים כבד ושריר.', elevationMeaning: 'לחץ על הכבד או נזק מאימون קשה.', lowMeaning: 'לא מדאיג.', management: 'בדוק ALT לאישור מצב הכבד.' },
  { id: 'creatinine', name: 'קריאטינין', category: 'organs', range: '0.74 - 1.35', unit: 'mg/dL', min: 0.74, max: 1.35, description: 'מדד לתפקוד כליות.', elevationMeaning: 'לחץ על הכליות, התייבשות, או מסת שריר גבוהה.', lowMeaning: 'מסת שריר נמוכה.', management: 'שתה מים (4 ליטר+). עקוב אחר לחץ דם.' },
  { id: 'hdl', name: 'HDL כולסטרול', category: 'blood', range: '> 40', unit: 'mg/dL', min: 40, max: 100, description: 'כולסטרול טוב.', elevationMeaning: 'מגן על הלב.', lowMeaning: 'סכנה. נפוץ מאוד בסייקל.', management: 'שמן דגים 4 גרם, אירובי, ניאצין.' },
  { id: 'hematocrit', name: 'המטוקריט', category: 'blood', range: '38.3 - 48.6', unit: '%', min: 38.3, max: 52, description: 'צמיגות הדם.', elevationMeaning: 'דם סמיך = סיכון לקרישים.', lowMeaning: 'אנמיה.', management: 'תרום דם אם מעל 52%.' }
];

export const arContent: ContentStrings = {
  navAiTools: "أدوات كمال الأجسام الذكية",
  navPremiumResources: "الموارد الحصرية",
  navFeatures: "المميزات",
  navToolNames: {
    macro: "حاسبة الماكروز",
    injection: "خريطة الحقن التفاعلية",
    halflife: "محاكي نصف العمر",
    lab: "المرجع الذكي للتحاليل",
    genetic: "حاسبة الإمكانيات الجينية",
    cycleArchitect: "مُصدر تقويم الكورسات (Cycle Calendar)",
  },
  themeNames: {
    light: "الوضع المضيء",
    dark: "الوضع الليلي",
    system: "وضع النظام",
  },
  backToHome: "العودة للرئيسية",
  seoTitle: "مستر إكس-سترويد Mr. X-Steroid | الدليل الشامل لكمال الأجسام والهرمونات",
  seoDescription: "اكتشف الدليل العلمي الأقوى في العالم العربي لبناء العضلات والكورسات الهرمونية. كتاب مستر إكس-سترويد بقلم جورج موريس يقدم جداول تضخيم وتنشيف، بروتوكولات حماية، ودليل شامل للمكملات.",
  seoKeywords: seoKeywordsArabic,

  heroTitle: "مستر إكس-سترويد Mr. X-Steroid",
  heroSubtitle: "اكتشف دليل بناء العضلات وكتاب الكورسات الهرمونية: دليل شامل ومنهج علمي مُدعم بجداول تفصيلية دقيقة وجداول بسيطة سهلة الفهم يعرّفك على كورسات الهرمونات الابتنائية المثيرة ويجعلها في متناول يدك عبر خطط عملية واضحة لتكون عونًا في رحلتك نحو القوة وجسمٍ منحوتٍ مهيبٍ مفتول العضلات.",
  heroCta: "احصل على نسختك الآن",
  downloadPreview: "تحميل معاينة مجانية (PDF)",
  audioPreviewBtn: "استمع للمقدمة",
  authorSection: "عن المؤلف",
  authorName: "جورج موريس",
  authorBio: "مؤلف الكتاب ومصمم الغلاف، يقدم لك دليلاً ليس مجرد سرد للمعلومات، بل درع يحميك بالمعرفة. هذا الكتاب هو رسالة لكل مدرب ولاعب يؤمن بأن العلم والمعرفة هما أساس التميز.",
  featuresTitle: "ماذا ستجد في هذا الكتاب؟",
  sneakPeekTitle: "نظرة حصرية داخل الكتاب",
  sneakPeekSubtitle: "شاهد كيف تبدو الجداول الاحترافية. الجزء الأول متاح، والباقي مشفر لحماية المحتوى.",
  unlockText: "اشترِ الكتاب لفتح الجدول والجرعات بالكامل",
  buyNow: "شراء الكتاب",
  contact: "تواصل معنا",
  copyright: "جميع الحقوق محفوظة © 2025 George Mourice",
  features: [
    {
      title: "المخططات الهرمونية الشاملة: من المبتدئ إلى 'الوحش'",
      description: "لن تضطر بعد اليوم للتخمين أو الاعتماد على 'وصفات' المدربين العشوائية. يقدم لك الكتاب جداول تفصيلية دقيقة لكورسات الهرمونات، مصممة بمنهجية علمية تبدأ معك من مستوى المبتدئين وتتدرج بك بأمان إلى المستويات المتوسطة والمتقدمة. ستجد خططاً واضحة للتضخيم (Bulking) لبناء كتلة عضلية مرعبة، وخططاً للتنشيف (Cutting) لنحت العضلات وإبراز تفاصيلها، مدعومة بجرعات محددة وتوقيتات دقيقة.",
      iconKey: "chart"
    },
    {
      title: "فن 'الخروج الآمن': بروتوكولات التنظيف (PCT) الصارمة",
      description: "الدخول في كورس الهرمونات سهل، ولكن الخروج الآمن هو الفن الحقيقي. يشرح لك الكتاب بالتفصيل الممل كيف تحمي جهازك الهرموني، وكيف تستعيد إنتاج التستوستيرون الطبيعي بسرعة بعد الكورس لتجنب الانهيار العضلي والاكتئاب. خطط PCT مدروسة بالأدوية والجرعات.",
      iconKey: "exit"
    },
    {
      title: "دليل المكملات: الحقيقة الكاملة بدون تسويق",
      description: "وفر أموالك وتوقف عن شراء مكملات لا فائدة منها. يقدم لك الكتاب دليلاً صريحاً للمكملات التي تعمل فعلاً (مثل الكرياتين، البروتين، الفيتامينات الأساسية) ويكشف لك كذب المكملات التجارية التي تستنزف جيبك.",
      iconKey: "shield"
    }
  ],
  testimonials: [
    { name: "أحمد س.", title: "لاعب كمال أجسام هاوي", text: "كنت تائهاً بين معلومات الإنترنت المتضاربة. هذا الكتاب وضعني على الطريق الصحيح ووفر علي سنوات من التجربة والخطأ." },
    { name: "محمد ع.", title: "مدرب شخصي", text: "مرجع لا غنى عنه لأي مدرب يريد أن يكون أميناً مع عملائه ويحمي صحتهم." },
    { name: "كريم م.", title: "بطل محلي", text: "الجداول الموجودة في الكتاب دقيقة جداً وساعدتني في الوصول لأفضل فورمة في حياتي." }
  ],
  testimonialsTitle: "ماذا يقول القراء؟",
  faqTitle: "الأسئلة الشائعة",
  faqSubtitle: "إجابات مباشرة على أكثر الأسئلة تكراراً",
  faqSearchPlaceholder: "ابحث عن سؤال...",
  faqCategories: { all: "الكل", safety: "الأمان", general: "عام", legal: "قانوني", women: "السيدات", strategy: "استراتيجيات" },
  faqs: [
    { question: "هل الكتاب مناسب للمبتدئين تماماً؟", answer: "نعم، يبدأ الكتاب من الأساسيات ويشرح المصطلحات الطبية والرياضية بلغة بسيطة جداً قبل الدخول في الجداول المعقدة.", category: "general" },
    { question: "هل يحتوي الكتاب على جداول تغذية؟", answer: "نعم، الكتاب يركز بشكل أساسي على الهرمونات ولكنه يحتوي على فصل كامل عن التغذية المناسبة خلال الكورس وكيفية حساب السعرات والماكروز.", category: "strategy" },
    { question: "كيف أحصل على الكتاب بعد الدفع؟", answer: "بمجرد إتمام الدفع، سيصلك رابط تحميل مباشر لملف PDF على بريدك الإلكتروني فوراً.", category: "general" }
  ],
  privacyPolicy: "سياسة الخصوصية",
  termsOfService: "شروط الخدمة",
  refundPolicy: "سياسة الاسترجاع",
  legalDisclaimer: "إخلاء المسؤولية القانوني",
  aboutUs: "من نحن",
  legal: "قانوني",
  quickLinks: "روابط سريعة",
  privacyPolicyContent: "نحن نحترم خصوصيتك ونلتزم بحماية بياناتك الشخصية...",
  termsOfServiceContent: "باستخدامك لهذا الموقع، فإنك توافق على الشروط التالية...",
  refundPolicyContent: "نظراً لطبيعة المنتج الرقمي، لا يمكن استرجاع المبلغ بعد تحميل الملف...",
  pricingTitle: "اختر خطتك",
  pricingSubtitle: "استثمار بسيط في صحتك ومعرفتك سيوفر عليك آلاف الدولارات ومخاطر صحية لا حصر لها.",
  pricingTiers: [
    { name: "الباقة الاحترافية", price: "$49.99", originalPrice: "$79.99", description: "الكتاب + أدوات حصرية", features: ["الكتاب الكامل (300+ صفحة)", "ملف إكسل لحساب الجرعات", "وصول لمجتمع المشتركين الخاص", "دليل المكملات الإضافي"], buttonText: "الأكثر مبيعاً", isPopular: true, popularLabel: "الأكثر طلباً" },
    { name: "باقة التدريب", price: "$199.99", description: "تدريب شخصي مع الكتاب", features: ["كل مميزات الباقة الاحترافية", "استشارة أونلاين (30 دقيقة)", "تصميم كورس مخصص لك", "متابعة لمدة شهر"], buttonText: "ابدأ التحول" }
  ],
  disclaimerTitle: "تنبيه هام جداً وإخلاء مسؤولية",
  disclaimerContent: fullArabicDisclaimer,
  agreeButton: "أوافق وأتحمل المسؤولية الكاملة وعمري فوق الـ 18 عاماً",
  disclaimerAcknowledgement: "بالضغط على الزر أدناه، فإنك تقر بأنك قد قرأت وفهمت ووافقت على جميع الشروط المذكورة أعلاه.",

  importantDisclaimer: "تنبيه هام",
  downloadFullBook: "تحميل الكتاب الكامل",
  processing: "جاري المعالجة...",
  purchaseSuccess: "تم الشراء بنجاح! شكراً لثقتك.",
  benefitsTitle: "لماذا هذا الكتاب هو استثمارك الأفضل؟",
  benefitsSubtitle: "نحن لا نبيع لك مجرد صفحات، نحن نبيع لك خلاصة سنوات من الخبرة والعلم لتختصر طريقك.",
  benefits: [
    { title: "توفير الوقت والمال", description: "بدلاً من إضاعة سنوات في التجربة والخطأ وشراء مكملات لا تعمل، احصل على الخلاصة فوراً.", iconKey: "time" },
    { title: "الأمان أولاً", description: "تعلم كيف تحمي نفسك من الأعراض الجانبية وكيف تتعامل معها باحترافية طبية.", iconKey: "shield" },
    { title: "الحقيقة المجردة", description: "لا يوجد تسويق لمنتجات معينة. الحقيقة العلمية فقط هي ما ستقرأه هنا.", iconKey: "truth" }
  ],
  labReference: {
    title: "المرجع الذكي للتحاليل",
    subtitle: "افهم أرقام تحاليلك الطبية بنفسك. هذا الدليل يساعدك على قراءة نتائج المختبر ومعرفة مؤشرات الخطر.",
    searchPlaceholder: "ابحث عن اسم التحليل (مثال: Test, ALT)...",
    noResults: "لا توجد نتائج لهذا البحث",
    analyzeBtn: "تحليل النتيجة",
    analyzeTitle: "أدخل نتيجتك",
    enterValue: "القيمة",
    resultLabel: "التصنيف",
    status: { low: "منخفض", normal: "طبيعي", high: "مرتفع" },
    categories: { all: "الكل", hormones: "هرمونات", organs: "وظائف أعضاء", blood: "دم ومناعة" },
    labels: { whatIsIt: "ما هو؟", normalRange: "المعدل الطبيعي", elevationMeaning: "ماذا يعني الارتفاع؟", lowMeaning: "ماذا يعني الانخفاض؟", management: "كيف تتصرف؟", cancel: "إلغاء", high: "مرتفع", low: "منخفض" },
    tests: labTestsAr,
  },
  whoIsTitle: "لمن هذا الكتاب؟",
  whoIsSubtitle: "تم تصميم هذا المحتوى بعناية ليخدم فئات محددة بفعالية قصوى",
  targetAudiences: [
    { title: "لاعب كمال الأجسام الطموح", description: "الذي يريد اختصار الطريق وبناء جسم مثالي بأسس علمية.", iconKey: "athlete" },
    { title: "المدرب المحترف", description: "الذي يبحث عن مرجع علمي موثوق لتصميم برامج لاعبيه.", iconKey: "coach" },
    { title: "الباحث عن الحقيقة", description: "الذي سئم من المعلومات المغلوطة والخرافات المنتشرة في الجيم.", iconKey: "truth" },
    { title: "المهتم بصحته", description: "الذي يريد فهم تأثير الهرمونات على الجسم وكيفية الوقاية من أضرارها.", iconKey: "shield" }
  ],
  whoIsClosing: "إذا كنت واحداً من هؤلاء، فهذا الكتاب هو استثمارك الأذكى.",
  whoIsCta: "ابدأ رحلتك الآن",
  checkoutTitle: "إتمام الشراء الآمن",
  billingDetails: "بيانات الفاتورة",
  fullName: "الاسم الكامل",
  emailAddress: "البريد الإلكتروني",
  paymentMethod: "طريقة الدفع",
  creditCard: "بطاقة الائتمان",
  cardNumber: "رقم البطاقة",
  expiryDate: "تاريخ الانتهاء",
  cvc: "رمز الأمان (CVC)",
  payNow: "ادفع الآن",
  cancel: "إلغاء",
  orderSummary: "ملخص الطلب",
  total: "الإجمالي",
  secureCheckout: "دفع آمن ومشفر 100% via Stripe",
  aboutPageTitle: "عن Mr. X-Steroid",
  aboutPageContent: "مشروع Mr. X-Steroid هو ثمرة سنوات من البحث والتجربة...",
  aboutPageStoryTitle: "قصتنا",
  aboutPageStory: "بدأنا كمدونة صغيرة لنشر الوعي...",
  aboutPageMissionTitle: "رسالتنا",
  aboutPageMission: "نشر العلم ومحاربة الجهل الهرموني...",
  contactPageTitle: "تواصل معنا",
  contactPageSubtitle: "نحن هنا لمساعدتك والإجابة على استفساراتك",
  contactFormNamePlaceholder: "اسمك",
  contactFormEmailPlaceholder: "بريدك الإلكتروني",
  contactFormMessagePlaceholder: "كيف يمكننا مساعدتك؟",
  contactFormSubjectPlaceholder: "الموضوع",
  contactFormSubmit: "إرسال الرسالة",
  contactFormSuccessMessage: "تم إرسال رسالتك بنجاح! سنرد عليك قريباً.",
  contactInfoAddress: "دبي، الإمارات العربية المتحدة",
  contactInfoEmail: "support@mrxsteroid.com",
  contactInfoPhone: "+971 50 123 4567",
  contactInfoHours: "من الإثنين للجمعة، 9 صباحاً - 5 مساءً",
  homeLink: "الرئيسية",
  viewOnMap: "الموقع",
  cookieTitle: "ملفات تعريف الارتباط",
  cookieMessage: "نستخدم الكوكيز لتحسين تجربتك.",
  cookieAccept: "موافق",
  cookieReject: "رفض",
  calcTitle: "حاسبة السعرات والماكروز",
  calcSubtitle: "حدد احتياجاتك الغذائية بدقة علمية",
  calcGender: "الجنس",
  calcMale: "ذكر",
  calcFemale: "أنثى",
  calcAge: "العمر",
  calcWeight: "الوزن (كجم)",
  calcHeight: "الطول (سم)",
  calcActivity: "مستوى النشاط",
  calcTrainingStyle: "أسلوب التمرين",
  calcGoal: "الهدف",
  calcCalculate: "احسب الآن",
  calcResults: "نتائجك اليومية",
  calcCalories: "سعر حراري",
  calcProtein: "بروتين",
  calcCarbs: "كاربوهيدرات",
  calcFats: "دهون صحية",
  calcCta: "صمم خطتك الغذائية",
  calcSmartMode: "الوضع الذكي",
  calcBodyFat: "نسبة الدهون",
  calcWater: "احتياج الماء",
  calcLiters: "لتر",
  calcRecalculate: "إعادة الحساب",
  calcGenerateMealPlan: "توليد جدول غذائي بالذكاء الاصطناعي",
  calcGenerating: "جاري التوليد...",
  calcMealPlanTitle: "جدولك الغذائي المقترح",
  calcMealPlanSubtitle: "تم توليده بواسطة AI بناءً على أرقامك",
  calcDisclaimer: "هذه الأرقام تقريبية وتعتمد على معادلات رياضية. استشر أخصائي تغذية.",
  calcTdeeLabel: "إجمالي الطاقة اليومية (TDEE)",
  calcBmrLabel: "معدل الحرق الأساسي (BMR)",
  calcTefLabel: "تأثير الطعام الحراري (TEF)",
  calcBeastTitle: "تصنيف الوحش الكامن",
  calcAnalysisLabel: "تحليل المحرك الذكي",
  calcBmiStatusLabel: "حالة BMI",
  calcShuffleLabel: "تغيير الأصناف (Shuffle)",
  calcAwaitingInputLabel: "بانتظار المدخلات العضلية",
  calcAiEngineLabel: "AI POWERED ENGINE",
  calcAnalyzingLabel: "جاري التحليل...",
  calcMetabolicActiveLabel: "نشاط أيضي مفعل",
  calcAnabolicPotentialLabel: "مستوى بناء العضلات المتوقع",
  calcPredictionTitle: "توقعات الجسد بعد 12 أسبوعاً",
  calcWindowBtn: "نصيحة النافذة الأيضية",
  calcTrainingTime: "وقت التمرين المفضل",
  calcTrainingWindows: {
    morning: "صباحاً",
    afternoon: "ظهراً",
    evening: "مساءً",
    advice: "بما أن تمرينك {time}، ننصح بتركيز 40% من الكاربوهيدرات حول نافذة التمرين."
  },
  calcBeastNames: {
    cut: "Shredded Beast (الوحش الممزق)",
    maintain: "Hybrid Warrior (المحارب الهجين)",
    bulk: "Anabolic Titan (العملاق الأنابوليكي)"
  },
  calcPredictions: {
    cut: "ستظهر عضلاتك بشكل حاد، مع اختفاء الدهون العنيدة حول الخصر. ستبرز التفاصيل التي لم ترها من قبل.",
    maintain: "تطور ملحوظ في كثافة العضلات مع الحفاظ على مستوى دهون منخفض. جسد رياضي قوي ومتناسق.",
    bulk: "زيادة هائلة في الكتلة العضلية والقوة. ستبدو أضخم في ملابسك مع امتلاء عضلي واضح في الأكتاف والصدر."
  },
  calcSelectGoal: { cut: "تنشيف (حرق دهون)", maintain: "محافظة على الوزن", bulk: "تضخيم (بناء عضل)" },
  calcMealNames: ["الإفطار", "الغداء", "قبل التمرين", "العشاء"],
  calcActivityLevels: { sedentary: "خامل (لا تمرين)", light: "خفيف (1-3 أيام/أسبوع)", moderate: "متوسط (3-5 أيام/أسبوع)", active: "نشيط (6-7 أيام/أسبوع)", veryActive: "نشيط جداً (تمرين مرتين يومياً)" },
  calcTrainingStyles: { hypertrophy: "بناء عضلي (Hypertrophy)", strength: "قوة بدنية (Strength)", endurance: "تحمل (Endurance)" },
  geneticCalculator: {
    title: "حاسبة الإمكانيات الجينية",
    subtitle: "اكتشف الحد الأقصى الطبيعي لحجم عضلاتك والمستوى الذي يمكن الوصول إليه بالهرمونات بناءً على نموذج Casey Butt.",
    labels: {
      height: "الطول (سم)",
      wrist: "محيط المعصم (سم)",
      ankle: "محيط الكاحل (سم)",
      bodyFat: "نسبة الدهون المستهدفة (%)",
      frameSize: "حجم الهيكل",
      boneThickness: "سماكة العظام",
      lowerBody: "بنية الجزء السفلي"
    },
    modelLabel: "بناءً على نموذج Casey Butt",
    awaitingDataTitle: "بانتظار البيانات...",
    frameOptions: { small: "صغير", medium: "متوسط", large: "ضخم" },
    unknownMeasurements: "لا تعرف قياساتك؟ قدرها تقريباً",
    cta: "تحليل إمكانياتي",
    reset: "إعادة تعيين",
    yourBodyType: "نوع جسمك",
    resultTitle: "تحليل إمكانياتك العضلية",
    naturalLabel: "أقصى وزن طبيعي",
    enhancedLabel: "أقصى وزن مع الهرمونات",
    differenceLabel: "الفرق المتوقع",
    disclaimer: "هذه الحسابات تعتمد على معادلات رياضية وإحصائية ولا تعتبر حتمية. الجينات الفردية تلعب دوراً كبيراً.",
    unlockMsg: "للوصول لهذا المستوى، تحتاج للمعرفة الصحيحة.",
    errorMsg: "الرجاء التأكد من إدخال جميع البيانات بشكل صحيح."
  },
  halfLifeVisualizer: {
    title: "محاكي نصف العمر (Half-Life)",
    subtitle: "شاهد كيف يتراكم الهرمون في دمك وتجنب التذبذب.",
    compoundLabel: "المادة",
    dosageLabel: "الجرعة (ملجم)",
    durationLabel: "المدة (أسبوع)",
    frequencyLabel: "تكرار الحقن",
    yAxis: "مستوى الهرمون في الدم",
    xAxis: "الأيام",
    pctZone: "منطقة الخروج الآمن (PCT)",
    pctStartMsg: "يمكنك بدء التنظيف هنا",
    peakLevelMsg: "أعلى تركيز",
    addToStackBtn: "أضف للStack",
    activeStackTitle: "المواد المفعلة",
    serumTitle: "تركيز المادة في الدم",
    peakLabel: "القمة",
    emptyStackMsg: "أضف مواد لتشاهد منحنى التراكم",
    compounds: commonCompounds,
    frequencies: { ed: "يومياً (ED)", eod: "يوم بعد يوم (EOD)", e3d: "كل 3 أيام (E3D)", e7d: "أسبوعياً (E7D)" },
    tooltipDay: "اليوم",
    tooltipLevel: "المستوى",
    tooltipPctReady: "جاهز للـ PCT",
    tooltipWait: "انتظر",
    tooltipInject: "حقنة",
    analysis: {
      title: "تحليل الدورة الهرمونية",
      prosTitle: "المميزات المتوقعة",
      consTitle: "المخاطر المحتملة",
      adviceTitle: "رأي مستر إكس",
      pros: ["استقرار مستويات الدم", "فترات حقن مريحة", "أقل عرضة للأعراض الجانبية الحادة"],
      cons: ["تراكم بطيء للمادة", "فترة خروج طويلة (Clearance)", "يتطلب تخطيط دقيق للـ PCT"],
      advice: "هذا الرسم البياني يوضح لك كيف تتراكم المواد في دمك. الثبات هو المفتاح لتجنب الأعراض الجانبية. لاحظ متى يبدأ الـ PCT."
    }
  },
  injectionMap: {
    title: "خريطة الحقن الآمن",
    subtitle: "دليل تفاعلي لأماكن الحقن العضلي، المخاطر، والأدوات المناسبة.",
    viewFront: "من الأمام",
    viewBack: "من الخلف",
    needleSizeLabel: "مقاس الإبرة",
    maxVolumeLabel: "أقصى كمية",
    painLevelLabel: "مستوى الألم",
    riskLevelLabel: "مستوى الخطورة",
    recoveryLabel: "وقت التعافي",
    lastInjectedLabel: "آخر حقن",
    logInjectionBtn: "سجل حقنة هنا",
    suggestBtn: "اقترح مكاناً",
    suggesting: "جاري الاقتراح...",
    status: { ready: "جاهز", recovering: "في التعافي", warning: "تجنب" },
    riskLevel: "مستوى الخطورة",
    tapToExplore: "اضغط على أي عضلة لمعرفة التفاصيل",
    interactiveMapLabel: "خريطة تفاعلية",
    medicalInsightLabel: "رؤية طبية",
    riskLevels: {
      low: "منخفض",
      high: "عالي"
    },
    goldenHourTitle: "بعد الحقن (The Golden Hour)",
    goldenHourDesc: "بمجرد الحقن، يبدأ التحول! يتدفق المركب ليعيد صياغة أنسجتك، ويزيد من تخليق البروتين فوراً، مما يحول تمرينك القادم إلى انفجار من القوة",
    goldenAdvice: "التدوير هو السر. لا ترهق عضلة واحدة؛ اجعل جسدك خريطة متوازنة للنمو",
    rotationTrackerTitle: "تتبع التدوير الذكي",
    cumulativeGrowthLabel: "النمو التراكمي",
    efficiencyLabel: "كفاءة الامتصاص",
    comfortableSpot: "الأكثر راحة",
    sites: injectionSitesAr,
  },
  timeUnits: {
    days: "أيام",
    hours: "ساعات",
    minutes: "دقيقة",
    seconds: "ثانية"
  },
  offerExpired: "انتهى العرض!",
  heroEditions: {
    ar: "نسخة عربية",
    en: "English Edition",
    he: "מהדורה עברית"
  },
  mealPlanTitle: "خطة الوجبات",
  mealPlanBtn: "توليد خطة",
  mealPlanLoading: "جاري التحضير...",
  mealPlanError: "حدث خطأ",
  timelineTitle: "الجدول الزمني للتحول",
  timelineSubtitle: "ماذا يحدث داخل جسمك أسبوعاً بأسبوع خلال الكورس؟ رحلة بيولوجية كاملة.",
  timelinePhases: [
    { week: "1-2", title: "مرحلة الإطلاق (The Kickstart)", shortDesc: "بداية دخول الهرمون وتغيرات أولية", iconKey: "spark", stats: { strength: 20, hypertrophy: 10, waterRetention: 30, fatLoss: 5, mood: 80 }, details: { biological: "ارتفاع حاد في مستويات الأندروجين في الدم. زيادة احتباس النيتروجين في العضلات.", feeling: "زيادة ملحوظة في الرغبة الجنسية، تحسن المزاج، وشعور بـ 'البمب' المستمر.", action: "التزم بجدول التغذية 100%. اشرب 4 لتر ماء يومياً." } },
    { week: "3-6", title: "مرحلة الانفجار (Hypertrophy Surge)", shortDesc: "النمو العضلي السريع والزيادة الوزنية", iconKey: "muscle", stats: { strength: 60, hypertrophy: 70, waterRetention: 50, fatLoss: 10, mood: 90 }, details: { biological: "تشبع المستقبلات. تخليق البروتين في أقصى معدلاته.", feeling: "قوة خرافية في الجيم. الملابس تضيق. شهية مفتوحة.", action: "زد أوزان التمرين. راقب ضغط الدم والإستروجين." } },
    { week: "7-10", title: "مرحلة الصلابة (Hardening)", shortDesc: "ثبات الوزن وبداية حرق الدهون", iconKey: "trophy", stats: { strength: 90, hypertrophy: 90, waterRetention: 40, fatLoss: 40, mood: 70 }, details: { biological: "استقرار مستويات الدم. الجسم يبدأ في استخدام الدهون للطاقة بكفاءة.", feeling: "شكل العضلات يصبح أصعب وأكثر تفصيلاً.", action: "ابدأ الكارديو بانتظام. راقب وظائف الكبد." } },
    { week: "11-12", title: "مرحلة الختام (Peaking)", shortDesc: "اللمسات الأخيرة قبل الخروج", iconKey: "flag", stats: { strength: 100, hypertrophy: 100, waterRetention: 20, fatLoss: 60, mood: 60 }, details: { biological: "أقصى كثافة عضلية. الاستعداد لسحب الهرمونات.", feeling: "إرهاق بسيط. جاهزية تامة.", action: "خطط للـ PCT. ابدأ في تقليل السعرات قليلاً." } }
  ],
  timelineLabels: { strength: "القوة", hypertrophy: "الضخامة", water: "احتباس الماء", fatLoss: "حرق الدهون", mood: "المزاج", biologicalTitle: "ماذا يحدث بيولوجياً؟", feelingTitle: "كيف ستشعر؟", actionTitle: "ماذا يجب أن تفعل؟", phaseLabel: "المرحلة" },
  salesToast: { purchased: "اشترى النسخة الكاملة", verified: "موثوق", justNow: "الآن", fromLabel: "من" },
  audioPlayer: { title: "مقدمة صوتية من المؤلف", subtitle: "استمع لرسالة خاصة من جورج موريس", duration: "02:15" },
  aiChat: { fabLabel: "مساعد Mr. X", title: "مستر إكس AI", subtitle: "مساعدك الذكي للإجابة عن الأسئلة", placeholder: "اكتب سؤالك هنا...", send: "إرسال", disclaimer: "الذكاء الاصطناعي قد يخطئ. استشر طبيباً دائماً.", welcomeMessage: "أهلاً يا بطل. أنا نسخة الذكاء الاصطناعي من مستر إكس. كيف أقدر أساعدك اليوم في تمرينك أو تغذيتك؟" },
  quiz: {
    title: "هل أنت جاهز للكورس؟",
    subtitle: "اختبار سريع يحدد مستواك وما إذا كنت مستعداً لدخول عالم الهرمونات أو تحتاج للمزيد من الأساسيات.",
    startBtn: "ابدأ الاختبار",
    questionLabel: "سؤال",
    totalLabel: "الإجمالي",
    questions: [
      {
        question: "كم سنة تدريب منتظم ومستمر لديك؟",
        options: [
          { text: "أقل من 3 سنوات", score: 0 },
          { text: "أكثر من 5 سنوات", score: 1 }
        ]
      },
      {
        question: "ما هي نسبة دهونك الحالية؟",
        options: [
          { text: "فوق 15% (يوجد دهون ظاهرة)", score: 0 },
          { text: "أقل من 12% (عضلات البطن ظاهرة)", score: 1 }
        ]
      },
      {
        question: "هل تزن طعامك وتحسب سعراتك بدقة يومياً؟",
        options: [
          { text: "أحياناً / آكل طعام صحي فقط", score: 0 },
          { text: "نعم، بالميزان وبالجرام", score: 1 }
        ]
      },
      {
        question: "هل تعرف ما هو الـ PCT (بروتوكول التنظيف)؟",
        options: [
          { text: "سمعت عنه / لا أعرفه جيداً", score: 0 },
          { text: "نعم، أعرف أدوية SERMs و HCG", score: 1 }
        ]
      },
      {
        question: "هل قمت بتحليل وظائف الكلى والكبد والهرمونات مؤخراً؟",
        options: [
          { text: "لا / منذ فترة طويلة", score: 0 },
          { text: "نعم، وأعرف أرقامي جيداً", score: 1 }
        ]
      }
    ],
    results: {
      natural: {
        title: "خليك طبيعي (حالياً)",
        desc: "أنت تمتلك إمكانيات كبيرة للتطور الطبيعي. استخدام الهرمونات الآن قد يضرك أكثر مما ينفعك لأن أساساتك (التغذية/التدريب) تحتاج لضبط. هذا الكتاب سيساعدك في الوصول لأقصى إمكاناتك الطبيعية وتجهيزك للمستقبل.",
        cta: "احصل على الكتاب لتعظيم نتائجك"
      },
      enhanced: {
        title: "أنت جاهز للمستوى التالي",
        desc: "لديك الخبرة والأساس القوي. الخطوة القادمة تتطلب علماً دقيقاً لحمايتك. أنت لا تحتاج لنصائح عشوائية، بل تحتاج لمنهج علمي صارم وجداول دقيقة كما في هذا الكتاب.",
        cta: "احصل على الكتاب وابدأ الكورس"
      }
    }
  },
  dailyIQ: {
    title: "تحدي الـ Steroid IQ اليومي",
    subtitle: "سؤال واحد جديد كل 24 ساعة. جاوب صح واحصل على خصم فوري.",
    challengeLabel: "تحدي اليوم",
    winTitle: "إجابة صحيحة! يا وحش",
    winDesc: "لقد أثبتت خبرتك. ها هو كود الخصم الخاص بك (صالح لمدة 60 دقيقة فقط).",
    loseTitle: "إجابة خاطئة",
    loseDesc: "لا تقلق، التعلم جزء من اللعبة. عد غداً لسؤال جديد ومحاولة أخرى.",
    explanationLabel: "الشرح:",
    copySuccess: "تم نسخ الكود بنجاح!",
    toastCorrect: "رائع! تم تفعيل كוד الخصم بنجاح.",
    couponLabel: "كود الخصم",
    claimBtn: "نسخ الكود والشراء",
    expiresIn: "ينتهي العرض في:",
    comeBackTomorrow: "السؤال القادم متاح خلال:",
    questions: [
      {
        id: 1,
        question: "ما هو الفارق الأساسي بين النولفادكس (Nolvadex) والكلوميد (Clomid) في الـ PCT؟",
        options: ["كلاهما نفس الشيء تماماً", "النولفادكس أفضل لمنع الجينو، الكلوميد أقوى لتحفيز الـ LH", "الكلوميد يمنع الجينو أفضل من النولفادكس", "النولفادكس هو مضاد أروماتيز (AI)"],
        correctIndex: 1,
        explanation: "النولفادكس يمنع ارتباط الاستروجين بالثدي (يمنع الجينو)، بينما الكلوميد يعمل بشكل أقوى على الغدة النخامية لرفع الـ LH وعودة التستوستيرون."
      },
      {
        id: 2,
        question: "ما هو متوسط فترة نصف العمر (Half-Life) لـ Testosterone Enanthate؟",
        options: ["24 ساعة", "2-3 أيام", "4.5-5 أيام", "14 يوم"],
        correctIndex: 2,
        explanation: "نصف عمر التست إنثات يتراوح علمياً بين 4.5 إلى 5 أيام، مما يجعله مناسباً للحقن مرتين أسبوعياً."
      },
      {
        id: 3,
        question: "أي من المواد التالية يعتبر الأكثر سمية للكبد (Hepatotoxic)؟",
        options: ["Testosterone Propionate", "Injectable Primobolan", "Dianabol (Oral)", "Deca Durabolin"],
        correctIndex: 2,
        explanation: "المواد الفموية (Orals) مثل الدايانبول تكون معدلة بـ 17-alpha-alkylated للمرور من الكبد، مما يسبب إجهاداً عالياً له."
      }
    ]
  },
  cycleArchitect: {
    title: "المزامنة الذكية لجدول الكورس (Smart Cycle Synchronizer)",
    subtitle: "صمم بروتوكولك بدقة، واحصل على جدول تنفيذي حي (ICS) مع تدوير الحقن وتحديد موعد التنظيف.",
    presetsTitle: "قوالب جاهزة:",
    stealthModeLabel: "وضع الخصوصية (أسماء وهمية)",
    rotationLabel: "تدوير أماكن الحقن تلقائياً",
    pctLabel: "تحديد موعد بداية التنظيف (PCT)",
    stealthAliases: ["تمرين كارديو", "فيتامينات", "اجتماع عمل", "جلسة علاج طبيعي", "موعد جيم"],
    rotationSites: ["مؤخرة يمين (Dorso)", "مؤخرة يسار (Dorso)", "كتف أيمن", "كتف أيسر", "فخذ أيمن خارجي", "فخذ أيسر خارجي"],
    presets: {
      beginnerBulk: "تضخيم للمبتدئين",
      cutting: "تنشيف متقدم",
      trt: "علاج تعويضي (TRT)"
    },
    form: {
      startDateLabel: "تاريخ البدء",
      compoundLabel: "المادة",
      dosageLabel: "الجرعة (ملجم)",
      frequencyLabel: "التكرار",
      weeksLabel: "المدة (أسبوع)",
      halfLifeLabel: "نصف العمر (أيام) - لحساب التنظيف",
      addCompoundBtn: "أضف مادة",
      removeBtn: "حذف",
      frequencies: {
        daily: "يومياً (ED)",
        eod: "يوم بعد يوم (EOD)",
        twiceWeekly: "مرتين أسبوعياً (Mon/Thu)",
        weekly: "أسبوعياً (Once)"
      }
    },
    premiumLock: {
      lockedTitle: "ميزة حصرية للمشتركين",
      lockedDesc: "تصدير الجدول الزمني الذكي مع ميزات التدوير وحماية الخصوصية وحساب الـ PCT متاح فقط للمشتركين.",
      verifyBtn: "التحقق من الشراء وفتح الميزة",
      exportBtn: "تصدير للتقويم (.ics)",
      placeholder: "أدخل بريدك الإلكتروني أو رقم الطلب",
      successMsg: "تم التحقق! الميزة مفتوحة الآن.",
      errorMsg: "لم يتم العثور على طلب بهذا البيانات."
    }
  },
  units: {
    mg: "مجم",
    g: "جم",
    ml: "مل",
    kcal: "سعرة",
    days: "أيام",
    weeks: "أسابيع",
    percentage: "%",
    liters: "لتر",
    ed: "يومياً",
    eod: "يوم بعد يوم",
    twiceWeekly: "مرتين أسبوعياً",
    weekly: "أسبوعياً"
  }
};

export const enContent: ContentStrings = {
  navAiTools: "Bodybuilder's Ai Tools",
  navPremiumResources: "Premium Resources",
  navFeatures: "Features",
  navToolNames: {
    macro: "Macro Calculator",
    injection: "Injection Map",
    halflife: "Half-Life Plotter",
    lab: "Smart Lab Reference",
    genetic: "Genetic Potential",
    cycleArchitect: "Cycle Calendar Exporter",
  },
  themeNames: {
    light: "Light",
    dark: "Dark",
    system: "System",
  },
  backToHome: "Back to Home",
  seoTitle: "Mr. X-Steroid | The Ultimate Bodybuilding & Steroid Guide",
  seoDescription: "Discover the ultimate scientific guide to muscle building and anabolic cycles. Mr. X-Steroid by George Mourice offers bulking/cutting plans, safety protocols, and a comprehensive supplement guide.",
  seoKeywords: seoKeywordsEnglish,

  heroTitle: "Mr. X-Steroid",
  heroSubtitle: "Discover the ultimate muscle-building guide and hormonal cycle handbook: A comprehensive scientific approach backed by detailed charts and easy-to-understand tables. Unlock the secrets of anabolic hormones with practical, clear plans to help you achieve immense strength and a sculpted, powerful physique.",
  heroCta: "Get Your Copy Now",
  downloadPreview: "Download Free Preview (PDF)",
  audioPreviewBtn: "Listen to Intro",
  authorSection: "About the Author",
  authorName: "George Mourice",
  authorBio: "Author and cover designer, George presents a guide that isn't just information—it's armor. This book is a message to every coach and athlete who believes that knowledge and science are the foundation of excellence.",
  featuresTitle: "What's Inside?",
  sneakPeekTitle: "Exclusive Sneak Peek",
  sneakPeekSubtitle: "See what professional cycle charts look like. Part 1 is available; the rest is encrypted to protect the content.",
  unlockText: "Buy Book to Unlock Full Dosages",
  buyNow: "Buy Now",
  contact: "Contact Us",
  copyright: "All Rights Reserved © 2025 George Mourice",
  features: [
    {
      title: "Comprehensive Hormone Charts: Zero to Hero",
      description: "No more guessing or relying on 'bro-science'. The book provides precise, scientifically structured cycle charts, taking you safely from beginner to advanced levels. Clear Bulking plans for massive mass and Cutting plans for shredded definition, all with exact dosages and timing.",
      iconKey: "chart"
    },
    {
      title: "The Art of 'Safe Exit': Strict PCT Protocols",
      description: "Starting a cycle is easy; exiting safely is the art. The book details how to protect your hormonal system and rapidly restore natural testosterone production to avoid muscle crash and depression. Proven PCT plans with meds and dosages.",
      iconKey: "exit"
    },
    {
      title: "Supplement Guide: The Truth, No Marketing",
      description: "Save your money. Stop buying useless powders. This guide reveals which supplements actually work (like Creatine, Whey, Essentials) and exposes the commercial scams draining your wallet.",
      iconKey: "shield"
    }
  ],
  testimonials: [
    { name: "Ahmed S.", title: "Amateur Bodybuilder", text: "I was lost in conflicting internet info. This book put me on the right track and saved me years of trial and error." },
    { name: "Mohamed A.", title: "Personal Trainer", text: "An indispensable reference for any coach who wants to be honest with clients and protect their health." },
    { name: "Karim M.", title: "Local Champion", text: "The charts in this book are incredibly precise and helped me reach the best shape of my life." }
  ],
  testimonialsTitle: "What Readers Say",
  faqTitle: "Frequently Asked Questions",
  faqSubtitle: "Direct answers to common queries",
  faqSearchPlaceholder: "Search questions...",
  faqCategories: { all: "All", safety: "Safety", general: "General", legal: "Legal", women: "Women", strategy: "Strategy" },
  faqs: [
    { question: "Is this book suitable for total beginners?", answer: "Yes, it starts from the basics, explaining medical and gym terms in simple language before diving into complex charts.", category: "general" },
    { question: "Does it include nutrition plans?", answer: "Yes, while focused on hormones, it includes a full chapter on proper nutrition during a cycle, counting calories, and macros.", category: "strategy" },
    { question: "How do I get the book after payment?", answer: "Once payment is complete, a direct PDF download link will be emailed to you immediately.", category: "general" }
  ],
  privacyPolicy: "Privacy Policy",
  termsOfService: "Terms of Service",
  refundPolicy: "Refund Policy",
  legalDisclaimer: "Legal Disclaimer",
  aboutUs: "About Us",
  legal: "Legal",
  quickLinks: "Quick Links",
  privacyPolicyContent: "We respect your privacy and are committed to protecting your personal data...",
  termsOfServiceContent: "By using this website, you agree to the following terms...",
  refundPolicyContent: "Due to the nature of digital products, refunds are not available once the file is downloaded...",
  pricingTitle: "Choose Your Plan",
  pricingSubtitle: "A small investment in your health and knowledge will save you thousands of dollars and endless health risks.",
  pricingTiers: [
    { name: "Pro Bundle", price: "$49.99", originalPrice: "$79.99", description: "Full Book + Exclusive Tools", features: ["Full Book (300+ Pages)", "Dosage Calculator Excel", "Access to Private Community", "Bonus Supplement Guide"], buttonText: "Best Seller", isPopular: true, popularLabel: "Best Value" },
    { name: "Coaching Package", price: "$199.99", description: "Personal Training + Book", features: ["All Pro Features", "Online Consultation (30 min)", "Custom Cycle Design", "1 Month Follow-up"], buttonText: "Start Transformation" }
  ],
  disclaimerTitle: "Important Warning & Disclaimer",
  disclaimerContent: fullEnglishDisclaimer,
  agreeButton: "I agree & I take full responsibility and I am over 18+",
  disclaimerAcknowledgement: "By clicking the button below, you acknowledge that you have read, understood, and agreed to all terms listed above.",
  importantDisclaimer: "Important Warning",
  downloadFullBook: "Download Full Book",
  processing: "Processing...",
  purchaseSuccess: "Purchase Successful! Thank you.",
  benefitsTitle: "Why is this your best investment?",
  benefitsSubtitle: "We don't just sell pages; we sell you years of distilled experience and science to shortcut your path.",
  benefits: [
    { title: "Save Time & Money", description: "Instead of wasting years on trial and error and buying useless supplements, get the essence immediately.", iconKey: "time" },
    { title: "Safety First", description: "Learn how to protect yourself from side effects and handle them with medical professionalism.", iconKey: "shield" },
    { title: "The Naked Truth", description: "No marketing for specific products. Only scientific truth is what you'll read here.", iconKey: "truth" }
  ],
  labReference: {
    title: "Smart Lab Reference",
    subtitle: "Understand your bloodwork yourself. This guide helps you read lab results and identify danger signs.",
    searchPlaceholder: "Search test name (e.g., Test, ALT)...",
    noResults: "No results found",
    analyzeBtn: "Analyze Result",
    analyzeTitle: "Enter Your Value",
    enterValue: "Value",
    resultLabel: "Status",
    status: { low: "Low", normal: "Normal", high: "High" },
    categories: { all: "All", hormones: "Hormones", organs: "Organs", blood: "Blood" },
    labels: { whatIsIt: "What is it?", normalRange: "Normal Range", elevationMeaning: "High Meaning", lowMeaning: "Low Meaning", management: "Management", cancel: "Cancel", high: "High", low: "Low" },
    tests: labTestsEn,
  },
  whoIsTitle: "Who is this book for?",
  whoIsSubtitle: "This content is carefully designed to serve specific groups effectively",
  targetAudiences: [
    { title: "Aspiring Bodybuilder", description: "Who wants to shortcut the path and build a perfect physique on scientific grounds.", iconKey: "athlete" },
    { title: "Professional Coach", description: "Looking for a reliable scientific reference to design client programs.", iconKey: "coach" },
    { title: "Truth Seeker", description: "Tired of misinformation and myths spreading in the gym.", iconKey: "truth" },
    { title: "Health Conscious", description: "Who wants to understand hormonal impact and how to prevent damage.", iconKey: "shield" }
  ],
  whoIsClosing: "If you are one of these, this book is your smartest investment.",
  whoIsCta: "Start Your Journey",
  checkoutTitle: "Secure Checkout",
  billingDetails: "Billing Details",
  fullName: "Full Name",
  emailAddress: "Email Address",
  paymentMethod: "Payment Method",
  creditCard: "Credit Card",
  cardNumber: "Card Number",
  expiryDate: "Expiry Date",
  cvc: "CVC",
  payNow: "Pay Now",
  cancel: "Cancel",
  orderSummary: "Order Summary",
  total: "Total",
  secureCheckout: "100% Secure & Encrypted via Stripe",
  aboutPageTitle: "About Mr. X-Steroid",
  aboutPageContent: "The Mr. X-Steroid project is the fruit of years of research...",
  aboutPageStoryTitle: "Our Story",
  aboutPageStory: "We started as a small blog...",
  aboutPageMissionTitle: "Our Mission",
  aboutPageMission: "Spreading science and fighting hormonal ignorance...",
  contactPageTitle: "Contact Us",
  contactPageSubtitle: "We are here to help and answer your queries",
  contactFormNamePlaceholder: "Your Name",
  contactFormEmailPlaceholder: "Your Email",
  contactFormMessagePlaceholder: "How can we help?",
  contactFormSubjectPlaceholder: "Subject",
  contactFormSubmit: "Send Message",
  contactFormSuccessMessage: "Message sent successfully! We'll reply soon.",
  contactInfoAddress: "Dubai, UAE",
  contactInfoEmail: "support@mrxsteroid.com",
  contactInfoPhone: "+971 50 123 4567",
  contactInfoHours: "Mon-Fri, 9am - 5pm",
  homeLink: "Home",
  viewOnMap: "Location",
  cookieTitle: "Cookies",
  cookieMessage: "We use cookies to improve experience.",
  cookieAccept: "Accept",
  cookieReject: "Reject",
  calcTitle: "Macro & Calorie Calculator",
  calcSubtitle: "Define your nutritional needs with scientific precision",
  calcGender: "Gender",
  calcMale: "Male",
  calcFemale: "Female",
  calcAge: "Age",
  calcWeight: "Weight (kg)",
  calcHeight: "Height (cm)",
  calcActivity: "Activity Level",
  calcTrainingStyle: "Training Style",
  calcGoal: "Goal",
  calcCalculate: "Calculate Now",
  calcResults: "Your Daily Results",
  calcCalories: "Calories",
  calcProtein: "Protein",
  calcCarbs: "Carbs",
  calcFats: "Fats",
  calcCta: "Generate Meal Plan",
  calcSmartMode: "Smart Mode",
  calcBodyFat: "Body Fat %",
  calcWater: "Water Need",
  calcLiters: "L",
  calcRecalculate: "Recalculate",
  calcGenerateMealPlan: "Generate AI Meal Plan",
  calcGenerating: "Generating...",
  calcMealPlanTitle: "Your Suggested Meal Plan",
  calcMealPlanSubtitle: "Generated by AI based on your macros",
  calcDisclaimer: "These figures are estimates based on formulas. Consult a nutritionist.",
  calcTdeeLabel: "Total Daily Energy Expenditure (TDEE)",
  calcBmrLabel: "Basal Metabolic Rate (BMR)",
  calcTefLabel: "Thermic Effect of Food (TEF)",
  calcBeastTitle: "Dormant Beast Classification",
  calcAnalysisLabel: "SMART ENGINE ANALYSIS",
  calcBmiStatusLabel: "BMI Status",

  calcShuffleLabel: "Shuffle Meals",
  calcAwaitingInputLabel: "Awaiting Muscle Input",
  calcAiEngineLabel: "AI POWERED ENGINE",
  calcAnalyzingLabel: "Analyzing Data...",
  calcMetabolicActiveLabel: "Metabolic Drive Active",
  calcAnabolicPotentialLabel: "EXPECTED ANABOLIC POTENTIAL",
  calcWindowBtn: "Metabolic Window Insight",
  calcTrainingTime: "Preferred Training Time",
  calcTrainingWindows: {
    morning: "Morning",
    afternoon: "Afternoon",
    evening: "Evening",
    advice: "Since you train in the {time}, focus 40% of your carbs around the workout window."
  },
  calcPredictionTitle: "12-Week Body Prediction",
  calcBeastNames: {
    cut: "Shredded Beast",
    maintain: "Hybrid Warrior",
    bulk: "Anabolic Titan"
  },
  calcPredictions: {
    cut: "Your muscles will look sharp, with stubborn fat around the waist disappearing. You'll see details you've never seen before.",
    maintain: "Significant improvement in muscle density while maintaining low body fat. A powerful and symmetrical athletic physique.",
    bulk: "Massive increase in muscle mass and strength. You'll look bigger in clothes with obvious muscle fullness in shoulders and chest."
  },
  calcSelectGoal: { cut: "Cutting (Fat Loss)", maintain: "Maintenance", bulk: "Bulking (Muscle Gain)" },
  calcMealNames: ["Breakfast", "Lunch", "Pre-Workout", "Dinner"],
  calcActivityLevels: { sedentary: "Sedentary (No exercise)", light: "Light (1-3 days/week)", moderate: "Moderate (3-5 days/week)", active: "Active (6-7 days/week)", veryActive: "Very Active (2x daily)" },
  calcTrainingStyles: { hypertrophy: "Hypertrophy", strength: "Strength", endurance: "Endurance" },
  geneticCalculator: {
    title: "Genetic Potential Calculator",
    subtitle: "Discover your natural maximum muscular potential based on the Casey Butt model.",
    labels: {
      height: "Height (cm)",
      wrist: "Wrist Girth (cm)",
      ankle: "Ankle Girth (cm)",
      bodyFat: "Target Body Fat (%)",
      frameSize: "Frame Size",
      boneThickness: "Bone thickness",
      lowerBody: "Lower body structure"
    },
    modelLabel: "Based on Casey Butt Model",
    awaitingDataTitle: "Awaiting Data...",
    frameOptions: { small: "Small", medium: "Medium", large: "Large" },
    unknownMeasurements: "Don't know measurements? Estimate",
    cta: "Analyze Potential",
    reset: "Reset",
    yourBodyType: "Your Body Type",
    resultTitle: "Muscular Potential Analysis",
    naturalLabel: "Max Natural Weight",
    enhancedLabel: "Max Enhanced Weight",
    differenceLabel: "Expected Difference",
    disclaimer: "These calculations are estimates based on statistical models. Individual genetics play a huge role.",
    unlockMsg: "To reach this level, you need the right knowledge.",
    errorMsg: "Please ensure all fields are filled correctly."
  },
  halfLifeVisualizer: {
    title: "Half-Life Plotter",
    subtitle: "Visualize hormone accumulation and avoid instability.",
    compoundLabel: "Compound",
    dosageLabel: "Dosage (mg)",
    durationLabel: "Duration (weeks)",
    frequencyLabel: "Frequency",
    yAxis: "Blood Level",
    xAxis: "Days",
    pctZone: "PCT Safe Zone",
    pctStartMsg: "Start PCT Here",
    peakLevelMsg: "Peak Level",
    addToStackBtn: "Add to Stack",
    activeStackTitle: "Active Compounds",
    serumTitle: "Serum Concentration",
    peakLabel: "Peak",
    emptyStackMsg: "Add compounds to visualize the cycle",
    compounds: commonCompounds,
    frequencies: { ed: "Every Day (ED)", eod: "Every Other Day (EOD)", e3d: "Every 3 Days (E3D)", e7d: "Weekly (E7D)" },
    tooltipDay: "Day",
    tooltipLevel: "Level",
    tooltipPctReady: "PCT Ready",
    tooltipWait: "Wait",
    tooltipInject: "Injection",
    analysis: {
      title: "Cycle Analysis",
      prosTitle: "Expected Benefits",
      consTitle: "Potential Risks",
      adviceTitle: "Mr. X's Verdict",
      pros: ["Stable blood levels", "Convenient injection frequency", "Lower risk of acute side effects"],
      cons: ["Slow saturation", "Long clearance time", "Requires careful PCT planning"],
      advice: "This chart visualizes how compounds accumulate in your blood. Stability is key to avoiding side effects. Note when PCT starts."
    }
  },
  timeUnits: {
    days: "Days",
    hours: "Hours",
    minutes: "Mins",
    seconds: "Secs"
  },
  offerExpired: "Offer Expired!",
  heroEditions: {
    ar: "نسخة عربية",
    en: "English Edition",
    he: "מהדורה עברית"
  },
  injectionMap: {
    title: "Safe Injection Map",
    subtitle: "Interactive guide for IM injection sites, risks, and tools.",
    viewFront: "Front View",
    viewBack: "Back View",
    needleSizeLabel: "Needle Size",
    maxVolumeLabel: "Max Volume",
    painLevelLabel: "Pain Level",
    riskLevelLabel: "Risk Level",
    recoveryLabel: "Recovery Time",
    lastInjectedLabel: "Last Injected",
    logInjectionBtn: "Log Injection",
    suggestBtn: "Suggest Site",
    suggesting: "Suggesting...",
    status: { ready: "Ready", recovering: "Recovering", warning: "Avoid" },
    riskLevel: "Risk Level",
    tapToExplore: "Tap any muscle for details",
    interactiveMapLabel: "Interactive 3D Map",
    medicalInsightLabel: "Medical Insight",
    riskLevels: {
      low: "Low",
      high: "High"
    },
    goldenHourTitle: "Post-Injection (The Golden Hour)",
    goldenHourDesc: "Transformation begins immediately! The compound flows to reshape your tissues, instantly boosting protein synthesis, turning your next workout into an explosion of power.",
    goldenAdvice: "Rotation is key. Don't exhaust one muscle; make your body a balanced map of growth.",
    rotationTrackerTitle: "Smart Rotation Tracker",
    cumulativeGrowthLabel: "Cumulative Growth",
    efficiencyLabel: "Absorption Efficiency",
    comfortableSpot: "Most Comfortable",
    sites: injectionSitesEn,
  },
  mealPlanTitle: "Meal Plan",
  mealPlanBtn: "Generate Plan",
  mealPlanLoading: "Preparing...",
  mealPlanError: "Error occurred",
  timelineTitle: "Transformation Timeline",
  timelineSubtitle: "What happens inside your body week by week? A full biological journey.",
  timelinePhases: [
    { week: "1-2", title: "The Kickstart", shortDesc: "Initial saturation and first changes", iconKey: "spark", stats: { strength: 20, hypertrophy: 10, waterRetention: 30, fatLoss: 5, mood: 80 }, details: { biological: "Sharp rise in blood androgen levels. Nitrogen retention increases.", feeling: "High libido, improved mood, constant pumps.", action: "Stick to diet 100%. Drink 4L water daily." } },
    { week: "3-6", title: "Hypertrophy Surge", shortDesc: "Rapid growth and weight gain", iconKey: "muscle", stats: { strength: 60, hypertrophy: 70, waterRetention: 50, fatLoss: 10, mood: 90 }, details: { biological: "Receptor saturation. Protein synthesis at max.", feeling: "Insane strength. Clothes get tight. High appetite.", action: "Increase weights. Monitor BP and Estrogen." } },
    { week: "7-10", title: "Hardening Phase", shortDesc: "Weight stabilizes, fat burning starts", iconKey: "trophy", stats: { strength: 90, hypertrophy: 90, waterRetention: 40, fatLoss: 40, mood: 70 }, details: { biological: "Blood levels stable. Body uses fat for fuel efficiently.", feeling: "Muscles look harder and more detailed.", action: "Start regular cardio. Monitor liver values." } },
    { week: "11-12", title: "Peaking", shortDesc: "Final touches before exit", iconKey: "flag", stats: { strength: 100, hypertrophy: 100, waterRetention: 20, fatLoss: 60, mood: 60 }, details: { biological: "Max muscle density. Preparing for withdrawal.", feeling: "Slight fatigue. Fully ready.", action: "Plan PCT. Slight calorie deficit." } }
  ],
  timelineLabels: { strength: "Strength", hypertrophy: "Size", water: "Water", fatLoss: "Fat Loss", mood: "Mood", biologicalTitle: "Biological Impact", feelingTitle: "How You Feel", actionTitle: "Action Plan", phaseLabel: "Phase" },
  salesToast: { purchased: "purchased Full Version", verified: "Verified", justNow: "Just Now", fromLabel: "from" },
  audioPlayer: { title: "Author's Intro", subtitle: "Listen to a special message from George", duration: "02:15" },
  aiChat: { fabLabel: "Mr. X AI", title: "Mr. X AI Assistant", subtitle: "Your smart assistant for questions", placeholder: "Ask a question...", send: "Send", disclaimer: "AI may make mistakes. Always consult a doctor.", welcomeMessage: "Hey champ. I'm Mr. X AI. How can I help with your training or nutrition today?" },
  quiz: {
    title: "Are You Ready?",
    subtitle: "A quick quiz to determine your level and whether you are ready to enter the hormonal world or need more foundation.",
    startBtn: "Start Quiz",
    questionLabel: "Question",
    totalLabel: "Total",
    questions: [
      {
        question: "How many years of consistent training do you have?",
        options: [
          { text: "Less than 3 years", score: 0 },
          { text: "More than 5 years", score: 1 }
        ]
      },
      {
        question: "What is your current body fat percentage?",
        options: [
          { text: "Over 15% (visible fat)", score: 0 },
          { text: "Under 12% (visible abs)", score: 1 }
        ]
      },
      {
        question: "Do you weigh your food and track calories daily?",
        options: [
          { text: "Sometimes / I just eat healthy", score: 0 },
          { text: "Yes, every gram is tracked", score: 1 }
        ]
      },
      {
        question: "Do you know what PCT (Post Cycle Therapy) is?",
        options: [
          { text: "Heard of it / Don't know much", score: 0 },
          { text: "Yes, I know SERMs & HCG protocols", score: 1 }
        ]
      },
      {
        question: "Have you done bloodwork (Kidney, Liver, Hormones) recently?",
        options: [
          { text: "No / A long time ago", score: 0 },
          { text: "Yes, and I know my baseline", score: 1 }
        ]
      }
    ],
    results: {
      natural: {
        title: "Stay Natural (For Now)",
        desc: "You have great potential for natural growth. Using hormones now might hurt you more than help because your foundation (Diet/Training) needs tuning. This book will help you max out your natural genetic potential first.",
        cta: "Get the Book to Maximize Gains"
      },
      enhanced: {
        title: "You Are Ready for the Next Step",
        desc: "You have the experience and a solid foundation. The next step requires precise science to protect you. You don't need random advice; you need the strict scientific protocols in this book.",
        cta: "Get the Book & Start Your Cycle"
      }
    }
  },
  dailyIQ: {
    title: "Daily Steroid IQ Challenge",
    subtitle: "New question every 24h. Answer correctly to unlock an instant discount.",
    challengeLabel: "DAILY CHALLENGE",
    winTitle: "Correct! You're sharp.",
    winDesc: "You proved your knowledge. Here is your discount code (Valid for 60 mins).",
    loseTitle: "Incorrect",
    loseDesc: "Don't worry, learning is part of the game. Come back tomorrow for a new question.",
    explanationLabel: "Explanation:",
    copySuccess: "Code copied!",
    toastCorrect: "Awesome! Discount code applied successfully.",
    couponLabel: "Discount Code",
    claimBtn: "Copy & Buy Now",
    expiresIn: "Offer expires in:",
    comeBackTomorrow: "Next question in:",
    questions: [
      {
        id: 1,
        question: "What is the primary difference between Nolvadex and Clomid in PCT?",
        options: ["They are exactly the same", "Nolvadex is better for Gyno, Clomid is stronger for LH stimulation", "Clomid stops Gyno better than Nolvadex", "Nolvadex is an Aromatase Inhibitor (AI)"],
        correctIndex: 1,
        explanation: "Nolvadex blocks estrogen at the breast tissue (stopping Gyno), while Clomid acts more potently on the pituitary gland to restart LH and Testosterone."
      },
      {
        id: 2,
        question: "What is the approximate half-life of Testosterone Enanthate?",
        options: ["24 Hours", "2-3 Days", "4.5-5 Days", "14 Days"],
        correctIndex: 2,
        explanation: "Testosterone Enanthate has a half-life of roughly 4.5 to 5 days, making it suitable for twice-weekly injections."
      },
      {
        id: 3,
        question: "Which of these is considered the most hepatotoxic (Liver Toxic)?",
        options: ["Testosterone Propionate", "Injectable Primobolan", "Dianabol (Oral)", "Deca Durabolin"],
        correctIndex: 2,
        explanation: "Oral steroids like Dianabol are 17-alpha-alkylated to survive liver metabolism, causing significant liver stress compared to injectables."
      }
    ]
  },
  cycleArchitect: {
    title: "Smart Cycle Synchronizer",
    subtitle: "Design your protocol with precision. Get a live executable schedule (ICS) with injection rotation, stealth mode, and PCT calculation.",
    presetsTitle: "Presets:",
    stealthModeLabel: "Stealth Mode (Privacy)",
    rotationLabel: "Auto-Rotate Injection Sites",
    pctLabel: "Auto-Calculate PCT Start",
    stealthAliases: ["Gym Session", "Vitamin Shot", "Work Meeting", "Physio", "Cardio"],
    rotationSites: ["Right Glute (Dorso)", "Left Glute (Dorso)", "Right Delt", "Left Delt", "Right Quad", "Left Quad"],
    presets: {
      beginnerBulk: "Beginner Bulking",
      cutting: "Advanced Cutting",
      trt: "TRT Protocol"
    },
    form: {
      startDateLabel: "Start Date",
      compoundLabel: "Compound",
      dosageLabel: "Dosage (mg)",
      frequencyLabel: "Frequency",
      weeksLabel: "Duration (Weeks)",
      halfLifeLabel: "Half-Life (Days) - For PCT",
      addCompoundBtn: "Add Compound",
      removeBtn: "Remove",
      frequencies: {
        daily: "Daily (ED)",
        eod: "Every Other Day (EOD)",
        twiceWeekly: "Twice Weekly (Mon/Thu)",
        weekly: "Weekly (Once)"
      }
    },
    premiumLock: {
      lockedTitle: "Premium Feature Locked",
      lockedDesc: "Exporting the full schedule to your phone's calendar with Smart Rotation, Stealth Mode & Auto-PCT is exclusive to Verified Customers.",
      verifyBtn: "Verify Purchase to Unlock",
      exportBtn: "Export Smart Calendar (.ics)",
      placeholder: "Enter Email or Order ID",
      successMsg: "Verified! Feature Unlocked.",
      errorMsg: "Order not found."
    }
  },
  units: {
    mg: "mg",
    g: "g",
    ml: "ml",
    kcal: "kcal",
    days: "days",
    weeks: "weeks",
    percentage: "%",
    liters: "liters",
    ed: "Daily",
    eod: "EOD",
    twiceWeekly: "Twice Weekly",
    weekly: "Weekly"
  }
};

export const heContent: ContentStrings = {
  ...enContent,
  navAiTools: "כלי AI למפתח הגוף",

  navPremiumResources: "משאבי פרימיום",
  navFeatures: "תכונות",
  navToolNames: {
    macro: "מחשבון מאקרו",
    injection: "מפת הזרקות",
    halflife: "סימולטור זמן מחצית חיים",
    lab: "פענוח בדיקות דם",
    genetic: "פוטנציאל גנטי",
    cycleArchitect: "מתכנן סייקלים",
  },
  themeNames: {
    light: "מצב בהיר",
    dark: "מצב כהה",
    system: "מצב מערכת",
  },
  backToHome: "חזרה לדף הבית",
  homeLink: "בית",
  seoTitle: "מר איקס-סטרואיד Mr. X-Steroid | המדריך המלא לפיתוח גוף וסטרואידים",
  seoDescription: "גלו את המדריך המדעי החזק ביותר לבניית שרירים וסייקלים הורמונליים. הספר מר איקס-סטרואיד מאת ג'ורג' מוריס מציע טבלאות תזונה, פרוטוקולי הגנה ומדריך תוספים מלא.",
  seoKeywords: "פיתוח גוף, סטרואידים, הורמונים, בניית שריר, חיטוב, מסה, קרוספיט, כושר, בריאות, ג'ורג' מוריס",

  heroTitle: "מר איקס-סטרואיד Mr. X-Steroid",
  heroSubtitle: "גלה את המדריך האולטימטיבי לבניית שרירים וסייקלים הורמונליים: גישה מדעית מקיפה המגובה בטבלאות מפורטות ופרוטוקולים ברורים. הספר יעזור לך להשיג כוח עצום וגוף מחוטב בצורה בטוחה וחכמה.",
  heroCta: "קבל את העותק שלך עכשיו",
  downloadPreview: "הורד הצצה חינם (PDF)",
  audioPreviewBtn: "האזן להקדמה",
  authorSection: "על המחבר",
  authorName: "ג׳ורג׳ מוריס",
  authorBio: "מחבר הספר ומעצב העטיפה, ג'ורג' מציג בפניכם מדריך שאינו רק מידע - הוא שריון. ספר זה הוא מסר לכל מאמן וספורטאי שמאמין שידע ומדע הם הבסיס למצוינות.",
  featuresTitle: "מה תמצא בפנים?",
  sneakPeekTitle: "הצצה בלעדית",
  sneakPeekSubtitle: "ראה כיצד נראות טבלאות סייקל מקצועיות. חלק 1 זמין; השאר מוצפן להגנה על התוכן.",
  unlockText: "קנה את הספר לפתיחת המינונים המלאים",
  buyNow: "קנה עכשיו",
  contact: "צור קשר",
  copyright: "כל הזכויות שמורות © 2025 ג׳ורג׳ מוריס",
  features: [
    {
      title: "טבלאות הורמונים מקיפות: מאפס למקצוען",
      description: "די למנחש ולסמוך על 'עצות מחדר הכושר'. הספר מספק טבלאות סייקל מובנות מדעית, שמובילות אותך בבטחה מרמת מתחיל למתקדם. תוכניות מסה וחיטוב עם מינונים וזמנים מדויקים.",
      iconKey: "chart"
    },
    {
      title: "אמנות ה-'יציאה הבטוחה': פרוטוקולי PCT קפדניים",
      description: "להתחיל סייקל זה קל; לצאת בבטחה זו האמנות. הספר מפרט כיצד להגן על המערכת ההורמונלית ולהחזיר את ייצור הטסטוסטרון הטבעי כדי למנוע איבוד שריר ודיכאון. תוכניות PCT מוכחות עם תרופות ומינונים.",
      iconKey: "exit"
    },
    {
      title: "מדריך תוספים: האמת, ללא שיווק",
      description: "חסוך את הכסף שלך. הפסק לקנות אבקות חסרות תועלת. המדריך חושף אילו תוספים באמת עובדים (כמו קריאטין, חלבון, חומצות אמינו) וחושף את התרמיות המסחריות שמרוקנות לך את הארנק.",
      iconKey: "shield"
    }
  ],
  testimonialsTitle: "מה אומרים הלקוחות?",
  testimonials: [
    { name: "אחמד ס.", title: "מפתח גוף חובב", text: "הייתי אבוד בתוך המידע הסותר באינטרנט. הספר הזה העלה אותי על המסלול הנכון וחסך לי שנים של ניסוי וטעייה." },
    { name: "מוחמד א.", title: "מאמן אישי", text: "מקור חובה לכל מאמן שרוצה להיות ישר עם הלקוחות שלו ולהגן על בריאותם." },
    { name: "כרים מ.", title: "אלוף מקומי", text: "הטבלאות בספר הזה מדויקות להפליא ועזרו לי להגיע לצורה הטובה ביותר בחיי." }
  ],
  faqTitle: "שאלות נפוצות",
  faqSubtitle: "תשובות ישירות לשאלות הנפוצות ביותר",
  faqSearchPlaceholder: "חפש שאלות...",
  faqCategories: { all: "הכל", safety: "בטיחות", general: "כללי", legal: "חוקי", women: "נשים", strategy: "אסטרטגיה" },
  faqs: [
    { question: "האם הספר מתאים למתחילים?", answer: "כן, הספר מתחיל מהיסודות ומסביר הכל בצורה פשוטה ומדעית, כולל טבלאות למתחילים.", category: "general" },
    { question: "האם זה חוקי?", answer: "הספר הוא למטרות חינוכיות ומידע בלבד. האחריות על השימוש במידע היא על הקורא בלבד בהתאם לחוקי מדינתו.", category: "legal" },
    { question: "איך מקבלים את הספר לאחר התשלום?", answer: "מיד לאחר השלמת התשלום, יישלח אליך אימייל עם קישור ישיר להורדת הספר בפורמט PDF.", category: "general" },
    { question: "האם יש תמיכה לאחר הרכישה?", answer: "בוודאי. לקוחות חבילת הפרו מקבלים גישה לקהילה הפרטית שלנו לשאלות ותמיכה.", category: "general" }
  ],
  privacyPolicy: "מדיניות פרטיות",
  termsOfService: "תנאי שימוש",
  refundPolicy: "מדיניות החזרים",
  legalDisclaimer: "הצהרה משפטית",
  aboutUs: "עלינו",
  legal: "משפטי",
  quickLinks: "קישורים מהירים",
  privacyPolicyContent: "אנו מכבדים את הפרטיות שלך ומחויבים להגן על המידע האישי שלך. המידע שנאסף משמש אך ורק לעיבוד הזמנות ולשיפור השירות שלנו. איננו משתפים את פרטיך עם צדדים שלישיים ללא הסכמתך.",
  termsOfServiceContent: "בעצם השימוש באתר זה ובביצוע רכישה, אתה מסכים לתנאי השימוש שלנו. המידע באתר מיועד למטרות חינוכיות בלבד ואין לראות בו ייעוץ רפואי.",
  refundPolicyContent: "בשל האופי הדיגיטלי של הספר, לא ניתן לבצע החזר כספי לאחר שליחת קישור ההורדה. אם נתקלת בבעיה טכנית, אנא צור קשר עם התמיכה.",
  pricingTitle: "בחר את התוכנית שלך",
  pricingSubtitle: "השקעה קטנה בבריאות ובידע שלך תחסוך לך אלפי דולרים וסיכונים אינסופיים.",
  pricingTiers: [
    { name: "חבילת פרו", price: "$49.99", originalPrice: "$79.99", description: "הספר + כלים בלעדיים", features: ["הספר המלא (300+ עמודים)", "מחשבון מינונים (Excel)", "גישה לקהילה פרטית", "מדריך תוספים בונוס"], buttonText: "הנמכר ביותר", isPopular: true, popularLabel: "המשתלם ביותר" },
    { name: "חבילת אימון", price: "$199.99", description: "אימון אישי + הספר", features: ["כל פיצ'רי הפרו", "ייעוץ אונליין (30 דק')", "בניית סייקל מותאם אישית", "מעקב למשך חודש"], buttonText: "התחל שינוי" }
  ],
  disclaimerTitle: "אזהרה חשובה והסרת אחריות",
  disclaimerContent: "המידע המוצג באתר זה ובספר 'מר איקס-סטרואיד' נועד למטרות חינוכיות ומידע בלבד. אין לראות במידע זה כייעוץ רפואי, חוות דעת מקצועית או המלצה לשימוש בחומרים בלתי חוקיים או מסוכנים. \n\nשימוש בסטרואידים אנאבוליים וחקי הורמונים עלול לגרום לנזקים בריאותיים חמורים ובלתי הפיכים, כולל נזק לכבד, למערכת הלב והדם, למערכת הרבייה ולבריאות הנפש. \n\nאנחנו ממליצים בחום להתייעץ עם רופא מוסמך לפני ביצוע כל שינוי בתזונה, בתוכנית האימונים או שימוש בתוספים כלשהם. המחברים והבעלים של האתר אינם נושאים באחריות לכל נזק, ישיר או עקיף, שעלול להיגרם מהשימוש במידע זה.",
  agreeButton: "אני מסכים, לוקח אחריות מלאה ואני מעל גיל 18+",
  disclaimerAcknowledgement: "בלחיצה על הכפתור למטה, אתה מאשר שקראת, הבנת והסכמת לכל התנאים המפורטים לעיל.",
  importantDisclaimer: "שים לב: שימוש לא נכון עלול לסכן את בריאותך.",
  downloadFullBook: "הורד את הספר המלא",
  processing: "מעבד...",
  purchaseSuccess: "הרכישה בוצעה בצלחה!",
  benefitsTitle: "למה לבחור במר איקס-סטרואיד?",
  benefitsSubtitle: "המדריך המקיף ביותר במזרח התיכון",
  benefits: [
    { title: "חוסך זמן", description: "כל המידע שאתה צריך במקום אחד, ללא צורך בחיפושים אינסופיים.", iconKey: "time" },
    { title: "מגובה במדע", description: "פרוטוקולים המבוססים על מחקרים ולא רק על ניסיון אישי.", iconKey: "science" }
  ],
  whoIsTitle: "למי מיועד הספר?",
  whoIsSubtitle: "התוכן תוכנן בקפידה עבור:",
  targetAudiences: [
    { title: "מפתח גוף מתחיל", description: "שרוצה לקצר את הדרך על בסיס מדעי.", iconKey: "athlete" },
    { title: "מאמן מקצועי", description: "שמחפש מקור אמין לבניית תוכניות.", iconKey: "coach" },
    { title: "מודע לבריאות", description: "שרוצה להבין את ההשפעות ולמנוע נזק.", iconKey: "shield" }
  ],
  whoIsClosing: "אם אתה חלק מאלה, הספר הזה הוא ההשקעה הטובה ביותר שלך.",
  whoIsCta: "התחל את השינוי עכשיו",
  checkoutTitle: "תשלום מאובטח",
  billingDetails: "פרטי חיוב",
  fullName: "שם מלא",
  emailAddress: "כתובת אימייל",
  paymentMethod: "שיטת תשלום",
  creditCard: "כרטיס אשראי",
  cardNumber: "מספר כרטיס",
  expiryDate: "תוקף",
  cvc: "CVC",
  payNow: "שלם עכשיו",
  cancel: "ביטול",
  orderSummary: "סיכום הזמנה",
  total: "סה״כ",
  secureCheckout: "תשלום מאובטח בטכנולוגיית SSL",
  aboutPageTitle: "על מר איקס-סטרואיד",
  aboutPageContent: "מר איקס-סטרואיד הוא הפרויקט המוביל במזרח התיכון להנגשת ידע מדעי בתחום פיתוח הגוף והשימוש המושכל בהורמונים. אנו מאמינים שידע הוא הכוח החזק ביותר להשגת תוצאות תוך שמירה על הבריאות.",
  aboutPageStoryTitle: "הסיפור שלנו",
  aboutPageStory: "מה שהתחיל כבלוג קטן של חובבי כושר, הפך למקור המידע האמין ביותר עבור אלפי ספורטאים. זיהינו את הפער העצום בין המיתוסים בחדר הכושר לבין המדע האמיתי, והחלטנו לגשר עליו.",
  aboutPageMissionTitle: "המשימה שלנו",
  aboutPageMission: "המשימה שלנו היא להפסיק את הניחושים בחדר הכושר, להנגיש פרוטוקולים בטוחים המבוססים על מחקר, ולהגן על הדור הבא של הספורטאים מפני טעויות קריטיות.",
  labReference: {
    title: "המרجع החכם לבדיקות מעבדה",
    subtitle: "הבן את תוצאות בדיקות הדם שלך בעצמך. מדריך זה עוזר לזהות סימני אזהרה.",
    searchPlaceholder: "חפש שם בדיקה (למשל: Test, ALT)...",
    noResults: "לא נמצאו תוצאות",
    analyzeBtn: "נתח תוצאה",
    analyzeTitle: "הזן תוצאה",
    enterValue: "ערך",
    resultLabel: "סטטוס",
    status: { low: "נמוך", normal: "תקין", high: "גבוה" },
    categories: { all: "הכל", hormones: "הורמונים", organs: "איברים", blood: "לב וכלי דם" },
    labels: { whatIsIt: "מה זה?", normalRange: "טווח תקין", elevationMeaning: "משמעות חריגה", lowMeaning: "משמעות חוסר", management: "המלצות", cancel: "ביטול", high: "גבוה", low: "נמוך" },
    tests: labTestsHe,
  },
  injectionMap: {
    title: "מפת הזרקות בטוחה",
    subtitle: "מדריך אינטראקטיבי לאתרי הזרקה תוך-שרירית, סיכונים וכלים.",
    viewFront: "מבט קדמי",
    viewBack: "מבט אחורי",
    needleSizeLabel: "גודל מחט",
    maxVolumeLabel: "נפח מקסימלי",
    painLevelLabel: "רמת כאב",
    riskLevelLabel: "רמת סיכון",
    recoveryLabel: "זמן התאוששות",
    lastInjectedLabel: "הזרקה אחרונה",
    logInjectionBtn: "תעד הזרקה",
    suggestBtn: "הצע אתר",
    suggesting: "מציע...",
    status: { ready: "מוכן", recovering: "בהתאוששות", warning: "הימנע" },
    riskLevel: "רמת סיכון",
    tapToExplore: "לחץ על שריר לפרטים",
    interactiveMapLabel: "מפה תפעולית אינטראקטיבית",
    medicalInsightLabel: "תובנה רפואית",
    riskLevels: {
      low: "נמוך",
      high: "גבוה"
    },
    goldenHourTitle: "אחרי ההזרקה (שעת הזהב)",
    goldenHourDesc: "השינוי מתחיל מיד! החומר זורם ומעצב מחדש את הרקמות, מגביר סינתזת חלבון מיידית והופך את האימון הבא שלך להתפרצות של כוח.",
    goldenAdvice: "רוטציה היא הסוד. אל תתיש שריר אחד; הפוך את הגוף שלך למפה מאוזנת של גדילה.",
    rotationTrackerTitle: "מעקב רוטציה חכם",
    cumulativeGrowthLabel: "גדילה מצטברת",
    efficiencyLabel: "יעילות ספיגה",
    comfortableSpot: "הנוח ביותר",
    sites: injectionSitesHe,
  },
  contactPageTitle: "צור קשר",
  contactPageSubtitle: "אנחנו כאן לכל שאלה",
  contactFormNamePlaceholder: "השם שלך",
  contactFormEmailPlaceholder: "האימייל שלך",
  contactFormMessagePlaceholder: "ההודעה שלך",
  contactFormSubjectPlaceholder: "נושא",
  contactFormSubmit: "שלח הודעה",
  contactFormSuccessMessage: "הודעתך נשלחה בהצלחה!",
  contactInfoAddress: "דובאי, איחוד האמירויות",
  contactInfoEmail: "support@mrxsteroid.com",
  contactInfoPhone: "+971 XXX XXX XXX",
  contactInfoHours: "24/7 תמיכה",
  viewOnMap: "צפה במפה",
  cookieTitle: "עוגיות ופרטיות",
  cookieMessage: "אנו משתמשים בעוגיות כדי לשפר את החוויה שלך.",
  cookieAccept: "אשר",
  cookieReject: "דחה",
  calcTitle: "מחשבון מאקרו מתקדם",
  calcSubtitle: "חשב את הסעורת והמאקרו המדויקים שלך לפי היעדים",
  calcGender: "מין",
  calcMale: "גבר",
  calcFemale: "אישה",
  calcAge: "גיל",
  calcWeight: "משקל",
  calcHeight: "גובה",
  calcActivity: "רמת פעילות",
  calcTrainingStyle: "סגנון אימון",
  calcGoal: "יעד",
  calcCalculate: "חשב עכשיו",
  calcResults: "התוצאות שלך",
  calcCalories: "קלוריות",
  calcProtein: "חלבון",
  calcCarbs: "פחמימות",
  calcFats: "שומנים",
  calcCta: "קבל תוכנית מותאמת אישית",
  calcSmartMode: "מצב חכם",
  calcBodyFat: "אחוז שומן",
  calcWater: "צריכת מים מומלצת",
  calcLiters: "ליטרים",
  calcRecalculate: "חשב מחדש",
  calcGenerateMealPlan: "צור תוכנית ארוחות",
  calcGenerating: "יוצר תוכנית...",
  calcMealPlanTitle: "תוכנית תזונה מוצעת",
  calcMealPlanSubtitle: "ארוחות מבוססות על המאקרו שלך",
  calcDisclaimer: "הערכים הם הערכה בלבד. התייעץ עם תזונאי.",
  calcTdeeLabel: "הוצאה אנרגטית יומית (TDEE)",
  calcBmrLabel: "קצב חילוף חומרים בסיסי (BMR)",
  calcTefLabel: "אפקט תרמי של מזון (TEF)",
  calcBeastTitle: "מצב 'חיה' מופעל",
  calcAnalysisLabel: "ניתוח מנוע חכם",
  calcBmiStatusLabel: "סטטוס BMI",
  calcShuffleLabel: "ערבב ארוחות",
  calcAwaitingInputLabel: "ממתין לנתוני שריר",
  calcAiEngineLabel: "מנוע מבוסס AI",
  calcAnalyzingLabel: "מנתח נתונים...",
  calcMetabolicActiveLabel: "פעילות מטבולית פעילה",
  calcAnabolicPotentialLabel: "פוטנציאל אנבולי צפוי",
  calcWindowBtn: "צפה בתוכנית המלאה",
  calcTrainingTime: "זמן אימון",
  calcTrainingWindows: {
    morning: "בוקר",
    afternoon: "צהריים",
    evening: "ערב",
    advice: "מכיוון שהאימון שלך ב{time}، אנו ממליצים לרכז 40% מהפחמימות סביב חלון האימון."
  },
  calcPredictionTitle: "תחזית התקדמות",
  calcBeastNames: { cut: "לוחם חיטוב", maintain: "מכונת שימור", bulk: "ענק מסה" },
  calcPredictions: { cut: "איבוד שומן מואץ", maintain: "רה-קומפוזיציה", bulk: "צמיחת שריר מקסימלית" },
  calcSelectGoal: { cut: "חיטוב יבש", maintain: "שמירה ושיפור", bulk: "מסה נקייה" },
  calcMealNames: ["ארוחת בוקר", "ארוחת צהריים", "לפני אימון", "ארוחת ערב"],
  calcActivityLevels: { sedentary: "יושבני", light: "פעיל מעט", moderate: "פעילות מתונה", active: "פעיל מאוד", veryActive: "ספורטאי מקצועי" },
  calcTrainingStyles: { hypertrophy: "היפרטרופיה", strength: "כוח", endurance: "סיבולת" },
  geneticCalculator: {
    title: "מחשבון פוטנציאל גנטי",
    subtitle: "כמה שריר אתה יכול לבנות בפיזיולוגיה שלך?",
    labels: {
      height: "גובה",
      wrist: "היקף שורש כף יד",
      ankle: "היקף קרסול",
      bodyFat: "אחוז שומן רצוי",
      frameSize: "מבנה שלד",
      boneThickness: "עובי עצם",
      lowerBody: "מבנה גוף תחתון"
    },
    modelLabel: "מבוסס על מודל Casey Butt",
    awaitingDataTitle: "ממתין לנתונים...",
    frameOptions: { small: "קטן", medium: "בינוני", large: "רחב" },
    unknownMeasurements: "לא בטוח לגבי המדידות?",
    cta: "נתח פוטנציאל",
    reset: "איפוס",
    yourBodyType: "סוג הגוף שלך",
    resultTitle: "תחזית מסה מקסימלית",
    naturalLabel: "פוטנציאל טבעי",
    enhancedLabel: "פוטנציאל 'משופר'",
    differenceLabel: "ההפרש הצפוי",
    disclaimer: "התוצאות מבוססות על נוסחאות מדעיות והערכות סטטיסטיות.",
    unlockMsg: "לפתח את הפוטנציאל המלא? קנה את הספר.",
    errorMsg: "אנא מלא את כל השדות."
  },
  halfLifeVisualizer: {
    title: "סימולטור זמן מחצית חיים",
    subtitle: "ראה כיצד רמות ההורמונים בדם משתנות בזמן אמת",
    compoundLabel: "חומר",
    dosageLabel: "מינון",
    durationLabel: "משך (שבועות)",
    frequencyLabel: "תדירות הזרקה",
    yAxis: "ריכוז בדם",
    xAxis: "ימים",
    pctZone: "אזור ניקוי (PCT)",
    pctStartMsg: "זמן מומלץ להתחלת PCT",
    peakLevelMsg: "שיא הריכוז בשימוש נכון",
    addToStackBtn: "הוסף לערימה",
    activeStackTitle: "חומרים פעילים",
    serumTitle: "ריכוז בדם",
    peakLabel: "שיא",
    emptyStackMsg: "הוסף חומרים כדי לראות את הגרף",
    compounds: enContent.halfLifeVisualizer.compounds, // Keeping technical IDs/Names
    frequencies: { ed: "כל יום", eod: "יום כן יום לא", e3d: "כל 3 ימים", e7d: "אחת לשבוע" },
    tooltipDay: "יום",
    tooltipLevel: "רמה",
    tooltipPctReady: "מוכן ל-PCT",
    tooltipWait: "יש להמתין",
    tooltipInject: "מועד הזרקה",
    analysis: {
      title: "ניתוח סייקל חכם",
      prosTitle: "יתרונות",
      consTitle: "סיכונים",
      adviceTitle: "טיפ ממר איקס",
      pros: ["רמות דם יציבות", "שיא ביו-זמינות"],
      cons: ["צורך בהזרקות תכופות", "עלייה בלחץ דם"],
      advice: "זכור לבצע בדיקות דם באמצע הסייקל."
    }
  },
  mealPlanTitle: "תוכנית תזונה",
  mealPlanBtn: "צור תוכנית",
  mealPlanLoading: "מכין...",
  mealPlanError: "אירעה שגיאה",
  timelineTitle: "ציר זמן השינוי",
  timelineSubtitle: "מה קורה בתוך הגוף שלך שבוע אחר שבוע? המסע הביולוגי המלא.",
  timelinePhases: [
    { week: "1-2", title: "שלב ההתנעה (The Kickstart)", shortDesc: "כניסת ההורמון והתחלת שינויים", iconKey: "spark", stats: { strength: 20, hypertrophy: 10, waterRetention: 30, fatLoss: 5, mood: 80 }, details: { biological: "עלייה חדה ברמות האנדרוגנים בדם. עלייה באגירת חנקן בשריר.", feeling: "שיפור ניכר במצב הרוח, חשק מיני גבוה ותחושת 'פאמפ' תמידית.", action: "היצמד לתזונה ב-100%. שתה 4 ליטר מים ביום." } },
    { week: "3-6", title: "שלב ההתפוצצות (Hypertrophy Surge)", shortDesc: "צמיחת שריר מהירה ועלייה במשקל", iconKey: "muscle", stats: { strength: 60, hypertrophy: 70, waterRetention: 50, fatLoss: 10, mood: 90 }, details: { biological: "רוויה של קולטנים. סינתזת חלבון בשיא.", feeling: "כוח מטורף באימון. הבגדים נהיים צמודים. תיאבון גבוה.", action: "העלה משקלים באימון. עקוב אחר לחץ דם ואסטרוגן." } },
    { week: "7-10", title: "שלב ההתקשחות (Hardening)", shortDesc: "ייצוב משקל ותחילת שרפת שומן", iconKey: "trophy", stats: { strength: 90, hypertrophy: 90, waterRetention: 40, fatLoss: 40, mood: 70 }, details: { biological: "ייצוב רמות בדם. הגוף מתחיל להשתמש בשומן לאנרגיה ביעילות.", feeling: "מראה שרירי קשה ומפורט יותר.", action: "התחל אירובי קבוע. עקוב אחר תפקודי כבד." } },
    { week: "11-12", title: "שלב הגימור (Peaking)", shortDesc: "נגיעות אחרונות לפני היציאה", iconKey: "flag", stats: { strength: 100, hypertrophy: 100, waterRetention: 20, fatLoss: 60, mood: 60 }, details: { biological: "צפיפות שריר מקסימלית. הכנה להפסקת ההורמון.", feeling: "עייפות קלה. מוכנות מלאה.", action: "תכנן PCT. הפחת מעט קלוריות." } }
  ],
  timelineLabels: { strength: "כוח", hypertrophy: "מסה", water: "נוזלים", fatLoss: "שרפת שומן", mood: "מצב רוח", biologicalTitle: "מה קורה ביולוגית?", feelingTitle: "איך תרגיש?", actionTitle: "תוכנית פעולה", phaseLabel: "שלב" },
  salesToast: { purchased: "רכש את הגרסה המלאה", verified: "מוסמך", justNow: "ממש עכשיו", fromLabel: "מ-" },
  audioPlayer: { title: "הקדמה קולית מהמחבר", subtitle: "האזן להודעה מיוחדת מג׳ורג׳", duration: "02:15" },
  aiChat: { fabLabel: "העוזר של מר איקס", title: "מר איקס AI", subtitle: "העוזר החכם שלך לכל שאלה", placeholder: "שאל אותי משהו...", send: "שלח", disclaimer: "הבינה המלאכותית עלולה לטעות. התייעץ תמיד עם רופא.", welcomeMessage: "אהלן אלוף. אני העוזר של מר איקס. איך אני יכול לעזור לך היום באימונים או בתזונה?" },
  quiz: {
    title: "האם אתה מוכן לסייקל?",
    subtitle: "מבחן מהיר שיקבע אם אתה מוכן להיכנס לעולם ההורמונים או שאתה זקוק ליסודות נוספים.",
    startBtn: "התחל מבחן",
    questionLabel: "שאלה",
    totalLabel: "סה״כ",
    questions: [
      { question: "כמה שנים של אימון עקבי יש לך?", options: [{ text: "פחות מ-3 שנים", score: 0 }, { text: "יותר מ-5 שנים", score: 1 }] },
      { question: "מה אחוז השומן הנוכחי שלך?", options: [{ text: "מעל 15% (שומן גלוי)", score: 0 }, { text: "מתחת ל-12% (קוביות גלויות)", score: 1 }] }
    ],
    results: {
      natural: { title: "הישאר טבעי (לבינתיים)", desc: "יש לך פוטנציאל גדול לגדילה טבעית. שימוש בהורמונים עכשיו עלול להזיק.", cta: "קבל את הספר למיקסום היכולת הטבעית" },
      enhanced: { title: "אתה מוכן לשלב הבא", desc: "יש לך את הניסיון והבסיס הנכון. השלב הבא דורש מדע מדויק להגנה.", cta: "קבל את הספר והתחל את הסייקל" }
    }
  },
  dailyIQ: {
    title: "אתגר ה-Steroid IQ היומי",
    subtitle: "שאלה אחת חדשה כל 24 שעות. ענה נכון וקבל הנחה מיידית.",
    challengeLabel: "אתגר היום",
    winTitle: "נכון מאוד! אתה חד.",
    winDesc: "הוכחת את הידע שלך. הנה קוד הקופון שלך (בתוקף ל-60 דקות).",
    loseTitle: "לא מדויק",
    loseDesc: "אל דאגה, למידה היא חלק מהמשחק. חזור מחר לשאלה חדשה.",
    explanationLabel: "הסבר:",
    copySuccess: "הקוד הועתק בהצלחה!",
    toastCorrect: "מעולה! קוד ההנחה הופעל בהצלחה.",
    couponLabel: "קוד קופון",
    claimBtn: "העתק וקנה עכשיו",
    expiresIn: "המבצע מסתיים בעוד:",
    comeBackTomorrow: "השאלה הבאה בעוד:",
    questions: [
      { id: 1, question: "מה ההבדל העיקרי בין נולבדקס לכלומייד ב-PCT?", options: ["הם בדיוק אותו דבר", "נולבדקס עדיף לג׳ינו, כלומייד חזק יותר לגירוי LH", "כלומייד עוצר ג׳ינו טוב יותר", "נולבדקס הוא מעכב ארומטאז (AI)"], correctIndex: 1, explanation: "נולבדקס חוסם אסטרוגן ברקמת השד, בעוד כלומייד פועל חזק יותר על בלוטת יותרת המוח." }
    ]
  },
  cycleArchitect: {
    title: "מסנכרן הסייקלים החכם (Cycle Architect)",
    subtitle: "עצב את הפרוטוקול שלך בדיוק מקסימלי, קבל יומן ביצוע (ICS) עם רוטציה והגנה.",
    presetsTitle: "תבניות מוכנות:",
    stealthModeLabel: "מצב פרטיות (שמות בדויים)",
    rotationLabel: "רוטציית הזרקות אוטומטית",
    pctLabel: "חישוב מועד תחילת PCT",
    stealthAliases: ["אימון אירובי", "זריקת ויטמנים", "פגישת עבודה", "פיזיותרפיה", "קרדיו"],
    rotationSites: ["ישבן ימין", "ישבן שמאל", "כתף ימין", "כתף שמאל", "ירך ימין", "ירך שמאל"],
    presets: { beginnerBulk: "מסה למתחילים", cutting: "חיטוב מתקדם", trt: "פרוטוקול TRT" },
    form: { startDateLabel: "תאריך התחלה", compoundLabel: "חומר", dosageLabel: "מינון (מ״ג)", frequencyLabel: "תדירות", weeksLabel: "משך (שבועות)", halfLifeLabel: "זמן מחצית חיים (ימים)", addCompoundBtn: "הוסף חומר", removeBtn: "הסר", frequencies: { daily: "יומי (ED)", eod: "יום כן יום לא (EOD)", twiceWeekly: "פעמיים בשבוע", weekly: "פעם בשבוע" } },
    premiumLock: { lockedTitle: "תכונת פרימיום נעולה", lockedDesc: "ייצוא ליומן הטלפון עם רוטציה חכמה ומצב פרטיות זמין רק ללקוחות מאומתים.", verifyBtn: "אמת רכישה לפתיחה", exportBtn: "ייצא יומן חכם (.ics)", placeholder: "הזן אימייל או מספר הזמנה", successMsg: "אומת! התכונה פתוחה.", errorMsg: "הזמנה לא נמצאה." }
  },
  timeUnits: {
    days: "ימים",
    hours: "שעות",
    minutes: "דקות",
    seconds: "שניות"
  },
  offerExpired: "ההצעה פגה!",
  heroEditions: {
    ar: "نسخة عربية",
    en: "English Edition",
    he: "מהדורה עברית"
  },
  units: {
    mg: "מ״ג",
    g: "גרם",
    ml: "מ״ל",
    kcal: "קלוריות",
    days: "ימים",
    weeks: "שבועות",
    percentage: "%",
    liters: "ליטר",
    ed: "פעם ביום",
    eod: "פעם ביומיים",
    twiceWeekly: "פעמיים בשבוע",
    weekly: "פעם בשבוע"
  }
};
