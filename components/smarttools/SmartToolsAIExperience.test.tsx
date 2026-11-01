import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';

const { pathname } = vi.hoisted(() => ({ pathname: { value: '/smarttools/platform-ai/tool-150-ai-performance-command-center' } }));

vi.mock('next/navigation', () => ({ usePathname: () => pathname.value }));
vi.mock('@/components/smarttools/AIInsightPanel', () => ({ default: () => <div>AI explainer panel</div> }));

import SmartToolsAIExperience from './SmartToolsAIExperience';

describe('SmartToolsAIExperience tool-specific availability', () => {
  afterEach(() => cleanup());

  it('does not render AI explainer for the manual-only Tool 150', () => {
    pathname.value = '/smarttools/platform-ai/tool-150-ai-performance-command-center';
    render(<SmartToolsAIExperience><p>Manual tool</p></SmartToolsAIExperience>);
    expect(screen.getByText('Manual tool')).toBeInTheDocument();
    expect(screen.queryByText('AI explainer panel')).not.toBeInTheDocument();
  });

  it('keeps the shared explainer available for other tool routes', () => {
    pathname.value = '/smarttools/body-composition/tool-149-physique-trajectory-simulator';
    render(<SmartToolsAIExperience><p>Other tool</p></SmartToolsAIExperience>);
    expect(screen.getByText('AI explainer panel')).toBeInTheDocument();
  });
});
