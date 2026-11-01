import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { PreferencesContext, type PreferencesContextProps } from '@/context/PreferencesContext';
import { Language, Theme } from '@/shared/types/types';
import SmartToolsIndex, { type SmartToolsIndexCategory } from './SmartToolsIndex';

const { mockPush } = vi.hoisted(() => ({ mockPush: vi.fn() }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: mockPush }) }));

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

beforeEach(() => mockPush.mockClear());

const categories: SmartToolsIndexCategory[] = [{
  slug: 'medical-monitoring',
  nameAr: 'المراقبة الطبية والسلامة',
  nameEn: 'Medical Monitoring & Safety',
  descriptionAr: 'وصف الفئة',
  descriptionEn: 'Category description',
  tools: [{
    toolId: 'mrx.tool.017-drug-interaction',
    slug: 'tool-017-drug-interaction',
    href: '/smarttools/medical-monitoring/tool-017-drug-interaction',
    titleAr: 'فاحص التداخلات الدوائية',
    titleEn: 'Drug Interaction Checker',
    descriptionAr: 'فحص التداخلات',
    descriptionEn: 'Interaction checking',
    searchText: 'Chapter 7: Drug Interactions compound and medication interaction screening',
  }],
}];

function renderWithLocale(locale: 'ar' | 'en') {
  const value = {
    language: locale === 'ar' ? Language.AR : Language.EN,
    unitSystem: 'metric', theme: Theme.DARK, status: 'IDLE', isAutoDetected: false,
    locale, currency: 'USD', formatPrice: (price: number) => `$${price}`,
    setLanguage: () => undefined, setUnitSystem: () => undefined, setTheme: () => undefined,
    t: (key: string) => key, content: {} as any, isRTL: locale === 'ar',
    refreshDetection: async () => undefined,
  } as PreferencesContextProps;
  return render(<PreferencesContext.Provider value={value}><SmartToolsIndex categories={categories} /></PreferencesContext.Provider>);
}

describe('SmartTools categorized index', () => {
  it('shows tools beneath their category and places category before tool in links', () => {
    renderWithLocale('en');
    expect(screen.getByRole('heading', { name: 'Medical Monitoring & Safety', level: 2 })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Drug Interaction Checker/ })).toHaveAttribute('href', '/smarttools/medical-monitoring/tool-017-drug-interaction');
    expect(screen.getByTestId('category-jump-medical-monitoring')).toHaveAttribute('href', '/smarttools/medical-monitoring');
    expect(screen.getByTestId('category-open-medical-monitoring')).toHaveAttribute('href', '/smarttools/medical-monitoring');
  });

  it('uses global Arabic language and RTL direction', () => {
    const { container } = renderWithLocale('ar');
    expect(container.querySelector('main > div')).toHaveAttribute('dir', 'rtl');
    expect(screen.getByRole('heading', { name: 'الأدوات الذكية' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /فاحص التداخلات الدوائية/ })).toHaveAttribute('href', '/smarttools/medical-monitoring/tool-017-drug-interaction');
  });

  it('searches tool titles, explanations, and catalog topic content while keeping category links visible', () => {
    renderWithLocale('en');
    fireEvent.change(screen.getByRole('searchbox', { name: 'Search SmartTools' }), { target: { value: 'medication interaction screening' } });
    expect(screen.getByRole('link', { name: /Drug Interaction Checker/ })).toHaveAttribute('href', '/smarttools/medical-monitoring/tool-017-drug-interaction');
    expect(screen.getByRole('link', { name: /Medical Monitoring & Safety/ })).toHaveAttribute('href', '/smarttools/medical-monitoring');
    expect(screen.getByText('Search results: 1 of 1 tools')).toBeInTheDocument();
  });

  it('finds tools by their Arabic category name', () => {
    renderWithLocale('ar');
    fireEvent.change(screen.getByRole('searchbox', { name: 'ابحث في الأدوات' }), { target: { value: 'المراقبه الطبيه' } });
    expect(screen.getByRole('link', { name: /فاحص التداخلات الدوائية/ })).toHaveAttribute('href', '/smarttools/medical-monitoring/tool-017-drug-interaction');
    expect(screen.getByText('نتائج البحث: 1 من 1 أداة')).toBeInTheDocument();
  });

  it('single-clicks a category to its section without leaving the index', () => {
    vi.useFakeTimers();
    const scrollIntoView = vi.fn();
    HTMLElement.prototype.scrollIntoView = scrollIntoView;
    renderWithLocale('en');
    fireEvent.click(screen.getByTestId('category-jump-medical-monitoring'));
    expect(mockPush).not.toHaveBeenCalled();
    vi.advanceTimersByTime(501);
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
  });

  it('double-clicks a category to open its dedicated category page', () => {
    vi.useFakeTimers();
    renderWithLocale('en');
    const categoryLink = screen.getByTestId('category-jump-medical-monitoring');
    fireEvent.click(categoryLink);
    fireEvent.click(categoryLink);
    expect(mockPush).toHaveBeenCalledWith('/smarttools/medical-monitoring');
  });

  it('normalizes Arabic diacritics and reports no matching tools accessibly', () => {
    renderWithLocale('ar');
    fireEvent.change(screen.getByRole('searchbox', { name: 'ابحث في الأدوات' }), { target: { value: 'غير موجود' } });
    expect(screen.getByRole('status')).toHaveTextContent('لم نعثر على أداة');
    expect(screen.getByRole('link', { name: /المراقبة الطبية والسلامة/ })).toHaveAttribute('href', '/smarttools/medical-monitoring');
  });
});
