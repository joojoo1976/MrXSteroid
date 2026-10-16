'use client';

/**
 * app/smarttools/tool-111-smart-food-macro-substitution/page.tsx
 * ═══════════════════════════════════════════════════════════════════════════
 *  Tool #111 — Smart Food & Macro Substitution — Route Page (Phase 4)
 * ═══════════════════════════════════════════════════════════════════════════
 *  - Connects Schema + Adapter + Component + i18n (AR/EN, RTL/LTR)
 *  - No Supabase, no RLS, no AI integration
 */

import Tool111SmartFoodMacroSubstitution from '@/components/tools/tool-111-smart-food-macro-substitution';

export default function Tool111SmartFoodMacroSubstitutionPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <Tool111SmartFoodMacroSubstitution />
    </div>
  );
}