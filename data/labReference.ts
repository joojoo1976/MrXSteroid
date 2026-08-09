import { LabCategoryId } from './labReference.types';

/**
 * MEDICAL LAB ENCYCLOPEDIA — LIVE DYNAMIC DATA MODEL
 * ─────────────────────────────────────────────────────────────────────────────
 * Bilingual (EN/AR), unit-system aware, reference-grade dataset.
 * Reference ranges follow current international laboratory standards
 * (males; adult). Values are stored per-system (SI + US) for exact precision
 * and to avoid floating-point rounding drift on the UI.
 *
 * Structure is designed for future expansion (AI models, APIs, Supabase sync)
 * while remaining fully typed and serializable.
 */

export interface BilingualText {
  en: string;
  ar: string;
}

export interface LabRangeSlice {
  min: number;
  max: number;
  unit: string;
  decimals: number;
}

export interface LabRangeProfile {
  si: LabRangeSlice;
  us: LabRangeSlice;
  /** Multiply an SI value to obtain its US value. */
  siToUs: number;
  /** Multiply a US value to obtain its SI value. */
  usToSi: number;
}

export interface LabDirection {
  causes: BilingualText[];
  symptoms: BilingualText[];
  advice: BilingualText[];
}

export interface LabTestData {
  id: string;
  category: LabCategoryId;
  name: BilingualText;
  description: BilingualText;
  range: LabRangeProfile;
  high: LabDirection;
  low: LabDirection;
  keywords: string[];
}

export interface LabCategory {
  id: LabCategoryId;
  label: BilingualText;
  description: BilingualText;
  icon: string;
}

export const LAB_CATEGORIES: LabCategory[] = [
  {
    id: 'hormones',
    label: { en: 'Hormones', ar: 'الهرمونات' },
    description: {
      en: 'Steroid & pituitary axis — the drivers of muscle, libido and recovery.',
      ar: 'محور الغدة النخامية والستيرويدية — محرك العضلات والرغبة والتعافي.',
    },
    icon: 'Activity',
  },
  {
    id: 'organs',
    label: { en: 'Organ Function', ar: 'كفاءة الأعضاء' },
    description: {
      en: 'Liver, kidney & metabolic function — the safety dashboard of any protocol.',
      ar: 'وظائف الكبد والكلى والأيض — لوحة الأمان لكل بروتوكول.',
    },
    icon: 'ShieldCheck',
  },
  {
    id: 'cardiovascular',
    label: { en: 'Heart & Blood', ar: 'القلب والدم' },
    description: {
      en: 'Lipids, inflammation & full blood count for cardiovascular health.',
      ar: 'الدهون والالتهابات وعدّ الدم الكامل لصحة القلب والشرايين.',
    },
    icon: 'HeartPulse',
  },
  {
    id: 'vitamins',
    label: { en: 'Vitamins & Cofactors', ar: 'الفيتامينات والمركبات الحيوية' },
    description: {
      en: 'Fat- and water-soluble vitamins essential for hormonal output.',
      ar: 'الفيتامينات الذائبة في الدهون والماء الأساسية للإنتاج الهرموني.',
    },
    icon: 'Pill',
  },
  {
    id: 'minerals',
    label: { en: 'Minerals & Electrolytes', ar: 'المعادن والشوارد' },
    description: {
      en: 'Trace minerals and electrolytes powering contraction, transport and enzymes.',
      ar: 'المعادن النزرة والشوارد الداعمة للانقباض والنقل والإنزيمات.',
    },
    icon: 'Atom',
  },
  {
    id: 'thyroid',
    label: { en: 'Thyroid Axis', ar: 'الغدة الدرقية' },
    description: {
      en: 'Full thyroid profile for metabolic rate and recovery regulation.',
      ar: 'ملف الغدة الدرقية الكامل لتنظيم معدل الأيض والتعافي.',
    },
    icon: 'Gauge',
  },
  {
    id: 'inflammation',
    label: { en: 'Inflammation & Immunity', ar: 'الالتهاب والمناعة' },
    description: {
      en: 'Systemic inflammatory and autoimmune markers for long-term health.',
      ar: 'مؤشرات الالتهاب الجهازي وأمراض المناعة الذاتية للصحة طويلة الأمد.',
    },
    icon: 'Flame',
  },
  {
    id: 'bone',
    label: { en: 'Bone & Tissue Turnover', ar: 'صحة العظام والأنسجة' },
    description: {
      en: 'Bone remodeling markers protecting the skeleton of heavy lifters.',
      ar: 'مؤشرات إعادة بناء العظام لحماية هيكل رافعي الأثقال.',
    },
    icon: 'Bone',
  },
];

export const LAB_UI = {
  title: {
    en: 'Medical Lab Encyclopedia',
    ar: 'الموسوعة الطبية الشاملة للتحاليل',
  },
  subtitle: {
    en: 'Every biomarker that matters for the serious athlete — reference ranges in both unit systems, scientific high/low analysis and precise action plans.',
    ar: 'كل مؤشر حيوي مهم للرياضي الجاد — النطاقات المرجعية بالنظامين، تحليل علمي دقيق للارتفاع والانخفاض، وخطط عمل مبرمجة.',
  },
  searchPlaceholder: {
    en: 'Search a biomarker — Testosterone, Ferritin, HbA1c… (عربي أيضاً)',
    ar: 'ابحث عن مؤشر حيوي — تيستوستيرون، فيريتين، HbA1c… (English too)',
  },
  noResults: {
    en: 'No biomarkers match your search. Try another term.',
    ar: 'لا توجد مؤشرات مطابقة لبحثك. جرّب كلمة أخرى.',
  },
  clearSearch: { en: 'Clear search', ar: 'مسح البحث' },
  allMarkers: { en: 'All Markers', ar: 'كل المؤشرات' },
  analyzeBtn: { en: 'Analyze My Result', ar: 'حلّل نتيجتي' },
  enterValue: { en: 'Enter your lab value', ar: 'أدخل قيمة تحليلك' },
  referenceRange: { en: 'Reference Range', ar: 'النطاق المرجعي' },
  clinicalDefinition: { en: 'Clinical Definition', ar: 'التعريف السريري' },
  highTitle: { en: 'Elevated Levels', ar: 'القراءة المرتفعة' },
  lowTitle: { en: 'Suppressed Levels', ar: 'القراءة المنخفضة' },
  causes: { en: 'Scientific Causes', ar: 'الأسباب العلمية' },
  symptoms: { en: 'Symptoms & Effects', ar: 'الأعراض والآثار' },
  actionPlan: { en: 'Medical & Lifestyle Action Plan', ar: 'خطة العمل الطبية والغذائية' },
  statusLow: { en: 'Below Range', ar: 'أقل من النطاق' },
  statusNormal: { en: 'Within Range', ar: 'ضمن النطاق' },
  statusHigh: { en: 'Above Range', ar: 'أعلى من النطاق' },
  yourValue: { en: 'Your Value', ar: 'قيمتك' },
  resultVsRange: { en: 'Position vs. reference range', ar: 'موقعك مقارنة بالنطاق المرجعي' },
  close: { en: 'Close', ar: 'إغلاق' },
  metric: { en: 'Metric (SI)', ar: 'متري (SI)' },
  imperial: { en: 'Imperial (US)', ar: 'إمبراطوري (US)' },
  showAll: { en: 'Show all', ar: 'عرض الكل' },
};

const bt = (en: string, ar: string): BilingualText => ({ en, ar });

