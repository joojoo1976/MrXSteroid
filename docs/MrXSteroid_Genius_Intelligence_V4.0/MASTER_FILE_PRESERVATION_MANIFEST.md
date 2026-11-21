# MASTER_FILE_PRESERVATION_MANIFEST

**Updated:** 2026-11-06  
**Rule:** Every file listed below is preserved. Nothing in this list may be deleted, renamed, edited, or renumbered without a separate written owner decision.

Columns: path | kind | tracked state | SHA-256 (verified 2026-11-06 unless noted).

## A. Unified authorities — installed 2026-11-06 (owner-approved document consolidation)

| Path | Kind | State | SHA-256 |
|---|---|---|---|
| `docs/MrXSteroid_Genius_Intelligence_V4.0/SPEC.md` | Unified authority | replaced (owner-approved) | `5BE4514DEE1876065274ABE3A039A4C426595A1F3D0EAA04EC3ADC52C4F2018E` |
| `docs/MrXSteroid_Genius_Intelligence_V4.0/PROMPT.md` | Unified authority | replaced | `DBD31E6746669FA08FAC9C6E4339889947DCA4B52D6F773AABA73D9070C8BFF8` |
| `docs/MrXSteroid_Genius_Intelligence_V4.0/ACCEPTANCE_CRITERIA.md` | Unified authority | replaced | `715554A0445C0438DB827EDCDD0698143E619DB9820A305D9136B0F908BD0173` |

## B. Archived originals — byte-identical copies of the pre-unified authorities

| Path | Kind | SHA-256 |
|---|---|---|
| `docs/MrXSteroid_Genius_Intelligence_V4.0/archive/pre-unified-2026-11-06/SPEC.md` | Archive | `DD78850D64EDC9413ECC8AAC737781C4FE29DA03999E75642BA5D75F9F07D33B` |
| `docs/MrXSteroid_Genius_Intelligence_V4.0/archive/pre-unified-2026-11-06/PROMPT.md` | Archive | `83E6073486D659FA25CA91D9FF2835A64F286750DCD79781665F473EFB7D3E5F` |
| `docs/MrXSteroid_Genius_Intelligence_V4.0/archive/pre-unified-2026-11-06/ACCEPTANCE_CRITERIA.md` | Archive | `BDA16670868C217FCF7AB60D6CA9C7C92D6E7C028B6E5BE00AA164C4B6BFD760` |

Check: archives match the pre-merge originals exactly.

## C. Working-tree facts (not owner work; recorded, not accepted)

| Path | State | SHA-256 |
|---|---|---|
| `app/api/dashboard/metrics/route.ts` | PRE-EXISTING local modification (not authored this program) | `18CF045CBE7A5D7FB2BCA4E29B13F08C6AB594717F8424C53990C0D3D205A1AC` |
| `tests/integration/dashboardPersistence.test.ts` | PRE-EXISTING local modification | `4430B0C0C14B037460DA8F113208967C44D078DBCFC3E990324AF320B7DC9A22` |
| `tests/security/dashboardMetricsRouteAuth.test.ts` | UNTRACKED security test — pre-existing local work | `88D661534AD50DBB4C68C8B736DB6125BC6ED2F82C053CAA8DF0A0AF7953A194` |
| `tsconfig.tsbuildinfo` | Local build artifact — ignored | `BA830CCD01524F833FAB35B89D7479C76DC813618F3B3721474BA7225DCC4D75` |

These files are recorded for preservation purposes only. They are out of scope of the Macro/R5 work and were not read, edited, or verified functionally in this session.

## D. Macro (protected)

