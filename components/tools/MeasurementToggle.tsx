'use client';

/**
 * components/tools/MeasurementToggle.tsx
 * ═══════════════════════════════════════════════════════════════════════════
 *  Shared Measurement Toggle Component for MrXSteroid Tools (#4, #5, etc.)
 * ═══════════════════════════════════════════════════════════════════════════
 * Features:
 *   - Dual-button toggle: Metric (mg/kg/cm) ↔ Imperial (mg/lb/in)
 *   - Auto-persistence in localStorage (key: 'measurementSystem')
 *   - AR / EN bilingual RTL support
 *   - Pure mathematical conversion helpers: kg ↔ lbs
 */
import React, { useEffect, useState } from 'react';

export type MeasurementSystem = 'metric' | 'imperial';

export const KG_TO_LBS = 2.20462;

export const kgToLbs = (kg: number): number => Math.round(kg * KG_TO_LBS);
export const lbsToKg = (lbs: number): number => Math.round((lbs / KG_TO_LBS) * 10) / 10;

/**
 * Mass-ounce conversions for dose-style values (mg ↔ oz). Exact definition:
 * 1 oz = 28.349523125 g. Kept separate from the fluid-ounce (ml) constants in
 * shared/lib/logic — a mass ounce is NOT a fluid ounce.
 */
export const MG_PER_OZ = 28349.523125;
export const mgToOz = (mg: number): number => Math.round((mg / MG_PER_OZ) * 1e6) / 1e6;
export const ozToMg = (oz: number): number => Math.round(oz * MG_PER_OZ * 10) / 10;

export const getStoredMeasurementSystem = (): MeasurementSystem => {
    if (typeof window === 'undefined') return 'metric';
    try {
        const stored = localStorage.getItem('measurementSystem');
        if (stored === 'metric' || stored === 'imperial') return stored;
    } catch {
        // Ignore localStorage errors
    }
    return 'metric';
};

export const storeMeasurementSystem = (system: MeasurementSystem): void => {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem('measurementSystem', system);
    } catch {
        // Ignore localStorage errors
    }
};

export interface MeasurementToggleProps {
    unitSystem?: MeasurementSystem;
    onChange?: (system: MeasurementSystem) => void;
    isRtl?: boolean;
    className?: string;
    showLabel?: boolean;
}

export default function MeasurementToggle({
    unitSystem,
    onChange,
    isRtl = false,
    className = '',
    showLabel = true,
}: MeasurementToggleProps) {
    const [internal, setInternal] = useState<MeasurementSystem>(() => getStoredMeasurementSystem());
    const current = unitSystem ?? internal;

    // Listen to custom mrx_unit_change event and storage events to sync globally
    useEffect(() => {
        const handleUnitChange = (e: Event) => {
            const detail = (e as CustomEvent<MeasurementSystem>).detail;
            if (detail === 'metric' || detail === 'imperial') {
                setInternal(detail);
                onChange?.(detail);
            }
        };

        const handleStorage = (e: StorageEvent) => {
            if (e.key === 'measurementSystem' && (e.newValue === 'metric' || e.newValue === 'imperial')) {
                setInternal(e.newValue);
                onChange?.(e.newValue);
            }
        };

        window.addEventListener('mrx_unit_change', handleUnitChange);
        window.addEventListener('storage', handleStorage);
        return () => {
            window.removeEventListener('mrx_unit_change', handleUnitChange);
            window.removeEventListener('storage', handleStorage);
        };
    }, [onChange]);

    // Initial mount sync if not yet aligned with localStorage
    useEffect(() => {
        const stored = getStoredMeasurementSystem();
        if (stored !== current) {
            setInternal(stored);
            onChange?.(stored);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSelect = (system: MeasurementSystem) => {
        if (system === current) return;
        storeMeasurementSystem(system);
        setInternal(system);
        onChange?.(system);
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('mrx_unit_change', { detail: system }));
        }
    };

    return (
        <div
            className={`measurement-toggle flex items-center bg-slate-900 p-1 rounded-xl border border-slate-700/80 ${className}`}
            dir={isRtl ? 'rtl' : 'ltr'}
        >
            {showLabel && (
                <label className="text-[10px] text-slate-400 font-bold px-2 hidden sm:inline select-none">
                    {isRtl ? 'نظام القياس:' : 'Measurement System:'}
                </label>
            )}
            <button
                id="metric-btn"
                type="button"
                onClick={() => handleSelect('metric')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition ${
                    current === 'metric'
                        ? 'active bg-lime-500 text-slate-950 shadow-sm'
                        : 'text-slate-400 hover:text-white'
                }`}
            >
                {isRtl ? 'متري (كغ/سم)' : 'Metric (mg/kg/cm)'}
            </button>
            <button
                id="imperial-btn"
                type="button"
                onClick={() => handleSelect('imperial')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition ${
                    current === 'imperial'
                        ? 'active bg-lime-500 text-slate-950 shadow-sm'
                        : 'text-slate-400 hover:text-white'
                }`}
            >
                {isRtl ? 'إمبراطوري (رطل/إنش)' : 'Imperial (mg/lb/in)'}
            </button>
        </div>
    );
}
