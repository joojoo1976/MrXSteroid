# TOOL_111_ENGINE_DESIGN.md

> **Engine Design Document for Tool #111: Smart Food & Macro Substitution Engine**
> Phase C-3.1 — Engine Design Phase (Pre-Implementation)
> Date: 2026-10-14
> Status: **DRAFT — Pending Review** — No code written yet

---

## 1. الهدف الوظيفي الدقيق (Functional Objective)

**Tool #111: Smart Food & Macro Substitution Engine**  
محرك ذكي لاستبدال الأطعمة بمكافئاتها المكروية (Macro-Equivalent Food Substitution).

**الوظيفة الأساسية**:  
عند إعطاء طعام أصلي وكمية محددة، يقدم المحرك بديلاً غذائياً مع مكافئات مكروية دقيقة (بروتين، كربوهيدرات، دهون، سعرات حرارية) مع الحفاظ على التكافؤ الغذائي قدر الإمكان.

**حالات الاستخدام الأساسية**:
- استبدال طعام غير متوفر ببديل مكافئ
- تعديل وجبة لتناسب مستهدفات الماكروز اليومية
- مقارنة خيارات غذائية متعددة بنفس التكافؤ المكروي
- حساب الكميات المكافئة عند تغيير النظام الغذائي

---

## 2. المدخلات الفعلية (Inputs)

### 2.1 حقول الإدخال الأساسية

| الحقل | النوع | مطلوب | الوصف | قيود |
|--------|-------|-------|--------|------|
| `originalFood` | `FoodItem` | نعم | الطعام الأصلي المراد استبداله | يجب أن يوجد في قاعدة البيانات |
| `substituteFood` | `FoodItem` | نعم | الطعام البديل المقترح | يجب أن يوجد في قاعدة البيانات |
| `originalQuantity` | `number` | نعم | كمية الطعام الأصلي | > 0، ≤ 10000 |
| `originalUnit` | `enum` | نعم | وحدة القياس للأصلي | `g`, `oz`, `ml`, `cup`, `tbsp`, `tsp`, `piece` |
| `targetMacros` | `MacroTargets` | لا | مستهدفات الماكروز (اختياري) | كل حقل ≥ 0 |
| `unitSystem` | `enum` | لا | نظام القياس | `metric` \| `imperial` |
| `locale` | `enum` | لا | اللغة | `ar` \| `en` |

### 2.2 هيكل `FoodItem`

```typescript
interface FoodItem {
  id: string;
---

## 3. المخرجات الفعلية (Outputs)
---

## 3. المخرجات الفعلية (Outputs)

### 3.1 هيكل المخرجات الأساسية

```typescript
interface SubstitutionResult {
  // التكافؤ الكمي
  substituteQuantity: number;
  substituteUnit: string;
  equivalenceRatio: number;

  // مقارنة الماكروز
  originalMacros: MacroProfile;
  substituteMacros: MacroProfile;
  macroDeltas: MacroDeltas;

  // درجة التكافؤ
  equivalenceScore: number;
  equivalenceLevel: EquivalenceLevel;

  // فروقات تفصيلية
  calorieDifference: number;
  proteinDifference: number;
  carbsDifference: number;
  fatDifference: number;

  // تقييم الهدف (إذا توفر targetMacros)
  targetAdherence?: TargetAdherence;

  // تحذيرات وقيود
  warnings: Warning[];
  limitations: Limitation[];

  // بيانات تعريفية
  metadata: ResultMetadata;
}
```

### 3.2 درجة التكافؤ (`equivalenceScore`)

```typescript
type EquivalenceLevel =
  | 'excellent'    // 90-100
  | 'good'         // 75-89
  | 'fair'         // 60-74
  | 'poor'         // 40-59
  | 'unacceptable' // <40
```

### 3.3 هيكل `MacroDeltas`

```typescript
interface MacroDeltas {
  protein: number;
  carbs: number;
  fat: number;
  calories: number;
}
```

### 3.4 تقييم تحقيق المستهدفات (`TargetAdherence`)

```typescript
interface TargetAdherence {
  protein: AdherenceLevel;
  carbs: AdherenceLevel;
  fat: AdherenceLevel;
  calories: AdherenceLevel;
  overall: AdherenceLevel;
}

type AdherenceLevel =
  | 'on_target'      // ±5%
  | 'slightly_off'   // ±5-15%
  | 'moderately_off' // ±15-30%
  | 'significantly_off'; // >30%
