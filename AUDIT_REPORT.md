# MrXSteroid SmartTools - Audit Report

## Current State Analysis (as of 2026-10-23)

### Tool Inventory Summary
| Category | Count | Status |
|----------|-------|--------|
| **Legacy Tools (#1-9)** | 9 | Implemented (stackStatus: 'legacy') |
| **Layered Tools (#10-125)** | 109 | Implemented (stackStatus: 'layered') |
| **New Tools (#126-150)** | 25 | **PLANNED** (not implemented) |
| **Total Positions** | **150** | Target: 150 tools |

### Registry Analysis (lib/tools/registry.ts)
- **159 ToolDefinitions** registered (some duplicates/overlap with catalog)
- Tool IDs: `mrx.tool.macro` through `mrx.tool.117-intra-workout-nutrient-volumizer`
- Order range: 10 to 1330
- Access Tiers: `free` (most), `premium` (cycle, multi-ester)
- Stack Status: `legacy` (9), `layered` (109+)

### Catalog Files
- `smartToolsCatalog.ts`: Legacy tools #1-9 + 3 special layered
- `smartToolsCatalog2.ts` through `smartToolsCatalog10.ts`: Tools #6-117

### Database Schema (supabase/schema.sql)
Tables:
1. **user_tool_states** - Flexible JSONB storage for inputs/outputs
2. **user_preferences** - Units, language, theme, voice, AI settings
3. **tool_usage_analytics** - Open, calculate, save, export, voice_open actions
4. **tool_ratings** - 1-5 star ratings + feedback
5. **user_voice_commands** - Voice command logging
6. **ai_user_profiles** - Behavioral profiling for AI personalization

All with RLS policies and proper indexes.

### Package Dependencies
- **React 19** + **Next.js 15** + **TypeScript 5.8**
- **Tailwind CSS 3.4** + **Framer Motion 12**
- **Supabase JS 2.116** + **Zod 4.3** for validation
- **Vitest 4** for testing + **React Testing Library**
- **Recharts 2.12** for visualizations
- **Lucide React** for icons

### i18n Structure
- Base: `i18n/en.ts`, `i18n/ar.ts`, `i18n/data.ts`
- Tool-specific: `i18n/tool-XXX-*.json` (tools 26-125)
- ContentStrings type in `shared/types/types`

### Engine Architecture (lib/tools/engines/)
- **Pure functions** - no React, no DOM, no I/O
- Input validation with detailed error messages
- Unit system support (metric/imperial)
- Tests alongside engines (`.test.ts`)

### Component Architecture (components/tools/)
- Wizard-style (Step 1: Basic → Step 2: Measurements → Step 3: Results)
- Uses `usePreferences` context for language/units
- Framer Motion animations
- Ecosystem sync via CustomEvents

---

## Gap Analysis: 150-Tool Target

### Current: 109 Implemented + 9 Legacy = 118 tools
### Target: 150 tools
### Missing: **32 tools** (but registry shows 159 - some are duplicates/aliases)

**Actually needed:**
- Registry has 159 entries but some are duplicates (e.g., hpta-recovery appears twice)
- Catalog shows ~117 unique tools
- Need to reach **150 unique tools** with v6 Genius architecture

---

## Phase 1-3 Implementation Plan

### Phase 1: Core Framework v6 (lib/engines/core/v6/)
1. `ai-orchestrator.v6.ts` - 7-layer AI orchestration
2. `equation-validator.v6.ts` - Formula documentation + safety
3. `cross-tool-graph.v6.ts` - Neural network of 150 tools + Event Bus
4. `future/ml-models.ts` - Random Forest, LSTM, Logistic Regression stubs
5. `future/vision.ts` - MediaPipe Pose + Equipment Scanner stubs
6. `future/voice.ts` - Whisper stub

### Phase 2: Upgrade Body Fat Calculator (Tool #1) to v6 Genius
- Add Super Intelligence Layer
- Dynamic Results (Empty→Partial→Full)
- What-If Slider + 7 Golden Rules
- Cross-Tool Links: TDEE, FFMI, Transformation Forecast
- 12 unit tests
- Integration test with dev server

### Phase 3: Batch Upgrades (1-125)
- Batch A: 1-25 Body Composition
- Batch B: 26-50 Nutrition
- Batch C: 51-85 Training
- Batch D: 86-115 Strength
- Batch E: 116-125 Physique

### Phase 4: New Tools 126-150
- 126-136: From v5-genius (Force Plate ML, MediaPipe Video, LSTM, VBT, 3D Body Map, Kalman, Monte Carlo)
- 137-150: Health & Hormones with Safety Disclaimers

### Phase 5: Future Integration for All 150
- ML, Vision, Voice, LLM, Advanced features

---

## Acceptance Criteria Per Tool (150 tools)

| Requirement | Status |
|-------------|--------|
| Math Engine documented + 12 tests | ⬜ |
| Super Intelligence Layer (brainType, crossToolLinks, confidence, reasoning, scenarios, whatIf, warnings) | ⬜ |
| Cross-Tool Links + Freshness + Event Bus | ⬜ |
| Dynamic Results (7 Golden Rules + What-If) | ⬜ |
| AI Prompt unique per tool | ⬜ |
| Language & Units synced via PreferencesContext | ⬜ |
| Empty/Partial/Full states | ⬜ |
| Safety disclaimer (tools 137-150) | ⬜ |

---

## Next Steps

1. **Create v6 core framework** in `lib/engines/core/v6/`
2. **Upgrade bodyfat.ts** engine with v6 Genius features
3. **Create test suite** for body fat calculator
4. **Verify** at `http://localhost:5173/smarttools/body-composition/bodyfat`