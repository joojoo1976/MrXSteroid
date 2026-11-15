/**
 * lib/tools/engines/tool-132-ai-pose-form-coach.ts
 * Tool #132 — AI Pose Form Coach
 * (Layer 1 — Pure Calculation Engine)
 *
 * PURE MODULE — no React, no DOM, no Supabase, no Date, no I/O.
 *
 * SCOPE: Checklist-based form scoring for common exercises.
 * Video/MediaPipe analysis is NOT_AVAILABLE (no MediaPipe in repo).
 * Confidence is NOT_AVAILABLE (no calibrated model).
 */

export type Exercise = 'squat' | 'deadlift' | 'bench' | 'overhead_press' | 'row';

export interface PoseCoachInput {
  exercise: Exercise;
  videoUrl?: string;
  checklist?: Array<{ item: string; passed: boolean }>;
}

export interface PoseCoachResult {
  formScore: number | null;
  checklist: Array<{ item: string; importance: string; passed: boolean }>;
  poseAnalysis: { kneeAngle: number; backAngle: number } | null;
  personalizedCue: string;
  confidence: number | null;
  source: string;
  scope_notice: string;
}

const CHECKLISTS: Record<Exercise, Array<{ item: string; importance: string }>> = {
  squat: [
    { item: 'Knees track over toes', importance: 'high' },
    { item: 'Back neutral, chest up', importance: 'high' },
    { item: 'Depth at or below parallel', importance: 'medium' },
    { item: 'Weight on mid-foot', importance: 'medium' },
  ],
  deadlift: [
    { item: 'Bar close to shins', importance: 'high' },
    { item: 'Back neutral', importance: 'high' },
    { item: 'Hips and shoulders rise together', importance: 'medium' },
  ],
  bench: [
    { item: 'Feet flat on floor', importance: 'high' },
    { item: 'Shoulder blades retracted', importance: 'high' },
    { item: 'Bar path over mid-chest', importance: 'medium' },
  ],
  overhead_press: [
    { item: 'Core braced', importance: 'high' },
    { item: 'Bar over mid-foot', importance: 'high' },
    { item: 'Full lockout', importance: 'medium' },
  ],
  row: [
    { item: 'Back neutral', importance: 'high' },
    { item: 'Elbows close to body', importance: 'medium' },
    { item: 'Full range of motion', importance: 'medium' },
  ],
};

export function calculatePoseCoach(input: PoseCoachInput): PoseCoachResult {
  const exercise = input.exercise || 'squat';
  const baseChecklist = CHECKLISTS[exercise] || CHECKLISTS.squat;
  const userChecklist = input.checklist || [];

  const checklist = baseChecklist.map((item) => {
    const userItem = userChecklist.find((u) => u.item === item.item);
    return { ...item, passed: userItem ? userItem.passed : false };
  });

  const passedCount = checklist.filter((c) => c.passed).length;
  const formScore = checklist.length > 0 ? Math.round((passedCount / checklist.length) * 100) : 0;

  const personalizedCue = exercise === 'squat'
    ? 'Keep knees tracking over toes and maintain a neutral spine throughout the movement.'
    : exercise === 'deadlift'
    ? 'Keep the bar close to your shins and maintain a neutral back.'
    : exercise === 'bench'
    ? 'Retract shoulder blades and keep feet flat on the floor.'
    : exercise === 'overhead_press'
    ? 'Brace your core and keep the bar over mid-foot.'
    : 'Maintain a neutral back and full range of motion.';

  return {
    formScore,
    checklist,
    poseAnalysis: null, // NOT_AVAILABLE: no MediaPipe in repo
    personalizedCue,
    confidence: null, // NOT_AVAILABLE: no calibrated model
    source: 'checklist-only (no video analysis)',
    scope_notice: 'educational_form_checklist_not_a_coaching_prescription',
  };
}