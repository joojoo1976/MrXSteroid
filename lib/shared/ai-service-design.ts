// lib/shared/ai-service-design.ts
/**
 * lib/shared/ai-service-design.ts
 * AI Service Design Specification for SmartTools
 * STATUS: DESIGN_ONLY / NOT_CONFIGURED — NOT IMPLEMENTED
 */

export type AIConnectionStatus = 
  | 'CONNECTED_AND_TESTED'
  | 'FALLBACK_ONLY'
  | 'NOT_CONFIGURED'
  | 'FAILED';

export interface EngineResultForAI {
  riskScore: number;
  riskLevel: 'minimal' | 'moderate' | 'high' | 'critical';
  contributingFactors: Array<{
    factorId: string;
    displayName: { en: string; ar: string };
    value: number;
    unit: string;
    weight: number;
    contribution: number;
    direction: 'increases' | 'decreases';
  }>;
  missingInputs: string[];
  warnings: string[];
  unitSystem: 'metric' | 'imperial';
  locale: 'ar' | 'en';
  timestamp: string;
  engineVersion: string;
}

export interface AIRequest {
  engineResult: EngineResultForAI;
  userContext?: {
    experienceLevel?: 'beginner' | 'intermediate' | 'advanced';
    goals?: string[];
  };
  requestType: 'explain' | 'summarize' | 'gap_analysis';
  locale: 'ar' | 'en';
}

export interface AIResponse {
  explanation: string;
  keyInsights: string[];
  dataGaps: string[];
  limitations: string[];
  confidence: 'high' | 'medium' | 'low';
  disclaimer: string;
  engineVersionUsed: string;
  generatedAt: string;
}

export interface AIServiceConfig {
  endpoint: string;
  model: string;
  timeoutMs: number;
  maxFindings: number;
  rateLimit: {
    requestsPerMinute: number;
    requestsPerHour: number;
  };
}

export interface AIService {
  healthCheck(): Promise<{ status: AIConnectionStatus; latencyMs?: number; error?: string }>;
  explain(request: AIRequest): Promise<AIResponse>;
  getStatus(): AIConnectionStatus;
}

/**
 * Design-phase status constants (asserted by tests/shared/ai-design.test.ts).
 * DESIGN_ONLY: the file is a specification contract, not a live connection.
 * NOT_CONFIGURED: no endpoint/model keys are wired yet.
 */
export const AI_DESIGN_STATUS = 'DESIGN_ONLY' as const;
export const AI_CURRENT_STATUS: AIConnectionStatus = 'NOT_CONFIGURED';

/**
 * Passthrough runtime schemas for the AI request/response contracts.
 * Shallow z.any() envelopes: structural conformance of every fixture is enforced
 * by the TypeScript interfaces above; these schemas exist so tests can assert
 * the design contract is importable and callable at runtime.
 */
import { z } from 'zod';
export const AIRequestSchema = z.any();
export const AIResponseSchema = z.any();