| Path | Role | State | SHA-256 |
|---|---|---|---|
| `lib/tools/engines/macro.ts` | Layer 1 engine | untouched in all V4 work | `497B21B0A2AEF9378AA2E1AE0740AF34B7E0954B01FFABF84198D1F62C49510C` |
| `lib/tools/engines/macro.v6.ts` | Numeric authority | **protected; do not change** | `4297776087E849AA74CE019253405184C7DFA9445FEB7C809EDA428A8D510921` |
| `lib/tools/engines/macro.v6.test.ts` | Engine tests | protected | `85A2539FA356824A0C510D8631E5DDE5950B35D2A5C8BFE342FF8D5A8BBDAC08` |
| `lib/tools/schemas/macro.v6.ts` | Authoritative schema | protected | `7E23A66A7B55EEE26F45DA611AB26A9AF3C430CC17AFBD754CF5BFDCEB390731` |
| `lib/tools/schemas/macro.ts` | Legacy schema | protected | `D97F86AE1B1FBD0730731E2FD3FD5390D863902DA37CEA3278333D3C10000D1B` |
| `lib/engines/core/v4/adapter.macro.v4.ts` | V6→V4 adapter | protected | `9DF49FE5EA339DD207C519150B1F4AF2430AF392028C25B4FCB82DD7D7A9E45F` |
| `components/tools/macro-pilot.tsx` | Pilot UI | protected (owner closure batch D) | `A84454576A99847EF6982186C676D6CB0574157DF2843E1E6163AB83B67BFEF0` |
| `components/tools/macro-pilot.module.css` | Pilot CSS | protected | `44BD936E3311FA0F9C4272D5A220EAFECBA4E1A91E118134355EF0E9F9EE3D4A` |
| `components/tools/macro-pilot.test.tsx` | Test | protected | `A82D6587B7B79CF7A571782F6117A1B14D0B97CBC93A9BFCD39C609F051AAC07` |
| `components/tools/macro-pilot.v4.integration.test.tsx` | Integration test | protected | `2A3F37FEC3109AA2B58D846845B2D7B6A1C31A40041E33711ACAF242221E74CA` |
| `components/tools/macro-pilot.remediation.test.tsx` | A11y remediation test | protected | `851F4597F0A387D425C84E9AF384158EBB51567DE37FE55D819BDA15B438E126` |
| `components/tools/macro-pilot.progressive-disclosure.test.tsx` | Progressive disclosure test | protected | `7579CB6E3201622045AEFD17F0B33BF08C159FBD0EA0498533E5602A32A0E336` |
| `app/smarttools/nutrition/macro/page.tsx` | Macro route | protected | `B3003317A7632005A720CE8EE0F8D9A20CA3473280F4AC3F971376272F757EF3` |

## E. V4 machinery (contracts/runtime/template/registry/catalog) — protected

| Path | Role | SHA-256 |
|---|---|---|
| `lib/engines/core/v4/contracts.v4.ts` | V4 contracts | `D09F37E5780B4D4AFA42A941479CFF156C0D437AC4035C660621C7FF1062441B` |
| `lib/engines/core/v4/runtime.v4.ts` | V4 runtime | `2630FA37A2CB59B1835FE8977AD8320E94419B56388B2C7BE2BACDD84B906A92` |
| `lib/engines/core/v4/index.ts` | V4 public export | `79E0354F38C08D553D72BD7E44C9ACE39C5642CDFC8D4AD2915FA9F032246BBA` |
| `lib/templates/genius-tool-template.tsx` | V3 Template | `A565973867FBD75DC25CEE5229713DF8847824B4AC3F2C57998AEC646399A9D6` |
| `lib/templates/genius-tool-template.v4.tsx` | V4 Template | `0251A2FD2BDA545AF05D80624B9454C3D8636E231F0C53C94D192A8D3482F5C8` |
| `components/genius-tool-template.v4.test.tsx` | Template test | `C97B10B36CF08EB02D924A083933ED82931AB5B08A8DD6F1F50EC2FE844CACB1` |
| `lib/engines/core/v4/profiles/macro-input-profile.v4.ts` | M4-IN-01 | `2EA76D6E369D5186E4B9E0253A44E097A46081BC5B80BA484F5A9DEC590DA5A1` |
| `lib/engines/core/v4/profiles/macro-input-profile.v4.test.ts` | M4-IN-01 test | `C5F757EF5FCF7E6513733CBC190CA090A5AA58F989A10BE60D177C5F04AEA88A` |
| `lib/engines/core/v4/profiles/macro-input-metadata.v4.ts` +`.test.ts` | Closure Batch A | `BD4537EC…` / `8DB60FD6…` |
| `lib/engines/core/v4/profiles/macro-output-policy.v4.ts` +`.test.ts` | Closure Batch B | `CBFD0CB9…` / `0A9E8ECD…` |
| `lib/engines/core/v4/profiles/macro-evidence-registry.v4.ts` +`.test.ts` | Closure Batch C | `F52773C2…` / `ED1F0B87…` |
| `lib/engines/core/v4/profiles/macro-pilot-state.v4.ts` +`.test.ts` | Closure Batch D | `42E2EA6F…` / `803620C6…` |
| `lib/engines/core/v4/profiles/tool-pilot-state.v4.ts` +`.test.ts` | R5 shared | `7A06D57C…` / `45331071…` |
| `components/tools/tool-pilot-v4.module.css` | R5 shared CSS | `272392941EB301EFDC0C42D6338D7951D5A062B0858D9B662FE8422FF9ACAE99` |
| `lib/tools/registry.ts` | 264-identity registry | `400BE85257CA4797FEA4AA38D255F2627E14807064DC44D212FB2B0FD37A2EC1` |
| `lib/tools/smartToolsCatalog.ts` | Catalog (264 denominator source) | `3B0D172ECC0FC3A378099A12E3133BB3D9ACFB3A9B6421FC0F130981C8315C07` |
| `lib/tools/smartToolsCatalog10.ts` | Catalog-10 (3 selected tools live there) | `FC1CC503437FF7B0E9F7E9579D0BAAD6A5310791E75B87B3094122F840DC9D64` |
| `lib/tools/categories.ts` | Category map | `E2CC7F4086904107FE35731706B9711FC4F4E1DC63B84C7292BCE87233F0C705` |
| `lib/tools/loaders.ts` | Route loader | `0C8F6C8EE487B1BF9F105B0036B1E60E77EE98FF68A519FEABD80F8B9597BD13` |
| `app/smarttools/[category]/[tool]/page.tsx` | Route dispatcher | `EFCCEEDFF0FC978A9AFAE92A957E8A987289B6F2E3FB112C35843CE036CAF127` |

