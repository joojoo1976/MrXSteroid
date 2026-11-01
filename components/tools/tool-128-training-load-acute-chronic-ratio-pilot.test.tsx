import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import React from 'react';
import Pilot from '@/components/tools/tool-128-training-load-acute-chronic-ratio-pilot';

afterEach(() => cleanup());

describe('Training load pilot', () => {
  it('calculates sufficient data', async () => {
    render(<Pilot />);
    fireEvent.click(screen.getByRole('button', { name: /calculate/i }));
    await waitFor(() => expect(screen.getByTestId('result')).toBeInTheDocument());
    expect(screen.getByTestId('result').textContent).toMatch(/ACWR/);
  });
  it('insufficient data shows not available', async () => {
    render(<Pilot />);
    const ta = screen.getByText('Sessions JSON').querySelector('textarea') as HTMLTextAreaElement;
    const sessions = Array.from({ length: 7 }, (_, i) => ({ date: new Date(Date.now() - (6 - i) * 86400000).toISOString().slice(0, 10), load: 50 }));
    fireEvent.change(ta, { target: { value: JSON.stringify(sessions) } });
    fireEvent.click(screen.getByRole('button', { name: /calculate/i }));
    await waitFor(() => expect(screen.getByTestId('result')).toBeInTheDocument());
    expect(screen.getByTestId('result').textContent).toMatch(/not available/);
  });
  it('invalid json shows error', async () => {
    render(<Pilot />);
    const ta = screen.getByText('Sessions JSON').querySelector('textarea') as HTMLTextAreaElement;
    fireEvent.change(ta, { target: { value: '{bad' } });
    fireEvent.click(screen.getByRole('button', { name: /calculate/i }));
    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
    expect(screen.queryByTestId('result')).not.toBeInTheDocument();
  });
});