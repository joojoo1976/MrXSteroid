import { describe, expect, it } from 'vitest';
import { getPublishedCatalogTools } from '../smartToolsCatalog4';
import { recordChemistryNote } from './tool-246-homebrew-chemistry.v7';
import { recordHabit } from './tool-247-habit-coach.v7';
import { matchSafetySignals } from './tool-248-safety-gate.v7';
import { evaluateSafetyGateV7 } from './tool-248-safety-gate.v7';
import { recordEvidenceQuery } from './tool-249-evidence-explorer.v7';
import { recordSessionMemory } from './tool-250-memory-layer.v7';
import { calculatePhysiqueTrajectoryV7, inspectPhysiqueTrajectoryV7 } from './tool-251-physique-trajectory.v7';
import { assembleCommandEntries } from './tool-252-command-center.v7';

describe('SmartTools 246–252 constrained engine contracts', () => {
  it('246 records only a bounded user note and rejects added chemistry fields', () => {
    expect(recordChemistryNote({ note: '  bench note  ' }).entry.note).toBe('bench note');
    expect(() => recordChemistryNote({ note: 'note', reagent: 'x' })).toThrow();
    expect(recordChemistryNote({ note: 'x' }).limitations.join(' ')).toMatch(/No synthesis/);
  });

  it('247 records user-selected habit state/date without a score', () => {
    const result = recordHabit({ habit: 'Walk', completed: true, recordedOn: '2026-10-27' });
    expect(result.entry).toMatchObject({ habit: 'Walk', completed: true, recordedOn: '2026-10-27' });
    expect(result.limitations.join(' ')).toMatch(/no adherence score/);
    expect(() => recordHabit({ habit: 'Walk', completed: true, recordedOn: 'tomorrow' })).toThrow();
  });

  it('248 matches explicit selections only and never says no-match is safe', () => {
    expect(matchSafetySignals({ signals: [{ label: 'signal', selected: true }] }).status).toBe('MATCH');
    const noMatch = matchSafetySignals({ signals: [{ label: 'signal', selected: false }] });
    expect(noMatch.status).toBe('NO_MATCH');
    expect(noMatch.disclaimer).toMatch(/no diagnosis or safety guarantee/i);
    const partial = evaluateSafetyGateV7({ ageGroup: 'adult', answers: [] });
    expect(partial.status).toBe('PARTIAL');
  });

  it('249 validates and records a query without fabricating retrieval', () => {
    expect(recordEvidenceQuery({ query: 'exercise' }).status).toBe('RECORDED');
    expect(recordEvidenceQuery({ query: 'exercise' }).disclaimer).toMatch(/no retrieval/i);
    expect(() => recordEvidenceQuery({ query: ' ' })).toThrow();
  });

  it('250 returns only a session-scoped record and rejects unknown properties', () => {
    expect(recordSessionMemory({ entry: 'note' })).toMatchObject({ status: 'RECORDED', retention: 'CURRENT_COMPONENT_SESSION_ONLY' });
    expect(() => recordSessionMemory({ entry: 'note', userId: '123' })).toThrow();
  });

  it('251 calculates up to three explicit arithmetic scenarios without prediction claims', () => {
    const draft = inspectPhysiqueTrajectoryV7({ current_weight_kg: 90, current_body_fat_pct: 20, target_body_fat_pct: 15, weekly_rates_kg_per_week: [0.5, 1] });
    expect(draft.status).toBe('FULL');
    if (draft.status === 'FULL') {
      const result = calculatePhysiqueTrajectoryV7(draft.input);
      expect(result.status).toBe('CALCULATED');
      expect(result.scenarios).toHaveLength(2);
      expect(result.disclaimer).toMatch(/not a prediction/i);
    }
    expect(inspectPhysiqueTrajectoryV7({}).status).toBe('PARTIAL');
    expect(inspectPhysiqueTrajectoryV7({
      current_weight_kg: 90,
      current_body_fat_pct: 20,
      target_body_fat_pct: 15,
      weekly_rates_kg_per_week: [],
    })).toMatchObject({ status: 'PARTIAL', missingFields: ['weekly_rates_kg_per_week'] });
    expect(inspectPhysiqueTrajectoryV7({
      current_weight_kg: 90,
      current_body_fat_pct: 20,
      target_body_fat_pct: 15,
      weekly_rates_kg_per_week: [0.5, Number.NaN, 1],
    }).status).toBe('INVALID_INPUT');
  });

  it('252 reports missing metadata as PARTIAL without computing or normalizing values', () => {
    const result = assembleCommandEntries({ entries: [{ label: 'Body weight', value: '80', unit: 'kg' }] });
    expect(result.status).toBe('PARTIAL');
    expect(result.entries[0].missingFields).toEqual(['source', 'recordedOn', 'freshness']);
    expect(result.entries[0].value).toBe('80');
    expect(result.limitations.join(' ')).toMatch(/not recalculated, normalized/);
  });

  it('252 returns a complete manually selected entry with its supplied stale/conflict state', () => {
    const result = assembleCommandEntries({ entries: [{
      label: 'Lab value', value: '4.2', unit: 'mmol/L', source: 'Report A', recordedOn: '2026-10-20', freshness: 'conflicting',
    }] });
    expect(result.status).toBe('RECORDED');
    expect(result.entries[0].freshness).toBe('conflicting');
    expect(result.entries[0].missingFields).toEqual([]);
  });

  it('publishes only entries whose safety and external-data scope is currently approved', () => {
    const published = getPublishedCatalogTools().map(({ slug }) => slug);
    expect(published).toContain('tool-246-homebrew-chemistry');
    expect(published).toContain('tool-247-habit-intelligence-coach');
    expect(published).toContain('tool-250-personal-fitness-memory-layer');
    expect(published).toContain('tool-252-command-center');
    expect(published).toContain('tool-251-physique-trajectory-simulator');
    expect(published).toContain('tool-249-scientific-evidence-explorer');
    expect(published).toContain('tool-248-safety-gate-emergency-protocol');
  });
});
