'use client';

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from '../lib/utils';
import { Popover, PopoverTrigger, PopoverContent } from "@/shared/ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/shared/ui/command";
import { WORLD_COUNTRIES, CountryOption } from '../lib/locationData';

/* ─────────────────────────────────────────────────────────────────────────────
 * PHONE INPUT — International country-code picker + formatted national input.
 * Uses the project's WORLD_COUNTRIES data (emoji flags, dial codes), a Radix
 * Popover + cmdk Command for searchable / keyboard-navigable country list,
 * and a per-country national formatting table.
 * ───────────────────────────────────────────────────────────────────────────── */

/** Per-country national formatting: digit-group lengths left→right (no leading '+'/dial code). */
const PHONE_FORMATS: Record<string, number[]> = {
  // Mobile-dominant, 11 digits starting with 0 → 0XX XXXX XXXX
  EG: [3, 4, 4],
  // North America NPA-NXX-XXXX
  US: [3, 3, 4],
  CA: [3, 3, 4],
  DO: [3, 3, 4],
  PR: [3, 3, 4],
  JM: [3, 3, 4],
  // Gulf mobile: 05X XXX XXXX
  SA: [3, 3, 4],
  AE: [3, 3, 4],
  KW: [3, 3, 4],
  QA: [3, 3, 4],
  BH: [3, 3, 4],
  OM: [3, 3, 4],
  // Levant
  JO: [3, 3, 4],
  IQ: [3, 3, 4],
  LB: [3, 3, 4],
  SY: [3, 3, 4],
  // Maghreb
  LY: [3, 3, 4],
  SD: [3, 3, 4],
  MA: [2, 3, 3, 2],
  DZ: [3, 3, 4],
  TN: [2, 3, 3, 2],
  MR: [2, 3, 3, 2],
  // Europe
  GB: [5, 6],
  DE: [3, 3, 4],
  FR: [2, 2, 2, 2, 2],
  IT: [3, 3, 4],
  ES: [3, 3, 3],
  NL: [3, 3, 4],
  BE: [2, 3, 3],
  CH: [3, 3, 3],
  AT: [3, 3, 4],
  SE: [2, 3, 3],
  NO: [3, 3, 3],
  DK: [2, 2, 2, 2],
  FI: [2, 3, 4],
  IE: [2, 3, 4],
  PT: [2, 3, 3],
  GR: [3, 3, 4],
  PL: [3, 3, 3],
  CZ: [3, 3, 4],
  HU: [3, 3, 4],
  RO: [3, 3, 4],
  BG: [3, 3, 4],
  HR: [3, 3, 4],
  SK: [3, 3, 4],
  SI: [2, 3, 4],
  CY: [2, 3, 4],
  MT: [2, 3, 3],
  LU: [3, 3, 3],
  IS: [3, 3, 3],
  // Eastern Europe
  RU: [3, 3, 2, 2],
  UA: [3, 3, 4],
  BY: [3, 3, 4],
  RS: [3, 3, 4],
  BA: [3, 3, 4],
  AL: [3, 3, 4],
  MK: [3, 3, 4],
  ME: [3, 3, 4],
  MD: [3, 3, 4],
  GE: [3, 3, 4],
  AM: [2, 3, 4],
  AZ: [2, 3, 4],
  TR: [3, 3, 4],
  // Asia & Pacific
  CN: [3, 4, 4],
  JP: [2, 2, 4, 4],
  KR: [2, 3, 4],
  IN: [2, 3, 4],
  PK: [3, 4, 4],
  BD: [2, 3, 4],
  ID: [2, 3, 4],
  MY: [2, 3, 4],
  SG: [3, 3, 3],
  TH: [2, 3, 4],
  VN: [2, 3, 4],
  PH: [3, 3, 4],
  LK: [2, 3, 4],
  NP: [3, 3, 4],
  KZ: [3, 3, 4],
  UZ: [2, 3, 4],
  // Oceania
  AU: [4, 4, 3],
  NZ: [2, 3, 4],
  // Latin America
  BR: [2, 4, 4],
  AR: [2, 3, 4],
  CL: [2, 3, 4],
  CO: [3, 3, 4],
  PE: [3, 3, 4],
  VE: [2, 3, 4],
  EC: [2, 3, 4],
  UY: [2, 3, 4],
  PY: [2, 3, 4],
  BO: [2, 3, 4],
  CR: [2, 3, 4],
  PA: [3, 3, 4],
  // Africa
  NG: [3, 3, 4],
  ZA: [2, 3, 4],
  KE: [2, 3, 4],
  GH: [2, 3, 4],
  ET: [2, 3, 4],
  TZ: [2, 3, 4],
  UG: [2, 3, 4],
  CM: [2, 3, 4],
  CI: [2, 3, 4],
  SN: [2, 3, 4],
  AO: [2, 3, 4],
  MZ: [2, 3, 4],
  ZW: [2, 3, 4],
  ZM: [2, 3, 4],
  NA: [2, 3, 4],
  BW: [2, 3, 4],
  RW: [2, 3, 4],
  MU: [2, 3, 4],
};

