
# إطار عمل ترقية 150 أداة لـ v6 Genius - Framework

## المشكلة التي اكتشفتها (أعتذر):

أنا ركزت على 11 أداة فقط (126-136) Batch C بينما مشروعك الحقيقي 150 أداة متكاملة معظمها منتهي لكن بدون تطوري الشامل.

هذا هو الإطار الشامل لترقية كل الـ 150 أداة.

## المعمارية الموحدة لكل 150 أداة - v6 Genius

كل أداة من الـ 150 يجب أن تحتوي:

### 1. Math Engine موثق (موجود في معظم أدواتك الحالية لكن يحتاج توثيق)
```ts
interface ToolEngine {
  id: string; // مثل body-fat-calculator
  number: number; // 1-150
  equations: { formula: string; source: string; assumptions: string[] }[];
  inputs: { name: string; unit: string; type: string; min: number; max: number; required: boolean }[];
  outputs: { name: string; unit: string; description: { ar: string; en: string } }[];
  calculate: (inputs: any) => any; // المحرك الحقيقي
}
```

### 2. Super Intelligence Layer (هذا هو التطوير الشامل الجديد)

لكل أداة من الـ 150:

**Brain Type حسب الفئة:**
- Body Composition (1-25): diagnostic + comparative
- Nutrition (26-50): generative + adaptive
- Training (51-85): predictive + generative
- Strength (86-115): diagnostic + predictive
- Physique (116-136): comparative + aesthetic
- Health (137-150): diagnostic + safety-focused (لا تشخيص طبي)

**AI Layer:**
```ts
interface SuperAILayer {
  identity: { ar: string; en: string }; // هوية فريدة
  brainType: 'predictive' | 'diagnostic' | 'generative' | 'comparative' | 'adaptive';
  crossToolLinks: string[]; // أدوات مرتبطة
  confidence: (inputs: any, result: any) => number; // 0-100
  reasoning: (inputs: any, result: any) => { factors: any[]; steps: string[] };
  scenarios: (inputs: any) => { optimistic: any; realistic: any; conservative: any };
  whatIf: (inputs: any, change: any) => any; // What-If Simulator
  warnings: (inputs: any, result: any) => { type: string; message: any }[];
  nextActions: (result: any) => any[];
  // Future v6
  mlInsights?: any; // Random Forest, LSTM, Logistic Regression
  visionInsights?: any; // MediaPipe
  voiceInsights?: any;
  communityIntel?: any;
}
```

### 3. Cross-Tool Graph لكل 150 أداة

هذا هو الأهم - الشبكة العصبية:

```
Body Fat (1) → يدخل تلقائيا في:
- TDEE (19)
- FFMI (4)
- Transformation Forecast (131)
- Physique Proportion (136)
- Calorie Calculator (26)

TDEE (19) → يدخل في:
- Calorie Calculator (26)
- Macro Split (27)
- Transformation Forecast (131)

Training Volume (51) → يدخل في:
- ACWR (75)
- Recovery Time (72)
- Plateau Detective (130)

ACWR (75) + Readiness (127) + HRV → قرار تدريب

Mobility (81) + Symmetry (82) + Pose Coach (132) → Injury Risk (83)

و 145 رابط آخر...
```

**Freshness System لكل رابط:**
- fresh: ≤max_age (مثلا Body Fat 7 أيام، Sleep 24 ساعة)
- stale: >max_age → "بيانات قديمة منذ X أيام - حدثها؟"
- invalid/future → ارفض

**Event Bus:**
```ts
window.dispatchEvent(new CustomEvent('mrx_tool_result_updated', { detail: { sourceTool, data } }))
// كل أداة مهتمة تحدث نفسها تلقائيا
```

### 4. Dynamic Results لكل 150 أداة

7 قواعد ذهبية + Future:

1. No Static Defaults - Empty State + CTA
2. Live Recalculation - أي تغيير = إعادة حساب + رسم + أدوات مرتبطة فورا
3. Progressive Disclosure - بسيط → معقد تدريجيا
4. What-If Engine - Slider "ماذا لو...؟"
5. Temporal Awareness - يفهم الزمن
6. Contradiction Detection - يكتشف تناقض
7. Empty→Partial→Full

