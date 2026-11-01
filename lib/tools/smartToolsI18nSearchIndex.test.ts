import { describe, expect, it } from 'vitest';
import { getSmartToolI18nSearchText } from './smartToolsI18nSearchIndex';

describe('SmartTools localized search index', () => {
  it('indexes all Arabic and English translation copy for a catalog slug', () => {
    const text = getSmartToolI18nSearchText('tool-111-smart-food-macro-substitution');

    expect(text).toContain('Smart Food & Macro Substitution Engine');
    expect(text).toContain('Data Provenance');
    expect(text).toContain('محرك استبدال الطعام الذكي بالمكرويات');
    expect(text).toContain('مصدر البيانات');
  });

  it('returns empty text for tools without a dedicated translation file', () => {
    expect(getSmartToolI18nSearchText('legacy-tool-without-i18n')).toBe('');
  });

  it('reads UTF-8 BOM translation files', () => {
    expect(getSmartToolI18nSearchText('tool-102-subcutaneous-vs-intramuscular-pk-modeler'))
      .toContain('Subcutaneous vs. Intramuscular PK Modeler');
  });

  it('rejects slugs that cannot safely be used as a file name', () => {
    expect(getSmartToolI18nSearchText('../tool-111-smart-food-macro-substitution')).toBe('');
  });
});
