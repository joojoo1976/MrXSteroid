import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import Tool101SarmToAasTransition from './tool-101-sarm-to-aas-transition-bridge-predictor';
import Tool102SubqVsIm from './tool-102-subcutaneous-vs-intramuscular-pk-modeler';
import Tool105HealthFusion from './tool-105-ai-health-data-fusion-hub';
import Tool109PosingOS from './tool-109-competition-readiness-posing-os';
import Tool110MealVisionScanner from './tool-110-ai-meal-vision-scanner';
import { withToolPreferences } from './tool-preferences.test-utils';

vi.mock('@/lib/tools/adapters/toolLogAdapter', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/lib/tools/adapters/toolLogAdapter')>();
  return { ...original, loadDraft: vi.fn(() => null), saveDraft: vi.fn(() => true) };
});

afterEach(() => cleanup());

const cases = [
  { name: 'Tool 101', Component: Tool101SarmToAasTransition, english: 'SARM-to-AAS Transition & Bridge Predictor', arabic: 'حاسبة الانتقال الذكي بين SARMs والستيرويدات' },
  { name: 'Tool 102', Component: Tool102SubqVsIm, english: 'Subcutaneous vs. Intramuscular PK Modeler', arabic: 'حاسبة مقارنة الحقن العضلي وتحت الجلد' },
  { name: 'Tool 105', Component: Tool105HealthFusion, english: 'AI Health Data Fusion Hub & Timeline', arabic: 'مركز دمج بيانات الصحة الذكي' },
  { name: 'Tool 109', Component: Tool109PosingOS, english: 'Competition Readiness & Stage Posing OS', arabic: 'نظام الاستعداد للبطولات والاستعراض' },
  { name: 'Tool 110', Component: Tool110MealVisionScanner, english: 'AI Meal Vision Scanner & Portion Estimator', arabic: 'ماسح الوجبات الذكي بالرؤية الحاسوبية' },
] as const;

describe('global language and measurement controls for unit-domain-specific tools', () => {
  it.each(cases)('$name follows global language and retains domain-specific units', ({ Component, english, arabic }) => {
    const view = render(withToolPreferences(<Component />, 'en', 'metric'));
    const heading = screen.getByRole('heading', { name: english });
    expect(heading.closest('[dir]')).toHaveAttribute('dir', 'ltr');

    view.rerender(withToolPreferences(<Component />, 'ar', 'imperial'));
    const localizedHeading = screen.getByRole('heading', { name: arabic });
    expect(localizedHeading.closest('[dir]')).toHaveAttribute('dir', 'rtl');
    expect(screen.queryByRole('button', { name: /English|العربية|Metric|Imperial|اللغة|القياس/i })).not.toBeInTheDocument();
  });
});
