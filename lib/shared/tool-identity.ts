// lib/shared/tool-identity.ts
// §31/§35.3 Unique identity contract for tools (pure TS)

export interface ToolIdentity {
  toolId: string;
  uniqueValueProposition: string;
  primaryDecision: string;
  signatureVisualization: string;
  signatureInteraction: string;
  emotionalTone?: string;
  secondaryMetrics?: string[];
  primaryMetric: string;
  nextBestAction: string;
  relatedTools: string[];
  bookChapterMap?: string[];
}

export const TOOL_IDENTITIES_WAVE1: Record<string, ToolIdentity> = {
  'mrx.tool.bodyfat': {
    toolId: 'mrx.tool.bodyfat',
    uniqueValueProposition: 'Body composition analyzer — fat mass, lean mass, FFMI',
    primaryDecision: 'What is my body fat % and lean mass?',
    signatureVisualization: 'Timeline of measurements + comparison',
    signatureInteraction: 'Add new measurement',
    primaryMetric: 'bodyFatPercent',
    nextBestAction: 'Carry weight+bodyFat to Macro Calculator',
    relatedTools: ['mrx.tool.macro', 'mrx.tool.master-calculator'],
    bookChapterMap: ['Body Composition'],
  },
  'mrx.tool.macro': {
    toolId: 'mrx.tool.macro',
    uniqueValueProposition: 'Macro distributor — protein/carbs/fat split',
    primaryDecision: 'How do I split protein/carbs/fat?',
    signatureVisualization: 'Macro donuts/bars',
    signatureInteraction: 'Adjust ratios & weight',
    primaryMetric: 'calories',
    nextBestAction: 'Continue to Transformation Forecast',
    relatedTools: ['mrx.tool.bodyfat'],
    bookChapterMap: ['Nutrition'],
  },
};

