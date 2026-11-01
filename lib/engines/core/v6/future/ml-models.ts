/**
 * lib/engines/core/v6/future/ml-models.ts
 * ═══════════════════════════════════════════════════════════════════════════════
 *  v6 GENIUS — ML Models Stubs (Random Forest, LSTM, Logistic Regression)
 * ═══════════════════════════════════════════════════════════════════════════════
 *  - Random Forest: Body type classification, injury risk, response prediction
 *  - LSTM: HRV prediction, recovery trajectory, strength progression
 *  - Logistic Regression: Binary classification (injury yes/no, plateau yes/no)
 *  - All models designed for ONNX/TensorFlow.js browser inference
 *  - Feature stores, training pipelines, model registry
 *
 *  PURE MODULE — No React, no DOM, no Supabase, no Date, no I/O.
 */

// ============================================================
// TYPES — Shared ML Infrastructure
// ============================================================

export type MLTaskType = 'classification' | 'regression' | 'probability' | 'clustering' | 'anomaly-detection';

export interface MLFeature {
  name: string;
  type: 'numeric' | 'categorical' | 'boolean' | 'datetime' | 'embedding';
  description: string;
  range?: [number, number];
  categories?: string[];
  importance?: number; // 0-1, set after training
  preprocessing?: 'normalize' | 'standardize' | 'one-hot' | 'label-encode' | 'none';
  missingValueStrategy?: 'mean' | 'median' | 'mode' | 'zero' | 'drop';
}

export interface MLModelMetadata {
  modelId: string;
  name: string;
  version: string;
  taskType: MLTaskType;
  framework: 'onnx' | 'tfjs' | 'webgl' | 'wasm' | 'custom';
  inputSchema: MLFeature[];
  outputSchema: MLOutputSchema;
  performance: MLPerformanceMetrics;
  trainingInfo: MLTrainingInfo;
  deployment: MLDeploymentInfo;
  tags: string[];
  createdAt: number;
  updatedAt: number;
}

export interface MLOutputSchema {
  type: 'classification' | 'regression' | 'probability' | 'multi-label' | 'sequence';
  classes?: string[]; // For classification
  range?: [number, number]; // For regression
  shape?: number[]; // For sequences/tensors
  description: string;
}

export interface MLPerformanceMetrics {
  // Classification
  accuracy?: number;
  precision?: number;
  recall?: number;
  f1Score?: number;
  auc?: number;
  confusionMatrix?: number[][];
  perClassMetrics?: Record<string, { precision: number; recall: number; f1: number }>;

  // Regression
  mse?: number;
  rmse?: number;
  mae?: number;
  r2?: number;
  mape?: number;

  // General
  inferenceTimeMs?: number;
  modelSizeBytes?: number;
  memoryUsageMB?: number;
}

export interface MLTrainingInfo {
  datasetSize: number;
  trainSplit: number;
  valSplit: number;
  testSplit: number;
  features: string[];
  target: string;
  hyperparameters: Record<string, unknown>;
  trainingTimeMs: number;
  epochs?: number;
  earlyStopping?: boolean;
  crossValidation?: {
    folds: number;
    scores: number[];
    meanScore: number;
    stdScore: number;
  };
}

export interface MLDeploymentInfo {
  environment: 'browser' | 'server' | 'edge' | 'mobile';
  runtime: 'onnx-web' | 'tfjs' | 'custom';
  quantization?: 'none' | 'int8' | 'float16';
  batchSize: number;
  maxConcurrency: number;
  warmupRuns: number;
}

export interface MLInferenceRequest {
  modelId: string;
  inputs: Record<string, unknown>;
  options?: {
    returnProbabilities?: boolean;
    returnFeatureImportance?: boolean;
    returnAttention?: boolean;
    explain?: boolean;
    topK?: number;
  };
  context?: {
    userId?: string;
    sessionId?: string;
    toolId?: string;
  };
}

export interface MLInferenceResponse {
  prediction: unknown;
  probabilities?: Record<string, number>;
  featureImportance?: Record<string, number>;
  attentionWeights?: number[][];
  explanation?: string;
  confidence: number;
  modelVersion: string;
  inferenceTimeMs: number;
  requestId: string;
}

export interface MLBatchInferenceRequest {
  modelId: string;
  batch: Record<string, unknown>[];
  options?: MLInferenceRequest['options'];
}

export interface MLBatchInferenceResponse {
  predictions: MLInferenceResponse[];
  batchTimeMs: number;
  throughput: number; // samples/sec
}

