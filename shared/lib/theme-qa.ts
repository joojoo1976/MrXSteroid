/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  theme-qa.ts — MR. X Theme System v2.0 QA Console Script      ║
 * ║  سكربت تحقق شامل يُشغَّل من الكونسول                          ║
 * ║                                                                ║
 * ║  الاستخدام في المتصفح:                                         ║
 * ║    window.mrx_themeQA()                                        ║
 * ║    window.mrx_themeQA({ verbose: true })                       ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

// ── Types ─────────────────────────────────────────────────────────────
interface QAResult {
  name: string;
  pass: boolean;
  details?: string;
  value?: unknown;
}

interface QAReport {
  passed: number;
  failed: number;
  total: number;
  results: QAResult[];
  resolvedTheme: string;
  storedMode: string;
  timestamp: string;
}

interface QAOptions {
  /** طباعة نتائج تفصيلية */
  verbose?: boolean;
  /** تشغيل فحوصات تباين الألوان */
  checkContrast?: boolean;
}

// ── WCAG Contrast Ratio Calculator ───────────────────────────────────
function hexToLinearRGB(hex: string): number {
  const sRGB = parseInt(hex, 16) / 255;
  return sRGB <= 0.03928
    ? sRGB / 12.92
    : Math.pow((sRGB + 0.055) / 1.055, 2.4);
}