/** Strip everything except digits. */
const onlyDigits = (raw: string): string => raw.replace(/\D/g, "");

/** Format a national (no dial code) number per the selected country's pattern. */
export function formatNational(raw: string, countryCode: string): string {
  const digits = onlyDigits(raw);
  if (!digits) return "";
  const groups = PHONE_FORMATS[countryCode];
  if (!groups) {
    // Fallback: chunk from the left in groups of 3.
    return digits.replace(/(\d{3})(?=\d)/g, "$1 ").trim();
  }
  const parts: string[] = [];
  let cursor = 0;
  for (const size of groups) {
    if (cursor >= digits.length) break;
    parts.push(digits.slice(cursor, cursor + size));
    cursor += size;
  }
  return parts.join(" ");
}

/** Given a typed string and current country, returns the raw digits (formatted national number). */
export function normalizePhone(raw: string): string {
  return onlyDigits(raw);
}

export interface PhoneInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> {
  /** Raw (digits-only) national number. Controlled mode is used when provided. */
  value?: string;
  /** Fired with the digits-only national number (e.g. "01012345678"). */
  onChange?: (value: string) => void;
  /** Controlled dial code, e.g. "+20". */
  countryCode?: string;
  /** Fired with the newly selected dial code. */
  onCountryChange?: (code: string) => void;
  /** Fallback ISO2 country when `countryCode` matches nothing. Default: "EG". */
  defaultCountryCode?: string;
  /** Which language to render country names in. */
  locale?: "en" | "ar";
  /** Renders an error (red) border state. */
  error?: boolean;
  /** Override the country list (defaults to WORLD_COUNTRIES). */
  countries?: CountryOption[];
  /** Align for the popover. */
  popoverAlign?: "start" | "center" | "end";
  placeholder?: string;
}

