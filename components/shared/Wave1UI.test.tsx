import { describe, it, expect, afterEach, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import LinkedDataContextCard from './LinkedDataContextCard';
import ContinueWithButton from './ContinueWithButton';
import CarryForwardPanel from './CarryForwardPanel';
import UniversalTooltip from './UniversalTooltip';
import NextBestActionCard from './NextBestActionCard';

afterEach(() => { cleanup(); vi.restoreAllMocks(); });

describe('LinkedDataContextCard', () => {
  it('renders valid data', () => {
    render(<LinkedDataContextCard data={{ computedAt: new Date().toISOString(), value: { weight: 80 }, unit: 'kg', confidence: 'high', stale: false, unitMismatch: false, lowConfidence: false, insufficient: false }} />);
    expect(screen.getByTestId('linked-data-context')).toBeTruthy();
    expect(screen.getByTestId('linked-value').textContent).toBe('80');
  });
  it('shows stale state', () => {
    render(<LinkedDataContextCard data={{ computedAt: new Date().toISOString(), value: 1, stale: true, unitMismatch: false, lowConfidence: false, insufficient: false }} />);
    expect(screen.getByTestId('linked-stale').textContent).toMatch(/Stale|قديم/);
  });
  it('edit/ignore callbacks', () => {
    const onEdit = vi.fn(); const onIgnore = vi.fn();
    render(<LinkedDataContextCard data={{ computedAt: new Date().toISOString(), value: 1, stale: false, unitMismatch: false, lowConfidence: false, insufficient: false }} onEdit={onEdit} onIgnore={onIgnore} />);
    fireEvent.click(screen.getByTestId('linked-edit'));
    fireEvent.click(screen.getByTestId('linked-ignore'));
    expect(onEdit).toHaveBeenCalled();
    expect(onIgnore).toHaveBeenCalled();
  });
});

describe('ContinueWithButton', () => {
  it('navigates on click', () => {
    const nav = vi.fn();
    render(<ContinueWithButton sourceToolId="a" targetToolId="b" targetHref="/macro" onNavigate={nav} />);
    fireEvent.click(screen.getByTestId('continue-with'));
    expect(nav).toHaveBeenCalledWith('/macro');
  });
  it('confirms before navigating', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    const nav = vi.fn();
    render(<ContinueWithButton sourceToolId="a" targetToolId="b" targetHref="/macro" onNavigate={nav} confirmMessage="apply?" />);
    fireEvent.click(screen.getByTestId('continue-with'));
    expect(nav).not.toHaveBeenCalled();
  });
});

describe('CarryForwardPanel', () => {
  it('hidden when not available', () => {
    const { container } = render(<CarryForwardPanel available={false} onUse={() => {}} onEnterNew={() => {}} onIgnore={() => {}} />);
    expect(container.firstChild).toBeNull();
  });
  it('shows options and requires confirmation via choice', () => {
    const onUse = vi.fn();
    render(<CarryForwardPanel available={true} onUse={onUse} onEnterNew={() => {}} onIgnore={() => {}} />);
    fireEvent.click(screen.getByTestId('cf-use'));
    expect(onUse).toHaveBeenCalled();
  });
});

describe('UniversalTooltip', () => {
  it('shows on focus', () => {
    render(<UniversalTooltip content="tip"><button>x</button></UniversalTooltip>);
    fireEvent.focus(screen.getByText('x'));
    expect(screen.getByTestId('universal-tooltip')).toBeTruthy();
  });
});

describe('NextBestActionCard', () => {
  it('renders action', () => {
    render(<NextBestActionCard action="Go to Macro" />);
    expect(screen.getByTestId('next-best-action')).toBeTruthy();
  });
});