```

### 3.5 التحذيرات والقيود

```typescript
type Warning =
  | { code: 'HIGH_SODIUM'; message: string }
  | { code: 'HIGH_SUGAR'; message: string }
  | { code: 'LOW_PROTEIN'; message: string }
  | { code: 'HIGH_CALORIE_DIFF'; message: string }
  | { code: 'MICRONUTRIENT_GAP'; message: string }
  | { code: 'ALLERGEN_RISK'; message: string; allergen: string }
  | { code: 'DATA_QUALITY_LOW'; message: string };

type Limitation =
  | { code: 'ESTIMATED_VALUES'; message: string }
  | { code: 'NO_MICRONUTRIENT_DATA'; message: string }
  | { code: 'SERVING_SIZE_ESTIMATE'; message: string }
  | { code: 'BRAND_VARIATION'; message: string };
```

### 3.6 البيانات الوصفية

```typescript
interface ResultMetadata {
  calculationTimestamp: string;
  engineVersion: string;
  dataSources: DataSource[];
  calculationTimeMs: number;
  unitSystem: UnitSystem;
  locale: Locale;
}
```

### 3.1 هيكل المخرجات الأساسية

```typescript
interface SubstitutionResult {
  // التكافؤ الكمي
  substituteQuantity: number;
  substituteUnit: string;
  equivalenceRatio: number;
  
  // مقارنة الماكروز
  originalMacros: MacroProfile;
  substituteMacros: MacroProfile;
  macroDeltas: MacroDeltas;
  
  // درجة التكافؤ
  equivalenceScore: number;
  equivalenceLevel: EquivalenceLevel;
  
  // فروقات تفصيلية
  calorieDifference: number;
  proteinDifference: number;
  carbsDifference: number;
  fatDifference: number;
  
  // تقييم الهدف (إذا توفر targetMacros)
  targetAdherence?: TargetAdherence;
  
  // تحذيرات وقيود
  warnings: Warning[];
  limitations: Limitation[];
  
  // بيانات تعريفية
  metadata: ResultMetadata;
}
```

### 3.2 درجة التكافؤ (`equivalenceScore`)

```typescript
type EquivalenceLevel = 
  | 'excellent'    // 90-100
  | 'good'         // 75-89
  | 'fair'         // 60-74
  | 'poor'         // 40-59
  | 'unacceptable' // <40
```

### 3.3 هيكل `MacroDeltas`

```typescript
interface MacroDeltas {
  protein: number;
  carbs: number;
  fat: number;
  calories: number;
}
```

### 3.4 تقييم تحقيق المستهدفات (`TargetAdherence`)

```typescript
interface TargetAdherence {
  protein: AdherenceLevel;
  carbs: AdherenceLevel;
  fat: AdherenceLevel;
  calories: AdherenceLevel;
  overall: AdherenceLevel;
}

type AdherenceLevel = 
  | 'on_target'      // ±5%
  | 'slightly_off'   // ±5-15%
  | 'moderately_off' // ±15-30%
  | 'significantly_off'; // >30%
```

### 3.5 التحذيرات والقيود

```typescript
type Warning = 
  | { code: 'HIGH_SODIUM'; message: string }
  | { code: 'HIGH_SUGAR'; message: string }
  | { code: 'LOW_PROTEIN'; message: string }
  | { code: 'HIGH_CALORIE_DIFF'; message: string }
  | { code: 'MICRONUTRIENT_GAP'; message: string }
  | { code: 'ALLERGEN_RISK'; message: string; allergen: string }
  | { code: 'DATA_QUALITY_LOW'; message: string };

type Limitation = 
  | { code: 'ESTIMATED_VALUES'; message: string }
  | { code: 'NO_MICRONUTRIENT_DATA'; message: string }
  | { code: 'SERVING_SIZE_ESTIMATE'; message: string }
  | { code: 'BRAND_VARIATION'; message: string };
```

### 3.6 البيانات الوصفية

```typescript
interface ResultMetadata {
  calculationTimestamp: string;
  engineVersion: string;
  dataSources: DataSource[];
  calculationTimeMs: number;
  unitSystem: UnitSystem;
  locale: Locale;
}
```
  name: string;
  nameEn: string;
  macrosPer100g: MacroProfile;
  servingSize?: number;
  servingUnit?: string;
  category: FoodCategory;
  aliases?: string[];
  dataSource: DataSource;
  dataQuality: DataQuality;
  lastUpdated: string;
}
```

