import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import BmiPilotTool from './bmi-pilot';
import ProteinNeedsPilotTool from './protein-needs-pilot';
import WaterIntakePilotTool from './water-intake-pilot';
import { withToolPreferences } from './tool-preferences.test-utils';

afterEach(() => cleanup());

// Most catalog tools own their <main>. The three R5 pilots are rendered by the
// shared Genius template, which provides an h1 but no landmark. Adding <main>
// at the route layout would nest landmarks inside every other tool, so the
// landmark belongs in the R5 tool shells themselves.
describe.each([
    ['BMI', BmiPilotTool],
    ['Protein Needs', ProteinNeedsPilotTool],
    ['Water Intake', WaterIntakePilotTool],
] as const)('%s main landmark', (_name, Tool) => {
    it('exposes exactly one main landmark for the tool', () => {
        render(withToolPreferences(<Tool />, 'en', 'metric'));
        expect(screen.getAllByRole('main')).toHaveLength(1);
    });
});
