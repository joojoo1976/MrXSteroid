/**
 * Tool #039 — Liver Enzyme Tracker
 * ALT/AST/GGT/ALP/bilirubin vs ULN multiples + trend velocity + oral-load score.
 * Pure calculation engine (no I/O, no DB).
 */

export interface LiverReading {
  marker: 'ALT' | 'AST' | 'GGT' | 'ALP' | 'bilirubin';
  value: number;
  unit: string;
  /** ISO-8601 draw date. */
  date: string;
}

export interface LiverTrackerInput {
  readings: LiverReading[];
  oral_steroids: boolean;
  alcohol_drinks_per_week: number;
  uses_tudca: boolean;
}

export type LiverStatus = 'normal' | 'elevated' | 'high' | 'critical';

export interface LiverMarkerStatus {
  marker: string;
  latest_value: number;
  unit: string;
  uln_multiple: number;
  status: LiverStatus;
  trend_per_30d: number;
}

export interface LiverTrackerResult {
  markers: LiverMarkerStatus[];
  overall_status: LiverStatus;
  stop_orals: boolean;
  recommendations: string[];
}

/** Upper limits of normal (standard adult reference). */
const ULN: Record<LiverReading['marker'], { uln: number; unit: string }> = {
  ALT: { uln: 56, unit: 'U/L' },
  AST: { uln: 40, unit: 'U/L' },
  GGT: { uln: 60, unit: 'U/L' },
  ALP: { uln: 147, unit: 'U/L' },
  bilirubin: { uln: 1.2, unit: 'mg/dL' },
};

export function trackLiverEnzymes(input: LiverTrackerInput): LiverTrackerResult {
  const { readings, oral_steroids, alcohol_drinks_per_week, uses_tudca } = input;
  const recommendations: string[] = [];

  const groups = new Map<LiverReading['marker'], LiverReading[]>();
  for (const r of readings) {
    if (!Number.isFinite(r.value)) continue;
    if (Number.isNaN(Date.parse(r.date))) continue;
    const list = groups.get(r.marker) ?? [];
    list.push(r);
    groups.set(r.marker, list);
  }

  const markers: LiverMarkerStatus[] = [];
  for (const [marker, list] of groups) {
    const sorted = [...list].sort((a, b) => Date.parse(a.date) - Date.parse(b.date));
    const latest = sorted[sorted.length - 1];
    const ref = ULN[marker];
    const multiple = Math.round((latest.value / ref.uln) * 100) / 100;
    const status: LiverStatus =
      multiple >= 5 ? 'critical' : multiple >= 3 ? 'high' : multiple > 1 ? 'elevated' : 'normal';

    // trend: (latest - first) per 30 days
    let trend = 0;
    if (sorted.length >= 2) {
      const days = Math.max(1, (Date.parse(sorted[sorted.length - 1].date) - Date.parse(sorted[0].date)) / 86400000);
      trend = Math.round(((sorted[sorted.length - 1].value - sorted[0].value) / days) * 30 * 100) / 100;
    }
    markers.push({ marker, latest_value: latest.value, unit: latest.unit, uln_multiple: multiple, status, trend_per_30d: trend });
  }
  markers.sort((a, b) => b.uln_multiple - a.uln_multiple);

  const rank: Record<LiverStatus, number> = { normal: 0, elevated: 1, high: 2, critical: 3 };
  let overall: LiverStatus = 'normal';
  for (const m of markers) if (rank[m.status] > rank[overall]) overall = m.status;

  // Bilirubin rise alongside transaminases = cholestatic pattern → escalate
  const bili = markers.find((m) => m.marker === 'bilirubin');
  if (bili && bili.uln_multiple > 1.5 && (overall === 'elevated' || overall === 'high')) {
    overall = overall === 'elevated' ? 'high' : 'critical';
    recommendations.push('Bilirubin rising with transaminases (cholestatic pattern) — seek medical evaluation promptly');
  }

  const stopOrals = overall === 'high' || overall === 'critical';
  if (stopOrals) recommendations.push('STOP oral steroids immediately until LFTs normalize — this is non-negotiable');
  else if (oral_steroids && overall === 'elevated') recommendations.push('LFTs mildly elevated on orals — halve oral duration, add TUDCA 500mg 2x/day, retest in 2 weeks');
  if (alcohol_drinks_per_week > 7) recommendations.push(`Alcohol ${alcohol_drinks_per_week}/wk amplifies hepatotoxicity — abstain while on orals`);
  if (!uses_tudca && (oral_steroids || overall !== 'normal')) recommendations.push('Add TUDCA 250-500mg 2x/day + NAC 600mg/day for liver support');
  if (markers.length === 0) recommendations.push('No valid readings — log ALT, AST, GGT, ALP and bilirubin with dates');
  if (overall === 'normal' && markers.length > 0) recommendations.push('LFTs within range — continue standard monitoring every 4-6 weeks on cycle');

  return { markers, overall_status: overall, stop_orals: stopOrals, recommendations };
}
