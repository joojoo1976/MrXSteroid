/**
 * useMetabolicState.ts
 * Ephemeral, client-only metabolic state store built on useSyncExternalStore.
 *
 * Security rule: NO biometric/body metrics are ever persisted to localStorage.
 * The store is pure in-memory ephemeral state; a page refresh resets it to the
 * engine defaults. This satisfies the zero-persistence requirement by design.
 */
import { useSyncExternalStore, useCallback } from 'react';
import type { MetabolicInput, MetabolicOutput } from '../lib/metabolicModel';
import { simulateMetabolism, DEFAULT_METABOLIC_INPUT } from '../lib/metabolicModel';

let current = DEFAULT_METABOLIC_INPUT;
let snapshot = simulateMetabolism(current);
const listeners = new Set<() => void>();

function emit() {
    // Derive the next output synchronously from the latest input.
    snapshot = simulateMetabolism(current);
    listeners.forEach((l) => l());
}

export const getMetabolicInput = () => current;
export const getMetabolicOutput = () => snapshot;

export function setMetabolicInput(update: Partial<MetabolicInput>) {
    current = { ...current, ...update };
    emit();
}

export function resetMetabolicInput() {
    current = { ...DEFAULT_METABOLIC_INPUT };
    emit();
}

/**
 * React binding. `useSyncExternalStore` guarantees the rendered output never
 * tears from the store state between the server snapshot and client hydration
 * (no hydration mismatch, no stale readout).
 */
export function useMetabolicState(): {
    input: MetabolicInput;
    output: MetabolicOutput;
    setInput: (update: Partial<MetabolicInput>) => void;
    reset: () => void;
} {
    const input = useSyncExternalStore(subscribe, getMetabolicInput);
    const output = useSyncExternalStore(subscribe, getMetabolicOutput);
    const setInput = useCallback((update: Partial<MetabolicInput>) => setMetabolicInput(update), []);
    const reset = useCallback(() => resetMetabolicInput(), []);
    return { input, output, setInput, reset };
}

function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
}
