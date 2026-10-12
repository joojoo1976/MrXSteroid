import { describe, it, expect } from 'vitest';
import {
  buildTimeline,
  detectTrends,
  fuseHealthData,
  type HealthEvent,
} from './tool-105-ai-health-data-fusion-hub';

const events: HealthEvent[] = [
  { date: '2026-03-02', category: 'lab', code: 'ldl', value: 130, unit: 'mg/dL' },
  { date: '2026-01-01', category: 'lab', code: 'ldl', value: 100, unit: 'mg/dL' },
  { date: '2026-02-01', category: 'lab', code: 'ldl', value: 115, unit: 'mg/dL' },
  { date: '2026-02-15', category: 'symptom', code: 'fatigue', note: 'mild' },
  { date: '2026-02-15', category: 'blood-pressure', code: 'systolic_bp', value: 125, unit: 'mmHg' },
];

describe('Tool #105 - AI Health Data Fusion Hub & Timeline', () => {
  it('orders events chronologically with stable category/code tiebreakers', () => {
    const timeline = buildTimeline(events);
    const dates = timeline.map((e) => e.date);
    expect([...dates].sort()).toEqual(dates);
    expect(timeline[0].date).toBe('2026-01-01');
  });

  it('detects up/down/flat trends and insufficient-data per code', () => {
    const trends = detectTrends(buildTimeline(events));
    const ldl = trends.find((t) => t.code === 'ldl');
    expect(ldl?.direction).toBe('up');
    expect(ldl?.change_percent).toBeCloseTo(30, 5); // (130-100)/100
    expect(ldl?.data_point_count).toBe(3);
    // Symptom events (no numeric value) never enter the trend list.
    const fatigue = trends.find((t) => t.code === 'fatigue');
    expect(fatigue).toBeUndefined();

    // A single numeric data point reports insufficient-data.
    const single = detectTrends(buildTimeline([
      { date: '2026-01-01', category: 'lab', code: 'hba1c', value: 5.6 },
    ]));
    expect(single.length).toBe(1);
    expect(single[0].direction).toBe('insufficient-data');
    expect(single[0].change_percent).toBeNull();

    const down = detectTrends(buildTimeline([
      { date: '2026-01-01', category: 'lab', code: 'tsh', value: 5 },
      { date: '2026-02-01', category: 'lab', code: 'tsh', value: 2.5 },
    ]));
    expect(down[0].direction).toBe('down');
    expect(down[0].change_percent).toBeCloseTo(-50, 5);

    const flat = detectTrends(buildTimeline([
      { date: '2026-01-01', category: 'blood-pressure', code: 'systolic_bp', value: 120 },
      { date: '2026-02-01', category: 'blood-pressure', code: 'systolic_bp', value: 120 },
    ]));
    expect(flat[0].direction).toBe('flat');
    expect(flat[0].change_percent).toBe(0);
  });

  it('keeps fusion local-only without consent, even when authenticated', () => {
    const local = fuseHealthData({ events, consent_given: false, authenticated: true });
    expect(local.persistence_mode).toBe('local-only');
    expect(local.event_count).toBe(5);
    const sum = Object.values(local.category_counts).reduce((a, b) => a + b, 0);
    expect(sum).toBe(local.event_count);
  });

  it('enables authenticated sync ONLY with explicit consent and authentication', () => {
    const synced = fuseHealthData({ events, consent_given: true, authenticated: true });
    expect(synced.persistence_mode).toBe('authenticated-sync');
    const consentOnly = fuseHealthData({ events, consent_given: true, authenticated: false });
    expect(consentOnly.persistence_mode).toBe('local-only');
  });

  it('ALWAYS stamps the privacy boundary - never claims FHIR or wearable integration', () => {
    const r = fuseHealthData({ events, consent_given: false, authenticated: false });
    expect(r.privacy_notice).toBe(
      'local_user_supplied_data_only_no_fhir_wearable_or_external_integration_no_health_data_sent_to_ai_or_external_services',
    );
    const keys = Object.keys(r).join(' ');
    expect(keys).not.toMatch(/fhir|wearable|device_sync/i);
  });
});
