/**
 * Tool #032 — Advanced PCT Planner
 * Washout math + SERM protocol selection + optional hCG bridge.
 * Pure calculation engine (no I/O, no DB).
 */

export interface PctCompound {
  name_en: string;
  ester_half_life_days: number;
  weekly_dose_mg: number;
  /** ISO-8601 date of the last injection. */
  last_dose_date: string;
  suppression_factor: number; // 0..5
}

export interface PctPlannerInput {
  compounds: PctCompound[];
  hcg_used_on_cycle: boolean;
  /** Residual-fraction threshold that defines "cleared" (default 0.05 = 5%). */
  clearance_threshold?: number;
}

export interface SermPhase {
  drug: 'nolvadex' | 'clomid' | 'nolvadex+clomid';
  daily_dose_mg: string;
  weeks: number;
  note: string;
}

export interface PctPlannerResult {
  washout_days: number;
  pct_start_date: string;
  suppression_load: number;
  serm_protocol: SermPhase[];
  hcg_bridge: { dose_iu: number; per_week: number; weeks: number } | null;
  warnings: string[];
}

/** Half-lives needed for residual fraction f: t = hl * log2(1/f). */
function halfLivesToClear(fraction: number): number {
  return Math.log(1 / fraction) / Math.log(2);
}

export function planAdvancedPCT(input: PctPlannerInput): PctPlannerResult {
  const { compounds, hcg_used_on_cycle, clearance_threshold = 0.05 } = input;
  const warnings: string[] = [];

  if (compounds.length === 0) {
    return {
      washout_days: 0,
      pct_start_date: new Date().toISOString().slice(0, 10),
      suppression_load: 0,
      serm_protocol: [],
      hcg_bridge: null,
      warnings: ['No compounds entered — add at least one compound'],
    };
  }

  // 32.1 Per-compound washout, PCT starts after the slowest clears
  let maxWashout = 0;
  let latestLastDose = 0;
  let suppressionLoad = 0;
  for (const c of compounds) {
    const w = Math.ceil(c.ester_half_life_days * halfLivesToClear(clearance_threshold));
    if (w > maxWashout) maxWashout = w;
    const t = Date.parse(c.last_dose_date);
    if (!Number.isNaN(t) && t > latestLastDose) latestLastDose = t;
    suppressionLoad += c.suppression_factor * (c.weekly_dose_mg / 500);
  }
  suppressionLoad = Math.round(suppressionLoad * 100) / 100;

  const anchor = Number.isNaN(latestLastDose) || latestLastDose === 0 ? Date.now() : latestLastDose;
  const pctStart = new Date(anchor + maxWashout * 86400000).toISOString().slice(0, 10);

  // 32.2 SERM selection by suppression load
  let sermProtocol: SermPhase[];
  if (suppressionLoad > 4) {
    sermProtocol = [
      { drug: 'nolvadex+clomid', daily_dose_mg: 'Nolva 20mg + Clomid 50mg', weeks: 4, note: 'Heavy suppression: dual SERM kickstart' },
      { drug: 'nolvadex', daily_dose_mg: '20mg', weeks: 2, note: 'Taper on Nolvadex alone' },
    ];
    warnings.push('Heavy suppression load — consider 6-week PCT and mid-PCT bloodwork');
  } else if (suppressionLoad > 2) {
    sermProtocol = [
      { drug: 'nolvadex', daily_dose_mg: '20mg', weeks: 4, note: 'Standard moderate-suppression protocol' },
    ];
  } else {
    sermProtocol = [
      { drug: 'nolvadex', daily_dose_mg: '10mg', weeks: 4, note: 'Mild suppression: low-dose protocol' },
    ];
    warnings.push('Mild suppression — low-dose SERM is sufficient; avoid overmedication');
  }

  // 32.3 hCG bridge only when hCG was NOT used on cycle (desensitization guard)
  const hcgBridge = hcg_used_on_cycle
    ? null
    : { dose_iu: 500, per_week: 2, weeks: Math.min(3, Math.max(1, Math.ceil(maxWashout / 14))) };
  if (hcgBridge) {
    warnings.push(`hCG bridge during washout: ${hcgBridge.dose_iu} IU ${hcgBridge.per_week}x/week — stop 48h before first SERM dose`);
  }

  return {
    washout_days: maxWashout,
    pct_start_date: pctStart,
    suppression_load: suppressionLoad,
    serm_protocol: sermProtocol,
    hcg_bridge: hcgBridge,
    warnings,
  };
}