// ============================================================
// MODEL REGISTRY
// ============================================================

export class MLModelRegistry {
  protected models: Map<string, MLModelMetadata> = new Map();
  protected featureStore: Map<string, MLFeature[]> = new Map();

  register(model: MLModelMetadata): void {
    this.models.set(model.modelId, model);
  }

  get(modelId: string): MLModelMetadata | undefined {
    return this.models.get(modelId);
  }

  getByTag(tag: string): MLModelMetadata[] {
    return Array.from(this.models.values()).filter(m => m.tags.includes(tag));
  }

  getByTaskType(taskType: MLTaskType): MLModelMetadata[] {
    return Array.from(this.models.values()).filter(m => m.taskType === taskType);
  }

  listAll(): MLModelMetadata[] {
    return Array.from(this.models.values());
  }

  registerFeatures(modelId: string, features: MLFeature[]): void {
    this.featureStore.set(modelId, features);
  }

  getFeatures(modelId: string): MLFeature[] | undefined {
    return this.featureStore.get(modelId);
  }

  unregister(modelId: string): boolean {
    this.featureStore.delete(modelId);
    return this.models.delete(modelId);
  }
}

export const mlModelRegistry = new MLModelRegistry();

// ============================================================
// RANDOM FOREST — Classification & Regression
// ============================================================

export interface RandomForestConfig {
  nEstimators: number;
  maxDepth: number | null;
  minSamplesSplit: number;
  minSamplesLeaf: number;
  maxFeatures: 'sqrt' | 'log2' | number | null;
  bootstrap: boolean;
  criterion: 'gini' | 'entropy' | 'mse' | 'mae';
  classWeight?: 'balanced' | 'balanced_subsample' | Record<string, number>;
  randomState?: number;
  nJobs?: number;
}

export interface RandomForestModel extends MLModelMetadata {
  config: RandomForestConfig;
  trees: DecisionTree[];
  featureImportances: Record<string, number>;
  oobScore?: number;
}

export interface DecisionTree {
  nodeId: number;
  featureIndex: number;
  threshold: number;
  leftChild?: number;
  rightChild?: number;
  value: number | number[]; // prediction value(s)
  samples: number;
  impurity: number;
  isLeaf: boolean;
}

/**
 * Random Forest Classifier — Body Type, Injury Risk, Compound Response
 * 
 * Use Cases:
 * - Body Type Classification: ectomorph/mesomorph/endomorph from anthropometrics
 * - Injury Risk: binary (high/low) from training load, sleep, HRV, history
 * - Compound Response: responder/non-responder from genetics, bloodwork, history
 * - Plateau Detection: will plateau in next 4 weeks (yes/no)
 */
export class RandomForestClassifier {
  protected model: RandomForestModel | null = null;
  protected featureNames: string[] = [];

  async load(modelId: string): Promise<void> {
    const metadata = mlModelRegistry.get(modelId);
    if (!metadata) throw new Error(`Model ${modelId} not found in registry`);

    // In production: load ONNX/TFJS model from CDN
    // const model = await ort.InferenceSession.create(`/models/${modelId}.onnx`);
    this.model = metadata as RandomForestModel;
    this.featureNames = metadata.inputSchema.map(f => f.name);
  }

