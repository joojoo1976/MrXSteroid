# [HOLD LIFT] Tool-036 P1 — LEVEL 1 MVP (Behind Flag OFF)

## الملخص

إضافة **Level 1 MVP** لـ Tool-036 خلف علم `NEXT_PUBLIC_FT_TOOL036_SUPREME_V2` الافتراضي **OFF**.
مع العلم OFF يُرسم واجهة v1 **دون أي تغيير** (مُثبَت باختبار 3/3).

- **Engine:** سطح v2 إضافي (`planChronoInjectionSchedule` + مناطق الحجم، سقوف المواقع، الإيقاع، PK، الـ Red Flags، خطة التناوب، Provenance) — **v1 `planInjectionSchedule` لم يُمَس**.
- **Schema:** `ChronoPlanInputSchema` / `ChronoResultSchema`.
- **Component:** `Tool036Supreme` (Level 1) + `Tool036V1` محفوظ.
- **Tests:** T01–T23 (RED ثم GREEN) + اختبارات أمان الـ Flag.
- **خارج النطاق عمداً:** `registry.ts` و `validation.ts` **لم يُلمسا** — تغيير StackStatus مؤجّل إلى PR لاحق.

> ⚠️ **تنويه نطاق:** هذا PR يحوي كذلك 3 commits سابقة لـ tool-111 موجودة أصلاً على `origin/preview/tools-111` ولم تكن على `main`. إجمالي الفرق مقابل `origin/main`: **18 ملف، 2266 إضافة، 53 حذف**.

---

## بوابات التحقق (8-Gate Checklist)

| # | البوابة | الأمر / المصدر | النتيجة |
|---|---|---|---|
| G1 | TypeScript | `npx tsc --noEmit` | ✅ **PASS** (exit 0) |
| G2 | اختبارات الـ Engine | `npx vitest run lib/tools/engines/tool-036` | ✅ **PASS 27/27** (2 ملف) |
| G3 | أمان العلم (Flag gating) | `npx vitest run components/tools/tool-036-injection-schedule.test.tsx` | ✅ **PASS 3/3** |
| G4 | Lint | `npx eslint` (5 ملفات) | ✅ **PASS** — 0 خطأ (2 تحذير: ملفات الاختبار مُستبعدة بنمط تجاهل ESLint نفسه) |
| G5 | Build | `next build` → `Compiled successfully` + 0 علامة خطأ | ✅ **PASS** |
| G6 | Bundle (L1 First-load JS) | صف المسار: `567 B / 103 kB` مقابل ميزانية `< 150 kB` | ✅ **PASS** |
| G7 | العلم افتراضي OFF | المصدر: `process.env.NEXT_PUBLIC_FT_TOOL036_SUPREME_V2 === 'true'` | ✅ **PASS** (OFF افتراضياً) |
| G8 | Lighthouse Mobile | `lighthouse --preset=perf --form-factor=mobile` | ❌ **FAIL** (详见 التقرير أدناه) |

**7/8 PASS — بوابة واحدة FAIL (G8).**

---

## تقرير Lighthouse — Mobile

المصادر (لم تُلتزم بالمستودع — `.superpowers/` مستبعد عمداً):
`.superpowers/sdd/tool-036-p1/lighthouse-tool036.report.json` · `lighthouse-tool036.report.html`
`.superpowers/sdd/tool-036-p1/lighthouse-tool035-baseline`

| المقياس | tool-036 (P1 L1, علم ON) | tool-035 (خط أساس — أداة لم تُمَس) | العتبة | الحكم |
|---|---|---|---|---|
| Performance | **67** | **61** | > 90 (فشل صريح < 85) | ❌ **FAIL** |
| LCP | **2253 ms** | **2806 ms** | < 1500 ms (فشل صريح > 1800) | ❌ **FAIL** |
| FCP | 2253 ms | 2806 ms | — | — |
| TBT | 2831 ms | 3314 ms | — | — |
| CLS | **0** | **0** | < 0.1 | ✅ **PASS** |
| Requests | 37 | 38 | — | — |
| Lighthouse | 13.5.0, `formFactor=mobile` | 13.5.0, `formFactor=mobile` | — | — |
| `fetchTime` | `2026-10-17T16:18:32.438Z` | `2026-10-17T16:24:17.141Z` | — | — |
| `finalUrl` | `/injection-formulation/tool-036-injection-schedule` | `/pharmacokinetics/tool-035-hormone-conversion` | — | 200 OK كلاهما |

### ما يثبتّه هذا القياس بصدق

