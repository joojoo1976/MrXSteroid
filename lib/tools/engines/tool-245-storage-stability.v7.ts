import { StorageObservationInputV7Schema } from '@/lib/tools/schemas/tool-245-storage-stability-estimator.v7';

export function recordStorageNote(raw: unknown) {
  return {
    status: 'RECORDED' as const,
    resultType: 'USER_PROVIDED' as const,
    entry: StorageObservationInputV7Schema.parse(raw),
    limitations: [
      'User note only; no stability, degradation, expiration, sterility, safety, or shelf-life conclusion.',
      'The note is not independently verified and is not persisted by this tool.',
    ],
  };
}
