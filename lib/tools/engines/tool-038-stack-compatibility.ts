/**
 * Tool #038 — Stack Compatibility Checker
 * Pairwise interaction matrix: 19-nor conflicts, dual-orals, DHT stacking,
 * AI load and total androgen burden → compatibility score + flags.
 * Pure calculation engine (no I/O, no DB).
 */

export interface StackItem {
  name_en: string;
  family: 'testosterone' | 'nandrolone' | 'trenbolone' | 'dht' | 'oral' | 'ai' | 'serm' | 'support';
  weekly_dose_mg: number;
  hepatotoxic: boolean;
}

export interface StackCompatibilityInput {
  items: StackItem[];
}

export interface CompatibilityFlag {
  code: string;
  message: string;
  severity: 'info' | 'monitor' | 'important';
}

export interface StackCompatibilityResult {
  score_0_100: number;
  verdict: 'compatible' | 'caution' | 'incompatible';
  flags: CompatibilityFlag[];
  androgen_burden_mg_per_week: number;
}

export function checkStackCompatibility(input: StackCompatibilityInput): StackCompatibilityResult {
  const { items } = input;
  const flags: CompatibilityFlag[] = [];
  let score = 100;

  if (items.length === 0) {
    return { score_0_100: 0, verdict: 'incompatible', flags: [{ code: 'EMPTY', message: 'Empty stack — add at least one compound', severity: 'important' }], androgen_burden_mg_per_week: 0 };
  }

  const fams = items.map((i) => i.family);
  const count = (f: StackItem['family']) => fams.filter((x) => x === f).length;

  // 38.1 Dual 19-nors (nandrolone + trenbolone): prolactin/progesterone pile-up
  if (count('nandrolone') > 0 && count('trenbolone') > 0) {
    score -= 30;
    flags.push({ code: 'DUAL_19NOR', message: 'Nandrolone + trenbolone: dual 19-nor — high prolactin/progesterone risk, requires cabergoline plan + labs', severity: 'important' });
  }

  // 38.2 Dual orals: hepatotoxic stacking
  const orals = items.filter((i) => i.family === 'oral' || i.hepatotoxic);
  if (orals.length >= 2) {
    score -= 25;
    flags.push({ code: 'DUAL_ORAL', message: `Two hepatotoxic orals (${orals.map((o) => o.name_en).join(' + ')}) — avoid stacking; pick one ≤6 weeks with TUDCA`, severity: 'important' });
  } else if (orals.length === 1) {
    score -= 5;
    flags.push({ code: 'SINGLE_ORAL', message: 'Single oral: cap at 4-6 weeks with liver support and LFTs', severity: 'monitor' });
  }

  // 38.3 No testosterone base
  if (count('testosterone') === 0 && (count('nandrolone') > 0 || count('trenbolone') > 0 || count('dht') > 0)) {
    score -= 15;
    flags.push({ code: 'NO_TEST_BASE', message: 'No testosterone base with suppressive androgens — libido/energy crash risk; add TRT-dose test', severity: 'monitor' });
  }

  // 38.4 Triple DHT stacking
  if (count('dht') >= 3) {
    score -= 15;
    flags.push({ code: 'TRIPLE_DHT', message: 'Three DHT derivatives — hairline/prostate/BP load; drop to two max', severity: 'monitor' });
  }

  // 38.5 Androgen burden
  const burden = items
    .filter((i) => ['testosterone', 'nandrolone', 'trenbolone', 'dht', 'oral'].includes(i.family))
    .reduce((s, i) => s + i.weekly_dose_mg, 0);
  if (burden > 1500) {
    score -= 20;
    flags.push({ code: 'HIGH_BURDEN', message: `Androgen burden ${burden} mg/wk > 1500 — advanced-only territory, full monitoring required`, severity: 'important' });
  } else if (burden > 800) {
    score -= 8;
    flags.push({ code: 'MOD_BURDEN', message: `Androgen burden ${burden} mg/wk — intermediate range, watch BP/lipids`, severity: 'monitor' });
  }

  // 38.6 AI present without aromatizing base
  if (count('ai') > 0 && count('testosterone') === 0) {
    score -= 5;
    flags.push({ code: 'AI_NO_SUBSTRATE', message: 'AI without aromatizing substrate — crashed-E2 risk; drop the AI', severity: 'monitor' });
  }

  score = Math.max(0, Math.min(100, score));
  if (flags.length === 0) {
    flags.push({ code: 'CLEAN', message: 'No major interactions detected — standard monitoring still applies', severity: 'info' });
  }

  return {
    score_0_100: score,
    verdict: score >= 75 ? 'compatible' : score >= 45 ? 'caution' : 'incompatible',
    flags,
    androgen_burden_mg_per_week: burden,
  };
}
