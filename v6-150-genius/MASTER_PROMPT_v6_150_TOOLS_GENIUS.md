
# MASTER PROMPT v6 - 150 أداة متكاملة - التطوير العبقري الشامل
# Tailored for E:\MrXSteroid-main - 150 Tools Genius Upgrade

## الاعتراف والتصحيح:

أنا ركزت على 11 أداة فقط (126-136) Batch C بينما مشروعك الحقيقي 150 أداة متكاملة معظمها منتهي لكن بدون تطوير شامل.

هذا البرومبت v6 هو **التطوير العبقري الشامل لكل 150 أداة**.

## تحليل المشروع الفعلي - 150 أداة

**GitHub:** https://github.com/joojoo1976/MrXSteroid - 603 commits
**Local:** E:\MrXSteroid-main
**Stack:** React 19 + TypeScript + Vite + Tailwind + Supabase + i18n + context/PreferencesContext
**Inventory:** SMARTTOOLS_TOOL_ID_INVENTORY.json يحتوي 150 أداة (1-150)
**Spec:** SMARTTOOLS_SPEC.md يحتوي مواصفات
**Supabase:** schema.sql + migrations - يحتاج فحص فعلي عبر SQL Editor

### التقسيم الحقيقي 150 أداة:

1-25: Body Composition (Body Fat, BMR, TDEE, FFMI...)
26-50: Nutrition (Calories, Macros, Carb Cycling...)
51-85: Training & Recovery (Volume, RPE, ACWR, HRV...)
86-115: Strength & Performance (1RM, Wilks, Power, VO2max...)
116-136: Physique (Golden Ratio, 11 أداة جديدة Batch C)
137-150: Health & Hormones (Testosterone, Estradiol, PCT...)

**الحالة:** 1-125 منتهي لكن بدون تطوير فائق، 126-150 جديد يحتاج بناء بنفس مستوى التطور العبقري ونفس هيكلية DB الحالية

## المطلوب في v6 - لكل 150 أداة:

### 1. Math Engine موثق (لكل 150)
- معادلة + مصدر علمي (أو "قاعدة تقديرية")
- متغيرات بحدود (min/max)
- معالجة صفر/سالب/NaN/Infinity/شاذ
- وحدة مرجعية metric داخليا - تحويل مرة واحدة فقط - منع Double Conversion
- اختبارات: مرجعي، حد أدنى، حد أقصى، صفر، سالب، ناقص، متناقض، تحويل، ديناميكي، ثبات، حساسية، أمان

### 2. Super Intelligence Layer (لكل 150) - هذا هو التطوير الشامل

**Brain Type حسب الفئة:**
- 1-25 Body Comp: diagnostic + comparative
- 26-50 Nutrition: generative + adaptive
- 51-85 Training: predictive + generative
- 86-115 Strength: diagnostic + predictive
- 116-136 Physique: comparative + aesthetic
- 137-150 Health: diagnostic + safety (لا تشخيص طبي، استخدم "احتمال")

