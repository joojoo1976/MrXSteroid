/**
 * lib/tools/schemas/toolLogSchema.ts
 * ═══════════════════════════════════════════════════════════════════════════
 *  Layer 2 — Zod validation boundary for the shared tool-log persistence
 *  contract (mirrors `public.user_tool_logs` and `lib/tools/contracts.ts`).
 * ═══════════════════════════════════════════════════════════════════════════
 * Every payload that crosses the network (`POST /api/tools/logs`) or is read
 * back from Supabase passes through here first. Rejects NaN/Infinity, unknown
 * keys, oversized bodies and out-of-range values (zero-trust boundary).
 *
 * Follows the `lib/schemas/calculatorSchema.ts` conventions:
 *   `.strict()` objects, `finite()` numbers, and a `tryParse*` safe variant.
 */
import { z } from 'zod';
import {
    ACCESS_TIERS,
    DATA_QUALITIES,
    DATA_SOURCES,
    FINDING_SEVERITIES,
    LOCALES,
    MAX_TOOL_LOG_BYTES,
    SNAPSHOT_TYPES,
    TOOL_SLUG_PATTERN,
    UNIT_SYSTEMS,
} from '../contracts';

/** Re-exported so HTTP/server code has one cap constant (`lib/tools/contracts.ts`). */
export { MAX_TOOL_LOG_BYTES };

const kebabSlug = z.string().regex(TOOL_SLUG_PATTERN, 'must be a kebab-case tool slug');

const semver = z.string().regex(/^\d+\.\d+\.\d+$/, 'must be semver (x.y.z)');

const isoDateTime = z.string().refine((value) => !Number.isNaN(Date.parse(value)), {
    message: 'must be an ISO-8601 timestamp',
});

const finite = (min: number, max: number) =>
    z.number().finite().min(min, `must be ≥ ${min}`).max(max, `must be ≤ ${max}`);

/** JSONB column payloads — objects only, never arrays or scalars. */
export const jsonObjectSchema = z.record(z.string(), z.unknown());

export const referenceRangeSchema = z.object({
    low: z.number().finite().optional(),
    high: z.number().finite().optional(),
    unit: z.string().min(1).max(32),
    source: z.string().max(120).optional(),
}).strict();

export const dataProvenanceSchema = z.object({
    source: z.enum(DATA_SOURCES),
    recordedAt: isoDateTime,
    timezone: z.string().min(1).max(64),
    unit: z.string().min(1).max(32),
    originalUnit: z.string().min(1).max(32).optional(),
    measurementMethod: z.string().max(120).optional(),
    deviceId: z.string().max(120).optional(),
    confidence: finite(0, 1),
    dataQuality: z.enum(DATA_QUALITIES),
    referenceRange: referenceRangeSchema.optional(),
}).strict();

export const keyFindingSchema = z.object({
    code: z.string().min(1).max(64),
    labelAr: z.string().min(1).max(240),
    labelEn: z.string().min(1).max(240),
    value: z.union([z.string().max(240), z.number().finite()]),
    severity: z.enum(FINDING_SEVERITIES),
}).strict();

export const toolLinkSchema = z.object({
    titleAr: z.string().min(1).max(120),
    titleEn: z.string().min(1).max(120),
    slug: kebabSlug,
}).strict();

export const seoLinksSchema = z.object({
    prevTool: toolLinkSchema,
    nextTool: toolLinkSchema,
}).strict();

/** The fixed `ToolOutput` envelope; `result` is validated per contract, not here. */
export const toolOutputSchema = z.object({
    toolId: z.string().min(1).max(80),
    toolSlug: kebabSlug,
    calculatedAt: isoDateTime,
    locale: z.enum(LOCALES),
    unitSystem: z.enum(UNIT_SYSTEMS),
    accessTier: z.enum(ACCESS_TIERS),
    snapshotType: z.enum(SNAPSHOT_TYPES),
    result: z.unknown(),
    provenance: dataProvenanceSchema,
    keyFindings: z.array(keyFindingSchema).max(50),
    seoLinks: seoLinksSchema,
}).strict();

/** Exact POST body accepted by `app/api/tools/logs/route.ts`. */
export const toolLogCommitSchema = z.object({
    toolSlug: kebabSlug,
    toolVersion: semver,
    snapshotType: z.enum(SNAPSHOT_TYPES),
    locale: z.enum(LOCALES),
    unitSystem: z.enum(UNIT_SYSTEMS),
    inputs: jsonObjectSchema,
    outputSnapshot: toolOutputSchema,
    provenance: dataProvenanceSchema,
}).strict();

/** GET query string contract (`?tool=macro&snapshotType=draft&limit=25`). */
export const toolLogQuerySchema = z.object({
    tool: kebabSlug.optional(),
    snapshotType: z.enum(SNAPSHOT_TYPES).optional(),
    limit: z.coerce.number().int().min(1).max(100).default(50),
}).strict();

export type ToolLogCommit = z.infer<typeof toolLogCommitSchema>;
export type ToolLogQuery = z.infer<typeof toolLogQuerySchema>;

/** Throwing parse — used by the API route after auth succeeds. */
export function parseToolLogCommit(raw: unknown): ToolLogCommit {
    return toolLogCommitSchema.parse(raw);
}

/** Safe parse — returns a typed error instead of throwing (adapter/server use). */
export function tryParseToolLogCommit(
    raw: unknown,
): { ok: true; data: ToolLogCommit } | { ok: false; error: z.ZodError } {
    const result = toolLogCommitSchema.safeParse(raw);
    return result.success ? { ok: true, data: result.data } : { ok: false, error: result.error };
}

/** Column-name → contract-field mapper for rows read back from Supabase. */
export interface ToolLogRow {
    id: string;
    user_id: string;
    tool_slug: string;
    tool_version: string;
    snapshot_type: string;
    inputs: unknown;
    output_snapshot: unknown;
    provenance: unknown;
    locale: string;
    unit_system: string;
    created_at: string;
    updated_at: string;
}
