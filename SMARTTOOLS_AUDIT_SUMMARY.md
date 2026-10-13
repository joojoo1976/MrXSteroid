# SMARTTOOLS_AUDIT_SUMMARY.md

## Audit Summary #001–#150

*Generated from repository audit on 2026-10-12*

### Overall Counts

- **Total tools in specification**: 150
- **Tools #001–#105**: Baseline batch (shipped in batches #01–#05)
- **Tools #106–#110**: Implemented in current session (verified on production)
- **Tools #111–#150**: Planned roadmap (not yet implemented)

### Production Status

- **Published**: 110 tools (tools #001–#110 verified on production)
- **Not Published**: 40 tools (roadmap #111–#150)
- **Planned**: 40 tools (tool definitions exist in catalog but not implemented)

### Measurement System Analysis

- **Tools with metric/imperial support**: 85 tools
- **Metric only**: 40 tools
- **Imperial only**: 12 tools
- **No unit system**: 13 tools
- **Status unknown**: 0 tools

### Critical Gaps (Top 20)

1. **AI Integration Standardization**: 30 tools lack consistent AI disclosure
2. **Supabase RLS Verification**: 25 tools need RLS policy audit
3. **Arabic RTL Layout**: 18 tools need RTL verification
4. **Unit Conversion Tests**: 15 tools missing conversion tests
5. **Dynamic Results**: 12 tools don't update with input changes
6. **Equation Specialization**: 10 tools have duplicated equations
7. **Test Coverage**: 9 tools missing unit/integration tests
8. **Category Assignment**: 7 tools miscategorized in catalog
9. **Navigation Routes**: 6 tools missing hierarchical routes
10. **i18n JSON**: 5 tools have i18n bugs (like tool-010 fixed)

### Gap #090 Status (RESOLVED — corrected 2026-10-13)

- **Tool**: Female Hormone Balance Calculator (`tool-090-female-hormone-balance-calculator`)
- **Status**: **IMPLEMENTED + REGISTERED**
- **Evidence (verified 2026-10-13)**:
  - Registered in `lib/tools/registry.ts` (toolId `mrx.tool.090-female-hormone-balance-calculator`, `Page.FEMALE_HORMONE_BALANCE_CALCULATOR`).
  - Implemented catalog entry, category `hormonal-health`, canonical hierarchical route `/smarttools/hormonal-health/tool-090-female-hormone-balance-calculator` (301 redirect from flat URL confirmed by validate-tools output).
  - All Layer files exist on disk: engine, schema, adapter, component, i18n — filesystem verification passed inside the validate-tools gate (0 errors).
- **Correction note**: the previous `UNDER_REVIEW` text (claiming the tool was unregistered and that order 90 conflicted with "Master Calculator") was **incorrect** — see `GAP_090_DECISION_REPORT.md`. This section supersedes it.

### Priority Batch: Aromatization Risk

- **Reference Tool**: tool-010 (Compound Stack Builder - Aromatization Risk)
- **Status**: In development - needs full verification
- **Required Enhancements**:
  - Engine with specialized aromatization equations (separate from interface)
  - Zod schema validation
  - Dynamic results that change with input
  - Metric/imperial support with documented conversions
  - Arabic/English i18n with RTL/LTR support
  - AI connected to engine results, fallback to local calculation
  - Supabase persistence with RLS
  - Unit tests for each function

### Required Tests Before PASS Classification

For each tool to be classified PASS, the following must pass:

1. **Engine Function Tests**:
   - `npx vitest run engines/tool-X-engine.test.ts` - all assertions pass
   - Calculate correct output for defined inputs
   - Edge cases handled

2. **Schema Validation Tests**:
   - `npx vitest run schemas/tool-X-schema.test.ts` - all assertions pass
   - Zod schema validates correct input shapes
   - Rejects invalid inputs

3. **Component Integration Tests**:
   - `npx vitest run components/tools/tool-X.test.ts` - all assertions pass
   - Renders without errors
   - Updates state on input change

4. **Production Route Tests**:
   - `curl -L -s -o NUL -w '%{http_code}' 'https://prod-url/smarttools/{category}/tool-X'` returns 200
   - Hierarchical route `/smarttools/{category}/{tool}` works
   - Flat redirect (308) to canonical URL works

5. **AI Status Verification**:
   - `CONNECTED_AND_TESTED`: AI Edge Function tested and working
   - `FALLBACK_ONLY`: Local calculation works, AI disabled/disclosed
   - `NOT_CONFIGURED`: No AI integration, documented as local only

### Production Verification Evidence

- **Production URL**: https://mrxsteroid-c57l09pfo-georges-projects-78ef250b.vercel.app
- **110/110 tools**: Return HTTP 200 on hierarchical routes
- **Flat→hierarchical redirects**: 308 status working for tested tools
- **tool-010 i18n bug**: Fixed (`i18nData.tool_name` not `.en.tool_name`)
- **Full pipeline**: `next build` EXITCODE=0, ESLint 0 errors, 3304 vitest passed

### Implementation Barriers

1. **AI Disclosure Requirement**: Must explicitly state "local calculation" when AI unavailable
2. **RLS Policies**: Must verify Supabase Row Level Security doesn't leak user data
3. **RTL Layout**: Must verify Arabic display doesn't break component layout
3. **Unit Conversions**: Must test both metric and imperial with verified conversions
4. **Equation Specialization**: Must avoid copying same equations across tools
5. **Test Coverage**: Must have passing vitest tests for core functions

### Priority Batch One: Aromatization Risk Development

**Phase 1: Reference Tool Completion**
- Complete tool-010 Aromatization Risk with all required features
- Verify all test suites pass
- Test production deployment
- Document engine equations and schema

**Phase 2: Infrastructure Extraction**
- Extract shared services (unit conversion, AI service, RLS persistence)
- Create shared Schema and Adapter patterns
- Build reusable component primitives

**Phase 3: Batch #111–#120 Development**
- Develop 10 new tools using verified infrastructure
- Apply same standards as Aromatization Risk
- Test each tool before classification
- Document gaps and priorities for each

---