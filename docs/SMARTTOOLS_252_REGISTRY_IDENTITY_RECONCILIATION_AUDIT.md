# SMARTTOOLS 252 Registry and Identity Reconciliation Audit

**Phase:** 0.2 — registry and identity reconciliation  
**Audit date:** 2026-10-25 (Africa/Cairo)  
**Scope:** Read-only reconciliation. No implementation, staging, commit, push, database write, migration, or deployment was performed.

## Executive result

- Approved v7: **252 records, 252 unique slugs and IDs, no duplicates**.
- Current TOOL_REGISTRY: **154 records, 154 unique slugs, 0 duplicates**.
- Ten catalogs: **166 entries, 166 unique slugs, 0 duplicates**.
- Catalog/registry: catalog-only **12**, registry-only **0**, intersection **154**, union **166**.
- Exact v7 slug overlap: **5** (aromatization-risk, one-rep-max, protein-needs, strength-standards, water-intake); exact non-overlap **247**.
- Crosswalk: EXACT_MATCH **5**, POSSIBLE_CONCEPTUAL_MATCH **93**, UNRESOLVED **154**, VERIFIED_ALIAS **0**.

Historical “130 registry records” is not reproducible from HEAD or the worktree. Its provenance remains unverified; it is not reconciled by assumption.

## Working-tree snapshot

- Branch: main.
- HEAD: 254ce1299bff227c54809bb7027f9b587d69c143 (feat(tool-146): add emergency warning checklist).
- Before audit outputs: git status --short = 454 lines; git status --short --untracked-files=all = 564 paths (29 tracked modified, 535 untracked leaves).
- No existing paths were changed or staged. This audit adds only this report and its CSV.

## A. Registry counts and provenance

| Physical file | Exported symbol | Counting basis | Raw | Unique | Duplicates |
|---|---|---|---:|---:|---:|
| E:/MrXSteroid-main/lib/tools/registry.ts | TOOL_REGISTRY | object entries with toolId, slug, href | 154 | 154 slugs | 0 |
| E:/MrXSteroid-main/lib/engines/core/v6/tools.registry.v7.252.ts | TOOLS_REGISTRY_V7_252 | exported records; id=slug, number=numeric ID | 252 | 252 slugs; 252 IDs | 0 |

The v7 source is untracked in this worktree. Export declaration at line 19; records at lines 20–271. TOOL_REGISTRY declaration at line 32.

### Ten catalog files

| Physical file | Exported symbol | Raw entries |
|---|---|---:|
| E:/MrXSteroid-main/lib/tools/smartToolsCatalog.ts | SMART_TOOLS_CATALOG | 11 |
| E:/MrXSteroid-main/lib/tools/smartToolsCatalog2.ts | SMART_TOOLS_CATALOG_2 | 5 |
| E:/MrXSteroid-main/lib/tools/smartToolsCatalog3.ts | SMART_TOOLS_CATALOG_3 | 8 |
| E:/MrXSteroid-main/lib/tools/smartToolsCatalog4.ts | SMART_TOOLS_CATALOG_4 | 4 |
| E:/MrXSteroid-main/lib/tools/smartToolsCatalog5.ts | SMART_TOOLS_CATALOG_5 | 11 |
| E:/MrXSteroid-main/lib/tools/smartToolsCatalog6.ts | SMART_TOOLS_CATALOG_6 | 20 |
| E:/MrXSteroid-main/lib/tools/smartToolsCatalog7.ts | SMART_TOOLS_CATALOG_7 | 25 |
| E:/MrXSteroid-main/lib/tools/smartToolsCatalog8.ts | SMART_TOOLS_CATALOG_8 | 25 |
| E:/MrXSteroid-main/lib/tools/smartToolsCatalog9.ts | SMART_TOOLS_CATALOG_9 | 25 |
| E:/MrXSteroid-main/lib/tools/smartToolsCatalog10.ts | SMART_TOOLS_CATALOG_10 | 32 |

Catalog sum: **166 raw / 166 unique / 0 duplicate slugs.**

### 130 versus 154

