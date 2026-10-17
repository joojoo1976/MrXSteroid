/**
 * Tool #036 — Injection Schedule Planner
 * Weekly-dose splitter → per-site rotation calendar with volume guards.
 * Pure calculation engine (no I/O, no DB).
 */

export interface ScheduledCompound {
  name_en: string;
  weekly_dose_mg: number;
  concentration_mg_ml: number;
  injections_per_week: number; // 1..7
  max_ml_per_site: number; // site-volume guard, default 3.0
}

export interface InjectionScheduleInput {
  compounds: ScheduledCompound[];
  rotation_sites: string[];
}

export interface ScheduledShot {
  day: number; // 0 = Monday .. 6 = Sunday
  compound_name: string;
  dose_mg: number;
  volume_ml: number;
  site: string;
  split_warning: boolean;
}

export interface InjectionScheduleResult {
  shots: ScheduledShot[];
  total_volume_ml_per_week: number;
  busiest_day: number;
  warnings: string[];
}

export function planInjectionSchedule(input: InjectionScheduleInput): InjectionScheduleResult {
  const { compounds, rotation_sites } = input;
  const warnings: string[] = [];
  const shots: ScheduledShot[] = [];

  if (rotation_sites.length === 0) {
    return { shots: [], total_volume_ml_per_week: 0, busiest_day: 0, warnings: ['No rotation sites — add at least 2 sites'] };
  }

  // 36.1 Split each weekly dose evenly across its injection days (spread EOD-style)
  let siteCursor = 0;
  let totalVolume = 0;
  for (const c of compounds) {
    const n = Math.max(1, Math.min(7, Math.round(c.injections_per_week)));
    const dosePerShot = c.weekly_dose_mg / n;
    const volumePerShot = dosePerShot / Math.max(1, c.concentration_mg_ml);
    const maxMl = c.max_ml_per_site > 0 ? c.max_ml_per_site : 3.0;
    for (let k = 0; k < n; k++) {
      const day = Math.round((k * 7) / n) % 7;
      const split = volumePerShot > maxMl;
      if (split) warnings.push(`${c.name_en}: ${volumePerShot.toFixed(2)} mL exceeds ${maxMl} mL/site — split across 2 sites`);
      const site = rotation_sites[siteCursor % rotation_sites.length];
      siteCursor++;
      totalVolume += volumePerShot;
      shots.push({
        day,
        compound_name: c.name_en,
        dose_mg: Math.round(dosePerShot * 100) / 100,
        volume_ml: Math.round(volumePerShot * 100) / 100,
        site,
        split_warning: split,
      });
    }
  }

  shots.sort((a, b) => a.day - b.day);
  totalVolume = Math.round(totalVolume * 100) / 100;

  // 36.2 Busiest weekday
  const perDay = new Array(7).fill(0);
  for (const s of shots) perDay[s.day] += s.volume_ml;
  let busiestDay = 0;
  for (let d = 1; d < 7; d++) if (perDay[d] > perDay[busiestDay]) busiestDay = d;
  if (perDay[busiestDay] > 5) warnings.push(`Day ${busiestDay}: ${perDay[busiestDay].toFixed(1)} mL total — consider spreading across more days`);

  return { shots, total_volume_ml_per_week: totalVolume, busiest_day: busiestDay, warnings };
}

/* ==========================================================================
 * v2 — CHRONO-INJECT OS (additive surface; v1 above stays byte-identical)
 * Pure: no I/O, no Date.now(), no Math.random(). Deterministic.
 * ========================================================================== */

export type Zone = 'green' | 'yellow' | 'red';
export type Confidence = 'High' | 'Moderate' | 'Low';

export interface EvidenceRef {
  evidenceId: string;
  confidence: Confidence;
  note?: string;
}

export interface EsterProfile {
  compoundId: string;
  nameEn: string;
  nameAr: string;
  halfLifeDays: number;
  labelApproved: boolean;
  evidence: EvidenceRef;
}

