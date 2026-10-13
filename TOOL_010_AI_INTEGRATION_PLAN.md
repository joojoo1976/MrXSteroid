# TOOL_010_AI_INTEGRATION_PLAN.md

> **خطة تكامل AI حقيقي وآمن للأداة المرجعية tool-010**
> الحالة: **مسودة للمراجعة** — لا يُنفّذ أي شيء قبل الموافقة.
> المتطلب المسبق: اعتماد tool-010 كـ REFERENCE_READY للحساب الأساسي (انظر `TOOL_010_REFERENCE_IMPLEMENTATION_PLAN.md`)

---

## 1. الحالة الحالية لـ AI

| الجانب | الحالة الحالية |
|--------|--------------|
| **مزود AI** | غير مكوّن — `OPENAI_API_KEY` غير متوفر في بيئة الإنتاج |
| **نمط العمل** | `FALLBACK_ONLY` / `BLOCKED` — شرح محلي ثابت (إن وجد) أو رسالة "AI غير متاح" |
| **الاتصال** | لا يوجد — لا توجد API Route / Edge Function للـ AI |
| **العقد بين المحرك و AI** | غير موجود — لا يوجد `EngineResult → AIContext` موحد |
| **المفاتيح في كود العميل** | لا توجد — مُلتزم بذلك |
| **الاختبارات** | لا توجد اختبارات لـ AI integration |

**الخلاصة**: الحساب الأساسي يعمل بالكامل بدون AI. أي ادّعاء بوجود "AI" حاليًا غير صحيح.

---

## 2. عقد الإدخال والإخراج بين المحرك و AI (Data Contract)

### 2.1 EngineResult (مخرجات المحرك الحتمي — المصدر الوحيد للحقيقة)

```typescript
interface EngineResult {
  riskScore: number;
  riskLevel: 'minimal' | 'moderate' | 'high' | 'critical';
  contributingFactors: FactorContribution[];
  missingInputs: string[];
  warnings: string[];
  unitSystem: 'metric' | 'imperial';
  locale: 'ar' | 'en';
  timestamp: string;
  engineVersion: string;
}

interface FactorContribution {
  factorId: string;
  displayName: string;
  value: number;
  unit: string;
  weight: number;
  contribution: number;
  direction: 'increases' | 'decreases';
}
```

### 2.2 AIRequest (ما يُرسل لخدمة AI من الخادم)

```typescript
interface AIRequest {
  engineResult: EngineResult;
  userContext?: {
    experienceLevel?: 'beginner' | 'intermediate' | 'advanced';
    goals?: string[];
  };
  requestType: 'explain' | 'summarize' | 'gap_analysis';
  locale: 'ar' | 'en';
}
```

### 2.3 AIResponse (ما تُعيده خدمة AI)

```typescript
interface AIResponse {
  explanation: string;
  keyInsights: string[];
  dataGaps: string[];
  limitations: string[];
  confidence: 'high' | 'medium' | 'low';
  disclaimer: string;
  engineVersionUsed: string;
  generatedAt: string;
}
```

### 2.4 حالات اتصال AI (للعرض في الواجهة)

| الحالة | الوصف | متى تظهر |
|--------|-------|----------|
| `CONNECTED_AND_TESTED` | خدمة AI تعمل، تم اختبارها، ترد بشكل صحيح | `OPENAI_API_KEY` موجود + health check ناجح |
| `FALLBACK_ONLY` | لا يوجد مفتاح API، يعمل fallback محلي (إن وجد) | متغير البيئة غير مضبوط |
| `NOT_CONFIGURED` | الخدمة غير مكوّنة إطلاقًا | لا يوجد كود خدمة AI |
| `FAILED` | الخدمة مكوّنة لكن فشلت (مهلة، خطأ مزود، حد استخدام) | استثناء من API route |

**القاعدة**: الواجهة تعرض الحالة الفعلية فقط — لا تخفي الفشل، لا تدّعي اتصالًا غير موجود.
---

## 3. تصميم خدمة AI آمنة من الخادم (Server-Side AI Service)

### 3.1 البنية المعمارية

