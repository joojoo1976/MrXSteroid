import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import Tool061 from './tool-061-hair-loss-tracker';
import Tool062 from './tool-062-prostate-health-manager';
import Tool063 from './tool-063-testicular-suppression-calculator';
import Tool064 from './tool-064-sperm-production-optimizer';
import Tool065 from './tool-065-aromatase-conversion-calculator';
import Tool066 from './tool-066-estrogen-sensitivity-manager';
import Tool067 from './tool-067-estrogen-balance-calculator';
import Tool068 from './tool-068-gynecomastia-tracker';
import Tool070 from './tool-070-oxidative-stress-calculator';
import Tool071 from './tool-071-antioxidant-manager';
import Tool072 from './tool-072-systemic-inflammation-calculator';
import Tool073 from './tool-073-immune-system-optimizer';
import Tool074 from './tool-074-blood-pressure-tracker';
import Tool075 from './tool-075-arterial-health-manager';
import Tool076 from './tool-076-blood-viscosity-calculator';
import Tool077 from './tool-077-nitric-oxide-optimizer';
import Tool078 from './tool-078-endothelial-health-manager';
import Tool080 from './tool-080-mitochondrial-optimizer';
import { withToolPreferences } from './tool-preferences.test-utils';

vi.mock('@/lib/tools/adapters/toolLogAdapter', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/lib/tools/adapters/toolLogAdapter')>();
  return { ...original, loadDraft: vi.fn(() => null), saveDraft: vi.fn(() => true) };
});

afterEach(() => cleanup());

const tools = [
  ['061', Tool061, 'Hair Loss Tracker', 'متتبع تساقط الشعر'],
  ['062', Tool062, 'Prostate Health Manager', 'مدير صحة البروستاتا'],
  ['063', Tool063, 'Testicular Suppression Calculator', 'حاسبة قمع الخصية'],
  ['064', Tool064, 'Sperm Production Optimizer', 'محسّن إنتاج الحيوانات المنوية'],
  ['065', Tool065, 'Aromatase Conversion Calculator', 'حاسبة التحويل الأروماتي'],
  ['066', Tool066, 'Estrogen Sensitivity Manager', 'مدير حساسية الإستروجين'],
  ['067', Tool067, 'Estrogen Balance Calculator', 'حاسبة التوازن الإستروجيني'],
  ['068', Tool068, 'Gynecomastia Tracker', 'متتبع التثدي'],
  ['070', Tool070, 'Oxidative Stress Calculator', 'حاسبة الإجهاد التأكسدي'],
  ['071', Tool071, 'Antioxidant Manager', 'مدير مضادات الأكسدة'],
  ['072', Tool072, 'Systemic Inflammation Calculator', 'حاسبة الالتهاب الجهازي'],
  ['073', Tool073, 'Immune System Optimizer', 'محسّن المناعة'],
  ['074', Tool074, 'Blood Pressure Tracker', 'متتبع ضغط الدم'],
  ['075', Tool075, 'Arterial Health Manager', 'مدير صحة الشرايين'],
  ['076', Tool076, 'Blood Viscosity Calculator', 'حاسبة لزوجة الدم'],
  ['077', Tool077, 'Nitric Oxide Optimizer', 'محسّن أكسيد النيتريك'],
  ['078', Tool078, 'Endothelial Health Manager', 'مدير صحة البطانة الغشائية'],
  ['080', Tool080, 'Mitochondrial Optimizer', 'محسّن الميتوكوندريا'],
] as const;

describe('Tools 061–080 shared preferences and metadata integration', () => {
  it.each(tools)('Tool %s follows global locale while retaining domain units', (_id, Component, english, arabic) => {
    const view = render(withToolPreferences(<Component />, 'en', 'metric'));
    expect(screen.getByRole('heading', { name: english }).closest('[dir]')).toHaveAttribute('dir', 'ltr');

    view.rerender(withToolPreferences(<Component />, 'ar', 'imperial'));
    expect(screen.getByRole('heading', { name: arabic }).closest('[dir]')).toHaveAttribute('dir', 'rtl');
    expect(screen.queryByRole('button', { name: /English|العربية|Metric|Imperial|اللغة|القياس/i })).not.toBeInTheDocument();
  });
});