/** Evidence-backed ester table. Non-human-approved esters are labelApproved:false. */
export const ESTER_PROFILES: Record<string, EsterProfile> = {
  'testosterone-propionate': { compoundId: 'testosterone-propionate', nameEn: 'Testosterone Propionate', nameAr: 'بروبايونات التستوستيرون', halfLifeDays: 0.8, labelApproved: true, evidence: { evidenceId: 'A01', confidence: 'Low', note: '~20 h, secondary source' } },
  'testosterone-enanthate': { compoundId: 'testosterone-enanthate', nameEn: 'Testosterone Enanthate', nameAr: 'إينانتات التستوستيرون', halfLifeDays: 4.5, labelApproved: true, evidence: { evidenceId: 'A03', confidence: 'Moderate', note: '~4.5 d, estimate' } },
  'testosterone-cypionate': { compoundId: 'testosterone-cypionate', nameEn: 'Testosterone Cypionate', nameAr: 'سيبيونات التستوستيرون', halfLifeDays: 8, labelApproved: true, evidence: { evidenceId: 'A04', confidence: 'High', note: 'FDA label: approximately 8 days' } },
  'testosterone-undecanoate': { compoundId: 'testosterone-undecanoate', nameEn: 'Testosterone Undecanoate', nameAr: 'أندكانوات التستوستيرون', halfLifeDays: 34, labelApproved: true, evidence: { evidenceId: 'A06', confidence: 'Low', note: '~34 d, castor oil; 21–34 d spread' } },
  'nandrolone-decanoate': { compoundId: 'nandrolone-decanoate', nameEn: 'Nandrolone Decanoate', nameAr: 'ديكانوات ناندرولون', halfLifeDays: 6, labelApproved: true, evidence: { evidenceId: 'A07', confidence: 'Low', note: '~6 d, range varies' } },
  'trenbolone-acetate': { compoundId: 'trenbolone-acetate', nameEn: 'Trenbolone Acetate', nameAr: 'أسيتات ترينبولون', halfLifeDays: 1, labelApproved: false, evidence: { evidenceId: 'A08', confidence: 'Low', note: 'Not approved for human use; non-clinical' } },
  'boldenone-undecylenate': { compoundId: 'boldenone-undecylenate', nameEn: 'Boldenone Undecylenate', nameAr: 'أنديسينيلات بولدونون', halfLifeDays: 14, labelApproved: false, evidence: { evidenceId: 'A09', confidence: 'Low', note: 'Veterinary; not approved for human use' } },
};

const EVIDENCE_BY_ID: Record<string, { confidence: Confidence; note: string }> = {
  B01: { confidence: 'Moderate', note: 'Commonly cited adult IM max ~5 mL' },
  B02: { confidence: 'High', note: 'Deltoid capacity ~1 mL' },
  B04: { confidence: 'High', note: 'Site-specific IM volume (StatPearls)' },
  A08: { confidence: 'Low', note: 'Non-clinical; no human label' },
  A09: { confidence: 'Low', note: 'Veterinary product' },
};

function ref(evidenceId: string, note?: string): EvidenceRef {
  const meta = EVIDENCE_BY_ID[evidenceId];
  return { evidenceId, confidence: meta?.confidence ?? 'Moderate', note: note ?? meta?.note };
}

/** Site-specific single-injection ceiling. */
export function siteCeilingMl(siteId: string): { ceilingMl: number; evidence: EvidenceRef } {
  const s = siteId.toLowerCase();
  if (s.includes('delt')) return { ceilingMl: 1.0, evidence: ref('B02') };
  if (s.includes('glut')) return { ceilingMl: 5.0, evidence: ref('B01') };
  if (s.includes('vastus') || s.includes('quad')) return { ceilingMl: 3.0, evidence: ref('B04') };
  return { ceilingMl: 3.0, evidence: ref('B04') };
}

/** Green ≤2 mL · Yellow >2..5 mL (Limited Evidence) · Red >5 mL. Also elevates zone above the site ceiling. */
export function classifyVolumeZone(volumeMl: number, siteId: string): { zone: Zone; evidence: EvidenceRef } {
  const { ceilingMl } = siteCeilingMl(siteId);
  if (volumeMl > 5) return { zone: 'red', evidence: ref('B01', 'Exceeds commonly cited adult IM maximum ~5 mL') };
  if (volumeMl > 2 || volumeMl > ceilingMl) return { zone: 'yellow', evidence: ref('B01', 'Limited Evidence') };
  return { zone: 'green', evidence: ref('B04', 'Routine practice range') };
}

