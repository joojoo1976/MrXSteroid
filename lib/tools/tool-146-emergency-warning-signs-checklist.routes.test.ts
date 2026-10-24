import { describe, expect, it } from 'vitest';
import { Page } from '@/shared/types/types';
import { pageToPath, pathToPage } from '@/lib/legacy-routes';

describe('Tool 146 route identity', () => {
  it('round-trips the canonical emergency checklist route', () => {
    const href = '/smarttools/platform-ai/tool-146-ai-safety-gate-emergency-protocol';
    expect(pageToPath(Page.EMERGENCY_WARNING_SIGNS_CHECKLIST)).toBe(href);
    expect(pathToPage(href)).toBe(Page.EMERGENCY_WARNING_SIGNS_CHECKLIST);
  });
});