### 2.3 هيكل `MacroProfile`

```typescript
interface MacroProfile {
  protein: number;
  carbs: number;
  fat: number;
  calories: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
}
```

### 2.5 قواعد التحقق من المدخلات

| القاعدة | السلوك عند الفشل |
|----------|------------------|
| `originalFood` و `substituteFood` مختلفان | خطأ: "لا يمكن استبدال الطعام بنفسه" |
| `originalQuantity` > 0 | خطأ: "الكمية يجب أن تكون أكبر من صفر" |
| `originalUnit` في الوحدات المدعومة | خطأ: "وحدة قياس غير مدعومة" |
| كلا الطعامين موجودان في قاعدة البيانات | خطأ: "طعام غير موجود في قاعدة البيانات" |
| كلا الطعامين لديهما بيانات مكروية كاملة | تحذير: "بيانات مكروية ناقصة - النتائج تقديرية" |
---

## 4. المعادلات والقواعد (Formulas & Rules)

### 4.1 حساب التكافؤ المكروي (Core Equivalence Calculation)

**المبدأ الأساسي**: التكافؤ يتم تحقيقه عندما تتطابق الماكروز (بروتين، كربوهيدرات، دهون) قدر الإمكان.

**الخطوة 1: حساب ماكروز الكمية الأصلية**
```
originalMacros = {
  protein: food1.macrosPer100g.protein * (quantity1 / 100),
  carbs:   food1.macrosPer100g.carbs   * (quantity1 / 100),
  fat:     food1.macrosPer100g.fat     * (quantity1 / 100),
  calories: food1.macrosPer100g.calories * (quantity1 / 100)
}
```

**الخطوة 2: حساب الكمية المكافئة للبديل**
```
لكل ماكرو (بروتين، كربوهيدرات، دهون):
  requiredQty = originalMacros[macro] / (food2.macrosPer100g[macro] / 100)

quantityFromProtein = originalMacros.protein / (food2.protein / 100)
quantityFromCarbs   = originalMacros.carbs   / (food2.carbs   / 100)
quantityFromFat     = originalMacros.fat     / (food2.fat     / 100)
```

**الخطوة 3: اختيار الكمية المثلى**
```
استراتيجية: تقليل متوسط الفرق النسبي الموزون
weights = { protein: 0.4, carbs: 0.3, fat: 0.3 }

bestQuantity = argmin(Σ weight_i * |macro_i(subQty) - target_i| / target_i)
```

**طريقة بديلة (فولاذية)**: استخدام الماكرو الذي لا يساوي صفراً في البديل
```
validMacros = macros where food2.macros[macro] > 0
إذا كانت فارغة: إرجاع خطأ "لا يمكن تحقيق تكافؤ"
إلا: حساب الكمية لكل ماكرو صحيح، أخذ المتوسط الموزون
```

### 4.2 حساب السعرات الحرارية

```
calories = protein * 4 + carbs * 4 + fat * 9
```

### 4.3 حساب درجة التكافؤ (Equivalence Score)

```
لكل ماكرو i ∈ {protein, carbs, fat}:
  إذا كان target_i = 0:
    score_i = 100 إذا كان actual_i = 0، وإلا 0
  غير ذلك:
    relativeError = |actual_i - target_i| / target_i
    score_i = max(0, 100 * (1 - relativeError))

equivalenceScore = Σ(weight_i * score_i)
```

### 4.4 التعامل مع البيانات الناقصة

| الحالة | السلوك |
|----------|---------|
| ماكرو مفقود في الطعام الأصلي | افتراض 0، إضافة تحذير `MISSING_MACRO_DATA` |
| ماكرو مفقود في البديل | لا يمكن تحقيق تكافؤ لهذا الماكرو، استبعاد من الحساب، إضافة تحذير |
| جميع الماكروز مفقودة في البديل | خطأ: "لا يمكن حساب تكافؤ - بيانات مكروية معدومة" |
| سعرات مفقودة فقط | حساب من الماكروز (4/4/9) |

### 4.5 التعامل مع القيم الحدية

