/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  lib/translation/scanner.ts — T3 integration (client side)
 *
 *  The approved D-10 **L2 inline** scanner: machine-translates the text of
 *  explicitly marked, public presentation surfaces into a runtime target
 *  language, and puts the original English back when the target is cleared.
 *
 *  ── Scope discipline (this is L2 inline and nothing else) ───────────────────
 *  · DENY BY DEFAULT. A node is a candidate only if an ancestor-or-self
 *    carries `data-mrx-surface="<a valid surface>"`. Nothing is translated
 *    because of what it looks like; only an explicit opt-in marker qualifies.
 *    Unmarked content — including every L1 string rendered through
 *    PreferencesProvider's `content` / `t()` — is therefore never touched.
 *  · TEXT NODES AND ACCESSIBLE NAMES ONLY. Element attributes are not
 *    rewritten except `aria-label` and `title`, because leaving a visible label
 *    translated while its accessible name stayed English is an accessibility
 *    defect. No other attribute, and no `value`/`placeholder`, is modified.
 *  · NO ARCHITECTURAL CHANGE. This module does not touch the L1 `t()`
 *    architecture, the language enum, the dictionaries, the middleware, or the
 *    URL. Switching a runtime target on or off is entirely a client concern.
 *
 *  ── Why the original text is always recoverable ─────────────────────────────
 *  Every value this scanner writes is recorded before it is overwritten, so
 *  `restore()` returns the document to byte-identical English. That is what
 *  makes it safe to run speculatively: a failed or refused translation leaves
 *  the canonical English in place rather than blank, partial or wrong text.
 *
 *  ── Cost discipline ────────────────────────────────────────────────────────
 *  The route accepts ONE string per request and the endpoint is rate limited to
 *  TRANSLATION_RATE_LIMIT requests per minute per IP. This scanner therefore
 *  de-duplicates identical strings, serves repeats from the cache, and takes a
 *  hard `maxRequests` cap per pass; anything over the cap is reported as
 *  `deferred` instead of being silently dropped. Scaling L2 to page level needs
 *  a batch verb on the route, which is a later phase and not assumed here.
 * ═══════════════════════════════════════════════════════════════════════════
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

/** Attributes rewritten on a marked element so accessible names follow the visible text. */
export const L2_TRANSLATABLE_ATTRIBUTES = ['aria-label', 'title'] as const;

/**
 * Structural deny-list. A text node inside any of these is never translated:
 * code and preformatted text must stay verbatim, form control values are not
 * text, vector/markup subtrees are not prose, and editable or explicitly
 * untranslatable regions are the user's or the author's decision.
 */
export const L2_SKIP_SELECTOR = [
    'script',
    'style',
    'noscript',
    'template',
    'code',
    'pre',
    'kbd',
    'samp',
    'textarea',
    'input',
    'select',
    'option',
    'optgroup',
    'svg',
    'math',
    '[translate="no"]',
    '[contenteditable]:not([contenteditable="false"])',
    '[data-mrx-surface="none"]',
].join(',');

