
export const TOOLS_REGISTRY_V5 = [
  {
    id: 'neuromuscular-performance', number: 126, slug: 'neuromuscular-performance-explosiveness',
    name: { ar: 'مختبر الأداء الانفجاري', en: 'Neuromuscular Performance Lab' },
    superAI: { identity: 'مختبر انفجاري يصنف قوة vs سرعة', brainType: 'diagnostic', crossToolLinks: ['mobility-symmetry'], learningEnabled: true, future: ['Force Plate ML', 'MediaPipe Video', 'Plyo Program'] },
    equations: ['RSI=FT/CT (Flanagan 2008)', 'Peak Power=60.7*JH+45.3*BM-2055 (Sayers 1991)'],
    futureEquations: ['RFD=ΔF/Δt (Force Plate)', 'RSI_mod=JH/CT']
  },
  {
    id: 'daily-readiness', number: 127, slug: 'ai-daily-readiness-cause-explainer',
    name: { ar: 'لوحة قرار اليوم', en: 'Daily Readiness' },
    superAI: { identity: 'يفهم لماذا مرهق', brainType: 'predictive', crossToolLinks: ['sleep-quality', 'training-load-acwr'], future: ['LSTM HRV', 'LLM Narrative', 'RL Weights', 'Illness Detection'] },
    equations: ['Readiness=Σ(w_i*norm(factor_i)) Bayesian'],
  },
  // ... 9 more tools 128-136 with similar structure
  {
    id: 'training-load-acwr', number: 128, slug: 'training-load-acwr-balance',
    superAI: { brainType: 'predictive', future: ['Injury Risk Logistic Regression', 'Auto RPE', 'What-If Simulator'] },
  },
  {
    id: 'adaptive-program-planner', number: 129, slug: 'adaptive-program-planner',
    superAI: { brainType: 'generative', future: ['LLM Program Generator', 'Auto-Progression', 'Community Intel'] },
  },
  {
    id: 'plateau-detective', number: 130, slug: 'plateau-detective',
    superAI: { brainType: 'diagnostic', future: ['Multi-Metric', 'Causal AI'] },
  },
  {
    id: 'transformation-forecast', number: 131, slug: 'transformation-forecast',
    superAI: { brainType: 'predictive', future: ['Body Comp P-Ratio', 'Kalman Filter', 'Monte Carlo 1000'] },
  },
  {
    id: 'pose-coach', number: 132, slug: 'pose-form-coach',
    superAI: { brainType: 'diagnostic', future: ['MediaPipe Live', 'Tempo Analysis'] },
  },
  {
    id: 'velocity-loss', number: 133, slug: 'rep-tempo-velocity-loss',
    superAI: { brainType: 'diagnostic', future: ['VBT', 'Bar Path Tracking', 'Auto-Stop'] },
  },
  {
    id: 'mobility-symmetry', number: 134, slug: 'mobility-symmetry-map',
    superAI: { brainType: 'diagnostic', future: ['Corrective Program', '3D Body Map'] },
  },
  {
    id: 'substitution', number: 135, slug: 'exercise-substitution-advisor',
    superAI: { brainType: 'generative', future: ['LLM Substitution', 'Equipment Scanner'] },
  },
  {
    id: 'physique-proportion', number: 136, slug: 'physique-proportion-balance',
    superAI: { brainType: 'comparative', future: ['Aesthetic vs Performance', 'Weak Point Priority'] },
  },
];
