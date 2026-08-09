/**
 * BioCalculator.tsx — Client Component (the interactive "proof in the fold").
 * Reads/writes the shared metabolic store via useMetabolicState; validates every
 * mutation through the Zod schema boundary before it reaches the engine.
 */
'use client';

import { useMemo } from 'react';
import { useMetabolicState } from '../../hooks/useMetabolicState';
import { tryParseMetabolicInput } from '../../lib/schemas/calculatorSchema';
import type { TrainingAge, Goal, ActivityLevel, Sex } from './types';

const FIELDS: Array<{
    key: 'weightKg' | 'heightCm' | 'age' | 'bodyFatPct';
    label: string;
    min: number;
    max: number;
    step: number;
    unit: string;
}> = [
    { key: 'weightKg', label: 'Bodyweight', min: 40, max: 180, step: 1, unit: 'kg' },
    { key: 'heightCm', label: 'Height', min: 145, max: 210, step: 1, unit: 'cm' },
    { key: 'age', label: 'Age', min: 16, max: 60, step: 1, unit: 'yrs' },
    { key: 'bodyFatPct', label: 'Body Fat', min: 5, max: 45, step: 1, unit: '%' },
];

const TRAINING_AGES: TrainingAge[] = ['novice', 'intermediate', 'advanced'];
const GOALS: Goal[] = ['cut', 'maintain', 'lean-gain'];
const ACTIVITY_LEVELS: Array<{ value: ActivityLevel; label: string }> = [
    { value: 1.2, label: 'Sedentary' },
    { value: 1.375, label: 'Light' },
    { value: 1.55, label: 'Moderate' },
    { value: 1.725, label: 'High' },
    { value: 1.9, label: 'Athlete' },
];

