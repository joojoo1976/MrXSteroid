# V7 Tools 156–160 Scope Proposal (2026-10-26)

| ID | Approved identity | Category | Description | Route | Boundary |
|---:|---|---|---|---|---|
| 156 | water-retention | steroid-pharmacokinetics | يقدّر احتباس الماء من الإستروجين والصوديوم | /tools/water-retention | Requires per-tool source/safety review before implementation |
| 157 | multi-compound-half-life | steroid-pharmacokinetics | يحسب أعمار النصف لستاك كامل | /tools/multi-compound-half-life | Requires per-tool source/safety review before implementation |
| 158 | injection-volume | steroid-pharmacokinetics | يحدد الحجم الآمن لكل موقع حقن | /tools/injection-volume | Requires per-tool source/safety review before implementation |
| 159 | compound-half-life-stacker | steroid-pharmacokinetics | يحدد التوقيت المثالي للحقن | /tools/compound-half-life-stacker | Requires per-tool source/safety review before implementation |
| 160 | genetic-potential | steroid-pharmacokinetics | يقدّر الحد الأقصى الطبيعي للعضلات | /tools/genetic-potential | Requires per-tool source/safety review before implementation |

No application implementation was started.

## Tools 156–160 engine checkpoint (2026-10-26)
Implemented v7 standalone engines with strict finite schemas and explicit educational boundaries:
- 156 records arithmetic difference between user-entered weights; no fluid-retention diagnosis.
- 157 calculates independent half-life entries; no stack/dose/timing recommendation.
- 158 computes generic volume ratio; never labels an injection volume safe.
- 159 computes independent decay factors; no injection schedule.
- 160 returns an illustrative measurement index; no genetic-limit prediction.
Verification: 1 file / 5 tests PASS; TypeScript PASS. UI/registry integration remains a separate checkpoint after route identity review.

## Tools 156–160 application integration checkpoint (2026-10-26)
- Added unique Page identities, registry records, category-first routes, and bilingual UI components.
- Canonical routes: `/smarttools/steroid-pharmacokinetics/tool-156-water-retention`, `/smarttools/steroid-pharmacokinetics/tool-157-multi-compound-half-life`, `/smarttools/steroid-pharmacokinetics/tool-158-injection-volume`, `/smarttools/steroid-pharmacokinetics/tool-159-compound-half-life-stacker`, `/smarttools/steroid-pharmacokinetics/tool-160-genetic-potential`.
- Focused tests 156–160: PASS (5/5); TypeScript PASS; validate-tools PASS (5/5); production build PASS (395/395 pages).
- Existing warning state unchanged: stale Browserslist data and unset metadataBase.
- No database writes, migrations, commit, push, or deployment.
