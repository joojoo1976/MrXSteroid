/**
 * lib/ai/types.ts — AI platform contracts (SPEC §16, §19, §37, §39).
 * ═══════════════════════════════════════════════════════════════════════════
 *  Provider-agnostic contracts for the SmartTools AI layer. These are the
 *  stable extension points required by the spec; concrete capabilities
 *  (vision/voice/memory) are optional and must degrade gracefully.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import type { SearchResult } from '@/lib/tools/search';

export type AiRole = 'system' | 'user' | 'assistant';

export interface AiMessage {
  role: AiRole;
  content: string;
}

export interface AiContext {
  /** Active locale for the response. */
  locale: 'ar' | 'en';
  /** Slug of the tool the user is currently on, if any. */
  currentToolSlug?: string;
  /** Free-form, non-identifiable context supplied by the client. */
  facts?: Record<string, string | number | boolean>;
}

export interface AiRequest {
  messages: AiMessage[];
  context: AiContext;
}

/** Structured, explainable response (SPEC §19: explainable & traceable). */
export interface AiResponse {
  ok: boolean;
  /** 'provider' when a real model answered, 'fallback' when deterministic. */
  source: 'provider' | 'fallback';
  /** True when the AI provider was unavailable or unconfigured. */
  degraded: boolean;
  text: string;
  /** Grounded tool suggestions (never hallucinated tools). */
  suggestions: SearchResult[];
  /** Machine-readable intent detected from the request. */
  intent: AiIntent;
  /** Citations / evidence pointers where claims are made. */
  citations: AiCitation[];
  /** Safety decision applied to this request. */
  safety: AiSafetyDecision;
}

export interface AiCitation {
  label: string;
  source: string;
}

export type AiIntent =
  | 'find-tool'
  | 'explain-concept'
  | 'navigate'
  | 'report'
  | 'emergency'
  | 'dosing-request'
  | 'unknown';

export interface AiSafetyDecision {
  blocked: boolean;
  reason: string | null;
  escalate: boolean;
  emergencyMessage: string | null;
}

/** A provider adapter. Implementations must never throw; return null on failure. */
export interface AiProvider {
  readonly name: string;
  readonly configured: boolean;
  complete(req: AiRequest, systemPrompt: string): Promise<string | null>;
}

// ── Optional capability contracts (SPEC §39, §48-B: contracts, not forced) ──

export interface VisionAnalysisRequest {
  /** Data URL or https URL. Never persisted without explicit consent. */
  imageRef: string;
  task: 'body-composition' | 'meal' | 'pose';
  locale: 'ar' | 'en';
}

export interface VisionAnalysisResult {
  ok: boolean;
  degraded: boolean;
  /** Estimates are explicitly non-clinical. */
  estimates: Record<string, number>;
  disclaimer: string;
}

export interface VoiceCommand {
  transcript: string;
  locale: 'ar' | 'en';
}

export interface VoiceCommandResult {
  ok: boolean;
  intent: AiIntent;
  toolSlug: string | null;
  reply: string;
}

/** Personal memory entry. Stored locally by default (SPEC §15.1, §17). */
export interface MemoryEntry {
  id: string;
  createdAt: string;
  kind: 'note' | 'goal' | 'tool-result';
  value: string;
}
