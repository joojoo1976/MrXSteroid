import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import React from 'react';
import Pilot from '@/components/tools/tool-126-neuromuscular-explosiveness-modeler-pilot';

afterEach(() => cleanup());

describe('Neuromuscular pilot', () => {
  it('calculates', async () => {
    render(<Pilot />);
    fireEvent.click(screen.getByRole('button', { name: /calculate/i }));
    await waitFor(() => expect(screen.getByTestId('result')).toBeInTheDocument());
    expect(screen.getByTestId('result').textContent).toMatch(/Explosiveness score/);
  });
  it('invalid negative shows error', async () => {
    render(<Pilot />);
    const bw = screen.getByText('Body weight (kg)').querySelector('input') as HTMLInputElement;
    fireEvent.change(bw, { target: { value: '-1' } });
    fireEvent.click(screen.getByRole('button', { name: /calculate/i }));
    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
    expect(screen.queryByTestId('result')).not.toBeInTheDocument();
  });
});