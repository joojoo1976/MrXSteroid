# تقرير: tool-036 SUPREME V3 — Dark OS

> 2026-10-18 · `main` = **db23fb7d** · الحالة: **مكتمل، مرفوع، LIVE موثّق** ✅

## ما بُني (بدون Flag — V3 هو الافتراضي)

| الميزة | التنفيذ |
|---|---|
| **DESIGN Dark OS** | `bg-[#0A0A0B]` + بطاقات glass (`bg-white/[0.03] backdrop-blur border-white/10`) + `font-mono` |
| **Weekly Calendar drag-drop** | `components/tools/tool-036-weekly-calendar.tsx` — dnd-kit، 7 أعمدة، + أزرار ←/→ للمس (تعادل سحب على اللمس) |
| **Body Map 2D SVG** | 8 نقاط تفاعلية، كل نقطة هدف لمس **44×44**، ألوان حسب آخر استخدام (`never/rest/healing/ready`) |
| **Rotation Engine** | `DEFAULT_ROTATION_SITES` = `dorso-l → dorso-r → ventro-l → ventro-r → deltoid → vastus` + `buildRotationPlan` 12 أسبوعًا + `validateRotation` |
| **Volume Guard** | شارة `data-zone` (green/yellow/red) + تلميح `<details>` بالدليل (معرّف + ثقة) |
| **Comfort Tracker** | مدخل 0–10، متوسط آخر 5، نافذة الالتئام 7d/14d، توصيات |
| **Next Injection countdown** | عدّاد حيّ (يتحدث كل ثانية) عبر `nextInjection()` نقي |
| **DATA** | `ESTER_PROFILES` (7 مركّبات حقيقية AR/EN) + حساب **mg/wk حيّ** + **This Week Gantt** + **PDF Export** عبر `window.print()` فقط |

## الميزات الجديدة في الـ engine (TDD)
`totalWeeklyMg` · `siteRecency` · `recencyTone` · `nextInjection` · `DEFAULT_ROTATION_SITES` — كلها **نقية** (بلا `Date.now()`/`Math.random()`).

## البوابات (كلها PASS — على الرتبة المُلتزم بها)

| البوابة | الدليل |
|---|---|
| tsc `--noEmit` | نظيف (لا أخطاء tool-036) |
| ESLint | **0 errors, 0 warnings** |
| الاختبارات | **76/76** (38 engine + 24 chrono + 8 قشرة V3 + 6 تقويم) |
| Build | `✓ Compiled successfully in 48s` |
| Pages | `✓ Generating static pages (310/310)` |
| First Load JS | `ƒ /smarttools/tool-036-injection-schedule  567 B  103 kB` → **< 150 kB** ✅ |
| **بوابة dnd-kit** | `DndContext` **غير موجود** في رَفّ المسار — يسكن في `5155-*.js` (52 KB) كسولًا؛ `recharts` أيضًا في رَفّ منفصل |

## الالتزام والدفع (دليل قاطع)
```
04fdafce  feat(tool-036): V3 engine helpers - weekly mg, site recency, next-injection countdown
32c2dda9  feat(tool-036): V3 weekly calendar with dnd-kit drag-drop + touch move parity
db23fb7d  feat(tool-036): SUPREME V3 dark-OS dashboard - drag-drop calendar, body map, auto rotation, volume guard, countdown, PDF

git push:     b913b104..db23fb7d  main -> main
ls-remote:    db23fb7db35be67b306785a819491e676643e4a2 = HEAD → MATCH ✅
```
حُذِّد فقط ملفات tool-036 + مستند الخطة. `.superpowers/` لم يُدرَج.

## LIVE موثّق (HTTP فعلي على الإنتاج)
```
URL : https://mrxsteroid.com/smarttools/injection-formulation/tool-036-injection-schedule
HTTP: 200   bytes: 37617 (كان 33859 على البناء السابق)
v3-shell: True   v3-calendar: True   weekly-mg: True
next-injection: True   volume-badge: True   body-map: True   CHRONO-INJECT: True
```

## التزامات صريحة
- **تم حذف القديم**: V1 وV2 لم يعد أي منهما يُعرض؛ الملف أعيد كتابته كقشرة V3 واحدة.
- **لا Flag إطلاقًا** — لا `NEXT_PUBLIC_...` ولا مسار احتياطي v1 (العقد القديم في اختبارات P1 استُبدل بعقد V3).
- حُدِّث اختباران كانا يرمزان «flag OFF ⇒ v1» إلى «V3 هو الافتراضي» — **بلا تعطيل أي اختبار وبلا نجاح زائف**.
- الاعتماديات الجديدة: `@dnd-kit/core ^6.3.1` فقط (أُزيل `@dnd-kit/sortable` لأنه غير مستخدم — YAGNI).
- `G8 Lighthouse` ما زال FAIL Site-Wide (Issue #9) — مسألة أداء معمّقة، **لم تُغلق ولم تُعالَج** هنا.
