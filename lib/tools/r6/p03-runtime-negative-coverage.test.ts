import { describe, it, expect, vi, afterEach } from 'vitest';

/**
 * P-03 runtime negative coverage.
 *
 * For each gated pipeline: replace the engine function with a spy that returns
 * a deliberately mismatched object, call the real pipeline, and assert that
 *   - the real ResultSchema rejects it (pipeline returns ok:false), and
 *   - no envelope is produced (no `output` property).
 *
 * Valid input is avoided without touching production code: `createToolSchema`
 * is mocked at the shared boundary so `tryParse` accepts the raw input. The
 * pipeline's own control flow, engine call site, ResultSchema and envelope
 * builder are the real ones.
 *
 * Negative control (documented in P03-RUNTIME-MATRIX-2026-11-18.md): running
 * the same assertion against the ungated tool-007 pipeline returns ok:true and
 * builds an envelope from the mismatched object. That control is what makes
 * these tests sensitive to a missing or misordered gate.
 *
 * Tool 008 is intentionally absent: engineResult = parsed.data and the result
 * schema equals the input schema, so it cannot demonstrate rejection of an
 * independently shaped engine result (owner decision 2026-11-18).
 */

vi.mock('@/lib/shared/schema-contract', () => ({
  createToolSchema: () => ({
    schema: {},
    parse: (raw: unknown) => raw,
    tryParse: (raw: unknown) => ({ ok: true, data: raw }),
  }),
}));

const opts = {
  calculatedAt: '2026-11-18T10:00:00.000Z',
  recordedAt: '2026-11-18T09:00:00.000Z',
  locale: 'en' as const,
  unitSystem: 'metric' as const,
  snapshotType: 'draft' as const,
};

const MISMATCH = { __p03_mismatched_engine_result: true };