/** Half-life aware cadence recommendation. */
export function recommendCadence(halfLifeDays: number): { injectionsPerWeek: number; label: string } {
  if (halfLifeDays < 1) return { injectionsPerWeek: 4, label: 'EOD' };
  if (halfLifeDays < 3) return { injectionsPerWeek: 3, label: '3x/week' };
  if (halfLifeDays < 6) return { injectionsPerWeek: 2, label: '2x/week' };
  return { injectionsPerWeek: 1, label: '1x/week' };
}

export interface ChronoCompoundInput {
  compoundId?: string;
  name_en: string;
  weekly_dose_mg: number;
  concentration_mg_ml: number;
  injections_per_week: number;
}

export interface ChronoPlanInput {
  compounds: ChronoCompoundInput[];
  rotation_sites: string[];
  startDateISO?: string;
}

export interface ChronoShot {
  day: number;
  compound_name: string;
  dose_mg: number;
  volume_ml: number;
  site: string;
  zone: Zone;
  evidenceId: string;
  non_clinical: boolean;
}

export type GuardWarningKind = 'zone-yellow' | 'zone-red' | 'weekly-cap' | 'site-ceiling' | 'non-clinical';

export interface GuardWarning {
  siteId: string;
  kind: GuardWarningKind;
  evidence: EvidenceRef;
  message: string;
}

export interface RedFlag {
  code: string;
  messageEn: string;
  messageAr: string;
  evidence?: EvidenceRef;
}

export interface ChronoResult {
  shots: ChronoShot[];
  total_volume_ml_per_week: number;
  busiest_day: number;
  perSite: Record<string, number>;
  warnings: GuardWarning[];
  redFlags: RedFlag[];
  provenance: EvidenceRef[];
  nonClinicalCompounds: string[];
}

export interface PkDoseItem { weeklyDoseMg: number; injectionsPerWeek: number }
export interface PkCurvePoint { dayIndex: number; levelRel: number }
export interface AccumulationPoint { weekIndex: number; levelRel: number; steadyStateReached: boolean }
export interface InjectionLog { siteId: string; dayIndex: number }
export interface RotationEntry { day: number; site: string }
export interface RotationWeek { weekIndex: number; entries: RotationEntry[] }

const WEEKLY_PER_SITE_CAP_ML = 3.0; // design heuristic (evidence-table note)

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Unverified/unknown compounds are treated as NOT label-approved (conservative). */
function resolveProfile(compoundId?: string, name?: string): EsterProfile {
  if (compoundId && ESTER_PROFILES[compoundId]) return ESTER_PROFILES[compoundId];
  const byName = Object.values(ESTER_PROFILES).find((p) => p.nameEn.toLowerCase() === (name ?? '').toLowerCase());
  if (byName) return byName;
  return {
    compoundId: compoundId ?? name ?? 'unknown',
    nameEn: name ?? 'Unknown compound',
    nameAr: name ?? 'مركب غير معروف',
    halfLifeDays: 1,
    labelApproved: false,
    evidence: { evidenceId: '—', confidence: 'Low', note: 'No verified source for this compound' },
  };
}

function fmtVolume(v: number): string {
  return `${v.toFixed(2)} mL`;
}