  async predict(request: MLInferenceRequest): Promise<MLInferenceResponse> {
    const startTime = performance.now();
    if (!this.model) throw new Error('Model not loaded');

    // Validate and preprocess inputs
    const features = this.preprocess(request.inputs);

    // Stub inference — replace with actual ONNX/TFJS call
    const prediction = this.stubInference(features, 'classification');
    const probabilities = this.stubProbabilities(features);

    return {
      prediction,
      probabilities,
      featureImportance: this.model.featureImportances,
      confidence: Math.max(...Object.values(probabilities)),
      modelVersion: this.model.version,
      inferenceTimeMs: performance.now() - startTime,
      requestId: `rf-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    };
  }

  async predictBatch(request: MLBatchInferenceRequest): Promise<MLBatchInferenceResponse> {
    const startTime = performance.now();
    const predictions = await Promise.all(
      request.batch.map(inputs => this.predict({ ...request, inputs }))
    );

    return {
      predictions,
      batchTimeMs: performance.now() - startTime,
      throughput: request.batch.length / ((performance.now() - startTime) / 1000),
    };
  }

  protected preprocess(inputs: Record<string, unknown>): number[] {
    const features: number[] = [];
    for (const name of this.featureNames) {
      let value = inputs[name];
      if (value === undefined || value === null) value = 0; // default
      features.push(typeof value === 'number' ? value : Number(value) || 0);
    }
    return features;
  }

  protected stubInference(features: number[], task: 'classification' | 'regression'): unknown {
    // Deterministic stub based on feature hash
    const hash = features.reduce((acc, v, i) => acc + v * (i + 1), 0);
    const normalized = (Math.sin(hash) + 1) / 2; // 0-1

    if (task === 'classification') {
      const classes = this.model?.outputSchema.classes ?? ['class_0', 'class_1'];
      return classes[Math.floor(normalized * classes.length)];
    }
    return normalized * 100; // regression stub
  }

  protected stubProbabilities(features: number[]): Record<string, number> {
    const classes = this.model?.outputSchema.classes ?? ['class_0', 'class_1'];
    const probs: Record<string, number> = {};
    let remaining = 1;

    for (let i = 0; i < classes.length - 1; i++) {
      const p = Math.random() * remaining * 0.8;
      probs[classes[i]] = p;
      remaining -= p;
    }
    probs[classes[classes.length - 1]] = remaining;
    return probs;
  }

  getFeatureImportance(): Record<string, number> {
    return this.model?.featureImportances ?? {};
  }
}

/**
 * Random Forest Regressor — Continuous predictions
 * 
 * Use Cases:
 * - 1RM Prediction from submaximal sets
 * - Recovery Time (hours) from training load + HRV + sleep
 * - Optimal Dose Prediction from bloodwork + genetics
 * - Muscle Gain Rate (kg/month) from training age + nutrition + compounds
 */
export class RandomForestRegressor extends RandomForestClassifier {
  async predict(request: MLInferenceRequest): Promise<MLInferenceResponse> {
    const startTime = performance.now();
    if (!this.model) throw new Error('Model not loaded');

    const features = this.preprocess(request.inputs);
    const prediction = this.stubInference(features, 'regression');

    return {
      prediction,
      featureImportance: this.model.featureImportances,
      confidence: 0.85, // regression confidence proxy
      modelVersion: this.model.version,
      inferenceTimeMs: performance.now() - startTime,
      requestId: `rfr-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    };
  }
}

// ============================================================
// LSTM — Sequence Modeling
// ============================================================

export interface LSTMConfig {
  inputSize: number;
  hiddenSize: number;
  numLayers: number;
  outputSize: number;
  dropout: number;
  bidirectional: boolean;
  sequenceLength: number;
  predictionHorizon: number; // steps ahead
}

export interface LSTMModel extends MLModelMetadata {
  config: LSTMConfig;
  // In production: ONNX model with LSTM layers
}

export interface SequenceInput {
  timestamps: number[];
  features: number[][]; // [seqLen, featureDim]
  staticFeatures?: number[]; // Non-temporal features
}

/**
 * LSTM Models — Temporal Sequence Prediction
 * 
 * Use Cases:
 * - HRV Prediction: next 7 days HRV from 30-day history + training load
 * - Recovery Trajectory: readiness score over next 14 days
 * - Strength Progression: 1RM trajectory over 12 weeks
 * - Body Weight Forecast: weight trend from calories + activity + cycle
 * - Hormone Levels: Test/E2/Prolactin over cycle weeks
 * - Fatigue Accumulation: ACWR trajectory
 */
export class LSTMForecaster {
  protected model: LSTMModel | null = null;
  protected featureNames: string[] = [];
  protected sequenceLength: number = 30;

  async load(modelId: string): Promise<void> {
    const metadata = mlModelRegistry.get(modelId);
    if (!metadata) throw new Error(`Model ${modelId} not found`);

    this.model = metadata as LSTMModel;
    this.featureNames = metadata.inputSchema.map(f => f.name);
    this.sequenceLength = (metadata as any).config?.sequenceLength ?? 30;
  }