**لكل أداة:**
- identity فريدة (مثلا "مختبر انفجاري" لـ #126)
- confidence 0-100
- reasoning: Top3 عوامل + steps
- scenarios: متفائل/واقعي/متحفظ
- whatIf: Slider يحسب مستقبل
- warnings: يكتشف تناقض
- nextActions: ماذا أفعل الآن
- crossToolLinks: أدوات مرتبطة
- adaptiveWeights: تتعلم من المستخدم
- Future: mlInsights, visionInsights, voiceInsights, communityIntel

### 3. Cross-Tool Graph - الشبكة العصبية لكل 150

أهم جزء - 150 أداة تتكلم بعض:

- Body Fat (1) → TDEE (19) → Calorie (26) → Forecast (131) → Proportion (136)
- Training Volume (51) → ACWR (75) → Readiness (127) → Decision
- Mobility (81) + Symmetry (82) + Pose (132) → Injury Risk (83)
- Strength (86) + Power (93) → Neuromuscular (126) → Plyo Program (129)
- Health Markers (137-150) → لا تربط مباشرة مع Training بدون تحذير أمان

Freshness:
- Body Fat: 7 أيام
- Sleep/HRV: 24 ساعة
- Training Load: 7 أيام
- Health Labs: 30-90 يوم

Event Bus: mrx_tool_result_updated

لا تطلب قياس أدخل قبل <max_age

### 4. Dynamic Results - لكل 150

7 قواعد ذهبية:
1. No Static Defaults - Empty State + CTA واضح
2. Live Recalculation - أي تغيير = إعادة حساب + رسم + أدوات مرتبطة فورا
3. Progressive Disclosure - بسيط → معقد
4. What-If Engine - "ماذا لو...؟"
5. Temporal Awareness - يفهم الزمن
6. Contradiction Detection - وزن 70 + دهون 5% + عضل ضعيف = تنبيه
7. Empty→Partial→Full

Future:
- 3D Body Map لـ Mobility
- VBT Chart لـ Strength
- What-If Simulator لـ ACWR
- Voice Input
- Video Analysis

### 5. Supabase Schema - نفس هيكليتك الحالية + تطوير

**الحالي عندك (من GitHub):**
- profiles
- subscriptions
- payments
- user_history
- contact_messages

**المطلوب v6 (نفس الهيكلية + تطوير):**

```sql
-- user_tool_states - حالة كل أداة لكل مستخدم (150 أداة)
CREATE TABLE user_tool_states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users,
  tool_id TEXT, -- 'body-fat-calculator' أو 'neuromuscular-performance'
  tool_number INT, -- 1-150
  inputs JSONB,
  outputs JSONB,
  units TEXT, -- metric/imperial
  language TEXT, -- ar/en
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, tool_id)
);

-- ai_user_profiles - للـ AI التكيفي لكل 150 أداة
CREATE TABLE ai_user_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users,
  adaptive_weights JSONB, -- { "sleepHours": 0.25, ... } تتعلم
  learning_history JSONB, -- feedback
  preferences JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- tool_usage_analytics - تتبع استخدام 150 أداة
CREATE TABLE tool_usage_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  tool_id TEXT,
  tool_number INT,
  action TEXT, -- calculate, view, feedback
  inputs_hash TEXT,
  duration_ms INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- user_body_measurements - history لكل قياسات الجسم (للـ Cross-Tool)
CREATE TABLE user_body_measurements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  measurement_type TEXT, -- weight, body_fat, muscle_mass...
  value FLOAT,
  unit TEXT,
  measured_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: كل مستخدم يشوف بياناته فقط
```

**مهم:** افحص Supabase Dashboard → SQL Editor → SELECT * FROM user_tool_states LIMIT 1 - شوف الهيكلية الحالية فعليا

### 6. Per-Tool AI Prompts - 150 برومبت مختلف

ليس نفس البرومبت لكل أداة - كل أداة لها:

```ts
{
  'body-fat-calculator': {
    system: 'أنت خبير تركيب جسم...',
    reasoning: 'فكر: إذا دهون منخفضة لكن عضل قليل...',
    explain: 'اشرح ماذا تعني النسبة...'
  },
  'neuromuscular-performance': {
    system: 'أنت محلل أداء عصبي عضلي...',
    ...
  },
  // 148 برومبت آخر...
}
```

### 7. Future Integration - لكل 150 أداة

- ML: Random Forest (تصنيف), LSTM (تنبؤ HRV), Logistic Regression (خطر إصابة)
- Vision: MediaPipe Pose (تحليل فورم), Equipment Scanner (تعرف معدات)
- Voice: Whisper (إدخال صوتي)
- LLM: Program Generator, Narrative Generator
- Advanced: Kalman Filter (تصحيح توقعات), Monte Carlo 1000 (uncertainty), VBT, 3D Body Map
- Community: Similar users success rate + Federated Learning (خصوصية)

## خطة التنفيذ لـ 150 أداة - 7 أسابيع

**أسبوع 1: Audit & Foundation**
- افحص SMARTTOOLS_TOOL_ID_INVENTORY.json - هل فيه 150 entry؟
- افحص supabase/schema.sql فعليا عبر SQL Editor
- ابنِ Core Framework v6: ai-orchestrator.v6.ts, equation-validator.v6.ts, cross-tool-graph.v6.ts مع دعم 150 أداة

**أسبوع 2-4: Batch Upgrade - ترقية 125 أداة موجودة**
- Batch A 1-25 Body Comp: أضف Super Intelligence + Cross-Tool + Dynamic Results
- Batch B 26-50 Nutrition: نفس
- Batch C 51-85 Training: نفس + 75-85 Recovery
- Batch D 86-115 Strength: نفس
- Batch E 116-125 Physique القديم: نفس
- لكل أداة: 12 اختبار + AI Prompt مختلف

**أسبوع 5: بناء 25 أداة جديدة 126-150 بنفس مستوى التطور العبقري**
- 126-136: 11 أداة Batch C (Neuromuscular, Readiness, ACWR, Planner, Plateau, Forecast, Pose, Velocity, Mobility, Substitution, Proportion)
- 137-150: 14 أداة Health & Hormones (Test, Free Test, SHBG, Estradiol, Prolactin, Hematocrit, BP, Lipids, Liver, Kidney, Thyroid, Insulin, Aromatization, PCT)
- كل أداة جديدة بنفس هيكلية DB الحالية + نفس مستوى التطور العبقري

**أسبوع 6: Future Integration**
- ML Models, Vision, Voice, LLM Generators, VBT, 3D Body Map

**أسبوع 7: Testing & Deployment**
- اختبار كل 150 أداة: Live Recalculation, Cross-Tool, Freshness, What-If, Safety (للـ Health)
- npm run validate-tools -- --all-150
- Deploy Vercel

## كيف تبدأ من الملف المضغوط v6 الجديد؟

1. فك الضغط في E:\temp\v6-150-genius
2. اقرأ SMARTTOOLS_150_COMPLETE_INVENTORY.md - الجرد الكامل
3. اقرأ UPGRADE_FRAMEWORK_FOR_ALL_150_TOOLS.md - إطار الترقية
4. شغل node scripts/upgrade-all-150.js --dry-run
5. شغل node scripts/upgrade-all-150.js --apply
6. افحص Supabase: SELECT * FROM user_tool_states LIMIT 1
7. npm run dev + اختبار

## معايير القبول v6 - لكل 150 أداة

- Math Engine موثق + 12 اختبار
- Super Intelligence Layer مع Brain Type مناسب
- Cross-Tool Links تعمل مع Freshness
- Dynamic Results مع 7 قواعد ذهبية
- AI Prompt مختلف لكل أداة
- Language & Units متزامنة
- Empty/Partial/Full
- Safety: للـ 137-150 لا تشخيص طبي
- Explainable: المستخدم يفهم لماذا

## الفرق v5 vs v6

v5: 11 أداة Batch C مع Future
v6: 150 أداة كاملة (125 ترقية + 25 جديدة) بنفس مستوى التطور العبقري + نفس هيكلية DB + Framework شامل

هذا هو التطوير العبقري الشامل الذي طلبته.

