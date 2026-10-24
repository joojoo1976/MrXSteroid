import { describe, expect, it } from 'vitest';
import {
  EMERGENCY_WARNING_RULES,
  evaluateEmergencyChecklist,
  inspectEmergencyChecklistDraft,
  resolveLocalEmergencyNumber,
} from './tool-146-emergency-warning-signs-checklist.v6';

function answersFor(group: 'adult' | 'child', answer: 'yes' | 'no' | 'unsure') {
  return EMERGENCY_WARNING_RULES.flags[group].map((flag) => ({ flagId: flag.id, answer }));
}

describe('Tool 146 fixed emergency warning-sign rules', () => {
  it('matches an explicitly selected adult warning sign and requests urgent help', () => {
    const answers = answersFor('adult', 'no');
    answers[0] = { flagId: answers[0].flagId, answer: 'yes' };
    const result = evaluateEmergencyChecklist({ ageGroup: 'adult', answers });
    expect(result).toMatchObject({ status: 'MATCHED', ageGroup: 'adult', matchedFlagIds: ['adult_breathing_difficulty'], needsUrgentHelp: true });
  });

  it('matches an explicitly selected child warning sign and requests urgent help', () => {
    const answers = answersFor('child', 'no');
    answers[0] = { flagId: answers[0].flagId, answer: 'yes' };
    const result = evaluateEmergencyChecklist({ ageGroup: 'child', answers });
    expect(result).toMatchObject({ status: 'MATCHED', ageGroup: 'child', matchedFlagIds: ['child_headache_or_vomit_after_head_injury'], needsUrgentHelp: true });
  });

  it('returns NO_MATCH for a complete all-no list and never claims safety', () => {
    const result = evaluateEmergencyChecklist({ ageGroup: 'adult', answers: answersFor('adult', 'no') });
    expect(result).toMatchObject({ status: 'NO_MATCH', matchedFlagIds: [], needsUrgentHelp: false });
    expect(JSON.stringify(result).toLowerCase()).not.toContain('safe');
    expect(result.emergencyNumber.status).toBe('NOT_AVAILABLE');
  });

  it('returns PARTIAL for unanswered or unsure items while retaining any explicit yes escalation', () => {
    const incomplete = answersFor('adult', 'no');
    incomplete[0] = { flagId: incomplete[0].flagId, answer: 'yes' };
    incomplete[1] = { flagId: incomplete[1].flagId, answer: 'unsure' };
    incomplete[2] = { flagId: incomplete[2].flagId, answer: null };
    const result = evaluateEmergencyChecklist({ ageGroup: 'adult', answers: incomplete });
    expect(result).toMatchObject({ status: 'PARTIAL', matchedFlagIds: ['adult_breathing_difficulty'], needsUrgentHelp: true });
    expect(inspectEmergencyChecklistDraft({ ageGroup: 'adult', answers: incomplete }).status).toBe('PARTIAL');
  });

  it('returns PARTIAL when no age group or answers have been selected', () => {
    expect(evaluateEmergencyChecklist({ ageGroup: null, answers: [] }).status).toBe('PARTIAL');
  });

  it('returns NOT_AVAILABLE and keeps generic local escalation when the rule source pack is missing or invalid', () => {
    const input = { ageGroup: 'adult', answers: answersFor('adult', 'yes') };
    expect(evaluateEmergencyChecklist(input, { rulePack: null })).toMatchObject({ status: 'NOT_AVAILABLE', emergencyNumber: { status: 'NOT_AVAILABLE' } });
    const invalidPack = { ...EMERGENCY_WARNING_RULES, sources: [] };
    expect(evaluateEmergencyChecklist(input, { rulePack: invalidPack })).toMatchObject({ status: 'NOT_AVAILABLE', emergencyNumber: { status: 'NOT_AVAILABLE' } });
  });

  it.each([
    { ageGroup: 'teen', answers: [] },
    { ageGroup: 'adult', answers: [{ flagId: 'adult_unknown_flag', answer: 'yes' }] },
    { ageGroup: 'adult', answers: [{ flagId: 'adult_breathing_difficulty', answer: 'maybe' }] },
    { ageGroup: 'adult', answers: [{ flagId: 'adult_breathing_difficulty', answer: 'yes' }, { flagId: 'adult_breathing_difficulty', answer: 'no' }] },
    { ageGroup: null, answers: [{ flagId: 'adult_breathing_difficulty', answer: 'yes' }] },
    { ageGroup: 'adult', answers: [{ flagId: 'adult_breathing_difficulty', answer: 'yes', inferred: true }] },
  ])('rejects malformed, unknown, or duplicate input $ageGroup', (input) => {
    expect(inspectEmergencyChecklistDraft(input).status).toBe('INVALID_INPUT');
    expect(evaluateEmergencyChecklist(input).status).toBe('INVALID_INPUT');
  });

  it('never resolves or exposes an unverified country-specific emergency number', () => {
    expect(resolveLocalEmergencyNumber(null)).toMatchObject({ status: 'NOT_AVAILABLE', countryCode: null });
    expect(resolveLocalEmergencyNumber('EG')).toMatchObject({ status: 'NOT_AVAILABLE', countryCode: 'EG' });
    const result = evaluateEmergencyChecklist({ ageGroup: 'adult', answers: answersFor('adult', 'no') });
    expect(result.emergencyNumber).not.toHaveProperty('number');
  });
});
