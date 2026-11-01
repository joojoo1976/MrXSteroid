
================================================================================
خطوات العمل مع المطور ابتداء من الملف المضغوط
المشروع: E:\MrXSteroid-main - https://github.com/joojoo1976/MrXSteroid
MrXSteroid.com
================================================================================

-----------------------------
الجزء الأول: الشرح البسيط (للمدير / لصاحب المشروع)
-----------------------------

الفكرة ببساطة:
انت عندك مشروع شغال اسمه MrXSteroid فيه 136 أداة. احنا عملنا تطوير فائق الذكاء (v4) عبارة عن 11 محرك جديد + نظام ذكي يربط الأدوات ببعض.

الملف المضغوط اللي معاك فيه:
- كود جاهز للـ 11 أداة الجديدة
- نظام يخلي الأدوات تكلم بعض
- تصميمات واجهة ديناميكية
- قاعدة بيانات محدثة

خطواتك مع المطور ببساطة:

1. فك الضغط: هتلاقي فولدر mrxsteroid-smarttools-v4
2. افتح مشروعك الأصلي E:\MrXSteroid-main
3. انسخ الملفات الجديدة لمشروعك (المطور عارف فين)
4. المطور يربطهم ويشغل اختبار
5. تجرب الأدوات الجديدة على الموقع

المدة المتوقعة: 3-5 أيام عمل

التكلفة: مفيش مكتبات جديدة غالية، كلها كود TypeScript عادي

المخاطر: قليلة، لأن الكود منفصل ومش بيكسر القديم

-----------------------------
الجزء الثاني: الشرح المفصل التقني (للمطور)
-----------------------------

البيئة الحالية (من فحص GitHub joojoo1976/MrXSteroid):
- Public repo, main branch, 603 commits, 1 star
- Stack: React 19 + TypeScript + Tailwind + Radix UI + Framer Motion + React Hook Form + Zod + React Router + Vite + Supabase + Gemini/OpenAI + Vercel
- مجلدات: app/, components/, config/, context/, data/, docs/, features/, hooks/, i18n/, lib/, supabase/, tests/, utils/
- ملفات مهمة: SMARTTOOLS_SPEC.md, SMARTTOOLS_TOOL_ID_INVENTORY.json, TOOL_010_*, vitest.config.ts, next.config.ts (رغم أنه Vite وليس Next - فيه تضارب يحتاج توضيح)

الملف المضغوط v4 يحتوي:
mrxsteroid-smarttools-v4/
├── registry/tools.registry.ts (تعريف 11 أداة Batch C)
├── engines/core/ (3 ملفات قلب النظام)
│   ├── ai-orchestrator.ts - 5 طبقات Super Intelligence
│   ├── equation-validator.ts - توثيق معادلات + وحدات
│   └── cross-tool-graph.ts - ربط الأدوات + freshness
├── engines/tools/ (11 محرك)
│   ├── 126-neuromuscular-performance.ts
│   ├── 127-daily-readiness.ts
│   ├── 128-acwr.ts
│   ├── 129-adaptive-planner.ts
│   ├── 130-plateau-detective.ts
│   ├── 131-transformation-forecast.ts
│   ├── 132-pose-coach.ts
│   ├── 133-velocity-loss.ts
│   ├── 134-mobility-symmetry.ts
│   ├── 135-substitution.ts
│   └── 136-physique-proportion.ts
├── ai/super-intelligence/per-tool-ai-definitions.ts
├── supabase/schema.sql (محدث مع ai_user_profiles)
├── components/dynamic-results/DynamicResults.tsx
└── components/visualizations/SuperIntelligenceCharts.tsx

-----------------------------
الخطوات العملية التفصيلية - من الصفر
-----------------------------

الخطوة 0: التحضير (10 دقائق)
- افتح E:\MrXSteroid-main في VS Code
- افتح Terminal: git status (تأكد أن كل شيء clean)
- اعمل Branch جديد: git checkout -b feature/super-intelligence-v4
- فك ضغط الملف mrxsteroid-smarttools-v4-SUPER-INTELLIGENCE-FULL.zip في مكان مؤقت مثل E:\temp\v4

الخطوة 1: نسخ الـ Registry (5 دقائق)
- افتح الملف الأصلي في مشروعك: lib/ أو features/smarttools/registry/ (دور على tools.registry أو SMARTTOOLS_TOOL_ID_INVENTORY.json)
- افتح الملف الجديد: E:\temp\v4\registry\tools.registry.ts
- انسخ تعريف الـ 11 أداة وأضفهم للـ Registry الأصلي
- تأكد أن الأرقام 126-136 مش متكررة (فحص SMARTTOOLS_TOOL_ID_INVENTORY.json)
- ملاحظة: مشروعك فيه SMARTTOOLS_SPEC.md - حدثه بإضافة Batch C