Current E:/MrXSteroid-main/lib/tools/registry.ts contains 154 records / 154 unique slugs. HEAD contains 121 / 121. The worktree diff is +34 and −1 (net +33), explaining 121 → 154, not 130. The untracked SMARTTOOLS_252_MASTER_INVENTORY.md contradicts itself: catalog file counts sum to 166; one part says registry 130 and combined raw 296, another says 130 + 157, and another says catalog raw 294. It says unique 166 and duplicates 126, although 296−166=130. It says v7 exact overlap 3 / unmatched 249; checked-out sources yield exact overlap 5 / unmatched 247. No checked-out source supports 130; historical source revision/count rule is unknown and unresolved.

Set reconciliation: 154 intersection; 12 catalog-only; 0 registry-only; union 166.

## B. Complete crosswalk

The full 252-row evidence-backed crosswalk is SMARTTOOLS_252_IDENTITY_CROSSWALK.csv; columns include v7 ID/slug, names, source line, route, local candidate/source line/route, classification and evidence note.
EXACT_MATCH = literal slug equality only. POSSIBLE_CONCEPTUAL_MATCH = resemblance without explicit mapping. UNRESOLVED = no sufficiently evidenced candidate. VERIFIED_ALIAS requires explicit approved evidence; none was found. No conceptual match is called a verified alias.

### Exact UNRESOLVED identity list

#2 lean-body-mass, #3 fat-mass-index, #5 ideal-body-weight, #6 waist-to-hip-ratio, #7 waist-to-height-ratio
#8 body-adiposity-index, #9 body-shape-index, #10 ponderal-index, #11 body-surface-area, #12 frame-size
#13 somatotype, #14 muscle-mass-percentage, #15 bone-mass, #16 body-water-percentage, #17 body-protein-percentage
#18 bmr, #19 tdee, #20 body-fat-distribution, #21 visceral-fat, #22 subcutaneous-fat
#23 limb-length-ratios, #24 sitting-height-ratio, #25 arm-span-to-height, #26 calorie, #27 macro-split
#29 carb-cycling, #30 fat-needs, #31 fiber-needs, #32 meal-timing, #33 glycemic-load
#34 insulin-load, #35 thermic-effect-of-food, #36 alcohol-calories, #37 cheat-meal-planner, #38 refeed
#39 diet-break-planner, #40 reverse-dieting, #42 electrolyte-needs, #43 vitamin-mineral-needs, #44 supplement-dosage
#45 creatine-loading, #46 caffeine, #47 pre-workout-timing, #48 post-workout-nutrition, #49 intermittent-fasting-timer
#50 anabolic-window, #51 training-volume, #52 intensity, #53 rpe-to-1rm-converter, #54 rir
#55 progressive-overload-planner, #56 deload, #57 training-frequency-optimizer, #58 rest-period, #59 superset-planner
#60 drop-set, #61 myo-reps, #62 rest-pause, #63 cluster-sets, #64 german-volume-training
#65 5x5, #66 5-3-1, #67 nsuns, #68 training-split-generator, #69 weekly-volume-per-muscle
#70 effective-reps, #71 junk-volume-detector, #72 recovery-time, #73 sleep-need-for-recovery, #74 hrv-based-readiness
#75 acwr, #76 monotony-strain, #77 training-stress-score, #78 fatigue-accumulation, #79 overtraining-risk
#80 active-recovery-planner, #81 mobility-score, #82 symmetry-index, #83 injury-risk-predictor, #84 pain-scale-tracker
#85 rehab-timeline, #87 wilks-score, #88 dots-score, #89 ipf-points, #90 sinclair-coefficient
#91 relative-strength, #93 power, #94 force, #95 work, #96 impulse-momentum
#97 rate-of-force-development, #98 reactive-strength-index, #99 rsi-modified, #100 jump-height-to-power, #101 sprint-speed-acceleration
#102 agility-t-test, #103 illinois-agility, #104 40-yard-dash-converter, #105 vertical-jump-power, #106 broad-jump-power
#107 medicine-ball-throw, #108 wingate-power-test, #109 critical-power, #110 vo2max-estimator, #111 lactate-threshold
#112 heart-rate-zones, #113 pace, #114 running-power, #115 cycling-power-ftp, #116 golden-ratio-physique
#117 shoulder-to-waist-ratio, #118 chest-to-waist-ratio, #119 arm-to-waist-ratio, #120 leg-to-torso-ratio, #121 arm-length-to-height
#122 calf-to-bicep-ratio, #123 neck-to-arm-ratio, #124 physique-rating-scale, #125 bodybuilding-competition-score, #126 neuromuscular-performance-modeler
#127 daily-readiness-cause-explainer, #128 training-load-balance-acwr, #129 adaptive-training-program-planner, #130 plateau-detective-stagnation-analyzer, #131 transformation-forecast-engine
#132 pose-form-coach-vision, #133 rep-tempo-velocity-loss-analyzer, #134 mobility-symmetry-screen, #135 exercise-substitution-advisor, #136 physique-proportion-balance
#137 testosterone-to-epit-ratio, #138 free-testosterone, #139 shbg, #140 estradiol-management, #141 prolactin-risk
#142 hematocrit-hemoglobin-tracker, #143 blood-pressure-risk, #144 lipid-panel-analyzer, #145 liver-enzymes-analyzer, #146 kidney-function
#151 accumulation-half-life-simulator, #157 multi-compound-half-life, #158 injection-volume, #159 compound-half-life-stacker, #162 oral-cycle-planner
#163 trt-optimization-engine, #164 post-cycle-bloodwork-interpreter, #165 drug-interaction-checker-pro, #166 injection-pain-minimizer, #175 injection-schedule-planner
#187 insulin-conversion, #188 glucose-tracker, #190 androgen-receptor-optimizer, #191 5-alpha-conversion

