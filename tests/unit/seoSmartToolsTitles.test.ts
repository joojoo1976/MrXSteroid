/**
 * P1 verification — smarttools titles must not double-brand (H12).
 *
 * Defect (Gap Audit 2026-09-28): the root layout template
 * '%s | Mr. X-Steroid' composes child titles through Next.js metadata
 * inheritance; child titles that already carried the suffix rendered as
 * "… | Mr. X-Steroid | Mr. X-Steroid" on all smarttools pages.
 *
 * Architecture note: after the hierarchical migration (SPEC §1.4) the five
 * legacy flat pages became 301 redirect stubs that emit no titles, so the
 * metadata carriers are now the segment layout + the two dynamic routes.
 * Composing titles (everything up to the openGraph block) must be brand-free;
 * openGraph titles never compose and keep their own single suffix.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const METADATA_CARRIERS = [
    'app/smarttools/layout.tsx',
    'app/smarttools/[category]/page.tsx',
    'app/smarttools/[category]/[tool]/page.tsx',
];

/** Slice of the file holding COMPOSING titles (metadata block up to openGraph). */
function composingZone(src: string): string {
    const gm = src.indexOf('generateMetadata');
    const start = gm >= 0 ? gm : src.indexOf('metadata');
    const og = src.indexOf('openGraph');
    return src.slice(start >= 0 ? start : 0, og > start ? og : src.length);
}

describe('smarttools page titles — P1 (H12) no double brand suffix', () => {
    for (const page of METADATA_CARRIERS) {
        it(`${page} composing metadata title carries no literal brand suffix (the layout template appends it)`, () => {
            const src = readFileSync(join(process.cwd(), page), 'utf8');
            const zone = composingZone(src);
            expect(zone).toContain('title');
            expect(zone).not.toContain('Mr. X-Steroid');
        });
    }

    it('the root layout title template is unchanged (general strategy preserved)', () => {
        const src = readFileSync(join(process.cwd(), 'app/layout.tsx'), 'utf8');
        expect(src).toContain("'%s | Mr. X-Steroid'");
    });
});