```
┌─────────────┐     HTTPS      ┌──────────────────┐     HTTPS      ┌─────────────┐
│   Client    │ ─────────────▶ │  Next.js API     │ ─────────────▶ │  OpenAI     │
│  (Browser)  │  AIRequest     │  Route / Edge    │  AIRequest     │  API        │
│             │ ◀───────────── │  Function        │ ◀───────────── │             │
└─────────────┘  AIResponse    └──────────────────┘  AIResponse    └─────────────┘
       │                              │
       │                              ├─ يتحقق من المدخلات (Zod schema)
       │                              ├─ يتحقق من EngineResult (صحة، إصدار)
       │                              ├─ يطبق Rate Limiting (per user/IP)
       │                              ├─ يفرض Timeout (15s max)
       │                              ├─ يعالج الأخطاء بأمان (لا يسرب stack traces)
       │                              └─ لا يخزن طلبات/استجابات (Privacy)
       │
       └─ لا يرى OPENAI_API_KEY أبدًا
```

### 3.2 المسار المقترح: `app/api/ai/aromatization-risk/route.ts`

```typescript
// مخطط عالي المستوى — لا يُنفّذ قبل الموافقة
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import OpenAI from 'openai';

const AIRequestSchema = z.object({
  engineResult: EngineResultSchema,
  userContext: UserContextSchema.optional(),
  requestType: z.enum(['explain', 'summarize', 'gap_analysis']),
  locale: z.enum(['ar', 'en']),
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPTS = {
  ar: `أنت مساعد طبي يشرح نتائج حاسبة مخاطر الأرمتة (Aromatization Risk).
ممنوع: التشخيص الطبي، الجرعات الشخصية، بروتوكولات تعاطٍ، تجاوز نتائج المحرك.
مسموح: شرح القيم، العوامل المؤثرة، البيانات الناقصة، حدود الاستنتاج.
اللغة: العربية الفصحى.`,
  en: `You are a medical assistant explaining Aromatization Risk calculator results.
Forbidden: medical diagnosis, personal dosages, usage protocols, overriding engine results.
Allowed: explain values, contributing factors, data gaps, limitations.
Language: English.`,
};

export async function POST(req: NextRequest) {
  // Rate limiting, validation, timeout, error handling...
}
```

### 3.3 ضوابط الأمان الإلزامية

| الضابط | القيمة | المنفذ في |
|---------|--------|-----------|
| **مهلة زمنية (Timeout)** | 15 ثانية كحد أقصى | API Route (AbortController) |
| **Rate Limiting** | 10 طلب/دقيقة/مستخدم، 100 طلب/ساعة/IP | Middleware أو Upstash/Ratelimit |
| **تحقق المدخلات** | Zod schema صارم، رفض أي حقل زائد | API Route |
| **تحقق المخرجات** | طول الشرح ≤ 2000 حرف، لا أوامر، لا كود | API Route |
| **لا تخزين** | صفر persistence للطلبات/الاستجابات | تصميم |
| **لا بيانات حساسة** | لا ترسل PII، لا بيانات صحية معرفة للهوية | تصميم |
| **مفاتيح آمنة** | `OPENAI_API_KEY` فقط في `process.env` على الخادم | Vercel/Next.js Env Vars |

---

## 4. طريقة تمرير نتائج المحرك ونظام القياس واللغة

### 4.1 من العميل (Client-Side Hook)

```typescript
// hooks/useAIExplanation.ts
interface UseAIExplanationResult {
  explain: (requestType?: AIRequest['requestType']) => Promise<AIResponse | null>;
  status: 'idle' | 'loading' | 'success' | 'error';
  connectionStatus: 'CONNECTED_AND_TESTED' | 'FALLBACK_ONLY' | 'NOT_CONFIGURED' | 'FAILED';
  error?: string;
}

function useAIExplanation(engineResult: EngineResult, locale: 'ar' | 'en', unitSystem: 'metric' | 'imperial') {
  // 1. يقرأ engineResult من السياق (React Context أو Zustand)
  // 2. عند استدعاء explain():
  //    - يبني AIRequest مع engineResult كامل + locale + unitSystem
  //    - يرسل POST إلى /api/ai/aromatization-risk
  //    - يعرض loading، ثم النتيجة أو الخطأ
  // 3. يفحص connectionStatus من استجابة الصحة (health check)
}
```

