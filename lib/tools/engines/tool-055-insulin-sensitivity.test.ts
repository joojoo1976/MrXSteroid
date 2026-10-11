import { describe, it, expect } from 'vitest';
import { assessInsulinSensitivity, homaIR, quicki } from './tool-055-insulin-sensitivity';

describe('tool-055 Insulin Sensitivity', () => {
  it('HOMA-IR matches the standard formula', () => {
    expect(homaIR(90, 5)).toBeCloseTo((90 * 5) / 405, 2);
  });

  it('QUICKI is higher for more sensitive profiles', () => {
    const sensitive = quicki(85, 4);
    const resistant = quicki(110, 20);
    expect(sensitive).toBeGreaterThan(resistant);
  });

  it('bands: sensitive / borderline / resistant', () => {
    expect(assessInsulinSensitivity({ fasting_glucose_mg_dl: 85, fasting_insulin_uu_ml: 5, activity_days_per_week: 4, sleep_hours: 8 }).band).toBe('insulin-sensitive');
    expect(assessInsulinSensitivity({ fasting_glucose_mg_dl: 100, fasting_insulin_uu_ml: 10, activity_days_per_week: 3, sleep_hours: 7 }).band).toBe('borderline');
    expect(assessInsulinSensitivity({ fasting_glucose_mg_dl: 110, fasting_insulin_uu_ml: 20, activity_days_per_week: 1, sleep_hours: 5 }).band).toBe('insulin-resistant');
  });

  it('recommends clinical assessment when insulin-resistant', () => {
    const r = assessInsulinSensitivity({ fasting_glucose_mg_dl: 115, fasting_insulin_uu_ml: 25, activity_days_per_week: 0, sleep_hours: 5 });
    expect(r.recommendations.join(' ')).toMatch(/clinical/i);
  });

  it('is educational and non-diagnostic', () => {
    const r = assessInsulinSensitivity({ fasting_glucose_mg_dl: 90, fasting_insulin_uu_ml: 6, activity_days_per_week: 4, sleep_hours: 8 });
    expect(r.educational_notice).toMatch(/screening aid/i);
  });
});
