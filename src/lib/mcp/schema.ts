
import { z } from 'zod';

// Base Entity Type
export const EntitySchema = z.object({
    id: z.string().uuid(),
    created_at: z.string().datetime(),
    updated_at: z.string().datetime(),
    type: z.enum(['user', 'cycle', 'steroid', 'health_marker', 'payment', 'observation']),
});

// 1. User Entity (links to Supabase Auth)
export const UserEntitySchema = EntitySchema.extend({
    type: z.literal('user'),
    supabase_id: z.string().uuid(),
    email: z.string().email(),
    full_name: z.string().optional(),
    full_name_ar: z.string().optional(), // Arabic support
    language: z.enum(['en', 'ar']).default('en'),
});

// 2. Steroid Type Entity (Knowledge Base)
export const SteroidEntitySchema = EntitySchema.extend({
    type: z.literal('steroid'),
    name: z.string(),
    name_ar: z.string(), // Arabic Name
    half_life_hours: z.number(),
    detection_time_weeks: z.number(),
    anabolic_rating: z.number(),
    androgenic_rating: z.number(),
    side_effects: z.array(z.string()),
});

// 3. Cycle Entity (A planned or completed regime)
export const CycleEntitySchema = EntitySchema.extend({
    type: z.literal('cycle'),
    user_id: z.string().uuid(),
    name: z.string(),
    start_date: z.string().date(),
    end_date: z.string().date(),
    goal: z.enum(['bulking', 'cutting', 'recomp', 'strength']).default('bulking'),
    notes: z.string().optional(),
    compounds: z.array(
        z.object({
            steroid_id: z.string().uuid(),
            dosage: z.string(), // e.g., "500mg/week"
            frequency: z.string(), // e.g., "Every Monday and Thursday"
        })
    ),
    status: z.enum(['planned', 'active', 'completed', 'abandoned']),
});

// 4. Health Marker Entity (Lab results or metrics)
export const HealthMarkerEntitySchema = EntitySchema.extend({
    type: z.literal('health_marker'),
    user_id: z.string().uuid(),
    marker_name: z.string(), // e.g., "Testosterone Total", "ALT", "AST"
    marker_name_ar: z.string().optional(),
    value: z.number(),
    unit: z.string(),
    reference_range_low: z.number().optional(),
    reference_range_high: z.number().optional(),
    date_measured: z.string().date(),
    source: z.enum(['lab_report', 'manual_entry', 'device']).default('manual_entry'),
});

// 5. Payment Entity (Linked to financial transactions)
export const PaymentEntitySchema = EntitySchema.extend({
    type: z.literal('payment'),
    user_id: z.string().uuid(),
    amount: z.number(),
    currency: z.string(),
    status: z.enum(['success', 'pending', 'failed']),
    spaceremit_code: z.string().optional(),
    transaction_date: z.string().datetime(),
});

// 6. Observation Entity (New log entries, subjective feelings)
export const ObservationEntitySchema = EntitySchema.extend({
    type: z.literal('observation'),
    user_id: z.string().uuid(),
    content: z.string(), // "Feeling aggressive today", "Libido is down"
    sentiment: z.enum(['positive', 'negative', 'neutral']),
    embedding: z.array(z.number()).optional(), // For vector search
    related_entity_id: z.string().uuid().optional(), // Link to specific cycle or marker
});

// Union of all entities
export const GraphNodeSchema = z.discriminatedUnion('type', [
    UserEntitySchema,
    SteroidEntitySchema,
    CycleEntitySchema,
    HealthMarkerEntitySchema,
    PaymentEntitySchema,
    ObservationEntitySchema,
]);

export type UserEntity = z.infer<typeof UserEntitySchema>;
export type SteroidEntity = z.infer<typeof SteroidEntitySchema>;
export type CycleEntity = z.infer<typeof CycleEntitySchema>;
export type HealthMarkerEntity = z.infer<typeof HealthMarkerEntitySchema>;
export type PaymentEntity = z.infer<typeof PaymentEntitySchema>;
export type ObservationEntity = z.infer<typeof ObservationEntitySchema>;
export type GraphNode = z.infer<typeof GraphNodeSchema>;

// Edge Types
export const EdgeType = z.enum([
    'HAS_CYCLE',       // User -> Cycle
    'USED_STEROID',    // Cycle -> Steroid
    'RECORDED_MARKER', // User -> Health Marker
    'MADE_PAYMENT',    // User -> Payment
    'NEXT_CYCLE',      // Cycle -> Cycle (Temporal)
    'RELATED_TO',      // Observation -> Any
    'AFFECTS',         // Steroid -> Health Marker (Knowledge Base relation)
]);

export const EdgeSchema = z.object({
    source_id: z.string().uuid(),
    target_id: z.string().uuid(),
    type: EdgeType,
    weight: z.number().default(1.0),
});

export type Edge = z.infer<typeof EdgeSchema>;
