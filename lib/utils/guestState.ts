/**
 * Guest User State Management
 * MrXSteroid.com - 100 Tools Suite
 * PURE MODULE — no React, no DOM, no Supabase, no `Date`, no I/O (except LocalStorage)
 *
 * For non-logged-in users: state managed via LocalStorage
 * Syncs to Supabase on login, then LocalStorage is cleared
 */

// ─────────────────────────────────────────────────────────────────────────────
// Type Definitions
// ─────────────────────────────────────────────────────────────────────────────

export interface StackItem {
  name_en: string;
  name_ar?: string;
  weekly_dose_mg?: number;
  ester?: string;
  [key: string]: unknown;
}

export interface GuestState {
  current_stack: StackItem[];
  s_score?: number;
  washout_date?: string;
  pct_duration_weeks?: number;
  selected_serm?: string;
  hcg_phases: HcgPhase[];
  serm_phases: SermPhase[];
  input_data?: Record<string, unknown>;
  current_protocol?: string;
}

export interface HcgPhase {
  start_date: string;
  end_date: string;
  dose_iu: number;
  frequency: string;
}

export interface SermPhase {
  start_date: string;
  end_date: string;
  compound: string;
  dose_mg: number;
  frequency: string;
}

export interface GuestStateDbInsert {
  user_id: string;
  current_stack: StackItem[];
  s_score: number;
  washout_date?: string;
  pct_duration_weeks?: number;
  selected_serm: string;
  hcg_phases: HcgPhase[];
  serm_phases: SermPhase[];
  input_data: Record<string, unknown>;
  current_protocol?: string;
  updated_at: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// LocalStorage State Persistence
// ─────────────────────────────────────────────────────────────────────────────

/** Retrieve tool state from LocalStorage */
export function getGuestState(): GuestState | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem('toolState');
  return stored ? (JSON.parse(stored) as GuestState) : null;
}

/** Save tool state to LocalStorage */
export function saveGuestState(state: GuestState) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('toolState', JSON.stringify(state));
}

/** Remove tool state from LocalStorage (after sync to DB) */
export function clearGuestState() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('toolState');
}

// ─────────────────────────────────────────────────────────────────────────────
// Guest → DB Synchronization
// ─────────────────────────────────────────────────────────────────────────────

// Supabase client interface (minimal required methods)
interface SupabaseClientLike {
  from(table: string): {
    upsert(data: GuestStateDbInsert): Promise<{ error: Error | null }>;
  };
}

/** Sync guest state to Supabase when user logs in */
export async function syncGuestStateToSupabase(
  userId: string,
  supabase: SupabaseClientLike,
  guestState: GuestState | null
): Promise<boolean> {
  if (!guestState) return false; // Nothing to sync

  try {
    // Upsert the guest state into user_tool_states
    const { error } = await supabase
      .from('user_tool_states')
      .upsert({
        user_id: userId,
        current_stack: guestState.current_stack,
        s_score: guestState.s_score,
        washout_date: guestState.washout_date,
        pct_duration_weeks: guestState.pct_duration_weeks,
        selected_serm: guestState.selected_serm,
        hcg_phases: guestState.hcg_phases,
        serm_phases: guestState.serm_phases,
        input_data: guestState.input_data,
        current_protocol: guestState.current_protocol,
        updated_at: new Date().toISOString(),
      } as GuestStateDbInsert);

    if (error) throw error;

    // Clear LocalStorage after successful sync
    clearGuestState();
    return true;
  } catch (error) {
    console.error('Failed to sync guest state to Supabase:', error);
    return false;
  }
}

/** Convert LocalStorage guest state shape to DB insert shape */
export function mapGuestStateToDb(
  userId: string,
  guestState: GuestState
): GuestStateDbInsert {
  return {
    user_id: userId,
    current_stack: guestState.current_stack || [],
    s_score: guestState.s_score || 0,
    washout_date: guestState.washout_date,
    pct_duration_weeks: guestState.pct_duration_weeks,
    selected_serm: guestState.selected_serm || 'enclomiphene',
    hcg_phases: guestState.hcg_phases || [],
    serm_phases: guestState.serm_phases || [],
    input_data: guestState.input_data || {},
    current_protocol: guestState.current_protocol,
    updated_at: new Date().toISOString(),
  };
}
