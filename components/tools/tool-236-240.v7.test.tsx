import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { withToolPreferences } from './tool-preferences.test-utils';
import Tool236 from './tool-236-restaurant-macro-navigator';
import Tool237 from './tool-237-intra-workout-volumizer';
import Tool238 from './tool-238-fiber-type-adaptation-score';
import Tool239 from './tool-239-peptide-reconstitution';
import Tool240 from './tool-240-raw-powder-density-engine';

afterEach(() => cleanup());

describe('SmartTools 236–240 user-facing calculations and safety states', () => {
  it('Tool 236 totals user-entered menu labels and localizes through global preferences', () => {
    const view = render(withToolPreferences(<Tool236 />, 'en', 'metric'));
    fireEvent.change(screen.getByTestId('restaurant-0-itemName'), { target: { value: 'Rice bowl' } });
    fireEvent.change(screen.getByTestId('restaurant-0-servings'), { target: { value: '2' } });
    fireEvent.change(screen.getByTestId('restaurant-0-caloriesPerServing'), { target: { value: '500' } });
    fireEvent.change(screen.getByTestId('restaurant-0-proteinGramsPerServing'), { target: { value: '25' } });
    fireEvent.change(screen.getByTestId('restaurant-0-carbohydrateGramsPerServing'), { target: { value: '40' } });
    fireEvent.change(screen.getByTestId('restaurant-0-fatGramsPerServing'), { target: { value: '15' } });
    fireEvent.change(screen.getByTestId('restaurant-0-sourceReference'), { target: { value: 'Menu label' } });
    fireEvent.click(screen.getByRole('button', { name: 'Calculate totals' }));
    expect(screen.getByRole('status')).toHaveTextContent('1000 kcal');
    expect(screen.getByText(/does not estimate restaurant data/i)).toBeInTheDocument();

    view.rerender(withToolPreferences(<Tool236 />, 'ar', 'metric'));
    expect(screen.getByRole('heading', { name: 'حاسبة بيانات ملصق وجبات المطاعم' }).closest('[dir]')).toHaveAttribute('dir', 'rtl');
    expect(screen.queryByRole('button', { name: /اللغة|القياس|English|Metric/i })).not.toBeInTheDocument();
  });

  it('Tool 236 rejects missing sources instead of presenting a guessed result', () => {
    render(withToolPreferences(<Tool236 />, 'en', 'metric'));
    fireEvent.click(screen.getByRole('button', { name: 'Calculate totals' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Complete each label entry');
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('Tool 237 calculates label totals and follows the global volume unit', () => {
    render(withToolPreferences(<Tool237 />, 'en', 'imperial'));
    expect(screen.getByText(/Serving volume \(US fl oz\)/)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Product name'), { target: { value: 'Drink' } });
    fireEvent.change(screen.getByLabelText('Value source / label reference'), { target: { value: 'Package' } });
    fireEvent.change(screen.getByTestId('intra-servingVolumeMl'), { target: { value: '16.907' } });
    fireEvent.change(screen.getByTestId('intra-servingsConsumed'), { target: { value: '1.5' } });
    fireEvent.change(screen.getByTestId('intra-caloriesPerServing'), { target: { value: '120' } });
    fireEvent.change(screen.getByTestId('intra-carbohydrateGramsPerServing'), { target: { value: '30' } });
    fireEvent.change(screen.getByTestId('intra-proteinGramsPerServing'), { target: { value: '0' } });
    fireEvent.change(screen.getByTestId('intra-fatGramsPerServing'), { target: { value: '0' } });
    fireEvent.click(screen.getByRole('button', { name: 'Calculate totals' }));
    expect(screen.getByRole('status')).toHaveTextContent('180 kcal');
    expect(screen.getByRole('status')).toHaveTextContent('45 g');
    expect(screen.getByRole('status')).toHaveTextContent('not a nutrition or hydration recommendation');
  });

  it('Tool 238 states that score inference is unavailable and records only user observations', () => {
    render(withToolPreferences(<Tool238 />, 'ar', 'metric'));
    expect(screen.getByText(/الدرجة: غير متاحة/)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'سجل ملاحظات الأداء المرتبطة بالألياف' }).closest('[dir]')).toHaveAttribute('dir', 'rtl');
    fireEvent.change(screen.getByLabelText('التمرين'), { target: { value: 'Squat' } });
    fireEvent.change(screen.getByLabelText('طريقة/سياق الملاحظة'), { target: { value: 'Training log' } });
    fireEvent.change(screen.getByLabelText('النتيجة كما سجلتها'), { target: { value: '8 reps' } });
    fireEvent.click(screen.getByRole('button', { name: 'سجل الملاحظة' }));
    expect(screen.getByRole('status')).toHaveTextContent('لا توجد درجة ألياف محسوبة');
  });

  it('Tool 239 requires a source reference and never offers preparation fields', () => {
    render(withToolPreferences(<Tool239 />, 'en', 'metric'));
    expect(screen.getByText(/does not verify sources or calculate preparation/)).toBeInTheDocument();
    expect(screen.queryByLabelText(/solvent|volume|concentration|dose/i)).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Product name as labeled'), { target: { value: 'Product' } });
    fireEvent.click(screen.getByRole('button', { name: 'Record reference' }));
    expect(screen.getByRole('alert')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Label source URL or reference ID'), { target: { value: 'Current leaflet reference' } });
    fireEvent.click(screen.getByRole('button', { name: 'Record reference' }));
    expect(screen.getByRole('status')).toHaveTextContent('calculation unavailable');
  });

  it('Tool 240 uses header units, shows validation errors, and displays measured density', () => {
    const view = render(withToolPreferences(<Tool240 />, 'en', 'metric'));
    fireEvent.click(screen.getByRole('button', { name: 'Calculate density' }));
    expect(screen.getByRole('alert')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Measured mass'), { target: { value: '2.5' } });
    fireEvent.change(screen.getByLabelText('Measured volume'), { target: { value: '1.25' } });
    fireEvent.change(screen.getByLabelText('Measurement reference'), { target: { value: 'Measurement record' } });
    fireEvent.click(screen.getByRole('button', { name: 'Calculate density' }));
    expect(screen.getByRole('status')).toHaveTextContent('2 g/mL');
    expect(screen.getByRole('status')).toHaveTextContent('does not determine purity, dose, or preparation');

    view.rerender(withToolPreferences(<Tool240 />, 'en', 'imperial'));
    expect(screen.getByText('Measured mass (lb)')).toBeInTheDocument();
    expect(screen.getByText('Measured volume (US fl oz)')).toBeInTheDocument();
  });
});
