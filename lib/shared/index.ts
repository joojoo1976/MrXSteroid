// lib/shared/index.ts
/**
 * lib/shared/index.ts
 * Main export for SmartTools Shared Infrastructure
 * Single entry point for all shared utilities
 */

// Contracts
export * from './engine-contract';
export * from './result-contract';
export * from './schema-contract';
export * from './adapter-contract';
export * from './unit-system';
export * from './localization';
export * from './persistence';
export * from './ai-service-design';
export * from './test-utils';
export * from './test-utils-part2';

// Re-export types from contracts for convenience
export type {
  ToolOutput,
  DataProvenance,
  KeyFinding,
  Locale,
  UnitSystem,
  AccessTier,
  SnapshotType,
  DataSource,
  DataQuality,
  FindingSeverity,
} from '@/lib/tools/contracts';