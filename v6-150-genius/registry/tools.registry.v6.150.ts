
export const TOOLS_REGISTRY_V6_150 = [
  // Batch A 1-25 Body Comp
  { id: 'body-fat-navy', number: 1, category: 'body-composition', superAI: { brainType: 'diagnostic', crossToolLinks: ['tdee', 'ffmi', 'transformation-forecast'], future: ['ML Classification'] } },
  { id: 'bmr-mifflin', number: 18, category: 'body-composition', superAI: { brainType: 'diagnostic', crossToolLinks: ['tdee', 'calorie-calculator'] } },
  { id: 'tdee-calculator', number: 19, category: 'body-composition', superAI: { brainType: 'diagnostic', crossToolLinks: ['calorie-calculator', 'transformation-forecast'] } },
  // ... 22 more for Batch A
  // Batch B 26-50 Nutrition
  { id: 'calorie-calculator', number: 26, category: 'nutrition', superAI: { brainType: 'generative', crossToolLinks: ['tdee', 'macro-split'] } },
  // ... 24 more
  // Batch C 51-85 Training
  { id: 'training-volume', number: 51, category: 'training', superAI: { brainType: 'predictive', crossToolLinks: ['acwr', 'recovery-time'] } },
  { id: 'acwr-balance', number: 75, category: 'training', superAI: { brainType: 'predictive', future: ['Injury Risk Logistic Regression', 'What-If Simulator'] } },
  // Batch D 86-115 Strength
  { id: 'one-rm-calculator', number: 86, category: 'strength', superAI: { brainType: 'diagnostic' } },
  // Batch E 116-136 Physique - includes 11 new genius tools
  { id: 'neuromuscular-performance', number: 126, category: 'physique', superAI: { brainType: 'diagnostic', future: ['Force Plate ML Random Forest', 'MediaPipe Video', 'Plyo Program'] } },
  { id: 'daily-readiness', number: 127, category: 'physique', superAI: { brainType: 'predictive', future: ['LSTM HRV', 'LLM Narrative', 'RL Weights', 'Illness Detection'] } },
  { id: 'acwr-balance-genius', number: 128, category: 'physique', superAI: { brainType: 'predictive', future: ['Injury Risk', 'Auto RPE', 'What-If'] } },
  { id: 'adaptive-planner', number: 129, category: 'physique', superAI: { brainType: 'generative', future: ['LLM Program Generator'] } },
  { id: 'plateau-detective', number: 130, category: 'physique', superAI: { brainType: 'diagnostic', future: ['Multi-Metric', 'Causal AI'] } },
  { id: 'transformation-forecast', number: 131, category: 'physique', superAI: { brainType: 'predictive', future: ['Body Comp P-Ratio', 'Kalman Filter', 'Monte Carlo 1000'] } },
  { id: 'pose-coach', number: 132, category: 'physique', superAI: { brainType: 'diagnostic', future: ['MediaPipe Live', 'Tempo Analysis'] } },
  { id: 'velocity-loss', number: 133, category: 'physique', superAI: { brainType: 'diagnostic', future: ['VBT', 'Bar Path', 'Auto-Stop'] } },
  { id: 'mobility-symmetry', number: 134, category: 'physique', superAI: { brainType: 'diagnostic', future: ['Corrective Program', '3D Body Map'] } },
  { id: 'substitution-advisor', number: 135, category: 'physique', superAI: { brainType: 'generative', future: ['LLM Substitution', 'Equipment Scanner'] } },
  { id: 'physique-proportion', number: 136, category: 'physique', superAI: { brainType: 'comparative', future: ['Aesthetic vs Performance'] } },
  // Batch F 137-150 Health
  { id: 'testosterone-ratio', number: 137, category: 'health', superAI: { brainType: 'diagnostic', safety: 'no-diagnosis', crossToolLinks: [] } },
  { id: 'pct-planner', number: 150, category: 'health', superAI: { brainType: 'diagnostic', safety: 'no-diagnosis' } },
  // Total 150
];
export const TOTAL_TOOLS = 150;
export const EXISTING_TOOLS = 125; // 1-125 done but need upgrade
export const NEW_TOOLS = 25; // 126-150 new with genius level