const CASES: Array<{
  tool: string;
  engineModule: string;
  engineFn: string;
  pipelineModule: string;
  runFn: string;
}> = [
  { tool: '006', engineModule: '@/lib/tools/engines/tool-006-estrogen-prolactin', engineFn: 'calculateAromatizationRisk', pipelineModule: './tool-006-estrogen-prolactin-pipeline', runFn: 'runEstrogenProlactin' },
  { tool: '014', engineModule: '@/lib/tools/engines/tool-014-water-retention', engineFn: 'calculateWaterRetention', pipelineModule: './tool-014-water-retention-pipeline', runFn: 'runWaterRetention' },
  { tool: '015', engineModule: '@/lib/tools/engines/tool-015-shbg-modulator', engineFn: 'calculateSHBG', pipelineModule: './tool-015-shbg-modulator-pipeline', runFn: 'runSHBGModulator' },
  { tool: '016', engineModule: '@/lib/tools/engines/tool-016-half-life-calculator', engineFn: 'calculateHalfLife', pipelineModule: './tool-016-half-life-pipeline', runFn: 'r6RunHalfLife' },
  { tool: '017', engineModule: '@/lib/tools/engines/tool-017-drug-interaction', engineFn: 'checkDrugInteractions', pipelineModule: './tool-017-drug-interaction-pipeline', runFn: 'runDrugInteraction' },
  { tool: '022', engineModule: '@/lib/tools/engines/tool-022-half-life-stacker', engineFn: 'calculateStackTiming', pipelineModule: './tool-022-half-life-stacker-pipeline', runFn: 'runHalfLifeStacker' },
  { tool: '023', engineModule: '@/lib/tools/engines/tool-023-trt-optimization', engineFn: 'calculateTrtOptimization', pipelineModule: './tool-023-trt-optimization-pipeline', runFn: 'runTrtOptimization' },
  { tool: '025', engineModule: '@/lib/tools/engines/tool-025-drug-interaction-pro', engineFn: 'buildMedicationSessionV7', pipelineModule: './tool-025-drug-interaction-pro-pipeline', runFn: 'runDrugInteractionPro' },
  { tool: '026', engineModule: '@/lib/tools/engines/tool-026-injection-pain', engineFn: 'buildInjectionExperienceSessionV7', pipelineModule: './tool-026-injection-pain-pipeline', runFn: 'runInjectionPain' },
  { tool: '027', engineModule: '@/lib/tools/engines/tool-027-ester-conversion', engineFn: 'calculateMolarMassRelationshipV7', pipelineModule: './tool-027-ester-conversion-pipeline', runFn: 'runEsterConversion' },
  { tool: '029', engineModule: '@/lib/tools/engines/tool-029-side-effect-early-warning', engineFn: 'summarizeMeasurementReadingsV7', pipelineModule: './tool-029-side-effect-early-warning-pipeline', runFn: 'runSideEffectEarlyWarning' },
  { tool: '031', engineModule: '@/lib/tools/engines/tool-031-cycle-length-optimizer', engineFn: 'calculateCycleLength', pipelineModule: './tool-031-cycle-length-optimizer-pipeline', runFn: 'runCycleLengthOptimizer' },
  { tool: '034', engineModule: '@/lib/tools/engines/tool-034-compound-clearance', engineFn: 'calculateCompoundClearance', pipelineModule: './tool-034-compound-clearance-pipeline', runFn: 'runCompoundClearance' },
  { tool: '035', engineModule: '@/lib/tools/engines/tool-035-hormone-conversion', engineFn: 'calculateHormoneConversion', pipelineModule: './tool-035-hormone-conversion-pipeline', runFn: 'runHormoneConversion' },
  { tool: '037', engineModule: '@/lib/tools/engines/tool-037-side-effect-probability', engineFn: 'calculateSideEffectProbability', pipelineModule: './tool-037-side-effect-probability-pipeline', runFn: 'runSideEffectProbability' },
  { tool: '038', engineModule: '@/lib/tools/engines/tool-038-stack-compatibility', engineFn: 'checkStackCompatibility', pipelineModule: './tool-038-stack-compatibility-pipeline', runFn: 'runStackCompatibility' },
  { tool: '039', engineModule: '@/lib/tools/engines/tool-039-liver-enzyme-tracker', engineFn: 'trackLiverEnzymes', pipelineModule: './tool-039-liver-enzyme-tracker-pipeline', runFn: 'runLiverEnzymeTracker' },
  { tool: '040', engineModule: '@/lib/tools/engines/tool-040-lipid-profile-optimizer', engineFn: 'optimizeLipidProfile', pipelineModule: './tool-040-lipid-profile-optimizer-pipeline', runFn: 'runLipidProfileOptimizer' },
  { tool: '041', engineModule: '@/lib/tools/engines/tool-041-hematocrit-monitor', engineFn: 'monitorHematocrit', pipelineModule: './tool-041-hematocrit-monitor-pipeline', runFn: 'runHematocritMonitor' },
  { tool: '042', engineModule: '@/lib/tools/engines/tool-042-estrogen-management', engineFn: 'manageEstrogen', pipelineModule: './tool-042-estrogen-management-pipeline', runFn: 'runEstrogenManagement' },
  { tool: '043', engineModule: '@/lib/tools/engines/tool-043-prolactin-management', engineFn: 'manageProlactin', pipelineModule: './tool-043-prolactin-management-pipeline', runFn: 'runProlactinManagement' },
  { tool: '044', engineModule: '@/lib/tools/engines/tool-044-dht-side-effects', engineFn: 'predictDhtEffects', pipelineModule: './tool-044-dht-side-effects-pipeline', runFn: 'runDhtSideEffects' },
  { tool: '045', engineModule: '@/lib/tools/engines/tool-045-cycle-break-planner', engineFn: 'planCycleBreak', pipelineModule: './tool-045-cycle-break-planner-pipeline', runFn: 'runCycleBreakPlanner' },
  { tool: '046', engineModule: '@/lib/tools/engines/tool-046-trt-lifetime', engineFn: 'projectTrtLifetime', pipelineModule: './tool-046-trt-lifetime-pipeline', runFn: 'runTrtLifetime' },
  { tool: '047', engineModule: '@/lib/tools/engines/tool-047-fertility-preservation', engineFn: 'assessFertility', pipelineModule: './tool-047-fertility-preservation-pipeline', runFn: 'runFertilityPreservation' },
  { tool: '048', engineModule: '@/lib/tools/engines/tool-048-cardiovascular-risk', engineFn: 'assessCardiovascularRisk', pipelineModule: './tool-048-cardiovascular-risk-pipeline', runFn: 'runCardioRisk' },
  { tool: '049', engineModule: '@/lib/tools/engines/tool-049-bone-density', engineFn: 'assessBoneDensity', pipelineModule: './tool-049-bone-density-pipeline', runFn: 'runBoneDensity' },
  { tool: '050', engineModule: '@/lib/tools/engines/tool-050-mental-health', engineFn: 'assessMentalHealth', pipelineModule: './tool-050-mental-health-pipeline', runFn: 'runMentalHealth' },
  { tool: '051', engineModule: '@/lib/tools/engines/tool-051-peptide-dosage-calculator', engineFn: 'computePeptideDose', pipelineModule: './tool-051-peptide-dosage-pipeline', runFn: 'runPeptideDose' },
];

describe('P-03 runtime negative branch: mismatched engine result -> no envelope', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.resetModules();
  });

  for (const c of CASES) {
    it(`tool-${c.tool}: ${c.engineFn} result is rejected before the envelope`, async () => {
      const engine = (await import(c.engineModule)) as Record<string, any>;
      expect(typeof engine[c.engineFn]).toBe('function');

      const pipe = (await import(c.pipelineModule)) as Record<string, any>;
      expect(typeof pipe[c.runFn]).toBe('function');

      const spy = vi.spyOn(engine, c.engineFn).mockReturnValue(MISMATCH as any);
      const result = pipe[c.runFn]({}, opts);

      expect(spy).toHaveBeenCalledTimes(1);
      expect(result.ok).toBe(false);
      expect(result.error).toBeDefined();
      expect(result).not.toHaveProperty('output');
      expect(result.output).toBeUndefined();
    });
  }
});

describe('P-03 Tool 023 schema rejection (independent of the 12,800 acceptance grid)', () => {
  it('TrtResultSchema rejects a mismatched engine-shaped object', async () => {
    const { TrtResultSchema } = await import('@/lib/tools/schemas/tool-023-trt-optimization');
    expect(TrtResultSchema.safeParse(MISMATCH).success).toBe(false);
    expect(TrtResultSchema.safeParse({}).success).toBe(false);
    expect(TrtResultSchema.safeParse(null).success).toBe(false);
  });
});
