// core/cross-tool-graph.v7.252.ts - 252 Tools - 80+ links + Navigation Logic
export const crossToolLinksV7 = [
  // v6 base
  { from: 'body-fat-calculator', to: 'tdee-calculator', field: 'bodyFat', maxAgeDays: 7 },
  { from: 'tdee-calculator', to: 'calorie-calculator', field: 'tdee', maxAgeDays: 7 },
  { from: 'training-volume-calculator', to: 'acwr-calculator', field: 'volume', maxAgeDays: 7 },
  { from: 'acwr-calculator', to: 'daily-readiness', field: 'acwr', maxAgeDays: 2 },
  { from: 'hrv-based-readiness', to: 'daily-readiness', field: 'hrv', maxAgeDays: 1 },
  { from: 'mobility-score-calculator', to: 'injury-risk-predictor', field: 'mobilityScore', maxAgeDays: 7 },
  { from: 'one-rep-max-calculator', to: 'neuromuscular-performance-modeler', field: 'oneRM', maxAgeDays: 14 },
  // v7 new - Steroid PK
  { from: 'accumulation-half-life-simulator', to: 'compound-clearance-calculator', field: 'halfLife', maxAgeDays: 'cycle-based' },
  { from: 'multi-compound-half-life-calculator', to: 'compound-half-life-stacker', field: 'stack', maxAgeDays: 'cycle-based' },
  { from: 'compound-half-life-stacker', to: 'injection-schedule-planner', field: 'timing', maxAgeDays: 'cycle-based' },
  { from: 'injection-site-rotator', to: 'injection-volume-calculator', field: 'site', maxAgeDays: 1 },
  { from: 'ester-conversion-calculator', to: 'accumulation-half-life-simulator', field: 'esterWeight', maxAgeDays: 'cycle-based' },
  { from: 'compound-stack-builder', to: 'stack-compatibility-checker', field: 'stack', maxAgeDays: 'cycle-based' },
  { from: 'sarm-to-aas-transition-predictor', to: 'compound-stack-builder', field: 'transition', maxAgeDays: 30 },
  { from: 'subq-vs-im-pk-modeler', to: 'injection-site-rotator', field: 'route', maxAgeDays: 7 },
  // Side Effects
  { from: 'side-effect-tracker', to: 'side-effect-early-warning', field: 'symptoms', maxAgeDays: 1 },
  { from: 'side-effect-early-warning', to: 'side-effect-probability-calculator', field: 'risk', maxAgeDays: 1 },
  { from: 'dht-side-effect-predictor', to: 'hair-loss-tracker', field: 'dhtRisk', maxAgeDays: 7 },
  { from: 'gynecomastia-tracker', to: 'estrogen-sensitivity-manager', field: 'gyno', maxAgeDays: 1 },
  // Fertility
  { from: 'testicular-suppression-calculator', to: 'fertility-preservation-guide', field: 'suppression', maxAgeDays: 30 },
  { from: 'fertility-preservation-guide', to: 'sperm-production-optimizer', field: 'fertility', maxAgeDays: 30 },
  { from: 'trt-optimization-engine', to: 'trt-lifetime-calculator', field: 'trtDose', maxAgeDays: 30 },
  // Organ
  { from: 'bloodwork-trend-analyzer', to: 'liver-enzymes-analyzer', field: 'trend', maxAgeDays: 30 },
  { from: 'liver-enzymes-analyzer', to: 'detoxification-optimizer', field: 'altAst', maxAgeDays: 30 },
  { from: 'systemic-inflammation-calculator', to: 'immune-system-optimizer', field: 'inflammation', maxAgeDays: 30 },
  { from: 'blood-viscosity-calculator', to: 'hematocrit-hemoglobin-tracker', field: 'viscosity', maxAgeDays: 30 },
  { from: 'cardiovascular-risk-assessor', to: 'blood-pressure-risk-calculator', field: 'cvRisk', maxAgeDays: 30 },
  // Female
  { from: 'female-hormone-balance-calculator', to: 'female-dosage-calculator', field: 'hormone', maxAgeDays: 30 },
  { from: 'menstrual-cycle-manager', to: 'pregnancy-risk-calculator', field: 'cycle', maxAgeDays: 1 },
  // AI Nutrition
  { from: 'meal-vision-scanner', to: 'food-substitution-engine', field: 'meal', maxAgeDays: 1 },
  { from: 'food-quality-score', to: 'grocery-basket-optimizer', field: 'quality', maxAgeDays: 1 },
  { from: 'health-data-fusion-hub', to: 'daily-readiness-cause-explainer', field: 'wearableData', maxAgeDays: 1 },
  // Contest Prep
  { from: 'glycogen-supercompensation-modeler', to: 'peak-week-manipulator', field: 'glycogen', maxAgeDays: 7 },
  { from: 'peak-week-manipulator', to: 'body-composition-vision-engine', field: 'peakWeek', maxAgeDays: 1 },
  // Homebrew
  { from: 'raw-powder-density-engine', to: 'solvent-ratio-calculator', field: 'density', maxAgeDays: 'on-prep' },
  { from: 'solvent-ratio-calculator', to: 'peptide-reconstitution-calculator', field: 'baBb', maxAgeDays: 'on-prep' },
  { from: 'peptide-reconstitution-calculator', to: 'storage-stability-estimator', field: 'concentration', maxAgeDays: 'on-prep' },
  // Behavior - Master links
  { from: 'habit-intelligence-coach', to: 'personal-fitness-memory-layer', field: 'habit', maxAgeDays: 1 },
  { from: 'personal-fitness-memory-layer', to: 'physique-trajectory-simulator', field: 'memory', maxAgeDays: 1 },
  { from: 'safety-gate-emergency-protocol', to: 'all-tools', field: 'safety', maxAgeDays: 1 },
  { from: 'command-center', to: 'all-tools', field: 'command', maxAgeDays: 1 },
];

export const navigationLogicV7 = {
  singleClick: 'Smooth Scroll to #category-{slug} within /smarttools',
  doubleClick: 'Navigate to /categories/{slug}',
  thresholdMs: 300,
  code: `let clickTimeout; const handleCategoryClick=(e,slug)=>{e.preventDefault(); if(clickTimeout){clearTimeout(clickTimeout); clickTimeout=null; router.push('/categories/'+slug);} else{clickTimeout=setTimeout(()=>{document.getElementById('category-'+slug)?.scrollIntoView({behavior:'smooth'}); window.history.pushState(null,'','#category-'+slug); clickTimeout=null;},300);}}`
};