/* ════════════════════════════════ 1. HORMONES ═══════════════════════════════ */
const hormones: LabTestData[] = [
  {
    id: 'hormones_total_testosterone',
    category: 'hormones',
    name: bt('Total Testosterone', 'التستوستيرون الكلي'),
    description: bt(
      'The primary male androgen — drives muscle synthesis, strength, libido and recovery.',
      'الأندروجين الذكوري الأساسي — يقود تخليق العضلات والقوة والرغبة والتعافي.'
    ),
    range: {
      si: { min: 8.64, max: 34.7, unit: 'nmol/L', decimals: 2 },
      us: { min: 240, max: 1000, unit: 'ng/dL', decimals: 0 },
      siToUs: 28.818,
      usToSi: 0.03470,
    },
    high: {
      causes: [
        bt('Exogenous androgen administration (on-cycle).', 'استخدام الأندروجينات الخارجية (أثناء الكورس).'),
        bt('Aromatase suppression shifting the androgen/estrogen balance.', 'قمع الأروماتاز وتحويل توازن الأندروجين/الإستروجين.'),
        bt('Very rare testicular or adrenal secreting tumors.', 'أورام نادرة جداً في الخصية أو الغدة الكظرية.'),
      ],
      symptoms: [
        bt('Acne, oily skin and accelerated scalp hair loss in predisposed men.', 'حبوب وزيادة إفراز الدهون وتساقط شعر فروة الرأس عند المهيأين وراثياً.'),
        bt('Erythrocytosis — elevated hematocrit and cardiovascular strain.', 'كثرة كريات الدم الحمراء وارتفاع الهيماتوكريت وضغط على القلب.'),
        bt('Mood swings, aggression and disturbed sleep quality.', 'تقلبات مزاجية وعدوانية واضطراب جودة النوم.'),
      ],
      advice: [
        bt('Check total testosterone together with E2, hematocrit and lipid panel before drawing conclusions.', 'افحص التستوستيرون الكلي مع E2 والهيماتوكريت وملف الدهون معاً قبل الاستنتاج.'),
        bt('If on cycle: manage aromatization and donate blood if hematocrit exceeds 54%.', 'إن كنت في كورس: اضبط الأروماتاز وتبرع بالدم إذا تجاوز الهيماتوكريت 54%.'),
        bt('Re-test after 5 half-lives of the ester to obtain a steady-state reading.', 'أعد الفحص بعد 5 أعمار نصف للأستر للحصول على قراءة الاستقرار.'),
      ],
    },
    low: {
      causes: [
        bt('HPTA suppression from recent anabolic use or PCT failure.', 'قمع المحور الهرموني بعد الاستخدام أو فشل بروتوكول ما بعد الكورس.'),
        bt('Overtraining, chronic sleep deprivation and excess caloric deficit.', 'التدريب الزائد والحرمان المزمن من النوم والعجز الحراري الشديد.'),
        bt('Obesity with elevated aromatase activity and metabolic syndrome.', 'السمنة مع ارتفاع نشاط الأروماتاز ومتلازمة الأيض.'),
      ],
      symptoms: [
        bt('Loss of muscle mass, strength and libido.', 'فقدان الكتلة العضلية والقوة والرغبة الجنسية.'),
        bt('Chronic fatigue, depressed mood and reduced recovery.', 'إرهاق مزمن ومزاج منخفض وبطء التعافي.'),
        bt('Reduced bone density and increased body fat accumulation.', 'انخفاض كثافة العظام وزيادة تراكم الدهون.'),
      ],
      advice: [
        bt('Run a full panel: LH/FSH to distinguish primary vs secondary hypogonadism.', 'افحص LH/FSH للتمييز بين فشل الخصية الأولي والثانوي.'),
        bt('Normalize sleep (7–9h), calories and training volume before any medical therapy.', 'صحّح النوم والسعرات وحجم التدريب قبل أي علاج طبي.'),
        bt('Allow 4–6 weeks of recovery after PCT; only consider TRT after confirmed persistent low values.', 'امنح 4–6 أسابيع للتعافي بعد الكورس؛ لا تفكر في TRT إلا بعد تأكيد انخفاض مستمر.'),
      ],
    },
    keywords: ['total test', 'testosterone', 'تستوستيرون', 'تيستوستيرون', 'total t'],
  },
  {
    id: 'hormones_free_testosterone',
    category: 'hormones',
    name: bt('Free Testosterone', 'التستوستيرون الحر'),
    description: bt(
      'Bioavailable, unbound testosterone — the fraction that reaches tissues.',
      'التستوستيرون النشط غير المرتبط — الجزء الذي يصل فعلياً للأنسجة.'
    ),
    range: {
      si: { min: 17, max: 72, unit: 'pmol/L', decimals: 0 },
      us: { min: 5, max: 21, unit: 'pg/mL', decimals: 0 },
      siToUs: 0.2724,
      usToSi: 3.6711,
    },
    high: {
      causes: [
        bt('Exogenous androgen use overwhelming binding proteins.', 'الاستخدام الخارجي للأندروجينات متفوقاً على البروتينات الرابطة.'),
        bt('Low SHBG (e.g. from oral AAS, obesity, insulin resistance).', 'انخفاض SHBG (الأندروجينات الفموية، السمنة، مقاومة الأنسولين).'),
      ],
      symptoms: [
        bt('Amplified androgenic effects: acne, aggression, hair loss.', 'تضخم التأثيرات الأندروجينية: حبوب وعدوانية وتساقط شعر.'),
        bt('Higher aromatization pressure with fluctuating E2.', 'ضغط أروماتاز أعلى مع تقلب الإستروجين.'),
      ],
      advice: [
        bt('Evaluate SHBG and total T together to understand the free fraction.', 'قيّم SHBG والتستوستيرون الكلي معاً لفهم الجزء الحر.'),
        bt('Adjust dosing if symptoms of excess androgen appear.', 'عدّل الجرعة عند ظهور أعراض فرط الأندروجين.'),
      ],
    },
    low: {
      causes: [
        bt('Elevated SHBG binding testosterone (liver disease, thyroid, aging).', 'ارتفاع SHBG المرتبط بالتستوستيرون (أمراض الكبد، الدرقية، التقدم بالعمر).'),
        bt('Suppressed total testosterone production (HPTA shutdown).', 'انخفاض إنتاج التستوستيرون الكلي (توقف المحور).'),
      ],
      symptoms: [
        bt('Classic low-T symptoms despite normal-looking total T.', 'أعراض نقص التستوستيرون رغم قيمة كلية تبدو طبيعية.'),
        bt('Fatigue, poor libido and reduced well-being.', 'إرهاق وضعف رغبة وانخفاض الشعور بالحيوية.'),
      ],
      advice: [
        bt('Check SHBG to reveal why free T is low when total T is normal.', 'افحص SHBG لمعرفة سبب انخفاض الحر رغم طبيعية الكلي.'),
        bt('Supplements: boron (6–9 mg) may lower SHBG in deficiency states.', 'المكملات: البورون (6–9 ملغ) قد يخفض SHBG في حالات النقص.'),
        bt('Re-evaluate thyroid status and liver health as underlying drivers.', 'أعد تقييم الغدة الدرقية وصحة الكبد كأسباب كامنة.'),
      ],
    },
    keywords: ['free test', 'free t', 'تستوستيرون حر', 'free testosterone'],
  },
  {
    id: 'hormones_shbg',
    category: 'hormones',
    name: bt('SHBG', 'SHBG'),
    description: bt(
      'Sex hormone-binding globulin — controls how much testosterone stays active.',
      'البروتين الرابط للهرمونات الجنسية — يتحكم في كمية التستوستيرون النشط.'
    ),
    range: {
      si: { min: 16, max: 55, unit: 'nmol/L', decimals: 0 },
      us: { min: 16, max: 55, unit: 'nmol/L', decimals: 0 },
      siToUs: 1,
      usToSi: 1,
    },
    high: {
      causes: [
        bt('Liver conditions, hyperthyroidism, aging and low insulin.', 'أمراض الكبد وفرط الدرقية والتقدم بالعمر وانخفاض الأنسولين.'),
        bt('Certain medications (anti-seizure, estrogen therapy).', 'بعض الأدوية (مضادات الاختلاج، العلاج الإستروجيني).'),
      ],
      symptoms: [
        bt('Reduced free testosterone with muscle loss and low libido.', 'انخفاض التستوستيرون الحر مع فقدان عضلي وضعف رغبة.'),
      ],
      advice: [
        bt('Address thyroid and liver drivers; retest total + free T.', 'عالج الأسباب الدرقية والكبدية وأعد فحص الكلي والحر.'),
        bt('Boron and adequate zinc may modestly support lower SHBG.', 'البورون والزنك الكافي قد يدعمان خفض SHBG بشكل معتدل.'),
      ],
    },
    low: {
      causes: [
        bt('Oral 17-alkylated anabolic steroids and high-dose androgens.', 'الأندروجينات الفموية المؤلكلة عالية الجرعة.'),
        bt('Obesity, insulin resistance and metabolic syndrome.', 'السمنة ومقاومة الأنسولين ومتلازمة الأيض.'),
      ],
      symptoms: [
        bt('Higher free androgens — acne and aggression with labile E2.', 'ارتفاع الأندروجينات الحرة — حبوب وعدوانية مع تقلب الإستروجين.'),
      ],
      advice: [
        bt('Interpret free T cautiously when SHBG is low.', 'فسّر التستوستيرون الحر بحذر عندما يكون SHBG منخفضاً.'),
        bt('Monitor estradiol closely during orals.', 'راقب الإستراديول عن قرب أثناء الأدوية الفموية.'),
      ],
    },
    keywords: ['shbg', 'sex hormone binding globulin'],
  },
  {
    id: 'hormones_estradiol',
    category: 'hormones',
    name: bt('Estradiol (E2 — Sensitive)', 'الإستراديول (E2 — فحص حساس)'),
    description: bt(
      'Primary estrogen — vital for bone, joints, libido and brain health, even in men.',
      'الإستروجين الأساسي — حيوي للعظام والمفاصل والرغبة وصحة الدماغ حتى لدى الرجال.'
    ),
    range: {
      si: { min: 73, max: 165, unit: 'pmol/L', decimals: 0 },
      us: { min: 20, max: 45, unit: 'pg/mL', decimals: 0 },
      siToUs: 0.2724,
      usToSi: 3.6711,
    },
    high: {
      causes: [
        bt('High aromatase activity from large androgen doses.', 'نشاط أروماتاز مرتفع من جرعات أندروجينية كبيرة.'),
        bt('Obesity (adipose aromatase), alcohol and liver stress.', 'السمنة (الأروماتاز في الشحوم) والكحول وضغط الكبد.'),
      ],
      symptoms: [
        bt('Water retention, bloating and elevated blood pressure.', 'احتباس الماء وانتفاخ وارتفاع ضغط الدم.'),
        bt('Gynecomastia risk and nipple sensitivity.', 'خطر التثدي وحساسية الحلمتين.'),
        bt('Emotional instability and erectile dysfunction in some men.', 'تقلب انفعالي واضطراب الانتصاب لدى البعض.'),
      ],
      advice: [
        bt('Use aromatase inhibitors only if symptoms + high E2 confirmed (avoid crushing E2).', 'استخدم مثبطات الأروماتاز فقط مع تأكيد الأعراض وارتفاع E2 (تجنب سحقه).'),
        bt('Consider split androgen dosing to reduce aromatase peaks.', 'قسّم جرعة الأندروجين لتقليل قمم الأروماتاز.'),
        bt('Reduce body fat and alcohol intake to lower baseline aromatization.', 'اخفض دهون الجسم والكحول لخفض الأروماتزة الأساسية.'),
      ],
    },
    low: {
      causes: [
        bt('Over-aggressive aromatase inhibitor use.', 'الاستخدام المفرط لمثبطات الأروماتاز.'),
        bt('Complete HPTA shutdown and aromatase inhibition on cycle.', 'توقف المحور الكامل وتثبيط الأروماتاز أثناء الكورس.'),
      ],
      symptoms: [
        bt('Joint pain, dry skin and brittle tendons.', 'آلام مفاصل وجفاف جلد وهشاشة أوتار.'),
        bt('Low libido, mood flattening and insomnia.', 'ضعف رغبة وتبلد مزاج وأرق.'),
        bt('Increased bone resorption over time.', 'زيادة هشاشة العظام مع الوقت.'),
      ],
      advice: [
        bt('Reduce or discontinue AI; allow E2 to recover into range.', 'خفف أو أوقف المثبط واترك E2 يعود لنطاقه.'),
        bt('Add joint-friendly fish oil and adequate vitamin D.', 'أضف زيت السمك وفيتامين D للدعم المفصلي.'),
      ],
    },
    keywords: ['e2', 'estradiol', 'estro', 'إستراديول', 'استراديول'],
  },
  {
    id: 'hormones_prolactin',
    category: 'hormones',
    name: bt('Prolactin', 'البرولاكتين'),
    description: bt(
      'Pituitary hormone — elevation impairs libido and can promote gyno.',
      'هرمون الغدة النخامية — ارتفاعه يضعف الرغبة ويمكن أن يعزز التثدي.'
    ),
    range: {
      si: { min: 84, max: 318, unit: 'mIU/L', decimals: 0 },
      us: { min: 4, max: 15, unit: 'ng/mL', decimals: 0 },
      siToUs: 0.04717,
      usToSi: 21.2,
    },
    high: {
      causes: [
        bt('19-nor compounds (Nandrolone, Trenbolone).', 'مركبات 19-نور (ناندولون، ترينبولون).'),
        bt('Stress, poor sleep, dopamine depletion and pituitary micro-adenoma.', 'التوتر وقلة النوم ونضوب الدوبامين وورم دقيق في النخامية.'),
      ],
      symptoms: [
        bt('Decreased libido and erectile dysfunction.', 'انخفاض الرغبة وخلل الانتصاب.'),
        bt('Lactation-like gyno and water retention.', 'تثدي شبيه بالإدرار واحتباس الماء.'),
      ],
      advice: [
        bt('Prefer 19-nor-free compounds if prolactin rises persistently.', 'فضل المركبات الخالية من 19-نور عند ارتفاع البرولاكتين المستمر.'),
        bt('Vitamin B6 (P5P) 200–300 mg may support dopamine; severe cases need medical imaging.', 'فيتامين B6 (P5P) 200–300 ملغ قد يدعم الدوبامين؛ الحالات الشديدة تحتاج تصويراً طبيًا.'),
      ],
    },
    low: {
      causes: [
        bt('Dopamine agonist use (cabergoline) overdosing.', 'فرط استخدام محفزات الدوبامين (كابرجولين).'),
      ],
      symptoms: [
        bt('Usually asymptomatic; rarely affects libido.', 'غالباً بدون أعراض؛ نادراً ما يؤثر على الرغبة.'),
      ],
      advice: [
        bt('Rarely clinically significant — no action needed unless symptomatic.', 'نادراً ما يكون مهماً سريرياً — لا حاجة لتدخل ما لم تظهر أعراض.'),
      ],
    },
    keywords: ['prolactin', 'برولاكتين', 'prl'],
  },
  {
    id: 'hormones_lh',
    category: 'hormones',
    name: bt('Luteinizing Hormone (LH)', 'الهرمون الملوتن (LH)'),
    description: bt(
      'Pituitary signal commanding the testes to produce testosterone.',
      'إشارة الغدة النخامية التي تأمر الخصيتين بإنتاج التستوستيرون.'
    ),
    range: {
      si: { min: 1.7, max: 8.6, unit: 'IU/L', decimals: 1 },
      us: { min: 1.7, max: 8.6, unit: 'mIU/mL', decimals: 1 },
      siToUs: 1,
      usToSi: 1,
    },
    high: {
      causes: [
        bt('Primary testicular failure — the pituitary compensates with high LH.', 'فشل الخصية الأولي — تعوض النخامية بارتفاع LH.'),
      ],
      symptoms: [
        bt('Low testosterone with elevated LH (hypergonadotropic hypogonadism).', 'انخفاض التستوستيرون مع ارتفاع LH (قصور الغدد التناسلية الأولي).'),
      ],
      advice: [
        bt('Distinguishes primary vs secondary hypogonadism — essential before any TRT decision.', 'يميز الفشل الأولي عن الثانوي — أساسي قبل أي قرار TRT.'),
      ],
    },
    low: {
      causes: [
        bt('HPTA suppression during and after AAS cycles.', 'قمع المحور الهرموني أثناء وبعد كورسات الأندروجينات.'),
      ],
      symptoms: [
        bt('Testosterone production falls (secondary hypogonadism).', 'ينخفض إنتاج التستوستيرون (قصور ثانوي).'),
      ],
      advice: [
        bt('LH/FSH are the recovery markers post-PCT; retest at weeks 4–6.', 'LH/FSH مؤشرات التعافي بعد الكورس؛ أعد الفحص في الأسبوع 4–6.'),
        bt('Persistently low LH + low T may require HCG-stimulated recovery protocols.', 'الانخفاض المستمر يستوجب بروتوكولات إنعاش باستخدام HCG.'),
      ],
    },
    keywords: ['lh', 'luteinizing', 'ملوتن'],
  },
  {
    id: 'hormones_fsh',
    category: 'hormones',
    name: bt('Follicle Stimulating Hormone (FSH)', 'الهرمون المنبه للجريب (FSH)'),
    description: bt(
      'Pituitary hormone driving spermatogenesis and fertility.',
      'هرمون نخامي يقود إنتاج الحيوانات المنوية والخصوبة.'
    ),
    range: {
      si: { min: 1.5, max: 12.4, unit: 'IU/L', decimals: 1 },
      us: { min: 1.5, max: 12.4, unit: 'mIU/mL', decimals: 1 },
      siToUs: 1,
      usToSi: 1,
    },
    high: {
      causes: [
        bt('Primary gonadal failure.', 'فشل الغدد التناسلية الأولي.'),
      ],
      symptoms: [
        bt('Reduced fertility with elevated FSH.', 'انخفاض الخصوبة مع ارتفاع FSH.'),
      ],
      advice: [
        bt('If fertility is a goal, evaluate spermogram alongside FSH.', 'إذا كانت الخصوبة هدفاً، قيّم مخطط الحيوانات المنوية مع FSH.'),
      ],
    },
    low: {
      causes: [
        bt('Suppression from exogenous androgens and long cycles.', 'القمع من الأندروجينات الخارجية والكورسات الطويلة.'),
      ],
      symptoms: [
        bt('Suppressed spermatogenesis — temporary infertility.', 'تثبيط إنتاج الحيوانات المنوية — عقم مؤقت.'),
      ],
      advice: [
        bt('FSH recovery post-PCT is a key fertility marker.', 'تعافي FSH بعد الكورس مؤشر خصوبة رئيسي.'),
        bt('If still low at 3 months post-cycle, consult a reproductive specialist.', 'إن بقي منخفضاً بعد 3 أشهر من الكورس استشر أخصائي إنجاب.'),
      ],
    },
    keywords: ['fsh', 'follicle stimulating', 'منبه للجريب'],
  },
  {
    id: 'hormones_dhea_s',
    category: 'hormones',
    name: bt('DHEA-S', 'DHEA-S'),
    description: bt(
      'Adrenal androgen reserve — precursor and vitality marker.',
      'احتياطي الأندروجين الكظري — مقدمة ومرآة الحيوية.'
    ),
    range: {
      si: { min: 2.2, max: 15.2, unit: 'µmol/L', decimals: 1 },
      us: { min: 80, max: 560, unit: 'µg/dL', decimals: 0 },
      siToUs: 36.85,
      usToSi: 0.02714,
    },
    high: {
      causes: [
        bt('Adrenal hyperplasia, supplements or late-onset adrenal enzyme variants.', 'فرط تنسج كظري أو مكملات أو متغيرات إنزيمية كظرية.'),
      ],
      symptoms: [
        bt('Acne, oily skin and mild androgenic load.', 'حبوب وزيادة دهون الجلد وعبء أندروجيني خفيف.'),
      ],
      advice: [
        bt('Confirm with morning cortisol and adrenal imaging if markedly elevated.', 'أكد بفحص الكورتيزول الصباحي وتصوير كظري إن كان مرتفعاً بشكل كبير.'),
      ],
    },
    low: {
      causes: [
        bt('Adrenal fatigue, aging, chronic stress and corticosteroid use.', 'الإجهاد الكظري المزمن والتقدم بالعمر واستخدام الكورتيكوستيرويدات.'),
      ],
      symptoms: [
        bt('Low energy, reduced resilience and lowered mood.', 'طاقة منخفضة وضعف مرونة ومزاج منخفض.'),
      ],
      advice: [
        bt('Address stress, sleep and overtraining before supplementation.', 'عالج التوتر والنوم والتدريب الزائد قبل أي مكملات.'),
        bt('Short-term DHEA (25–50 mg) under guidance can support well-being in deficient states.', 'قد يدعم DHEA بجرعة قصيرة (25–50 ملغ) الحيوية في حالات النقص.'),
      ],
    },
    keywords: ['dhea', 'dhea-s', 'ديهيدرو إيبي أندروستيرون'],
  },
  {
    id: 'hormones_cortisol',
    category: 'hormones',
    name: bt('Cortisol (AM)', 'الكورتيزول (صباحاً)'),
    description: bt(
      'Primary stress hormone — catabolic when chronically elevated.',
      'هرمون التوتر الأساسي — هدام عند ارتفاعه المزمن.'
    ),
    range: {
      si: { min: 165, max: 635, unit: 'nmol/L', decimals: 0 },
      us: { min: 6, max: 23, unit: 'µg/dL', decimals: 0 },
      siToUs: 0.03624,
      usToSi: 27.59,
    },
    high: {
      causes: [
        bt('Chronic stress, overtraining and insufficient recovery.', 'التوتر المزمن والتدريب الزائد والتعافي غير الكافي.'),
        bt('Cushing syndrome (rare) or high-dose glucocorticoids.', 'متلازمة كوشينغ (نادرة) أو جرعات عالية من الكورتيكوستيرويدات.'),
      ],
      symptoms: [
        bt('Muscle wasting, fat gain around the midsection.', 'هدم عضلي وتراكم دهون حول الخصر.'),
        bt('Suppressed immunity, poor sleep and insulin resistance.', 'ضعف مناعة واضطراب نوم ومقاومة أنسولين.'),
      ],
      advice: [
        bt('Reduce training volume, improve sleep, and add adaptogens (ashwagandha) with medical guidance.', 'خفف حجم التدريب وحسّن النوم وأضف أدابتوجينات (أشواغاندا) بإشراف طبي.'),
        bt('Test AM and PM values to map the diurnal rhythm.', 'افحص قيمتي الصباح والمساء لرسم إيقاع اليوم.'),
      ],
    },
    low: {
      causes: [
        bt('Adrenal insufficiency after prolonged steroid exposure.', 'قصور كظري بعد تعرض مطول للستيرويدات.'),
        bt('Chronic HPA-axis burnout.', 'إرهاق مزمن لمحور HPA.'),
      ],
      symptoms: [
        bt('Profound fatigue, dizziness and low blood pressure on standing.', 'إرهاق شديد ودوخة وانخفاض ضغط عند الوقوف.'),
      ],
      advice: [
        bt('Adrenal insufficiency is a medical emergency risk — see a physician promptly.', 'قصور الكظر خطر طبي عاجل — راجع الطبيب فوراً.'),
      ],
    },
    keywords: ['cortisol', 'كورتيزول', 'stress hormone'],
  },
  {
    id: 'hormones_gh',
    category: 'hormones',
    name: bt('Growth Hormone (GH)', 'هرمون النمو (GH)'),
    description: bt(
      'Pulsatile anabolic hormone driving lipolysis, collagen and tissue repair.',
      'هرمون بنائي نابضي يقود حرق الدهون والكولاجين وإصلاح الأنسجة.'
    ),
    range: {
      si: { min: 1.8, max: 46, unit: 'mIU/L', decimals: 0 },
      us: { min: 0.4, max: 10, unit: 'ng/mL', decimals: 1 },
      siToUs: 0.217,
      usToSi: 4.6,
    },
    high: {
      causes: [
        bt('Exogenous GH use or (rare) pituitary adenoma.', 'استخدام هرمون النمو الخارجي أو ورم نخامي (نادر).'),
      ],
      symptoms: [
        bt('Acral growth, jaw/feet enlargement and carpal tunnel syndrome.', 'تضخم الأطراف والفك والقدمين ومتلازمة النفق الرسغي.'),
        bt('Elevated fasting glucose and insulin resistance.', 'ارتفاع سكر الصائم ومقاومة الأنسولين.'),
      ],
      advice: [
        bt('Monitor fasting glucose and HbA1c while using GH.', 'راقب سكر الصائم وHbA1c أثناء استخدام هرمون النمو.'),
        bt('IGF-1 is the better functional marker to dose and titrate GH.', 'IGF-1 هو المؤشر الوظيفي الأفضل لمعايرة الجرعة.'),
      ],
    },
    low: {
      causes: [
        bt('Normal physiological variation (pulsatile secretion), obesity, poor sleep.', 'تغير فيزيولوجي طبيعي (إفراز نابضي)، سمنة، قلة نوم.'),
      ],
      symptoms: [
        bt('Reduced lean mass and slower recovery in deficiency states.', 'انخفاض الكتلة الصافية وبطء التعافي في حالات النقص.'),
      ],
      advice: [
        bt('Single GH readings are unreliable — rely on IGF-1 and clinical picture.', 'قراءة GH المنفردة غير موثوقة — اعتمد على IGF-1 والصورة السريرية.'),
      ],
    },
    keywords: ['growth hormone', 'gh', 'هرمون النمو'],
  },
  {
    id: 'hormones_igf1',
    category: 'hormones',
    name: bt('IGF-1', 'IGF-1'),
    description: bt(
      'Insulin-like growth factor — the functional mediator of GH action.',
      'عامل النمو الشبيه بالأنسولين — الوسيط الوظيفي لتأثير هرمون النمو.'
    ),
    range: {
      si: { min: 13, max: 39, unit: 'nmol/L', decimals: 0 },
      us: { min: 100, max: 300, unit: 'ng/mL', decimals: 0 },
      siToUs: 7.65,
      usToSi: 0.1307,
    },
    high: {
      causes: [
        bt('GH use, or elevated GH activity (acromegaly).', 'استخدام هرمون النمو أو نشاطه المرتفع (تضخم أطراف).'),
      ],
      symptoms: [
        bt('Edema, joint aches and insulin resistance at very high values.', 'وذمة وآلام مفاصل ومقاومة أنسولين عند القيم المرتفعة جداً.'),
      ],
      advice: [
        bt('Titrate GH to keep IGF-1 within the upper reference zone.', 'عاير هرمون النمو لإبقاء IGF-1 ضمن المنطقة المرجعية العليا.'),
      ],
    },
    low: {
      causes: [
        bt('Starvation diets, liver stress, hypothyroidism and poor sleep.', 'الحميات القاسية وضغط الكبد وقصور الدرقية وقلة النوم.'),
      ],
      symptoms: [
        bt('Slower muscle gain and recovery in deficient states.', 'بطء نمو العضلات والتعافي في حالات النقص.'),
      ],
      advice: [
        bt('Optimize protein, sleep and training stimulus before supplementation.', 'حسّن البروتين والنوم ومحفز التدريب قبل أي مكملات.'),
      ],
    },
    keywords: ['igf-1', 'igf1', 'insulin like growth factor'],
  },
  {
    id: 'hormones_progesterone',
    category: 'hormones',
    name: bt('Progesterone', 'البروجسترون'),
    description: bt(
      'Steroid hormone with neuro-protective and anti-estrogen roles in men.',
      'هرمون ستيرويدي وقائي عصبي ومعاكس للإستروجين لدى الرجال.'
    ),
    range: {
      si: { min: 0.64, max: 4.45, unit: 'nmol/L', decimals: 2 },
      us: { min: 0.2, max: 1.4, unit: 'ng/mL', decimals: 1 },
      siToUs: 0.314,
      usToSi: 3.18,
    },
    high: {
      causes: [
        bt('Rare — exogenous progestins or adrenal enzyme variations.', 'نادر — البروجستينات الخارجية أو متغيرات إنزيمية كظرية.'),
      ],
      symptoms: [
        bt('Possible libido suppression and mood changes.', 'احتمال تثبيط الرغبة وتغيرات مزاجية.'),
      ],
      advice: [
        bt('Generally benign in men; correlate with symptoms.', 'حميد عموماً لدى الرجال؛ اربطه بالأعراض.'),
      ],
    },
    low: {
      causes: [
        bt('Normal for men; usually not monitored.', 'طبيعي لدى الرجال؛ لا يُراقب عادة.'),
      ],
      symptoms: [
        bt('No established symptom cluster in men.', 'لا توجد أعراض معروفة للرجال.'),
      ],
      advice: [
        bt('Rarely actionable in males — interpret in context.', 'نادراً ما يستدعي تدخلاً لدى الذكور — فسّره ضمن السياق.'),
      ],
    },
    keywords: ['progesterone', 'بروجسترون'],
  },
  {
    id: 'hormones_aldosterone',
    category: 'hormones',
    name: bt('Aldosterone', 'الألدوستيرون'),
    description: bt(
      'Adrenal mineralocorticoid controlling sodium, potassium and blood pressure.',
      'الهرمون المعدني الكظري الضابط للصوديوم والبوتاسيوم وضغط الدم.'
    ),
    range: {
      si: { min: 83, max: 970, unit: 'pmol/L', decimals: 0 },
      us: { min: 3, max: 35, unit: 'ng/dL', decimals: 0 },
      siToUs: 0.0361,
      usToSi: 27.7,
    },
    high: {
      causes: [
        bt('Hyperaldosteronism, low sodium diet, dehydration, stimulant use.', 'فرط ألدوستيرون، حمية منخفضة الصوديوم، جفاف، منشطات.'),
      ],
      symptoms: [
        bt('High blood pressure, low potassium and muscle cramps.', 'ارتفاع ضغط وانخفاض بوتاسيوم وتشنجات عضلية.'),
      ],
      advice: [
        bt('Check potassium and blood pressure; rehydrate and reduce stimulants.', 'افحص البوتاسيوم وضغط الدم؛ رطّب جسمك وقلل المنشطات.'),
      ],
    },
    low: {
      causes: [
        bt('Adrenal insufficiency, high salt intake, certain blood-pressure drugs.', 'قصور كظري أو إفراط في الملح أو بعض أدوية الضغط.'),
      ],
      symptoms: [
        bt('Low blood pressure, fatigue and salt craving.', 'انخفاض ضغط وإرهاق ورغبة في الملح.'),
      ],
      advice: [
        bt('Rare in athletes — correlate with hydration status and potassium.', 'نادر لدى الرياضيين — اربطه بحالة الترطيب والبوتاسيوم.'),
      ],
    },
    keywords: ['aldosterone', 'ألدوستيرون'],
  },
  {
    id: 'hormones_androstenedione',
    category: 'hormones',
    name: bt('Androstenedione', 'الأندروستينديون'),
    description: bt(
      'Adrenal/gonadal androgen precursor convertible to testosterone.',
      'سلائف أندروجينية كظرية/غددية قابلة للتحويل إلى تستوستيرون.'
    ),
    range: {
      si: { min: 1.4, max: 6.6, unit: 'nmol/L', decimals: 1 },
      us: { min: 40, max: 190, unit: 'ng/dL', decimals: 0 },
      siToUs: 28.64,
      usToSi: 0.0349,
    },
    high: {
      causes: [
        bt('Adrenal enzyme variants or adrenal hyperplasia.', 'متغيرات إنزيمية كظرية أو فرط تنسج.'),
      ],
      symptoms: [
        bt('Mild androgenic symptoms: acne, oily skin.', 'أعراض أندروجينية خفيفة: حبوب ودهون بالجلد.'),
      ],
      advice: [
        bt('Part of an adrenal work-up when androgens are borderline.', 'جزء من استكشاف كظري عندما تكون الأندروجينات حدية.'),
      ],
    },
    low: {
      causes: [
        bt('Adrenal insufficiency or advancing age.', 'قصور كظري أو تقدم بالعمر.'),
      ],
      symptoms: [
        bt('Generally no specific symptoms in men.', 'عادة بدون أعراض محددة لدى الرجال.'),
      ],
      advice: [
        bt('Rarely actionable alone — interpret with DHEA-S and cortisol.', 'نادراً ما يستدعي تدخلاً وحده — فسّره مع DHEA-S والكورتيزول.'),
      ],
    },
    keywords: ['androstenedione', 'أندروستينديون'],
  },
];