1. **بوابة G8 تفشل فشلاً صريحاً** على العتبات المعلنة (Performance 67 < 85، و LCP 2253 > 1800 = عتبة الفشل الصريح). **لا يُطالبَج بنجاح غير مثبت.**
2. **P1 لم يُدخل تدهوراً (Regression):** الأداة المُعتمدة غير المُعدَّلة `tool-035` تسجّل **أسوأ** (61 / 2806 ms) من أداة P1 على نفس البناء. أي أنّ المشكلة ليست من كود Level 1.
3. **LCP = FCP بالضبط** في الصفحتين (2253/2253 و 2806/2806) — إشارة حقيقية إلى أنّ عنصر LCP يُرسم عند أول رسم.
4. **CLS = 0** في الاثنتين.

### ما لا تثبتّه — صراحة

- **سبب جذري (Root Cause) غير مُحدَّد.** تقرير Lighthouse 13.5.0 هنا **لا يحوي** audit `largest-contentful-paint-element` إطلاقاً (audit المُتاح هو `largest-contentful-paint` للتوقيت فقط) → **لا يوجد إسناد لعنصر LCP**.
- **فرضية الأُوفرلاي (Overlay) مُرفوضة بالأدلة:** البحث في **كلتا التقريرين** و **HTML الـ SSR المحفوظ** يعطي **صفر** مطابقات لـ `fixed inset-0` / `backdrop-blur` / `pointer-events-none` / `opacity-0` / `data-testid` / `role="dialog"`. الخلاصة السابقة القائلة بأنّ «أُوفرلاي شفافاً هو عنصر LCP» **غير مسنودة**، وقد سُحبت.
- **NOT RUN:** تحسين الأداء وإعادة القياس بعد المعالجة.

---

## git status / diff --stat

```
$ git status --short
?? .superpowers/sdd/tool-036-p1/          (مستبعد عن الالتزام عمداً)
```

**هذا الـ PR (commit P1):**

```
 10 files changed, 1886 insertions(+), 3 deletions(-)

 lib/tools/engines/tool-036-injection-schedule.ts    | 358 ++++++++++++
 lib/tools/schemas/tool-036-injection-schedule.ts    |  69 ++
 components/tools/tool-036-injection-schedule.tsx    | 216 ++++++-
 lib/tools/engines/tool-036-chrono.test.ts            | 197 +++++++
 components/tools/tool-036-injection-schedule.test.tsx|  40 ++
 docs/design/tool-036-supreme-v2-design.md            | 400 ++++++++++++
 docs/design/wireframes/tool-036-wireframes.md        | 234 +++++++
 docs/evidence/tool-036-evidence-table.md             | 142 ++++++
 docs/perf/tool-036-budget.md                         |  78 +++
 docs/tool-036-v2-spec.md                             | 155 +++++
```

**كامل الفرق مقابل `origin/main`:** `18 files changed, 2266 insertions(+), 53 deletions(-)`

**Commits في الـ PR:**

```
41dc2ad feat(tool-036): P1 LEVEL1 MVP behind flag (OFF default)
adda779 fix(tool-111): complete macro inputs and localize adherence findings
752c26c fix(tool-111): correct form field typing and adherence property
d9cb16d docs(tool-111): record TypeScript verification blocked by environment timeout
```

---

## الالتزام بـ HOLD-LIFT

- ✅ الفرع `feat/tool-036-supreme-v2-evidence-based` فقط — **`main` لم تُمَس** (محلياً `adda779`).
- ✅ العلم افتراضي **OFF** — rollback = `false` → صفر خطر.
- ✅ **P1 فقط** (Level 1) — لا Level 2/3 ولا Gantt ولا Charts.
- ✅ **TDD أولاً** — اختبارات الـ Engine كُتبت قبل التنفيذ (RED ثم GREEN).
- ✅ الملفات المسموحة فقط: engine / schema / component (+ اختباراتها + docs).
- ✅ **لا** `registry.ts` / `validation.ts` — StackStatus مؤجّل.
- ✅ لا دمج إلى `main`، لا نشر، لا `#112–#115`.

## rollback

`NEXT_PUBLIC_FT_TOOL036_SUPREME_V2=false` (أو إزالتها) → يعود بالكامل إلى واجهة v1 دون أي أثر.

## ملاحظة أمان

تذييل تعليمي دائم + «لا ادعاء بلا مصدر» + تسمية ثقة لكل دليل. الصف ذات Confidence منخفض أو بلا URL يُعامل **Heuristic/Low** ولا يُقدَّم كحقيقة سريرية.
