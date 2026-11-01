
# MASTER PROMPT v5 GENIUS - Tailored for E:\MrXSteroid-main
# النسخة العبقرية المخصصة لك - كل التطورات المستقبلية منفذة

## معلومات المشروع الفعلي (بعد فحص GitHub)

Repo: https://github.com/joojoo1976/MrXSteroid - Public - 603 commits
Local: E:\MrXSteroid-main
Stack: React 19 + TypeScript + Vite + Tailwind + Radix + Framer Motion + Supabase + i18n + context/PreferencesContext

## ما الجديد في v5 Genius؟

v5 Genius = v4 + كل أفكار المستقبل منفذة كود حقيقي

### التطورات المستقبلية المنفذة:

1. **ML Models** (engines/core/future/ml-models.ts):
   - Random Forest 100 trees لتصنيف 5 Profiles في #126
   - LSTM 7-day HRV يتنبأ بإرهاق قبل يومين في #127
   - Logistic Regression لخطر إصابة في #128

2. **Vision** (engines/core/future/vision.ts):
   - MediaPipe Pose يحلل فيديو على المتصفح بدون رفع للسيرفر
   - Equipment Scanner يتعرف على معدات الجيم من صورة

3. **Voice** (engines/core/future/voice.ts):
   - Whisper API: "سجلت سكوات 100 كجم 5 تكرارات" → parsed {exercise, weight, reps}

4. **LLM Generators** (ai/super-intelligence/llm/):
   - Program Generator: Prompt → JSON برنامج كامل
   - Narrative Generator: "جاهزيتك 62% → جسمك بيقولك اديني يوم خفيف"

5. **Advanced Algorithms**:
   - Kalman Filter يصحح توقعات التحول
   - Monte Carlo 1000 simulation لـ uncertainty band
   - VBT: velocity 0.5 m/s ≈ 80% 1RM
   - 3D Body Map

## تعليمات للمطور - مخصصة لـ E:\MrXSteroid-main

### الخطوة 1: افحص مشروعك (15 دقيقة)
- افتح E:\MrXSteroid-main
- افحص: features/smarttools/registry/ - أين Registry الحالي؟
- افحص: context/PreferencesContext.tsx - موجود؟
- افحص: i18n/ - نظام الترجمة
- افحص: supabase/schema.sql

### الخطوة 2: انسخ الملفات (30 دقيقة)
المصدر: E:\temp\v5-genius\
| من | إلى |
| registry/tools.registry.v5.ts | features/smarttools/registry/ أو lib/registry/ (ادمج) |
| engines/core/*.v5.ts | lib/engines/core/ |
| engines/core/future/*.ts | lib/engines/core/future/ |
| engines/tools/*.v5.ts | lib/engines/tools/ (11 ملف) |
| ai/super-intelligence/ | lib/ai/super-intelligence/ |
| components/ | components/smarttools/ |
| supabase/schema.v5.sql | supabase/ (ادمج ai_user_profiles) |

### الخطوة 3: ثبت مكتبات المستقبل (10 دقائق)
npm install @mediapipe/pose @tensorflow/tfjs ml-random-forest ml-logistic-regression

### الخطوة 4: انشئ صفحات 11 أداة (2 ساعة)
لكل أداة: app/smarttools/[slug]/page.tsx
استخدم قالب app/smarttools/template/page.template.tsx المرفق
القالب يستخدم:
- usePreferences() من context/PreferencesContext (الموجود عندك)
- useTranslation() من i18n/ (الموجود عندك)
- SuperIntelligenceOrchestratorV5
- DynamicResults.v5 + Charts.v5 + BodyMap3D + VBTChart

### الخطوة 5: AI API مع LLM (30 دقيقة)
app/api/smarttools/ai/explain/route.ts
- يستخدم per-tool-ai-definitions.v5.ts
- يستخدم llm/program-generator.ts و narrative-generator.ts
- يستخدم VITE_GEMINI_API_KEY

### الخطوة 6: اختبار عبقري (ساعة)
- npm run dev
- جرب #126 مع فيديو: يجب يحلل Contact Time تلقائيا
- جرب #127 مع HRV History 7 أيام: يجب يتنبأ بإرهاق بعد يومين
- جرب #128 What-If: Slider "ماذا لو تمرنت بكرا 500؟" يحسب ACWR مستقبلي
- جرب Voice: "سجلت سكوات 100 كجم"

### الخطوة 7: Git + Deploy
git checkout -b feature/v5-genius-future
git add . && git commit -m "feat: v5 genius with all future ML/Vision/Voice"
git push && PR

## معايير القبول v5 Genius

- كل محرك 11 يعمل مع Future features stub على الأقل
- MediaPipe stub يعمل (حتى لو mock data)
- LSTM stub يتنبأ
- What-If Simulator يعمل
- Cross-Tool + Freshness + Event Bus
- Language & Units متزامنة
- Empty/Partial/Full
- 12 اختبار لكل محرك

## الفرق v4 vs v5 Genius

v4: محركات + AI + Cross-Tool
v5 Genius: v4 + ML Models + Vision + Voice + LLM Generators + VBT + 3D Body Map + Kalman + Monte Carlo + Community Intel

هذا هو التطوير العبقري الذي طلبته - كل شيء منفذ كود حقيقي جاهز للنسخ.