| الحالة | السلوك |
|----------|---------|
| كمية = 0 | خطأ: "الكمية يجب أن تكون > 0" |
| كمية سالبة | خطأ: "الكمية لا يمكن أن تكون سالبة" |
| كمية > 10,000 وحدة | تحذير: "كمية كبيرة جداً - تحقق من المدخلات" |
| ماكرو = 0 في البديل | لا يمكن التكافؤ لهذا الماكرو، استبعاد من الحساب |
| جميع الماكروز = 0 في البديل | خطأ: "البديل لا يحتوي على مكروبات" |

### 4.6 دالة التكافؤ لكل ماكرو

```
equivalence(macro) = 1 - min(1, |substitute_macro - target_macro| / max(target_macro, 1))
```

---

## 5. نظام القياس (Unit System)

### 5.1 الوحدات المدعومة

| الفئة | Metric | Imperial |
|-------|--------|----------|
| **الكتلة** | `g`, `kg` | `oz`, `lb` |
| **الحجم** | `ml`, `l` | `fl_oz`, `cup`, `tbsp`, `tsp` |
| **القطع** | `piece`, `slice` | `piece`, `slice` |

### 5.2 التحويلات (Canonical = Metric)

| التحويل | الصيغة | الدقة |
|----------|--------|-------|
| `g → oz` | `g / 28.349523125` | 6dp |
| `oz → g` | `oz * 28.349523125` | 1dp |
| `kg → lb` | `kg * 2.20462` | 0dp |
| `lb → kg` | `lb / 2.20462` | 1dp |
| `ml → fl_oz` | `ml / 29.5735` | 2dp |
| `cup → ml` | `cup * 236.588` | 0dp |

### 5.3 دقة العرض والتقريب

| نوع القيمة | Metric | Imperial |
|------------|--------|----------|
| الكتلة (g/mg) | عدد صحيح | 1dp (oz) / 0dp (lb) |
| الحجم (ml) | عدد صحيح | 1dp (fl_oz) / 2dp (cup) |
| الماكروز (جرام) | 1dp | 1dp |
| السعرات | عدد صحيح | عدد صحيح |
| النسب المئوية | 1dp | 1dp |

### 5.4 سلوك التبديل

- **القانوني (Canonical)**: جميع الحسابات تتم بـ Metric (g, ml)
- **العرض**: يتحول حسب `unitSystem` الحالي
- **التحرير**: في Imperial → يكتب Metric canonical
- **التكرار M→I→M**: لا drift (دقة ±0.5mg / ±0.1oz)
- **الحفظ**: مفتاح `measurementSystem` في localStorage

---

## 6. الترجمة و RTL/LTR

### 6.1 المفاتيح المطلوبة (i18n Keys)

