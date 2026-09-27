import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    createL2Scanner,
    defaultL2TextPredicate,
    L2_SKIP_SELECTOR,
    L2_DEFAULT_MAX_REQUESTS,
    type L2TranslateFn,
} from './scanner';
import { SURFACE_ATTR, TRANSLATED_ATTR, TRANSLATED_LANG_ATTR } from '@/server/translation/contracts';

function mount(html: string): HTMLElement {
    document.body.innerHTML = html;
    return document.body;
}

/** Always succeeds, echoing a recognisable translation. */
function okTranslator(prefix = 'FR:'): L2TranslateFn {
    return vi.fn(async (text: string) => ({ ok: true as const, text: `${prefix}${text}` }));
}

beforeEach(() => {
    document.body.innerHTML = '';
});

describe('T3 · L2 scanner · deny by default', () => {
    it('leaves unmarked content completely untouched', async () => {
        const root = mount(`<p>Get started today</p>`);
        const translate = okTranslator();
        const report = await createL2Scanner({ root, target: 'fr', translate }).scan();

        expect(root.textContent).toContain('Get started today');
        expect(translate).not.toHaveBeenCalled();
        expect(report.applied).toBe(0);
        expect(report.skippedUnmarked).toBe(1);
    });

    it('translates only the marked subtree', async () => {
        const root = mount(`
            <h1 data-mrx-surface="hero">Welcome aboard</h1>
            <p>Legal disclaimer nobody asked to translate</p>
        `);
        await createL2Scanner({ root, target: 'fr', translate: okTranslator() }).scan();

        expect(root.querySelector('h1')?.textContent).toBe('FR:Welcome aboard');
        expect(root.querySelector('p')?.textContent).toBe('Legal disclaimer nobody asked to translate');
    });

    it('ignores an unknown surface value', async () => {
        const root = mount(`<p data-mrx-surface="checkout">Pay now</p>`);
        const translate = okTranslator();
        await createL2Scanner({ root, target: 'fr', translate }).scan();
        expect(translate).not.toHaveBeenCalled();
    });

    it('ignores data-mrx-surface="none"', async () => {
        const root = mount(`<p data-mrx-surface="none">Keep me in English</p>`);
        const translate = okTranslator();
        await createL2Scanner({ root, target: 'fr', translate }).scan();
        expect(root.querySelector('p')?.textContent).toBe('Keep me in English');
        expect(translate).not.toHaveBeenCalled();
    });

    it('attributes nested marked nodes to the innermost surface', async () => {
        const root = mount(`
            <div data-mrx-surface="public-content">
                Outer heading
                <span data-mrx-surface="hero">Inner heading</span>
            </div>
        `);
        const surfaces: string[] = [];
        const translate: L2TranslateFn = vi.fn(async (text, surface) => {
            surfaces.push(surface);
            return { ok: true as const, text: `X(${surface}):${text}` };
        });
        await createL2Scanner({ root, target: 'fr', translate }).scan();

        expect(surfaces).toContain('public-content');
        expect(surfaces).toContain('hero');
        expect(root.querySelector('span')?.textContent).toBe('X(hero):Inner heading');
    });
});

describe('T3 · L2 scanner · structural deny-list', () => {
    it.each([
        ['code', '<code>const answer = 42;</code>'],
        ['pre', '<pre>pip install thing</pre>'],
        ['kbd', '<kbd>Ctrl</kbd>'],
        ['samp', '<samp>output text</samp>'],
        ['script', '<script>alert("hello there")</script>'],
        ['style', '<style>.a{color:red}</style>'],
    ])('never translates inside <%s>', async (_tag, inner) => {
        const root = mount(`<div data-mrx-surface="public-content">${inner}</div>`);
        const translate = okTranslator();
        await createL2Scanner({ root, target: 'fr', translate }).scan();
        expect(translate).not.toHaveBeenCalled();
    });

    it('never translates a form control value', async () => {
        const root = mount(`
            <div data-mrx-surface="public-content">
                <textarea>Type your question here</textarea>
            </div>
        `);
        const translate = okTranslator();
        await createL2Scanner({ root, target: 'fr', translate }).scan();
        expect(translate).not.toHaveBeenCalled();
    });

    it('never translates an explicitly untranslatable region', async () => {
        const root = mount(`<div data-mrx-surface="public-content" translate="no">Brand promise</div>`);
        const translate = okTranslator();
        await createL2Scanner({ root, target: 'fr', translate }).scan();
        expect(translate).not.toHaveBeenCalled();
    });

    it('never translates editable content', async () => {
        const root = mount(`<div data-mrx-surface="public-content" contenteditable="true">Edit this copy</div>`);
        const translate = okTranslator();
        await createL2Scanner({ root, target: 'fr', translate }).scan();
        expect(translate).not.toHaveBeenCalled();
    });

    it('exposes the deny-list for auditing', () => {
        expect(L2_SKIP_SELECTOR).toContain('code');
        expect(L2_SKIP_SELECTOR).toContain('textarea');
        expect(L2_SKIP_SELECTOR).toContain('translate="no"');
    });
});