export default function BioCalculator() {
    const { input, output, setInput } = useMetabolicState();

    // Re-validate the live snapshot through Zod on every render — the engine
    // never sees an un-sanitized value even if a slider races.
    const validation = useMemo(() => tryParseMetabolicInput(input), [input]);
    const valid = validation.ok;

    return (
        <section id="calculator" className="mx-auto max-w-7xl scroll-mt-24 px-6 py-20">
            <div className="glass-strong overflow-hidden rounded-3xl">
                <div className="grid gap-0 lg:grid-cols-2">
                    {/* ── Input panel ─────────────────────────────────── */}
                    <div className="border-b border-white/10 p-8 lg:border-b-0 lg:border-r">
                        <h2 className="text-2xl font-black tracking-tight">
                            Metabolic <span className="neon-text">BioCalc</span>
                        </h2>
                        <p className="mt-2 text-sm text-zinc-400">
                            {valid ? 'Live protocol — adjusts as you move.' : 'Adjust inputs — all values must stay in range.'}
                        </p>

                        <div className="mt-8 space-y-6">
                            {FIELDS.map((f) => (
                                <label key={f.key} className="block">
                                    <span className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-zinc-400">
                                        {f.label}
                                        <span className="tabular-nums text-[rgb(var(--neon-primary))]">
                                            {input[f.key]} {f.unit}
                                        </span>
                                    </span>
                                    <input
                                        type="range"
                                        min={f.min}
                                        max={f.max}
                                        step={f.step}
                                        value={input[f.key]}
                                        onChange={(e) => setInput({ [f.key]: Number(e.target.value) })}
                                        className="mt-2 w-full accent-[rgb(var(--neon-primary))]"
                                    />
                                </label>
                            ))}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Sex</span>
                                    <div className="mt-2 flex gap-2">
                                        {(['male', 'female'] as Sex[]).map((s) => (
                                            <button
                                                key={s}
                                                type="button"
                                                onClick={() => setInput({ sex: s })}
                                                className={`flex-1 rounded-lg px-3 py-2 text-sm font-bold transition-colors ${
                                                    input.sex === s
                                                        ? 'bg-[rgb(var(--neon-primary))] text-black'
                                                        : 'bg-white/5 text-zinc-300 hover:bg-white/10'
                                                }`}
                                            >
                                                {s === 'male' ? 'Male' : 'Female'}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Goal</span>
                                    <div className="mt-2 flex gap-2">
                                        {GOALS.map((g) => (
                                            <button
                                                key={g}
                                                type="button"
                                                onClick={() => setInput({ goal: g })}
                                                className={`flex-1 rounded-lg px-2 py-2 text-[11px] font-bold uppercase transition-colors ${
                                                    input.goal === g
                                                        ? 'bg-[rgb(var(--neon-primary))] text-black'
                                                        : 'bg-white/5 text-zinc-300 hover:bg-white/10'
                                                }`}
                                            >
                                                {g.replace('-', ' ')}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Training Age</span>
                                <div className="mt-2 grid grid-cols-3 gap-2">
                                    {TRAINING_AGES.map((t) => (
                                        <button
                                            key={t}
                                            type="button"
                                            onClick={() => setInput({ trainingAge: t })}
                                            className={`rounded-lg px-3 py-2 text-xs font-bold transition-colors ${
                                                input.trainingAge === t
                                                    ? 'bg-[rgb(var(--neon-primary))] text-black'
                                                    : 'bg-white/5 text-zinc-300 hover:bg-white/10'
                                            }`}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Activity</span>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {ACTIVITY_LEVELS.map((a) => (
                                        <button
                                            key={a.value}
                                            type="button"
                                            onClick={() => setInput({ activityLevel: a.value })}
                                            className={`rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${
                                                input.activityLevel === a.value
                                                    ? 'bg-[rgb(var(--neon-primary))] text-black'
                                                    : 'bg-white/5 text-zinc-300 hover:bg-white/10'
                                            }`}
                                        >
                                            {a.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Live output panel ────────────────────────────── */}
                    <div className="p-8">
                        <div className="grid grid-cols-2 gap-4">
                            <MetricCard label="Basal Metabolism (BMR)" value={`${output.bmrKcal}`} unit="kcal/day" />
                            <MetricCard label="Total Burn (TDEE)" value={`${output.tdeeKcal}`} unit="kcal/day" />
                            <MetricCard
                                label="Target Intake"
                                value={`${output.targetKcal}`}
                                unit="kcal/day"
                                accent
                            />
                            <MetricCard
                                label="Goal Energy"
                                value={`${output.goalSurplusOrDeficitKcal > 0 ? '+' : ''}${output.goalSurplusOrDeficitKcal}`}
                                unit="kcal/day"
                            />
                            <MetricCard label="Protein" value={`${output.proteinG}`} unit="g/day" />
                            <MetricCard label="Carbs" value={`${output.carbsG}`} unit="g/day" />
                            <MetricCard label="Fats" value={`${output.fatG}`} unit="g/day" />
                            <MetricCard label="Water" value={`${output.waterL}`} unit="L/day" />
                        </div>

                        <div className="mt-6 grid grid-cols-3 gap-3">
                            <Stat label="BMI" value={`${output.bmi}`} />
                            <Stat label="Lean Mass" value={`${output.leanMassKg} kg`} />
                            <Stat label="Fat Mass" value={`${output.fatMassKg} kg`} />
                        </div>

                        <div className="mt-6 rounded-2xl border border-[rgb(var(--neon-primary)/0.3)] bg-[rgb(var(--neon-primary)/0.06)] p-5">
                            <div className="flex items-center justify-between text-sm">
                                <span className="font-bold uppercase tracking-wider text-zinc-300">
                                    {input.goal === 'cut' ? 'Projected Weekly Fat Loss' : 'Projection'}
                                </span>
                                <span className="font-black tabular-nums text-[rgb(var(--neon-primary))]">
                                    {input.goal === 'cut' ? `${output.weeklyFatLossKg} kg/wk` : '—'}
                                </span>
                            </div>
                            {output.weeksToGoal != null && (
                                <p className="mt-2 text-xs text-zinc-400">
                                    ≈ {output.weeksToGoal} weeks to reach your body-fat goal at this rate.
                                </p>
                            )}
                            {!valid && (
                                <p className="mt-3 text-xs font-bold text-red-400">
                                    ⚠ Inputs out of physiological range — sanitized values applied.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function MetricCard({ label, value, unit, accent = false }: { label: string; value: string; unit: string; accent?: boolean }) {
    return (
        <div className={`rounded-2xl border p-4 ${accent ? 'neon-border bg-white/[0.03]' : 'border-white/10 bg-white/[0.02]'}`}>
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{label}</p>
            <p className={`mt-2 text-2xl font-black tabular-nums ${accent ? 'neon-text' : 'text-white'}`}>{value}</p>
            <p className="text-[10px] text-zinc-500">{unit}</p>
        </div>
    );
}

function Stat({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-xl bg-white/[0.03] p-3 text-center">
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{label}</p>
            <p className="mt-1 text-sm font-black tabular-nums text-white">{value}</p>
        </div>
    );
}