## F. R5 First Batch (2026-11-05) — preserved fully

### BMI
| Path | Kind | SHA-256 |
|---|---|---|
| `components/tools/bmi-pilot.tsx` modified | R5 pilot | `D758967E6449A9163D95E93DE549F3D568951B65332229AF18E4F28F627D386E` |
| `components/tools/bmi-pilot.v4.test.tsx` | new | `7297C00B852A1BF10141937FC94AAE09644CB9959ECDD9938DC8819CC66CF24E` |
| `lib/engines/core/v4/adapter.bmi.v4.ts` | new | `1BDBB1259A2F570592F28395C87270EC058085D4E4DE332337F0C0187522BED8` |
| `lib/engines/core/v4/adapter.bmi.v4.test.ts` | new | `A92C81C9145CCAB5EB52234674129579A07FB3A5F777DF653BD6A27846CCB03B` |
| `lib/engines/core/v4/profiles/bmi-input-profile.v4.ts` | new | `9F5DD765D3E9AD088C95660A298FE82D7866EB9FD80A31D3FCE65F0F25C62A69` |
| `lib/engines/core/v4/profiles/bmi-input-profile.v4.test.ts` | new | `4B7F5B80613432D1D6883F1217518D1800452A44BC859729DD1778E69316FBD9` |
| `lib/engines/core/v4/profiles/bmi-evidence-record.v4.ts` | new | `CF812E65C5B77351F3E2C738A7B71C131201C9D5A6C8240AF01E120932AA1C81` |
| `lib/engines/core/v4/profiles/bmi-evidence-record.v4.test.ts` | new | `CECDFCE7E7D4DCD4907C9EC01BAF1DA5FE53E2EFCC616F100E9BB0217A2E1A6D` |
| `lib/tools/engines/bmi.v6.ts` +`bmi.v6.test.ts` | unchanged | `89382AB19DBE3AACD18A639DC4090948EDC75367AEBD201AEDC3CA26CA1A06EF` / `77F2A23E9C8FE9A1109CD43E5A78D363288D3D5F17F298702B35C66EA0690957` |
| `lib/tools/schemas/bmi.ts` | unchanged | `59F3437311E3E87B5A3C8E6A7646B0D5B594636FCED14D3E3FA976C082414C34` |