الخطوة 2: نسخ المحركات الأساسية Core (10 دقائق)
- في مشروعك: lib/engines/core/ (لو مش موجود انشئه)
- انسخ 3 ملفات:
  E:\temp\v4\engines\core\ai-orchestrator.ts → E:\MrXSteroid-main\lib\engines\core\ai-orchestrator.ts
  E:\temp\v4\engines\core\equation-validator.ts → lib/engines/core/
  E:\temp\v4\engines\core\cross-tool-graph.ts → lib/engines/core/
- افتح package.json وتأكد من TypeScript موجود (موجود حسب README)
- شغل: npx tsc --noEmit --skipLibCheck (للتأكد من عدم وجود أخطاء TypeScript)

الخطوة 3: نسخ محركات الأدوات الـ 11 (15 دقيقة)
- في مشروعك: lib/engines/tools/ (أو app/smarttools/engines/)
- انسخ كل الملفات:
  E:\temp\v4\engines\tools\*.ts → E:\MrXSteroid-main\lib\engines\tools\
- إذا مشروعك يستخدم JavaScript وليس TypeScript في بعض الأماكن، حول الـ interface لـ JSDoc أو اتركه TS

الخطوة 4: نسخ AI Definitions (5 دقائق)
- انسخ: ai/super-intelligence/per-tool-ai-definitions.ts → lib/ai/super-intelligence/
- هذا الملف يحتوي برومبت مختلف لكل أداة - مهم للـ API

الخطوة 5: تحديث قاعدة البيانات Supabase (10 دقائق)
- افتح E:\temp\v4\supabase\schema.sql
- افتح مشروعك: supabase/schema.sql أو supabase/migrations/
- قارن الجداول:
  - user_tool_states موجود؟ لو موجود أضف UNIQUE(user_id, tool_id) لو مش موجود
  - ai_user_profiles جديد - أضفه كامل
  - user_preferences موجود؟
- شغل Migration في Supabase Dashboard أو: supabase db push
- مهم: تأكد من RLS Policies مفعلة

الخطوة 6: نسخ مكونات UI (15 دقيقة)
- انسخ:
  components/dynamic-results/DynamicResults.tsx → components/smarttools/dynamic-results/
  components/visualizations/SuperIntelligenceCharts.tsx → components/smarttools/visualizations/
- هذه المكونات تستخدم Tailwind + Recharts - تأكد أن Recharts مثبت: npm list recharts
- لو مش مثبت: npm install recharts
- المكونات تستخدم language prop (ar/en) - اربطها مع i18n الموجود في مشروعك (مجلد i18n/)

الخطوة 7: إنشاء صفحات الأدوات الـ 11 (ساعة - أهم خطوة)
لكل أداة من 126 لـ 136:
- انشئ مجلد: app/smarttools/[slug]/ أو app/[locale]/smarttools/[slug]/ حسب هيكل مشروعك
- مثال: app/smarttools/neuromuscular-performance-explosiveness/page.tsx
- الصفحة يجب أن:
  1. تستخدم PreferencesProvider من context/ (موجود في مشروعك)
  2. تستخدم useLinkedData من cross-tool-graph
  3. تستخدم SuperIntelligenceOrchestrator
  4. تعرض DynamicResults + Chart الخاص بالأداة

قالب صفحة (انسخه وعدل):

import { useState } from 'react'
import { SuperIntelligenceOrchestrator } from '@/lib/engines/core/ai-orchestrator'
import { calculateNeuromuscularPerformance } from '@/lib/engines/tools/126-neuromuscular-performance'
import { DynamicResults } from '@/components/smarttools/dynamic-results/DynamicResults'
import { NeuromuscularRadar } from '@/components/smarttools/visualizations/SuperIntelligenceCharts'
import { usePreferences } from '@/context/PreferencesContext'

export default function NeuromuscularPage() {
  const { language, units } = usePreferences()
  const [inputs, setInputs] = useState({ jumpHeight: 0, contactTime: 0, flightTime: 0, bodyMass: 0 })
  const [result, setResult] = useState(null)
  
  const orchestrator = new SuperIntelligenceOrchestrator()
  
  const handleCalculate = async () => {
    const res = await orchestrator.process('neuromuscular-performance', inputs, calculateNeuromuscularPerformance, { userId: 'current' })
    setResult(res)
  }
  
  return (
    <div>
      {/* Inputs Form */}
      <DynamicResults result={result} loading={false} language={language} units={units} />
      {result && <NeuromuscularRadar data={result.engineResult} />}
    </div>
  )
}

الخطوة 8: ربط AI API (20 دقيقة)
- في مشروعك: app/api/ أو server/api/
- انشئ: app/api/smarttools/ai/explain/route.ts
- هذا الـ API يستقبل engineResult ويرسل لـ Gemini/OpenAI مع البرومبت الخاص بكل أداة من per-tool-ai-definitions.ts
- استخدم VITE_GEMINI_API_KEY الموجود في .env.example

