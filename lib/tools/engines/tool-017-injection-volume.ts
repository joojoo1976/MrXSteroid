/**
 * Tool #017b — Injection Volume Calculator (engine)
 * Computes injection volume per site from concentration and desired dose.
 */

import type {
  InjectionVolumeInput,
  InjectionVolumeResult,
  InjectionSite,
} from '../schemas/tool-017-injection-volume';

const MAX_VOLUME_ML: Record<InjectionSite['muscle_group'], number> = {
  deltoid: 1,
  glutes: 3,
  quads: 2,
  pectorals: 1,
  triceps: 1,
  biceps: 1,
};

export function calculateInjectionVolume(input: InjectionVolumeInput): InjectionVolumeResult {
  const { target_muscle, compound_viscosity, concentration_mg_ml, desired_dose_mg, current_sites } = input;

  const desired_dose_ml = Math.round((desired_dose_mg / Math.max(concentration_mg_ml, 1)) * 100) / 100;
  const viscosityFactor = compound_viscosity === 'high' ? 0.8 : compound_viscosity === 'low' ? 1.1 : 1.0;
  const max_recommended_ml =
    Math.round(Math.min(5, (MAX_VOLUME_ML[target_muscle] ?? 1) * viscosityFactor) * 100) / 100;

  const warnings: string[] = [];
  if (desired_dose_ml > max_recommended_ml) {
    warnings.push(
      `Desired volume ${desired_dose_ml} mL exceeds ${max_recommended_ml} mL safe limit for ${target_muscle} — split the dose across sites.`
    );
  }
  if (compound_viscosity === 'high') {
    warnings.push('High-viscosity oil: warm the vial, inject slowly, use a 23G needle.');
  }

  const rotation_schedule = current_sites.map((s) => `${s.name_en}: last used ${s.last_injection_date ?? 'unknown'}`);

  return {
    desired_dose_ml,
    max_recommended_ml,
    injection_sites: current_sites,
    rotation_schedule,
    warnings,
    measurement_system: 'metric',
    imperial_conversion: Math.round(desired_dose_ml * 0.033814 * 1000) / 1000,
  };
}