const HAS_LETTER = /\p{L}/u;
/** Digits, units, punctuation and whitespace only — e.g. "1024", "50 %". */
const NO_PROSE = /^[\p{N}\s.,:%°+\-–—/×÷()[\]#*&'"_|~^$@=<>?!\\]*$/u;
/** Short all-caps tokens are acronyms or units ("FAQ", "USD", "mg"). */
const SHORT_ALL_CAPS = /^[A-Z0-9&.-]{1,3}$/;
/** A number with only a short trailing unit token — "3.5 mg", "2.5 kg", "10 mg". */
const NUMBER_WITH_SHORT_UNIT = /^[\p{N}\s.,:%°/×÷()\-–—]+[^\W\d_]{1,3}$/u;

export type L2TextPredicate = (text: string) => boolean;

/**
 * Conservative eligibility test. Every rejection reason is a real failure mode
 * of machine-translating page copy: mangled brand tokens, corrupted numbers and
 * units, and nonsense output from two-letter fragments.
 */
export const defaultL2TextPredicate: L2TextPredicate = (text: string): boolean => {
    const trimmed = text.trim();
    if (trimmed.length < L2_MIN_TRANSLATABLE_CHARS) return false;
    if (text.length > MAX_SOURCE_CHARS) return false;
    if (!HAS_LETTER.test(trimmed)) return false;
    if (NO_PROSE.test(trimmed)) return false;
    if (SHORT_ALL_CAPS.test(trimmed)) return false;
    // A measurement is not prose: providers routinely corrupt "3.5 mg". A short
    // alphabetic run after a number is a unit, whereas a real word ("5 items")
    // is long enough to clear this test and stays translatable.
    if (NUMBER_WITH_SHORT_UNIT.test(trimmed)) return false;
    return true;
};

export type L2TranslateOutcome =
    | { readonly ok: true; readonly text: string; readonly fromCache?: boolean }
    | { readonly ok: false; readonly code: string; readonly retryable: boolean };

export type L2TranslateFn = (
    text: string,
    surface: TranslationSurface
) => Promise<L2TranslateOutcome>;

type TextCandidate = {
    readonly kind: 'text';
    readonly node: Text;
    readonly original: string;
    readonly surface: TranslationSurface;
};

type AttrCandidate = {
    readonly kind: 'attr';
    readonly element: Element;
    readonly attribute: string;
    readonly original: string;
    readonly surface: TranslationSurface;
};

type Candidate = TextCandidate | AttrCandidate;

export type L2ScanReport = {
    /** Candidate instances whose text was replaced. */
    readonly applied: number;
    /** Unique strings served from cache without a request. */
    readonly cacheHits: number;
    /** Network requests actually issued. */
    readonly requests: number;
    /** Unique strings skipped because the per-pass request cap was reached. */
    readonly deferred: number;
    /** Text nodes skipped because they sit outside a marked surface. */
    readonly skippedUnmarked: number;
    /** First failure seen, or null. Absent a failure every eligible node translated. */
    readonly failure: { readonly code: string; readonly retryable: boolean } | null;
};

export type L2ScanOptions = {
    readonly root: ParentNode;
    readonly target: string;
    readonly translate: L2TranslateFn;
    /** Hard cap on network requests per pass. Defaults to 8, under the 10/min limit. */
    readonly maxRequests?: number;
    readonly isTranslatableText?: L2TextPredicate;
};

export const L2_DEFAULT_MAX_REQUESTS = 8;

function isValidSurface(value: string | null): value is TranslationSurface {
    return value !== null && (TRANSLATION_SURFACES as readonly string[]).includes(value);
}

/** Nearest ancestor-or-self carrying a valid surface marker. */
function markedSurfaceOf(element: Element | null): { owner: Element; surface: TranslationSurface } | null {
    let current: Element | null = element;
    while (current) {
        const value = current.getAttribute(SURFACE_ATTR);
        if (isValidSurface(value)) {
            return { owner: current, surface: value };
        }
        if (value !== null) return null;
        current = current.parentElement;
    }
    return null;
}

/** True when the text node, or anything between it and its marked owner, is deny-listed. */
function crossesSkippedAncestor(node: Text, owner: Element): boolean {
    let current: Element | null = node.parentElement;
    while (current) {
        if (current.matches?.(L2_SKIP_SELECTOR)) return true;
        // The owner is checked too, so a marked element that is itself
        // `translate="no"` or `contenteditable` is still respected.
        if (current === owner) return false;
        current = current.parentElement;
    }
    return false;
}

function splitAffixes(text: string): { leading: string; trailing: string } {
    const leading = /^\s*/.exec(text)?.[0] ?? '';
    const trailing = /\s*$/.exec(text)?.[0] ?? '';
    return { leading, trailing };
}

export type L2Scanner = {
    collect(): { candidates: Candidate[]; unmarked: number };
    scan(): Promise<L2ScanReport>;
    restore(): void;
    readonly changedCount: number;
};

export function createL2Scanner(options: L2ScanOptions): L2Scanner {
    const { root, target, translate } = options;
    const maxRequests = Math.max(0, options.maxRequests ?? L2_DEFAULT_MAX_REQUESTS);
    const isTranslatableText = options.isTranslatableText ?? defaultL2TextPredicate;

    /** original value -> every place it must be written. */
    const pending = new Map<string, { text: TextCandidate[]; attrs: AttrCandidate[]; surface: TranslationSurface }>();
    /** One entry per written value, carrying both directions so restore() is exact. */
    const written: { readonly apply: () => void; readonly revert: () => void }[] = [];

    function collect(): { candidates: Candidate[]; unmarked: number } {
        const candidates: Candidate[] = [];
        let unmarked = 0;

        const document = root.ownerDocument ?? (root as Document);
        if (!document || typeof document.createTreeWalker !== 'function') {
            return { candidates, unmarked };
        }

        const walker = document.createTreeWalker(root, 0x4 /* NodeFilter.SHOW_TEXT */);
        let current = walker.nextNode();
        while (current) {
            const node = current as Text;
            const marked = markedSurfaceOf(node.parentElement);
            if (!marked) {
                if ((node.data ?? '').trim().length > 0) unmarked += 1;
            } else if (
                marked.owner.getAttribute(TRANSLATED_ATTR) !== target &&
                !crossesSkippedAncestor(node, marked.owner) &&
                isTranslatableText(node.data ?? '')
            ) {
                candidates.push({
                    kind: 'text',
                    node,
                    original: node.data,
                    surface: marked.surface,
                });
            }
            current = walker.nextNode();
        }

        for (const attribute of L2_TRANSLATABLE_ATTRIBUTES) {
            for (const element of Array.from(root.querySelectorAll?.(`[${SURFACE_ATTR}]`) ?? [])) {
                const marked = markedSurfaceOf(element);
                if (!marked || marked.owner !== element) continue;
                if (element.getAttribute(TRANSLATED_ATTR) === target) continue;
                const value = element.getAttribute(attribute);
                if (value === null || !isTranslatableText(value)) continue;
                candidates.push({
                    kind: 'attr',
                    element,
                    attribute,
                    original: value,
                    surface: marked.surface,
                });
            }
        }

        return { candidates, unmarked };
    }

    async function scan(): Promise<L2ScanReport> {
        const { candidates, unmarked } = collect();
        pending.clear();

        for (const candidate of candidates) {
            const key = candidate.original.trim();
            const bucket = pending.get(key);
            if (bucket) {
                if (candidate.kind === 'text') bucket.text.push(candidate);
                else bucket.attrs.push(candidate);
                continue;
            }
            pending.set(key, {
                text: candidate.kind === 'text' ? [candidate] : [],
                attrs: candidate.kind === 'attr' ? [candidate] : [],
                surface: candidate.surface,
            });
        }

        let cacheHits = 0;
        let requests = 0;
        let deferred = 0;
        let failure: L2ScanReport['failure'] = null;

        for (const [key, bucket] of pending) {
            if (requests >= maxRequests) {
                deferred += 1;
                continue;
            }
            const outcome = await translate(key, bucket.surface);
            // A cache hit costs no provider budget, so it must not consume the
            // per-pass request cap; the accounting happens after the call.
            if (outcome.ok && outcome.fromCache) {
                cacheHits += 1;
            } else {
                requests += 1;
            }
            if (!outcome.ok) {
                if (!failure) failure = { code: outcome.code, retryable: outcome.retryable };
                continue;
            }
            const translated = outcome.text;
            if (!translated) continue;

            for (const candidate of bucket.text) {
                const { leading, trailing } = splitAffixes(candidate.original);
                written.push({
                    apply: () => {
                        candidate.node.data = `${leading}${translated}${trailing}`;
                    },
                    revert: () => {
                        candidate.node.data = candidate.original;
                    },
                });
            }
            for (const candidate of bucket.attrs) {
                written.push({
                    apply: () => {
                        candidate.element.setAttribute(candidate.attribute, translated);
                    },
                    revert: () => {
                        candidate.element.setAttribute(candidate.attribute, candidate.original);
                    },
                });
            }
            for (const candidate of [...bucket.text, ...bucket.attrs]) {
                const owner = candidate.kind === 'text' ? candidate.node.parentElement : candidate.element;
                const marked = markedSurfaceOf(owner);
                if (marked) {
                    marked.owner.setAttribute(TRANSLATED_ATTR, target);
                    marked.owner.setAttribute(TRANSLATED_LANG_ATTR, target);
                }
            }
        }

        for (const entry of written) entry.apply();

        return {
            applied: written.length,
            cacheHits,
            requests,
            deferred,
            skippedUnmarked: unmarked,
            failure,
        };
    }

    /**
     * Returns the document to byte-identical English and clears the translated
     * markers, so a later scan (or a different target) starts from clean text.
     */
    function restore(): void {
        for (let index = written.length - 1; index >= 0; index -= 1) {
            written[index].revert();
        }
        written.length = 0;
        for (const element of Array.from(root.querySelectorAll?.(`[${TRANSLATED_ATTR}]`) ?? [])) {
            element.removeAttribute(TRANSLATED_ATTR);
            element.removeAttribute(TRANSLATED_LANG_ATTR);
        }
    }

    return {
        collect,
        scan,
        restore,
        get changedCount() {
            return written.length;
        },
    };
}