export const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  (
    {
      value,
      onChange,
      onCountryChange,
      countryCode,
      defaultCountryCode = "EG",
      locale = "en",
      error = false,
      countries = WORLD_COUNTRIES,
      popoverAlign = "start",
      className,
      id,
      name,
      placeholder = "Phone Number...",
      disabled,
      autoComplete,
      ...rest
    },
    forwardedRef
  ) => {
    const [open, setOpen] = React.useState(false);
    const [internalValue, setInternalValue] = React.useState("");
    const [highlighted, setHighlighted] = React.useState<string | null>(null);

    const isControlled = value !== undefined;
    const currentValue = isControlled ? value ?? "" : internalValue;

    const selected =
      countries.find(c => c.dialCode === countryCode) ??
      countries.find(c => c.code === defaultCountryCode) ??
      countries[0];

    const displayValue = formatNational(currentValue, selected?.code ?? "");

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const digits = normalizePhone(e.target.value);
      if (!isControlled) setInternalValue(digits);
      onChange?.(digits);
    };

    const handleSelectCountry = (country: CountryOption) => {
      onCountryChange?.(country.dialCode);
      setOpen(false);
    };

    // Guard against an empty data source.
    if (!selected) return null;

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <div
          className={cn(
            "flex w-full items-stretch overflow-hidden rounded-lg border bg-white dark:bg-zinc-900 transition-all duration-300",
            error
              ? "border-red-500 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-500/20"
              : "border-zinc-300 dark:border-zinc-700 focus-within:border-gold-500 focus-within:ring-2 focus-within:ring-gold-500/20",
            disabled && "opacity-60 pointer-events-none",
            className
          )}
        >
          {/* Country selector trigger */}
          <PopoverTrigger asChild>
            <button
              type="button"
              disabled={disabled}
              aria-haspopup="listbox"
              aria-expanded={open}
              aria-label="Country code"
              className={cn(
                "flex shrink-0 items-center gap-1.5 border-e border-zinc-200 px-3 py-2.5 bg-zinc-50 dark:bg-zinc-800/60 transition-colors",
                "hover:bg-zinc-100 dark:hover:bg-zinc-800 active:bg-zinc-200/70 dark:active:bg-zinc-700/70",
                "outline-none focus-visible:ring-2 focus-visible:ring-gold-500/60",
                open && "bg-zinc-100 dark:bg-zinc-800"
              )}
            >
              <span className="text-base leading-none" aria-hidden>
                {selected.flag}
              </span>
              <span className="text-xs font-semibold tabular-nums text-zinc-700 dark:text-zinc-200">
                {selected.dialCode}
              </span>
              <ChevronDown
                className={cn(
                  "h-3.5 w-3.5 text-zinc-400 transition-transform duration-200",
                  open && "rotate-180"
                )}
              />
            </button>
          </PopoverTrigger>

          {/* National number input */}
          <input
            ref={forwardedRef}
            id={id}
            name={name}
            type="tel"
            inputMode="tel"
            autoComplete={autoComplete ?? "tel-national"}
            value={displayValue}
            onChange={handleInputChange}
            onFocus={e => e.target.setSelectionRange(e.target.value.length, e.target.value.length)}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(
              "w-full min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm text-zinc-900 dark:text-zinc-100",
              "placeholder:text-zinc-400 dark:placeholder:text-zinc-500 outline-none tabular-nums",
              "disabled:cursor-not-allowed"
            )}
            {...rest}
          />
        </div>

        {/* Country dropdown */}
        <PopoverContent
          align={popoverAlign}
          sideOffset={6}
          className="w-[320px] max-w-[calc(100vw-2rem)] rounded-lg border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-0 shadow-lg"
        >
          <Command>
            <CommandInput
              placeholder={locale === "ar" ? "ابحث عن دولة أو رمز…" : "Search country or code…"}
              className="border-zinc-100 dark:border-zinc-800"
            />
            <CommandList className="max-h-72 overflow-y-auto overscroll-contain px-1 pb-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-zinc-300 dark:[&::-webkit-scrollbar-thumb]:bg-zinc-600 [&::-webkit-scrollbar-track]:bg-transparent">
              <CommandEmpty className="py-6 text-sm text-zinc-400">
                {locale === "ar" ? "لا توجد نتائج مطابقة" : "No results found"}
              </CommandEmpty>
              <CommandGroup>
                {countries.map(country => {
                  const isActive = country.dialCode === selected.dialCode && country.code === selected.code;
                  return (
                    <CommandItem
                      key={country.code}
                      value={`${country.nameEn} ${country.nameAr} ${country.dialCode} ${country.code}`}
                      onSelect={() => handleSelectCountry(country)}
                      onMouseEnter={() => setHighlighted(country.code)}
                      onMouseLeave={() => setHighlighted(prev => (prev === country.code ? null : prev))}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2.5 cursor-pointer",
                        "data-[selected=true]:bg-zinc-100 dark:data-[selected=true]:bg-zinc-800",
                        (isActive || highlighted === country.code) && "bg-zinc-100 dark:bg-zinc-800"
                      )}
                    >
                      <span className="text-lg leading-none" aria-hidden>
                        {country.flag}
                      </span>
                      <span className="flex-1 truncate text-sm font-medium text-zinc-800 dark:text-zinc-100">
                        {locale === "ar" ? country.nameAr : country.nameEn}
                      </span>
                      <span className="text-xs font-medium tabular-nums text-zinc-400 dark:text-zinc-500">
                        {country.dialCode}
                      </span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  }
);

PhoneInput.displayName = "PhoneInput";

export default PhoneInput;
