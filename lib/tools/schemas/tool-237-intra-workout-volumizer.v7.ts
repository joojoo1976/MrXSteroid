import { z } from 'zod';

export const IntraWorkoutLabelInputV7Schema = z.object({
  productName: z.string().trim().min(1).max(100),
  sourceReference: z.string().trim().min(1).max(500),
  servingVolumeMl: z.number().finite().min(0.1).max(5000),
  servingsConsumed: z.number().finite().min(0.01).max(50),
  caloriesPerServing: z.number().finite().min(0).max(10000),
  proteinGramsPerServing: z.number().finite().min(0).max(1000),
  carbohydrateGramsPerServing: z.number().finite().min(0).max(1000),
  fatGramsPerServing: z.number().finite().min(0).max(500),
}).strict();

export type IntraWorkoutLabelInputV7 = z.infer<typeof IntraWorkoutLabelInputV7Schema>;
