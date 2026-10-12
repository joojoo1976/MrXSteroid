import { describe, it, expect } from 'vitest';
import { generateComprehensiveReport } from './tool-100-comprehensive-report-generator';

describe('Tool #100 — Comprehensive Report Generator Engine', () => {
  it('synthesizes optimal scores into high health index without flagged domains', () => {
    const result = generateComprehensiveReport({
      cardiovascular_risk_score: 20,
      hepatic_stress_score: 15,
      endocrine_suppression_score: 10,
      metabolic_vitality_score: 85,
      active_red_flag_symptoms_count: 0,
    });
    expect(result.unified_health_index).toBeGreaterThanOrEqual(80);
    expect(result.overall_governance_tier).toBe('harmonious-optimal');
    expect(result.flagged_domains.length).toBe(0);
  });

  it('triggers clinical escalation when multiple domains exhibit severe strain', () => {
    const result = generateComprehensiveReport({
      cardiovascular_risk_score: 85,
      hepatic_stress_score: 80,
      endocrine_suppression_score: 90,
      metabolic_vitality_score: 25,
      active_red_flag_symptoms_count: 3,
    });
    expect(result.unified_health_index).toBeLessThan(35);
    expect(result.overall_governance_tier).toBe('clinical-escalation-required');
    expect(result.flagged_domains.length).toBe(4);
  });
});