/* ═══════════════════════════ 2. ORGAN FUNCTION (LIVER/KIDNEY/METABOLIC) ═══════════════════════════ */
const organs: LabTestData[] = [
  {
    id: 'organs_alt',
    category: 'organs',
    name: bt('ALT (SGPT)', 'ALT (SGPT)'),
    description: bt(
      'Liver enzyme — the primary marker of hepatocyte stress or damage.',
      'إنزيم الكبد — المؤشر الأساسي لضغط أو تلف خلايا الكبد.'
    ),
    range: {
      si: { min: 10, max: 40, unit: 'U/L', decimals: 0 },
      us: { min: 10, max: 40, unit: 'U/L', decimals: 0 },
      siToUs: 1,
      usToSi: 1,
    },
    high: {
      causes: [
        bt('Oral 17-alpha-alkylated steroids (Anadrol, Winstrol, Dbol).', 'الستيرويدات الفموية المؤلكلة (أنادرول، وينسترول، ديانابول).'),
        bt('Hepatotoxic drugs, alcohol and fatty liver disease.', 'أدوية كبدية سامة والكحول والكبد الدهني.'),
      ],
      symptoms: [
        bt('Usually silent — rises before symptoms appear.', 'غالباً صامت — يرتفع قبل ظهور الأعراض.'),
        bt('Untreated: fatigue, jaundice and impaired liver function.', 'بدون علاج: إرهاق واصفرار وضعف وظيفي.'),
      ],
      advice: [
        bt('Discontinue oral AAS and hepatotoxics; add TUDCA (500–1000 mg) and NAC (600–1200 mg).', 'أوقف الأندروجينات الفموية والسموم الكبدية؛ أضف TUDCA (500–1000 ملغ) وNAC (600–1200 ملغ).'),
        bt('Re-test in 4 weeks; if ALT > 2–3× normal with symptoms, stop everything and see a physician.', 'أعد الفحص بعد 4 أسابيع؛ إن تجاوز ALT ضعفي القيمة مع أعراض، أوقف كل شيء وراجع الطبيب.'),
      ],
    },
    low: {
      causes: [
        bt('Severe liver failure (rare) or B6 deficiency.', 'فشل كبدي حاد (نادر) أو نقص فيتامين B6.'),
      ],
      symptoms: [
        bt('No specific symptoms — usually benign.', 'لا أعراض محددة — عادة حميد.'),
      ],
      advice: [
        bt('No intervention required unless massively low with other liver signs.', 'لا حاجة لتدخل إلا إذا كان منخفضاً جداً مع علامات كبدية أخرى.'),
      ],
    },
    keywords: ['alt', 'sgpt', 'liver enzyme', 'كبد', 'alt sgot'],
  },
  {
    id: 'organs_ast',
    category: 'organs',
    name: bt('AST (SGOT)', 'AST (SGOT)'),
    description: bt(
      'Enzyme found in liver, muscle and heart — rises with either stress.',
      'إنزيم موجود في الكبد والعضلة والقلب — يرتفع مع ضغط أي منها.'
    ),
    range: {
      si: { min: 10, max: 40, unit: 'U/L', decimals: 0 },
      us: { min: 10, max: 40, unit: 'U/L', decimals: 0 },
      siToUs: 1,
      usToSi: 1,
    },
    high: {
      causes: [
        bt('Intense resistance training causing muscle enzyme leak.', 'التدريب المقاوم الشديد مسبباً تسرب إنزيمات العضلات.'),
        bt('Liver stress, alcohol, or IM injection site irritation.', 'ضغط الكبد أو الكحول أو تهيج موضع الحقن العضلي.'),
      ],
      symptoms: [
        bt('None specific — AST alone cannot distinguish liver vs muscle source.', 'لا أعراض محددة — لا يميز AST وحده مصدر الكبد من العضلة.'),
      ],
      advice: [
        bt('Compare AST/ALT ratio and add CK: high CK implies muscle origin.', 'قارن نسبة AST/ALT وأضف CK: ارتفاع CK يدل على مصدر عضلي.'),
        bt('Test after 2–3 rest days to avoid training-induced noise.', 'افحص بعد 2–3 أيام راحة لتجنب تشويش التدريب.'),
      ],
    },
    low: {
      causes: [
        bt('Severe liver disease (rare) or B6 deficiency.', 'مرض كبدي شديد (نادر) أو نقص فيتامين B6.'),
      ],
      symptoms: [
        bt('No specific symptoms.', 'لا أعراض محددة.'),
      ],
      advice: [
        bt('Rarely actionable in isolation.', 'نادراً ما يستدعي تدخلاً بمفرده.'),
      ],
    },
    keywords: ['ast', 'sgot', 'sgpt'],
  },
  {
    id: 'organs_alp',
    category: 'organs',
    name: bt('Alkaline Phosphatase (ALP)', 'الفوسفاتاز القلوية (ALP)'),
    description: bt(
      'Enzyme from liver/bile ducts and bone — splits across both systems.',
      'إنزيم من الكبد والقنوات الصفراوية والعظام — يتوزع بين النظامين.'
    ),
    range: {
      si: { min: 44, max: 147, unit: 'U/L', decimals: 0 },
      us: { min: 44, max: 147, unit: 'U/L', decimals: 0 },
      siToUs: 1,
      usToSi: 1,
    },
    high: {
      causes: [
        bt('Biliary obstruction, liver congestion or bone remodeling.', 'انسداد صفراوي أو احتقان كبدي أو إعادة بناء عظمية.'),
        bt('High-dose vitamin D therapy mobilizing bone turnover.', 'علاج بجرعات عالية من فيتامين D محركاً دوران العظم.'),
      ],
      symptoms: [
        bt('With GGT: points to bile duct/liver origin.', 'مع GGT: يشير إلى مصدر كبدي/صفراوي.'),
      ],
      advice: [
        bt('Check GGT to differentiate liver (high GGT) vs bone (normal GGT) origin.', 'افحص GGT للتمييز بين المصدر الكبدي (GGT مرتفع) والعظمي (GGT طبيعي).'),
      ],
    },
    low: {
      causes: [bt('Zinc or magnesium deficiency, malnutrition.', 'نقص الزنك أو المغنيسيوم أو سوء التغذية.')],
      symptoms: [bt('No specific symptoms.', 'لا أعراض محددة.')],
      advice: [bt('Optimize zinc and protein intake.', 'حسّن الزنك والبروتين.')],
    },
    keywords: ['alp', 'alkaline phosphatase', 'فوسفاتاز قلوية'],
  },
  {
    id: 'organs_ggt',
    category: 'organs',
    name: bt('GGT', 'GGT'),
    description: bt(
      'Bile duct enzyme — highly specific for liver/biliary stress.',
      'إنزيم القنوات الصفراوية — محدد جداً لضغط الكبد والصفراء.'
    ),
    range: {
      si: { min: 8, max: 61, unit: 'U/L', decimals: 0 },
      us: { min: 8, max: 61, unit: 'U/L', decimals: 0 },
      siToUs: 1,
      usToSi: 1,
    },
    high: {
      causes: [
        bt('Alcohol, oral AAS and biliary congestion.', 'الكحول والأندروجينات الفموية واحتقان صفراوي.'),
      ],
      symptoms: [
        bt('No specific symptoms; a liver-specific red flag.', 'لا أعراض محددة؛ علم تحذير كبدي محدد.'),
      ],
      advice: [
        bt('Strongest single sign of hepatobiliary stress — investigate cause immediately.', 'أقوى مؤشر منفرد لضغط الكبد الصفراوي — حقق في السبب فوراً.'),
      ],
    },
    low: {
      causes: [bt('Usually not clinically relevant.', 'عادة غير مهم سريرياً.')],
      symptoms: [bt('No symptoms.', 'لا أعراض.')],
      advice: [bt('No action required.', 'لا حاجة لإجراء.')],
    },
    keywords: ['ggt', 'gammaglutamyl'],
  },
  {
    id: 'organs_bilirubin_total',
    category: 'organs',
    name: bt('Total Bilirubin', 'البيلييروبين الكلي'),
    description: bt(
      'Breakdown product of hemoglobin — reflects red cell turnover and liver handling.',
      'ناتج تكسير الهيموجلوبين — يعكس دوران كريات الدم الحمر ومعالجة الكبد.'
    ),
    range: {
      si: { min: 3.4, max: 20.5, unit: 'µmol/L', decimals: 1 },
      us: { min: 0.2, max: 1.2, unit: 'mg/dL', decimals: 1 },
      siToUs: 0.0585,
      usToSi: 17.1,
    },
    high: {
      causes: [
        bt('Gilbert syndrome (benign hereditary elevation).', 'متلازمة جيلبرت (ارتفاع وراثي حميد).'),
        bt('Hemolysis, liver stress or fasting.', 'انحلال الدم أو ضغط الكبد أو الصيام.'),
      ],
      symptoms: [
        bt('Mild jaundice under stress or fasting in Gilbert syndrome.', 'اصفرار خفيف عند التوتر أو الصيام في جيلبرت.'),
      ],
      advice: [
        bt('Split total/direct; isolated unconjugated rise with normal enzymes = benign Gilbert.', 'قسّم الكلي/المباشر؛ الارتفاع غير المباشر مع إنزيمات طبيعية = جيلبرت حميد.'),
      ],
    },
    low: {
      causes: [bt('Rarely clinically significant.', 'نادراً ما يكون مهماً سريرياً.')],
      symptoms: [bt('No symptoms.', 'لا أعراض.')],
      advice: [bt('No action required.', 'لا حاجة لإجراء.')],
    },
    keywords: ['bilirubin', 'بيلييروبين'],
  },
  {
    id: 'organs_bilirubin_direct',
    category: 'organs',
    name: bt('Direct Bilirubin', 'البيلييروبين المباشر'),
    description: bt(
      'Conjugated bilirubin — elevation indicates obstructive/biliary patterns.',
      'البيلييروبين المقترن — ارتفاعه يشير إلى نمط انسدادي/صفراوي.'
    ),
    range: {
      si: { min: 0, max: 5.1, unit: 'µmol/L', decimals: 1 },
      us: { min: 0, max: 0.3, unit: 'mg/dL', decimals: 1 },
      siToUs: 0.0585,
      usToSi: 17.1,
    },
    high: {
      causes: [
        bt('Biliary obstruction, drug-induced cholestasis or hepatitis.', 'انسداد صفراوي أو ركود صفراوي دوائي أو التهاب كبدي.'),
      ],
      symptoms: [
        bt('Dark urine and jaundice in significant obstruction.', 'بول داكن واصفرار عند انسداد مهم.'),
      ],
      advice: [
        bt('Investigate with ultrasound and GGT/ALP if persistently elevated.', 'استكشف بالموجات الصوتية وGGT/ALP إن استمر الارتفاع.'),
      ],
    },
    low: {
      causes: [bt('Normal — no clinical meaning.', 'طبيعي — لا معنى سريري.')],
      symptoms: [bt('None.', 'لا شيء.')],
      advice: [bt('No action.', 'لا حاجة لإجراء.')],
    },
    keywords: ['direct bilirubin', 'بيليروبين مباشر'],
  },
  {
    id: 'organs_albumin',
    category: 'organs',
    name: bt('Serum Albumin', 'الألبومين'),
    description: bt(
      'Main plasma protein — nutritional status and liver synthetic function.',
      'بروتين البلازما الرئيسي — الحالة التغذوية والوظيفة الاصطناعية للكبد.'
    ),
    range: {
      si: { min: 35, max: 50, unit: 'g/L', decimals: 0 },
      us: { min: 3.5, max: 5.0, unit: 'g/dL', decimals: 1 },
      siToUs: 0.1,
      usToSi: 10,
    },
    high: {
      causes: [
        bt('Dehydration and concentrated blood (hemoconcentration).', 'الجفاف وتركّز الدم.'),
      ],
      symptoms: [
        bt('None specific — mainly reflects hydration.', 'لا أعراض محددة — يعكس الترطيب غالباً.'),
      ],
      advice: [
        bt('Ensure hydration before re-testing.', 'تأكد من الترطيب قبل إعادة الفحص.'),
      ],
    },
    low: {
      causes: [
        bt('Low protein intake, liver disease or chronic inflammation.', 'نقص البروتين أو أمراض الكبد أو الالتهاب المزمن.'),
      ],
      symptoms: [
        bt('Edema and impaired recovery in significant deficiency.', 'وذمة وبطء تعافي عند نقص مهم.'),
      ],
      advice: [
        bt('Increase protein intake (1.8–2.2 g/kg), re-evaluate liver status.', 'ارفع البروتين (1.8–2.2 جم/كجم) وأعد تقييم الكبد.'),
      ],
    },
    keywords: ['albumin', 'ألبومين'],
  },
  {
    id: 'organs_total_protein',
    category: 'organs',
    name: bt('Total Protein', 'البروتين الكلي'),
    description: bt(
      'Sum of albumin and globulins — overall protein and hydration status.',
      'مجموع الألبومين والغلوبيولينات — حالة البروتين والترطيب العامة.'
    ),
    range: {
      si: { min: 60, max: 83, unit: 'g/L', decimals: 0 },
      us: { min: 6.0, max: 8.3, unit: 'g/dL', decimals: 1 },
      siToUs: 0.1,
      usToSi: 10,
    },
    high: {
      causes: [bt('Dehydration or inflammation-driven globulins.', 'جفاف أو غلوبيولينات ناتجة عن الالتهاب.')],
      symptoms: [bt('None specific.', 'لا أعراض محددة.')],
      advice: [bt('Recheck hydration and add inflammatory markers if elevated.', 'أعد الفحص بعد الترطيب وأضف مؤشرات الالتهاب إن ارتفع.')],
    },
    low: {
      causes: [bt('Malnutrition, liver disease, nephrotic syndrome.', 'سوء تغذية أو أمراض كبدية أو متلازمة كلوية.')],
      symptoms: [bt('Edema and poor recovery.', 'وذمة وبطء تعافي.')],
      advice: [bt('Nutritional review and liver/kidney work-up.', 'مراجعة غذائية واستكشاف كبدي/كلوي.')],
    },
    keywords: ['total protein', 'بروتين كلي'],
  },
  {
    id: 'organs_creatinine',
    category: 'organs',
    name: bt('Creatinine', 'الكرياتينين'),
    description: bt(
      'Muscle breakdown byproduct — filtered by kidneys; baseline kidney marker.',
      'ناتج تكسير العضلات — ترشحه الكلى؛ مؤشر الكلى الأساسي.'
    ),
    range: {
      si: { min: 62, max: 115, unit: 'µmol/L', decimals: 0 },
      us: { min: 0.7, max: 1.3, unit: 'mg/dL', decimals: 1 },
      siToUs: 0.0113,
      usToSi: 88.4,
    },
    high: {
      causes: [
        bt('High muscle mass and creatine supplementation (benign).', 'الكتلة العضلية العالية ومكملات الكرياتين (حميد).'),
        bt('Dehydration, kidney stress, NSAIDs or nephrotoxic AAS effects.', 'الجفاف أو ضغط الكلى أو مضادات الالتهاب أو تأثيرات الكلى للستيرويدات.'),
      ],
      symptoms: [
        bt('None until significant kidney impairment.', 'لا أعراض حتى ضعف كلوي كبير.'),
      ],
      advice: [
        bt('Use eGFR and cystatin C to interpret — high muscle mass inflates creatinine.', 'استخدم eGFR وسيستاتين C للتفسير — الكتلة العضلية ترفع الكرياتينين.'),
        bt('Hydrate well and avoid NSAIDs while on orals.', 'رطّب جيداً وتجنب مضادات الالتهاب أثناء الفمويات.'),
      ],
    },
    low: {
      causes: [bt('Low muscle mass, pregnancy (women), or malnutrition.', 'انخفاض الكتلة العضلية أو سوء التغذية.')],
      symptoms: [bt('No symptoms — generally benign.', 'لا أعراض — حميد عادة.')],
      advice: [bt('No intervention needed for isolated low creatinine.', 'لا حاجة لتدخل عند انخفاض الكرياتينين المنفرد.')],
    },
    keywords: ['creatinine', 'كرياتينين', 'cr'],
  },
  {
    id: 'organs_bun',
    category: 'organs',
    name: bt('Blood Urea Nitrogen (BUN)', 'نيتروجين اليوريا بالدم (BUN)'),
    description: bt(
      'Urea product from protein metabolism — kidney filtration and hydration marker.',
      'ناتج استقلاب البروتين — مؤشر ترشيح الكلى والترطيب.'
    ),
    range: {
      si: { min: 2.5, max: 7.1, unit: 'mmol/L', decimals: 1 },
      us: { min: 7, max: 20, unit: 'mg/dL', decimals: 0 },
      siToUs: 2.801,
      usToSi: 0.357,
    },
    high: {
      causes: [
        bt('High protein intake, dehydration, kidney stress or catabolism.', 'البروتين المرتفع أو الجفاف أو ضغط الكلى أو الهدم.'),
      ],
      symptoms: [
        bt('None specific — check BUN/Creatinine ratio for the cause.', 'لا أعراض محددة — افحص نسبة BUN/Creatinine لمعرفة السبب.'),
      ],
      advice: [
        bt('Hydrate and adjust protein timing if ratio suggests dehydration.', 'رطّب واضبط توقيت البروتين إن أشارت النسبة لجفاف.'),
      ],
    },
    low: {
      causes: [bt('Low protein intake, liver insufficiency or overhydration.', 'نقص البروتين أو قصور كبدي أو إفراط ترطيب.')],
      symptoms: [bt('None specific.', 'لا أعراض محددة.')],
      advice: [bt('Ensure adequate protein; interpret with creatinine.', 'تأكد من كفاية البروتين؛ فسّره مع الكرياتينين.')],
    },
    keywords: ['bun', 'urea', 'يوريا'],
  },
  {
    id: 'organs_egfr',
    category: 'organs',
    name: bt('eGFR', 'eGFR'),
    description: bt(
      'Estimated glomerular filtration rate — the true functional kidney measure.',
      'معدل الترشيح الكبيبي المقدر — المقياس الوظيفي الحقيقي للكلى.'
    ),
    range: {
      si: { min: 90, max: 140, unit: 'mL/min/1.73m²', decimals: 0 },
      us: { min: 90, max: 140, unit: 'mL/min/1.73m²', decimals: 0 },
      siToUs: 1,
      usToSi: 1,
    },
    high: {
      causes: [
        bt('Hyperfiltration states (high protein, creatine, early diabetes).', 'حالات فرط الترشيح (بروتين مرتفع، كرياتين، بداية سكري).'),
      ],
      symptoms: [bt('No symptoms — high eGFR is usually benign.', 'لا أعراض — عادة حميد.')],
      advice: [bt('No concern unless accompanied by proteinuria.', 'لا قلق ما لم يترافق مع بروتين في البول.')],
    },
    low: {
      causes: [
        bt('Age-related decline, dehydration, kidney disease or nephrotoxic exposure.', 'الانحدار مع العمر أو الجفاف أو مرض الكلى أو التعرض للسموم الكلوية.'),
      ],
      symptoms: [
        bt('Fatigue, edema and rising creatinine at significant impairment.', 'إرهاق ووذمة وارتفاع كرياتينين عند ضعف مهم.'),
      ],
      advice: [
        bt('Recheck with hydration; if < 60 repeatedly, full nephrology work-up needed.', 'أعد الفحص بعد الترطيب؛ إن انخفض < 60 مرتين استكمل فحوصاً كلوية كاملة.'),
        bt('Limit NSAIDs and ensure nephroprotective hydration during AAS use.', 'قلل مضادات الالتهاب ورطّب باستمرار أثناء استخدام الستيرويدات.'),
      ],
    },
    keywords: ['egfr', 'gfr', 'ترشيح كبيبي'],
  },
  {
    id: 'organs_cystatin_c',
    category: 'organs',
    name: bt('Cystatin C', 'سيستاتين C'),
    description: bt(
      'Muscle-independent kidney marker — more accurate eGFR in muscular athletes.',
      'مؤشر كلوي مستقل عن العضلات — أكثر دقة للرياضيين ذوي الكتلة العضلية.'
    ),
    range: {
      si: { min: 0.6, max: 1.0, unit: 'mg/L', decimals: 2 },
      us: { min: 0.6, max: 1.0, unit: 'mg/L', decimals: 2 },
      siToUs: 1,
      usToSi: 1,
    },
    high: {
      causes: [bt('Kidney impairment, inflammation or corticosteroid use.', 'ضعف كلوي أو التهاب أو استخدام كورتيكوستيرويدات.')],
      symptoms: [bt('Often silent.', 'غالباً صامت.')],
      advice: [bt('Use with creatinine to refine true eGFR in muscular subjects.', 'استخدمه مع الكرياتينين لضبط eGFR الحقيقي لدى ذوي العضلات.')],
    },
    low: {
      causes: [bt('Not clinically relevant in most cases.', 'غير مهم سريرياً غالباً.')],
      symptoms: [bt('None.', 'لا شيء.')],
      advice: [bt('No action required.', 'لا حاجة لإجراء.')],
    },
    keywords: ['cystatin c', 'سيستاتين'],
  },
  {
    id: 'organs_uric_acid',
    category: 'organs',
    name: bt('Uric Acid', 'حمض اليوريك'),
    description: bt(
      'Purine breakdown product — gout and kidney stone risk marker.',
      'ناتج تكسير البيورين — مؤشر خطر النقرس وحصى الكلى.'
    ),
    range: {
      si: { min: 208, max: 428, unit: 'µmol/L', decimals: 0 },
      us: { min: 3.5, max: 7.2, unit: 'mg/dL', decimals: 1 },
      siToUs: 0.0168,
      usToSi: 59.48,
    },
    high: {
      causes: [
        bt('High purine foods (red meat, organ meats), alcohol, dehydration.', 'الأغذية الغنية بالبيورين (اللحوم الحمراء والأحشاء) والكحول والجفاف.'),
        bt('Kidney under-filtration or AAS-induced metabolic shifts.', 'قصور ترشيح كلوي أو تحولات استقلابية ناتجة عن الستيرويدات.'),
      ],
      symptoms: [
        bt('Gout flares — sudden joint pain (big toe), kidney stones.', 'نوبات نقرس — ألم مفصلي مفاجئ (إصبع القدم الكبير) وحصى كلوية.'),
      ],
      advice: [
        bt('Hydrate heavily, reduce purines and alcohol; consider allopurinol only under medical care.', 'رطّب بكثرة وقلل البيورين والكحول؛ لا تستخدم الوبيورينول إلا بإشراف طبي.'),
        bt('Cherries and adequate vitamin C may modestly lower uric acid.', 'قد يخفض الكرز وفيتامين C حمض اليوريك بشكل معتدل.'),
      ],
    },
    low: {
      causes: [bt('Rare — sometimes from high-dose vitamin C or kidney loss.', 'نادر — أحياناً من جرعات عالية من فيتامين C أو فقدان كلوي.')],
      symptoms: [bt('No specific symptoms.', 'لا أعراض محددة.')],
      advice: [bt('Rarely actionable.', 'نادراً ما يستدعي تدخلاً.')],
    },
    keywords: ['uric acid', 'يوريك', 'نقرس'],
  },
  {
    id: 'organs_bun_ratio',
    category: 'organs',
    name: bt('BUN/Creatinine Ratio', 'نسبة BUN/Creatinine'),
    description: bt(
      'Hydration and kidney perfusion discriminator.',
      'أداة تمييز الترطيب وتدفق الدم الكلوي.'
    ),
    range: {
      si: { min: 10, max: 20, unit: 'ratio', decimals: 0 },
      us: { min: 10, max: 20, unit: 'ratio', decimals: 0 },
      siToUs: 1,
      usToSi: 1,
    },
    high: {
      causes: [
        bt('Dehydration, high protein, or reduced kidney blood flow.', 'جفاف أو بروتين مرتفع أو انخفاض تدفق الدم للكلى.'),
      ],
      symptoms: [bt('None specific — a red flag for hydration/perfusion.', 'لا أعراض محددة — علم تحذير للترطيب والتروية.')],
      advice: [bt('Rehydrate and retest; persistent elevation needs medical review.', 'رطّب وأعد الفحص؛ الارتفاع المستمر يحتاج مراجعة طبية.')],
    },
    low: {
      causes: [bt('Liver dysfunction, overhydration or low protein.', 'خلل كبدي أو إفراط ترطيب أو نقص بروتين.')],
      symptoms: [bt('None specific.', 'لا أعراض محددة.')],
      advice: [bt('Interpret with liver panel.', 'فسّره مع ملف الكبد.')],
    },
    keywords: ['bun ratio', 'creatinine ratio'],
  },
  {
    id: 'organs_glucose',
    category: 'organs',
    name: bt('Fasting Blood Glucose', 'سكر الدم الصائم'),
    description: bt(
      'Blood sugar after an 8-hour fast — metabolic and diabetes screening.',
      'سكر الدم بعد صيام 8 ساعات — فحص الاستقلاب والسكري.'
    ),
    range: {
      si: { min: 3.9, max: 5.5, unit: 'mmol/L', decimals: 1 },
      us: { min: 70, max: 99, unit: 'mg/dL', decimals: 0 },
      siToUs: 18.02,
      usToSi: 0.0555,
    },
    high: {
      causes: [
        bt('Insulin resistance, growth hormone use, or prediabetes.', 'مقاومة الأنسولين أو استخدام هرمون النمو أو ما قبل السكري.'),
      ],
      symptoms: [
        bt('Excess thirst, fatigue and frequent urination at higher levels.', 'عطش زائد وإرهاق وكثرة تبول عند المستويات الأعلى.'),
      ],
      advice: [
        bt('Pair with HbA1c and fasting insulin to compute HOMA-IR.', 'اقرنه مع HbA1c والأنسولين الصائم لحساب HOMA-IR.'),
        bt('Reduce simple carbs, add resistance training and re-test fasting.', 'قلل الكربوهيدرات البسيطة وأضف تدريب المقاومة وأعد الفحص.'),
        bt('Berberine (500–1500 mg) and adequate magnesium may support insulin sensitivity.', 'قد يدعم البربرين (500–1500 ملغ) والمغنيسيوم الكافي حساسية الأنسولين.'),
      ],
    },
    low: {
      causes: [
        bt('Fasting, low carbohydrate intake, or excessive insulin sensitivity.', 'الصيام أو انخفاض الكربوهيدرات أو حساسية أنسولين مفرطة.'),
      ],
      symptoms: [
        bt('Shakiness, irritability and energy crashes (hypoglycemia).', 'ارتعاش وعصبية وهبوط طاقة (نقص سكر الدم).'),
      ],
      advice: [
        bt('Balance carb timing around training; avoid long fasts before sessions.', 'وازن توقيت الكربوهيدرات حول التدريب وتجنب الصيام الطويل قبل التمرين.'),
      ],
    },
    keywords: ['glucose', 'sugar', 'سكر', 'صائم'],
  },
  {
    id: 'organs_hba1c',
    category: 'organs',
    name: bt('HbA1c', 'HbA1c'),
    description: bt(
      '3-month average blood sugar — the gold-standard metabolic marker.',
      'متوسط سكر الدم لثلاثة أشهر — المؤشر الذهبي للاستقلاب.'
    ),
    range: {
      si: { min: 4.0, max: 5.6, unit: '%', decimals: 1 },
      us: { min: 4.0, max: 5.6, unit: '%', decimals: 1 },
      siToUs: 1,
      usToSi: 1,
    },
    high: {
      causes: [
        bt('Chronic high carb intake, insulin resistance, GH/IGF elevation.', 'الإفراط المزمن في الكربوهيدرات أو مقاومة الأنسولين أو ارتفاع GH/IGF.'),
      ],
      symptoms: [
        bt('Often silent; long-term damage to vessels and organs.', 'صامت غالباً؛ ضرر طويل الأمد للأوعية والأعضاء.'),
      ],
      advice: [
        bt('Reduce refined carbs, increase fiber and resistance training frequency.', 'قلل الكربوهيدرات المكررة وزد الألياف وتكرار تدريب المقاومة.'),
        bt('Re-test every 3 months; target < 5.6% even on bulks.', 'أعد الفحص كل 3 أشهر؛ استهدف أقل من 5.6% حتى أثناء التضخيم.'),
      ],
    },
    low: {
      causes: [bt('Frequent hypoglycemia, anemia or recent blood loss.', 'نقص سكر متكرر أو فقر دم أو فقدان دم حديث.')],
      symptoms: [bt('Energy crashes and dizziness.', 'هبوط طاقة ودوخة.')],
      advice: [bt('Ensure adequate carbs and rule out anemia.', 'تأكد من كفاية الكربوهيدرات واستبعد فقر الدم.')],
    },
    keywords: ['hba1c', 'a1c', 'سكر تراكمي'],
  },
  {
    id: 'organs_insulin',
    category: 'organs',
    name: bt('Fasting Insulin', 'الأنسولين الصائم'),
    description: bt(
      'Baseline insulin level — the earliest marker of insulin resistance.',
      'مستوى الأنسولين الأساسي — أول مؤشر لمقاومة الأنسولين.'
    ),
    range: {
      si: { min: 15.6, max: 149.4, unit: 'pmol/L', decimals: 0 },
      us: { min: 2.6, max: 24.9, unit: 'µIU/mL', decimals: 1 },
      siToUs: 0.1667,
      usToSi: 6.0,
    },
    high: {
      causes: [
        bt('Insulin resistance, obesity, sedentary lifestyle, GH use.', 'مقاومة الأنسولين أو السمنة أو قلة الحركة أو استخدام هرمون النمو.'),
      ],
      symptoms: [
        bt('Weight gain, cravings and energy dips after meals.', 'زيادة وزن ورغبات غذائية وهبوط طاقة بعد الوجبات.'),
      ],
      advice: [
        bt('Combine with fasting glucose to compute HOMA-IR (< 2.0 ideal).', 'ادمجه مع سكر الصائم لحساب HOMA-IR (المثالي < 2.0).'),
        bt('Add metformin or berberine only under medical supervision.', 'لا تستخدم الميتفورمين أو البربرين إلا بإشراف طبي.'),
      ],
    },
    low: {
      causes: [bt('Fasting, low-carb diets or starvation states.', 'الصيام أو الأنظمة منخفضة الكربوهيدرات أو حالات الحرمان.')],
      symptoms: [bt('Low energy and hypoglycemic symptoms.', 'طاقة منخفضة وأعراض نقص سكر.')],
      advice: [bt('Generally favorable; ensure stable carb intake.', 'مؤشر جيد عموماً؛ تأكد من استقرار الكربوهيدرات.')],
    },
    keywords: ['insulin', 'أنسولين', 'fasting insulin'],
  },
  {
    id: 'organs_homa_ir',
    category: 'organs',
    name: bt('HOMA-IR', 'HOMA-IR'),
    description: bt(
      'Insulin resistance index calculated from fasting glucose and insulin.',
      'مؤشر مقاومة الأنسولين المحسوب من سكر وأنسولين الصيام.'
    ),
    range: {
      si: { min: 0.5, max: 2.0, unit: 'index', decimals: 1 },
      us: { min: 0.5, max: 2.0, unit: 'index', decimals: 1 },
      siToUs: 1,
      usToSi: 1,
    },
    high: {
      causes: [
        bt('Insulin resistance from diet, obesity or metabolic syndrome.', 'مقاومة الأنسولين من الحمية أو السمنة أو متلازمة الأيض.'),
      ],
      symptoms: [
        bt('Fatigue, cravings, and cardiovascular risk accumulation.', 'إرهاق ورغبات غذائية وتراكم خطر قلبي وعائي.'),
      ],
      advice: [
        bt('Lower HOMA-IR by improving body composition and carb control.', 'اخفض المؤشر بتحسين تكوين الجسم وضبط الكربوهيدرات.'),
        bt('Fasted training and post-workout carb timing can improve sensitivity.', 'التدريب صائماً وتوقيت الكربوهيدرات بعد التمرين يحسنان الحساسية.'),
      ],
    },
    low: {
      causes: [bt('High insulin sensitivity — usually a favorable state.', 'حساسية أنسولين عالية — حالة جيدة عادة.')],
      symptoms: [bt('None.', 'لا شيء.')],
      advice: [bt('Maintain the lifestyle that achieved it.', 'حافظ على نمط الحياة الذي حققه.')],
    },
    keywords: ['homa', 'insulin resistance', 'مقاومة أنسولين'],
  },
];

