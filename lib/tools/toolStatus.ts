/**
 * lib/tools/toolStatus.ts — SPEC §49
 * ═══════════════════════════════════════════════════════════════════════════
 *  Separation of development / publication / availability / access / review
 *  status. A single `status` field conflates these concerns (see §49), so we
 *  model them independently.
 *
 *  This module is metadata only. It never renders a calculator and never
 *  produces results for an unimplemented tool (§7, §24, §49).
 * ═══════════════════════════════════════════════════════════════════════════
 */

/** How complete the tool *development* is. */
export type DevelopmentStatus =
  | 'planned'
  | 'in-progress'
  | 'beta'
  | 'completed'
  | 'deprecated';

/** Whether it appears in the catalogue and has a public page. */
export type PublicationStatus = 'draft' | 'listed' | 'published' | 'archived';

/** Whether it can be run right now. */
export type AvailabilityStatus = 'available' | 'unavailable' | 'maintenance';

/** Which existing access policy applies. */
export type AccessPolicy = 'public' | 'authenticated' | 'existing-entitlement';

/** Content review state when a review is required. */
export type ReviewStatus = 'not-required' | 'pending' | 'approved' | 'needs-update';

/** Technical integration verification state (separate report, §49). */
export type VerificationStatus =
  | 'not-checked'
  | 'component-found'
  | 'integration-verified'
  | 'blocked';

export type RiskLevel = 'low' | 'medium' | 'high';

/** A tool is *runnable* only when development is completed/beta AND available. */
export function isRunnable(t: {
  developmentStatus: DevelopmentStatus;
  availabilityStatus: AvailabilityStatus;
}): boolean {
  return (
    (t.developmentStatus === 'completed' || t.developmentStatus === 'beta') &&
    t.availabilityStatus === 'available'
  );
}

/** A tool may be publicly indexed only when published + runnable + review-clear. */
export function isIndexable(t: {
  developmentStatus: DevelopmentStatus;
  availabilityStatus: AvailabilityStatus;
  publicationStatus: PublicationStatus;
  reviewStatus: ReviewStatus;
}): boolean {
  return (
    isRunnable(t) &&
    (t.publicationStatus === 'published' || t.publicationStatus === 'listed') &&
    t.reviewStatus !== 'needs-update' &&
    t.reviewStatus !== 'pending'
  );
}

export const DEFAULT_DEVELOPMENT_STATUS: DevelopmentStatus = 'planned';
export const DEFAULT_PUBLICATION_STATUS: PublicationStatus = 'draft';
export const DEFAULT_AVAILABILITY_STATUS: AvailabilityStatus = 'unavailable';
export const DEFAULT_ACCESS_POLICY: AccessPolicy = 'public';
export const DEFAULT_REVIEW_STATUS: ReviewStatus = 'not-required';
