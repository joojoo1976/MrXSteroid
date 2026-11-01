## المشكلة

بوابة Lighthouse Mobile في `docs/perf/tool-036-budget.md` تفشل **فشلاً صريحاً** (hard fail) على أكثر من أداة، وليست على أداة واحدة. السبب الجذري **غير مُحدَّد** حتى الآن.

يتعلق الأمر بأمر مباشر: بوابة الأداء هذه تحجب الدمج (Gate G8) في PR #8.

## القياسات (Lighthouse 13.5.0، `formFactor=mobile`)

| المقياس | tool-036 (P1 L1 — علم ON) | tool-035 (خط أساس — أداة لم تُمَس) | العتبة | الحكم |
|---|---|---|---|---|
| Performance | **67** | **61** | > 90 / فشل صريح < 85 | ❌ FAIL |
| LCP | **2253 ms** | **2806 ms** | < 1500 ms / فشل صريح > 1800 | ❌ FAIL |
| FCP | 2253 ms | 2806 ms | — | — |
| TBT | 2831 ms | 3314 ms | — | — |
| CLS | 0 | 0 | < 0.1 | ✅ PASS |
| Requests | 37 | 38 | — | — |
| `fetchTime` | `2026-10-17T16:18:32.438Z` | `2026-10-17T16:24:17.141Z` | — | — |

المصادر (غير مُلتزمة في المستودع، `.superpowers/` مستبعد عمداً):
`.superpowers/sdd/tool-036-p1/lighthouse-tool036.report.json` و `.superpowers/sdd/tool-036-p1/lighthouse-tool035-baseline`

## ما هو مُثبَّت (Proven)

1. **المشكلة ليست من كود tool-036 P1:** الأداة المُعتمدة وغير المُعدَّلة `tool-035` تسجّل **أسوأ** (61 مقابل 67، وLCP 2806 مقابل 2253) على نفس البناء. أي أنّ ما يرفع LCP موجود في الموقع كاملاً لا في Level 1.
2. **LCP = FCP بالضبط** في الصفحتين (2253/2253 و2806/2806) → عنصر LCP يُرسم عند أول رسم. هذه إشارة حقيقية لكنها لا تُحدِّد *ما* العنصر.
3. `CLS = 0` و `First-load JS = 103 kB < 150 kB` → PASSED — البطء ليس منCLS ولا من حجم الحزمة.

## ما هو مَرفوض (Refuted) — مهم

**فرضية «الأُوفرلاي الشفاف هو عنصر LCP» مرفوضة بالأدلة ولا يجب البناء عليها:**

- البحث في **كلتَي التقريرين** يعطي **صفر** مطابقات لـ: `fixed inset-0` (0) · `backdrop-blur` (0) · `pointer-events-none` (0) · `opacity-0` (0) · `data-testid` (0) · `role="dialog"` (0).
- البحث في **HTML الـ SSR المحفوظ** (`.superpowers/sdd/tool-036-p1/page.html`، طول 33004، عنوان «Injection Schedule Planner») يعطي **صفر** مطابقات لنفس الأنماط، ولا يوجد أي `<div>` بـ `fixed inset-0` أصلاً.
- audit `largest-contentful-paint-element` **غير موجود** في كلا التقريرين — الموجود هو `largest-contentful-paint` (التوقيت فقط).

⇒ لا يوجد أي إسناد لعنصر LCP. أي ادعاء بسبب جذري هنا سيكون غير مسنود.

## Blocked / NOT RUN

- **BLOCKED:** إسناد عنصر LCP — audit `largest-contentful-paint-element` غائب من هذا التشغيل.
- **NOT RUN:** أي إصلاح أداء، وأي إعادة قياس بعد الإصلاح.

## خطوات مقترحة

1. إعادة قياس مع إسناد LCP: `npx lighthouse <url> --preset=perf --form-factor=mobile --screenEmulation.mobile --only-audits=largest-contentful-paint-element` (أو عبر `--view` للحصول على `node` المرتبط).
2. قياس تكلفة Hydration على الشبكة المشتركة (large chunks) وتحديد أي script يرفع TBT إلى ~3 ثوانٍ.
3. إعادة القياس بعد كل خطوة مقابل خط الأساس `tool-035` للتأكد من التحسّن الحقيقي لا الضجيج.

## السياق

يفتح لهذا PR #8 (بوابة G8 وحدها هي الفاشلة؛ البوابات السبع الأخرى PASS).