```json
{
  "en": {
    "tool_name": "Smart Food & Macro Substitution Engine",
    "original_food": "Original Food",
    "substitute_food": "Substitute Food",
    "quantity": "Quantity",
    "unit": "Unit",
    "substitute_quantity": "Substitute Quantity",
    "equivalence_score": "Equivalence Score",
    "equivalence_level": "Equivalence Level",
    "macro_comparison": "Macro Comparison",
    "protein": "Protein",
    "carbs": "Carbohydrates",
    "fat": "Fat",
    "calories": "Calories",
    "difference": "Difference",
    "equivalence": "Equivalence",
    "excellent": "Excellent",
    "good": "Good",
    "fair": "Fair",
    "poor": "Poor",
    "unacceptable": "Unacceptable",
    "warnings": "Warnings",
    "limitations": "Limitations",
    "select_food": "Select Food",
    "search_placeholder": "Search foods...",
    "no_data": "No macro data available",
    "insufficient_data": "Insufficient macro data for calculation",
    "cannot_substitute_self": "Cannot substitute food with itself",
    "invalid_quantity": "Quantity must be greater than zero",
    "unit_system": "Measurement System",
    "metric": "Metric (g/ml)",
    "imperial": "Imperial (oz/lb/cup)",
    "calculate": "Calculate Substitution",
    "results": "Results",
    "original_macros": "Original Macros",
    "substitute_macros": "Substitute Macros",
    "difference": "Difference",
    "equivalence_score": "Equivalence Score",
    "equivalence_level": "Equivalence Level",
    "excellent_level": "Excellent",
    "good_level": "Good",
    "fair_level": "Fair",
    "poor_level": "Poor",
    "unacceptable_level": "Unacceptable",
    "disclaimer": "Results are estimates based on macro averages. Not medical advice."
  },
  "ar": {
    "tool_name": "محرك استبدال الأطعمة الذكي",
    "original_food": "الطعام الأصلي",
    "substitute_food": "الطعام البديل",
    "quantity": "الكمية",
    "unit": "الوحدة",
    "substitute_quantity": "الكمية البديلة",
    "equivalence_score": "درجة التكافؤ",
    "equivalence_level": "مستوى التكافؤ",
    "macro_comparison": "مقارنة الماكروز",
    "protein": "بروتين",
    "carbs": "كربوهيدرات",
    "fat": "دهون",
    "calories": "سعرات حرارية",
    "difference": "الفرق",
    "equivalence": "التكافؤ",
    "excellent": "ممتاز",
    "good": "جيد",
    "fair": "مقبول",
    "poor": "ضعيف",
    "unacceptable": "غير مقبول",
    "warnings": "تحذيرات",
    "limitations": "قيود",
    "select_food": "اختر الطعام",
    "search_placeholder": "ابحث عن طعام...",
    "no_data": "لا توجد بيانات مكروية",
    "insufficient_data": "بيانات مكروية غير كافية للحساب",
    "cannot_substitute_self": "لا يمكن استبدال الطعام بنفسه",
    "invalid_quantity": "يجب أن تكون الكمية أكبر من صفر",
    "unit_system": "نظام القياس",
    "metric": "متري (جم/مل)",
    "imperial": "إمبراطوري (أونصة/رطل/كوب)",
    "calculate": "حساب الاستبدال",
    "results": "النتائج",
    "original_macros": "ماكروز الأصلي",
    "substitute_macros": "ماكروز البديل",
    "difference": "الفرق",
    "equivalence_score": "درجة التكافؤ",
    "equivalence_level": "مستوى التكافؤ",
    "excellent_level": "ممتاز",
    "good_level": "جيد",
    "fair_level": "مقبول",
    "poor_level": "ضعيف",
    "unacceptable_level": "غير مقبول",
    "disclaimer": "النتائج تقديرات مبنية على متوسطات مكروية. ليست نصيحة طبية."
  }
}
```

### 6.2 سلوك RTL/LTR

- **العربية**: `dir="rtl"`، النصوص تتم محاذاتها لليمين
- **الإنجليزية**: `dir="ltr"`، النصوص تتم محاذاتها لليسار
- **الأرقام**: تظل LTR في الحالتين
- **الاتجاه**: يتغير فوراً عند تبديل اللغة بدون إعادة تحميل

---

## 7. AI Design (DESIGN_ONLY)

### 7.1 الحالة الحالية

```
AI Status: NOT_CONFIGURED / DESIGN_ONLY
OPENAI_API_KEY: غير موجود
AI Integration: غير مفعلة
```

### 7.2 عقد AI المستقبلي (للتصميم فقط)

```typescript
interface AIRequest {
  engineResult: SubstitutionResult;
  userContext?: {
    dietaryGoal?: 'weight_loss' | 'muscle_gain' | 'maintenance';
    dietaryRestrictions?: string[];
  };
  requestType: 'explain' | 'alternatives' | 'nutrition_advice';
  locale: 'ar' | 'en';
}

interface AIResponse {
  explanation: string;
  alternatives: FoodAlternative[];
  tips: string[];
  disclaimer: string;
  confidence: 'high' | 'medium' | 'low';
}

interface FoodAlternative {
  foodId: string;
  name: { en: string; ar: string };
  equivalenceScore: number;
  reason: string;
}
```

### 7.3 قيود AI (Security Constraints)

| القيود | التفاصيل |
|----------|----------|
| لا مفاتيح في كود العميل | `OPENAI_API_KEY` في متغيرات بيئة الخادم فقط |
| لا تشخيص طبي | `disclaimer` إلزامي في كل رد |
| لا جرعات شخصية | AI لا يقترح كميات مطلقة |
| لا بروتوكولات غير آمنة | رفض طلبات "نظام غذائي كامل" |
| لا تعديل للمدخلات | AI يقرأ فقط، لا يكتب |
| لا حفظ بيانات | Zero persistence |

### 7.4 حالة AI الحالية

```
AI Status: NOT_CONFIGURED / DESIGN_ONLY
Engine Works Without AI: ✅ YES
```

---

## 8. الاختبارات المطلوبة

### 8.1 حالات مرجعية (Reference Cases)

