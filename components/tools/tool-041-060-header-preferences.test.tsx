import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import Tool041 from './tool-041-hematocrit-monitor';
import Tool042 from './tool-042-estrogen-management';
import Tool043 from './tool-043-prolactin-management';
import Tool044 from './tool-044-dht-side-effects';
import Tool045 from './tool-045-cycle-break-planner';
import Tool046 from './tool-046-trt-lifetime';
import Tool047 from './tool-047-fertility-preservation';
import Tool048 from './tool-048-cardiovascular-risk';
import Tool049 from './tool-049-bone-density';
import Tool050 from './tool-050-mental-health';
import Tool051 from './tool-051-peptide-dosage-calculator';
import Tool052 from './tool-052-growth-hormone-protocol-planner';
import Tool053 from './tool-053-insulin-conversion-calculator';
import Tool054 from './tool-054-glucose-tracker';
import Tool055 from './tool-055-insulin-sensitivity-optimizer';
import Tool056 from './tool-056-mini-pct-calculator';
import Tool057 from './tool-057-free-testosterone-manager';
import Tool058 from './tool-058-androgenic-balance-calculator';
import Tool059 from './tool-059-androgen-receptor-optimizer';
import Tool060 from './tool-060-5-alpha-conversion-calculator';
import { withToolPreferences } from './tool-preferences.test-utils';

vi.mock('@/lib/tools/adapters/toolLogAdapter', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/lib/tools/adapters/toolLogAdapter')>();
  return { ...original, loadDraft: vi.fn(() => null), saveDraft: vi.fn(() => true) };
});

afterEach(() => cleanup());

const tools = [
  ['041', Tool041, 'Hematocrit Monitor', 'متتبع الهيماتوكريت'],
  ['042', Tool042, 'Estrogen Management Pro', 'إدارة الإستروجين الاحترافية'],
  ['043', Tool043, 'Prolactin Management Pro', 'إدارة البرولاكتين'],
  ['044', Tool044, 'DHT Side Effect Predictor', 'متنبئ آثار DHT'],
  ['045', Tool045, 'Cycle Break Planner', 'مخطط فترة الراحة بين الدورات'],
  ['046', Tool046, 'TRT Lifetime Calculator', 'حاسبة عمر TRT'],
  ['047', Tool047, 'Fertility Preservation Guide', 'دليل الحفاظ على الخصوبة'],
  ['048', Tool048, 'Cardiovascular Risk Assessor', 'مقيّم خطر القلب'],
  ['049', Tool049, 'Bone Density Optimizer', 'محسّن كثافة العظام'],
  ['050', Tool050, 'Mental Health Monitor', 'مراقب الصحة النفسية'],
  ['051', Tool051, 'Peptide Dosage Calculator', 'حاسبة جرعة الببتيدات'],
  ['052', Tool052, 'Growth Hormone Protocol Planner', 'مخطط بروتوكول GH'],
  ['053', Tool053, 'Insulin Conversion Calculator', 'حاسبة تحويل الأنسولين'],
  ['054', Tool054, 'Glucose Tracker', 'متتبع الجلوكوز'],
  ['055', Tool055, 'Insulin Sensitivity Optimizer', 'محسّن حساسية الأنسولين'],
  ['056', Tool056, 'Mini PCT Calculator', 'حاسبة الـ PCT المصغّرة'],
  ['057', Tool057, 'Free Testosterone Manager', 'مدير التستوستيرون الحر'],
  ['058', Tool058, 'Androgenic Balance Calculator', 'حاسبة التوازن الأندروجيني'],
  ['059', Tool059, 'Androgen Receptor Optimizer', 'محسّن مستقبلات الأندروجين'],
  ['060', Tool060, '5-Alpha Conversion Calculator', 'حاسبة التحويل 5-ألفا'],
] as const;

describe('Tools 041–060 shared preference and metadata integration', () => {
  it.each(tools)('Tool %s follows global locale while retaining domain units', (_id, Component, english, arabic) => {
    const view = render(withToolPreferences(<Component />, 'en', 'metric'));
    expect(screen.getByRole('heading', { name: english }).closest('[dir]')).toHaveAttribute('dir', 'ltr');

    view.rerender(withToolPreferences(<Component />, 'ar', 'imperial'));
    expect(screen.getByRole('heading', { name: arabic }).closest('[dir]')).toHaveAttribute('dir', 'rtl');
    expect(screen.queryByRole('button', { name: /English|العربية|Metric|Imperial|اللغة|القياس/i })).not.toBeInTheDocument();
  });
});