### 4.2 تدفق البيانات الكامل

```
User Input → Engine (حتمي) → EngineResult
                    ↓
            +------------------+
            |  Client State    | ← unitSystem, locale
            +------------------+
                    ↓
         User clicks "Explain with AI"
                    ↓
         useAIExplanation.explain()
                    ↓
         POST /api/ai/aromatization-risk
         Body: { engineResult, locale, unitSystem, requestType }
                    ↓
         Server: Validate → OpenAI → Validate Response
                    ↓
         AIResponse → Client → Render in UI
                    ↓
         UI shows: explanation + keyInsights + dataGaps + limitations
                    ↓
         Connection badge shows: CONNECTED_AND_TESTED / FAILED / etc.
```

### 4.3 تمرير نظام القياس واللغة للـ AI

- `unitSystem` في `EngineResult` → يُمرر كما هو للـ AI
- `locale` في `EngineResult` → يحدد `SYSTEM_PROMPTS[locale]`
- **القاعدة**: AI لا يحول الوحدات — المحرك يفعل ذلك. AI يشرح بالوحدات المعروضة.

---

## 5. سلوك الفشل وعدم توفر المزود

| السيناريو | سلوك العميل | سلوك الخادم |
|-----------|-------------|-------------|
| `OPENAI_API_KEY` غير موجود | يعرض شارة `FALLBACK_ONLY`، يتيح fallback محلي (نص جاهز) | يعيد 503 مع `{ status: 'NOT_CONFIGURED' }` |
| مهلة زمنية (Timeout) | يعرض شارة `FAILED`، رسالة "انتهت مهلة AI" | يقطع الطلب، يعيد 504 |
| خطأ مزود (Rate limit, Invalid key) | يعرض شارة `FAILED`، رسالة عامة | يعيد 502/429، لا يسرب تفاصيل |
| استجابة AI غير صالحة (schema) | يعرض شارة `FAILED`، يستخدم fallback | يسجل خطأ، يعيد 500 |
| Network error على العميل | يعرض شارة `FAILED`، يتيح إعادة المحاولة | — |

**قاعدة fallback المحلي**: إن وجد، يكون نصًا ثابتًا عامًا (ليس مولّدًا) مع إخلاء مسؤولية واضح: "هذا شرح عام، ليس مخصصًا لنتائجك".
---

## 6. الاختبارات المطلوبة

| # | الاختبار | المعيار |
|---|----------|---------|
| 1 | خدمة AI تستقبل `EngineResult` فعلي وتستخدمه في الشرح | الشرح يذكر قيمًا محددة من `engineResult` |
| 2 | الشرح يتغير عند تغيّر `engineResult` (مدخلات مختلفة → شرح مختلف) | طلبان بـ `engineResult` مختلفتين → استجابتان مختلفتان |
| 3 | AI لا يخترع قيمًا غير موجودة في `engineResult` | تحقق: كل قيمة عددية في الشرح موجودة في `engineResult` |
| 4 | AI لا يضيف تشخيصًا طبيًا أو جرعات أو بروتوكولات | فحص محتوى: لا يحتوي على كلمات ممنوعة |
| 5 | الحساب الأساسي يعمل بالكامل عند غياب AI | تعطيل API route → الأداة تحسب وتعرض نتائج صحيحة |
| 6 | فشل AI لا يكسر الأداة (Error Boundary، UI لا ينهار) | محاكاة 500/timeout → الواجهة تعمل، تظهر شارة FAILED |
| 7 | `OPENAI_API_KEY` لا تظهر في bundle العميل | `grep -r OPENAI_API_KEY .next/` → صفر نتائج |
| 8 | `unitSystem` يُمرر للـ AI بشكل صحيح | Metric → الشرح بالوحدات المترية، Imperial → بالوحدات الإمبراطورية |
| 9 | `locale` يؤثر على لغة الشرح | `ar` → شرح عربي، `en` → شرح إنجليزي |
| 10 | Rate limiting يعمل | 11 طلب سريع → الطلب 11 يُرفض بـ 429 |
| 11 | Timeout يعمل | محاكاة بطء >15s → يقطع ويعيد 504 |

