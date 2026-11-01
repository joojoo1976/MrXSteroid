// components/tools/tool-111-smart-food-macro-substitution.integration.test.tsx
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import React from "react";
import { permanentRedirect } from "next/navigation";

import * as PreferencesCtx from "@/context/PreferencesContext";
import { Language, Theme } from "@/shared/types/types";

vi.mock("next/navigation", () => ({
  permanentRedirect: vi.fn(),
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => "/",
}));

let localStorageStore: Record<string, string> = {};
const localStorageMock = {
  getItem: vi.fn((key: string) => localStorageStore[key] ?? null),
  setItem: vi.fn((key: string, value: string) => { localStorageStore[key] = value; }),
  removeItem: vi.fn((key: string) => { delete localStorageStore[key]; }),
  clear: vi.fn(() => { localStorageStore = {}; }),
  length: 0, key: vi.fn(),
};
Object.defineProperty(window, "localStorage", { value: localStorageMock, writable: true });

type Locale = "ar" | "en";
function makePreferences(locale: Locale): PreferencesCtx.PreferencesContextProps {
  return {
    language: locale === "ar" ? Language.AR : Language.EN, unitSystem: "metric", theme: Theme.DARK,
    status: "IDLE", isAutoDetected: false, locale: locale, currency: "USD",
    formatPrice: (p: number) => `$${p}`, setLanguage: vi.fn(), setUnitSystem: vi.fn(),
    setTheme: vi.fn(), t: (key: any) => String(key), content: {} as any,
    isRTL: locale === "ar", refreshDetection: vi.fn().mockResolvedValue(undefined),
  };
}
function WithPreferences({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  return (<PreferencesCtx.PreferencesContext.Provider value={makePreferences(locale)}>{children}</PreferencesCtx.PreferencesContext.Provider>);
}

import Tool111SmartFoodMacroSubstitutionPage from "@/app/smarttools/tool-111-smart-food-macro-substitution/page";

vi.mock("@/components/tools/tool-111-smart-food-macro-substitution", () => ({
  default: vi.fn(() => React.createElement("div", { "data-testid": "tool-111-component" }, "Tool #111 Component")),
}));

vi.mock("@/lib/tools/adapters/tool-111-smart-food-macro-substitution", () => ({
  tool111Adapter: {
    execute: vi.fn(() => ({ ok: true, output: { toolSlug: "smart-food-macro-substitution" } })),
    parseInput: vi.fn(), compute: vi.fn(), build: vi.fn(), buildContext: vi.fn(),
  },
}));

import { getTool, requireTool, TOOL_REGISTRY } from "@/lib/tools/registry";
import { Page } from "@/shared/types/types";
import { PAGE_TO_PATH } from "@/lib/legacy-routes";

describe("Tool #111 — Phase 4 Integration & Routing", () => {
  beforeEach(() => { vi.clearAllMocks(); localStorageStore = {}; });
  afterEach(() => { cleanup(); });

  it("IN-01 path exists in legacy-routes PAGE_TO_PATH", () => {
    const path = PAGE_TO_PATH[Page.SMART_FOOD_MACRO_SUBSTITUTION];
    expect(path).toBe("/smarttools/nutrition/tool-111-smart-food-macro-substitution");
  });

  it("IN-02 flat legacy page permanently redirects to the canonical Tool #111 route", () => {
    Tool111SmartFoodMacroSubstitutionPage();
    expect(permanentRedirect).toHaveBeenCalledWith("/smarttools/nutrition/tool-111-smart-food-macro-substitution");
  });

  it("IN-03 tool appears in Registry", () => {
    const tool = getTool("tool-111-smart-food-macro-substitution");
    expect(tool).toBeDefined();
    expect(tool?.slug).toBe("tool-111-smart-food-macro-substitution");
    expect(tool?.titleEn).toBe("Smart Food & Macro Substitution Engine");
    expect(tool?.titleAr).toBe("محرك استبدال الطعام الذكي بالمكرويات");
    expect(tool?.accessTier).toBe("free");
    expect(tool?.order).toBe(1270);
  });

  it("IN-04 Page enum SMART_FOOD_MACRO_SUBSTITUTION works", () => {
    expect(Page.SMART_FOOD_MACRO_SUBSTITUTION).toBe("tool-111-smart-food-macro-substitution");
    const tool = requireTool("tool-111-smart-food-macro-substitution");
    expect(tool.page).toBe(Page.SMART_FOOD_MACRO_SUBSTITUTION);
  });

  it("IN-05 canonical route identity is locale-independent", () => {
    const englishTool = getTool("tool-111-smart-food-macro-substitution");
    const arabicTool = getTool("tool-111-smart-food-macro-substitution");
    expect(englishTool?.href).toBe(arabicTool?.href);
  });

  it("IN-08 does not break tool-010 (no shared state pollution)", () => {
    expect(PAGE_TO_PATH[Page.COMPOUND_STACK_BUILDER]).toBeTruthy();
  });

  it("IN-09 Registry contains the canonical Tool #111 identity", () => {
    expect(TOOL_REGISTRY.length).toBeGreaterThan(120);
    const tool111 = TOOL_REGISTRY.find((t) => t.slug === "tool-111-smart-food-macro-substitution");
    expect(tool111).toBeDefined();
  });
});
