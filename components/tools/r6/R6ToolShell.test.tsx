import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { R6ToolShell } from '@/components/tools/r6/R6ToolShell';
import type { R6ManifestEntry } from '@/lib/tools/r6/manifest';

const ENTRY: R6ManifestEntry = {
  slug: 'tool-999-demo',
  href: '/smarttools/nutrition/tool-999-demo',
  index: 999,
  total: 268,
  titleEn: 'Demo Tool',
  titleAr: 'أداة تجريبية',
  descriptionEn: 'Demo description',
  descriptionAr: 'وصف تجريبي',
  categorySlug: 'nutrition',
  prevSlug: null,
  nextSlug: null,
  prevTitleEn: null,
  prevTitleAr: null,
  nextTitleEn: null,
  nextTitleAr: null,
  hasOwnBoxes: false,
};

function DemoBody() {
  return (
    <div>
      <label htmlFor="age">Age</label>
      <input id="age" name="age" type="number" min={18} max={80} data-r6-slider="true" />
      <label htmlFor="note">Note</label>
      <input id="note" name="note" type="text" />
    </div>
  );
}

describe('R6ToolShell', () => {
  afterEach(() => cleanup());

  it('renders C1–C12 boxes and a state badge', () => {
    const { container } = render(
      <R6ToolShell entry={ENTRY} locale="en">
        <DemoBody />
      </R6ToolShell>
    );

    const boxes = container.querySelectorAll('[data-box-id]');
    expect(Array.from(boxes).map((b) => b.getAttribute('data-box-id'))).toEqual([
      'C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8', 'C9', 'C10', 'C11', 'C12',
    ]);
    expect(container.querySelector('[data-source="not_available"]')).not.toBeNull();
    expect(container.querySelector('[role="status"]')).not.toBeNull();
  });

  it('skips boxes for the five frozen tools', () => {
    const { container } = render(
      <R6ToolShell entry={{ ...ENTRY, hasOwnBoxes: true }} locale="en">
        <DemoBody />
      </R6ToolShell>
    );
    expect(container.querySelectorAll('[data-box-id]').length).toBe(0);
  });

  it('opens a tooltip on hover and closes with Escape', async () => {
    const { container } = render(
      <R6ToolShell entry={ENTRY} locale="en">
        <DemoBody />
      </R6ToolShell>
    );

    const age = container.querySelector<HTMLInputElement>('#age')!;
    fireEvent.pointerOver(age);

    await waitFor(() => expect(container.querySelector('[role="tooltip"]')).not.toBeNull());
    expect(container.querySelector('[role="tooltip"]')?.textContent).toContain('Age');

    fireEvent.keyDown(age, { key: 'Escape' });
    await waitFor(() => expect(container.querySelector('[role="tooltip"]')).toBeNull());
  });

  it('uses a sibling label when the input has no htmlFor', async () => {
    const { container } = render(
      <R6ToolShell entry={ENTRY} locale="en">
        <div>
          <label>Systolic BP (mmHg):</label>
          <input type="number" min={60} max={250} defaultValue={120} />
        </div>
      </R6ToolShell>
    );

    const field = container.querySelector<HTMLInputElement>('input[type="number"]')!;
    fireEvent.pointerOver(field);

    await waitFor(() => expect(container.querySelector('[role="tooltip"]')).not.toBeNull());
    expect(container.querySelector('[role="tooltip"]')?.textContent).toContain('Systolic BP (mmHg)');
  });

  it('upgrades a tagged field with a slider and keeps the native value', async () => {
    const { container } = render(
      <R6ToolShell entry={ENTRY} locale="en">
        <DemoBody />
      </R6ToolShell>
    );

    const range = container.querySelector<HTMLInputElement>('.r6-slider__range');
    expect(range).not.toBeNull();
    expect(range?.min).toBe('18');
    expect(range?.max).toBe('80');

    fireEvent.input(range!, { target: { value: '42' } });
    const age = container.querySelector<HTMLInputElement>('#age')!;
    expect(age.value).toBe('42');
  });
});
