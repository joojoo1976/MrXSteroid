/**
 * Explicit-marker DOM adapter for the T2 English runtime translation engine.
 * Collection is deny-by-default and application is transactional: a failed
 * batch leaves every candidate at its original English value.
 */
import {
    MAX_SOURCE_CHARS,
    SURFACE_ATTR,
    TRANSLATED_ATTR,
    TRANSLATED_LANG_ATTR,
    TRANSLATION_SURFACES,
    type TranslationSurface,
} from '@/server/translation/contracts';

export const L2_MIN_TRANSLATABLE_CHARS = 2;
export const L2_TRANSLATABLE_ATTRIBUTES = ['aria-label', 'title'] as const;
export const L2_SKIP_SELECTOR = [
    'script', 'style', 'noscript', 'template', 'code', 'pre', 'kbd', 'samp',
    'textarea', 'input', 'select', 'option', 'optgroup', 'svg', 'math',
    '[translate="no"]', '[contenteditable]:not([contenteditable="false"])',
    '[data-mrx-surface="none"]',
].join(',');

const HAS_LETTER = /\p{L}/u;
const NO_PROSE = /^[\p{N}\s.,:%°+\-–—/×÷()[\]#*&'"_|~^$@=<>?!\\]*$/u;
const SHORT_ALL_CAPS = /^[A-Z0-9&.-]{1,3}$/;
const NUMBER_WITH_SHORT_UNIT = /^[\p{N}\s.,:%°/×÷()\-–—]+[^\W\d_]{1,3}$/u;
export type L2TextPredicate = (text: string) => boolean;
export const defaultL2TextPredicate: L2TextPredicate = (text) => {
    const trimmed = text.trim();
    return trimmed.length >= L2_MIN_TRANSLATABLE_CHARS &&
        text.length <= MAX_SOURCE_CHARS &&
        HAS_LETTER.test(trimmed) &&
        !NO_PROSE.test(trimmed) &&
        !SHORT_ALL_CAPS.test(trimmed) &&
        !NUMBER_WITH_SHORT_UNIT.test(trimmed);
};

export type L2TranslateOutcome =
    | { readonly ok: true; readonly text: string; readonly fromCache?: boolean }
    | { readonly ok: false; readonly code: string; readonly retryable: boolean };
export type L2TranslateFn = (text: string, surface: TranslationSurface) => Promise<L2TranslateOutcome>;
export type L2BatchItem = { readonly id: string; readonly text: string; readonly surface: TranslationSurface };
export type L2BatchTranslateOutcome =
    | { readonly ok: true; readonly outcomes: ReadonlyMap<string, L2TranslateOutcome> }
    | { readonly ok: false; readonly code: string; readonly retryable: boolean };
export type L2BatchTranslateFn = (items: readonly L2BatchItem[]) => Promise<L2BatchTranslateOutcome>;

type TextCandidate = { readonly kind: 'text'; readonly node: Text; readonly original: string; readonly surface: TranslationSurface };
type AttrCandidate = { readonly kind: 'attr'; readonly element: Element; readonly attribute: string; readonly original: string; readonly surface: TranslationSurface };
type Candidate = TextCandidate | AttrCandidate;
type Bucket = { text: TextCandidate[]; attrs: AttrCandidate[]; surface: TranslationSurface };

export type L2ScanReport = {
    readonly applied: number;
    readonly cacheHits: number;
    readonly requests: number;
    readonly deferred: number;
    readonly skippedUnmarked: number;
    readonly failure: { readonly code: string; readonly retryable: boolean } | null;
};
export type L2ScanOptions = {
    readonly root: ParentNode;
    readonly target: string;
    readonly translate?: L2TranslateFn;
    readonly translateBatch?: L2BatchTranslateFn;
    readonly maxRequests?: number;
    readonly isTranslatableText?: L2TextPredicate;
};
export const L2_DEFAULT_MAX_REQUESTS = 8;

function isValidSurface(value: string | null): value is TranslationSurface {
    return value !== null && (TRANSLATION_SURFACES as readonly string[]).includes(value);
}
function markedSurfaceOf(element: Element | null): { owner: Element; surface: TranslationSurface } | null {
    let current = element;
    while (current) {
        const value = current.getAttribute(SURFACE_ATTR);
        if (isValidSurface(value)) return { owner: current, surface: value };
        if (value !== null) return null;
        current = current.parentElement;
    }
    return null;
}
function crossesSkippedAncestor(node: Text, owner: Element): boolean {
    let current = node.parentElement;
    while (current) {
        if (current.matches?.(L2_SKIP_SELECTOR)) return true;
        if (current === owner) return false;
        current = current.parentElement;
    }
    return false;
}
function splitAffixes(text: string): { leading: string; trailing: string } {
    return { leading: /^\s*/.exec(text)?.[0] ?? '', trailing: /\s*$/.exec(text)?.[0] ?? '' };
}
function candidateCurrentValue(candidate: Candidate): string | null {
    return candidate.kind === 'text' ? candidate.node.data : candidate.element.getAttribute(candidate.attribute);
}
function currentMatchesOriginal(candidate: Candidate): boolean {
    const current = candidateCurrentValue(candidate);
    if (current === null) return false;
    return candidate.kind === 'text' ? current.trim() === candidate.original.trim() : current === candidate.original;
}

export type L2Scanner = {
    collect(): { candidates: Candidate[]; unmarked: number };
    scan(): Promise<L2ScanReport>;
    restore(): void;
    readonly changedCount: number;
};

export function createL2Scanner(options: L2ScanOptions): L2Scanner {
    if (!options.translate && !options.translateBatch) throw new Error('A translation adapter is required.');
    const isTranslatableText = options.isTranslatableText ?? defaultL2TextPredicate;
    const written: { candidate: Candidate; translated: string }[] = [];
    let generation = 0;

    function collect(): { candidates: Candidate[]; unmarked: number } {
        const candidates: Candidate[] = [];
        let unmarked = 0;
        const document = options.root.ownerDocument ?? (options.root as Document);
        if (!document || typeof document.createTreeWalker !== 'function') return { candidates, unmarked };
        const walker = document.createTreeWalker(options.root, 0x4);
        let current = walker.nextNode();
        while (current) {
            const node = current as Text;
            const marked = markedSurfaceOf(node.parentElement);
            if (!marked) {
                if (node.data.trim()) unmarked += 1;
            } else if (
                marked.owner.getAttribute(TRANSLATED_ATTR) !== options.target &&
                !crossesSkippedAncestor(node, marked.owner) &&
                isTranslatableText(node.data)
            ) {
                candidates.push({ kind: 'text', node, original: node.data, surface: marked.surface });
            }
            current = walker.nextNode();
        }
        for (const attribute of L2_TRANSLATABLE_ATTRIBUTES) {
            for (const element of Array.from(options.root.querySelectorAll?.(`[${SURFACE_ATTR}]`) ?? [])) {
                const marked = markedSurfaceOf(element);
                if (!marked || marked.owner !== element || element.getAttribute(TRANSLATED_ATTR) === options.target) continue;
                const value = element.getAttribute(attribute);
                if (value !== null && isTranslatableText(value)) {
                    candidates.push({ kind: 'attr', element, attribute, original: value, surface: marked.surface });
                }
            }
        }
        return { candidates, unmarked };
    }

    async function scan(): Promise<L2ScanReport> {
        const scanGeneration = ++generation;
        const { candidates, unmarked } = collect();
        const buckets = new Map<string, Bucket>();
        for (const candidate of candidates) {
            const key = `${candidate.surface}\u0000${candidate.original.trim()}`;
            const bucket = buckets.get(key);
            if (bucket) {
                if (candidate.kind === 'text') bucket.text.push(candidate);
                else bucket.attrs.push(candidate);
            }
            else buckets.set(key, {
                text: candidate.kind === 'text' ? [candidate] : [],
                attrs: candidate.kind === 'attr' ? [candidate] : [],
                surface: candidate.surface,
            });
        }
        const entries = [...buckets.entries()];
        const maxRequests = Math.max(0, options.maxRequests ?? L2_DEFAULT_MAX_REQUESTS);
        const selected = options.translateBatch ? entries : entries;
        let requests = 0;
        let cacheHits = 0;
        let failure: L2ScanReport['failure'] = null;
        const outcomes = new Map<string, L2TranslateOutcome>();

        if (options.translateBatch && selected.length > 0) {
            const batchItems = selected.map(([key, bucket], index) => ({ id: `t2-${index}`, text: key.split('\u0000')[1], surface: bucket.surface }));
            const result = await options.translateBatch(batchItems);
            requests = result.ok ? [...result.outcomes.values()].filter((item) => item.ok && !item.fromCache).length > 0 ? 1 : 0 : 1;
            if (!result.ok) failure = { code: result.code, retryable: result.retryable };
            else for (let index = 0; index < batchItems.length; index += 1) {
                const outcome = result.outcomes.get(batchItems[index].id);
                if (!outcome) { failure = { code: 'INVALID_BATCH_IDS', retryable: false }; break; }
                outcomes.set(selected[index][0], outcome);
                if (outcome.ok && outcome.fromCache) cacheHits += 1;
                if (!outcome.ok && !failure) failure = { code: outcome.code, retryable: outcome.retryable };
            }
        } else if (options.translate) {
            for (const [key, bucket] of selected) {
                if (requests >= maxRequests) break;
                const outcome = await options.translate(key.split('\u0000')[1], bucket.surface);
                outcomes.set(key, outcome);
                if (outcome.ok && outcome.fromCache) cacheHits += 1;
                else requests += 1;
                if (!outcome.ok && !failure) failure = { code: outcome.code, retryable: outcome.retryable };
            }
        }

        // Batch mode is all-or-English. A stale scan or any invalid/failing item
        // commits nothing. Single-item legacy mode preserves its prior semantics.
        if (scanGeneration !== generation || (options.translateBatch && failure)) {
            return { applied: 0, cacheHits, requests, deferred: entries.length - outcomes.size, skippedUnmarked: unmarked, failure: failure ?? { code: 'STALE_TRANSLATION_RESULT', retryable: true } };
        }
        const staged: { candidate: Candidate; translated: string }[] = [];
        for (const [key, bucket] of selected) {
            const outcome = outcomes.get(key);
            if (!outcome?.ok || !outcome.text) continue;
            for (const candidate of [...bucket.text, ...bucket.attrs]) {
                if (!currentMatchesOriginal(candidate)) {
                    if (options.translateBatch) return { applied: 0, cacheHits, requests, deferred: entries.length - outcomes.size, skippedUnmarked: unmarked, failure: { code: 'STALE_TRANSLATION_RESULT', retryable: true } };
                    continue;
                }
                staged.push({ candidate, translated: outcome.text });
            }
        }
        for (const entry of staged) {
            const candidate = entry.candidate;
            if (candidate.kind === 'text') {
                const { leading, trailing } = splitAffixes(candidate.original);
                candidate.node.data = `${leading}${entry.translated}${trailing}`;
            } else candidate.element.setAttribute(candidate.attribute, entry.translated);
            written.push(entry);
            const owner = candidate.kind === 'text' ? candidate.node.parentElement : candidate.element;
            const marked = markedSurfaceOf(owner);
            marked?.owner.setAttribute(TRANSLATED_ATTR, options.target);
            marked?.owner.setAttribute(TRANSLATED_LANG_ATTR, options.target);
        }
        return { applied: staged.length, cacheHits, requests, deferred: entries.length - outcomes.size, skippedUnmarked: unmarked, failure };
    }

    function restore(): void {
        generation += 1;
        for (let index = written.length - 1; index >= 0; index -= 1) {
            const { candidate } = written[index];
            if (candidate.kind === 'text') candidate.node.data = candidate.original;
            else candidate.element.setAttribute(candidate.attribute, candidate.original);
        }
        written.length = 0;
        for (const element of Array.from(options.root.querySelectorAll?.(`[${TRANSLATED_ATTR}]`) ?? [])) {
            element.removeAttribute(TRANSLATED_ATTR);
            element.removeAttribute(TRANSLATED_LANG_ATTR);
        }
    }
    return { collect, scan, restore, get changedCount() { return written.length; } };
}