export function planChronoInjectionSchedule(input: ChronoPlanInput): ChronoResult {
  const { compounds, rotation_sites } = input;
  const empty: ChronoResult = {
    shots: [], total_volume_ml_per_week: 0, busiest_day: 0, perSite: {},
    warnings: [{ siteId: '-', kind: 'zone-red', evidence: ref('B01'), message: 'No rotation sites — add at least 2 sites' }],
    redFlags: [], provenance: [], nonClinicalCompounds: [],
  };
  if (rotation_sites.length === 0) return empty;

  const shots: ChronoShot[] = [];
  const warnings: GuardWarning[] = [];
  const perSite: Record<string, number> = {};
  const nonClinicalCompounds: string[] = [];

  let siteCursor = 0;
  let totalVolume = 0;

  for (const c of compounds) {
    const profile = resolveProfile(c.compoundId, c.name_en);
    if (!profile.labelApproved && !nonClinicalCompounds.includes(c.name_en)) nonClinicalCompounds.push(c.name_en);

    const n = Math.max(1, Math.min(7, Math.round(c.injections_per_week)));
    const dosePerShot = c.weekly_dose_mg / n;
    const volumePerShot = dosePerShot / Math.max(1, c.concentration_mg_ml);

    for (let k = 0; k < n; k++) {
      const day = Math.round((k * 7) / n) % 7;
      const site = rotation_sites[siteCursor % rotation_sites.length];
      siteCursor += 1;

      const { zone, evidence } = classifyVolumeZone(volumePerShot, site);
      const shot: ChronoShot = {
        day,
        compound_name: c.name_en,
        dose_mg: round2(dosePerShot),
        volume_ml: round2(volumePerShot),
        site,
        zone,
        evidenceId: evidence.evidenceId,
        non_clinical: !profile.labelApproved,
      };
      shots.push(shot);

      perSite[site] = round2((perSite[site] ?? 0) + shot.volume_ml);
      totalVolume += shot.volume_ml;

      const { ceilingMl, evidence: ceilingEvidence } = siteCeilingMl(site);
      if (shot.volume_ml > ceilingMl) {
        warnings.push({ siteId: site, kind: 'site-ceiling', evidence: ceilingEvidence, message: `${site}: ${fmtVolume(shot.volume_ml)} exceeds site ceiling ${ceilingMl.toFixed(2)} mL` });
      }
      if (zone === 'yellow') warnings.push({ siteId: site, kind: 'zone-yellow', evidence, message: `${site}: ${fmtVolume(shot.volume_ml)} — Yellow (Limited Evidence)` });
      if (zone === 'red') warnings.push({ siteId: site, kind: 'zone-red', evidence, message: `${site}: ${fmtVolume(shot.volume_ml)} — Red: exceeds common maximum` });
      if (perSite[site] > WEEKLY_PER_SITE_CAP_ML) {
        warnings.push({ siteId: site, kind: 'weekly-cap', evidence: ref('B01', 'Design heuristic: 3 mL/week/site'), message: `${site}: ${fmtVolume(perSite[site])} this week exceeds ${WEEKLY_PER_SITE_CAP_ML} mL/week/site` });
      }
      if (!profile.labelApproved) {
        warnings.push({ siteId: site, kind: 'non-clinical', evidence: profile.evidence, message: `${c.name_en}: non-clinical / not label-backed — treat all values as low confidence` });
      }
    }
  }

  shots.sort((a, b) => a.day - b.day);
  totalVolume = round2(totalVolume);

  const perDay = new Array(7).fill(0);
  for (const s of shots) perDay[s.day] += s.volume_ml;
  let busiestDay = 0;
  for (let d = 1; d < 7; d++) if (perDay[d] > perDay[busiestDay]) busiestDay = d;

  const partial = { shots, total_volume_ml_per_week: totalVolume, busiest_day: busiestDay, perSite, warnings, redFlags: [] as RedFlag[], nonClinicalCompounds };
  const redFlags = detectRedFlags(partial);

  const provenance = collectProvenance({ ...partial, redFlags, provenance: [] });
  for (const c of compounds) provenance.push(resolveProfile(c.compoundId, c.name_en).evidence);
  const deduped = new Map<string, EvidenceRef>();
  for (const p of provenance) if (p.evidenceId && p.evidenceId !== '—' && !deduped.has(p.evidenceId)) deduped.set(p.evidenceId, p);

  return { ...partial, redFlags, provenance: [...deduped.values()] };
}

export function detectRedFlags(partial: {
  shots: ChronoShot[];
  total_volume_ml_per_week: number;
  perSite: Record<string, number>;
  nonClinicalCompounds: string[];
}): RedFlag[] {
  const flags: RedFlag[] = [];

  if (partial.total_volume_ml_per_week > 10) {
    flags.push({
      code: 'high-total-volume',
      messageEn: `High weekly volume: ${fmtVolume(partial.total_volume_ml_per_week)} — review with a clinician.`,
      messageAr: `حجم أسبوعي مرتفع: ${fmtVolume(partial.total_volume_ml_per_week)} — راجع مع طبيب.`,
      evidence: ref('B01'),
    });
  }

  const uses: Record<string, number> = {};
  for (const s of partial.shots) uses[s.site] = (uses[s.site] ?? 0) + 1;
  if (Object.values(uses).some((n) => n > 1)) {
    flags.push({
      code: 'site-reuse-under-7d',
      messageEn: 'A site is reused within the same week (under 7 days). Rotate to another site.',
      messageAr: 'تمت إعادة استخدام موقع خلال أقل من 7 أيام — بدّل الموقع.',
      evidence: ref('B04', 'Heuristic: 7-day floor (Expert Low)'),
    });
  }

  if (partial.nonClinicalCompounds.length > 0) {
    flags.push({
      code: 'non-clinical-compound',
      messageEn: `Non-clinical compound(s): ${partial.nonClinicalCompounds.join(', ')} — no human label source.`,
      messageAr: `مركب غير معتمد بشريًّا: ${partial.nonClinicalCompounds.join('، ')} — لا يوجد مصدر معتمد.`,
      evidence: ref('A08'),
    });
  }

  return flags;
}

