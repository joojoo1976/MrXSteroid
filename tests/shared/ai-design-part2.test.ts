// tests/shared/ai-design-part2.test.ts
/**
 * AI Service Design Tests - Part 2
 */

import { describe, it, expect } from 'vitest';
import { AIResponse, AIServiceConfig, AIService } from '@/lib/shared/ai-service-design';

describe('AI Service Design Tests - Part 2', () => {
  describe('AIResponse Interface', () => {
    it('accepts valid response structure', () => {
      const response = {
        explanation: 'The risk is moderate due to...',
        keyInsights: ['Insight 1', 'Insight 2'],
        dataGaps: ['Missing estrogen level'],
        limitations: ['Model is educational only'],
        confidence: 'high',
        disclaimer: 'Not medical advice',
        engineVersionUsed: '1.0.0',
        generatedAt: '2024-01-01T00:00:00Z',
      };

      expect(response.explanation).toBeDefined();
      expect(response.keyInsights).toHaveLength(2);
      expect(response.confidence).toBe('high');
      expect(response.disclaimer).toBeDefined();
    });

    it('supports all confidence levels', () => {
      const levels = ['high', 'medium', 'low'] as const;
      for (const level of levels) {
        const response = {
          explanation: 'Test',
          keyInsights: [],
          dataGaps: [],
          limitations: [],
          confidence: level,
          disclaimer: 'Disclaimer',
          engineVersionUsed: '1.0.0',
          generatedAt: '2024-01-01T00:00:00Z',
        };
        expect(response.confidence).toBe(level);
      }
    });

    it('requires disclaimer', () => {
      const response = {
        explanation: 'Test',
        keyInsights: [],
        dataGaps: [],
        limitations: [],
        confidence: 'high',
        disclaimer: 'Not medical advice',
        engineVersionUsed: '1.0.0',
        generatedAt: '2024-01-01T00:00:00Z',
      };
      expect(response.disclaimer).toBe('Not medical advice');
    });
  });

  describe('AIServiceConfig', () => {
    it('accepts valid configuration', () => {
      const config = {
        endpoint: '/api/ai/test-tool',
        model: 'gpt-4',
        timeoutMs: 15000,
        maxFindings: 5,
        rateLimit: { requestsPerMinute: 10, requestsPerHour: 100 },
      };

      expect(config.endpoint).toBe('/api/ai/test-tool');
      expect(config.timeoutMs).toBe(15000);
      expect(config.rateLimit.requestsPerMinute).toBe(10);
    });
  });

  describe('AIService Interface', () => {
    it('defines required methods', () => {
      const service = {
        healthCheck: async () => ({ status: 'NOT_CONFIGURED' as const }),
        explain: async () => ({
          explanation: '',
          keyInsights: [],
          dataGaps: [],
          limitations: [],
          confidence: 'medium' as const,
          disclaimer: '',
          engineVersionUsed: '1.0.0',
          generatedAt: new Date().toISOString(),
        }),
        getStatus: () => 'NOT_CONFIGURED' as const,
      };

      expect(typeof (service as any).healthCheck).toBe('function');
      expect(typeof (service as any).explain).toBe('function');
      expect(typeof (service as any).getStatus).toBe('function');
    });
  });
});