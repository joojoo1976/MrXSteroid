import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import React from 'react';
import Pilot from '@/components/tools/tool-136-physique-golden-ratio-score-pilot';

afterEach(() => cleanup());

describe('Physique pilot', () => {
  it('calculates ratios and score', async () => {
    render(<Pilot />);
    fireEvent.change(screen.getByText('Shoulder (cm)').querySelector('input') as HTMLInputElement, { target: { value: '120' } });
    fireEvent.change(screen.getByText('Waist (cm)').querySelector('input') as HTMLInputElement, { target: { value: '80' } });
    fireEvent.click(screen.getByRole('button', { name: /calculate/i }));
    await waitFor(() => expect(screen.getByTestId('result')).toBeInTheDocument());
    expect(screen.getByTestId('result').textContent).toMatch(/Proportion score/);
    expect(screen.getByTestId('result').textContent).toMatch(/shoulder_waist/);
  });
  it('invalid negative shows error and no stale result', async () => {
    render(<Pilot />);
    fireEvent.change(screen.getByText('Shoulder (cm)').querySelector('input') as HTMLInputElement, { target: { value: '120' } });
    fireEvent.change(screen.getByText('Waist (cm)').querySelector('input') as HTMLInputElement, { target: { value: '80' } });
    fireEvent.click(screen.getByRole('button', { name: /calculate/i }));
    await waitFor(() => expect(screen.getByTestId('result')).toBeInTheDocument());
    fireEvent.change(screen.getByText('Shoulder (cm)').querySelector('input') as HTMLInputElement, { target: { value: '-1' } });
    fireEvent.click(screen.getByRole('button', { name: /calculate/i }));
    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
    expect(screen.queryByTestId('result')).not.toBeInTheDocument();
  });
  it('missing optional measurements are not treated as zero', async () => {
    render(<Pilot />);
    fireEvent.change(screen.getByText('Shoulder (cm)').querySelector('input') as HTMLInputElement, { target: { value: '120' } });
    fireEvent.change(screen.getByText('Waist (cm)').querySelector('input') as HTMLInputElement, { target: { value: '80' } });
    fireEvent.click(screen.getByRole('button', { name: /calculate/i }));
    await waitFor(() => expect(screen.getByTestId('result')).toBeInTheDocument());
    expect(screen.getByTestId('result').textContent).toMatch(/shoulder_waist/);
    expect(screen.getByTestId('result').textContent).not.toMatch(/chest_waist/);
  });
  it('insufficient data is reported not as score 0', async () => {
    render(<Pilot />);
    fireEvent.click(screen.getByRole('button', { name: /calculate/i }));
    await waitFor(() => expect(screen.getByTestId('result')).toBeInTheDocument());
    expect(screen.getByTestId('result').textContent).toMatch(/Insufficient data/);
    expect(screen.getByTestId('result').textContent).not.toMatch(/Proportion score: 0\/100/);
  });
  it('zero waist rejected with no stale result', async () => {
    render(<Pilot />);
    fireEvent.change(screen.getByText('Shoulder (cm)').querySelector('input') as HTMLInputElement, { target: { value: '120' } });
    fireEvent.change(screen.getByText('Waist (cm)').querySelector('input') as HTMLInputElement, { target: { value: '80' } });
    fireEvent.click(screen.getByRole('button', { name: /calculate/i }));
    await waitFor(() => expect(screen.getByTestId('result')).toBeInTheDocument());
    fireEvent.change(screen.getByText('Waist (cm)').querySelector('input') as HTMLInputElement, { target: { value: '0' } });
    fireEvent.click(screen.getByRole('button', { name: /calculate/i }));
    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
    expect(screen.queryByTestId('result')).not.toBeInTheDocument();
  });
});