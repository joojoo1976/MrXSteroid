/**
 * lib/tools/registry.ts
 * Registry for 30 Smart Tools
 */
import { Page } from '@/shared/types/types';
import {
    ACCESS_TIERS,
    ToolContractError,
    createToolOutput,
    type AccessTier,
    type SeoLinks,
    type ToolLink,
    type ToolOutput,
    type ToolOutputParams,
} from './contracts';

export type StackStatus = 'legacy' | 'layered';

export interface ToolDefinition {
    toolId: string;
    slug: string;
    version: string;
    page: Page;
    href: string;
    titleAr: string;
    titleEn: string;
    accessTier: AccessTier;
    order: number;
    stackStatus: StackStatus;
}

export const TOOL_REGISTRY: readonly ToolDefinition[] = [
{ toolId: 'mrx.tool.macro', slug: 'macro', version: '1.0.0', page: Page.MACRO, href: '/macro', titleAr: 'حاسبة الماكروز المتقدمة', titleEn: 'Advanced Macro Calculator', accessTier: 'free', order: 10, stackStatus: 'legacy' },
  { toolId: 'mrx.tool.bodyfat', slug: 'bodyfat', version: '1.0.0', page: Page.BODYFAT, href: '/bodyfat', titleAr: 'حاسبة نسبة الدهون', titleEn: 'Body Fat Calculator', accessTier: 'free', order: 20, stackStatus: 'legacy' },
  { toolId: 'mrx.tool.injection', slug: 'injection', version: '1.0.0', page: Page.INJECTION, href: '/injection', titleAr: 'خريطة الحقن التفاعلية', titleEn: 'Interactive Injection Map', accessTier: 'free', order: 30, stackStatus: 'legacy' },
  { toolId: 'mrx.tool.halflife', slug: 'halflife', version: '1.0.0', page: Page.HALFLIFE, href: '/halflife', titleAr: 'محاكي نصف العمر', titleEn: 'Half-Life Simulator', accessTier: 'free', order: 40, stackStatus: 'legacy' },
  { toolId: 'mrx.tool.multi-ester-pharmacokinetics', slug: 'multi-ester-pharmacokinetics', version: '1.0.0', page: Page.MULTI_ESTER_PK, href: '/smarttools/multi-ester-pharmacokinetics', titleAr: 'محاكي تراكم الإسترات', titleEn: 'Multi-Ester PK Simulator', accessTier: 'free', order: 50, stackStatus: 'layered' },
  { toolId: 'mrx.tool.hpta-recovery', slug: 'hpta-recovery', version: '1.0.0', page: Page.HPTA_RECOVERY, href: '/smarttools/hpta-recovery', titleAr: 'محاكي استعادة HPTA', titleEn: 'HPTA Recovery Modeler', accessTier: 'free', order: 60, stackStatus: 'layered' },
  { toolId: 'mrx.tool.aromatization-risk', slug: 'aromatization-risk', version: '1.0.0', page: Page.AROMATIZATION_RISK, href: '/smarttools/aromatization-risk', titleAr: 'خطر الأروماتة', titleEn: 'Aromatization Risk', accessTier: 'free', order: 120, stackStatus: 'layered' },
  { toolId: 'mrx.tool.pct-timing', slug: 'pct-timing', version: '1.0.0', page: Page.PCT_TIMING, href: '/smarttools/pct-timing', titleAr: 'محرك توقيت PCT', titleEn: 'PCT Timing Engine', accessTier: 'free', order: 130, stackStatus: 'layered' },
  { toolId: 'mrx.tool.hcg-serm-protocol', slug: 'hcg-serm-protocol', version: '1.0.0', page: Page.HCG_SERM_PROTOCOL, href: '/smarttools/hcg-serm-protocol', titleAr: 'بروتوكول HCG وSERM', titleEn: 'HCG & SERM Protocol', accessTier: 'free', order: 140, stackStatus: 'layered' },
  { toolId: 'mrx.tool.006-estrogen-prolactin', slug: 'tool-006-estrogen-prolactin', version: '1.0.0', page: Page.ESTROGEN_PROLACTIN, href: '/smarttools/tool-006-estrogen-prolactin', titleAr: 'التحكم في الإستروجين والبرولاكتين', titleEn: 'Estrogen & Prolactin Control', accessTier: 'free', order: 200, stackStatus: 'layered' },
  { toolId: 'mrx.tool.007-bloodwork-analyzer', slug: 'tool-007-bloodwork-analyzer', version: '1.0.0', page: Page.BLOODWORK_ANALYZER, href: '/smarttools/tool-007-bloodwork-analyzer', titleAr: 'محلل الفحوصات', titleEn: 'Bloodwork Analyzer', accessTier: 'free', order: 210, stackStatus: 'layered' },
  { toolId: 'mrx.tool.008-side-effect-tracker', slug: 'tool-008-side-effect-tracker', version: '1.0.0', page: Page.SIDE_EFFECT_TRACKER, href: '/smarttools/tool-008-side-effect-tracker', titleAr: 'متتبع الآثار الجانبية', titleEn: 'Side Effect Tracker', accessTier: 'free', order: 220, stackStatus: 'layered' },
  { toolId: 'mrx.tool.009-injection-site-rotator', slug: 'tool-009-injection-site-rotator', version: '1.0.0', page: Page.INJECTION_SITE_ROTATOR, href: '/smarttools/tool-009-injection-site-rotator', titleAr: 'مدور مواقع الحقن', titleEn: 'Injection Site Rotator', accessTier: 'free', order: 230, stackStatus: 'layered' },
  { toolId: 'mrx.tool.010-compound-stack-builder', slug: 'tool-010-compound-stack-builder', version: '1.0.0', page: Page.COMPOUND_STACK_BUILDER, href: '/smarttools/tool-010-compound-stack-builder', titleAr: 'بناء حزمة المركبات', titleEn: 'Compound Stack Builder', accessTier: 'free', order: 240, stackStatus: 'layered' },
  { toolId: 'mrx.tool.011-progress-tracker', slug: 'tool-011-progress-tracker', version: '1.0.0', page: Page.PROGRESS_TRACKER, href: '/smarttools/tool-011-progress-tracker', titleAr: 'متتبع التقدم', titleEn: 'Progress Tracker', accessTier: 'free', order: 250, stackStatus: 'layered' },
  { toolId: 'mrx.tool.012-calorie-adjuster', slug: 'tool-012-calorie-adjuster', version: '1.0.0', page: Page.CALORIE_ADJUSTER, href: '/smarttools/tool-012-calorie-adjuster', titleAr: 'معدل السعرات', titleEn: 'Calorie Adjuster', accessTier: 'free', order: 260, stackStatus: 'layered' },
  { toolId: 'mrx.tool.013-macro-optimizer', slug: 'tool-013-macro-optimizer', version: '1.0.0', page: Page.MACRO_OPTIMIZER, href: '/smarttools/tool-013-macro-optimizer', titleAr: 'محسن الماكروز', titleEn: 'Macro Optimizer', accessTier: 'free', order: 270, stackStatus: 'layered' },
  { toolId: 'mrx.tool.014-water-retention', slug: 'tool-014-water-retention', version: '1.0.0', page: Page.WATER_RETENTION, href: '/smarttools/tool-014-water-retention', titleAr: 'مقيم احتباس الماء', titleEn: 'Water Retention Assessor', accessTier: 'free', order: 280, stackStatus: 'layered' },
  { toolId: 'mrx.tool.015-shbg-modulator', slug: 'tool-015-shbg-modulator', version: '1.0.0', page: Page.SHBG_MODULATOR, href: '/smarttools/tool-015-shbg-modulator', titleAr: 'منظم SHBG', titleEn: 'SHBG Modulator', accessTier: 'free', order: 290, stackStatus: 'layered' },
{ toolId: 'mrx.tool.016-half-life-calculator', slug: 'tool-016-half-life-calculator', version: '1.0.0', page: Page.HALF_LIFE_CALCULATOR, href: '/smarttools/tool-016-half-life-calculator', titleAr: 'حاسبة نصف العمر', titleEn: 'Half-Life Calculator', accessTier: 'free', order: 300, stackStatus: 'layered' },
  { toolId: 'mrx.tool.017-drug-interaction', slug: 'tool-017-drug-interaction', version: '1.0.0', page: Page.DRUG_INTERACTION, href: '/smarttools/tool-017-drug-interaction', titleAr: 'فاحص تفاعلات المركبات', titleEn: 'Drug Interaction Checker', accessTier: 'free', order: 320, stackStatus: 'layered' },
  { toolId: 'mrx.tool.018-hpta-recovery', slug: 'tool-018-hpta-recovery', version: '1.0.0', page: Page.HPTA_RECOVERY_MONITOR, href: '/smarttools/tool-018-hpta-recovery', titleAr: 'مراقب استعادة HPTA', titleEn: 'HPTA Recovery Monitor', accessTier: 'free', order: 340, stackStatus: 'layered' },
  { toolId: 'mrx.tool.019-cardio-monitor', slug: 'tool-019-cardio-monitor', version: '1.0.0', page: Page.CARDIO_MONITOR, href: '/smarttools/tool-019-cardio-monitor', titleAr: 'مراقب القلب والدهون', titleEn: 'Cardio Monitor', accessTier: 'free', order: 350, stackStatus: 'layered' },
  { toolId: 'mrx.tool.020-genetic-potential', slug: 'tool-020-genetic-potential', version: '1.0.0', page: Page.GENETIC_POTENTIAL, href: '/smarttools/tool-020-genetic-potential', titleAr: 'حاسبة القدرة الوراثية', titleEn: 'Genetic Potential Calculator', accessTier: 'free', order: 360, stackStatus: 'layered' },
  { toolId: 'mrx.tool.021-peptide-protocol', slug: 'tool-021-peptide-protocol', version: '1.0.0', page: Page.PEPTIDE_PROTOCOL, href: '/smarttools/tool-021-peptide-protocol', titleAr: 'مخطط بروتوكول الببتيد', titleEn: 'Peptide Protocol Planner', accessTier: 'free', order: 370, stackStatus: 'layered' },
  { toolId: 'mrx.tool.022-half-life-stacker', slug: 'tool-022-half-life-stacker', version: '1.0.0', page: Page.HALF_LIFE_STACKER, href: '/smarttools/tool-022-half-life-stacker', titleAr: 'مركب نصف العمر', titleEn: 'Half-Life Stacker', accessTier: 'free', order: 380, stackStatus: 'layered' },
  { toolId: 'mrx.tool.023-trt-optimization', slug: 'tool-023-trt-optimization', version: '1.0.0', page: Page.TRT_OPTIMIZATION, href: '/smarttools/tool-023-trt-optimization', titleAr: 'تحسين TRT', titleEn: 'TRT Optimization', accessTier: 'free', order: 390, stackStatus: 'layered' },
  { toolId: 'mrx.tool.024-bloodwork-interpreter', slug: 'tool-024-bloodwork-interpreter', version: '1.0.0', page: Page.BLOODWORK_INTERPRETER, href: '/smarttools/tool-024-bloodwork-interpreter', titleAr: 'مفسر الفحوصات', titleEn: 'Bloodwork Interpreter', accessTier: 'free', order: 400, stackStatus: 'layered' },
  { toolId: 'mrx.tool.025-drug-interaction-pro', slug: 'tool-025-drug-interaction-pro', version: '1.0.0', page: Page.DRUG_INTERACTION_PRO, href: '/smarttools/tool-025-drug-interaction-pro', titleAr: 'فاحص التفاعلات الاحترافي', titleEn: 'Drug Interaction Pro', accessTier: 'free', order: 410, stackStatus: 'layered' },
  { toolId: 'mrx.tool.026-injection-pain', slug: 'tool-026-injection-pain', version: '1.0.0', page: Page.INJECTION_PAIN, href: '/smarttools/tool-026-injection-pain', titleAr: 'مقلل ألم الحقن', titleEn: 'Injection Pain Minimizer', accessTier: 'free', order: 420, stackStatus: 'layered' },
  { toolId: 'mrx.tool.027-ester-conversion', slug: 'tool-027-ester-conversion', version: '1.0.0', page: Page.ESTER_CONVERSION, href: '/smarttools/tool-027-ester-conversion', titleAr: 'تحويل الإستر', titleEn: 'Ester Conversion', accessTier: 'free', order: 430, stackStatus: 'layered' },
  { toolId: 'mrx.tool.028-stacking-synergy', slug: 'tool-028-stacking-synergy', version: '1.0.0', page: Page.STACKING_SYNERGY, href: '/smarttools/tool-028-stacking-synergy', titleAr: 'تآزر الحزم', titleEn: 'Stacking Synergy', accessTier: 'free', order: 440, stackStatus: 'layered' },
  { toolId: 'mrx.tool.029-side-effect-early-warning', slug: 'tool-029-side-effect-early-warning', version: '1.0.0', page: Page.SIDE_EFFECT_EARLY_WARNING, href: '/smarttools/tool-029-side-effect-early-warning', titleAr: 'الإنذار المبكر', titleEn: 'Side Effect Early Warning', accessTier: 'free', order: 450, stackStatus: 'layered' },
  { toolId: 'mrx.tool.030-cycle-cost-calculator', slug: 'tool-030-cycle-cost-calculator', version: '1.0.0', page: Page.CYCLE_COST_CALCULATOR, href: '/smarttools/tool-030-cycle-cost-calculator', titleAr: 'حاسبة تكلفة الدورة', titleEn: 'Cycle Cost Calculator', accessTier: 'free', order: 460, stackStatus: 'layered' },
];
// Helper functions for tool lookup
export function getTool(slug: string): ToolDefinition | undefined {
  return TOOL_REGISTRY.find(t => t.slug === slug);
}

