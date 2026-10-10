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