| حالة الاختبار | المدخلات | المخرجات المتوقعة |
|--------------|----------|------------------|
| **تكافؤ تام** | صدر دجاج 100جم ↔ صدر ديك رومي 100جم | `equivalenceScore ≈ 100` |
| **بروتين أعلى** | صدر دجاج 100جم ↔ تونة 100جم | بروتين أعلى، سعرات أقل |
| **كربوهيدرات أعلى** | أرز أبيض 100جم ↔ بطاطا 100جم | كربوهيدرات متشابهة، بروتين أقل |
| **دهون أعلى** | لحم بقري 20% دهن 100جم ↔ لحم 5% دهن | دهون أقل، بروتين أعلى |

### 8.2 حدود القيم (Boundary Tests)

| الاختبار | المدخلات | السلوك المتوقع |
|----------|----------|----------------|
| كمية صفرية | `quantity: 0` | خطأ: "Quantity must be > 0" |
| كمية سالبة | `-100` | خطأ: "Quantity must be > 0" |
| كمية ضخمة | `100000` | تحذير + حساب صحيح |
| ماكرو مفقود | طعام بلا بروتين | تحذير + استبعاد من الحساب |
| طعام غير موجود | `foodId: "invalid"` | خطأ: "Food not found" |
| نفس الطعام | نفس ID | خطأ: "Cannot substitute with itself" |

### 8.3 تحويلات Metric/Imperial

| الاختبار | المدخلات | المتوقع |
|----------|----------|---------|
| mg ↔ oz ذهاباً وإياباً | 300mg → oz → mg | انحراف ≤ 0.5mg |
| kg ↔ lbs ذهاباً وإياباً | 85kg → lbs → kg | انحراف ≤ 0.1kg |
| تبديل متكرر | M→I→M→I→M (5 مرات) | القيمة الأصلية محفوظة |
| قيم صفرية | 0g → 0oz | لا NaN |

### 8.4 منع NaN/Infinity/ القسمة على صفر

| السيناريو | الحماية |
|------------|---------|
| قسمة على صفر في المكروبات | فحص `macro > 0` قبل القسمة |
| `NaN` مدخلات | تحقق `Number.isFinite()` |
| `Infinity` مدخلات | clamping إلى الحدود |
| قيم سالبة | `Math.max(0, value)` |

### 8.5 اختبارات الترجمة و RTL/LTR

| الاختبار | الوصف |
|----------|---------|
| تبديل اللغة | لا فقدان للمدخلات/النتائج |
| اتجاه RTL | `dir="rtl"` للعربية |
| اتجاه LTR | `dir="ltr"` للإنجليزية |
| الأرقام | LTR في الحالتين |
| لا نصوص ثابتة | جميع النصوص من ملفات i18n |

### 8.5 اختبارات السلامة

| الاختبار | الوصف |
|----------|---------|
| لا تشخيص طبي | وجود disclaimer في كل نتيجة |
| لا جرعات شخصية | لا اقتراح كميات مطلقة كعلاج |
| لا بروتوكولات غير آمنة | رفض طلبات "حمية كاملة" |
| إخلاء المسؤولية | موجود في كل نتيجة |

---

## 9. قيود السلامة (Safety Constraints)

| القيد | التنفيذ |
|--------|---------|
| **لا تشخيص طبي** | Disclaimer إلزامي في كل نتيجة |
| **لا جرعات شخصية** | المحرك يحسب تكافؤ مكروي فقط، لا يصف كميات مطلقة |
| **لا بروتوكولات تعاطٍ غير آمنة** | رفض طلبات "حمية كاملة" أو "خطة غذائية كاملة" |
| **تقديرات فقط** | توضيح أن النتائج تقديرات حسابية، ليست قياسات مخبرية |
| **تنوع البيانات** | تحذير عند استخدام بيانات علامة تجارية واحدة فقط |
| **الاختلافات الفردية** | تنبيه: "الاحتياجات الفعلية تختلف حسب الفرد" |

---

## 10. مواصفات قاعدة بيانات الأطعمة (Food Database)

### 10.1 الحد الأدنى المطلوب للتشغيل

| الحقل | مطلوب | ملاحظات |
|-------|-------|---------|
| `id` | نعم | UUID أو slug فريد |
| `name` | نعم | بالعربية |
| `nameEn` | نعم | بالإنجليزية |
| `macrosPer100g` | نعم | بروتين، كربوهيدرات، دهون، سعرات |
| `category` | نعم | للتصفية والبحث |
| `dataSource` | نعم | `USDA`, `brand`, `manufacturer`, `estimated` |
| `dataQuality` | نعم | `high`, `medium`, `low` |
| `servingSize` | لا | جرام |
| `servingUnit` | لا | `g`, `ml`, `piece` |
| `aliases` | لا | للبحث المحسن |
| `micronutrients` | لا | للاصدار المستقبلي |