function doseDaysFor(item: PkDoseItem): number[] {
  const n = Math.max(1, Math.min(7, Math.round(item.injectionsPerWeek)));
  const days: number[] = [];
  for (let k = 0; k < n; k++) days.push(Math.round((k * 7) / n) % 7);
  return days;
}

/** Sum of decaying doses: exp(-ln2 * t / t½). Non-negative by construction. */
export function simulatePk(profile: EsterProfile, item: PkDoseItem, horizonDays: number): PkCurvePoint[] {
  const lambda = Math.LN2 / profile.halfLifeDays;
  const doseDays = doseDaysFor(item);
  const points: PkCurvePoint[] = [];
  for (let d = 0; d <= horizonDays; d++) {
    let level = 0;
    for (const dd of doseDays) {
      for (let w = dd; w <= d; w += 7) level += Math.exp(-lambda * (d - w));
    }
    points.push({ dayIndex: d, levelRel: level });
  }
  return points;
}

/** Week-end relative level; steady state when the week-over-week rise falls under 5%. */
export function simulateAccumulation(profile: EsterProfile, item: PkDoseItem, weeks: number): AccumulationPoint[] {
  const weekly = simulatePk(profile, { weeklyDoseMg: item.weeklyDoseMg, injectionsPerWeek: item.injectionsPerWeek }, weeks * 7);
  const points: AccumulationPoint[] = [];
  for (let w = 0; w <= weeks; w++) {
    const atWeekEnd = weekly[Math.min(w * 7, weekly.length - 1)];
    const prev = points[points.length - 1];
    const rising = prev && prev.levelRel > 0 ? (atWeekEnd.levelRel - prev.levelRel) / prev.levelRel : 1;
    points.push({
      weekIndex: w,
      levelRel: atWeekEnd.levelRel,
      steadyStateReached: Boolean(prev) && prev!.levelRel > 0 && rising < 0.05,
    });
  }
  return points;
}

/** Moved missed day's shots forward one day; deterministic; keeps total volume. */
export function reflowMissedDose(result: ChronoResult, missedDay: number, profile: EsterProfile): ChronoResult {
  const reflowDay = (missedDay + 1) % 7;
  const shots = result.shots
    .map((s) => (s.day === missedDay ? { ...s, day: reflowDay } : s))
    .sort((a, b) => a.day - b.day);

  const provenance = new Map<string, EvidenceRef>();
  for (const p of [...result.provenance, profile.evidence]) if (p.evidenceId && p.evidenceId !== '—' && !provenance.has(p.evidenceId)) provenance.set(p.evidenceId, p);

  return { ...result, shots, provenance: [...provenance.values()] };
}

/** 12-week rotation; global cursor keeps any site ≥7 days apart when sites.length ≥2. */
export function buildRotationPlan(sites: string[], logs: InjectionLog[] = [], weeks = 12): RotationWeek[] {
  const plan: RotationWeek[] = [];
  let cursor = sites.length > 0 ? logs.length % sites.length : 0;
  for (let w = 0; w < weeks; w++) {
    const entries: RotationEntry[] = [];
    for (const day of [0, 4]) {
      if (sites.length === 0) break;
      entries.push({ day, site: sites[cursor % sites.length] });
      cursor += 1;
    }
    plan.push({ weekIndex: w, entries });
  }
  return plan;
}

export function collectProvenance(result: ChronoResult): EvidenceRef[] {
  const map = new Map<string, EvidenceRef>();
  const add = (r: EvidenceRef) => {
    if (r.evidenceId && r.evidenceId !== '—' && !map.has(r.evidenceId)) map.set(r.evidenceId, r);
  };
  for (const s of result.shots) {
    add(classifyVolumeZone(s.volume_ml, s.site).evidence);
    add(siteCeilingMl(s.site).evidence);
  }
  for (const w of result.warnings) add(w.evidence);
  for (const f of result.redFlags) if (f.evidence) add(f.evidence);
  return [...map.values()];
}
