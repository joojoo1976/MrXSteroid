'use client';

/**
 * components/tools/r6/R6ToolShell.tsx
 * One route-level shell for every R6.1 tool.
 *
 * It adds, without editing the tool body:
 * - C1–C12 result boxes (unless the tool already renders its own)
 * - EMPTY / PARTIAL / FULL badge derived from the rendered fields
 * - one accessible tooltip layer for every field
 * - a slider upgrade for fields explicitly tagged (data-r6-slider)
 *
 * Nothing here writes to storage, the network, or the database.
 */
import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import { DynamicStateBadge, type DynamicState } from '@/components/tools/DynamicStateBadge';
import { ResultBoxes } from '@/components/tools/ResultBoxes';
import { useToolDisplayPreferences } from '@/components/tools/useToolDisplayPreferences';
import { buildR6Boxes, type R6BoxSource } from '@/lib/tools/r6/boxes';
import type { R6ManifestEntry } from '@/lib/tools/r6/manifest';

type FieldElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

interface R6ToolShellProps {
  entry: R6ManifestEntry;
  locale?: 'ar' | 'en';
  children: React.ReactNode;
}

interface TipState {
  title: string;
  description: string;
  source: R6BoxSource;
  rect: DOMRect;
}

const SOURCE_LABELS: Record<R6BoxSource, { en: string; ar: string }> = {
  engine: { en: 'From deterministic engine', ar: 'من المحرك الحتمي' },
  static: { en: 'Static explanation', ar: 'شرح ثابت' },
  not_available: { en: 'Unavailable in this tool', ar: 'غير متاح في هذه الأداة' },
};

function isFieldElement(node: EventTarget | null): node is FieldElement {
  if (!(node instanceof HTMLElement)) return false;
  if (node instanceof HTMLInputElement) {
    const type = node.type;
    if (type === 'hidden' || type === 'button' || type === 'submit' || type === 'reset' || type === 'image') {
      return false;
    }
  }
  return node.matches('input, select, textarea');
}

function cleanLabel(value: string | null | undefined): string {
  return (value ?? '')
    .replace(/\s+/g, ' ')
    .replace(/\s*\*\s*$/, '')
    .replace(/\s*:\s*$/, '')
    .replace(/^(help|مساعدة)\s*:?\s*/i, '')
    .trim()
    .slice(0, 90);
}

function fieldLabel(el: FieldElement): string {
  const aria = cleanLabel(el.getAttribute('aria-label'));
  if (aria) return aria;

  const labelledBy = el.getAttribute('aria-labelledby');
  if (labelledBy) {
    const text = labelledBy
      .split(/\s+/)
      .map((id) => document.getElementById(id)?.textContent ?? '')
      .join(' ');
    const cleaned = cleanLabel(text);
    if (cleaned) return cleaned;
  }

  if (el instanceof HTMLInputElement && el.labels && el.labels.length > 0) {
    const text = cleanLabel(el.labels[0].textContent);
    if (text) return text;
  }

  const wrappingLabel = el.closest('label');
  if (wrappingLabel) {
    const text = cleanLabel(wrappingLabel.textContent);
    if (text) return text;
  }

  // Most existing tools place `<label>Systolic BP (mmHg):</label><input />`
  // as siblings without htmlFor. Use the nearest preceding label in the
  // field's own container so those fields still get a tooltip title.
  let sibling: Element | null = el.previousElementSibling;
  while (sibling) {
    if (sibling.tagName === 'LABEL') {
      const text = cleanLabel(sibling.textContent);
      if (text) return text;
    }
    sibling = sibling.previousElementSibling;
  }
  const container = el.parentElement;
  if (container) {
    const labelEl = Array.from(container.querySelectorAll('label')).find((label) => {
      const position = el.compareDocumentPosition(label);
      return Boolean(position & Node.DOCUMENT_POSITION_PRECEDING);
    });
    if (labelEl) {
      const text = cleanLabel(labelEl.textContent);
      if (text) return text;
    }
  }

  const named = cleanLabel(el.getAttribute('name'));
  if (named) return named;

  return cleanLabel(el.getAttribute('placeholder'));
}