/* ═══════════════════════════ 3. CARDIOVASCULAR & HEMATOLOGY ═══════════════════════════ */
const cardiovascular: LabTestData[] = [
  {
    id: 'cardio_rbc',
    category: 'cardiovascular',
    name: bt('Red Blood Cells (RBC)', 'كريات الدم الحمراء (RBC)'),
    description: bt(
      'Oxygen-carrying red cells — transport and capacity marker.',
      'الخلايا الحمراء الحاملة للأكسجين — مؤشر النقل والسعة.'
    ),
    range: {
      si: { min: 4.5, max: 5.9, unit: '×10¹²/L', decimals: 2 },
      us: { min: 4.5, max: 5.9, unit: 'M/µL', decimals: 2 },
      siToUs: 1,
      usToSi: 1,
    },
    high: {
      causes: [
        bt('Erythropoietin stimulation from androgens — common on cycle.', 'تحفيز إرثروبويتين من الأندروجينات — شائع أثناء الكورس.'),
        bt('Dehydration and blood concentration.', 'الجفاف وتركّز الدم.'),
      ],
      symptoms: [
        bt('Blood thickening — elevated hematocrit and cardiovascular strain.', 'لزوجة دم وارتفاع هيماتوكريت وضغط على القلب.'),
        bt('Headaches, flushing and dizziness at extreme levels.', 'صداع واحمرار ودوخة عند المستويات القصوى.'),
      ],
      advice: [
        bt('Monitor hematocrit; if > 54%, donate blood or reduce androgen dose.', 'راقب الهيماتوكريت؛ إن تجاوز 54% تبرع بالدم أو خفف الجرعة.'),
        bt('Hydrate consistently and consider daily low-dose aspirin only under medical advice.', 'رطّب باستمرار وفكر في الأسبرين منخفض الجرعة بإشراف طبي فقط.'),
      ],
    },
    low: {
      causes: [
        bt('Iron/B12/folate deficiency, blood loss, or over-dilution.', 'نقص الحديد أو B12 أو الفولات أو فقدان الدم أو تخفيف الدم.'),
      ],
      symptoms: [
        bt('Fatigue, pale skin and reduced aerobic performance.', 'إرهاق وشحوب وانخفاض الأداء الهوائي.'),
      ],
      advice: [
        bt('Check ferritin, B12 and folate; correct the underlying deficiency.', 'افحص الفيريتين وB12 والفولات؛ عالج النقص الأساسي.'),
      ],
    },
    keywords: ['rbc', 'red blood cells', 'كريات حمراء'],
  },
  {
    id: 'cardio_wbc',
    category: 'cardiovascular',
    name: bt('White Blood Cells (WBC)', 'كريات الدم البيضاء (WBC)'),
    description: bt(
      'Immune cells defending against infection and inflammation.',
      'الخلايا المناعية الدافعة ضد العدوى والالتهاب.'
    ),
    range: {
      si: { min: 4.0, max: 11.0, unit: '×10⁹/L', decimals: 1 },
      us: { min: 4.0, max: 11.0, unit: '×10³/µL', decimals: 1 },
      siToUs: 1,
      usToSi: 1,
    },
    high: {
      causes: [
        bt('Infection, inflammation, stress or intense training load.', 'عدوى أو التهاب أو توتر أو حمل تدريبي شديد.'),
        bt('Rarely — leukemoid reactions or marrow disorders.', 'نادراً — تفاعلات نقوية أو اضطرابات نخاعية.'),
      ],
      symptoms: [
        bt('Usually none specific — reflects an ongoing immune response.', 'عادة لا أعراض محددة — يعكس استجابة مناعية جارية.'),
      ],
      advice: [
        bt('Correlate with symptoms; retest after rest if training-related.', 'اربطه بالأعراض؛ أعد الفحص بعد راحة إن كان ناتجاً عن التدريب.'),
      ],
    },
    low: {
      causes: [
        bt('Viral illness, intense overtraining, or certain medications.', 'مرض فيروسي أو إفراط تدريبي أو بعض الأدوية.'),
      ],
      symptoms: [
        bt('Increased susceptibility to infections.', 'زيادة القابلية للعدوى.'),
      ],
      advice: [
        bt('Prioritize recovery and sleep; seek care if persistently low with infections.', 'أولِ التعافي والنوم؛ اطلب الرعاية إن استمر الانخفاض مع العدوى.'),
      ],
    },
    keywords: ['wbc', 'white blood cells', 'كريات بيضاء'],
  },
  {
    id: 'cardio_hemoglobin',
    category: 'cardiovascular',
    name: bt('Hemoglobin', 'الهيموجلوبين'),
    description: bt(
      'Oxygen-binding protein inside red cells.',
      'البروتين المرتبط بالأكسجين داخل الخلايا الحمراء.'
    ),
    range: {
      si: { min: 135, max: 175, unit: 'g/L', decimals: 0 },
      us: { min: 13.5, max: 17.5, unit: 'g/dL', decimals: 1 },
      siToUs: 0.1,
      usToSi: 10,
    },
    high: {
      causes: [
        bt('Androgen-driven erythropoiesis (Erythropoietin rise).', 'تكوّن كريات محفز أندروجيني (ارتفاع الإرثروبويتين).'),
        bt('Dehydration or high-altitude adaptation.', 'الجفاف أو التأقلم مع الارتفاعات.'),
      ],
      symptoms: [
        bt('Blood viscosity rise — headache, flushing and clot risk.', 'ارتفاع لزوجة الدم — صداع واحمرار وخطر تخثر.'),
      ],
      advice: [
        bt('Maintain hematocrit < 54% via hydration and, if needed, donation.', 'أبقِ الهيماتوكريت أقل من 54% بالترطيب، والتبرع عند الحاجة.'),
      ],
    },
    low: {
      causes: [bt('Iron deficiency, blood loss, or B12/folate deficiency.', 'نقص الحديد أو فقدان الدم أو نقص B12/الفولات.')],
      symptoms: [bt('Fatigue, shortness of breath on exertion.', 'إرهاق وضيق تنفس عند الجهد.')],
      advice: [bt('Full iron panel (ferritin, TIBC) and supplementation if deficient.', 'ملف حديد كامل (فيريتين، TIBC) ومكملات عند النقص.')],
    },
    keywords: ['hemoglobin', 'هيموجلوبين', 'hb'],
  },
  {
    id: 'cardio_hematocrit',
    category: 'cardiovascular',
    name: bt('Hematocrit', 'الهيماتوكريت'),
    description: bt(
      'Percentage of blood volume made of red cells — viscosity marker.',
      'نسبة حجم الدم المكونة من الخلايا الحمراء — مؤشر اللزوجة.'
    ),
    range: {
      si: { min: 38.8, max: 50.0, unit: '%', decimals: 1 },
      us: { min: 38.8, max: 50.0, unit: '%', decimals: 1 },
      siToUs: 1,
      usToSi: 1,
    },
    high: {
      causes: [
        bt('AAS-induced erythrocytosis — the #1 cardio red flag on cycle.', 'كثرة الحمر الناتجة عن الستيرويدات — أخطر مؤشر قلبي أثناء الكورس.'),
        bt('Dehydration masking as true polycythemia.', 'جفاف يُخطئ ككثرة حمر حقيقية.'),
      ],
      symptoms: [
        bt('Headache, dizziness, ruddy complexion and thromboembolic risk.', 'صداع ودوخة واحمرار وخطر جلطات.'),
      ],
      advice: [
        bt('Hematocrit > 54%: stop or reduce AAS, hydrate, and consider phlebotomy.', 'هيماتوكريت > 54%: أوقف أو خفف الستيرويدات ورطّب وفكر في سحب الدم.'),
        bt('Aspirin 81 mg may be indicated under medical supervision.', 'قد يوصى بالأسبرين 81 ملغ بإشراف طبي.'),
      ],
    },
    low: {
      causes: [bt('Anemia, blood loss or overhydration.', 'فقر دم أو فقدان دم أو إفراط ترطيب.')],
      symptoms: [bt('Fatigue and reduced endurance.', 'إرهاق وانخفاض التحمل.')],
      advice: [bt('Investigate iron/B12 status.', 'استكشف حالة الحديد وB12.')],
    },
    keywords: ['hematocrit', 'هيماتوكريت', 'hct'],
  },
  {
    id: 'cardio_platelets',
    category: 'cardiovascular',
    name: bt('Platelets', 'الصفائح الدموية'),
    description: bt(
      'Clotting cells — balance between bleeding and thrombosis risk.',
      'خلايا التخثر — توازن بين خطر النزف والتخثر.'
    ),
    range: {
      si: { min: 150, max: 400, unit: '×10⁹/L', decimals: 0 },
      us: { min: 150, max: 400, unit: '×10³/µL', decimals: 0 },
      siToUs: 1,
      usToSi: 1,
    },
    high: {
      causes: [
        bt('Inflammation, iron deficiency or reactive thrombocytosis.', 'التهاب أو نقص حديد أو كثرة صفائح تفاعلية.'),
      ],
      symptoms: [bt('Elevated clotting tendency.', 'ميل متزايد للتخثر.')],
      advice: [bt('Manage inflammation and iron status; retest to confirm.', 'عالج الالتهاب وحالة الحديد؛ أعد الفحص للتأكيد.')],
    },
    low: {
      causes: [
        bt('Recent viral illness, or (rarely) marrow suppression from orals.', 'مرض فيروسي حديث أو (نادراً) تثبيط نقوي من الفمويات.'),
      ],
      symptoms: [bt('Easy bruising and bleeding at significant lows.', 'سهولة الكدمات والنزف عند الانخفاض الكبير.')],
      advice: [bt('Avoid blood thinners if low; repeat test — transient lows are common post-viral.', 'تجنب مميعات الدم عند الانخفاض؛ أعد الفحص — الانخفاض العابر شائع بعد الفيروسات.')],
    },
    keywords: ['platelets', 'صفائح', 'plt'],
  },
  {
    id: 'cardio_mcv',
    category: 'cardiovascular',
    name: bt('MCV', 'MCV'),
    description: bt(
      'Mean corpuscular volume — red cell size; anemia differentiation.',
      'متوسط حجم الكرية — حجم الخلايا الحمراء؛ تمييز أنواع فقر الدم.'
    ),
    range: {
      si: { min: 80, max: 100, unit: 'fL', decimals: 0 },
      us: { min: 80, max: 100, unit: 'fL', decimals: 0 },
      siToUs: 1,
      usToSi: 1,
    },
    high: {
      causes: [bt('B12/folate deficiency or alcohol.', 'نقص B12 أو الفولات أو الكحول.')],
      symptoms: [bt('Fatigue with large red cells.', 'إرهاق مع خلايا حمراء كبيرة.')],
      advice: [bt('Check B12 and folate; supplement and retest.', 'افحص B12 والفولات؛ عوّض وأعد الفحص.')],
    },
    low: {
      causes: [bt('Iron deficiency or thalassemia trait.', 'نقص الحديد أو صفة الثلاسيميا.')],
      symptoms: [bt('Fatigue with small red cells.', 'إرهاق مع خلايا صغيرة.')],
      advice: [bt('Iron panel; genetic testing if refractory.', 'ملف حديد؛ واختبار جيني إذا لم يستجب.')],
    },
    keywords: ['mcv', 'mean corpuscular volume'],
  },
  {
    id: 'cardio_lipid_total',
    category: 'cardiovascular',
    name: bt('Total Cholesterol', 'الكوليسترول الكلي'),
    description: bt(
      'Sum of all blood cholesterol — a starting point, not the whole story.',
      'مجموع كوليسترول الدم — نقطة بداية وليس القصة الكاملة.'
    ),
    range: {
      si: { min: 3.2, max: 5.2, unit: 'mmol/L', decimals: 2 },
      us: { min: 125, max: 200, unit: 'mg/dL', decimals: 0 },
      siToUs: 38.67,
      usToSi: 0.02586,
    },
    high: {
      causes: [
        bt('High saturated fat intake, genetics or AAS-driven lipid shifts.', 'الدهون المشبعة أو الوراثة أو تحولات الستيرويدات في الدهون.'),
      ],
      symptoms: [bt('No symptoms — silent cardiovascular risk.', 'لا أعراض — خطر قلبي صامت.')],
      advice: [
        bt('Assess the full lipid panel and ApoB before judging risk.', 'قيّم الملف الكامل وApoB قبل الحكم على الخطر.'),
        bt('Increase omega-3, soluble fiber and reduce trans fats.', 'زد أوميغا-3 والألياف الذائبة وقلل الدهون المهدرجة.'),
      ],
    },
    low: {
      causes: [bt('Very low cholesterol can reflect malnutrition or hyperthyroidism.', 'قد يعكس سوء التغذية أو فرط الدرقية.')],
      symptoms: [bt('None specific.', 'لا أعراض محددة.')],
      advice: [bt('Usually favorable; no action unless extreme.', 'جيد عادة؛ لا تدخل إلا عند الانخفاض الشديد.')],
    },
    keywords: ['cholesterol', 'كوليسترول', 'total cholesterol'],
  },
  {
    id: 'cardio_ldl',
    category: 'cardiovascular',
    name: bt('LDL Cholesterol', 'الكوليسترول الضار (LDL)'),
    description: bt(
      'Atherogenic lipoprotein — main driver of plaque formation.',
      'البروتين الدهني المسبب لتصلب الشرايين — المحرك الرئيسي للويحات.'
    ),
    range: {
      si: { min: 1.8, max: 2.6, unit: 'mmol/L', decimals: 2 },
      us: { min: 70, max: 100, unit: 'mg/dL', decimals: 0 },
      siToUs: 38.67,
      usToSi: 0.02586,
    },
    high: {
      causes: [
        bt('Oral AAS (Winstrol, Anadrol), saturated fats, genetics.', 'الستيرويدات الفموية (وينسترول، أنادرول) والدهون المشبعة والوراثة.'),
      ],
      symptoms: [
        bt('Silent accumulation of arterial plaque.', 'تراكم صامت للويحات الشريانية.'),
      ],
      advice: [
        bt('Target LDL < 100 mg/dL (2.6 mmol/L); < 70 in high risk.', 'استهدف LDL أقل من 100 ملغ/دل (2.6) وأقل من 70 في الخطورة العالية.'),
        bt('Red yeast rice, ezetimibe or statins only under medical supervision.', 'خميرة الأرز الحمراء أو إيزيتمايب أو الستاتينات بإشراف طبي فقط.'),
      ],
    },
    low: {
      causes: [bt('Rare — genetics or aggressive treatment.', 'نادر — وراثة أو علاج قوي.')],
      symptoms: [bt('None.', 'لا شيء.')],
      advice: [bt('No concern at mildly low values.', 'لا قلق عند الانخفاض الخفيف.')],
    },
    keywords: ['ldl', 'bad cholesterol', 'كوليسترول ضار'],
  },
  {
    id: 'cardio_hdl',
    category: 'cardiovascular',
    name: bt('HDL Cholesterol', 'الكوليسترول النافع (HDL)'),
    description: bt(
      'Protective cholesterol that removes plaque from arteries.',
      'الكوليسترول الوقائي الذي يزيل اللويحات من الشرايين.'
    ),
    range: {
      si: { min: 1.0, max: 1.6, unit: 'mmol/L', decimals: 2 },
      us: { min: 40, max: 60, unit: 'mg/dL', decimals: 0 },
      siToUs: 38.67,
      usToSi: 0.02586,
    },
    high: {
      causes: [bt('Genetic hyperalpha, high omega-3 or vigorous training.', 'وراثة أو أوميغا-3 عالية أو تدريب عنيف.')],
      symptoms: [bt('None — generally protective.', 'لا شيء — وقائي عادة.')],
      advice: [bt('Maintain the habits that raised it.', 'حافظ على العادات التي رفعته.')],
    },
    low: {
      causes: [
        bt('Oral AAS, smoking, obesity and sedentary life.', 'الستيرويدات الفموية والتدخين والسمنة وقلة الحركة.'),
      ],
      symptoms: [bt('Reduced vascular protection.', 'انخفاض الحماية الوعائية.')],
      advice: [
        bt('Add aerobic training and omega-3; quit smoking.', 'أضف التدريب الهوائي والأوميغا-3 وأقلع عن التدخين.'),
        bt('Niacin (inositol hexanicotinate) may help — under guidance.', 'قد يساعد النياسين (تحت إشراف).'),
      ],
    },
    keywords: ['hdl', 'good cholesterol', 'كوليسترول نافع'],
  },
  {
    id: 'cardio_triglycerides',
    category: 'cardiovascular',
    name: bt('Triglycerides', 'الدهون الثلاثية'),
    description: bt(
      'Circulating fats — a sensitive marker of carb intake and insulin health.',
      'الدهون المنتشرة — مؤشر حساس للكربوهيدرات وصحة الأنسولين.'
    ),
    range: {
      si: { min: 0.5, max: 1.7, unit: 'mmol/L', decimals: 2 },
      us: { min: 45, max: 150, unit: 'mg/dL', decimals: 0 },
      siToUs: 88.57,
      usToSi: 0.01129,
    },
    high: {
      causes: [
        bt('Excess carbs/calories, alcohol, insulin resistance.', 'الإفراط في الكربوهيدرات أو السعرات أو الكحول أو مقاومة الأنسولين.'),
      ],
      symptoms: [bt('None — silent risk; very high levels risk pancreatitis.', 'لا أعراض — خطر صامت؛ المستويات المرتفعة جداً تخاطر بالتهاب البنكرياس.')],
      advice: [
        bt('Reduce refined carbs and alcohol; add omega-3 EPA/DHA 2–4 g.', 'قلل الكربوهيدرات المكررة والكحول؛ أضف أوميغا-3 EPA/DHA بجرعة 2–4 غرام.'),
      ],
    },
    low: {
      causes: [bt('Very low-carb diets or overtraining.', 'أنظمة منخفضة الكربوهيدرات جداً أو إفراط تدريبي.')],
      symptoms: [bt('Usually favorable.', 'جيد عادة.')],
      advice: [bt('No concern.', 'لا قلق.')],
    },
    keywords: ['triglycerides', 'دهون ثلاثية'],
  },
  {
    id: 'cardio_apob',
    category: 'cardiovascular',
    name: bt('ApoB', 'ApoB'),
    description: bt(
      'Apob counts every atherogenic particle — the best single lipid marker.',
      'يحصي كل جزيء مسبب لتصلب الشرايين — أفضل مؤشر دهني منفرد.'
    ),
    range: {
      si: { min: 0.6, max: 0.9, unit: 'g/L', decimals: 2 },
      us: { min: 60, max: 90, unit: 'mg/dL', decimals: 0 },
      siToUs: 0.01,
      usToSi: 100,
    },
    high: {
      causes: [
        bt('AAS use, especially orals; saturated fats; genetics.', 'الستيرويدات خاصة الفموية والدهون المشبعة والوراثة.'),
      ],
      symptoms: [bt('Silent atherogenic particle load.', 'حمل صامت من الجزيئات المسببة للتصلب.')],
      advice: [
        bt('ApoB < 90 mg/dL general; < 70 mg/dL for higher risk — the most actionable target.', 'ApoB أقل من 90 للعموم وأقل من 70 للخطورة الأعلى — الهدف الأكثر فعالية.'),
      ],
    },
    low: {
      causes: [bt('Genetics or aggressive lipid therapy.', 'وراثة أو علاج دهني قوي.')],
      symptoms: [bt('None.', 'لا شيء.')],
      advice: [bt('No concern.', 'لا قلق.')],
    },
    keywords: ['apob', 'apob100'],
  },
  {
    id: 'cardio_lpa',
    category: 'cardiovascular',
    name: bt('Lipoprotein(a)', 'البروتين الدهني (a)'),
    description: bt(
      'Genetically-determined Lp(a) — an independent cardiovascular risk marker.',
      'Lp(a) المحدد وراثياً — مؤشر خطر قلبي مستقل.'
    ),
    range: {
      si: { min: 0, max: 75, unit: 'nmol/L', decimals: 0 },
      us: { min: 0, max: 30, unit: 'mg/dL', decimals: 0 },
      siToUs: 0.4,
      usToSi: 2.5,
    },
    high: {
      causes: [bt('Genetics — lifestyle has minimal effect on Lp(a).', 'الوراثة — لنمط الحياة تأثير ضئيل على Lp(a).')],
      symptoms: [bt('Silent elevation of clotting and plaque risk.', 'ارتفاع صامت لخطر التجلط واللويحات.')],
      advice: [
        bt('Measure once in life; if high, control all other risk factors aggressively.', 'قِسه مرة في العمر؛ إن ارتفع فسيطر بصرامة على كل عوامل الخطر الأخرى.'),
        bt('Niacin may modestly lower it; PCSK9 inhibitors are the modern medical option.', 'قد يخفضه النياسين قليلاً؛ مثبطات PCSK9 هي الخيار الطبي الحديث.'),
      ],
    },
    low: {
      causes: [bt('Genetic low value.', 'قيمة وراثية منخفضة.')],
      symptoms: [bt('None — protective.', 'لا شيء — وقائي.')],
      advice: [bt('No action needed.', 'لا حاجة لإجراء.')],
    },
    keywords: ['lpa', 'lipoprotein a'],
  },
  {
    id: 'cardio_hscrp',
    category: 'cardiovascular',
    name: bt('High-Sensitivity CRP (hs-CRP)', 'البروتين المتفاعل الحساس (hs-CRP)'),
    description: bt(
      'Systemic inflammation marker — cardiovascular and recovery sensor.',
      'مؤشر الالتهاب الجهازي — حساس القلب والتعافي.'
    ),
    range: {
      si: { min: 0, max: 3, unit: 'mg/L', decimals: 1 },
      us: { min: 0, max: 3, unit: 'mg/L', decimals: 1 },
      siToUs: 1,
      usToSi: 1,
    },
    high: {
      causes: [
        bt('Recent training, joint stress, hidden infection or metabolic inflammation.', 'تدريب حديث أو ضغط مفاصل أو عدوى خفية أو التهابات استقلابية.'),
        bt('Chronic high values signal systemic risk.', 'القيم المزمنة المرتفعة تشير لخطر جهازي.'),
      ],
      symptoms: [bt('Silent — but links to fatigue and slow recovery.', 'صامت — لكنه يرتبط بالإرهاق وبطء التعافي.')],
      advice: [
        bt('Re-test after 3–5 rest days to exclude training noise.', 'أعد الفحص بعد 3–5 أيام راحة لاستبعاد تشويش التدريب.'),
        bt('Target < 1 mg/L via omega-3, weight loss and sleep optimization.', 'استهدف أقل من 1 ملغ/لتر عبر الأوميغا-3 وخفض الوزن وتحسين النوم.'),
      ],
    },
    low: {
      causes: [bt('Normal, healthy low-inflammation state.', 'حالة صحية طبيعية منخفضة الالتهاب.')],
      symptoms: [bt('None — favorable.', 'لا شيء — جيد.')],
      advice: [bt('Maintain current habits.', 'حافظ على عاداتك.')],
    },
    keywords: ['crp', 'hs-crp', 'بروتين تفاعلي'],
  },
  {
    id: 'cardio_homocysteine',
    category: 'cardiovascular',
    name: bt('Homocysteine', 'الهوموسيستين'),
    description: bt(
      'Amino acid whose elevation damages vessels — modified by B-vitamins.',
      'حمض أميني ارتفاعه يضر الأوعية — يتعدل بفيتامينات B.'
    ),
    range: {
      si: { min: 4, max: 15, unit: 'µmol/L', decimals: 0 },
      us: { min: 4, max: 15, unit: 'µmol/L', decimals: 0 },
      siToUs: 1,
      usToSi: 1,
    },
    high: {
      causes: [
        bt('B12, folate or B6 deficiency; genetics (MTHFR); poor methylation.', 'نقص B12 أو الفولات أو B6 أو الوراثة (MTHFR) أو ضعف المثيلة.'),
      ],
      symptoms: [bt('Silent vascular and clot risk.', 'خطر وعائي وتخثر صامت.')],
      advice: [
        bt('Supplement methylfolate + B12 + B6 and retest in 8–12 weeks.', 'عوّض ميثيل فولات + B12 + B6 وأعد الفحص خلال 8–12 أسبوعاً.'),
      ],
    },
    low: {
      causes: [bt('Very rare — not clinically relevant.', 'نادر جداً — غير مهم سريرياً.')],
      symptoms: [bt('None.', 'لا شيء.')],
      advice: [bt('No action.', 'لا حاجة لإجراء.')],
    },
    keywords: ['homocysteine', 'هوموسيستين'],
  },
  {
    id: 'cardio_fibrinogen',
    category: 'cardiovascular',
    name: bt('Fibrinogen', 'الفيبرينوجين'),
    description: bt(
      'Clotting protein — high levels increase thrombotic risk.',
      'بروتين التخثر — مستوياته العالية تزيد خطر الجلطات.'
    ),
    range: {
      si: { min: 2.0, max: 4.0, unit: 'g/L', decimals: 1 },
      us: { min: 200, max: 400, unit: 'mg/dL', decimals: 0 },
      siToUs: 0.01,
      usToSi: 100,
    },
    high: {
      causes: [bt('Inflammation, smoking, obesity, and AAS-related thrombotic tendency.', 'التهاب أو تدخين أو سمنة أو ميل تخثري مرتبط بالستيرويدات.')],
      symptoms: [bt('Elevated clot risk — especially with high hematocrit.', 'خطر جلطات مرتفع — خاصة مع ارتفاع الهيماتوكريت.')],
      advice: [bt('Control inflammation and hematocrit; avoid smoking.', 'سيطر على الالتهاب والهيماتوكريت وتجنب التدخين.')],
    },
    low: {
      causes: [bt('Liver disease or bleeding disorders.', 'أمراض كبدية أو اضطرابات نزفية.')],
      symptoms: [bt('Bleeding tendency.', 'ميل للنزف.')],
      advice: [bt('Medical evaluation if bleeding symptoms.', 'تقييم طبي عند أعراض النزف.')],
    },
    keywords: ['fibrinogen', 'فيبرينوجين'],
  },
];

