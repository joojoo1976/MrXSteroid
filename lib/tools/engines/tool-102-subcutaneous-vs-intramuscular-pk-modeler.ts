/**
 * Tool #102 — Subcutaneous vs. Intramuscular PK Modeler
 * Layer 1: Pure TypeScript pharmacokinetic EDUCATION model.
 *
 * SCOPE BOUNDARY (master handoff §3): this engine models ABSORPTION CURVES
 * and site geometry only. It never emits a dose, frequency or a personal
 * protocol. The user supplies an already-decided dose purely as a geometric
 * input for volume/concentration/serum-accumulation math. Nothing here is a
 * prescription or medical advice.
 *
 * Model
 * -----
 * Bateman absorption-elimination: C(t) = (F*Dose*ka)/(V*(ka-ke)) *
 * (e^(-ke*t) - e^(-ka*t)). Subcutaneous absorption is slower (higher ka
 * damping) than intramuscular, so the modelled peak is lower and later.
 */

export type InjectionRoute = 'subcutaneous' | 'intramuscular';
export type SiteAnatomy = 'abdomen' | 'thigh' | 'ventrogluteal' | 'deltoid';

export interface SiteProfile {
  anatomy: SiteAnatomy;
  max_subq_ml: number;
  max_im_ml: number;
  absorption_delay_hours: number;
}

export const SITE_PROFILES: Record<SiteAnatomy, SiteProfile> = {
  abdomen: { anatomy: 'abdomen', max_subq_ml: 1.5, max_im_ml: 4, absorption_delay_hours: 0.5 },
  thigh: { anatomy: 'thigh', max_subq_ml: 1.5, max_im_ml: 5, absorption_delay_hours: 0.7 },
  ventrogluteal: { anatomy: 'ventrogluteal', max_subq_ml: 1, max_im_ml: 5, absorption_delay_hours: 1 },
  deltoid: { anatomy: 'deltoid', max_subq_ml: 0.5, max_im_ml: 2, absorption_delay_hours: 1.2 },
};

/** Relative absorption-rate constant for the route (h^-1). IM is faster. */
export const ROUTE_KA: Record<InjectionRoute, number> = {
  intramuscular: 0.35,
  subcutaneous: 0.09,
};

/** Bateman absorption-elimination serum concentration model. */
export function batemanConcentration(
  doseMg: number,
  route: InjectionRoute,
  kePerDay: number,
  hours: number,
  bioavailability = 1,
  volumeOfDistribution = 1,
): number {
  const ka = ROUTE_KA[route];
  const ke = kePerDay / 24;
  const t = hours;
  if (Math.abs(ka - ke) < 1e-9) return (doseMg * bioavailability / volumeOfDistribution) * ke * t * Math.exp(-ke * t);
  const coeff = (doseMg * bioavailability * ka) / (volumeOfDistribution * (ka - ke));
  return coeff * (Math.exp(-ke * t) - Math.exp(-ka * t));
}

export interface SubqVsImInput {
  /** Geometric input only — the dose the user already decided to administer. */
  dose_mg: number;
  /** Concentration of the user's own preparation (mg/mL). */
  concentration_mg_ml: number;
  site_anatomy: SiteAnatomy;
  elimination_half_life_days: number;
  injection_interval_days: number;
}

export interface RouteComparison {
  route: InjectionRoute;
  volume_ml: number;
  site_volume_limit_ml: number;
  volume_within_limit: boolean;
  peak_absorption_hours: number;
  peak_concentration: number;
  concentration_at_interval: number;
  steady_state_accumulation_factor: number;
  education_flags: string[];
}

export interface SubqVsImResult {
  volume_ml: number;
  concentration_mg_ml: number;
  subcutaneous: RouteComparison;
  intramuscular: RouteComparison;
  faster_peak_route: InjectionRoute;
  higher_peak_route: InjectionRoute;
  scope_notice: string;
}

/** Estimate time-to-peak for the Bateman curve (numerical argmax, 0.1h steps). */
export function estimatePeakTime(
  doseMg: number,
  route: InjectionRoute,
  kePerDay: number,
): number {
  const site = SITE_PROFILES.abdomen;
  let bestT = 0;
  let bestC = -1;
  for (let t = 0; t <= 120; t += 0.1) {
    const c = batemanConcentration(doseMg, route, kePerDay, t + site.absorption_delay_hours);
    if (c > bestC) { bestC = c; bestT = t; }
  }
  return Math.round(bestT * 10) / 10;
}

function compareRoute(
  input: SubqVsImInput,
  route: InjectionRoute,
): RouteComparison {
  const kePerDay = Math.log(2) / input.elimination_half_life_days;
  const volumeMl = Math.round((input.dose_mg / input.concentration_mg_ml) * 100) / 100;
  const site = SITE_PROFILES[input.site_anatomy];
  const limit = route === 'subcutaneous' ? site.max_subq_ml : site.max_im_ml;
  const peakHours = estimatePeakTime(input.dose_mg, route, kePerDay) + site.absorption_delay_hours;
  const peakC = batemanConcentration(input.dose_mg, route, kePerDay, peakHours);
  const cAtInterval = batemanConcentration(input.dose_mg, route, kePerDay, input.injection_interval_days * 24);
  const accumulation = 1 / (1 - Math.pow(2, -input.injection_interval_days / input.elimination_half_life_days));

  const education_flags: string[] = [];
  if (volumeMl > limit) {
    education_flags.push('volume_exceeds_site_geometric_limit_reduce_or_split_site');
  }
  if (route === 'subcutaneous' && input.concentration_mg_ml > 100) {
    education_flags.push('high_concentration_subq_more_common_local_tissue_reaction_reported');
  }
  if (input.injection_interval_days < input.elimination_half_life_days) {
    education_flags.push('interval_shorter_than_half_life_causes_steady_state_accumulation');
  }

  return {
    route,
    volume_ml: volumeMl,
    site_volume_limit_ml: limit,
    volume_within_limit: volumeMl <= limit,
    peak_absorption_hours: Math.round(peakHours * 10) / 10,
    peak_concentration: Math.round(peakC * 1000) / 1000,
    concentration_at_interval: Math.round(cAtInterval * 1000) / 1000,
    steady_state_accumulation_factor: Math.round(accumulation * 1000) / 1000,
    education_flags,
  };
}

export function calculateSubqVsIm(input: SubqVsImInput): SubqVsImResult {
  const subcutaneous = compareRoute(input, 'subcutaneous');
  const intramuscular = compareRoute(input, 'intramuscular');
  return {
    volume_ml: Math.round((input.dose_mg / input.concentration_mg_ml) * 100) / 100,
    concentration_mg_ml: input.concentration_mg_ml,
    subcutaneous,
    intramuscular,
    faster_peak_route:
      intramuscular.peak_absorption_hours < subcutaneous.peak_absorption_hours
        ? 'intramuscular'
        : 'subcutaneous',
    higher_peak_route:
      intramuscular.peak_concentration >= subcutaneous.peak_concentration
        ? 'intramuscular'
        : 'subcutaneous',
    scope_notice:
      'educational_absorption_and_site_geometry_model_only_not_a_dosing_protocol_or_prescription',
  };
}

