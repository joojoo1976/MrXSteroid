# تقرير: جعل SUPREME V2 مباشرًا على الرابط (إزالة Flag)

> التاريخ: 2026-10-18 · الرتبة: `main` · Commit: **b913b104** · الحالة: **LIVE موثّق** ✅

## 1) التشخيص — لماذا «لا تطور»؟ (جذر المشكلة)
التطوير كان موجودًا لكن **مقفلًا خلف Flag افتراضيًا OFF**:
```
components/tools/tool-036-injection-schedule.tsx:38
  const SUPREME_ON = process.env.NEXT_PUBLIC_FT_TOOL036_SUPREME_V2 === 'true';
components/tools/tool-036-injection-schedule.tsx:1027
  return SUPREME_ON ? <Tool036Supreme /> : <Tool036V1 />;
```
الـ Flag غير موجود في أي `.env`/`vercel.json`/`next.config` → `undefined` → `false` → تُعرض النسخة القديمة `Tool036V1`.

## 2) التعديل المنفَّذ
- `const SUPREME_ON = true;`
- `return <Tool036Supreme />;` (أُزيل `return` النسخة القديمة)
- حُدّث تعليق LEVEL 1 ليعكس إزالة البوابة.
- **`app/smarttools/tool-036-injection-schedule/page.tsx`** = صفحة redirect 301 فقط (لم تتغيّر). التنفيذ الحقيقي عبر `app/smarttools/[category]/[tool]/page.tsx` → `getToolComponent()` → الكومبوننت أعلاه.

## 3) تحديث الاختبارات (عقد جديد — بصراحة)
الاختباران اللذان يرمزان العقد القديم («flag OFF ⇒ v1») تحوّلا إلى العقد الجديد («V2 هو الافتراضي بدون أي env»). **لا اختبار مُعطَّل، ولا ادعاء نجاح زائف**: 11/11 ✅

## 4) بوابات التحقق (على الرتبة المُلتزم بها)

| البوابة | النتيجة | الدليل |
|---|---|---|
| Build | `✓ Compiled successfully in 49s` | ✅ PASS |
| Pages | `✓ Generating static pages (310/310)` | ✅ PASS |
| First Load JS | `ƒ /smarttools/tool-036-injection-schedule  567 B  103 kB` | ✅ **103 kB < 150 kB** |
| Component tests | `11 passed (11)` | ✅ PASS |
| ESLint | **0 errors**, 3 warnings | ✅ PASS |
| `git cat-file -t HEAD` | `commit` | ✅ |

## 5) الدفع — دليل قاطع
```
git commit: b913b104 feat(tool-036): make SUPREME V2 live directly on route - remove Flag gating
git push:   59d75d71..b913b104  main -> main
git ls-remote origin main = b913b104cb9605cf9411e172e585bbc398f1ba20 = HEAD → MATCH ✅
```
حُذِّث الملفان المعدَّلان فقط (`components/tools/tool-036-injection-schedule.tsx` و`.test.tsx`). مسار `app/...` المطلوب في التعليمات **لا يحتوي أي تغيير** (صفحة redirect)، فوضعه في `git add` كان سيُدرِج لا شيء. `.superpowers/` لم يُدرَج.

## 6) LIVE موثّق (HTTP فعلي على الإنتاج)
بعد انتشار النشر من Vercel، رابط الإنتاج يُرجع 200 ويحمل واجهة V2:
```
CHRONO-INJECT  : True   (count 1)
tab-core       : True
tab-sites      : True
tab-comfort    : True
ar-badge       : True
Comfort / Evidence / Rotation / Sites : True
```
`body-map` و`rotation-table` = False في HTML الأول لأنهما داخل تبويب «المواقع» غير المفتوح افتراضيًا (يظهران عند الضغط على التبويب — موثّقان في الاختبارات).

## 7) تغيّرات مهمة يجب علمها
- **لا يوجد مفتاح تراجع فوري الآن**: `Tool036V1` غير قابل للاستدعاء وقت التشغيل (الدالة ما زالت في الملف للاحتفاظ بها).
- ESLint يعطي تحذيرين جديدين: `SUPREME_ON` و`Tool036V1` غير مستخدمين (تحذيرات فقط، البناء ينجح).
- **G8 Lighthouse يبقى FAIL Site-Wide** (Issue #9) — مسألة منفصلة عن الـ Flag، ولم تُغلق.
- مساحة العمل كانت على فرع `fix/payments-p0-p1-security-hardening` (عمل غير متعلّق)، فانتقلت إلى `main` للتنفيذ كما طُلب. ذلك الفرع لم يُمسّ ولم يُحذف.