/* ═══════════════════════════ 4. VITAMINS ═══════════════════════════ */
const vitamins: LabTestData[] = [
  {
    id: 'vitamins_d3',
    category: 'vitamins',
    name: bt('Vitamin D3 (25-OH)', 'فيتامين D3 (25-OH)'),
    description: bt(
      'Master hormone for immunity, testosterone support, bone and mood.',
      'الهرمون الرئيسي للمناعة ودعم التستوستيرون والعظام والمزاج.'
    ),
    range: {
      si: { min: 75, max: 250, unit: 'nmol/L', decimals: 0 },
      us: { min: 30, max: 100, unit: 'ng/mL', decimals: 0 },
      siToUs: 0.4006,
      usToSi: 2.496,
    },
    high: {
      causes: [bt('Excessive supplementation (> 10,000 IU/day long-term).', 'الإفراط في المكملات (أكثر من 10,000 وحدة دولية يومياً طويلاً).')],
      symptoms: [bt('Hypercalcemia: nausea, weakness, kidney stones.', 'فرط كالسيوم: غثيان وضعف وحصى كلوية.')],
      advice: [bt('Reduce or stop supplement; re-test in 8 weeks.', 'خفف أو أوقف المكمل؛ أعد الفحص بعد 8 أسابيع.')],
    },
    low: {
      causes: [
        bt('Indoor lifestyle, low sun exposure, dark skin or winter.', 'نمط حياة داخلي وقلة تعرض للشمس وبشرة داكنة أو الشتاء.'),
        bt('Fat malabsorption and low dietary intake.', 'سوء امتصاص الدهون وانخفاض المدخول الغذائي.'),
      ],
      symptoms: [
        bt('Low testosterone, low mood, poor immunity and joint aches.', 'انخفاض التستوستيرون والمزاج وضعف المناعة وآلام مفاصل.'),
        bt('Reduced bone density over time.', 'انخفاض كثافة العظام مع الوقت.'),
      ],
      advice: [
        bt('Supplement 2,000–5,000 IU/day with K2 (100–200 µg) and retest in 12 weeks.', 'عوّض 2,000–5,000 وحدة دولية يومياً مع K2 (100–200 ميكروغرام) وأعد الفحص بعد 12 أسبوعاً.'),
        bt('Get 15–30 min midday sun when possible.', 'تعرض للشمس منتصف النهار 15–30 دقيقة عند الإمكان.'),
      ],
    },
    keywords: ['vitamin d', 'd3', 'فيتامين د', '25-oh'],
  },
  {
    id: 'vitamins_b12',
    category: 'vitamins',
    name: bt('Vitamin B12 (Cobalamin)', 'فيتامين B12 (كوبالامين)'),
    description: bt(
      'Critical for blood formation, nerve function and energy metabolism.',
      'حيوي لتكوين الدم ووظيفة الأعصاب واستقلاب الطاقة.'
    ),
    range: {
      si: { min: 148, max: 664, unit: 'pmol/L', decimals: 0 },
      us: { min: 200, max: 900, unit: 'pg/mL', decimals: 0 },
      siToUs: 1.355,
      usToSi: 0.738,
    },
    high: {
      causes: [bt('Supplementation or liver disease (release of stored B12).', 'المكملات أو أمراض الكبد (إطلاق المخزون).')],
      symptoms: [bt('Usually benign.', 'حميد عادة.')],
      advice: [bt('No action unless extreme with other liver findings.', 'لا تدخل إلا عند الارتفاع الشديد مع علامات كبدية.')],
    },
    low: {
      causes: [
        bt('Vegan/vegetarian diet, poor absorption, or PPI use.', 'النظام النباتي أو سوء الامتصاص أو استخدام مثبطات الحمض.'),
      ],
      symptoms: [
        bt('Fatigue, tingling, cognitive fog and macrocytic anemia.', 'إرهاق وتنميل وضباب ذهني وفقر دم كبير الكريات.'),
      ],
      advice: [
        bt('Supplement methylcobalamin 1,000–2,000 µg/day or injectable under guidance.', 'عوّض ميثيل كوبالامين 1,000–2,000 ميكروغرام يومياً أو حقناً بإشراف.'),
        bt('Pair with folate to complete the methylation cycle.', 'اقرنه بالفولات لإكمال دورة المثيلة.'),
      ],
    },
    keywords: ['b12', 'cobalamin', 'فيتامين b12'],
  },
  {
    id: 'vitamins_folate',
    category: 'vitamins',
    name: bt('Folate (Vitamin B9)', 'الفولات (فيتامين B9)'),
    description: bt(
      'Methylation cofactor for DNA synthesis and red cell production.',
      'عامل مساعد للمثيلة لتخليق الحمض النووي وإنتاج الخلايا الحمراء.'
    ),
    range: {
      si: { min: 6.8, max: 38.5, unit: 'nmol/L', decimals: 1 },
      us: { min: 3, max: 17, unit: 'ng/mL', decimals: 0 },
      siToUs: 0.4413,
      usToSi: 2.266,
    },
    high: {
      causes: [bt('Supplementation or folic acid fortified foods.', 'المكملات أو الأغذية المدعمة بحمض الفوليك.')],
      symptoms: [bt('Usually benign.', 'حميد عادة.')],
      advice: [bt('No action unless masking B12 deficiency is suspected.', 'لا تدخل إلا عند الاشتباه بإخفاء نقص B12.')],
    },
    low: {
      causes: [
        bt('Low vegetable intake, malabsorption or MTHFR genetics.', 'انخفاض الخضروات أو سوء الامتصاص أو وراثة MTHFR.'),
      ],
      symptoms: [
        bt('Fatigue, anemia and elevated homocysteine.', 'إرهاق وفقر دم وارتفاع هوموسيستين.'),
      ],
      advice: [
        bt('Supplement methylfolate 400–800 µg and leafy greens daily.', 'عوّض ميثيل فولات 400–800 ميكروغرام والخضروات الورقية يومياً.'),
      ],
    },
    keywords: ['folate', 'folic acid', 'b9', 'فولات'],
  },
  {
    id: 'vitamins_a',
    category: 'vitamins',
    name: bt('Vitamin A (Retinol)', 'فيتامين A (ريتينول)'),
    description: bt(
      'Retinol — vision, immunity and androgen receptor support.',
      'الريتينول — الرؤية والمناعة ودعم مستقبلات الأندروجين.'
    ),
    range: {
      si: { min: 0.7, max: 2.8, unit: 'µmol/L', decimals: 1 },
      us: { min: 20, max: 80, unit: 'µg/dL', decimals: 0 },
      siToUs: 28.65,
      usToSi: 0.0349,
    },
    high: {
      causes: [bt('Excessive preformed retinol supplementation.', 'الإفراط في مكملات الريتينول الجاهز.')],
      symptoms: [bt('Headache, dry skin, joint pain and liver toxicity (chronic).', 'صداع وجفاف جلد وآلام مفاصل وتسمم كبدي (مزمن).')],
      advice: [bt('Stop retinol supplements; use beta-carotene sources instead.', 'أوقف مكملات الريتينول؛ استخدم مصادر البيتا كاروتين.')],
    },
    low: {
      causes: [bt('Fat malabsorption or inadequate intake.', 'سوء امتصاص الدهون أو نقص المدخول.')],
      symptoms: [bt('Night vision issues, dry skin and lowered immunity.', 'ضعف الرؤية الليلية وجفاف الجلد وضعف المناعة.')],
      advice: [bt('Increase retinol-rich foods (liver, eggs, orange vegetables).', 'زد الأغذية الغنية بالريتينول (الكبد والبيض والخضروات البرتقالية).')],
    },
    keywords: ['vitamin a', 'retinol', 'فيتامين a'],
  },
  {
    id: 'vitamins_e',
    category: 'vitamins',
    name: bt('Vitamin E', 'فيتامين E'),
    description: bt(
      'Lipid-soluble antioxidant protecting cell membranes.',
      'مضاد أكسدة ذائب في الدهون يحمي أغشية الخلايا.'
    ),
    range: {
      si: { min: 11.6, max: 41.8, unit: 'µmol/L', decimals: 1 },
      us: { min: 5, max: 18, unit: 'mg/L', decimals: 0 },
      siToUs: 0.4307,
      usToSi: 2.322,
    },
    high: {
      causes: [bt('High-dose supplementation.', 'مكملات بجرعات عالية.')],
      symptoms: [bt('Usually benign; extreme doses can impair clotting.', 'حميد عادة؛ الجرعات القصوى قد تعطل التخثر.')],
      advice: [bt('Reduce dose if on high amounts.', 'خفف الجرعة إن كنت تأخذ كميات عالية.')],
    },
    low: {
      causes: [bt('Fat malabsorption or very low fat diets.', 'سوء امتصاص الدهون أو حميات منخفضة الدهون جداً.')],
      symptoms: [bt('Oxidative stress and slow recovery.', 'إجهاد تأكسدي وبطء تعافي.')],
      advice: [bt('Add nuts, seeds and vegetable oils to the diet.', 'أضف المكسرات والبذور والزيوت النباتية.')],
    },
    keywords: ['vitamin e', 'فيتامين e', 'tocopherol'],
  },
  {
    id: 'vitamins_k2',
    category: 'vitamins',
    name: bt('Vitamin K2', 'فيتامين K2'),
    description: bt(
      'Directs calcium into bones and away from arteries.',
      'يوجه الكالسيوم إلى العظام بعيداً عن الشرايين.'
    ),
    range: {
      si: { min: 0.22, max: 4.4, unit: 'nmol/L', decimals: 2 },
      us: { min: 0.1, max: 2.0, unit: 'ng/mL', decimals: 1 },
      siToUs: 0.4545,
      usToSi: 2.2,
    },
    high: {
      causes: [bt('Supplementation.', 'المكملات.')],
      symptoms: [bt('Benign — no toxicity known.', 'حميد — لا سمية معروفة.')],
      advice: [bt('No action.', 'لا حاجة لإجراء.')],
    },
    low: {
      causes: [bt('Poor diet or malabsorption; common with low vitamin D.', 'سوء تغذية أو امتصاص؛ شائع مع انخفاض فيتامين D.')],
      symptoms: [bt('Calcium deposition risk in vessels.', 'خطر ترسب الكالسيوم في الأوعية.')],
      advice: [bt('Pair K2 (MK-7, 100–200 µg) with vitamin D supplementation.', 'اقرن K2 (MK-7، 100–200 ميكروغرام) مع مكملات فيتامين D.')],
    },
    keywords: ['vitamin k', 'k2', 'فيتامين k2'],
  },
  {
    id: 'vitamins_c',
    category: 'vitamins',
    name: bt('Vitamin C', 'فيتامين C'),
    description: bt(
      'Water-soluble antioxidant and collagen/immune cofactor.',
      'مضاد أكسدة ذائب في الماء وعامل مساعد للكولاجين والمناعة.'
    ),
    range: {
      si: { min: 23, max: 114, unit: 'µmol/L', decimals: 0 },
      us: { min: 0.4, max: 2.0, unit: 'mg/dL', decimals: 1 },
      siToUs: 0.0176,
      usToSi: 56.8,
    },
    high: {
      causes: [bt('Supplementation — excess is excreted.', 'المكملات — الزائد يخرج في البول.')],
      symptoms: [bt('Benign; high doses may cause GI upset.', 'حميد؛ الجرعات العالية قد تزعج المعدة.')],
      advice: [bt('No action.', 'لا حاجة لإجراء.')],
    },
    low: {
      causes: [bt('Low fruit/vegetable intake or smoking.', 'قلة الفواكه والخضروات أو التدخين.')],
      symptoms: [bt('Poor immunity, slow healing and fatigue.', 'ضعف مناعة وبطء التئام وإرهاق.')],
      advice: [bt('Increase citrus, peppers and kiwi; supplement 500–1000 mg when stressed.', 'زد الحمضيات والفلفل والكيوي؛ عوّض 500–1000 ملغ عند التوتر.')],
    },
    keywords: ['vitamin c', 'فيتامين c', 'ascorbic'],
  },
  {
    id: 'vitamins_b6',
    category: 'vitamins',
    name: bt('Vitamin B6 (PLP)', 'فيتامين B6 (PLP)'),
    description: bt(
      'Amino-acid metabolism, neurotransmitter and prolactin cofactor.',
      'استقلاب الأحماض الأمينية والنواقل العصبية وعامل البرولاكتين.'
    ),
    range: {
      si: { min: 20, max: 202, unit: 'nmol/L', decimals: 0 },
      us: { min: 5, max: 50, unit: 'ng/mL', decimals: 0 },
      siToUs: 0.247,
      usToSi: 4.05,
    },
    high: {
      causes: [bt('High-dose B6 supplementation.', 'مكملات B6 بجرعات عالية.')],
      symptoms: [bt('Nerve tingling at very high chronic doses.', 'تنميل عصبي عند الجرعات المزمنة العالية جداً.')],
      advice: [bt('Reduce dose if on high amounts.', 'خفف الجرعة عند أخذ كميات عالية.')],
    },
    low: {
      causes: [bt('Alcohol, poor diet or long PPI use.', 'الكحول أو سوء التغذية أو الاستخدام الطويل لمثبطات الحمض.')],
      symptoms: [bt('Mood changes and elevated prolactin in some.', 'تغيرات مزاجية وارتفاع برولاكتين عند البعض.')],
      advice: [bt('Supplement P5P 50–100 mg if supporting prolactin control.', 'عوّض P5P بجرعة 50–100 ملغ عند دعم ضبط البرولاكتين.')],
    },
    keywords: ['b6', 'plp', 'pyridoxine', 'فيتامين b6'],
  },
];