describe('T3 · L2 scanner · text eligibility', () => {
    it.each([
        ['pure digits', '1024'],
        ['a number with a unit', '3.5 mg'],
        ['a number with a two-letter unit', '2.5 kg'],
        ['a percentage', '50 %'],
        ['punctuation only', '—'],
        ['a single character', 'x'],
        ['an empty string', ''],
        ['whitespace only', '   '],
        ['a short acronym', 'FAQ'],
        ['a currency code', 'USD'],
    ])('rejects %s', (_label, text) => {
        expect(defaultL2TextPredicate(text)).toBe(false);
    });

    it.each([
        ['a marketing sentence', 'Get started today'],
        ['a single word', 'Welcome'],
        ['a sentence with punctuation', 'Read the docs, then begin.'],
        ['non-latin prose', 'Willkommen zu Hause'],
        ['a number with a real word', '5 items'],
    ])('accepts %s', (_label, text) => {
        expect(defaultL2TextPredicate(text)).toBe(true);
    });

    it('rejects text beyond the per-string ceiling', () => {
        expect(defaultL2TextPredicate('a'.repeat(1025))).toBe(false);
    });
});

describe('T3 · L2 scanner · application', () => {
    it('marks the surface with the translated target', async () => {
        const root = mount(`<h1 data-mrx-surface="hero">Welcome aboard</h1>`);
        await createL2Scanner({ root, target: 'de', translate: okTranslator('DE:') }).scan();
        const heading = root.querySelector('h1');
        expect(heading?.getAttribute(TRANSLATED_ATTR)).toBe('de');
        expect(heading?.getAttribute(TRANSLATED_LANG_ATTR)).toBe('de');
    });

    it('preserves surrounding whitespace', async () => {
        const root = mount(`<p data-mrx-surface="public-content">  Get started today  </p>`);
        await createL2Scanner({ root, target: 'fr', translate: okTranslator() }).scan();
        expect(root.querySelector('p')?.textContent).toBe('  FR:Get started today  ');
    });

    it('translates aria-label and title alongside visible text', async () => {
        const root = mount(`<button data-mrx-surface="hero" aria-label="Get started" title="Get started">Get started</button>`);
        const report = await createL2Scanner({ root, target: 'fr', translate: okTranslator() }).scan();
        const button = root.querySelector('button');
        expect(button?.getAttribute('aria-label')).toBe('FR:Get started');
        expect(button?.getAttribute('title')).toBe('FR:Get started');
        // One unique string, so one request despite three occurrences.
        expect(report.requests).toBe(1);
        expect(report.applied).toBe(3);
    });

    it('de-duplicates identical strings across nodes', async () => {
        const root = mount(`
            <div data-mrx-surface="public-content">
                <p>Subscribe now</p><p>Subscribe now</p><p>Subscribe now</p>
            </div>
        `);
        const translate = okTranslator();
        const report = await createL2Scanner({ root, target: 'fr', translate }).scan();
        expect(translate).toHaveBeenCalledTimes(1);
        expect(report.applied).toBe(3);
    });

    it('treats surrounding whitespace as the same string', async () => {
        const root = mount(`
            <div data-mrx-surface="public-content">
                <p>Subscribe now</p><p>  Subscribe now  </p>
            </div>
        `);
        const translate = okTranslator();
        await createL2Scanner({ root, target: 'fr', translate }).scan();
        expect(translate).toHaveBeenCalledTimes(1);
    });

    it('does not re-translate a surface already translated to the same target', async () => {
        const root = mount(`<h1 data-mrx-surface="hero" ${TRANSLATED_ATTR}="fr">Welcome aboard</h1>`);
        const translate = okTranslator();
        await createL2Scanner({ root, target: 'fr', translate }).scan();
        expect(translate).not.toHaveBeenCalled();
    });
});

describe('T3 · L2 scanner · request budget', () => {
    function manyNodes(count: number): string {
        return `<div data-mrx-surface="public-content">${Array.from(
            { length: count },
            (_, index) => `<p>Unique sentence number ${index} here</p>`
        ).join('')}</div>`;
    }

    it('never issues more than maxRequests provider calls', async () => {
        const root = mount(manyNodes(30));
        const translate = okTranslator();
        const report = await createL2Scanner({ root, target: 'fr', translate, maxRequests: 5 }).scan();
        expect(report.requests).toBe(5);
        expect(report.deferred).toBe(25);
        expect(translate).toHaveBeenCalledTimes(5);
    });

    it('defaults to a budget under the endpoint rate limit', async () => {
        expect(L2_DEFAULT_MAX_REQUESTS).toBeLessThanOrEqual(10);
    });

    it('does not spend budget on cache hits', async () => {
        const root = mount(manyNodes(6));
        const translate: L2TranslateFn = vi.fn(async (text) => ({ ok: true as const, text, fromCache: true }));
        const report = await createL2Scanner({ root, target: 'fr', translate, maxRequests: 2 }).scan();
        // All six resolved from cache, so no request budget was consumed.
        expect(report.cacheHits).toBe(6);
        expect(report.requests).toBe(0);
        expect(report.deferred).toBe(0);
    });

    it('leaves deferred text in its canonical English', async () => {
        const root = mount(manyNodes(4));
        const report = await createL2Scanner({ root, target: 'fr', translate: okTranslator(), maxRequests: 1 }).scan();
        expect(report.applied).toBe(1);
        expect(root.querySelectorAll('p')[3].textContent).toBe('Unique sentence number 3 here');
    });
});

