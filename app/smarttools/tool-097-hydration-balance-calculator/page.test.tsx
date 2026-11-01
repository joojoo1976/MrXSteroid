import { beforeEach, describe, expect, it, vi } from 'vitest';

const { redirectMock } = vi.hoisted(() => ({ redirectMock: vi.fn() }));

vi.mock('next/navigation', () => ({ redirect: redirectMock }));

describe('Tool 097 legacy route', () => {
  beforeEach(() => redirectMock.mockClear());

  it('redirects the flat legacy path to the category-first canonical route', async () => {
    const { default: FlatRedirectTool097 } = await import('./page');
    FlatRedirectTool097();
    expect(redirectMock).toHaveBeenCalledWith('/smarttools/nutrition/tool-097-hydration-balance-calculator');
  });
});