### 10.2 فئات الطعام المدعومة

```
PROTEIN, CARBS, FAT, DAIRY, VEGETABLE, FRUIT, GRAIN, LEGUME,
NUT_SEED, MEAT, POULTRY, FISH, EGG, PROCESSED, SUPPLEMENT, OTHER
```

---

## 11. حالات الحافة والسيناريوهات المعقدة

| السيناريو | السلوك المتوقع |
|----------|----------------|
| بديل يفتقر لماكرو موجود في الأصلي | استبعاد ذلك الماكرو من حساب التكافؤ، إضافة تحذير |
| بديل أعلى سعرات لكن نفس البروتين | `equivalenceScore` يعكس الفرق، تحذير فرق السعرات |
| بديل خالي من دهون (0 fat) | لا يمكن تكافؤ الدهون، استبعاد من الحساب |
| طعامان متطابقان مكروياً | `equivalenceScore = 100` |
| بديل بدون سعرات مسجلة | حساب السعرات من الماكروز (4/4/9) |
| كمية > 10kg | تحذير + حساب صحيح |

---

## 12. مخطط التنفيذ المقترح (Phased)

| المرحلة | المهام |
|---------|--------|
| **المرحلة 1: المحرك النقي** | دالة `calculateSubstitution`, دوال مساعدة، اختبارات وحدة |
| **المرحلة 2: Schema & Validation** | Zod schema, `createToolSchema`, اختبارات |
| **المرحلة 3: Adapter & Persistence** | `ToolAdapter`, `useToolState`, auto-draft |
| **المرحلة 4: المكون والواجهة** | مكون React، `useToolI18n`, `MeasurementToggle` |
| **المرحلة 5: الترجمة** | ملف i18n، مراجعة عربية |
| **المرحلة 6: الاختبارات والتكامل** | اختبارات المحرك، DOM، Metric/Imperial، RTL/LTR، CI |

---

## 13. معايير القبول (Acceptance Criteria)

| المعيار | العتبة |
|----------|--------|
| اختبارات المحرك | ≥ 20 حالة، 100% pass |
| اختبارات DOM/UI | ≥ 10 سيناريوهات، 100% pass |
| TypeScript | 0 errors |
| ESLint | 0 errors (warnings مسموحة للـ `any` الضروري) |
| validate-tools | 5/5 PASS |
| Metric/Imperial round-trip | انحراف ≤ 0.5mg / ≤ 0.1kg |
| RTL/LTR | يعملان بدون فقدان بيانات |
| NaN/Infinity | 0 cases في جميع الاختبارات |
| التوثيق | جميع المعادلات موثقة في هذا المستند |

---

## 14. ملخص التصميم للمراجعة

| المكون | الحالة | ملاحظات |
|---------|--------|---------|
| **Engine Design** | ✅ مكتمل | المعادلات والقواعد موثقة بالتفصيل |
| **Input/Output Contracts** | ✅ مكتملة | TypeScript interfaces محددة |
| **Unit System** | ✅ مكتمل | تحويلات ثنائية الاتجاه، دقة محددة |
| **i18n/RTL** | ✅ مكتمل | مفاتيح AR/EN، RTL/LTR |
| **AI Design** | ✅ موثق | DESIGN_ONLY، NOT_CONFIGURED |
| **Safety** | ✅ موثق | Constraints موثقة |
| **Tests Spec** | ✅ موثقة | 7 فئات اختبارات |
| **Safety Constraints** | ✅ موثقة | No medical advice, no personal doses |

---

## 15. طلب الموافقة

> **هذا المستند جاهز للمراجعة. يرجى مراجعة المعادلات والقواعد والمدخلات والمخرجات والاختبارات المطلوبة. عند الموافقة، ننتقل إلى مرحلة التنفيذ (المحرك → Schema → Adapter → Component → i18n → Tests → CI).**

---

**الخطوة التالية عند الموافقة**: تنفيذ المحرك النقي (`lib/tools/engines/tool-111-smart-food-macro-substitution-engine.ts`) مع اختبارات الوحدة المقابلة.
```