---

## 7. خطة تفعيل AI عند توفر `OPENAI_API_KEY`

| المرحلة | الإجراء | المخرج |
|----------|---------|--------|
| 1 | إضافة `OPENAI_API_KEY` في Vercel/Production Env Vars | متغير موجود، غير مكشوف |
| 2 | نشر API Route `/api/ai/aromatization-risk` | endpoint حي |
| 3 | Health Check endpoint (`GET /api/ai/aromatization-risk/health`) | يعيد `{ status: 'CONNECTED_AND_TESTED', latencyMs }` |
| 4 | تفعيل `useAIExplanation` hook في الواجهة | زر "Explain with AI" يظهر |
| 5 | تشغيل اختبارات القبول الـ 11 (القسم 6) | كلها PASS |
| 6 | تحديث التقارير: تغيير حالة AI من `FALLBACK_ONLY` إلى `CONNECTED_AND_TESTED` | `AROMATIZATION_RISK_ACCEPTANCE_REPORT.md` |
| 7 | Commit حقيقية + Tag `tool-010-ai-enabled` | مراجعة وموافقة |

---

## 8. معايير تغيير الحالة من FALLBACK_ONLY/BLOCKED إلى CONNECTED_AND_TESTED

الحالة تتغير إلى `CONNECTED_AND_TESTED` **فقط عند تحقق جميع** ما يلي:

- [ ] `OPENAI_API_KEY` موجود في بيئة الإنتاج (Vercel/Server)
- [ ] API Route منشورة وتستجيب لـ Health Check بنجاح
- [ ] اختبارات القبول الـ 11 (القسم 6) ناجحة بالكامل
- [ ] لا مفاتيح في كود العميل (تم التحقق بـ `grep` على build output)
- [ ] Rate limiting و Timeout مفعلان ومختبران
- [ ] الشرح يتغير ديناميكيًا مع نتائج المحرك (اختبار تكامل)
- [ ] التقارير محدثة لتعكس الحالة الجديدة
- [ ] موافقة صريحة على النتائج

---

## 9. القيود الصارمة (غير قابلة للتفاوض)

- ❌ لا تبدأ #111–#150 قبل اعتماد tool-010 مرجعيًا
- ❌ لا تنشر أو تدمج أي تغيير قبل المراجعة
- ❌ لا تستخدم force push أبدًا
- ❌ لا تنفذ migrations أو تغييرات إنتاجية على قاعدة البيانات
- ❌ لا تعدّل أنظمة الدفع/الشحن/الطلبات/المنتجات
- ❌ لا تضع مفاتيح API في كود العميل (Browser bundle)
- ❌ لا تدّعِ أن fallback محلي هو AI حقيقي
- ❌ لا تعتبر الأداة PASS نهائيًا قبل اختبار AI الفعلي عند توفر المزود
- ❌ AI لا يغيّر مدخلات، لا يحفظ بيانات، لا ينفذ إجراءات حساسة
- ❌ لا ترسل بيانات صحية/شخصية لمزود خارجي دون أساس قانوني وموافقة

---

## 10. الخطوات التالية بعد الموافقة على هذه الخطة

1. **مراجعة واعتماد** `TOOL_010_REFERENCE_IMPLEMENTATION_PLAN.md` أولاً (الأولوية للحساب الأساسي + ترجمة/RTL)
2. بعد اعتماد tool-010 كـ **REFERENCE_READY**، مراجعة هذه الخطة
3. تنفيذ Phase B-1 إلى B-6 من الخطة المرجعية
4. **ثم فقط** عند توفر `OPENAI_API_KEY` وموافقة صريحة: تنفيذ هذه الخطة (AI Integration)
5. كل مرحلة = Commit حقيقية + Diff + موافقة

---

**ملاحظة هامة**: هذه الخطة **منفصلة** عن خطة الأداة المرجعية. الأداة المرجعية تُعتمد للحساب الأساسي أولاً. AI طبقة اختيارية تُضاف لاحقًا عند توفر المزود وموافقة صريحة.