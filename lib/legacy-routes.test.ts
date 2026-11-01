import { describe, expect, it } from 'vitest';
import { Page } from '@/shared/types/types';
import { pageToPath, pathToPage } from './legacy-routes';

describe('Training & recovery tool route identity mapping', () => {
  it.each([
    [Page.CNS_RECOVERY_SCORE, '/smarttools/training-recovery/tool-118-cns-recovery-score'],
    [Page.TRAINING_VOLUME_HYPERTROPHY_INDEX, '/smarttools/training-recovery/tool-119-training-volume-hypertrophy-index'],
    [Page.PROGRESSIVE_OVERLOAD_PREDICTOR, '/smarttools/training-recovery/tool-120-progressive-overload-predictor'],
    [Page.MUSCLE_GROUP_RECOVERY_MODELER, '/smarttools/training-recovery/tool-121-muscle-group-recovery-modeler'],
    [Page.NEUROMUSCULAR_EXPLOSIVENESS_MODELER, '/smarttools/training-recovery/tool-126-neuromuscular-explosiveness-modeler'],
    [Page.AI_DAILY_READINESS_EXPLAINER, '/smarttools/training-recovery/tool-127-ai-daily-readiness-explainer'],
    [Page.TRAINING_LOAD_ACUTE_CHRONIC_RATIO, '/smarttools/training-recovery/tool-128-training-load-acute-chronic-ratio'],
    [Page.AI_ADAPTIVE_TRAINING_PLANNER, '/smarttools/training-recovery/tool-129-ai-adaptive-training-planner'],
    [Page.AI_PLATEAU_DETECTIVE, '/smarttools/training-recovery/tool-130-ai-plateau-detective'],
    [Page.TRANSFORMATION_FORECAST_TRAJECTORY, '/smarttools/body-composition/tool-131-transformation-forecast-trajectory-engine'],
    [Page.PHYSIQUE_TRAJECTORY_SIMULATOR, '/smarttools/body-composition/tool-149-physique-trajectory-simulator'],
    [Page.PERSONAL_FITNESS_MEMORY_LAYER, '/smarttools/platform-ai/tool-148-personal-fitness-memory-layer'],
    [Page.EMERGENCY_WARNING_SIGNS_CHECKLIST, '/smarttools/platform-ai/tool-146-ai-safety-gate-emergency-protocol'],
    [Page.MANUAL_PERFORMANCE_RESULTS_ORGANIZER, '/smarttools/platform-ai/tool-150-ai-performance-command-center'],
    [Page.EMERGENCY_WARNING_SIGNS_CHECKLIST, '/smarttools/platform-ai/tool-146-ai-safety-gate-emergency-protocol'],
    [Page.REP_TEMPO_VELOCITY_LOSS_ANALYZER, '/smarttools/training-recovery/tool-133-rep-tempo-velocity-loss-analyzer'],
    [Page.MOBILITY_MOVEMENT_SYMMETRY_SCREEN, '/smarttools/training-recovery/tool-134-mobility-movement-symmetry-screen'],
    [Page.EXERCISE_SUBSTITUTION_AI, '/smarttools/training-recovery/tool-135-exercise-substitution-ai'],
    [Page.PHYSIQUE_GOLDEN_RATIO_SCORE, '/smarttools/body-composition/tool-136-physique-golden-ratio-score'],
  ])('round-trips %s', (page, href) => {
    expect(pageToPath(page)).toBe(href);
    expect(pathToPage(href)).toBe(page);
  });
});
