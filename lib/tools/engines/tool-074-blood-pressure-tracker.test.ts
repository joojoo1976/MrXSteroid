import { describe, it, expect } from 'vitest';
import {
  assessBloodPressure,
  classifyReading,
  EMERGENCY_MESSAGE,
  type BpInput,
} from './tool-074-blood-pressure-tracker';

const normal: BpInput = {
  readings: [
    { systolic: 118, diastolic: 76, pulse: 68 },
    { systolic: 116, diastolic: 74, pulse: 70 },
  ],
  chest_pain: false,
  breathing_difficulty: false,
  severe_headache: false,
  vision_changes: false,
  dizziness_on_standing: false,
};

describe('tool-074 Blood Pressure Tracker', () => {
  it('classifies AHA-style bands', () => {
    expect(classifyReading(115, 75)).toBe('normal');
    expect(classifyReading(125, 75)).toBe('elevated');
    expect(classifyReading(135, 85)).toBe('stage-1');
    expect(classifyReading(145, 95)).toBe('stage-2');
    expect(classifyReading(185, 121)).toBe('crisis');
    expect(classifyReading(85, 55)).toBe('hypotension');
  });

  it('averages readings and reports the worst category', () => {
    const r = assessBloodPressure(normal);
    expect(r.readings_count).toBe(2);
    expect(r.average_systolic).toBe(117);
    expect(r.average_diastolic).toBe(75);
    expect(r.overall_category).toBe('normal');
    expect(r.emergency).toBe(false);
  });

  it('escalates a hypertensive-crisis reading', () => {
    const r = assessBloodPressure({ ...normal, readings: [{ systolic: 190, diastolic: 125, pulse: null }] });
    expect(r.overall_category).toBe('crisis');
    expect(r.emergency).toBe(true);
    expect(r.emergency_message).toBe(EMERGENCY_MESSAGE);
    expect(r.safety_flags).toContain('hypertensive_crisis');
  });

  it('escalates chest pain and breathing difficulty', () => {
    expect(assessBloodPressure({ ...normal, chest_pain: true }).emergency).toBe(true);
    expect(assessBloodPressure({ ...normal, breathing_difficulty: true }).emergency).toBe(true);
  });

  it('escalates symptomatic hypotension', () => {
    const r = assessBloodPressure({
      ...normal,
      readings: [{ systolic: 85, diastolic: 55, pulse: null }],
      dizziness_on_standing: true,
    });
    expect(r.emergency).toBe(true);
    expect(r.safety_flags).toContain('symptomatic_hypotension');
  });

  it('never advises starting or stopping medication', () => {
    const text = assessBloodPressure(normal).recommendations.join(' ').toLowerCase();
    expect(text).toContain('never start or stop');
    expect(text).not.toMatch(/\b\d+\s?(mg|mcg|iu)\b/i);
  });
});
