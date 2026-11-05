import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import React from 'react';
import GeniusToolTemplate from '@/lib/templates/genius-tool-template';

afterEach(() => cleanup());

describe('GeniusToolTemplate', () => {
  it('renders title, status, warnings, errors and rtl direction', () => {
    render(
      <GeniusToolTemplate
        toolId="tool-111"
        title="Macro Tool"
        description="Description"
        locale="ar"
        direction="rtl"
        unitSystem="metric"
        theme="dark"
        status="ready"
        warnings={[{ id: 'w1', level: 'high', message: 'Warning text' }]}
        errors={['Error text']}
        inputs={<span>Inputs</span>}
        results={<span>Results</span>}
      />
    );

    expect(screen.getByText('Macro Tool')).toBeInTheDocument();
    expect(screen.getByText('ready')).toBeInTheDocument();
    expect(screen.getByText('Warning text')).toBeInTheDocument();
    expect(screen.getByText('Error text')).toBeInTheDocument();
    expect(screen.getByText('Inputs')).toBeInTheDocument();
    expect(screen.getByText('Results')).toBeInTheDocument();

    const section = screen.getByText('Macro Tool').closest('section');
    expect(section).toHaveAttribute('dir', 'rtl');
    expect(section).toHaveAttribute('data-locale', 'ar');
  });

  it('renders ltr defaults and empty optional sections', () => {
    render(<GeniusToolTemplate toolId="tool-1" title="Empty Tool" />);
    const section = screen.getByText('Empty Tool').closest('section');
    expect(section).toHaveAttribute('dir', 'ltr');
    expect(section).toHaveAttribute('data-unit-system', 'metric');
    expect(section).toHaveAttribute('data-theme', 'light');
    expect(section).toHaveAttribute('data-status', 'idle');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.queryByRole('note')).not.toBeInTheDocument();
  });

  it('renders explanation, scenarios and children', () => {
    render(
      <GeniusToolTemplate
        toolId="tool-2"
        title="Rich Tool"
        explanation={<span>Explanation text</span>}
        scenarios={<span>Scenario text</span>}
      >
        <span>Child text</span>
      </GeniusToolTemplate>
    );

    expect(screen.getByText('Explanation text')).toBeInTheDocument();
    expect(screen.getByText('Scenario text')).toBeInTheDocument();
    expect(screen.getByText('Child text')).toBeInTheDocument();
  });

  it('renders warning levels and multiple errors', () => {
    render(
      <GeniusToolTemplate
        toolId="tool-3"
        title="Warning Tool"
        warnings={[
          { id: 'a', level: 'info', message: 'Info warning' },
          { id: 'b', level: 'critical', message: 'Critical warning' },
        ]}
        errors={['First error', 'Second error']}
      />
    );

    expect(screen.getByText('Info warning')).toHaveAttribute('data-warning-level', 'info');
    expect(screen.getByText('Critical warning')).toHaveAttribute('data-warning-level', 'critical');
    expect(screen.getByText('First error')).toBeInTheDocument();
    expect(screen.getByText('Second error')).toBeInTheDocument();
  });
});