/* ═══════════════════════════ 5. MINERALS & ELECTROLYTES ═══════════════════════════ */
const minerals: LabTestData[] = [
  {
    id: 'minerals_iron',
    category: 'minerals',
    name: bt('Serum Iron', 'الحديد في الدم'),
    description: bt(
      'Circulating iron available for red-cell production.',
      'الحديد المنتشر المتاح لإنتاج الخلايا الحمراء.'
    ),
    range: {
      si: { min: 10.7, max: 30.4, unit: 'µmol/L', decimals: 1 },
      us: { min: 60, max: 170, unit: 'µg/dL', decimals: 0 },
      siToUs: 5.587,
      usToSi: 0.179,
    },
    high: {
      causes: [
        bt('Hemochromatosis (iron overload), hemolysis or excess supplementation.', 'داء ترسب الأصبغة (فرط الحديد) أو انحلال الدم أو المكملات الزائدة.'),
      ],
      symptoms: [
        bt('Joint pain, fatigue and organ damage with chronic overload.', 'آلام مفاصل وإرهاق وتلف أعضاء عند التحميل المزمن.'),
      ],
      advice: [
        bt('Check ferritin and TIBC; hereditary hemochromatosis needs medical treatment.', 'افحص الفيريتين وTIBC؛ فرط الحديد الوراثي يحتاج علاجاً طبياً.'),
      ],
    },
    low: {
      causes: [bt('Blood loss, low intake or malabsorption.', 'فقدان دم أو انخفاض المدخول أو سوء امتصاص.')],
      symptoms: [bt('Fatigue, pale skin and reduced aerobic capacity.', 'إرهاق وشحوب وانخفاض القدرة الهوائية.')],
      advice: [
        bt('Supplement iron only if ferritin is low; take with vitamin C away from tea/coffee.', 'عوّض الحديد فقط عند انخفاض الفيريتين؛ تناوله مع فيتامين C بعيداً عن الشاي والقهوة.'),
      ],
    },
    keywords: ['iron', 'حديد', 'serum iron'],
  },
  {
    id: 'minerals_ferritin',
    category: 'minerals',
    name: bt('Ferritin', 'الفيريتين'),
    description: bt(
      'Iron storage protein — the true body iron reserve.',
      'بروتين تخزين الحديد — الاحتياطي الحقيقي للجسم.'
    ),
    range: {
      si: { min: 30, max: 300, unit: 'µg/L', decimals: 0 },
      us: { min: 30, max: 300, unit: 'ng/mL', decimals: 0 },
      siToUs: 1,
      usToSi: 1,
    },
    high: {
      causes: [
        bt('Iron overload, inflammation (acute-phase reactant) or liver disease.', 'فرط الحديد أو الالتهاب (بروتين الطور الحاد) أو أمراض الكبد.'),
      ],
      symptoms: [bt('Chronic overload: joint pain, fatigue, organ strain.', 'التحميل المزمن: آلام مفاصل وإرهاق وضغط أعضاء.')],
      advice: [
        bt('Retest with iron/TIBC; if > 300 with high transferrin saturation, medical evaluation required.', 'أعد الفحص مع الحديد وTIBC؛ إن تجاوز 300 مع تشبع مرتفع فالفحص الطبي ضروري.'),
      ],
    },
    low: {
      causes: [bt('Iron deficiency from blood loss or low intake — very common in athletes.', 'نقص الحديد من فقدان الدم أو المدخول — شائع جداً لدى الرياضيين.')],
      symptoms: [bt('Fatigue, poor recovery, hair thinning and restless legs.', 'إرهاق وبطء تعافي وتخفف شعر وأرجل قلقة.')],
      advice: [
        bt('Ferritin < 30 in athletes = deficiency; supplement 50–100 mg elemental iron with C, retest in 8–12 weeks.', 'فيريتين أقل من 30 لدى الرياضي = نقص؛ عوّض 50–100 ملغ حديد عنصري مع فيتامين C وأعد الفحص خلال 8–12 أسبوعاً.'),
      ],
    },
    keywords: ['ferritin', 'فيريتين'],
  },
  {
    id: 'minerals_tibc',
    category: 'minerals',
    name: bt('TIBC', 'TIBC'),
    description: bt(
      'Total iron-binding capacity — saturation tells the full story.',
      'السعة الكلية لربط الحديد — التشبع يروي القصة الكاملة.'
    ),
    range: {
      si: { min: 44.8, max: 80.6, unit: 'µmol/L', decimals: 1 },
      us: { min: 250, max: 450, unit: 'µg/dL', decimals: 0 },
      siToUs: 5.587,
      usToSi: 0.179,
    },
    high: {
      causes: [bt('Iron deficiency — the body increases binding capacity.', 'نقص الحديد — يرفع الجسم سعة الربط.')],
      symptoms: [bt('Same as iron deficiency: fatigue and pallor.', 'مثل نقص الحديد: إرهاق وشحوب.')],
      advice: [bt('Compute transferrin saturation (Iron/TIBC × 100); < 20% confirms deficiency.', 'احسب تشبع الترانسفيرين (الحديد/TIBC × 100)؛ أقل من 20% يؤكد النقص.')],
    },
    low: {
      causes: [bt('Iron overload or chronic inflammation.', 'فرط الحديد أو الالتهاب المزمن.')],
      symptoms: [bt('May indicate overload — pair with ferritin.', 'قد يشير للتحميل — اقرنه بالفيريتين.')],
      advice: [bt('Investigate iron overload if saturation > 50%.', 'استكشف فرط الحديد إذا تجاوز التشبع 50%.')],
    },
    keywords: ['tibc', 'iron binding', 'سعة ربط الحديد'],
  },
  {
    id: 'minerals_zinc',
    category: 'minerals',
    name: bt('Zinc', 'الزنك'),
    description: bt(
      'Critical for testosterone production, immunity and recovery.',
      'حيوي لإنتاج التستوستيرون والمناعة والتعافي.'
    ),
    range: {
      si: { min: 10.7, max: 18.4, unit: 'µmol/L', decimals: 1 },
      us: { min: 70, max: 120, unit: 'µg/dL', decimals: 0 },
      siToUs: 6.537,
      usToSi: 0.153,
    },
    high: {
      causes: [bt('Excess supplementation (long-term high doses).', 'المكملات الزائدة (جرعات عالية طويلة).')],
      symptoms: [bt('Copper deficiency and nausea at very high doses.', 'نقص النحاس وغثيان عند الجرعات العالية جداً.')],
      advice: [bt('Keep zinc under 40 mg/day long-term.', 'أبقِ الزنك أقل من 40 ملغ يومياً طويلة الأمد.')],
    },
    low: {
      causes: [
        bt('Sweat losses in athletes, poor diet, or high phytate intake.', 'خسائر التعرق لدى الرياضيين أو سوء التغذية أو الفيتات العالي.'),
      ],
      symptoms: [
        bt('Low testosterone, poor immunity, slow wound healing and hair loss.', 'انخفاض التستوستيرون وضعف مناعة وبطء التئام الجروح وتساقط شعر.'),
      ],
      advice: [
        bt('Supplement zinc 25–30 mg with food; retest in 8–12 weeks.', 'عوّض الزنك 25–30 ملغ مع الطعام؛ أعد الفحص خلال 8–12 أسبوعاً.'),
      ],
    },
    keywords: ['zinc', 'زنك'],
  },
  {
    id: 'minerals_magnesium',
    category: 'minerals',
    name: bt('Magnesium (Serum)', 'المغنيسيوم (مصل)'),
    description: bt(
      '300+ enzymatic reactions — muscle, sleep and testosterone support.',
      'أكثر من 300 تفاعل إنزيمي — دعم العضلات والنوم والتستوستيرون.'
    ),
    range: {
      si: { min: 0.70, max: 1.0, unit: 'mmol/L', decimals: 2 },
      us: { min: 1.7, max: 2.4, unit: 'mg/dL', decimals: 1 },
      siToUs: 2.433,
      usToSi: 0.411,
    },
    high: {
      causes: [bt('Kidney impairment or excessive supplementation.', 'ضعف كلوي أو المكملات الزائدة.')],
      symptoms: [bt('Weakness and low blood pressure at high levels.', 'ضعف وانخفاض ضغط عند المستويات العالية.')],
      advice: [bt('Reduce magnesium if kidney function is impaired.', 'خفف المغنيسيوم إذا كانت وظائف الكلى ضعيفة.')],
    },
    low: {
      causes: [
        bt('High sweat losses, alcohol, stress and low dietary intake.', 'خسائر التعرق والكحول والتوتر وانخفاض المدخول.'),
      ],
      symptoms: [
        bt('Muscle cramps, poor sleep, anxiety and elevated blood pressure.', 'تشنجات عضلية واضطراب نوم وقلق وارتفاع ضغط.'),
        bt('Associated with lower free testosterone.', 'مرتبط بانخفاض التستوستيرون الحر.'),
      ],
      advice: [
        bt('Use RBC magnesium or EXA for a true tissue reading — serum misses deficiency.', 'استخدم مغنيسيوم كرات الدم الحمراء أو EXA لقراءة حقيقية — المصل يفوّت النقص.'),
        bt('Supplement 300–400 mg glycinate at night.', 'عوّض 300–400 ملغ غليسينات ليلاً.'),
      ],
    },
    keywords: ['magnesium', 'مغنيسيوم', 'mg'],
  },
  {
    id: 'minerals_copper',
    category: 'minerals',
    name: bt('Copper', 'النحاس'),
    description: bt(
      'Iron utilization, connective tissue and immune cofactor.',
      'استخدام الحديد والنسيج الضام وعامل مناعي.'
    ),
    range: {
      si: { min: 11, max: 22, unit: 'µmol/L', decimals: 0 },
      us: { min: 70, max: 140, unit: 'µg/dL', decimals: 0 },
      siToUs: 6.355,
      usToSi: 0.1574,
    },
    high: {
      causes: [bt('Wilson disease (rare) or excess supplements.', 'مرض ويلسون (نادر) أو المكملات الزائدة.')],
      symptoms: [bt('Usually silent; chronic high copper lowers zinc.', 'صامت عادة؛ النحاس المرتفع يخفض الزنك.')],
      advice: [bt('Balance copper:zinc ratio near 1:10–15.', 'وازن نسبة النحاس للزنك حول 1:10–15.')],
    },
    low: {
      causes: [bt('High zinc intake, malabsorption or low diet.', 'ارتفاع الزنك أو سوء الامتصاص أو انخفاض المدخول.')],
      symptoms: [bt('Fatigue and impaired iron utilization.', 'إرهاق وضعف استخدام الحديد.')],
      advice: [bt('Add copper-rich foods (shellfish, nuts, organ meat).', 'أضف الأغذية الغنية بالنحاس (المحار والمكسرات والأحشاء).')],
    },
    keywords: ['copper', 'نحاس', 'cu'],
  },
  {
    id: 'minerals_calcium',
    category: 'minerals',
    name: bt('Calcium (Total)', 'الكالسيوم الكلي'),
    description: bt(
      'Bone, contraction and signaling mineral — protein-bound in blood.',
      'معدن العظام والانقباض والإشارات — مرتبط بالبروتين في الدم.'
    ),
    range: {
      si: { min: 2.15, max: 2.57, unit: 'mmol/L', decimals: 2 },
      us: { min: 8.6, max: 10.3, unit: 'mg/dL', decimals: 1 },
      siToUs: 4.008,
      usToSi: 0.2495,
    },
    high: {
      causes: [
        bt('Hyperparathyroidism, vitamin D excess or malignancy (rare).', 'فرط جارات الدرق أو فرط فيتامين D أو خباثة (نادر).'),
      ],
      symptoms: [bt('Fatigue, constipation, kidney stones at significant highs.', 'إرهاق وإمساك وحصى كلوية عند الارتفاع الكبير.')],
      advice: [bt('Check PTH and vitamin D to find the driver; medical review if persistently high.', 'افحص PTH وفيتامين D لمعرفة السبب؛ راجع طبيباً عند الاستمرار.')],
    },
    low: {
      causes: [bt('Vitamin D deficiency, low PTH or low intake.', 'نقص فيتامين D أو انخفاض PTH أو قلة المدخول.')],
      symptoms: [bt('Muscle cramps, tingling and bone issues.', 'تشنجات وتنميل ومشاكل عظمية.')],
      advice: [bt('Correct vitamin D first; supplement calcium 500–1000 mg with food if dietary intake is low.', 'صحّح فيتامين D أولاً؛ عوّض الكالسيوم 500–1000 ملغ مع الطعام عند قلة المدخول.')],
    },
    keywords: ['calcium', 'كالسيوم', 'ca'],
  },
  {
    id: 'minerals_calcium_ionized',
    category: 'minerals',
    name: bt('Calcium (Ionized)', 'الكالسيوم المتأين'),
    description: bt(
      'Biologically active calcium — unaffected by protein levels.',
      'الكالسيوم النشط بيولوجياً — لا يتأثر بمستويات البروتين.'
    ),
    range: {
      si: { min: 1.15, max: 1.32, unit: 'mmol/L', decimals: 2 },
      us: { min: 4.6, max: 5.3, unit: 'mg/dL', decimals: 1 },
      siToUs: 4.008,
      usToSi: 0.2495,
    },
    high: {
      causes: [bt('Hyperparathyroidism or malignancy (rare).', 'فرط جارات الدرق أو خباثة (نادر).')],
      symptoms: [bt('Neuromuscular irritability.', 'استثارة عصبية عضلية.')],
      advice: [bt('Investigate PTH; medical review for persistent elevation.', 'استكشف PTH؛ راجع طبيباً عند الاستمرار.')],
    },
    low: {
      causes: [bt('Low PTH, vitamin D deficiency or alkalosis.', 'انخفاض PTH أو نقص فيتامين D أو قلوية الدم.')],
      symptoms: [bt('Tingling, cramps and muscle twitching.', 'تنميل وتشنجات وارتعاش عضلي.')],
      advice: [bt('Correct the underlying driver (vitamin D/PTH).', 'صحّح السبب الأساسي (فيتامين D/PTH).')],
    },
    keywords: ['ionized calcium', 'كالسيوم متأين'],
  },
  {
    id: 'minerals_sodium',
    category: 'minerals',
    name: bt('Sodium', 'الصوديوم'),
    description: bt(
      'Extracellular electrolyte — hydration and nerve signaling.',
      'شارد خارج الخلية — الترطيب والإشارات العصبية.'
    ),
    range: {
      si: { min: 135, max: 145, unit: 'mmol/L', decimals: 0 },
      us: { min: 135, max: 145, unit: 'mEq/L', decimals: 0 },
      siToUs: 1,
      usToSi: 1,
    },
    high: {
      causes: [bt('Dehydration or excessive sodium intake.', 'الجفاف أو الإفراط في الصوديوم.')],
      symptoms: [bt('Thirst, elevated blood pressure.', 'عطش وارتفاع ضغط.')],
      advice: [bt('Hydrate and moderate sodium.', 'رطّب واعتدل في الصوديوم.')],
    },
    low: {
      causes: [bt('Overhydration (excess water intake), sweating loss or diuretics.', 'الإفراط في الماء أو خسائر التعرق أو مدرات البول.')],
      symptoms: [bt('Fatigue, headache and cramping (hyponatremia).', 'إرهاق وصداع وتشنجات (نقص صوديوم).')],
      advice: [bt('Balance water and electrolytes; add salt to meals during heavy sweating.', 'وازن الماء والشوارد؛ أضف الملح للوجبات عند التعرق الشديد.')],
    },
    keywords: ['sodium', 'صوديوم', 'na'],
  },
  {
    id: 'minerals_potassium',
    category: 'minerals',
    name: bt('Potassium', 'البوتاسيوم'),
    description: bt(
      'Intracellular electrolyte — heartbeat and muscle contraction.',
      'شارد داخل الخلية — ضربات القلب والانقباض العضلي.'
    ),
    range: {
      si: { min: 3.5, max: 5.1, unit: 'mmol/L', decimals: 1 },
      us: { min: 3.5, max: 5.1, unit: 'mEq/L', decimals: 1 },
      siToUs: 1,
      usToSi: 1,
    },
    high: {
      causes: [
        bt('Kidney impairment, ACE-inhibitors, or excess potassium.', 'ضعف كلوي أو مثبطات ACE أو إفراط البوتاسيوم.'),
      ],
      symptoms: [
        bt('Heart rhythm disturbances — medical emergency at high levels.', 'اضطراب نظم القلب — طارئ طبي عند المستويات العالية.'),
      ],
      advice: [
        bt('Hyperkalemia > 5.5 needs urgent medical attention.', 'فرط البوتاسيوم فوق 5.5 يحتاج رعاية طبية عاجلة.'),
      ],
    },
    low: {
      causes: [
        bt('Diuretics, sweating, low intake or GI losses.', 'مدرات البول أو التعرق أو قلة المدخول أو خسائر الجهاز الهضمي.'),
      ],
      symptoms: [
        bt('Muscle weakness, cramps and heart palpitations.', 'ضعف عضلي وتشنجات وخفقان.'),
      ],
      advice: [
        bt('Increase potassium foods (bananas, potatoes, spinach); correct slowly.', 'زد أغذية البوتاسيوم (الموز والبطاطا والسبانخ)؛ صحّح ببطء.'),
      ],
    },
    keywords: ['potassium', 'بوتاسيوم', 'k'],
  },
  {
    id: 'minerals_chloride',
    category: 'minerals',
    name: bt('Chloride', 'الكلوريد'),
    description: bt(
      'Anion balancing sodium — acid-base and hydration status.',
      'الأنيون الموازن للصوديوم — الحالة الحمضية القاعدية والترطيب.'
    ),
    range: {
      si: { min: 98, max: 107, unit: 'mmol/L', decimals: 0 },
      us: { min: 98, max: 107, unit: 'mEq/L', decimals: 0 },
      siToUs: 1,
      usToSi: 1,
    },
    high: {
      causes: [bt('Dehydration or metabolic acidosis.', 'الجفاف أو الحماض الأيضي.')],
      symptoms: [bt('None specific.', 'لا أعراض محددة.')],
      advice: [bt('Hydrate and correct the acid-base disturbance.', 'رطّب وصحّح الاضطراب الحمضي القاعدي.')],
    },
    low: {
      causes: [bt('Vomiting, GI losses or overhydration.', 'التقيؤ أو خسائر هضمية أو إفراط ترطيب.')],
      symptoms: [bt('Weakness and alkalosis risk.', 'ضعف وخطر قلوية.')],
      advice: [bt('Correct fluids and electrolytes.', 'صحّح السوائل والشوارد.')],
    },
    keywords: ['chloride', 'كلوريد', 'cl'],
  },
  {
    id: 'minerals_phosphorus',
    category: 'minerals',
    name: bt('Phosphorus', 'الفوسفور'),
    description: bt(
      'ATP production and bone mineral cofactor.',
      'إنتاج ATP وعامل معدن العظام.'
    ),
    range: {
      si: { min: 0.81, max: 1.45, unit: 'mmol/L', decimals: 2 },
      us: { min: 2.5, max: 4.5, unit: 'mg/dL', decimals: 1 },
      siToUs: 3.096,
      usToSi: 0.323,
    },
    high: {
      causes: [bt('Kidney impairment or excessive intake.', 'ضعف كلوي أو مدخول مفرط.')],
      symptoms: [bt('Calcification risk with chronic elevation.', 'خطر التكلس مع الارتفاع المزمن.')],
      advice: [bt('Reduce phosphate additives in processed foods.', 'قلل إضافات الفوسفات في الأغذية المصنعة.')],
    },
    low: {
      causes: [bt('Low intake or refeeding after deficiency.', 'قلة المدخول أو إعادة التغذية بعد نقص.')],
      symptoms: [bt('Weakness and bone issues with chronic lows.', 'ضعف ومشاكل عظمية مع الانخفاض المزمن.')],
      advice: [bt('Increase protein and dairy intake.', 'زد البروتين والألبان.')],
    },
    keywords: ['phosphorus', 'فوسفور', 'p'],
  },
  {
    id: 'minerals_boron',
    category: 'minerals',
    name: bt('Boron', 'البورون'),
    description: bt(
      'Trace mineral supporting bone, brain and hormone balance.',
      'معدن نزر يدعم العظام والدماغ وتوازن الهرمونات.'
    ),
    range: {
      si: { min: 0.5, max: 2.5, unit: 'µg/L', decimals: 1 },
      us: { min: 0.5, max: 2.5, unit: 'µg/L', decimals: 1 },
      siToUs: 1,
      usToSi: 1,
    },
    high: {
      causes: [bt('Supplementation.', 'المكملات.')],
      symptoms: [bt('Benign at moderate levels.', 'حميد عند المستويات المعتدلة.')],
      advice: [bt('No action at mild elevations.', 'لا تدخل عند الارتفاعات الخفيفة.')],
    },
    low: {
      causes: [bt('Poor fruit/vegetable intake.', 'قلة الفواكه والخضروات.')],
      symptoms: [bt('Possibly lower free testosterone in some studies.', 'احتمال انخفاض التستوستيرون الحر في بعض الدراسات.')],
      advice: [bt('6–9 mg boron daily may support SHBG balance.', 'قد يدعم البورون 6–9 ملغ يومياً توازن SHBG.')],
    },
    keywords: ['boron', 'بورون'],
  },
  {
    id: 'minerals_selenium',
    category: 'minerals',
    name: bt('Selenium', 'السيلينيوم'),
    description: bt(
      'Antioxidant mineral for thyroid function and sperm health.',
      'معدن مضاد للأكسدة لوظيفة الغدة الدرقية وصحة الحيوانات المنوية.'
    ),
    range: {
      si: { min: 60, max: 140, unit: 'µg/L', decimals: 0 },
      us: { min: 60, max: 140, unit: 'µg/L', decimals: 0 },
      siToUs: 1,
      usToSi: 1,
    },
    high: {
      causes: [bt('Excess supplementation (selenosis).', 'المكملات الزائدة (التسمم السيلينيومي).')],
      symptoms: [bt('Garlic breath, hair loss and nail changes.', 'رائحة ثوم وتساقط شعر وتغير أظافر.')],
      advice: [bt('Reduce or stop selenium supplements.', 'خفف أو أوقف مكملات السيلينيوم.')],
    },
    low: {
      causes: [bt('Low soil intake or poor diet.', 'انخفاض التربة أو سوء التغذية.')],
      symptoms: [bt('Impaired thyroid conversion (T4→T3) and immunity.', 'ضعف تحويل الغدة (T4 إلى T3) والمناعة.')],
      advice: [bt('Add Brazil nuts (1–2/day) or supplement 100–200 µg.', 'أضف مكسرات البرازيل (1–2 يومياً) أو عوّض 100–200 ميكروغرام.')],
    },
    keywords: ['selenium', 'سيلينيوم', 'se'],
  },
];

