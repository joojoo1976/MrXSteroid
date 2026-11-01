import { vi, describe, it, expect } from 'vitest';
vi.mock('next/navigation', () => ({ permanentRedirect: vi.fn() }));
import { permanentRedirect } from 'next/navigation';
import Page from './page';

describe('rest-timer legacy route', () => {
  it('redirects to the canonical route', () => {
    Page();
    expect(permanentRedirect).toHaveBeenCalledWith('/smarttools/training-recovery/rest-timer');
  });
});
