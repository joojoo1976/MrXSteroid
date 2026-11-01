import { describe, it, expect, afterEach, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { LinkedDataContext } from './LinkedDataContext';

afterEach(() => { cleanup(); vi.restoreAllMocks(); });

describe('LinkedDataContext', () => {
  it('renders with valid data', () => {
    render(<LinkedDataContext sourceToolName="Body Fat" calculatedAt={new Date().toISOString()} value={15.2} unit="%" confidence="high" onEdit={() => {}} onIgnore={() => {}} tooltipText="affects macro" />);
    expect(screen.getByTestId('linked-data-context')).toBeTruthy();
    expect(screen.getByText('Body Fat')).toBeTruthy();
  });
  it('tooltip toggles on click (touch fallback)', () => {
    render(<LinkedDataContext sourceToolName="Body Fat" calculatedAt={new Date().toISOString()} value={15.2} unit="%" confidence="high" onEdit={() => {}} onIgnore={() => {}} tooltipText="affects macro" />);
    fireEvent.click(screen.getByLabelText('Toggle tooltip'));
    expect(screen.getByTestId('linked-tooltip')).toBeTruthy();
  });
  it('edit/ignore callbacks', () => {
    const onEdit = vi.fn(); const onIgnore = vi.fn();
    render(<LinkedDataContext sourceToolName="Body Fat" calculatedAt={new Date().toISOString()} value={15.2} unit="%" confidence="high" onEdit={onEdit} onIgnore={onIgnore} tooltipText="t" />);
    fireEvent.click(screen.getByTestId('linked-edit'));
    fireEvent.click(screen.getByTestId('linked-ignore'));
    expect(onEdit).toHaveBeenCalled();
    expect(onIgnore).toHaveBeenCalled();
  });
});
