/** Validation for user-entered history rows. No timing or safety policy is implied. */
import { z } from 'zod';

export const InjectionSiteLogEntrySchema = z.object({
  id: z.string().uuid(),
  date: z.string().datetime({ offset: true }),
  site: z.string().trim().min(1).max(120),
  location: z.enum(['deltoid', 'glute', 'quad', 'pectoral', 'bicep', 'other']),
  oil_based: z.boolean(),
}).strict();

export const InjectionSiteHistorySchema = z.object({
  entries: z.array(InjectionSiteLogEntrySchema).max(500),
}).strict();

export type InjectionSiteLogEntry = z.infer<typeof InjectionSiteLogEntrySchema>;
export type InjectionSiteHistory = z.infer<typeof InjectionSiteHistorySchema>;
