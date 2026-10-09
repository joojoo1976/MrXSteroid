import { supabase, UserToolState, UserPreferences } from './client';

export async function saveToolState(state: {
  userId: string;
  toolId: number;
  inputs: Record<string, any>;
  outputs: Record<string, any>;
  units: 'metric' | 'imperial';
  language: 'ar' | 'en';
}): Promise<void> {
  const { error } = await supabase
    .from('user_tool_states')
    .upsert({
      user_id: state.userId,
      tool_id: state.toolId,
      inputs: state.inputs,
      outputs: state.outputs,
      units: state.units,
      language: state.language,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id,tool_id',
    });

  if (error) {
    console.error('Failed to save tool state:', error);
    throw error;
  }
}

export async function loadToolState(
  userId: string,
  toolId: number
): Promise<UserToolState | null> {
  const { data, error } = await supabase
    .from('user_tool_states')
    .select('*')
    .eq('user_id', userId)
    .eq('tool_id', toolId)
    .single();

  if (error || !data) {
    return null;
  }

  return data as UserToolState;
}

export async function getUserPreferences(userId: string): Promise<UserPreferences | null> {
  const { data, error } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    return null;
  }

  return data as UserPreferences;
}

export async function updateUserPreferences(
  userId: string,
  preferences: Partial<UserPreferences>
): Promise<void> {
  const { error } = await supabase
    .from('user_preferences')
    .upsert({
      user_id: userId,
      ...preferences,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id',
    });

  if (error) {
    console.error('Failed to update preferences:', error);
    throw error;
  }
}

export async function trackToolUsage(
  userId: string,
  toolId: number,
  action: string,
  metadata?: Record<string, any>
): Promise<void> {
  const { error } = await supabase
    .from('tool_usage_analytics')
    .insert({
      user_id: userId,
      tool_id: toolId,
      action,
      metadata: metadata || {},
    });

  if (error) {
    console.error('Failed to track usage:', error);
  }
}

export async function getToolUsageCount(toolId: number): Promise<number> {
  const { count, error } = await supabase
    .from('tool_usage_analytics')
    .select('*', { count: 'exact', head: true })
    .eq('tool_id', toolId);

  if (error) {
    console.error('Failed to get usage count:', error);
    return 0;
  }

  return count || 0;
}

export async function saveVoiceCommand(command: {
  userId: string;
  commandText: string;
  intent?: string;
  toolSlug?: string;
  confidence?: number;
  executed: boolean;
}): Promise<void> {
  const { error } = await supabase
    .from('user_voice_commands')
    .insert({
      user_id: command.userId,
      command_text: command.commandText,
      intent: command.intent,
      tool_slug: command.toolSlug,
      confidence: command.confidence,
      executed: command.executed,
    });

  if (error) {
    console.error('Failed to save voice command:', error);
  }
}

export async function getAIUserProfile(userId: string): Promise<any> {
  const { data, error } = await supabase
    .from('ai_user_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}

export async function updateAIUserProfile(
  userId: string,
  profile: Partial<any>
): Promise<void> {
  const { error } = await supabase
    .from('ai_user_profiles')
    .upsert({
      user_id: userId,
      ...profile,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id',
    });

  if (error) {
    console.error('Failed to update AI profile:', error);
    throw error;
  }
}