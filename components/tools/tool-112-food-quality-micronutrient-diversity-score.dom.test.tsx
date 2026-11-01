import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import Tool112FoodQualityScore from './tool-112-food-quality-micronutrient-diversity-score';
import { withToolPreferences } from './tool-preferences.test-utils';

describe('Tool 112 feature parity controls', () => {
  afterEach(() => cleanup());

  it('follows global language and measurement settings without local duplicate controls', () => {
    const view = render(withToolPreferences(<Tool112FoodQualityScore />, 'ar', 'metric'));
    const { container } = view;
    expect(container.firstElementChild).toHaveAttribute('dir', 'rtl');
    expect(screen.queryByRole('button', { name: 'EN' })).not.toBeInTheDocument();
    expect(screen.queryByRole('group', { name: 'نظام الوحدات' })).not.toBeInTheDocument();
    view.rerender(withToolPreferences(<Tool112FoodQualityScore />, 'en', 'imperial'));
    expect(container.firstElementChild).toHaveAttribute('dir', 'ltr');
    expect(screen.getByRole('button', { name: 'Calculate' })).toBeInTheDocument();
    expect(screen.getByText(/oz/)).toBeInTheDocument();
  });

  it('shows adapter findings after explicit calculation and hides them when inputs change or reset', () => {
    render(<Tool112FoodQualityScore />);
    fireEvent.change(screen.getByPlaceholderText('مثال: سبانخ، صدر دجاج'), { target: { value: 'سبانخ' } });
    fireEvent.click(screen.getByRole('button', { name: 'احسب' }));
    expect(screen.getByText('ملخص النتائج')).toBeInTheDocument();
    expect(screen.getAllByText('مؤشر جودة الغذاء').length).toBeGreaterThan(0);

    fireEvent.change(screen.getByLabelText(/أيام التتبع/), { target: { value: '4' } });
    expect(screen.queryByText('ملخص النتائج')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'إعادة ضبط' }));
    expect(screen.queryByText('ملخص النتائج')).not.toBeInTheDocument();
  });
});