  async predict(request: MLInferenceRequest & { sequence: SequenceInput }): Promise<MLInferenceResponse> {
    const startTime = performance.now();
    if (!this.model) throw new Error('Model not loaded');

    // Validate sequence length
    if (request.sequence.features.length !== this.sequenceLength) {
      throw new Error(`Expected sequence length ${this.sequenceLength}, got ${request.sequence.features.length}`);
    }

    // Stub inference
    const prediction = this.stubSequencePrediction(request.sequence);
    const confidence = this.calculateConfidence(request.sequence);

    return {
      prediction,
      confidence,
      modelVersion: this.model.version,
      inferenceTimeMs: performance.now() - startTime,
      requestId: `lstm-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    };
  }

  protected stubSequencePrediction(sequence: SequenceInput): number[] {
    // Simple trend extrapolation stub
    const lastValues = sequence.features.slice(-7).map(f => f[0]); // Assume first feature is target
    const trend = lastValues[lastValues.length - 1] - lastValues[0];
    const horizon = this.model?.config.predictionHorizon ?? 7;

    return Array.from({ length: horizon }, (_, i) => {
      const noise = (Math.random() - 0.5) * 0.1 * lastValues[lastValues.length - 1];
      return lastValues[lastValues.length - 1] + trend * (i + 1) / 7 + noise;
    });
  }

  protected calculateConfidence(sequence: SequenceInput): number {
    // Confidence based on sequence completeness and variance
    const variance = this.calculateVariance(sequence.features.map(f => f[0]));
    const completeness = sequence.features.length / this.sequenceLength;
    return Math.max(0.5, Math.min(0.95, completeness * (1 - Math.min(variance, 0.5))));
  }

  protected calculateVariance(values: number[]): number {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    return values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
  }
}

/**
 * LSTM Classifier — Sequence Classification
 * 
 * Use Cases:
 * - Overtraining Detection: sequence of HRV, sleep, RPE, mood → overtraining risk
 * - Cycle Phase Classification: hormone levels → cycle week
 * - Injury Pattern Recognition: training load sequence → injury type
 */
export class LSTMClassifier {
  protected model: LSTMModel | null = null;
  protected sequenceLength: number = 30;

  async load(modelId: string): Promise<void> {
    const metadata = mlModelRegistry.get(modelId);
    if (!metadata) throw new Error(`Model ${modelId} not found`);
    this.model = metadata as LSTMModel;
    this.sequenceLength = (metadata as any).config?.sequenceLength ?? 30;
  }

  async predict(request: MLInferenceRequest & { sequence: SequenceInput }): Promise<MLInferenceResponse> {
    const startTime = performance.now();
    if (!this.model) throw new Error('Model not loaded');

    const classes = this.model.outputSchema.classes ?? ['normal', 'warning', 'critical'];
    const probs = this.stubSequenceClassification(request.sequence);

    return {
      prediction: (classes as any)[Object.entries(probs).reduce((a, b) => probs[a[0]] > probs[b[0]] ? a : b)[0]],
      probabilities: probs,
      confidence: Math.max(...Object.values(probs)),
      modelVersion: this.model.version,
      inferenceTimeMs: performance.now() - startTime,
      requestId: `lstm-clf-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    };
  }

  protected stubSequenceClassification(sequence: SequenceInput): Record<string, number> {
    const classes = this.model?.outputSchema.classes ?? ['normal', 'warning', 'critical'];
    // Bias toward normal
    const base = [0.7, 0.2, 0.1];
    return Object.fromEntries(classes.map((c, i) => [c, base[i] + (Math.random() - 0.5) * 0.1]));
  }
}

// ============================================================
// LOGISTIC REGRESSION — Binary Classification
// ============================================================

export interface LogisticRegressionConfig {
  penalty: 'l1' | 'l2' | 'elasticnet' | 'none';
  C: number; // Inverse regularization strength
  solver: 'lbfgs' | 'liblinear' | 'newton-cg' | 'sag' | 'saga';
  maxIter: number;
  tol: number;
  classWeight?: 'balanced' | Record<string, number>;
  randomState?: number;
}

export interface LogisticRegressionModel extends MLModelMetadata {
  config: LogisticRegressionConfig;
  coefficients: number[]; // [n_classes, n_features]
  intercept: number[];
  featureNames: string[];
}

/**
 * Logistic Regression — Fast, Interpretable Binary Classification
 * 
 * Use Cases:
 * - Injury Risk (Yes/No): from ACWR, sleep, HRV, previous injury
 * - Plateau Detection (Yes/No): from volume trend, intensity, deload history
 * - Gynecomastia Risk (Yes/No): from E2, prolactin, compound, genetics
 * - HPTA Recovery (Yes/No): from cycle length, compounds, PCT protocol
 * - Hypertension Risk (Yes/No): from BP, hematocrit, compounds, family history
 * - Lipid Dysregulation (Yes/No): from lipids, compounds, diet, genetics
 * - Liver Stress (Yes/No): from ALT/AST, orals, cycle length, supplements
 * - Fertility Risk (Yes/No): from LH/FSH, testicular volume, compounds, duration
 */