describe('T3 · L2 scanner · failure is non-destructive', () => {
    it('reports the failure code and leaves English in place', async () => {
        const root = mount(`<h1 data-mrx-surface="hero">Welcome aboard</h1>`);
        const translate: L2TranslateFn = vi.fn(async () => ({
            ok: false as const,
            code: 'RATE_LIMITED',
            retryable: true,
        }));
        const report = await createL2Scanner({ root, target: 'fr', translate }).scan();

        expect(report.failure).toEqual({ code: 'RATE_LIMITED', retryable: true });
        expect(root.querySelector('h1')?.textContent).toBe('Welcome aboard');
        expect(root.querySelector('h1')?.hasAttribute(TRANSLATED_ATTR)).toBe(false);
    });

    it('keeps the successes when one string fails', async () => {
        const root = mount(`
            <div data-mrx-surface="public-content">
                <p>Good sentence here</p><p>Bad sentence here</p>
            </div>
        `);
        const translate: L2TranslateFn = vi.fn(async (text) =>
            text.startsWith('Bad')
                ? { ok: false as const, code: 'PROVIDER_ERROR', retryable: true }
                : { ok: true as const, text: `FR:${text}` }
        );
        const report = await createL2Scanner({ root, target: 'fr', translate }).scan();

        expect(report.failure?.code).toBe('PROVIDER_ERROR');
        const paragraphs = root.querySelectorAll('p');
        expect(paragraphs[0].textContent).toBe('FR:Good sentence here');
        expect(paragraphs[1].textContent).toBe('Bad sentence here');
    });
});

describe('T3 · L2 scanner · restore', () => {
    it('returns the document to byte-identical English', async () => {
        const original = `<div data-mrx-surface="public-content"><p>  Get started today  </p></div>`;
        const root = mount(original);
        const before = root.innerHTML;

        const scanner = createL2Scanner({ root, target: 'fr', translate: okTranslator() });
        await scanner.scan();
        expect(root.innerHTML).not.toBe(before);

        scanner.restore();
        expect(root.querySelector('p')?.textContent).toBe('  Get started today  ');
    });

    it('clears the translated markers on restore', async () => {
        const root = mount(`<h1 data-mrx-surface="hero">Welcome aboard</h1>`);
        const scanner = createL2Scanner({ root, target: 'fr', translate: okTranslator() });
        await scanner.scan();
        expect(root.querySelector('h1')?.hasAttribute(TRANSLATED_ATTR)).toBe(true);

        scanner.restore();
        expect(root.querySelector('h1')?.hasAttribute(TRANSLATED_ATTR)).toBe(false);
        expect(root.querySelector('h1')?.hasAttribute(TRANSLATED_LANG_ATTR)).toBe(false);
    });

    it('restores aria-label and title', async () => {
        const root = mount(`<button data-mrx-surface="hero" aria-label="Get started" title="Go">Get started</button>`);
        const scanner = createL2Scanner({ root, target: 'fr', translate: okTranslator() });
        await scanner.scan();
        scanner.restore();
        const button = root.querySelector('button');
        expect(button?.getAttribute('aria-label')).toBe('Get started');
        expect(button?.getAttribute('title')).toBe('Go');
    });

    it('is idempotent', async () => {
        const root = mount(`<h1 data-mrx-surface="hero">Welcome aboard</h1>`);
        const scanner = createL2Scanner({ root, target: 'fr', translate: okTranslator() });
        await scanner.scan();
        scanner.restore();
        scanner.restore();
        expect(root.querySelector('h1')?.textContent).toBe('Welcome aboard');
    });

    it('allows a re-scan after restore', async () => {
        const root = mount(`<h1 data-mrx-surface="hero">Welcome aboard</h1>`);
        const scanner = createL2Scanner({ root, target: 'fr', translate: okTranslator() });
        await scanner.scan();
        scanner.restore();

        const translate = okTranslator('DE:');
        await createL2Scanner({ root, target: 'de', translate }).scan();
        expect(root.querySelector('h1')?.textContent).toBe('DE:Welcome aboard');
    });

    it('restores nested surfaces correctly', async () => {
        const root = mount(`
            <div data-mrx-surface="public-content">
                Outer text
                <span data-mrx-surface="hero">Inner text</span>
            </div>
        `);
        const scanner = createL2Scanner({ root, target: 'fr', translate: okTranslator() });
        await scanner.scan();
        scanner.restore();
        expect(root.querySelector('span')?.textContent).toBe('Inner text');
        expect(root.textContent).toContain('Outer text');
    });
});