Count: **154 UNRESOLVED**. Conceptual rows remain unverified and are not included in that list.

## App tools 147–150 vs v7 249–252

App IDs and v7 numbers are independent namespaces. Candidate mappings are name-based only; preserve all existing local IDs/routes.

| App ID | Local slug and line | Existing route | Candidate v7 identity and line | Classification | Confidence / caveat |
|---:|---|---|---|---|---|
| 147 | tool-147-scientific-evidence-explorer at E:/MrXSteroid-main/lib/tools/smartToolsCatalog10.ts:33 | /smarttools/tool-147-scientific-evidence-explorer | v7 #249 scientific-evidence-explorer at E:/MrXSteroid-main/lib/engines/core/v6/tools.registry.v7.252.ts:268 | POSSIBLE_CONCEPTUAL_MATCH | Strong name resemblance; no explicit alias evidence; preserve local identity/route. |
| 148 | tool-148-personal-fitness-memory-layer at E:/MrXSteroid-main/lib/tools/smartToolsCatalog10.ts:34 | /smarttools/tool-148-personal-fitness-memory-layer | v7 #250 personal-fitness-memory-layer at E:/MrXSteroid-main/lib/engines/core/v6/tools.registry.v7.252.ts:269 | POSSIBLE_CONCEPTUAL_MATCH | Strong name resemblance; no explicit alias evidence; preserve local identity/route. |
| 149 | tool-149-physique-trajectory-simulator at E:/MrXSteroid-main/lib/tools/smartToolsCatalog10.ts:35 | /smarttools/tool-149-physique-trajectory-simulator | v7 #251 physique-trajectory-simulator at E:/MrXSteroid-main/lib/engines/core/v6/tools.registry.v7.252.ts:270 | POSSIBLE_CONCEPTUAL_MATCH | Strong name resemblance; no explicit alias evidence; preserve local identity/route. |
| 150 | tool-150-ai-performance-command-center at E:/MrXSteroid-main/lib/tools/smartToolsCatalog10.ts:36 | /smarttools/tool-150-ai-performance-command-center | v7 #252 command-center at E:/MrXSteroid-main/lib/engines/core/v6/tools.registry.v7.252.ts:271 | POSSIBLE_CONCEPTUAL_MATCH | Strong name resemblance; no explicit alias evidence; preserve local identity/route. |

