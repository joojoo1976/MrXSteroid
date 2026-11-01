import { z } from 'zod';
export const MealInputSchema = z.object({ meal_type:z.enum(['breakfast','lunch','dinner','snack','shake']), plate_size:z.enum(['small','medium','standard','large']), food_items:z.array(z.string().trim().min(1).max(60)).max(24), photo_attached:z.boolean(), photo_quality:z.enum(['poor','medium','high']), photo_consent:z.enum(['given','not_given','declined']) }).strict().refine(v=>!v.photo_attached||v.photo_consent==='given',{message:'Photo consent is required when a photo is attached',path:['photo_consent']});
export type MealInput = z.infer<typeof MealInputSchema>;