function isVisible(el: HTMLElement): boolean {
  if (el.hidden) return false;
  if (el.getAttribute('aria-hidden') === 'true') return false;
  if (el.getClientRects().length > 0) return true;
  // jsdom (tests) reports no client rects; fall back to computed style.
  if (typeof window === 'undefined') return false;
  const style = window.getComputedStyle(el);
  return style.display !== 'none' && style.visibility !== 'hidden';
}

function isFilled(el: FieldElement): boolean {
  if (el instanceof HTMLInputElement) {
    if (el.type === 'checkbox' || el.type === 'radio') return el.checked;
    return el.value.trim() !== '';
  }
  if (el instanceof HTMLSelectElement) return el.value !== '';
  return el.value.trim() !== '';
}

function fieldElements(root: HTMLElement): FieldElement[] {
  return Array.from(root.querySelectorAll<FieldElement>('input, select, textarea')).filter(
    (el) => isFieldElement(el) && isVisible(el)
  );
}

let sliderStyleInjected = false;

function ensureSliderStyle(): void {
  if (sliderStyleInjected || typeof document === 'undefined') return;
  if (document.getElementById('r6-slider-style')) {
    sliderStyleInjected = true;
    return;
  }
  const style = document.createElement('style');
  style.id = 'r6-slider-style';
  style.textContent = `
.r6-slider{position:relative;padding-top:1.35rem;margin-top:.35rem;}
.r6-slider__bubble{position:absolute;top:0;transform:translateX(-50%);border-radius:.375rem;background:#18181b;color:#fafafa;font-size:.7rem;font-weight:700;line-height:1;padding:.3rem .45rem;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,.35);}
.r6-slider__range{-webkit-appearance:none;appearance:none;width:100%;height:6px;border-radius:9999px;outline:none;background:linear-gradient(to right,#eab308 0%,#eab308 var(--r6-fill,0%),#3f3f46 var(--r6-fill,0%),#3f3f46 100%);}
.r6-slider__range::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:18px;height:18px;border-radius:50%;background:#fff;border:3px solid #eab308;box-shadow:0 1px 4px rgba(0,0,0,.4);cursor:pointer;}
.r6-slider__range::-moz-range-thumb{width:18px;height:18px;border-radius:50%;background:#fff;border:3px solid #eab308;box-shadow:0 1px 4px rgba(0,0,0,.4);cursor:pointer;}
.r6-slider__native{accent-color:#eab308;}
.r6-slider__ticks{display:flex;justify-content:space-between;margin-top:.2rem;padding:0 .15rem;}
.r6-slider__ticks span{display:block;width:1px;height:4px;background:#71717a;}
`;
  document.head.appendChild(style);
  sliderStyleInjected = true;
}

function setNativeValue(el: HTMLInputElement, value: string): void {
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
  if (setter) setter.call(el, value);
  else el.value = value;
  el.dispatchEvent(new Event('input', { bubbles: true }));
  el.dispatchEvent(new Event('change', { bubbles: true }));
}

