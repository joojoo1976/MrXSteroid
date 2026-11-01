/**
 * Tool #009 — user-entered injection-site history types.
 * This module intentionally contains no interval recommendations, safety
 * determinations, or injection calculations.
 */
export interface InjectionSiteLogEntry {
  id: string;
  date: string;
  site: string;
  location: 'deltoid' | 'glute' | 'quad' | 'pectoral' | 'bicep' | 'other';
  oil_based: boolean;
}

export interface InjectionSiteHistory {
  entries: InjectionSiteLogEntry[];
}
