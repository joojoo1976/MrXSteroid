# W2 — Audit Decision & Completion Registry (phase-next, partial)

| Field | Value |
|---|---|
| Baseline HEAD | `37f047a4105d078b22edea2c857bf35aefdbdc7f` |
| Date | 2026-11-19 |
| Mode | Read-only aggregation of already-verified audit outputs. No source/report modified. |
| Status | **COMPLETE** — 29 of 29 individual audits verified. Tool 039 included as reference row only. |

## 1. Verified decisions (from Section Q of each verified audit)

| Tool | Decision | Operational PASS(E3+) | Operational % | Denominator basis | Special posture / note |
|---|---|---:|---:|---|---|
| `006` | REPAIR | 0/18 | 0.00% | 18-row operational only (canonical unrecoverable) | engine disabled/non-interpreting; i18n script absent |
| `008` | PRESERVE | 3/18 | 16.67% | 18-row operational only | **STRUCTURAL_VALIDATION_ONLY — RUNTIME_EFFECTIVENESS_PARTIAL** preserved; PASS rows from recorded committed context, not re-executed |
| `014` | PRESERVE | 3/18 | 16.67% | 18-row operational only | NOT_AVAILABLE / NO_VALIDATED_MODEL is a preserved clinical-safety decision — do not fabricate |
| `015` | REPAIR | 0/18 | 0.00% | 18-row operational only | pure Vermeulen engine preserved; state-mapping divergence |
| `016` | REPAIR | 1/18 | 5.56% | 18-row operational only | single PASS = recorded I18N-PARITY E3; canonical route conflict |
| `017` | REPAIR | 3/18 | 16.67% | 18-row operational only | fail-closed engine preserved; input/result schema conflation |
| `022` | REPAIR | 1/18 | 5.56% | 18-row operational only | clinical-timing naming conflict (I-022-1); route/name conflict |
| `023` | REPAIR | 0/18 | 0.00% | 18-row operational only | **separate expanded view 2/21 = 9.52%** = items (b) Result-Schema rejection + (c) Envelope protection (recorded E3, uncommitted); item (a) 12,800-vs-32,000 grid NOT_RUN/inconsistent. Views MUST NOT be merged. |
| `025` | REPAIR | 0/18 | 0.00% | 18-row operational only | non-exempt shared shell may duplicate GENIUS boxes (DOM unverified); no archived E3 at HEAD |
| `026` | REPAIR | 0/18 | 0.00% | 18-row operational only | unverified shared-shell duplicate-box risk; no archived E3 at HEAD |
| `027` | REPAIR | 0/18 | 0.00% | 18-row operational only | **pipeline test untracked** → no clean-clone E3 coverage |
| `029` | REPAIR | 0/18 | 0.00% | 18-row operational only | `clinicalAssessment NOT_AVAILABLE` preserved; clinical framing needs D-CLIN |
| `031` | REPAIR | 0/18 | 0.00% | 18-row operational only | **no schema/component tests**; ungated heuristic thresholds need D-CLIN; naming variance |
| `034` | NOT_VERIFIED | 0/18 | 0.00% | 18-row operational only; official unrecoverable | historic 1/18 preserved as E1 history; possible duplicate-box ownership conflict; untracked pipeline test |
| `035` | NOT_VERIFIED | 0/18 | 0.00% | 18-row operational only; official unrecoverable | live UI bypasses guarded R6 pipeline; untracked/modified artifacts; 6-vs-5 compact divergence; W18 POST unresolved |
| `037` | NOT_VERIFIED | 0/18 | 0.00% | 18-row operational only; official unrecoverable | historic 3/18 as E1 history; external approvals + duplicate-shell question |
| `038` | NOT_VERIFIED | 0/18 | 0.00% | 18-row operational only; official unrecoverable | historic 3/18 as E1 history; engine lacks internal validation |
| `040` | REPAIR | recorded 77/92 = 83.70%; strict clean-clone 2/92 = 2.17% | 83.70% recorded / 2.17% strict | 123-row authoritative requirement CSV (92 applicable) | 82/92 PASS rows cite untracked files; historic OWNER_ACCEPTED preserved, NOT re-awarded |
| `041` | NOT_VERIFIED | recorded 76/132 = 57.58%; bounded 70–76/132 | 57.58% recorded (bounded 53.03–57.58%) | 138-row authoritative requirement CSV (132) | **OWNER_REVIEW — NOT ACCEPTED — NOT CLOSED**; superseded v1-123 preserved, not adopted; 2 E3 FAIL schema rows, 3 i18n FAILs |
| `042` | BLOCKED | recorded 44/53 = 83.02% | 83.02% recorded | 53-row atomic ledger | **STOPPED — ORDER 580**; audit-only, no activation; 3 NOT_AVAILABLE rows remain in denominator |
| `045` | CONTINUE / REPAIR (gates only) | 59/68 | 86.76% | 68-row atomic ledger | browser E0 + owner gates only; P03-01 E3 preserved |
| `046` | CONTINUE / REPAIR (P-03 + gates) | 56/66 | 84.85% | 66-row atomic ledger | add scoped runtime-negative test, then gates |
| `047` | CONTINUE / REPAIR (gates only) | 59/68 | 86.76% | 68-row atomic ledger | both P03 E3 preserved; gates only |
| `048` | CONTINUE / REPAIR (P-03 + gates) | 62/72 | 86.11% | 72-row atomic ledger | add scoped runtime-negative test, then gates |
| `049` | CONTINUE / REPAIR (P-03 + gates) | 61/71 | 85.92% | 71-row atomic ledger | add scoped runtime-negative test, then gates |
| `050` | CONTINUE / REPAIR (static-to-E3 + P-03 + gates) | 7/26 | 26.92% | 26-row atomic ledger | **E2 correction**: historic PASS 16 → 7 E3; 9 `050-STATIC-*` rows are E2; P03-02 PARTIAL |
| `051` | CONTINUE / REPAIR (FAIL + static-to-E3 + P-03 + gates) | 11/31 | 35.48% | 31-row atomic ledger | **E2 correction**: historic PASS 19 → 11 E3; 8 static E2 + 2 FAIL/E0; Arabic i18n fix WT-only, separate |
| `043` | REPAIR | 0/18 | 0.00% | 18-row operational only | untracked contract/pipeline test/component family; non-exempt dual-box risk |
| `044` | REPAIR | 0/18 | 0.00% | 18-row operational only | untracked contract/pipeline test/component family; non-exempt dual-box risk |
| `039` | REFERENCE ONLY | n/a | n/a | 123-row historic ledger (95 applicable) | historic 95/95 recorded; E3=85/E2=26/E4=12; row-level E4 authoritative (applicable E3=83, E4=12); P-01–P-05 excluded; OWNER_ACCEPTED belongs to 039 only and is not transferable |