export function R6ToolShell({ entry, locale: localeProp, children }: R6ToolShellProps) {
  const preferences = useToolDisplayPreferences();
  const locale: 'ar' | 'en' = preferences?.locale ?? localeProp ?? 'en';
  const isAr = locale === 'ar';

  const rootRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const activeFieldRef = useRef<FieldElement | null>(null);
  const previousDescribedByRef = useRef<string | null>(null);
  const tipId = useId();

  const [tip, setTip] = useState<TipState | null>(null);
  const [dynamic, setDynamic] = useState<{ state: DynamicState; missing: string[] }>({
    state: 'partial',
    missing: [],
  });

  const closeTip = useCallback(() => {
    const active = activeFieldRef.current;
    if (active) {
      active.removeAttribute('data-r6-tip-open');
      active.setAttribute('aria-expanded', 'false');
      if (previousDescribedByRef.current) active.setAttribute('aria-describedby', previousDescribedByRef.current);
      else active.removeAttribute('aria-describedby');
    }
    activeFieldRef.current = null;
    previousDescribedByRef.current = null;
    setTip(null);
  }, []);

  const openTip = useCallback(
    (field: FieldElement) => {
      if (!isFieldElement(field) || !isVisible(field)) return;
      const title = fieldLabel(field);
      if (!title) return; // never show empty copy

      const explicitDescription = cleanLabel(
        field.getAttribute('data-r6-tip') ?? field.getAttribute('title')
      );
      const sourceAttr = field.getAttribute('data-r6-source');
      const source: R6BoxSource =
        sourceAttr === 'engine' || sourceAttr === 'static' || sourceAttr === 'not_available'
          ? sourceAttr
          : 'static';

      const description =
        explicitDescription ||
        (isAr
          ? `${title} — إدخال لأداة ${entry.titleAr}. تتم المعالجة محلياً دون تخزين أو إرسال.`
          : `${title} — input for ${entry.titleEn}. Processed locally by the tool; nothing is stored or sent.`);

      const active = activeFieldRef.current;
      if (active && active !== field) {
        active.removeAttribute('data-r6-tip-open');
        active.setAttribute('aria-expanded', 'false');
        if (previousDescribedByRef.current) active.setAttribute('aria-describedby', previousDescribedByRef.current);
        else active.removeAttribute('aria-describedby');
      }

      previousDescribedByRef.current = field.getAttribute('aria-describedby');
      field.setAttribute('aria-describedby', tipId);
      field.setAttribute('aria-expanded', 'true');
      field.setAttribute('data-r6-tip-open', 'true');
      activeFieldRef.current = field;
      setTip({ title, description, source, rect: field.getBoundingClientRect() });
    },
    [entry.titleAr, entry.titleEn, isAr, tipId]
  );

  // Tooltip wiring: hover, tap, focus, Enter/Space, Esc, click-outside.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const onPointerOver = (event: PointerEvent) => {
      const field = event.target;
      if (isFieldElement(field)) openTip(field);
    };
    const onPointerDown = (event: PointerEvent) => {
      const field = event.target;
      if (isFieldElement(field)) openTip(field);
    };
    const onFocusIn = (event: FocusEvent) => {
      const field = event.target;
      if (isFieldElement(field)) openTip(field);
    };
    const onFocusOut = (event: FocusEvent) => {
      const next = event.relatedTarget;
      if (next instanceof Node && (root.contains(next) || tooltipRef.current?.contains(next))) return;
      closeTip();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeTip();
        return;
      }
      if (event.key === 'Enter' || event.key === ' ') {
        const field = event.target;
        if (isFieldElement(field)) openTip(field);
      }
    };
    const onDocumentPointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (root.contains(target)) return;
      if (tooltipRef.current?.contains(target)) return;
      closeTip();
    };
    const onViewportChange = () => closeTip();

    root.addEventListener('pointerover', onPointerOver);
    root.addEventListener('pointerdown', onPointerDown);
    root.addEventListener('focusin', onFocusIn);
    root.addEventListener('focusout', onFocusOut);
    root.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onDocumentPointerDown, true);
    window.addEventListener('scroll', onViewportChange, true);
    window.addEventListener('resize', onViewportChange);

    return () => {
      root.removeEventListener('pointerover', onPointerOver);
      root.removeEventListener('pointerdown', onPointerDown);
      root.removeEventListener('focusin', onFocusIn);
      root.removeEventListener('focusout', onFocusOut);
      root.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onDocumentPointerDown, true);
      window.removeEventListener('scroll', onViewportChange, true);
      window.removeEventListener('resize', onViewportChange);
    };
  }, [closeTip, openTip]);

  // EMPTY / PARTIAL / FULL from the fields actually rendered by the tool.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    let frame = 0;
    const compute = () => {
      frame = 0;
      const elements = fieldElements(root);
      if (elements.length === 0) {
        // Reference/lookup tools have no inputs; never claim FULL.
        setDynamic({ state: 'partial', missing: [] });
        return;
      }

      const seenRadioGroups = new Set<string>();
      const counted: FieldElement[] = [];
      for (const el of elements) {
        if (el instanceof HTMLInputElement && el.type === 'radio') {
          const group = el.name || `radio-${counted.length}`;
          if (seenRadioGroups.has(group)) continue;
          seenRadioGroups.add(group);
        }
        counted.push(el);
      }

      const missing: string[] = [];
      let filled = 0;
      for (const el of counted) {
        if (isFilled(el)) {
          filled += 1;
        } else {
          const label = fieldLabel(el);
          if (label && !missing.includes(label)) missing.push(label);
        }
      }

      const state: DynamicState =
        filled === 0 ? 'empty' : filled === counted.length ? 'full' : 'partial';
      setDynamic({ state, missing: missing.slice(0, 4) });
    };

    const schedule = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(compute);
    };

    compute();
    const observer = new MutationObserver(schedule);
    observer.observe(root, { childList: true, subtree: true });
    root.addEventListener('input', schedule, true);
    root.addEventListener('change', schedule, true);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      observer.disconnect();
      root.removeEventListener('input', schedule, true);
      root.removeEventListener('change', schedule, true);
    };
  }, []);

  // Slider upgrade for explicitly tagged fields only (no guessed ranges).
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    ensureSliderStyle();
    let frame = 0;
    const created = new Set<HTMLElement>();

    const enhance = () => {
      frame = 0;
      const fields = Array.from(root.querySelectorAll<HTMLInputElement>('input[data-r6-slider]'));
      for (const field of fields) {
        if (field.dataset.r6SliderReady === 'true') continue;
        if (!isVisible(field)) continue;

        const isRange = field.type === 'range';
        const min = Number(field.getAttribute('min') ?? (isRange ? field.min : '0'));
        const max = Number(field.getAttribute('max') ?? (isRange ? field.max : '100'));
        const step = Number(field.getAttribute('step') ?? (isRange ? field.step : '1')) || 1;
        if (!Number.isFinite(min) || !Number.isFinite(max) || max <= min) continue;

        const label = fieldLabel(field);
        const wrapper = document.createElement('div');
        wrapper.className = 'r6-slider';
        wrapper.setAttribute('data-r6-slider-control', field.id || label || 'field');

        const bubble = document.createElement('span');
        bubble.className = 'r6-slider__bubble';
        bubble.setAttribute('aria-hidden', 'true');
        wrapper.appendChild(bubble);

        let range: HTMLInputElement | null = null;
        const syncVisual = (value: number) => {
          const clamped = Math.min(max, Math.max(min, Number.isFinite(value) ? value : min));
          const pct = ((clamped - min) / (max - min)) * 100;
          bubble.style.left = `${Math.min(97, Math.max(3, pct))}%`;
          bubble.textContent = `${clamped}`;
          if (range) {
            range.value = String(clamped);
            range.style.setProperty('--r6-fill', `${pct}%`);
          }
        };

        let rangeControl: HTMLInputElement | null = null;
        if (!isRange) {
          rangeControl = document.createElement('input');
          rangeControl.type = 'range';
          rangeControl.min = String(min);
          rangeControl.max = String(max);
          rangeControl.step = String(step);
          rangeControl.className = 'r6-slider__range';
          rangeControl.setAttribute('aria-label', isAr ? `شريط ${label}` : `${label} slider`);
          rangeControl.value = field.value !== '' ? field.value : String(min);
          rangeControl.addEventListener('input', () => {
            setNativeValue(field, rangeControl?.value ?? '');
            syncVisual(Number(rangeControl?.value ?? min));
          });
          wrapper.appendChild(rangeControl);
          range = rangeControl;
        } else {
          field.classList.add('r6-slider__native');
        }

        const ticks = document.createElement('div');
        ticks.className = 'r6-slider__ticks';
        ticks.setAttribute('aria-hidden', 'true');
        for (let i = 0; i < 5; i += 1) ticks.appendChild(document.createElement('span'));
        wrapper.appendChild(ticks);

        field.insertAdjacentElement('afterend', wrapper);
        field.dataset.r6SliderReady = 'true';
        created.add(wrapper);

        const syncFromNative = () => syncVisual(Number(field.value));
        field.addEventListener('input', syncFromNative);
        field.addEventListener('change', syncFromNative);
        syncFromNative();
      }
    };

    const schedule = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(enhance);
    };

    enhance();
    const observer = new MutationObserver(schedule);
    observer.observe(root, { childList: true, subtree: true });

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      observer.disconnect();
      for (const wrapper of created) wrapper.remove();
      for (const field of Array.from(root.querySelectorAll<HTMLInputElement>('input[data-r6-slider]'))) {
        delete field.dataset.r6SliderReady;
        field.classList.remove('r6-slider__native');
      }
    };
  }, [isAr]);

  const boxes = buildR6Boxes(entry, locale);
  const viewportWidth = typeof window === 'undefined' ? 1024 : window.innerWidth;
  const tipLeft = tip
    ? Math.min(Math.max(tip.rect.left + tip.rect.width / 2, 132), Math.max(132, viewportWidth - 132))
    : 0;
  const tipAbove = tip ? tip.rect.top > 130 : true;
  const tipTop = tip ? (tipAbove ? tip.rect.top - 10 : tip.rect.bottom + 10) : 0;

  return (
    <div ref={rootRef} data-r6-shell={entry.slug} data-r6-tool={entry.slug}>
      {children}

      {!entry.hasOwnBoxes && (
        <section className="mt-8 space-y-4" aria-label={isAr ? 'نتائج Genius' : 'Genius results'}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-semibold">{isAr ? 'نتائج Genius (12)' : 'Genius results (12)'}</h2>
            <DynamicStateBadge state={dynamic.state} locale={locale} missingFields={dynamic.missing} />
          </div>
          <ResultBoxes compact={false} locale={locale} boxes={boxes} />
        </section>
      )}

      {tip && (
        <div
          ref={tooltipRef}
          id={tipId}
          role="tooltip"
          data-r6-tooltip
          className={`fixed z-[120] w-72 max-w-[calc(100vw-1rem)] rounded-lg border border-amber-400 bg-white p-3 text-sm text-zinc-800 shadow-2xl dark:border-amber-500 dark:bg-zinc-900 dark:text-zinc-100 ${isAr ? 'text-right' : 'text-left'}`}
          style={{
            left: tipLeft,
            top: tipTop,
            transform: tipAbove ? 'translate(-50%, -100%)' : 'translate(-50%, 0)',
          }}
          onPointerDown={(event) => event.stopPropagation()}
        >
          <div className="mb-1 font-bold text-amber-700 dark:text-amber-400">{tip.title}</div>
          <div className="mb-2 text-zinc-700 dark:text-zinc-300">{tip.description}</div>
          <div className="flex items-center justify-between gap-2 border-t border-amber-200 pt-1 text-xs text-zinc-500 dark:border-amber-900 dark:text-zinc-400">
            <span>
              {isAr ? 'المصدر:' : 'Source:'} {SOURCE_LABELS[tip.source][isAr ? 'ar' : 'en']}
            </span>
            <button
              type="button"
              className="rounded border border-zinc-300 px-2 py-0.5 text-xs font-medium text-zinc-700 hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-400 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
              onClick={closeTip}
            >
              {isAr ? 'إغلاق' : 'Close'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default R6ToolShell;