الخطوة 9: اختبار محلي (30 دقيقة)
- npm run dev
- افتح http://localhost:5173/smarttools/neuromuscular-performance-explosiveness
- جرب إدخال قيم: jumpHeight 50, contactTime 0.2, flightTime 0.6, bodyMass 80
- يجب أن ترى: RSI 3.0, Power 4604W, Profile Speed-Dominant + Radar
- جرب تغيير قيمة - هل النتيجة تتحدث فورا؟ (Live Recalculation)
- جرب Cross-Tool: أدخل Body Fat في أداة Body Composition ثم افتح Transformation Forecast - هل جاب البيانات تلقائيا؟

الخطوة 10: كتابة اختبارات (ساعة - حسب SMARTTOOLS_SPEC.md)
- في tests/ أو __tests__/
- لكل محرك 12 اختبار: مرجعي، حد أدنى، حد أقصى، صفر، سالب، ناقص، متناقض، تحويل وحدات، ديناميكي، ثبات، حساسية، أمان
- شغل: npm run test:unit -- --coverage
- شغل: npm run validate-tools (إذا موجود في package.json)

الخطوة 11: Git ورفع (10 دقائق)
- git add .
- git commit -m "feat: add super-intelligence v4 batch C 126-136 with cross-tool graph"
- git push origin feature/super-intelligence-v4
- اعمل Pull Request على GitHub

الخطوة 12: Deployment على Vercel (10 دقائق)
- Vercel مربوط حسب README
- كل Push على main يعمل Deploy تلقائي
- تأكد من Environment Variables في Vercel Dashboard

-----------------------------
كيف تقدم الملف للمطور؟ (نص جاهز ترسله)
-----------------------------

"السلام عليكم،

عندي تطوير فائق الذكاء لـ SmartTools Batch C (11 أداة من 126 لـ 136).

الملف المضغوط فيه:
- 11 محرك TypeScript بمعادلات موثقة (RSI, ACWR, Monte Carlo...)
- نظام AI Orchestrator 5 طبقات
- Cross-Tool Graph يربط الأدوات ببعض
- مكونات UI ديناميكية
- Supabase schema محدث

المطلوب:
1. تنسخ الملفات لـ E:\MrXSteroid-main حسب الخطوات في WORKFLOW_WITH_DEVELOPER.txt
2. تنشئ 11 صفحة في app/smarttools/
3. تربط AI API
4. تختبر

المدة: 3-5 أيام
الملف: مرفق + شرح مفصل داخل docs/

لو واجهت مشكلة في أي خطوة، الكود فيه تعليقات عربية وإنجليزية."

-----------------------------
هل أريد تطوير البرومبت بعد فحص GitHub؟
-----------------------------

نعم، بعد فحص repo joojoo1976/MrXSteroid اكتشفت:

1. مشروعك ليس Next.js فقط - هو Vite + React 19 + TypeScript (رغم وجود next.config.ts)
2. عندك مجلدات غير موجودة في البرومبت الأصلي: features/, context/, i18n/, legacy-pages/, private/books/
3. عندك ملفات Audit مهمة: SMARTTOOLS_SPEC.md, SMARTTOOLS_AUDIT_MATRIX.md, TOOL_010_*, إلخ
4. عندك نظام i18n جاهز و PreferencesProvider في context/
5. عندك Vitest + ESLint + Docker

لذلك البرومبت الحالي v4 عام، لكن يحتاج v5 مخصص لمشروعك الفعلي:

مقترح تطوير البرومبت لـ v5:
- إضافة قسم خاص بهيكل مشروعك الفعلي (app/, features/, context/PreferencesContext)
- إضافة تكامل مع SMARTTOOLS_SPEC.md الموجود
- إضافة تكامل مع i18n الموجود
- إضافة تكامل مع Vitest الموجود
- إضافة قسم Docker + Vercel Deployment الخاص بمشروعك
- إضافة قسم private/books/ (هل الأدوات مرتبطة بالكتب؟)
- توضيح الفرق بين Vite و Next.js في مشروعك (فيه ملفين next.config.ts و vite)
- إضافة checklist خاص بـ 603 commits الموجودة

هل تريد أن أطور البرومبت لـ v5 مخصص لمشروعك E:\MrXSteroid-main؟

إذا نعم، سأنشئ:
- MASTER_PROMPT_v5_TAILORED_FOR_MRXSTEROID_MAIN.md
- مع كل تفاصيل مجلداتك الفعلية
- مع خطوات نسخ دقيقة حسب هيكلك
- مع تكامل مع ملفات Audit الموجودة

================================================================================
نهاية الخطوات
================================================================================
