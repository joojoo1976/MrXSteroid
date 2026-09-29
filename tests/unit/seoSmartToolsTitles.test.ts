/**
 * P1 verification — smarttools titles must not double-brand (H12).
 *
 * Defect (Gap Audit 2026-09-28): the root layout template
 * '%s | Mr. X-Steroid' composes child titles through Next.js metadata
 * inheritance; child titles that already carried the suffix rendered as
 * "… | Mr. X-Steroid | Mr. X-Steroid" on all five smarttools pages.
 *
 * Fix: the literal brand suffix was removed from the five generateMetadata
 * titles ONLY (the layout template is unchanged — the general metadata
 * strategy is untouched; openGraph titles never compose and keep their own
 * single suffix).
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const PAGES = [
    'app/smarttools/timeline/page.tsx',
    'app/smarttools/hpta-recovery/page.tsx',
    'app/smarttools/pct-timing/page.tsx',
    'app/smarttools/aromatization-risk/page.tsx',
    'app/smarttools/multi-ester-pharmacokinetics/page.tsx',
];

describe('smarttools page titles — P1 (H12) no double brand suffix', () => {
    for (const page of PAGES) {
        it(`${page} metadata title carries no literal brand suffix (the layout template appends it)`, () => {
            const src = readFileSync(join(process.cwd(), page), 'utf8');
            // The first `title:` occurrence in each file is the
            // generateMetadata title (openGraph.title comes later and never
            // composes through the template).
            const match = src.match(/title: '([^']+)'/);
            expect(match).not.toBeNull();
            expect(match![1]).not.toContain('Mr. X-Steroid');
        });
    }

    it('the root layout title template is unchanged (general strategy preserved)', () => {
        const src = readFileSync(join(process.cwd(), 'app/layout.tsx'), 'utf8');
        expect(src).toContain("'%s | Mr. X-Steroid'");
    });
});