/* ═══════════════════════════ 6. THYROID PROFILE ═══════════════════════════ */
const thyroid: LabTestData[] = [
  {
    id: 'thyroid_tsh',
    category: 'thyroid',
    name: bt('TSH', 'TSH'),
    description: bt(
      'Pituitary signal controlling thyroid output — the first-line screen.',
      'إشارة النخامية المتحكمة بإفراز الدرقية — الفحص الأول.'
    ),
    range: {
      si: { min: 0.4, max: 4.0, unit: 'mIU/L', decimals: 1 },
      us: { min: 0.4, max: 4.0, unit: 'mIU/L', decimals: 1 },
      siToUs: 1,
      usToSi: 1,
    },
    high: {
      causes: [
        bt('Primary hypothyroidism or recovery from overtraining.', 'قصور الدرقية الأولي أو التعافي من الإفراط التدريبي.'),
      ],
      symptoms: [
        bt('Fatigue, weight gain, cold intolerance and low metabolism.', 'إرهاق وزيادة وزن وحساسية للبرد وانخفاض الأيض.'),
      ],
      advice: [
        bt('Check free T4/T3; if both low, medical thyroid support may be needed.', 'افحص T4/T3 الحر؛ إذا كانا منخفضين فقد يلزم دعم درقي طبي.'),
      ],
    },
    low: {
      causes: [
        bt('Hyperthyroidism, exogenous thyroid hormone use, or pituitary suppression.', 'فرط الدرقية أو استخدام هرمون درقي خارجي أو قمع نخامي.'),
      ],
      symptoms: [
        bt('Anxiety, rapid heart rate, heat intolerance and muscle wasting.', 'قلق وسرعة ضربات وحساسية للحرارة وهدم عضلي.'),
      ],
      advice: [
        bt('Check free T4/T3; low TSH with high fT3/fT4 = overactive thyroid — medical review.', 'افحص T4/T3 الحر؛ TSH منخفض مع ارتفاع fT3/fT4 = فرط نشاط — مراجعة طبية.'),
      ],
    },
    keywords: ['tsh', 'thyroid stimulating', 'غدة درقية'],
  },
  {
    id: 'thyroid_ft3',
    category: 'thyroid',
    name: bt('Free T3 (fT3)', 'T3 الحر (fT3)'),
    description: bt(
      'The active thyroid hormone driving metabolic rate.',
      'الهرمون الدرقي النشط المحرك لمعدل الأيض.'
    ),
    range: {
      si: { min: 3.5, max: 6.5, unit: 'pmol/L', decimals: 1 },
      us: { min: 2.3, max: 4.2, unit: 'pg/mL', decimals: 1 },
      siToUs: 0.651,
      usToSi: 1.536,
    },
    high: {
      causes: [bt('Hyperthyroidism, thyroid medication or stimulant effects.', 'فرط الدرقية أو الدواء الدرقي أو تأثيرات المنشطات.')],
      symptoms: [bt('Heat intolerance, anxiety and muscle breakdown.', 'حساسية للحرارة وقلق وهدم عضلي.')],
      advice: [bt('Reduce stimulants; medical review if persistently high.', 'قلل المنشطات؛ مراجعة طبية عند الاستمرار.')],
    },
    low: {
      causes: [
        bt('Low-calorie dieting (reduced T4→T3 conversion), stress or low selenium/zinc.', 'الحميات منخفضة السعرات (انخفاض التحويل) أو التوتر أو نقص السيلينيوم/الزنك.'),
      ],
      symptoms: [
        bt('Slowed metabolism, fatigue and difficulty losing fat.', 'بطء الأيض وإرهاق وصعوبة خسارة الدهون.'),
      ],
      advice: [
        bt('Avoid prolonged aggressive deficits; ensure selenium, zinc and adequate carbs.', 'تجنب العجز الشديد المطوّل؛ تأكد من السيلينيوم والزنك وكفاية الكربوهيدرات.'),
      ],
    },
    keywords: ['ft3', 'free t3', 't3 حر'],
  },
  {
    id: 'thyroid_ft4',
    category: 'thyroid',
    name: bt('Free T4 (fT4)', 'T4 الحر (fT4)'),
    description: bt(
      'The storage thyroid hormone converted to active T3.',
      'الهرمون الدرقي التخزيني الذي يتحول إلى T3 النشط.'
    ),
    range: {
      si: { min: 10.3, max: 23.2, unit: 'pmol/L', decimals: 1 },
      us: { min: 0.8, max: 1.8, unit: 'ng/dL', decimals: 1 },
      siToUs: 0.0777,
      usToSi: 12.87,
    },
    high: {
      causes: [bt('Hyperthyroidism or thyroid medication.', 'فرط الدرقية أو الدواء الدرقي.')],
      symptoms: [bt('Anxiety, tremors and fast metabolism.', 'قلق ورجفة وأيض سريع.')],
      advice: [bt('Medical review to adjust thyroid therapy.', 'مراجعة طبية لضبط العلاج الدرقي.')],
    },
    low: {
      causes: [bt('Hypothyroidism or recent caloric restriction.', 'قصور الدرقية أو تقييد سعرات حديث.')],
      symptoms: [bt('Fatigue, weight gain and low energy.', 'إرهاق وزيادة وزن وانخفاض طاقة.')],
      advice: [bt('Medical assessment; optimize selenium to support conversion.', 'تقييم طبي؛ حسّن السيلينيوم لدعم التحويل.')],
    },
    keywords: ['ft4', 'free t4', 't4 حر'],
  },
  {
    id: 'thyroid_tt3',
    category: 'thyroid',
    name: bt('Total T3', 'T3 الكلي'),
    description: bt(
      'Total triiodothyronine including protein-bound fraction.',
      'مجموع ثلاثي يود الثيرونين شاملاً الجزء المرتبط بالبروتين.'
    ),
    range: {
      si: { min: 1.2, max: 3.1, unit: 'nmol/L', decimals: 1 },
      us: { min: 80, max: 200, unit: 'ng/dL', decimals: 0 },
      siToUs: 65.1,
      usToSi: 0.01536,
    },
    high: {
      causes: [bt('Hyperthyroidism or exogenous T3.', 'فرط الدرقية أو T3 خارجي.')],
      symptoms: [bt('Overheating, anxiety, muscle loss.', 'حرارة زائدة وقلق وفقدان عضلي.')],
      advice: [bt('Medical review; avoid unnecessary T3 use.', 'مراجعة طبية؛ تجنب الاستخدام غير الضروري لـ T3.')],
    },
    low: {
      causes: [bt('Hypothyroidism or severe illness.', 'قصور الدرقية أو مرض شديد.')],
      symptoms: [bt('Fatigue and cold intolerance.', 'إرهاق وحساسية للبرد.')],
      advice: [bt('Evaluate with TSH and free T4.', 'قيّم مع TSH وT4 الحر.')],
    },
    keywords: ['total t3', 'tt3', 't3 كلي'],
  },
  {
    id: 'thyroid_tt4',
    category: 'thyroid',
    name: bt('Total T4', 'T4 الكلي'),
    description: bt(
      'Total thyroxine including bound fraction.',
      'مجموع الثيروكسين شاملاً الجزء المرتبط.'
    ),
    range: {
      si: { min: 64, max: 154, unit: 'nmol/L', decimals: 0 },
      us: { min: 5.0, max: 12.0, unit: 'µg/dL', decimals: 1 },
      siToUs: 0.0777,
      usToSi: 12.87,
    },
    high: {
      causes: [bt('Hyperthyroidism or thyroid medication.', 'فرط الدرقية أو الدواء الدرقي.')],
      symptoms: [bt('Fast metabolism and anxiety.', 'أيض سريع وقلق.')],
      advice: [bt('Medical review.', 'مراجعة طبية.')],
    },
    low: {
      causes: [bt('Hypothyroidism.', 'قصور الدرقية.')],
      symptoms: [bt('Fatigue and weight gain.', 'إرهاق وزيادة وزن.')],
      advice: [bt('Medical assessment with TSH.', 'تقييم طبي مع TSH.')],
    },
    keywords: ['total t4', 'tt4', 't4 كلي'],
  },
  {
    id: 'thyroid_rt3',
    category: 'thyroid',
    name: bt('Reverse T3 (rT3)', 'الريفرس T3 (rT3)'),
    description: bt(
      'Inactive T3 metabolite — high values with stress/crash diets.',
      'مستقلب T3 الخامل — يرتفع مع التوتر والحميات القاسية.'
    ),
    range: {
      si: { min: 0.14, max: 0.37, unit: 'nmol/L', decimals: 2 },
      us: { min: 9, max: 24, unit: 'ng/dL', decimals: 0 },
      siToUs: 64.9,
      usToSi: 0.0154,
    },
    high: {
      causes: [
        bt('Chronic caloric deficit, stress, liver congestion or illness.', 'العجز الحراري المزمن أو التوتر أو احتقان الكبد أو المرض.'),
      ],
      symptoms: [
        bt('Stalled metabolism and stubborn fat loss (functional hypothyroid pattern).', 'توقف الأيض وصعوبة خسارة الدهون (نمط قصور وظيفي).'),
      ],
      advice: [
        bt('Eat at maintenance periodically (diet breaks), reduce stress and optimize selenium/zinc.', 'ادخل فترات أكل عند الصيانة دورياً وخفف التوتر وحسّن السيلينيوم والزنك.'),
      ],
    },
    low: {
      causes: [bt('Not clinically relevant.', 'غير مهم سريرياً.')],
      symptoms: [bt('None.', 'لا شيء.')],
      advice: [bt('No action.', 'لا حاجة لإجراء.')],
    },
    keywords: ['rt3', 'reverse t3', 'ريفرس t3'],
  },
  {
    id: 'thyroid_anti_tpo',
    category: 'thyroid',
    name: bt('Anti-TPO Antibodies', 'أجسام مضادة لـ TPO'),
    description: bt(
      'Autoantibodies attacking thyroid peroxidase — Hashimoto marker.',
      'أجسام مضادة تهاجم البيروكسيداز الدرقي — مؤشر هاشيموتو.'
    ),
    range: {
      si: { min: 0, max: 34, unit: 'IU/mL', decimals: 0 },
      us: { min: 0, max: 34, unit: 'IU/mL', decimals: 0 },
      siToUs: 1,
      usToSi: 1,
    },
    high: {
      causes: [bt('Autoimmune thyroiditis (Hashimoto).', 'التهاب الدرقية المناعي (هاشيموتو).')],
      symptoms: [bt('Progressive hypothyroid symptoms; risk of future thyroid failure.', 'أعراض قصور تدريجي وخطر فشل درقي مستقبلاً.')],
      advice: [
        bt('Monitor TSH regularly; support with selenium 100–200 µg and reduce stress.', 'راقب TSH دورياً؛ ادعم بالسيلينيوم 100–200 ميكروغرام وخفف التوتر.'),
      ],
    },
    low: {
      causes: [bt('Absence of autoimmunity — favorable.', 'غياب المناعة الذاتية — جيد.')],
      symptoms: [bt('None.', 'لا شيء.')],
      advice: [bt('No action.', 'لا حاجة لإجراء.')],
    },
    keywords: ['anti-tpo', 'tpo antibodies', 'أجسام مضادة درقية'],
  },
  {
    id: 'thyroid_anti_tg',
    category: 'thyroid',
    name: bt('Anti-Thyroglobulin Antibodies', 'أجسام مضادة للثيروغلوبيولين'),
    description: bt(
      'Autoantibodies against thyroglobulin — thyroid autoimmunity panel.',
      'أجسام مضادة للثيروغلوبيولين — لوحة المناعة الدرقية.'
    ),
    range: {
      si: { min: 0, max: 115, unit: 'IU/mL', decimals: 0 },
      us: { min: 0, max: 115, unit: 'IU/mL', decimals: 0 },
      siToUs: 1,
      usToSi: 1,
    },
    high: {
      causes: [bt('Autoimmune thyroid disease.', 'مرض الدرقية المناعي.')],
      symptoms: [bt('Thyroid dysfunction risk; often with anti-TPO.', 'خطر خلل درقي؛ غالباً مع anti-TPO.')],
      advice: [bt('Annual TSH monitoring and selenium support.', 'مراقبة TSH سنوياً ودعم السيلينيوم.')],
    },
    low: {
      causes: [bt('Absence of autoimmunity.', 'غياب المناعة الذاتية.')],
      symptoms: [bt('None.', 'لا شيء.')],
      advice: [bt('No action.', 'لا حاجة لإجراء.')],
    },
    keywords: ['anti-tg', 'thyroglobulin', 'أجسام مضادة ثيروغلوبيولين'],
  },
];