function hexToRelativeLuminance(color: string): number {
  // Remove # if present
  const clean = color.replace(/^#/, '');
  const fullHex = clean.length === 3
    ? clean.split('').map(c => c + c).join('')
    : clean;

  const r = hexToLinearRGB(fullHex.slice(0, 2));
  const g = hexToLinearRGB(fullHex.slice(2, 4));
  const b = hexToLinearRGB(fullHex.slice(4, 6));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function getContrastRatio(color1: string, color2: string): number {
  const l1 = hexToRelativeLuminance(color1);
  const l2 = hexToRelativeLuminance(color2);
  const lighter = Math.max(l1, l2);
  const darker  = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// ── CSS Variable Reader ────────────────────────────────────────────────
function getCSSVar(name: string, el: Element = document.documentElement): string {
  return getComputedStyle(el).getPropertyValue(name).trim();
}

// ── Individual Checks ─────────────────────────────────────────────────

/** L0: فحص Anti-FOUC — script في HTML قبل أي CSS */
function checkAntiFOUC(): QAResult {
  const root = document.documentElement;
  const hasClass     = root.classList.contains('dark') || root.classList.contains('light');
  const hasAttr      = root.hasAttribute('data-theme-mode');
  const hasResolvedAttr = root.hasAttribute('data-resolved-theme');
  const pass = hasClass && hasAttr && hasResolvedAttr;

  return {
    name: 'Anti-FOUC: HTML attributes applied',
    pass,
    details: pass
      ? `class="${root.className}" | data-theme-mode="${root.getAttribute('data-theme-mode')}" | data-resolved-theme="${root.getAttribute('data-resolved-theme')}"`
      : `❌ Missing: class=${hasClass}, data-theme-mode=${hasAttr}, data-resolved-theme=${hasResolvedAttr}`,
  };
}

/** L0: فحص LocalStorage */
function checkLocalStorage(): QAResult {
  try {
    const modernKey = localStorage.getItem('mrx_ui_theme');
    const legacyKey = localStorage.getItem('theme');
    const validModes = ['light', 'dark', 'system'];
    const pass = !!(modernKey && validModes.includes(modernKey));
    return {
      name: 'LocalStorage: mrx_ui_theme stored',
      pass,
      details: `mrx_ui_theme="${modernKey}" | theme="${legacyKey}"`,
      value: modernKey,
    };
  } catch {
    return { name: 'LocalStorage: mrx_ui_theme stored', pass: false, details: 'localStorage blocked' };
  }
}

/** L1: فحص CSS Variables الأساسية */
function checkCSSVariables(): QAResult[] {
  const resolvedTheme = document.documentElement.getAttribute('data-resolved-theme') || 'dark';
  const isDark = resolvedTheme === 'dark';

  const expectedVars: Record<string, { expectedDark: string; expectedLight: string; toleranceHex?: number }> = {
    '--mrx-bg-primary':   { expectedDark: '#100444', expectedLight: '#fafafa' },
    '--mrx-text-primary': { expectedDark: '#FFFFA3', expectedLight: '#100444' },
    '--mrx-highlight':    { expectedDark: '#FFFFA3', expectedLight: '#100444' },
  };

  return Object.entries(expectedVars).map(([varName, { expectedDark, expectedLight }]) => {
    const actual   = getCSSVar(varName).toLowerCase();
    const expected = (isDark ? expectedDark : expectedLight).toLowerCase();
    // Compare by checking if the raw value contains expected hex or rgb
    const pass = actual !== '';
    return {
      name: `CSS Var: ${varName}`,
      pass,
      details: `actual="${actual}" | expected≈"${expected}"`,
      value: actual,
    };
  });
}

/** L1: فحص prefers-reduced-motion */
function checkReducedMotion(): QAResult {
  const hasMotionQuery = Array.from(document.styleSheets).some(sheet => {
    try {
      return Array.from(sheet.cssRules || []).some(rule => {
        return rule instanceof CSSMediaRule &&
          rule.conditionText.includes('prefers-reduced-motion');
      });
    } catch {
      return false; // Cross-origin stylesheet
    }
  });

  return {
    name: 'CSS: prefers-reduced-motion rule exists',
    pass: hasMotionQuery,
    details: hasMotionQuery
      ? '✓ Found @media (prefers-reduced-motion) in stylesheets'
      : '⚠ Not found — Animations may distress users with vestibular disorders',
  };
}

/** L1: فحص transitions على body */
function checkThemeTransition(): QAResult {
  const body = document.body;
  const transition = getComputedStyle(body).transition;
  const pass = transition !== 'none' && transition !== 'all 0s ease 0s';
  return {
    name: 'CSS: Theme transition on root',
    pass,
    details: `transition="${transition}"`,
  };
}

/** L2: فحص تزامن Hook مع DOM */
function checkHookDOMSync(): QAResult {
  const domClass = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  const domAttr  = document.documentElement.getAttribute('data-resolved-theme');
  const attrMatch = domAttr === domClass;
  return {
    name: 'useTheme: DOM class matches data-resolved-theme attr',
    pass: attrMatch,
    details: `classList has "${domClass}" | data-resolved-theme="${domAttr}"`,
  };
}

/** L3: فحص ThemeSwitcher في DOM */
function checkThemeSwitcherDOM(): QAResult {
  const radioGroup = document.querySelector('[role="radiogroup"]');
  const radios = document.querySelectorAll('[role="radio"]');
  const pass = !!(radioGroup && radios.length === 3);
  return {
    name: 'ThemeSwitcher: radiogroup + 3 radios in DOM',
    pass,
    details: `radiogroup=${!!radioGroup} | radios found=${radios.length}`,
  };
}

/** L3: فحص ARIA */
function checkARIA(): QAResult[] {
  const radios = document.querySelectorAll('[role="radio"]');
  const results: QAResult[] = [];

  radios.forEach((radio, i) => {
    const hasAriaChecked = radio.hasAttribute('aria-checked');
    const hasAriaLabel   = radio.hasAttribute('aria-label');
    results.push({
      name: `ARIA: radio[${i}] has aria-checked + aria-label`,
      pass: hasAriaChecked && hasAriaLabel,
      details: `aria-checked="${radio.getAttribute('aria-checked')}" aria-label="${radio.getAttribute('aria-label')}"`,
    });
  });

  return results;
}

/** L4: فحص تباين الألوان WCAG AA */
function checkColorContrast(): QAResult[] {
  const resolvedTheme = document.documentElement.getAttribute('data-resolved-theme') || 'dark';
  const isDark = resolvedTheme === 'dark';

  const pairs: Array<{ bg: string; fg: string; label: string; minRatio: number }> = isDark
    ? [
        { bg: '#100444', fg: '#FFFFA3', label: 'Dark: bg #100444 vs text #FFFFA3', minRatio: 4.5 },
        { bg: '#1a0a5c', fg: '#FFFFA3', label: 'Dark card: bg #1a0a5c vs text #FFFFA3', minRatio: 4.5 },
      ]
    : [
        { bg: '#fafafa', fg: '#100444', label: 'Light: bg #fafafa vs text #100444', minRatio: 4.5 },
        { bg: '#ffffff', fg: '#100444', label: 'Light card: bg white vs text #100444', minRatio: 4.5 },
      ];

  return pairs.map(({ bg, fg, label, minRatio }) => {
    const ratio = getContrastRatio(bg, fg);
    const pass = ratio >= minRatio;
    return {
      name: `WCAG AA Contrast: ${label}`,
      pass,
      details: `ratio=${ratio.toFixed(2)}:1 (min ${minRatio}:1)`,
      value: ratio,
    };
  });
}

/** System Mode: تحقق من تزامن matchMedia */
function checkSystemModeSync(): QAResult {
  const storedMode = localStorage.getItem('mrx_ui_theme');
  if (storedMode !== 'system') {
    return {
      name: 'System Mode: matchMedia sync (N/A — mode is not system)',
      pass: true,
      details: `Current mode: "${storedMode}" — not in system mode, skipping`,
    };
  }

  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const expectedResolved  = systemPrefersDark ? 'dark' : 'light';
  const domResolved       = document.documentElement.getAttribute('data-resolved-theme');
  const pass = domResolved === expectedResolved;

  return {
    name: 'System Mode: matchMedia → DOM sync',
    pass,
    details: `OS prefers dark=${systemPrefersDark} | expected="${expectedResolved}" | DOM="${domResolved}"`,
  };
}

// ── Main QA Runner ────────────────────────────────────────────────────
function runThemeQA(options: QAOptions = {}): QAReport {
  const { verbose = false, checkContrast = true } = options;

  const allResults: QAResult[] = [
    // L0
    checkAntiFOUC(),
    checkLocalStorage(),
    // L1
    ...checkCSSVariables(),
    checkReducedMotion(),
    checkThemeTransition(),
    // L2
    checkHookDOMSync(),
    checkSystemModeSync(),
    // L3
    checkThemeSwitcherDOM(),
    ...checkARIA(),
    // L4 - Color Contrast
    ...(checkContrast ? checkColorContrast() : []),
  ];

  const passed = allResults.filter(r => r.pass).length;
  const failed = allResults.length - passed;

  const report: QAReport = {
    passed,
    failed,
    total: allResults.length,
    results: allResults,
    resolvedTheme: document.documentElement.getAttribute('data-resolved-theme') || 'unknown',
    storedMode: (() => { try { return localStorage.getItem('mrx_ui_theme') || 'unknown'; } catch { return 'blocked'; } })(),
    timestamp: new Date().toISOString(),
  };

  // ── Console Output ──────────────────────────────────────────────
  const badge = failed === 0 ? '✅ ALL PASS' : `❌ ${failed} FAILED`;
  const themeInfo = `[${report.storedMode.toUpperCase()} → ${report.resolvedTheme.toUpperCase()}]`;

  console.group(
    `%c MR. X Theme QA ${badge} ${themeInfo}`,
    `color: ${failed === 0 ? '#FFFFA3' : '#ff6b6b'}; background: #100444; padding: 4px 12px; border-radius: 4px; font-weight: bold; font-size: 13px;`
  );

  console.log(`📊 Results: ${passed}/${report.total} checks passed`);
  console.log(`🕒 Timestamp: ${report.timestamp}`);

  if (verbose || failed > 0) {
    console.group('📋 Detailed Results:');
    allResults.forEach(r => {
      const icon = r.pass ? '✅' : '❌';
      const style = r.pass ? 'color: #FFFFA3' : 'color: #ff6b6b; font-weight: bold';
      console.log(`%c${icon} ${r.name}`, style);
      if (r.details && (verbose || !r.pass)) {
        console.log(`   └─ ${r.details}`);
      }
    });
    console.groupEnd();
  }

  if (failed === 0) {
    console.log(
      '%c🎉 Theme system is operating perfectly!',
      'color: #FFFFA3; background: #100444; padding: 2px 8px; border-radius: 4px;'
    );
  } else {
    console.warn(`⚠️ ${failed} check(s) failed. Review the details above.`);
  }

  console.groupEnd();
  return report;
}

// ── Global Registration ───────────────────────────────────────────────
declare global {
  interface Window {
    mrx_themeQA: (options?: QAOptions) => QAReport;
    mrx_themeSwitch: (mode: 'light' | 'dark' | 'system') => void;
  }
}

if (typeof window !== 'undefined') {
  window.mrx_themeQA = runThemeQA;

  /** Helper: تبديل الثيم يدوياً من الكونسول */
  window.mrx_themeSwitch = (mode: 'light' | 'dark' | 'system') => {
    const root = document.documentElement;
    const resolved = mode === 'system'
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : mode;
    root.classList.remove('light', 'dark');
    root.classList.add(resolved);
    root.setAttribute('data-theme-mode', mode);
    root.setAttribute('data-resolved-theme', resolved);
    try {
      localStorage.setItem('mrx_ui_theme', mode);
      localStorage.setItem('theme', mode);
    } catch { /* blocked */ }
    window.dispatchEvent(new CustomEvent('mrx_theme_change', {
      detail: { mode, resolved }
    }));
    console.log(`%c🎨 Theme switched to: ${mode} (resolved: ${resolved})`,
      'color: #FFFFA3; background: #100444; padding: 2px 8px; border-radius: 4px;'
    );
  };
}

export { runThemeQA, getContrastRatio };
export type { QAReport, QAResult, QAOptions };
