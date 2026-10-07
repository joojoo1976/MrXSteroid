/**
 * Guest User State Management
 * MrXSteroid.com - 100 Tools Suite
 * PURE MODULE — no React, no DOM, no Supabase, no `Date`, no I/O (except LocalStorage)
 * 
 * For non-logged-in users: state managed via LocalStorage
 * Syncs to Supabase on login, then LocalStorage is cleared
 */

// ─────────────────────────────────────────────────────────────────────────────
// LocalStorage State Persistence
// ─────────────────────────────────────────────────────────────────────────────

/** Retrieve tool state from LocalStorage */
export function getGuestState(): any | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem('toolState');
  return stored ? JSON.parse(stored) : null;
}

/** Save tool state to LocalStorage */
export function saveGuestState(state: any) {
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

/** Sync guest state to Supabase when user logs in */
export async function syncGuestStateToSupabase(
  userId: string,
  supabase: any, // SupabaseClient
  guestState: any | null
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
      });

    if (error) throw error;

    // Clear LocalStorage after successful sync
    clearGuestState();
    return true;
  } catch (error) {
    console.error('Failed to sync guest state to Supabase:', error);
    return false;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper: Convert Tool State Shape for DB Insert
// ─────────────────────────────────────────────────────────────────────────────

/** Convert LocalStorage guest state shape to DB insert shape */
export function mapGuestStateToDb(guestState: any): any {
  return {
    user_id: guestState.userId || '',
    current_stack: guestState.currentStack || [],
    s_score: guestState.sScore,
    washout_date: guestState.washoutDate,
    pct_duration_weeks: guestState.pctDurationWeeks,
    selected_serm: guestState.selectedSerm || 'enclomiphene',
    hcg_phases: guestState.hcgPhases || [],
    serm_phases: guestState.sermPhases || [],
    input_data: guestState.inputData || {},
    current_protocol: guestState.currentProtocol,
    updated_at: new Date().toISOString(),
  };
}