/* ═══════════════════════════ 7. INFLAMMATION & IMMUNITY ═══════════════════════════ */
const inflammation: LabTestData[] = [
  {
    id: 'inflam_esr',
    category: 'inflammation',
    name: bt('ESR (Sedimentation Rate)', 'معدل ترسيب كرات الدم (ESR)'),
    description: bt(
      'Generalized inflammation marker — slower but sensitive.',
      'مؤشر التهابي عام — حساس لكنه بطيء.'
    ),
    range: {
      si: { min: 0, max: 15, unit: 'mm/hr', decimals: 0 },
      us: { min: 0, max: 15, unit: 'mm/hr', decimals: 0 },
      siToUs: 1,
      usToSi: 1,
    },
    high: {
      causes: [
        bt('Ongoing inflammation, infection, tissue injury or autoimmune activity.', 'التهاب جارٍ أو عدوى أو إصابة أنسجة أو نشاط مناعي.'),
      ],
      symptoms: [bt('Silent — reflects systemic inflammatory load.', 'صامت — يعكس الحمل الالتهابي الجهازي.')],
      advice: [
        bt('Investigate the source; retest after recovery and rest.', 'استكشف المصدر؛ أعد الفحص بعد التعافي والراحة.'),
      ],
    },
    low: {
      causes: [bt('Usually normal/low-inflammation state.', 'حالة منخفضة الالتهاب عادة.')],
      symptoms: [bt('None.', 'لا شيء.')],
      advice: [bt('No action.', 'لا حاجة لإجراء.')],
    },
    keywords: ['esr', 'sedimentation', 'ترسيب'],
  },
  {
    id: 'inflam_crp',
    category: 'inflammation',
    name: bt('CRP (Standard)', 'CRP (البروتين المتفاعل)'),
    description: bt(
      'Standard inflammation marker — elevated in infection/injury.',
      'مؤشر التهابي قياسي — يرتفع في العدوى والإصابة.'
    ),
    range: {
      si: { min: 0, max: 5, unit: 'mg/L', decimals: 1 },
      us: { min: 0, max: 5, unit: 'mg/L', decimals: 1 },
      siToUs: 1,
      usToSi: 1,
    },
    high: {
      causes: [bt('Active infection, trauma or significant inflammation.', 'عدوى نشطة أو رضّ أو التهاب كبير.')],
      symptoms: [bt('Fever, pain and systemic signs at high levels.', 'حمى وألم وعلامات جهازية عند المستويات العالية.')],
      advice: [bt('Identify and treat the cause; rest before re-testing.', 'حدد وعالج السبب؛ استرح قبل إعادة الفحص.')],
    },
    low: {
      causes: [bt('Healthy low-inflammation state.', 'حالة صحية منخفضة الالتهاب.')],
      symptoms: [bt('None.', 'لا شيء.')],
      advice: [bt('No action.', 'لا حاجة لإجراء.')],
    },
    keywords: ['crp', 'c-reactive', 'بروتين تفاعلي'],
  },
  {
    id: 'inflam_rf',
    category: 'inflammation',
    name: bt('Rheumatoid Factor (RF)', 'العامل الروماتويدي (RF)'),
    description: bt(
      'Autoantibody marker for rheumatoid arthritis and other autoimmunity.',
      'مؤشر أجسام مضادة لالتهاب المفاصل الروماتويدي وأمراض مناعية.'
    ),
    range: {
      si: { min: 0, max: 14, unit: 'IU/mL', decimals: 0 },
      us: { min: 0, max: 14, unit: 'IU/mL', decimals: 0 },
      siToUs: 1,
      usToSi: 1,
    },
    high: {
      causes: [
        bt('Rheumatoid arthritis, chronic infections or other autoimmune disease.', 'التهاب المفاصل الروماتويدي أو عدوى مزمنة أو أمراض مناعية.'),
      ],
      symptoms: [bt('Joint pain, swelling and morning stiffness.', 'آلام مفاصل وتورم وتيبس صباحي.')],
      advice: [
        bt('Positive RF with symptoms → rheumatology referral.', 'إيجابية RF مع الأعراض → إحالة لطبيب روماتيزم.'),
      ],
    },
    low: {
      causes: [bt('Absence of autoimmunity — favorable.', 'غياب المناعة الذاتية — جيد.')],
      symptoms: [bt('None.', 'لا شيء.')],
      advice: [bt('No action.', 'لا حاجة لإجراء.')],
    },
    keywords: ['rf', 'rheumatoid factor', 'روماتويدي'],
  },
  {
    id: 'inflam_ana',
    category: 'inflammation',
    name: bt('Antinuclear Antibody (ANA)', 'الأجسام المضادة للنواة (ANA)'),
    description: bt(
      'Screening antibody for systemic autoimmune disease.',
      'جسم مضاد فاحص لأمراض المناعة الذاتية الجهازية.'
    ),
    range: {
      si: { min: 0, max: 1, unit: 'titer (negative)', decimals: 0 },
      us: { min: 0, max: 1, unit: 'titer (negative)', decimals: 0 },
      siToUs: 1,
      usToSi: 1,
    },
    high: {
      causes: [
        bt('Autoimmune conditions (SLE, etc.) or benign low titers.', 'أمراض مناعية (ذئبة وغيرها) أو عيارات منخفضة حميدة.'),
      ],
      symptoms: [bt('Fatigue, joint pain, rashes — depends on the condition.', 'إرهاق وآلام مفاصل وطفح — يعتمد على الحالة.')],
      advice: [
        bt('Positive ANA requires confirmatory testing and rheumatology review.', 'إيجابية ANA تتطلب تأكيداً ومراجعة روماتيزم.'),
      ],
    },
    low: {
      causes: [bt('Absence of autoimmunity.', 'غياب المناعة الذاتية.')],
      symptoms: [bt('None.', 'لا شيء.')],
      advice: [bt('No action.', 'لا حاجة لإجراء.')],
    },
    keywords: ['ana', 'antinuclear', 'أجسام مضادة للنواة'],
  },
];

/* ═══════════════════════════ 8. BONE & TISSUE TURNOVER ═══════════════════════════ */
const bone: LabTestData[] = [
  {
    id: 'bone_pth',
    category: 'bone',
    name: bt('Parathyroid Hormone (PTH)', 'هرمون جارات الدرقية (PTH)'),
    description: bt(
      'Calcium-regulating hormone — bone resorption and vitamin D axis.',
      'الهرمون المنظم للكالسيوم — دوران العظام ومحور فيتامين D.'
    ),
    range: {
      si: { min: 1.1, max: 6.9, unit: 'pmol/L', decimals: 1 },
      us: { min: 10, max: 65, unit: 'pg/mL', decimals: 0 },
      siToUs: 9.43,
      usToSi: 0.106,
    },
    high: {
      causes: [
        bt('Vitamin D deficiency, low calcium or hyperparathyroidism.', 'نقص فيتامين D أو انخفاض الكالسيوم أو فرط جارات الدرق.'),
      ],
      symptoms: [bt('Bone pain and kidney stone risk at high levels.', 'آلام عظمية وخطر حصى كلوية عند المستويات العالية.')],
      advice: [
        bt('Correct vitamin D and calcium first; re-test PTH in 3 months.', 'صحّح فيتامين D والكالسيوم أولاً؛ أعد فحص PTH بعد 3 أشهر.'),
      ],
    },
    low: {
      causes: [bt('High calcium, hyperthyroidism or sarcoidosis (rare).', 'ارتفاع الكالسيوم أو فرط الدرقية أو الساركويد (نادر).')],
      symptoms: [bt('None specific.', 'لا أعراض محددة.')],
      advice: [bt('Interpret with calcium and vitamin D.', 'فسّره مع الكالسيوم وفيتامين D.')],
    },
    keywords: ['pth', 'parathyroid', 'جارات الدرق'],
  },
  {
    id: 'bone_osteocalcin',
    category: 'bone',
    name: bt('Osteocalcin', 'أوستيوكالسين'),
    description: bt(
      'Bone formation marker — reflects new bone synthesis.',
      'مؤشر تكوين العظام — يعكس تخليق العظم الجديد.'
    ),
    range: {
      si: { min: 8, max: 32, unit: 'ng/mL', decimals: 0 },
      us: { min: 8, max: 32, unit: 'ng/mL', decimals: 0 },
      siToUs: 1,
      usToSi: 1,
    },
    high: {
      causes: [bt('High bone turnover, growth spurts or recent fracture healing.', 'دوران عظمي مرتفع أو طفرات نمو أو التئام كسر حديث.')],
      symptoms: [bt('None specific.', 'لا أعراض محددة.')],
      advice: [bt('Usually benign in athletes; ensure vitamin D/K2.', 'حميد عادة لدى الرياضيين؛ تأكد من فيتامين D/K2.')],
    },
    low: {
      causes: [bt('Low bone formation — sedentary or vitamin D deficient.', 'انخفاض تكوين العظام — قلة حركة أو نقص فيتامين D.')],
      symptoms: [bt('Reduced bone density risk.', 'خطر انخفاض كثافة العظام.')],
      advice: [bt('Add weight-bearing training, vitamin D and adequate calcium.', 'أضف التدريب الحامل للوزن وفيتامين D وكالسيوم كافياً.')],
    },
    keywords: ['osteocalcin', 'أوستيوكالسين'],
  },
  {
    id: 'bone_ctx1',
    category: 'bone',
    name: bt('CTX-1 (CrossLaps)', 'CTX-1 (كروس لابس)'),
    description: bt(
      'Bone resorption marker — reflects bone breakdown rate.',
      'مؤشر هدم العظام — يعكس معدل تحلل العظم.'
    ),
    range: {
      si: { min: 0.15, max: 0.7, unit: 'ng/mL', decimals: 2 },
      us: { min: 150, max: 700, unit: 'pg/mL', decimals: 0 },
      siToUs: 0.001,
      usToSi: 1000,
    },
    high: {
      causes: [
        bt('Low estrogen/testosterone, hyperparathyroidism or immobilization.', 'انخفاض الإستروجين/التستوستيرون أو فرط جارات الدرق أو الخمول.'),
      ],
      symptoms: [bt('Increased bone loss risk — especially post-cycle.', 'خطر فقدان عظمي متزايد — خاصة بعد الكورس.')],
      advice: [
        bt('Support bone with vitamin D/K2, calcium and weight-bearing training.', 'ادعم العظام بفيتامين D/K2 والكالسيوم وتدريب الحمل.'),
      ],
    },
    low: {
      causes: [bt('Low turnover or anti-resorptive therapy.', 'دوران منخفض أو علاج مضاد للهدم.')],
      symptoms: [bt('None specific.', 'لا أعراض محددة.')],
      advice: [bt('No action if bones are healthy.', 'لا تدخل إذا كانت العظام سليمة.')],
    },
    keywords: ['ctx-1', 'crosslaps', 'هدم عظمي'],
  },
  {
    id: 'bone_p1np',
    category: 'bone',
    name: bt('PINP (P1NP)', 'PINP (P1NP)'),
    description: bt(
      'Amino-terminal propeptide — bone formation marker.',
      'الببتيد الطرفي الأميني — مؤشر تكوين العظام.'
    ),
    range: {
      si: { min: 20, max: 75, unit: 'ng/mL', decimals: 0 },
      us: { min: 20, max: 75, unit: 'ng/mL', decimals: 0 },
      siToUs: 1,
      usToSi: 1,
    },
    high: {
      causes: [bt('High turnover states or recent fracture.', 'حالات دوران مرتفع أو كسر حديث.')],
      symptoms: [bt('None specific.', 'لا أعراض محددة.')],
      advice: [bt('Pair with CTX-1 to map formation vs resorption balance.', 'اقرنه مع CTX-1 لرسم توازن التكوين مقابل الهدم.')],
    },
    low: {
      causes: [bt('Low bone formation from inactivity or deficiency.', 'انخفاض تكوين العظام من الخمول أو النقص.')],
      symptoms: [bt('Reduced bone density risk.', 'خطر انخفاض كثافة العظام.')],
      advice: [bt('Weight-bearing training, vitamin D and protein sufficiency.', 'تدريب الحمل وفيتامين D وكفاية البروتين.')],
    },
    keywords: ['p1np', 'pinp', 'تكوين عظمي'],
  },
];

export const LAB_TESTS: LabTestData[] = [
  ...hormones,
  ...organs,
  ...cardiovascular,
  ...vitamins,
  ...minerals,
  ...thyroid,
  ...inflammation,
  ...bone,
];
