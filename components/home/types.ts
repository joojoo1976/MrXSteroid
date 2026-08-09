/**
 * Shared client types for the home components.
 */
import type { MetabolicInput } from '../../lib/metabolicModel';

export type TrainingAge = MetabolicInput['trainingAge'];
export type Goal = MetabolicInput['goal'];
export type ActivityLevel = MetabolicInput['activityLevel'];
export type Sex = MetabolicInput['sex'];
export type UnitSystem = 'metric' | 'imperial';