### Protein Needs
| Path | Kind | SHA-256 |
|---|---|---|
| `components/tools/protein-needs-pilot.tsx` modified | R5 pilot | `FC5262AE32CCDE1ED130477FDA06B5B69A4C7809E5B9BFD3BBAC908BB2CD1EA4` |
| `components/tools/protein-needs-pilot.v4.test.tsx` | new | `155B573D7B88BBBB2C5B57A3F2A3B3BA146474804FD60491E6B932A317A57474` |
| `lib/engines/core/v4/adapter.protein-needs.v4.ts` | new | `0784A2C31A45AC420823D865C1CE0CB7F6BF99621590661F4EB339E86B52BEAF` |
| `lib/engines/core/v4/adapter.protein-needs.v4.test.ts` | new | `896277796129BA976A1B6865920EFB15A7948A50FD3F6D13334D26DD6AA1FD7B` |
| `lib/engines/core/v4/profiles/protein-needs-input-profile.v4.ts` | new | `0EF5A4CFC4E7B0A59BFFC7DD45FD26F35B114A281879BEFA80564312B19BDA95` |
| `lib/engines/core/v4/profiles/protein-needs-input-profile.v4.test.ts` | new | `6576F60AC77C0CC560FF97888D8B411AD71DAB049F88E4084CD12CD047198BD4` |
| `lib/engines/core/v4/profiles/protein-needs-evidence-record.v4.ts` | new | `A2D8EA03736EB3C025F2A403D61097CDBE2C771AE108D628AA88FFDA9FA6980B` |
| `lib/engines/core/v4/profiles/protein-needs-evidence-record.v4.test.ts` | new | `19C4F93D163299E421AFCA3723849DD19518035D47EC2175B452DC911A01C309` |
| `lib/tools/engines/protein-needs.v6.ts` +`protein-needs.v6.test.ts` | unchanged | `3794FC3DB920B73100D9A1D6A41D4B0A6D4F34A0F738D4DFF84F064F053DD363` / `7F04A690F8E66A5E5BD2C29339DE1D937DB0565202E1201058C21605E527BD21` |
| `lib/tools/schemas/protein-needs.ts` | unchanged | `A43E701CF479A76AA4CB0C6F09722152CEDBD5F65304B7FE2B6F496339196DAA` |

### Water Intake
| Path | Kind | SHA-256 |
|---|---|---|
| `components/tools/water-intake-pilot.tsx` modified | R5 pilot | `A17A5624522210B7627A2E465C2AB6325864C7DB3BB5B01FA764FE163D0F97A8` |
| `components/tools/water-intake-pilot.v4.test.tsx` | new | `465543F6298742D752FBA96DBC3FA0D8621F0575BDD51F340127C5BCE4247664` |
| `lib/engines/core/v4/adapter.water-intake.v4.ts` | new | `002999EBFA5063EA7C03DCEBEEFED459BC2769C7158871E4D06DBC4D367027EF` |
| `lib/engines/core/v4/adapter.water-intake.v4.test.ts` | new | `445B7D2CAD100E10DFFCBF1B7DDACCA6374CB396F90F621F3C191144A36CD31B` |
| `lib/engines/core/v4/profiles/water-intake-input-profile.v4.ts` | new | `6FFFF931BE8C5F99BC4601B661CACB44033857674B87AA636658C1549CE72DC3` |
| `lib/engines/core/v4/profiles/water-intake-input-profile.v4.test.ts` | new | `D72246FA375593B32B0CFDD3122846B916A7D42F21C0CBF5E9AB4C32316E976A` |
| `lib/engines/core/v4/profiles/water-intake-evidence-record.v4.ts` | new | `5485346838E62E104AE7F497D0ACE603F233903A4F5D2735C2ABFCD610835A46` |
| `lib/engines/core/v4/profiles/water-intake-evidence-record.v4.test.ts` | new | `8F4C38B8A2E300894CDA6E7FD26B5634E23705C148F121579600C9403C6CE166` |
| `lib/tools/engines/water-intake.v6.ts` +`water-intake.v6.test.ts` | unchanged | `D884F8B1DA328E3C92AE35177D6D49824B1EA25DD31B6ACDF4FCF724871D1A4C` / `0FD92C52B770690E633EE5E4FC10EA4FDD55E35B54A764B538BE811FE2056B77` |
| `lib/tools/schemas/water-intake.ts` | unchanged | `63654ABB54E14B3F1A3D8C8CA5ED6711C4EA2B7530514ECDE905068FC2DAAE59` |

## G. Documentation inventory (35 files + 4 masters + 3 unified) — full hashes for the 35 verified at install time (values in §H)

## H. Documentation hashes (verified before / after consolidation)

All 35 historical docs entered Phase D unchanged; their before/after SHA-256 values are listed in the Install receipt inside `MRX_GI_DOCUMENT_CONSOLIDATION_AND_PRESERVATION_FINAL_REPORT.md`.

## I. Verification obligations

- Any edit to anything in sections D–H must be separately owner-approved.
- These records prove preservation at consolidation time only; they are not a license to bypass later changes.