- App #147 ↔ v7 #249: planned; identity/privacy and NCBI setup remain prerequisites.
- App #148 ↔ v7 #250: memory semantics require a separate privacy decision; no automatic cross-tool source evidenced.
- App #149 ↔ v7 #251: implemented locally; preserve route; accessibility review remains outstanding.
- App #150 ↔ v7 #252: planned; manual aggregation and privacy boundaries require separate approval.
- v7 #147–150 are thyroid-panel, insulin-sensitivity, aromatization-risk, pct-planner-recovery-timeline. v7 #149 exactly matches local aromatization-risk, not application #149.
- Official NCBI E-utilities docs specify tool/email identification and rate policy: [overview](https://www.ncbi.nlm.nih.gov/books/NBK25497/) and [reference](https://www.ncbi.nlm.nih.gov/books/NBK25499/). No external API call made.

## Quality checks

| Exact check | Exit code | Output |
|---|---:|---|
| git branch --show-current | 0 | main |
| git rev-parse HEAD | 0 | 254ce1299bff227c54809bb7027f9b587d69c143 |
| git status --short (initial) | 0 | 454 status lines |
| git status --short --untracked-files=all (initial) | 0 | 564 paths: 29 tracked modified, 535 untracked leaves |
| Python parser: each catalog line containing slug | 0 | counts above; 166 raw / 166 unique / 0 duplicates |
| Python parser: TOOL_REGISTRY objects with toolId/slug/href | 0 | 154 / 154 unique / 0 duplicates |
| git show HEAD:E:/MrXSteroid-main/lib/tools/registry.ts plus same parser | 0 | 121 / 121 unique / 0 duplicates |
| Python parser: v7 id/number/toolPage records | 0 | 252 / 252 unique slugs / 252 unique IDs |
| Catalog vs registry set operation | 0 | 12 catalog-only; 0 registry-only; 154 intersection; 166 union |
| Local union vs v7 slug set | 0 | 5 exact; 247 without exact local slug |
| rg search for explicit v7 alias map | 0 | none located |
| Focused tests, validate-tools, TypeScript, ESLint, production build | NOT RUN | No implementation/code changed. |
| First strict catalog-entry parser | 1 | AssertionError: strict field-order expression counted 164 instead of all 166; BLOCKED and superseded after confirming two records place href after order. |
| Crosswalk CSV structural validation (Python csv.DictReader) | 0 | 252 rows; IDs 1–252 unique; 5 EXACT_MATCH, 93 POSSIBLE_CONCEPTUAL_MATCH, 154 UNRESOLVED; no invalid class, missing v7 evidence/route, or missing candidate evidence. |
| Final git status --short after creating audit artifacts | 0 | 456 lines, exactly the initial 454 plus the two new audit files. |
| Final git status --short --untracked-files=all | 0 | 566 paths, exactly the initial 564 plus the two new audit files. |
| Exploratory strict regex | 0 | Missed two catalog rows whose href field follows order; discarded and replaced with line parser counting slug-bearing rows. |

### Reproducible count command (Windows PowerShell)

Run this from the repository root. It parses the checked-out record lines, treats v7 lines as tool records only when they contain a numeric `number` field, and verifies the crosswalk class totals.

~~~powershell
@'
from pathlib import Path
from collections import Counter
import csv, re

root = Path('.')
cat_files = sorted((root / 'lib/tools').glob('smartToolsCatalog*.ts'))
cat_slugs = set()
cat_raw = 0
for path in cat_files:
    slugs = [m.group(1) for line in path.read_text(encoding='utf-8').splitlines()
             if (m := re.search(r"\bslug:\s*'([^']+)'", line))]
    counts = Counter(slugs)
    cat_raw += len(slugs)
    cat_slugs.update(slugs)
    print(f'{path.as_posix()}: raw={len(slugs)} unique={len(counts)} duplicates={len(slugs)-len(counts)}')

reg_path = root / 'lib/tools/registry.ts'
reg_rows = []
for line in reg_path.read_text(encoding='utf-8').splitlines():
    if 'toolId:' in line and 'href:' in line:
        slug = re.search(r"\bslug:\s*'([^']+)'", line)
        tool_id = re.search(r"\btoolId:\s*'([^']+)'", line)
        if slug and tool_id:
            reg_rows.append((tool_id.group(1), slug.group(1)))
reg_slugs = [slug for _, slug in reg_rows]
print(f'TOOL_REGISTRY {reg_path.as_posix()}: raw={len(reg_rows)} unique_slugs={len(set(reg_slugs))} duplicates={len(reg_slugs)-len(set(reg_slugs))}')

v7_path = root / 'lib/engines/core/v6/tools.registry.v7.252.ts'
v7_rows = []
for line in v7_path.read_text(encoding='utf-8').splitlines():
    number = re.search(r"\bnumber:\s*(\d+)", line)
    slug = re.search(r"\bid:\s*'([^']+)'", line)
    if number and slug:
        v7_rows.append((int(number.group(1)), slug.group(1)))
v7_ids = [number for number, _ in v7_rows]
v7_slugs = [slug for _, slug in v7_rows]
print(f'TOOLS_REGISTRY_V7_252 {v7_path.as_posix()}: raw={len(v7_rows)} unique_ids={len(set(v7_ids))} unique_slugs={len(set(v7_slugs))} duplicate_ids={len(v7_ids)-len(set(v7_ids))} duplicate_slugs={len(v7_slugs)-len(set(v7_slugs))}')
reg_set = set(reg_slugs)
print(f'CATALOG/REGISTRY: catalog_raw={cat_raw} catalog_unique={len(cat_slugs)} registry_raw={len(reg_rows)} registry_unique={len(reg_set)} catalog_only={len(cat_slugs-reg_set)} registry_only={len(reg_set-cat_slugs)} intersection={len(cat_slugs & reg_set)} union={len(cat_slugs | reg_set)}')

with (root / 'docs/SMARTTOOLS_252_IDENTITY_CROSSWALK.csv').open(encoding='utf-8-sig', newline='') as file:
    crosswalk = list(csv.DictReader(file))
print(f'CROSSWALK rows={len(crosswalk)} classes={dict(Counter(row["classification"] for row in crosswalk))}')
~~~

## Final status

**READY FOR HUMAN REVIEW** — source counts and all 252 crosswalk rows are recorded. Historical provenance of 130 remains unresolved; conceptual matches are not alias approvals. Stop for owner review; no tools implemented and no commit made.

## Continuation revalidation — 2026-10-25

The CSV and its referenced source locations were rechecked against the current worktree. All 252 v7 IDs are unique and complete; all v7 and resolved candidate source files/line numbers exist, and every cited slug occurs within four lines of its cited location. Candidate evidence is expected only for the 98 non-UNRESOLVED rows. No classifications or source files were changed.

Exact command (PowerShell from repository root):

~~~powershell
@'
import csv, re
from pathlib import Path
from collections import Counter
root = Path.cwd()
with (root/'docs/SMARTTOOLS_252_IDENTITY_CROSSWALK.csv').open(encoding='utf-8-sig',newline='') as f: rows=list(csv.DictReader(f))
classes=Counter(r['classification'] for r in rows); errors=[]
if len(rows)!=252 or sorted(int(r['v7_id']) for r in rows)!=list(range(1,253)): errors.append('row/id count')
for i,row in enumerate(rows,1):
    if not all(row[k] for k in ('approved_v7_slug','v7_source_path_line','approved_v7_route')): errors.append(f'{i}:v7 fields')
    if row['classification']=='UNRESOLVED':
        if any(row[k] for k in ('candidate_local_slug','candidate_source_path_line','candidate_local_route')): errors.append(f'{i}:unexpected candidate')
    elif not all(row[k] for k in ('candidate_local_slug','candidate_source_path_line','candidate_local_route','evidence_notes')): errors.append(f'{i}:candidate fields')
    for field,slug in (('v7_source_path_line',row['approved_v7_slug']),('candidate_source_path_line',row['candidate_local_slug'])):
        for evidence in filter(None,(x.strip() for x in row[field].split(';'))):
            m=re.match(r'^(.*):(\d+)$',evidence)
            if not m: errors.append(f'{i}:unparsed {field}'); continue
            path,line=Path(m.group(1)),int(m.group(2))
            if not path.is_file(): errors.append(f'{i}:missing file {path}'); continue
            lines=path.read_text(encoding='utf-8-sig',errors='replace').splitlines()
            if line<1 or line>len(lines): errors.append(f'{i}:line out of range {path}:{line}'); continue
            if slug and slug not in '\n'.join(lines[max(0,line-5):min(len(lines),line+4)]): errors.append(f'{i}:slug not near {path}:{line}')
print(f'rows={len(rows)} ids_unique={len({r["v7_id"] for r in rows})} classes={dict(classes)}')
print(f'evidence_errors={len(errors)}')
for error in errors: print(error)
'@ | python -
~~~

Result: **exit 0**; `rows=252 ids_unique=252 classes={'POSSIBLE_CONCEPTUAL_MATCH': 93, 'UNRESOLVED': 154, 'EXACT_MATCH': 5}`; `evidence_errors=0`. Continuation Git snapshot: branch `main`, HEAD `254ce1299bff227c54809bb7027f9b587d69c143`, 461 `git status --short` rows (32 tracked modified, 429 untracked), 0 staged. No Git mutation, implementation, database access, migration, commit, push, or deployment.

## Current checked-out source-count reconciliation — 2026-10-26

The earlier 154-record `TOOL_REGISTRY` count is stale against the current working tree. A direct recount now finds:

| Source | Physical source and symbol | Raw records | Unique IDs/slugs | Duplicate IDs/slugs |
|---|---|---:|---:|---:|
| App catalog | Ten `lib/tools/smartToolsCatalog*.ts` files; literal rows with `toolId` and `slug` | 166 | 166 | 0 |
| App registry | `lib/tools/registry.ts`, `TOOL_REGISTRY` | 159 | 159 | 0 |
| Approved V7 registry | `lib/engines/core/v6/tools.registry.v7.252.ts`, `TOOLS_REGISTRY_V7_252` | 252 | 252 IDs and 252 numeric IDs | 0 |

Current catalog/registry slug sets: intersection **159**, catalog-only **7**, registry-only **0**, union **166**. Catalog-only slugs are `bmr-tdee`, `protein-needs`, `water-intake`, `tool-132-ai-pose-form-coach`, `tool-137-peptide-hormone-reconstitution-calculator`, `tool-138-raw-powder-density-oil-formulation-engine`, and `tool-139-solvent-emulsifier-ratio-calculator`.

The historical report's **154** is superseded by the current count **159**. The previously reported **130** remains unreconciled: the current checked-out source does not produce that value, and no historical counting rule or snapshot has been established. These values must not be merged or explained by assumption. The ten-catalog sum is 166, not the old report's 157 or 154.

The existing crosswalk CSV still has 252 rows with 5 `EXACT_MATCH`, 93 `POSSIBLE_CONCEPTUAL_MATCH`, 154 `UNRESOLVED`, and 0 `VERIFIED_ALIAS`; the prior source-evidence validator reported zero line-evidence errors at its checkpoint. This addendum does **not** regenerate its candidate mappings. Since the catalog and Registry have changed since that check, current candidate-local paths/classifications require a fresh full crosswalk review before treating the CSV as current. The exact-slug intersection remains 5 (`aromatization-risk`, `one-rep-max`, `protein-needs`, `strength-standards`, `water-intake`); conceptual matches remain unverified aliases.

Reproducible recount (PowerShell, run at repository root):

~~~powershell
$catalogFiles = Get-ChildItem -LiteralPath 'lib/tools' -Filter 'smartToolsCatalog*.ts'
$catalogSlugs = foreach ($file in $catalogFiles) {
  foreach ($line in Get-Content -LiteralPath $file.FullName) {
    if ($line -match "toolId:\s*'[^']+'" -and $line -match "slug:\s*'([^']+)'") { $Matches[1] }
  }
}
$registrySlugs = foreach ($line in Get-Content -LiteralPath 'lib/tools/registry.ts') {
  if ($line -match "slug:\s*'([^']+)'") { $Matches[1] }
}
$v7Records = Get-Content -LiteralPath 'lib/engines/core/v6/tools.registry.v7.252.ts' |
  Where-Object { $_ -match 'number:\s*\d+' -and $_ -match "id:\s*'" }
$crosswalkRows = Import-Csv 'docs/SMARTTOOLS_252_IDENTITY_CROSSWALK.csv'
[pscustomobject]@{
  CatalogRaw = @($catalogSlugs).Count
  CatalogUnique = @($catalogSlugs | Sort-Object -Unique).Count
  RegistryRaw = @($registrySlugs).Count
  RegistryUnique = @($registrySlugs | Sort-Object -Unique).Count
  V7Records = @($v7Records).Count
  CrosswalkRows = @($crosswalkRows).Count
}
~~~

Result in this audit run: catalog 166/166; registry 159/159; V7 252; crosswalk 252. The catalog/registry set arithmetic above was separately computed from their unique literal slug sets. No code, routes, identities, crosswalk classifications, database, or migrations were changed in this recount. Current Git state remains `main` / `254ce1299bff227c54809bb7027f9b587d69c143`, 957 porcelain rows, 0 staged. **Human review remains required** for the refreshed crosswalk and the unresolved 130-count provenance.

The current crosswalk evidence validator was rerun after the recount. It found two stale candidate references in `lib/tools/registry.ts` for exact rows #86 (`one-rep-max`) and #92 (`strength-standards`); both line references were verified directly and corrected from 184→189 and 185→190. The same 252-row validator then returned **exit 0**, with all 252 IDs unique, the same class totals (93 possible conceptual, 154 unresolved, 5 exact), and **0 evidence errors**.

A separate cross-check of the 98 non-empty local candidates against all 166 current catalog records found **0 missing candidate slugs**, **6 stale local routes**, and **0 exact-match classification errors**. The six stale route fields were corrected in the CSV to the current catalog `href` values for rows #172 (`tool-033-bloodwork-trend-analyzer`), #173 (`tool-034-compound-clearance`), #174 (`tool-035-hormone-conversion`), #243 (`tool-141-carrier-oil-viscosity-syringe-pressure`), #244 (`tool-142-compound-purity-active-yield-estimator`), and #249 (`tool-147-scientific-evidence-explorer`). Re-running that check returned `catalog_records=166`, `crosswalk_rows=252`, `candidate_rows=98`, `missing_candidates=0`, `route_mismatches=0`, and `exact_classification_errors=0`. These CSV edits correct current evidence only; they do not approve conceptual aliases or change any tool identity, route, or classification. A full owner review of the conceptual and unresolved mappings remains outstanding.

### Crosswalk duplicated-root correction copy — 2026-10-27

The separate file `docs/SMARTTOOLS_252_IDENTITY_CROSSWALK_DRAFT_2026-10-27_PATHS_CORRECTED.csv` corrects only a duplicated `E:/MrXSteroid-main/` prefix in candidate source-path cells from the existing 27 October draft. It does not overwrite either prior CSV or change row identities, classifications, routes, or source line numbers. Read-only validation of this corrected copy found 252 rows, 5 `EXACT_MATCH`, 93 `POSSIBLE_CONCEPTUAL_MATCH`, 154 `UNRESOLVED`, 0 `VERIFIED_ALIAS`; all 191 candidate path/line references and all 252 V7 source references resolve to existing lines containing the stated slug after normalization, with 0 invalid references. The 98 candidate slugs remain present in the current catalog or registry. This repair makes the citations consumable as paths; it does not complete conceptual discovery or owner approval. Keep the prior crosswalk files intact and use this corrected-root copy for the next human review.

## Current worktree recount and crosswalk review copy — 2026-10-27

The preceding totals describe an earlier worktree snapshot. Reimporting the current source exports gives catalog=268 raw/unique slugs, published=264, `TOOL_REGISTRY`=261 raw/unique slugs, and V7=252 unique IDs. `HEAD` has 150 catalog entries and 121 registry records and does not contain the V7 file. Current full counts and set comparison are recorded in `docs/GENIUS_TOOL_V3_BASELINE_AUDIT.md` under “Catalog and registry recount”.

The original `SMARTTOOLS_252_IDENTITY_CROSSWALK.csv` was preserved. A separate evidence-repair copy is `docs/SMARTTOOLS_252_IDENTITY_CROSSWALK_DRAFT_2026-10-27.csv`: 252 unique V7 rows; 5 exact, 93 possible conceptual, 154 unresolved; all 252 V7 source references and all 98 retained candidate source references validate against current line content. It separates catalog and registry hrefs; those differ on 10 rows, while five old candidate route values in the original CSV no longer equal the current catalog href. Among unresolved rows, 151 have same-number local slugs, but number equality was not used as concept or alias evidence (for example V7 #6 waist-to-hip ratio vs App #6 estrogen/prolactin record). The draft preserves prior candidate discovery and classifications; a fresh conceptual search across all current local entries and full owner review remain outstanding. It does not establish conceptual equivalence or authorize a rollout.
