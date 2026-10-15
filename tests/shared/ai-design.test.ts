// tests/shared/ai-design.test.ts
/**
 * AI Service Design Tests - Part 1
 * Tests for lib/shared/ai-service-design.ts
 * STATUS: DESIGN_ONLY / NOT_CONFIGURED - No actual AI connection
 */

import { describe, it, expect } from 'vitest';
import type {
  AIConnectionStatus,
  EngineResultForAI,
  AIRequest,
  AIResponse,
  AIServiceConfig,
  AIService,
} from '@/lib/shared/ai-service-design';
import {
  AI_DESIGN_STATUS,
  AI_CURRENT_STATUS,
  AIRequestSchema,
  AIResponseSchema,
} from '@/lib/shared/ai-service-design';

describe('AI Service Design Tests - Part 1 (DESIGN_ONLY)', () => {
  describe('Status Constants', () => {
    it('AI_DESIGN_STATUS is DESIGN_ONLY', () => {
      expect(AI_DESIGN_STATUS).toBe('DESIGN_ONLY');
    });

    it('AI_CURRENT_STATUS is NOT_CONFIGURED', () => {
      expect(AI_CURRENT_STATUS).toBe('NOT_CONFIGURED');
    });

    it('AIConnectionStatus has correct values', () => {
      const statuses: AIConnectionStatus[] = [
        'CONNECTED_AND_TESTED',
        'FALLBACK_ONLY',
        'NOT_CONFIGURED',
        'FAILED',
      ];
      expect(statuses).toHaveLength(4);
    });
  });

  describe('EngineResultForAI Interface', () => {
    it('accepts valid engine result structure', () => {
      const result: EngineResultForAI = {
        riskScore: 0.75,
        riskLevel: 'high',
        contributingFactors: [{
          factorId: 'testosterone_dose',
          displayName: { en: 'Testosterone Dose', ar: 'جرعة التستوستيرون' },
          value: 500,
          unit: 'mg/week',
          weight: 0.8,
          contribution: 0.6,
          direction: 'increases',
        }],
        missingInputs: ['estrogen_level'],
        warnings: ['High dose detected'],
        unitSystem: 'metric',
        locale: 'ar',
        timestamp: '2024-01-01T00:00:00Z',
        engineVersion: '1.0.0',
      };

      expect(result.riskScore).toBe(0.75);
      expect(result.riskLevel).toBe('high');
      expect(result.contributingFactors).toHaveLength(1);
      expect(result.missingInputs).toContain('estrogen_level');
      expect(result.unitSystem).toBe('metric');
      expect(result.locale).toBe('ar');
    });

    it('supports all risk levels', () => {
      const levels = ['minimal', 'moderate', 'high', 'critical'] as const;
      for (const level of levels) {
        const result: EngineResultForAI = {
          riskScore: 0.5,
          riskLevel: level,
          contributingFactors: [],
          missingInputs: [],
          warnings: [],
          unitSystem: 'metric',
          locale: 'en',
          timestamp: '2024-01-01T00:00:00Z',
          engineVersion: '1.0.0',
        };
        expect(result.riskLevel).toBe(level);
      }
    });

    it('supports both unit systems', () => {
      const metric: EngineResultForAI = {
        riskScore: 0.5,
        riskLevel: 'moderate',
        contributingFactors: [],
        missingInputs: [],
        warnings: [],
        unitSystem: 'metric',
        locale: 'en',
        timestamp: '2024-01-01T00:00:00Z',
        engineVersion: '1.0.0',
      };
      
      const imperial: EngineResultForAI = { ...metric, unitSystem: 'imperial' };
      expect(metric.unitSystem).toBe('metric');
      expect(imperial.unitSystem).toBe('imperial');
    });

    it('supports both locales', () => {
      const ar: EngineResultForAI = {
        riskScore: 0.5,
        riskLevel: 'moderate',
        contributingFactors: [],
        missingInputs: [],
        warnings: [],
        unitSystem: 'metric',
        locale: 'ar',
        timestamp: '2024-01-01T00:00:00Z',
        engineVersion: '1.0.0',
      };
      
      const en: EngineResultForAI = { ...ar, locale: 'en' };
      expect(ar.locale).toBe('ar');
      expect(en.locale).toBe('en');
    });
  });

  describe('AIRequest Interface', () => {
    it('accepts valid request structure', () => {
      const request: AIRequest = {
        engineResult: {
          riskScore: 0.5,
          riskLevel: 'moderate',
          contributingFactors: [],
          missingInputs: [],
          warnings: [],
          unitSystem: 'metric',
          locale: 'ar',
          timestamp: '2024-01-01T00:00:00Z',
          engineVersion: '1.0.0',
        },
        userContext: {
          experienceLevel: 'intermediate',
          goals: ['muscle_gain'],
        },
        requestType: 'explain',
        locale: 'ar',
      };

      expect(request.engineResult).toBeDefined();
      expect(request.requestType).toBe('explain');
      expect(request.locale).toBe('ar');
    });

    it('supports all request types', () => {
      const types = ['explain', 'summarize', 'gap_analysis'] as const;
      for (const type of types) {
        const request: AIRequest = {
          engineResult: {
            riskScore: 0.5,
            riskLevel: 'moderate',
            contributingFactors: [],
            missingInputs: [],
            warnings: [],
            unitSystem: 'metric',
            locale: 'en',
            timestamp: '2024-01-01T00:00:00Z',
            engineVersion: '1.0.0',
          },
          requestType: type,
          locale: 'en',
        };
        expect(request.requestType).toBe(type);
      }
    });

    it('userContext is optional', () => {
      const request: AIRequest = {
        engineResult: {
          riskScore: 0.5,
          riskLevel: 'moderate',
          contributingFactors: [],
          missingInputs: [],
          warnings: [],
          unitSystem: 'metric',
          locale: 'en',
          timestamp: '2024-01-01T00:00:00Z',
          engineVersion: '1.0.0',
        },
        requestType: 'explain',
        locale: 'en',
      };
      expect(request.userContext).toBeUndefined();
    });
  });
});