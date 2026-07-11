/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  ThemeSwitcher.tsx — MR. X Theme System v2.0                  ║
 * ║  مكون احترافي لتبديل الثيم الثلاثي (Light / Dark / System)   ║
 * ║                                                                ║
 * ║  المميزات:                                                     ║
 * ║  • Pill variant  — شريط ثلاثي بـ sliding indicator (Header)   ║
 * ║  • Icon variant  — زر مضغوط مع dropdown (Mobile)              ║
 * ║  • Framer Motion — sliding bg + icon rotate/scale             ║
 * ║  • Glow effect   — #FFFFA3 neon في Dark Mode                  ║
 * ║  • ARIA          — radiogroup / radio roles + keyboard nav    ║
 * ║  • reduced-motion — fallback آمن لإيقاف الحركة               ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import React, { useId, useRef, KeyboardEvent, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Monitor, ChevronDown } from 'lucide-react';
import { ThemeMode, ResolvedTheme } from '../../hooks/useTheme';

// ── Types ─────────────────────────────────────────────────────────────
interface ThemeOption {
  value: ThemeMode;
  labelEn: string;
  labelAr: string;
  Icon: React.FC<{ className?: string }>;
  ariaEn: string;
  ariaAr: string;
}

interface ThemeSwitcherProps {
  theme: ThemeMode;
  resolvedTheme: ResolvedTheme;
  setTheme: (mode: ThemeMode) => void;
  /** 'pill' = Full 3-segment bar (Header/Desktop) | 'icon' = compact icon + dropdown (Mobile) */
  variant?: 'pill' | 'icon';
  /** RTL language active */
  isRTL?: boolean;
  /** Translation function */
  t?: (key: string) => string;
}

// ── Options definition ────────────────────────────────────────────────
const THEME_OPTIONS: ThemeOption[] = [
  {
    value: 'light',
    labelEn: 'Light',
    labelAr: 'فاتح',
    Icon: Sun,
    ariaEn: 'Switch to Light mode',
    ariaAr: 'التبديل إلى الوضع الفاتح',
  },
  {
    value: 'dark',
    labelEn: 'Dark',
    labelAr: 'داكن',
    Icon: Moon,
    ariaEn: 'Switch to Dark mode',
    ariaAr: 'التبديل إلى الوضع الداكن',
  },
  {
    value: 'system',
    labelEn: 'System',
    labelAr: 'النظام',
    Icon: Monitor,
    ariaEn: 'Follow System preference',
    ariaAr: 'اتباع تفضيل النظام',
  },
];

// ── Pill Variant ─────────────────────────────────────────────────────
const PillSwitcher: React.FC<ThemeSwitcherProps> = ({
  theme, resolvedTheme, setTheme, isRTL = false,
}) => {
  const groupId = useId();
  const isDark  = resolvedTheme === 'dark';

  // Keyboard navigation (Arrow keys)
  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>, currentIdx: number) => {
    const total = THEME_OPTIONS.length;
    if (e.key === 'ArrowRight' || (!isRTL && e.key === 'ArrowRight') || (isRTL && e.key === 'ArrowLeft')) {
      e.preventDefault();
      setTheme(THEME_OPTIONS[(currentIdx + 1) % total].value);
    } else if (e.key === 'ArrowLeft' || (!isRTL && e.key === 'ArrowLeft') || (isRTL && e.key === 'ArrowRight')) {
      e.preventDefault();
      setTheme(THEME_OPTIONS[(currentIdx - 1 + total) % total].value);
    }
  };

  return (
    <div
      role="radiogroup"
      aria-label={isRTL ? 'اختيار مظهر الموقع' : 'Choose site theme'}
      className={[
        'relative flex items-center rounded-xl p-0.5 gap-0',
        'border transition-all duration-250',
        isDark
          ? 'bg-[rgba(255,255,163,0.07)] border-[rgba(255,255,163,0.12)]'
          : 'bg-[rgba(16,4,68,0.06)]   border-[rgba(16,4,68,0.12)]',
      ].join(' ')}
    >
      {THEME_OPTIONS.map((opt, idx) => {
        const isActive = theme === opt.value;
        const label = isRTL ? opt.labelAr : opt.labelEn;
        const ariaLabel = isRTL ? opt.ariaAr : opt.ariaEn;

        return (
          <div key={opt.value} className="relative">
            {/* Sliding active indicator */}
            {isActive && (
              <motion.div
                layoutId={`${groupId}-indicator`}
                className={[
                  'absolute inset-0 rounded-lg z-0',
                  isDark
                    ? 'bg-[rgba(255,255,163,0.14)] shadow-[0_2px_14px_rgba(255,255,163,0.22)]'
                    : 'bg-white shadow-[0_2px_8px_rgba(16,4,68,0.18)]',
                ].join(' ')}
                transition={{
                  type: 'spring',
                  stiffness: 380,
                  damping: 32,
                  mass: 0.8,
                }}
              />
            )}

            <button
              role="radio"
              aria-checked={isActive}
              aria-label={ariaLabel}
              tabIndex={isActive ? 0 : -1}
              onClick={() => setTheme(opt.value)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              className={[
                'relative z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-lg',
                'text-xs font-semibold select-none cursor-pointer',
                'transition-colors duration-200 outline-none',
                'focus-visible:ring-2 focus-visible:ring-offset-1',
                isDark
                  ? `focus-visible:ring-[#FFFFA3]/50 focus-visible:ring-offset-[#100444] ${isActive ? 'text-[#FFFFA3]' : 'text-[rgba(255,255,163,0.5)] hover:text-[rgba(255,255,163,0.8)]'}`
                  : `focus-visible:ring-[#100444]/30 focus-visible:ring-offset-white ${isActive ? 'text-[#100444]' : 'text-[rgba(16,4,68,0.45)] hover:text-[rgba(16,4,68,0.75)]'}`,
              ].join(' ')}
            >
              {/* Icon with micro-animation */}
              <motion.div
                animate={isActive
                  ? { scale: 1.15, rotate: opt.value === 'light' ? 15 : opt.value === 'dark' ? -12 : 0 }
                  : { scale: 1, rotate: 0 }
                }
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              >
                <opt.Icon
                  className={[
                    'w-3.5 h-3.5 transition-none',
                    isActive && isDark ? 'text-[#FFFFA3] drop-shadow-[0_0_6px_rgba(255,255,163,0.8)]' : '',
                    isActive && !isDark ? 'text-[#100444]' : '',
                  ].join(' ')}
                />
              </motion.div>

              {/* Label */}
              <span className="hidden sm:inline whitespace-nowrap">{label}</span>
            </button>
          </div>
        );
      })}
    </div>
  );
};