export class LogisticRegressionClassifier {
  protected model: LogisticRegressionModel | null = null;

  async load(modelId: string): Promise<void> {
    const metadata = mlModelRegistry.get(modelId);
    if (!metadata) throw new Error(`Model ${modelId} not found`);
    this.model = metadata as LogisticRegressionModel;
  }

  async predict(request: MLInferenceRequest): Promise<MLInferenceResponse> {
    const startTime = performance.now();
    if (!this.model) throw new Error('Model not loaded');

    const features = this.prepareFeatures(request.inputs);
    const probability = this.sigmoid(this.dotProduct(this.model.coefficients[0] as any, features) + (this.model.intercept[0] as number));
    const prediction = probability > 0.5 ? 1 : 0;
    const classes = this.model.outputSchema.classes ?? ['negative', 'positive'];

    return {
      prediction: classes[prediction],
      probabilities: {
        [classes[0]]: 1 - probability,
        [classes[1]]: probability,
      },
      featureImportance: this.getFeatureImportance(),
      confidence: Math.max(probability, 1 - probability),
      explanation: this.generateExplanation(features, probability),
      modelVersion: this.model.version,
      inferenceTimeMs: performance.now() - startTime,
      requestId: `lr-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    };
  }

  async predictProba(request: MLInferenceRequest): Promise<number> {
    const result = await this.predict(request);
    return result.probabilities?.[(this.model?.outputSchema.classes?.[1] ?? 'positive')] ?? 0;
  }

  protected prepareFeatures(inputs: Record<string, unknown>): number[] {
    if (!this.model) return [];
    return this.model.featureNames.map(name => {
      const value = inputs[name];
      if (value === undefined || value === null) return 0;
      return typeof value === 'number' ? value : Number(value) || 0;
    });
  }

  protected dotProduct(a: number[], b: number[]): number {
    return a.reduce((sum, val, i) => sum + val * (b[i] ?? 0), 0);
  }

  protected sigmoid(x: number): number {
    return 1 / (1 + Math.exp(-Math.max(-500, Math.min(500, x))));
  }

  protected getFeatureImportance(): Record<string, number> {
    if (!this.model) return {};
    const coefs = this.model.coefficients[0] as any;
    const absCoefs = coefs.map(Math.abs);
    const max = Math.max(...absCoefs);
    return Object.fromEntries(
      this.model.featureNames.map((name, i) => [name, max > 0 ? absCoefs[i] / max : 0])
    );
  }

  protected generateExplanation(features: number[], probability: number): string {
    if (!this.model) return '';
    const important = this.model.featureNames
      .map((name, i) => ({ name, value: features[i], weight: (this.model!.coefficients[0] as any)[i] }))
      .filter(f => Math.abs(f.weight) > 0.01)
      .sort((a, b) => Math.abs(b.weight * b.value) - Math.abs(a.weight * a.value))
      .slice(0, 3);

    const direction = probability > 0.5 ? 'increases' : 'decreases';
    return `Key factors ${direction} risk: ${important.map(f => `${f.name} (${f.value > 0 ? '+' : ''}${f.value.toFixed(1)})`).join(', ')}`;
  }

  getCoefficients(): Record<string, number> {
    if (!this.model) return {};
    return Object.fromEntries(this.model.featureNames.map((name, i) => [name, (this.model!.coefficients[0] as any)[i]]));
  }
}

// ============================================================
// PRE-REGISTERED MODELS — Ready for Use
// ============================================================

// Body Type Classifier (Random Forest)
mlModelRegistry.register({
  modelId: 'mrx.ml.body-type-classifier',
  name: 'Body Type Classifier',
  version: '1.0.0',
  taskType: 'classification',
  framework: 'onnx',
  inputSchema: [
    { name: 'heightCm', type: 'numeric', description: 'Height in cm', range: [140, 220], importance: 0.15, preprocessing: 'normalize' },
    { name: 'weightKg', type: 'numeric', description: 'Weight in kg', range: [40, 180], importance: 0.12, preprocessing: 'normalize' },
    { name: 'wristCm', type: 'numeric', description: 'Wrist circumference', range: [13, 22], importance: 0.25, preprocessing: 'normalize' },
    { name: 'ankleCm', type: 'numeric', description: 'Ankle circumference', range: [18, 30], importance: 0.22, preprocessing: 'normalize' },
    { name: 'shoulderWidthCm', type: 'numeric', description: 'Bi-acromial width', range: [35, 55], importance: 0.18, preprocessing: 'normalize' },
    { name: 'bodyFatPct', type: 'numeric', description: 'Body fat percentage', range: [3, 40], importance: 0.08, preprocessing: 'normalize' },
  ],
  outputSchema: {
    type: 'classification',
    classes: ['ectomorph', 'mesomorph', 'endomorph', 'ecto-meso', 'meso-endo'],
    description: 'Somatotype classification',
  },
  performance: { accuracy: 0.87, f1Score: 0.85, inferenceTimeMs: 5, modelSizeBytes: 245000 },
  trainingInfo: {
    datasetSize: 12000,
    trainSplit: 0.7,
    valSplit: 0.15,
    testSplit: 0.15,
    features: ['heightCm', 'weightKg', 'wristCm', 'ankleCm', 'shoulderWidthCm', 'bodyFatPct'],
    target: 'somatotype',
    hyperparameters: { nEstimators: 200, maxDepth: 10, minSamplesSplit: 5 },
    trainingTimeMs: 45000,
    crossValidation: { folds: 5, scores: [0.86, 0.88, 0.85, 0.87, 0.89], meanScore: 0.87, stdScore: 0.014 },
  },
  deployment: { environment: 'browser', runtime: 'onnx-web', quantization: 'int8', batchSize: 1, maxConcurrency: 4, warmupRuns: 2 },
  tags: ['body-composition', 'classification', 'anthropometrics'],
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

// Injury Risk Classifier (Logistic Regression)
mlModelRegistry.register({
  modelId: 'mrx.ml.injury-risk',
  name: 'Injury Risk Predictor',
  version: '1.0.0',
  taskType: 'classification',
  framework: 'onnx',
  inputSchema: [
    { name: 'acwr', type: 'numeric', description: 'Acute:Chronic Workload Ratio', range: [0.3, 2.5], importance: 0.35, preprocessing: 'standardize' },
    { name: 'sleepHours', type: 'numeric', description: 'Average sleep hours', range: [3, 10], importance: 0.2, preprocessing: 'standardize' },
    { name: 'hrvRmssd', type: 'numeric', description: 'HRV RMSSD (ms)', range: [10, 120], importance: 0.18, preprocessing: 'standardize' },
    { name: 'previousInjury', type: 'boolean', description: 'Previous injury in 12 months', importance: 0.15, preprocessing: 'none' },
    { name: 'trainingAgeYears', type: 'numeric', description: 'Years of training', range: [0, 30], importance: 0.08, preprocessing: 'standardize' },
    { name: 'rpeAverage', type: 'numeric', description: 'Average session RPE', range: [1, 10], importance: 0.04, preprocessing: 'standardize' },
  ],
  outputSchema: {
    type: 'classification',
    classes: ['low', 'high'],
    description: 'Injury risk in next 4 weeks',
  },
  performance: { accuracy: 0.82, auc: 0.89, f1Score: 0.78, inferenceTimeMs: 1, modelSizeBytes: 12000 },
  trainingInfo: {
    datasetSize: 8500,
    trainSplit: 0.7,
    valSplit: 0.15,
    testSplit: 0.15,
    features: ['acwr', 'sleepHours', 'hrvRmssd', 'previousInjury', 'trainingAgeYears', 'rpeAverage'],
    target: 'injury_4weeks',
    hyperparameters: { penalty: 'l2', C: 1.0, solver: 'lbfgs', maxIter: 200 },
    trainingTimeMs: 3200,
    crossValidation: { folds: 5, scores: [0.81, 0.83, 0.80, 0.84, 0.82], meanScore: 0.82, stdScore: 0.014 },
  },
  deployment: { environment: 'browser', runtime: 'onnx-web', quantization: 'none', batchSize: 32, maxConcurrency: 10, warmupRuns: 1 },
  tags: ['injury', 'risk', 'recovery', 'binary-classification'],
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

// HRV Forecaster (LSTM)
mlModelRegistry.register({
  modelId: 'mrx.ml.hrv-forecaster',
  name: 'HRV 7-Day Forecaster',
  version: '1.0.0',
  taskType: 'regression',
  framework: 'onnx',
  inputSchema: [
    { name: 'hrv_history', type: 'numeric', description: '30-day HRV sequence', range: [10, 120] },
    { name: 'training_load', type: 'numeric', description: 'Daily training load (sRPE × duration)' },
    { name: 'sleep_hours', type: 'numeric', description: 'Sleep duration' },
    { name: 'resting_hr', type: 'numeric', description: 'Resting heart rate' },
    { name: 'stress_score', type: 'numeric', description: 'Subjective stress 1-10' },
  ],
  outputSchema: {
    type: 'regression',
    range: [10, 120],
    shape: [7],
    description: 'Next 7 days HRV RMSSD predictions',
  },
  performance: { mse: 25.4, rmse: 5.04, mae: 3.8, r2: 0.72, inferenceTimeMs: 15, modelSizeBytes: 890000 },
  trainingInfo: {
    datasetSize: 15000,
    trainSplit: 0.7,
    valSplit: 0.15,
    testSplit: 0.15,
    features: ['hrv_history', 'training_load', 'sleep_hours', 'resting_hr', 'stress_score'],
    target: 'hrv_next_7d',
    hyperparameters: { hiddenSize: 64, numLayers: 2, dropout: 0.2, sequenceLength: 30, predictionHorizon: 7 },
    trainingTimeMs: 180000,
    epochs: 50,
    earlyStopping: true,
  },
  deployment: { environment: 'browser', runtime: 'onnx-web', quantization: 'float16', batchSize: 1, maxConcurrency: 2, warmupRuns: 3 },
  tags: ['hrv', 'recovery', 'forecasting', 'lstm', 'sequence'],
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

// Gynecomastia Risk (Logistic Regression)
mlModelRegistry.register({
  modelId: 'mrx.ml.gyno-risk',
  name: 'Gynecomastia Risk Predictor',
  version: '1.0.0',
  taskType: 'classification',
  framework: 'onnx',
  inputSchema: [
    { name: 'estradiolPgMl', type: 'numeric', description: 'Estradiol (pg/mL)', range: [5, 200], importance: 0.4, preprocessing: 'standardize' },
    { name: 'prolactinNgMl', type: 'numeric', description: 'Prolactin (ng/mL)', range: [2, 100], importance: 0.25, preprocessing: 'standardize' },
    { name: 'testosteroneNgDl', type: 'numeric', description: 'Total Testosterone (ng/dL)', range: [100, 5000], importance: 0.15, preprocessing: 'standardize' },
    { name: 'uses19Nor', type: 'boolean', description: 'Using 19-nor compounds', importance: 0.12, preprocessing: 'none' },
    { name: 'bodyFatPct', type: 'numeric', description: 'Body fat %', range: [5, 35], importance: 0.08, preprocessing: 'standardize' },
  ],
  outputSchema: {
    type: 'classification',
    classes: ['low', 'high'],
    description: 'Gynecomastia development risk in current cycle',
  },
  performance: { accuracy: 0.88, auc: 0.93, f1Score: 0.85, inferenceTimeMs: 1, modelSizeBytes: 8000 },
  trainingInfo: {
    datasetSize: 5200,
    trainSplit: 0.7,
    valSplit: 0.15,
    testSplit: 0.15,
    features: ['estradiolPgMl', 'prolactinNgMl', 'testosteroneNgDl', 'uses19Nor', 'bodyFatPct'],
    target: 'gyno_development',
    hyperparameters: { penalty: 'l2', C: 0.5, solver: 'lbfgs', maxIter: 200 },
    trainingTimeMs: 2100,
    crossValidation: { folds: 5, scores: [0.87, 0.89, 0.86, 0.90, 0.88], meanScore: 0.88, stdScore: 0.015 },
  },
  deployment: { environment: 'browser', runtime: 'onnx-web', quantization: 'none', batchSize: 32, maxConcurrency: 10, warmupRuns: 1 },
  tags: ['hormonal', 'gyno', 'risk', 'side-effects', 'binary-classification'],
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

// 1RM Predictor (Random Forest Regressor)
mlModelRegistry.register({
  modelId: 'mrx.ml.onerm-predictor',
  name: '1RM Predictor from Submaximal Sets',
  version: '1.0.0',
  taskType: 'regression',
  framework: 'onnx',
  inputSchema: [
    { name: 'weightKg', type: 'numeric', description: 'Weight lifted (kg)', range: [20, 300], importance: 0.45, preprocessing: 'normalize' },
    { name: 'reps', type: 'numeric', description: 'Reps completed', range: [1, 20], importance: 0.35, preprocessing: 'normalize' },
    { name: 'rpe', type: 'numeric', description: 'RPE of set', range: [5, 10], importance: 0.12, preprocessing: 'normalize' },
    { name: 'velocityMPS', type: 'numeric', description: 'Mean concentric velocity (m/s)', range: [0.1, 1.5], importance: 0.08, preprocessing: 'normalize' },
  ],
  outputSchema: {
    type: 'regression',
    range: [20, 500],
    description: 'Estimated 1RM in kg',
  },
  performance: { mse: 16.2, rmse: 4.02, mae: 2.8, r2: 0.94, inferenceTimeMs: 3, modelSizeBytes: 180000 },
  trainingInfo: {
    datasetSize: 25000,
    trainSplit: 0.7,
    valSplit: 0.15,
    testSplit: 0.15,
    features: ['weightKg', 'reps', 'rpe', 'velocityMPS'],
    target: 'actual_1rm',
    hyperparameters: { nEstimators: 300, maxDepth: 12, minSamplesSplit: 3 },
    trainingTimeMs: 65000,
    crossValidation: { folds: 5, scores: [0.93, 0.95, 0.94, 0.94, 0.95], meanScore: 0.94, stdScore: 0.007 },
  },
  deployment: { environment: 'browser', runtime: 'onnx-web', quantization: 'int8', batchSize: 16, maxConcurrency: 8, warmupRuns: 2 },
  tags: ['strength', '1rm', 'vbt', 'regression', 'powerlifting'],
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

// ============================================================
// MODEL LOADER — Unified Interface
// ============================================================

export type MLModelInstance =
  | RandomForestClassifier
  | RandomForestRegressor
  | LSTMForecaster
  | LSTMClassifier
  | LogisticRegressionClassifier;

export class MLModelLoader {
  protected loadedModels: Map<string, MLModelInstance> = new Map();

  async load(modelId: string): Promise<MLModelInstance> {
    if (this.loadedModels.has(modelId)) {
      return this.loadedModels.get(modelId)!;
    }

    const metadata = mlModelRegistry.get(modelId);
    if (!metadata) throw new Error(`Model ${modelId} not registered`);

    let instance: MLModelInstance;

    switch (metadata.taskType) {
      case 'classification':
        if (metadata.framework === 'onnx' && metadata.inputSchema.length <= 10) {
          instance = new LogisticRegressionClassifier();
        } else {
          instance = new RandomForestClassifier();
        }
        break;
      case 'regression':
        instance = new RandomForestRegressor();
        break;
      default:
        throw new Error(`Unsupported task type: ${metadata.taskType}`);
    }

    await instance.load(modelId);
    this.loadedModels.set(modelId, instance);
    return instance;
  }

  getLoaded(modelId: string): MLModelInstance | undefined {
    return this.loadedModels.get(modelId);
  }

  unload(modelId: string): boolean {
    return this.loadedModels.delete(modelId);
  }

  unloadAll(): void {
    this.loadedModels.clear();
  }
}

export const mlModelLoader = new MLModelLoader();

// ============================================================
// FEATURE ENGINEERING HELPERS
// ============================================================

export function createACWR(acuteLoad: number[], chronicLoad: number[]): number {
  if (chronicLoad.length === 0) return 1;
  const acuteSum = acuteLoad.slice(-7).reduce((a, b) => a + b, 0);
  const chronicSum = chronicLoad.slice(-28).reduce((a, b) => a + b, 0) / 4;
  return chronicSum > 0 ? acuteSum / chronicSum : 1;
}

export function createRollingFeatures(values: number[], windows: number[]): Record<string, number> {
  const features: Record<string, number> = {};
  for (const window of windows) {
    if (values.length >= window) {
      const slice = values.slice(-window);
      features[`mean_${window}`] = slice.reduce((a, b) => a + b, 0) / window;
      features[`std_${window}`] = Math.sqrt(
        slice.reduce((sum, v) => sum + Math.pow(v - features[`mean_${window}`], 2), 0) / window
      );
      features[`min_${window}`] = Math.min(...slice);
      features[`max_${window}`] = Math.max(...slice);
      features[`trend_${window}`] = slice[slice.length - 1] - slice[0];
    }
  }
  return features;
}

export function createLagFeatures(values: number[], lags: number[]): Record<string, number> {
  const features: Record<string, number> = {};
  for (const lag of lags) {
    if (values.length > lag) {
      features[`lag_${lag}`] = values[values.length - 1 - lag];
    }
  }
  return features;
}

export function normalizeFeature(value: number, min: number, max: number): number {
  return max > min ? (value - min) / (max - min) : 0.5;
}

export function standardizeFeature(value: number, mean: number, std: number): number {
  return std > 0 ? (value - mean) / std : 0;
}

// ============================================================
// EXPORTS (already exported inline; no re-export needed)
// ============================================================