export const TOOL_IDENTITIES_WAVE3: Record<string, ToolIdentity> = {
  'mrx.tool.genetic': {
    toolId: 'mrx.tool.genetic',
    uniqueValueProposition: 'Genetic potential estimator — training ceiling & risk factors',
    primaryDecision: 'What is my genetic training potential?',
    signatureVisualization: 'Score bar + comparison',
    signatureInteraction: 'Adjust inputs and recalculate',
    primaryMetric: 'potentialScore',
    nextBestAction: 'Carry weight+bodyFat to Transformation Forecast',
    relatedTools: ['mrx.tool.bodyfat'],
    bookChapterMap: ['Genetics'],
  },
  'mrx.tool.body-composition-vision': {
    toolId: 'mrx.tool.body-composition-vision',
    uniqueValueProposition: 'Body composition estimator from circumference measurements',
    primaryDecision: 'What is my body fat % from measurements?',
    signatureVisualization: 'BF bar + breakdown',
    signatureInteraction: 'Enter measurements',
    primaryMetric: 'bodyFatPercent',
    nextBestAction: 'Carry to Macro Calculator',
    relatedTools: ['mrx.tool.bodyfat', 'mrx.tool.macro'],
    bookChapterMap: ['Body Composition'],
  },
};
export const TOOL_IDENTITIES_WAVE4: Record<string, ToolIdentity> = {
  'mrx.tool.one-rep-max': { toolId: 'mrx.tool.one-rep-max', uniqueValueProposition: '1RM estimator', primaryDecision: 'What is my 1RM?', signatureVisualization: 'bar', signatureInteraction: 'enter weight/reps', primaryMetric: 'oneRepMaxKg', nextBestAction: 'View strength standards', relatedTools: ['mrx.tool.strength-standards'], bookChapterMap: ['Training'] },
  'mrx.tool.strength-standards': { toolId: 'mrx.tool.strength-standards', uniqueValueProposition: 'Strength level classifier', primaryDecision: 'What level am I?', signatureVisualization: 'level badge', signatureInteraction: 'enter lift/bw', primaryMetric: 'ratio', nextBestAction: 'Plan progression', relatedTools: ['mrx.tool.one-rep-max'], bookChapterMap: ['Training'] },
  'mrx.tool.rest-timer': { toolId: 'mrx.tool.rest-timer', uniqueValueProposition: 'Rest interval recommender', primaryDecision: 'How long to rest?', signatureVisualization: 'timer', signatureInteraction: 'select intensity', primaryMetric: 'restSeconds', nextBestAction: 'Start next set', relatedTools: [], bookChapterMap: ['Training'] },
};
export const TOOL_IDENTITIES_WAVE5: Record<string, ToolIdentity> = {
  'mrx.tool.127-ai-daily-readiness-explainer': { toolId: 'mrx.tool.127-ai-daily-readiness-explainer', uniqueValueProposition: 'Daily readiness scoring', primaryDecision: 'Am I ready to train?', signatureVisualization: 'readiness ring', signatureInteraction: 'enter sleep/stress', primaryMetric: 'readinessScore', nextBestAction: 'Plan workout', relatedTools: ['mrx.tool.128-training-load-acute-chronic-ratio'], bookChapterMap: ['Training'] },
  'mrx.tool.128-training-load-acute-chronic-ratio': { toolId: 'mrx.tool.128-training-load-acute-chronic-ratio', uniqueValueProposition: 'ACWR load balance', primaryDecision: 'Is my load balanced?', signatureVisualization: 'ACWR line', signatureInteraction: 'enter sessions', primaryMetric: 'acwr', nextBestAction: 'Adjust load', relatedTools: ['mrx.tool.127-ai-daily-readiness-explainer'], bookChapterMap: ['Training'] },
  'mrx.tool.129-ai-adaptive-training-planner': { toolId: 'mrx.tool.129-ai-adaptive-training-planner', uniqueValueProposition: 'Adaptive planner', primaryDecision: 'What plan today?', signatureVisualization: 'weekly timeline', signatureInteraction: 'enter goal/equipment', primaryMetric: 'weeklyPlan', nextBestAction: 'Start plan', relatedTools: ['mrx.tool.127-ai-daily-readiness-explainer'], bookChapterMap: ['Training'] },
  'mrx.tool.126-neuromuscular-explosiveness-modeler': { toolId: 'mrx.tool.126-neuromuscular-explosiveness-modeler', uniqueValueProposition: 'Neuromuscular performance', primaryDecision: 'How explosive am I?', signatureVisualization: 'radar', signatureInteraction: 'enter jumps/sprints', primaryMetric: 'explosivenessScore', nextBestAction: 'Plan power work', relatedTools: [], bookChapterMap: ['Training'] },
  'mrx.tool.130-ai-plateau-detective': { toolId: 'mrx.tool.130-ai-plateau-detective', uniqueValueProposition: 'Plateau detection', primaryDecision: 'Am I plateaued?', signatureVisualization: 'timeline', signatureInteraction: 'enter history', primaryMetric: 'isPlateau', nextBestAction: 'Adjust plan', relatedTools: [], bookChapterMap: ['Training'] },
  'mrx.tool.133-rep-tempo-velocity-loss-analyzer': { toolId: 'mrx.tool.133-rep-tempo-velocity-loss-analyzer', uniqueValueProposition: 'Velocity loss analysis', primaryDecision: 'How much fatigue?', signatureVisualization: 'velocity curve', signatureInteraction: 'enter sets', primaryMetric: 'velocityLossPercent', nextBestAction: 'Adjust load', relatedTools: [], bookChapterMap: ['Training'] },
  'mrx.tool.136-physique-golden-ratio-score': { toolId: 'mrx.tool.136-physique-golden-ratio-score', uniqueValueProposition: 'Physique proportions', primaryDecision: 'How balanced am I?', signatureVisualization: 'radar', signatureInteraction: 'enter measurements', primaryMetric: 'proportionScore', nextBestAction: 'Target weak points', relatedTools: [], bookChapterMap: ['Body Composition'] },
};