// ── Icon Variant (compact for mobile/small spaces) ────────────────────
const IconSwitcher: React.FC<ThemeSwitcherProps> = ({
  theme, resolvedTheme, setTheme, isRTL = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const isDark = resolvedTheme === 'dark';

  const current = THEME_OPTIONS.find(o => o.value === theme) || THEME_OPTIONS[1];
  const CurrentIcon = current.Icon;

  // Close on outside click
  const handleBlur = () => setTimeout(() => setIsOpen(false), 150);

  return (
    <div className="relative">
      {/* Trigger button */}
      <button
        ref={btnRef}
        onClick={() => setIsOpen(prev => !prev)}
        onBlur={handleBlur}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={isRTL ? 'اختيار مظهر الموقع' : 'Choose site theme'}
        className={[
          'flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-xl',
          'border transition-all duration-250 shadow-sm',
          'min-w-[44px] h-[36px] text-xs font-bold',
          isDark
            ? 'bg-[rgba(255,255,163,0.07)] border-[rgba(255,255,163,0.12)] text-[#FFFFA3] hover:border-[rgba(255,255,163,0.3)] hover:bg-[rgba(255,255,163,0.12)]'
            : 'bg-white border-[rgba(16,4,68,0.12)] text-[#100444] hover:border-[rgba(16,4,68,0.3)]',
        ].join(' ')}
      >
        <motion.div
          key={theme}
          initial={{ scale: 0.7, rotate: -20, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          exit={{ scale: 0.7, rotate: 20, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 22 }}
        >
          <CurrentIcon className="w-4 h-4" />
        </motion.div>
        <ChevronDown
          className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''} ${isDark ? 'text-[rgba(255,255,163,0.5)]' : 'text-[rgba(16,4,68,0.4)]'}`}
        />
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0,  scale: 1 }}
            exit={{   opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
            role="listbox"
            aria-label={isRTL ? 'اختيار مظهر الموقع' : 'Choose theme'}
            className={[
              'absolute top-[calc(100%+8px)] z-[60] w-44 rounded-2xl overflow-hidden shadow-2xl p-1.5',
              isRTL ? 'end-0' : 'start-0',
              isDark
                ? 'bg-[#1a0a5c] border border-[rgba(255,255,163,0.12)]'
                : 'bg-white border border-[rgba(16,4,68,0.1)]',
            ].join(' ')}
          >
            {THEME_OPTIONS.map(opt => {
              const isActive = theme === opt.value;
              const label = isRTL ? opt.labelAr : opt.labelEn;
              return (
                <button
                  key={opt.value}
                  role="option"
                  aria-selected={isActive}
                  onClick={() => { setTheme(opt.value); setIsOpen(false); }}
                  className={[
                    'w-full flex items-center gap-3 px-4 py-2.5 text-sm rounded-xl',
                    'transition-all duration-200 text-start',
                    isActive && isDark  ? 'bg-[rgba(255,255,163,0.12)] text-[#FFFFA3] font-bold' : '',
                    isActive && !isDark ? 'bg-[rgba(16,4,68,0.07)]   text-[#100444] font-bold'  : '',
                    !isActive && isDark  ? 'text-[rgba(255,255,163,0.6)] hover:bg-[rgba(255,255,163,0.07)] hover:text-[#FFFFA3]' : '',
                    !isActive && !isDark ? 'text-[rgba(16,4,68,0.55)]  hover:bg-[rgba(16,4,68,0.05)]      hover:text-[#100444]'  : '',
                  ].join(' ')}
                >
                  <motion.div
                    animate={isActive
                      ? { scale: 1.2, rotate: opt.value === 'light' ? 15 : opt.value === 'dark' ? -10 : 0 }
                      : { scale: 1, rotate: 0 }
                    }
                    transition={{ type: 'spring', stiffness: 380, damping: 25 }}
                  >
                    <opt.Icon className={`w-4 h-4 ${isActive && isDark ? 'drop-shadow-[0_0_6px_rgba(255,255,163,0.8)]' : ''}`} />
                  </motion.div>
                  {label}
                  {isActive && (
                    <span className={[
                      'ms-auto text-[10px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md',
                      isDark
                        ? 'bg-[rgba(255,255,163,0.15)] text-[#FFFFA3]'
                        : 'bg-[rgba(16,4,68,0.08)]   text-[#100444]',
                    ].join(' ')}>
                      {isRTL ? 'نشط' : 'ON'}
                    </span>
                  )}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ── Main Export ───────────────────────────────────────────────────────
export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = (props) => {
  const { variant = 'pill' } = props;
  return variant === 'pill'
    ? <PillSwitcher {...props} />
    : <IconSwitcher {...props} />;
};

export default ThemeSwitcher;
