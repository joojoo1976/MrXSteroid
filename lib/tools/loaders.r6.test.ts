import { describe, expect, it } from 'vitest';
import { getToolComponent } from './loaders';

/**
 * R6 Phase 1 — tool-108 bespoke route rendered the V6 pilot, while the
 * catalog points at the canonical engine component. The dynamic route must
 * keep serving the pilot so no engine output changes silently.
 */
describe('R6 Phase 1 bespoke normalization', () => {
  it('resolves tool-108 to the body-composition V6 pilot', async () => {
    const component = await getToolComponent('tool-108-ai-body-composition-vision-engine');
    expect(component).not.toBeNull();
    expect(component?.name).toContain('Pilot');
  });

  it('resolves all 18 former bespoke slugs to a component', async () => {
    const slugs = [
      'tool-126-neuromuscular-explosiveness-modeler',
      'tool-127-ai-daily-readiness-explainer',
      'tool-128-training-load-acute-chronic-ratio',
      'tool-129-ai-adaptive-training-planner',
      'tool-130-ai-plateau-detective',
      'tool-131-transformation-forecast-trajectory-engine',
      'tool-133-rep-tempo-velocity-loss-analyzer',
      'tool-134-mobility-movement-symmetry-screen',
      'tool-135-exercise-substitution-ai',
      'tool-136-physique-golden-ratio-score',
      'tool-140-dosage-unit-conversion-engine',
      'tool-143-storage-stability-thermal-degradation-estimator',
      'tool-144-homebrew-chemistry-calculator',
      'tool-145-habit-intelligence-consistency-coach',
      'tool-146-ai-safety-gate-emergency-protocol',
      'tool-148-personal-fitness-memory-layer',
      'tool-149-physique-trajectory-simulator',
    ];
    for (const slug of slugs) {
      const component = await getToolComponent(slug);
      expect(component, slug).not.toBeNull();
    }
  });
});
