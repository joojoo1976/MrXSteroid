export type UnitSystem = 'metric' | 'imperial';

const KG_TO_LBS = 2.20462262;

/** Convert a displayed body weight while preserving its physical value. */
export function convertWeightSystem(weight: number, from: UnitSystem, to: UnitSystem): number {
    if (!Number.isFinite(weight) || from === to) return weight;
    const weightKg = from === 'imperial' ? weight / KG_TO_LBS : weight;
    const converted = to === 'imperial' ? weightKg * KG_TO_LBS : weightKg;
    return Math.round(converted * 10) / 10;
}
