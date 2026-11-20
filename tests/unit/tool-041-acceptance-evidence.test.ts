// tests/unit/tool-041-acceptance-evidence.test.ts
//
// Source-scan evidence for the Tool 041 R6.1 acceptance fixes (Phase 4 —
// "close actual gaps only"). The two fixes applied to the Hematocrit Monitor
// component were:
//
//   1. the calculation now goes through the R6 pipeline
//      (`runHematocritMonitor`) — the single calculation source — instead of
//      calling the V6 engine / legacy adapter directly;
//   2. the component keeps NO persistence of any kind — no draft, no dashboard
//      snapshot, no session, no cloud storage (the owner's D-08 exception was
//      limited to Tool 039; Tool 040 stayed compute-and-display only, and Tool
//      041 follows the same posture while it is under acceptance).
//
// These tests keep the fix verifiable without a browser: they are the E3
// source-scan proof that pairs with the runtime tests of the focused battery.
//
// Node project (no DOM required) for the source scan; the render tests live
// next to the component.
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const COMPONENT = join(ROOT, 'components', 'tools', 'tool-041-hematocrit-monitor.tsx');

const componentSource = readFileSync(COMPONENT, 'utf8');

describe('Tool 041 R6.1 source-scan evidence (acceptance fixes)', () => {
  it('routes the calculation through the R6 pipeline and never calls the engine or the legacy adapter directly', () => {
    // The single calculation source is the R6 pipeline.
    expect(componentSource).toMatch(/runHematocritMonitor/);
    // The UI must not reach the engine or the legacy adapter directly.
    expect(componentSource).not.toMatch(/from ['"][^'"]*engines\/tool-041/);
    expect(componentSource).not.toMatch(/from ['"][^'"]*adapters\/tool-041/);
  });

  it('keeps no persistence of any kind in the tool UI (D-08 was Tool 039 only)', () => {
    expect(componentSource).not.toMatch(/loadDraft|saveDraft|clearDraft|commitDashboardSnapshot|buildAiContext/);
    expect(componentSource).not.toMatch(/localStorage|sessionStorage|indexedDB/);
    expect(componentSource).not.toMatch(/from ['"][^'"]*supabase[^'"]*['"]/);
    expect(componentSource).not.toMatch(/\bfetch\(|axios|XMLHttpRequest/);
  });
});
