import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import React from 'react';
import Pilot from '@/components/tools/tool-133-rep-tempo-velocity-loss-analyzer-pilot';

afterEach(() => cleanup());

describe('Velocity pilot', () => {
  it('calculates', async () => {
    render(<Pilot />);
    fireEvent.click(screen.getByRole('button', { name: /calculate/i }));
    await waitFor(() => expect(screen.getByTestId('result')).toBeInTheDocument());
    expect(screen.getByTestId('result').textContent).toMatch(/Velocity loss/);
  });
  it('empty sets shows error', async () => {
    render(<Pilot />);
    const ta = screen.getByText('Sets JSON').querySelector('textarea') as HTMLTextAreaElement;
    fireEvent.change(ta, { target: { value: '[]' } });
    fireEvent.click(screen.getByRole('button', { name: /calculate/i }));
    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
    expect(screen.queryByTestId('result')).not.toBeInTheDocument();
  });
});