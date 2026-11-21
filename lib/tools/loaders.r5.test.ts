import { describe, expect, it } from 'vitest';
import { getToolComponent } from './loaders';

/**
 * R5 first batch — catalog slugs use the canonical hrefs
 * `/smarttools/body-composition/bmi`, `/smarttools/nutrition/protein-needs`
 * and `/smarttools/nutrition/water-intake`, but their components are the
 * `*-pilot` modules. The dynamic [category]/[tool] route must resolve them.
 */
describe('R5 catalog slugs resolve to their pilot components', () => {
  it.each(['bmi', 'protein-needs', 'water-intake'])(
    'resolves %s to a React component',
    async (slug) => {
      const component = await getToolComponent(slug);
      expect(component).not.toBeNull();
      expect(component).toBeTypeOf('function');
    }
  );
});