Future:
- 3D Body Map (للـ Mobility)
- VBT Chart (للـ Strength)
- What-If Simulator (للـ ACWR)
- Voice Input
- Video Analysis Live

### 5. Supabase Schema الحالي vs المطلوب

**الحالي (من فحص GitHub):**
- profiles
- subscriptions
- payments
- user_history
- contact_messages

**المطلوب v6 (نفس الهيكلية الحالية + تطوير):**
- user_tool_states: (user_id, tool_id) UNIQUE + JSONB + RLS - موجود عندك؟ يحتاج تطوير
- user_preferences: language, measurement_system - موجود في context/PreferencesContext
- tool_usage_analytics: action, inputs_hash, duration_ms - جديد
- tool_ratings: rating, feedback - جديد
- ai_user_profiles: adaptive_weights, learning_history - جديد للـ AI التكيفي
- user_body_measurements: history لكل قياسات الجسم - للـ 150 أداة
- user_training_logs: history تمارين - للـ Cross-Tool
- user_nutrition_logs: history تغذية
- user_health_markers: history تحاليل (للـ 137-150) - مع تشفير

**RLS:** كل مستخدم يشوف بياناته فقط

## خطة الترقية لـ 150 أداة - 4 مراحل

### المرحلة 1: Audit & Foundation (أسبوع 1)
- افحص كل 150 أداة حالية: ما المعادلات المستخدمة؟ هل موثقة؟ هل فيه Double Conversion؟
- افحص Supabase schema الحالي فعليا (عبر SQL Editor)
- افحص SMARTTOOLS_TOOL_ID_INVENTORY.json - هل فيه 150 entry؟
- ابنِ Core Framework: ai-orchestrator.v6.ts, equation-validator.v6.ts, cross-tool-graph.v6.ts
- حدث Registry ليشمل 150 أداة مع SuperAIConfig

### المرحلة 2: Batch Upgrade (أسبوع 2-4)
قسم الـ 150 لـ 6 Batches:
- Batch A: 1-25 Body Comp (أسبوع)
- Batch B: 26-50 Nutrition (أسبوع)
- Batch C: 51-85 Training (أسبوع) - جزء منه 126-136 الجديد
- Batch D: 86-115 Strength (أسبوع)
- Batch E: 116-136 Physique (أسبوع)
- Batch F: 137-150 Health (أسبوع) - حساس، بدون تشخيص طبي

لكل Batch:
- أضف Super Intelligence Layer
- أضف Cross-Tool Links
- أضف Dynamic Results + What-If
- أضف 12 اختبار
- أضف AI Prompts مختلفة لكل أداة

### المرحلة 3: Future Integration (أسبوع 5-6)
- ML Models: Random Forest, LSTM, Logistic Regression
- Vision: MediaPipe Pose
- Voice: Whisper
- LLM Generators: Program + Narrative
- VBT, 3D Body Map, Kalman, Monte Carlo
- Community Intelligence + Federated Learning stub

### المرحلة 4: Testing & Deployment (أسبوع 7)
- اختبار كل 150 أداة: Live Recalculation, Cross-Tool, Freshness, What-If
- اختبار Supabase RLS
- اختبار i18n + Units
- Deploy Vercel

## كيف تبدأ من الملف المضغوط الجديد؟

الملف المضغوط v6 الجديد يحتوي:

- registry/tools.registry.v6.150.ts - تعريف 150 أداة كامل
- engines/core/v6/ - Core Framework لكل 150
- engines/tools/batch-a/ إلى batch-f/ - محركات 150 أداة (25 أداة جديدة + 125 مطورة)
- supabase/schema.v6.150.sql - Schema لكل 150 أداة بنفس هيكليتك الحالية
- scripts/upgrade-all-150.js - سكريبت يرقي كل 150 أداة تلقائيا

الخطوة:
1. فك الضغط في E:\temp\v6-150
2. شغل node scripts/upgrade-all-150.js --dry-run (يشوف إيه اللي هيتغير)
3. شغل node scripts/upgrade-all-150.js --apply (ينسخ ويحدث)
4. npm run validate-tools -- --all-150
5. npm run dev + اختبار