**All verified audits explicitly state: no owner acceptance implied, claimed or transferred.** No tool has reached `100% VERIFIED — OWNER REVIEW PENDING` or `OWNER_ACCEPTED — CLOSED`.

## 2. Verified audit file SHAs (whole-file)

| Tool | Whole-file SHA-256 |
|---|---|
| `006` | `A655A047858E83805A96270E74B59C1E320CA536BF7C403122408F5E70959870` |
| `008` | `9DAA68D156C42BFB784FF58297FBB91AB549A18C75FE7A45A43AE147A400CC37` |
| `014` | `B69FA4AD291D4940EC1C27C50D4935B62D489423667B6C98C17CC614ED0E0DA8` |
| `015` | `28AF8E0A00D5327ACE372F61030923DDEDFF684D0539A677656BE52314F36C29` |
| `016` | `B3475E09DA6EA21D1E6537ED6E3BE639A60ACECE7921FA649DF1ECEC52DDAA17` |
| `017` | `797A6B141FB9AE4F67EA840C4933B223C9DCBC24D90A5037B245EE1A5AC02E93` |
| `022` | `F698AD6B4E3505082F249106725EC3C2F19D1BCDF13AD1B92FA077A8F618B064` |
| `023` | `9FBAF3BA10A0EB746B1677D12083113CF40E41B8958F696FB157602EC53857A7` |
| `025` | `1F9039D5A92DD03E5A626D1FAC2A1A3BE3AAE43EEBC0503664435C8C1A1F3D99` |
| `026` | `8013DB516504D85FC54F4BE0744DD428DE252569B40ADE8139617132D5205685` |
| `027` | `05291BBC003F9C2A8A6AE53A336E29F3874E5EA9CDF29BC602B0139B301B75B2` |
| `029` | `BA5B54A651F00491EB627575402AD8697968EB15E7AF9E5DE682D311D879E8F6` |
| `031` | `B9A65407EF2A0C84C05EB50B1301511322D86DAB3AEDE243492A09C135FFDCF0` |
| `034` | `CFB864B70BA44346D1BC6B2A0DCEE9D9D80A389A3C00C72087E427FFEC1422CA` |
| `035` | `DEA638B50B612E123D135D03F89446684227AF3F3627264676EEE13D7E9535A9` |
| `037` | `FA28AE40FAC7CB078694D2FFF8294A5FB9F90EF6757D3733AC7F2C9882B52CC5` |
| `038` | `E6C7809415B34A6BDCDE3D106C7C584B8D50355C02A6C1374D3024501D895AF2` |
| `040` | `2C3DD97E39DAB74B089E0FFF9999640F2A6045B465C5BB22E6B2F5D0D2326DF5` |
| `041` | `94E875306A38278B3951FBE14B3CE8A00F54D68F5C09055A613B94A5CFF7CCA0` |
| `042` | `81DF1C87FDE563A7CC71148EB44B21CD67F6B4E9910EE7A760DE43C7506DF458` |
| `043` | `FE5713DE34EB5C90C254402162C52A55762802024C94159F4E95B4E2E911F9DF` |
| `044` | `CBBAB8AA8D105B094D2AF11F98D206D980C1ED7C1DB0F4E3C2866A4C632F4834` |
| `045` | `2BCC509A410474ABB02FD5DCE6F4C97160F2FDD49AEC8D0BD31E61C9B70137DB` |
| `046` | `F0D049DBFF8C1DCA4A5C436ABF6121C29D6A1A3FF49CCB03838468A27AA529B3` |
| `047` | `180294A7B84022F461B3E527CED214A4B5E0B798BFA6334F4EC9A43A6B9D1B40` |
| `048` | `B54949F3B42E9CDE7A72D6A98C5D779AFDFDAA26F0FE67303BD6314C349C5B1C` |
| `049` | `B83DAA8EC402B4082DDCC8FCAF82C4FF9D1E26D0275E371C1BF4F32AD1580255` |
| `050` | `102AD1EBBB72306974599FEBE7CE29D0B76FE71F2EE1600E9D9FDCACC707175A` |
| `051` | `4B7B36373FD57AD980B29B46E2B9CA6F37BCF0C0E84E4A5E9FE8AF541948C8B6` |
| `039 ref` | `16DEE852001F2A5E8F0F71A50A98CE4C118C8BCEB86E15B9867CA54B99E4F7FA` |

## 3. Still pending audit batches

- Round 2b: `025,026,027,029,031` — **verified**
- Round 3a: `034,035,037,038` — **verified**
- Round 3b: `040,041,042,043,044` — **verified**
- Round 4: `045,046,047,048,049,050,051` — **verified**

**ALL 29 AUDITS VERIFIED.**

Do not compute cross-tool totals or similarity scores from this partial registry. Observed on-disk SHA-256 of this file is authoritative.
