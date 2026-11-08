import { describe, it, expect } from 'vitest';
import { calculatePoseCoach } from './tool-132-ai-pose-form-coach';

describe('Tool #132 — AI Pose Form Coach', () => {
  it('returns form score for squat with all passed', () => {
    const r = calculatePoseCoach({ exercise: 'squat', checklist: [
      { item: 'Knees track over toes', passed: true },
      { item: 'Back neutral, chest up', passed: true },
      { item: 'Depth at or below parallel', passed: true },
      { item: 'Weight on mid-foot', passed: true },
    ]});
    expect(r.formScore).toBe(100);
    expect(r.checklist.length).toBe(4);
    expect(r.poseAnalysis).toBeNull();
    expect(r.confidence).toBeNull();
  });

  it('returns 0 when no items passed', () => {
    const r = calculatePoseCoach({ exercise: 'squat' });
    expect(r.formScore).toBe(0);
  });

  it('returns NOT_AVAILABLE for video analysis', () => {
    const r = calculatePoseCoach({ exercise: 'deadlift', videoUrl: 'test.mp4' });
    expect(r.poseAnalysis).toBeNull();
    expect(r.confidence).toBeNull();
    expect(r.source).toBe('checklist-only (no video analysis)');
  });

  it('handles all exercises', () => {
    for (const ex of ['squat', 'deadlift', 'bench', 'overhead_press', 'row'] as const) {
      const r = calculatePoseCoach({ exercise: ex });
      expect(r.checklist.length).toBeGreaterThan(0);
      expect(r.personalizedCue).toBeTruthy();
    }
  });
});