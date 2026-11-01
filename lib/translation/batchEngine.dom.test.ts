import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createT2BatchEngine } from './batchEngine';
import { TranslationCache } from './cache';

const IDENTITY = { engineVersion: 'v1', glossaryVersion: 'mrx-core-v1', providerId: 'mock-google', modelIdentifier: 'general/nmt' };
function json(body: unknown, status = 200): Response { return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } }); }
function mount(html: string): HTMLElement { document.body.innerHTML = html; return document.body; }
function fetchFor(handler?: (items: { id: string; sourceText: string }[]) => unknown) {
    return vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
        if (init?.method === 'GET') return json({ ok: true, token: 'signed', expiresInMs: 60_000 });
        const body = JSON.parse(String(init?.body)) as { items: { id: string; sourceText: string }[]; targetLanguage: string };
        return json(handler?.(body.items) ?? {
            ok: true, sourceLanguage: 'en', targetLanguage: body.targetLanguage, surface: 'public-content', identity: IDENTITY,
            items: body.items.map((item) => ({ id: item.id, translatedText: `DE:${item.sourceText}` })),
        });
    });
}
beforeEach(() => { document.body.innerHTML = ''; });

describe('T2 client batch engine', () => {
    it('extracts only marked content, deduplicates it and sends one bounded batch', async () => {
        const root = mount('<div data-mrx-surface="public-content"><p>Welcome home</p><p>Welcome home</p></div><p>Private profile text</p>');
        const fetchImpl = fetchFor();
        const report = await createT2BatchEngine({ root, target: 'de', routePath: '/about', sourceLocale: 'en', cache: new TranslationCache(), identity: null, fetchImpl: fetchImpl as never }).scan();
        expect(report.applied).toBe(2);
        expect(root.textContent).toContain('DE:Welcome home');
        expect(root.textContent).toContain('Private profile text');
        const post = fetchImpl.mock.calls.find(([, init]) => (init as RequestInit)?.method === 'POST')!;
        expect((JSON.parse(String((post[1] as RequestInit).body)) as { items: unknown[] }).items).toHaveLength(1);
    });

    it('uses cache hits and sends only misses', async () => {
        const cache = new TranslationCache();
        cache.set({ sourceLanguage: 'en', targetLanguage: 'de', sourceText: 'Cached sentence', identity: IDENTITY }, ['DE:CACHED']);
        const root = mount('<div data-mrx-surface="public-content"><p>Cached sentence</p><p>New sentence</p></div>');
        const fetchImpl = fetchFor();
        const report = await createT2BatchEngine({ root, target: 'de', routePath: '/about', sourceLocale: 'en', cache, identity: IDENTITY, fetchImpl: fetchImpl as never }).scan();
        expect(report.cacheHits).toBe(1);
        expect(root.textContent).toContain('DE:CACHED');
        const post = fetchImpl.mock.calls.find(([, init]) => (init as RequestInit)?.method === 'POST')!;
        expect((JSON.parse(String((post[1] as RequestInit).body)) as { items: { sourceText: string }[] }).items.map((item) => item.sourceText)).toEqual(['New sentence']);
    });

    it.each([
        ['missing ID', (items: { id: string }[]) => items.slice(0, -1)],
        ['duplicate ID', (items: { id: string }[]) => [...items, items[0]]],
        ['unexpected ID', (items: { id: string }[]) => [...items.slice(1), { ...items[0], id: 'unexpected' }]],
    ])('leaves all English intact for %s', async (_label, mutate) => {
        const root = mount('<div data-mrx-surface="public-content"><p>First sentence</p><p>Second sentence</p></div>');
        const fetchImpl = fetchFor((items) => ({ ok: true, sourceLanguage: 'en', targetLanguage: 'de', surface: 'public-content', identity: IDENTITY, items: mutate(items).map((item) => ({ id: item.id, translatedText: 'DE:X' })) }));
        const report = await createT2BatchEngine({ root, target: 'de', routePath: '/about', sourceLocale: 'en', cache: new TranslationCache(), identity: null, fetchImpl: fetchImpl as never }).scan();
        expect(report.failure?.code).toBe('INVALID_BATCH_IDS');
        expect(root.textContent).toContain('First sentence');
        expect(root.textContent).toContain('Second sentence');
        expect(root.textContent).not.toContain('DE:X');
    });

    it('does not process Arabic canonical content', async () => {
        const root = mount('<p data-mrx-surface="public-content">محتوى عربي أصلي</p>');
        const fetchImpl = fetchFor();
        const report = await createT2BatchEngine({ root, target: 'de', routePath: '/about', sourceLocale: 'ar', cache: new TranslationCache(), identity: null, fetchImpl: fetchImpl as never }).scan();
        expect(report.failure?.code).toBe('INVALID_SOURCE_LANGUAGE');
        expect(fetchImpl).not.toHaveBeenCalled();
        expect(root.textContent).toBe('محتوى عربي أصلي');
    });

    it('does not apply a stale response after the source node changes', async () => {
        const root = mount('<p data-mrx-surface="public-content">Original English</p>');
        let release!: (response: Response) => void;
        const fetchImpl = vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
            if (init?.method === 'GET') return json({ ok: true, token: 'signed', expiresInMs: 60_000 });
            return new Promise<Response>((resolve) => { release = resolve; });
        });
        const scanner = createT2BatchEngine({ root, target: 'de', routePath: '/about', sourceLocale: 'en', cache: new TranslationCache(), identity: null, fetchImpl: fetchImpl as never });
        const pending = scanner.scan();
        await vi.waitFor(() => expect(release).toBeTypeOf('function'));
        root.querySelector('p')!.firstChild!.textContent = 'React changed source';
        release(json({ ok: true, sourceLanguage: 'en', targetLanguage: 'de', surface: 'public-content', identity: IDENTITY, items: [{ id: 't2-0', translatedText: 'DE:STALE' }] }));
        const report = await pending;
        expect(report.failure?.code).toBe('STALE_TRANSLATION_RESULT');
        expect(root.textContent).toBe('React changed source');
    });

    it('leaves English unchanged when the session is expired or rejected', async () => {
        const root = mount('<p data-mrx-surface="public-content">Original English</p>');
        const fetchImpl = vi.fn(async () => json({ ok: false, error: { code: 'TRANSLATION_SESSION_EXPIRED', message: 'expired', retryable: false } }, 401));
        const report = await createT2BatchEngine({ root, target: 'de', routePath: '/about', sourceLocale: 'en', cache: new TranslationCache(), identity: null, fetchImpl: fetchImpl as never }).scan();
        expect(report.failure?.code).toBe('TRANSLATION_SESSION_EXPIRED');
        expect(root.textContent).toBe('Original English');
    });
    it('keeps all English when one surface batch fails', async () => {
        const root = mount('<h1 data-mrx-surface="hero">Hero English</h1><p data-mrx-surface="public-content">Body English</p>');
        let postCount = 0;
        const fetchImpl = vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
            if (init?.method === 'GET') return json({ ok: true, token: 'signed', expiresInMs: 60_000 });
            postCount += 1;
            if (postCount === 2) return json({ ok: false, error: { code: 'TIMEOUT', message: 'timeout', retryable: true } }, 504);
            const body = JSON.parse(String(init?.body)) as { items: { id: string }[] };
            return json({ ok: true, sourceLanguage: 'en', targetLanguage: 'de', surface: 'hero', identity: IDENTITY, items: body.items.map((item) => ({ id: item.id, translatedText: 'DE:HERO' })) });
        });
        const report = await createT2BatchEngine({ root, target: 'de', routePath: '/about', sourceLocale: 'en', cache: new TranslationCache(), identity: null, fetchImpl: fetchImpl as never }).scan();
        expect(report.failure?.code).toBe('TIMEOUT');
        expect(root.textContent).toContain('Hero English');
        expect(root.textContent).toContain('Body English');
    });
});