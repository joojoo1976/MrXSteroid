'use client';

/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  ThemeSwitcher.tsx — MR. X Vercel/GitHub-Style Theme Switcher ║
 * ║  مكون احترافي لمبدل المظهر المدمج (Compact Dropdown Switcher) ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Laptop, ChevronDown, Check } from 'lucide-react';
import { ThemeMode, ResolvedTheme } from '../../hooks/useTheme';

export interface ThemeOption {
  value: ThemeMode;
  labelEn: string;
  labelAr: string;
  Icon: React.FC<{ className?: string }>;
  ariaEn: string;
  ariaAr: string;
}

export interface ThemeSwitcherProps {
  theme: ThemeMode;
  resolvedTheme?: ResolvedTheme;
  setTheme: (mode: ThemeMode) => void;
  variant?: 'icon' | 'pill';
  isRTL?: boolean;
  className?: string;
}

export const THEME_OPTIONS: ThemeOption[] = [
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
    Icon: Laptop,
    ariaEn: 'Follow System preference',
    ariaAr: 'اتباع تفضيل النظام',
  },
];

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({
  theme,
  setTheme,
  isRTL = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const currentOption = THEME_OPTIONS.find((o) => o.value === theme) || THEME_OPTIONS[2];
  const CurrentIcon = currentOption.Icon;

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  // Keyboard navigation
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      triggerRef.current?.focus();
      return;
    }

    const currentIndex = THEME_OPTIONS.findIndex((o) => o.value === theme);
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = (currentIndex + 1) % THEME_OPTIONS.length;
      setTheme(THEME_OPTIONS[nextIndex].value);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIndex = (currentIndex - 1 + THEME_OPTIONS.length) % THEME_OPTIONS.length;
      setTheme(THEME_OPTIONS[prevIndex].value);
    }
  };

  return (
    <div
      ref={dropdownRef}
      onKeyDown={handleKeyDown}
      className={`relative inline-block text-start ${className}`}
    >
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label={isRTL ? 'تغيير المظهر' : 'Toggle theme'}
        className={`group flex items-center justify-center gap-1.5 px-2.5 py-1.5 h-9 rounded-xl border text-xs font-semibold transition-all duration-200 outline-none select-none ${
          isOpen
            ? 'bg-zinc-100 dark:bg-zinc-800 border-gold-500/50 text-gold-600 dark:text-gold-400 shadow-sm'
            : 'bg-white/80 dark:bg-zinc-900/80 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/90 hover:border-zinc-300 dark:hover:border-zinc-700 shadow-xs'
        } focus-visible:ring-2 focus-visible:ring-gold-500/50`}
      >
        <motion.div
          key={theme}
          initial={{ scale: 0.6, rotate: -25, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 450, damping: 25 }}
          className="flex items-center justify-center"
        >
          <CurrentIcon className="w-4 h-4 text-gold-500 dark:text-gold-400" />
        </motion.div>

        <ChevronDown
          className={`w-3 h-3 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-gold-500 dark:text-gold-400' : ''
          }`}
        />
      </button>

      {/* Dropdown Popup */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.95 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            role="menu"
            aria-orientation="vertical"
            aria-label={isRTL ? 'خيارات المظهر' : 'Theme options'}
            className={`absolute top-[calc(100%+6px)] z-50 min-w-[150px] p-1.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/90 shadow-2xl backdrop-blur-xl ring-1 ring-black/5 ${
              isRTL ? 'start-0' : 'end-0'
            }`}
          >
            {THEME_OPTIONS.map((opt) => {
              const isActive = theme === opt.value;
              const label = isRTL ? opt.labelAr : opt.labelEn;
              const OptionIcon = opt.Icon;

              return (
                <button
                  key={opt.value}
                  role="menuitemradio"
                  aria-checked={isActive}
                  onClick={() => {
                    setTheme(opt.value);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-start transition-all cursor-pointer select-none ${
                    isActive
                      ? 'bg-gold-500/10 text-gold-600 dark:text-gold-400 font-bold'
                      : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/70 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <OptionIcon
                      className={`w-4 h-4 ${
                        isActive
                          ? 'text-gold-500 dark:text-gold-400'
                          : 'text-zinc-400 dark:text-zinc-500'
                      }`}
                    />
                    <span>{label}</span>
                  </div>

                  {isActive && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    >
                      <Check className="w-3.5 h-3.5 text-gold-500 dark:text-gold-400" />
                    </motion.div>
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

export default ThemeSwitcher;