export function getToolByPage(page: Page): ToolDefinition | undefined {
  return TOOL_REGISTRY.find(t => t.page === page);
}

export function getToolByHref(href: string): ToolDefinition | undefined {
  return TOOL_REGISTRY.find(t => t.href === href);
}

export function requireTool(slug: string): ToolDefinition {
  const tool = getTool(slug);
  if (!tool) {
    throw new Error(`Tool not found: ${slug}`);
  }
  return tool;
}

export function getDefaultTool(): ToolDefinition {
  return TOOL_REGISTRY[0];
}

export function getToolsByTier(tier: AccessTier): ToolDefinition[] {
  return TOOL_REGISTRY.filter(t => t.accessTier === tier);
}

export function toToolLink(tool: ToolDefinition): ToolLink {
  return {
    slug: tool.slug,
    titleAr: tool.titleAr,
    titleEn: tool.titleEn,
  };
}

export function getToolNeighbors(slug: string): { prevTool: ToolLink; nextTool: ToolLink } {
  const idx = TOOL_REGISTRY.findIndex(t => t.slug === slug);
  if (idx === -1) {
    // Fallback to first tool if slug not found
    return {
      prevTool: toToolLink(TOOL_REGISTRY[TOOL_REGISTRY.length - 1]),
      nextTool: toToolLink(TOOL_REGISTRY[0]),
    };
  }
  const prevTool = idx > 0 ? toToolLink(TOOL_REGISTRY[idx - 1]) : toToolLink(TOOL_REGISTRY[TOOL_REGISTRY.length - 1]);
  const nextTool = idx < TOOL_REGISTRY.length - 1 ? toToolLink(TOOL_REGISTRY[idx + 1]) : toToolLink(TOOL_REGISTRY[0]);
  return { prevTool, nextTool };
}

export function buildSeoLinks(tool: ToolDefinition): SeoLinks {
  const prevTool = tool.order > 10 
    ? toToolLink(TOOL_REGISTRY.find(t => t.order < tool.order && t.order === Math.max(...TOOL_REGISTRY.filter(t => t.order < tool.order).map(t => t.order)))!)
    : toToolLink(TOOL_REGISTRY[TOOL_REGISTRY.length - 1]);
  const nextTool = tool.order < 460 
    ? toToolLink(TOOL_REGISTRY.find(t => t.order > tool.order && t.order === Math.min(...TOOL_REGISTRY.filter(t => t.order > tool.order).map(t => t.order)))!)
    : toToolLink(TOOL_REGISTRY[0]);
  return { prevTool, nextTool };
}

export function buildToolOutput<T>(params: ToolOutputParams<T>): ToolOutput<T> {
  return createToolOutput(params);
}

// Re-export types
export type { ToolOutputParams, ToolOutput, ToolLink, SeoLinks } from './contracts';
