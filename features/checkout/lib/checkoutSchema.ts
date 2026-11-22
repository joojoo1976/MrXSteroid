import * as z from 'zod';
import type { ContentStrings } from '@/shared/types/types';

interface CheckoutSchemaTier {
    requiresShipping?: boolean;
    requiresBodyStats?: boolean;
}

interface BuildCheckoutSchemaInput {
    content: ContentStrings;
    isAr: boolean;
    selectedTier: CheckoutSchemaTier;
}

/** Builds the checkout form schema, including conditional shipping/body-stat rules. */
export function buildCheckoutSchema({ content, isAr, selectedTier }: BuildCheckoutSchemaInput) {
    return z.object({
        fullName: z.string().min(3, { message: content.checkout.validation.nameRequired }),
        email: z.string().email({ message: content.checkout.validation.emailInvalid }),
        country: z.string().min(1, { message: content.checkout.validation.countryRequired }),
        phoneNumber: z.string().optional(),
        secondaryPhoneNumber: z.string().optional(),
        countryCode: z.string().optional(),
        secondaryCountryCode: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        zipCode: z.string().optional(),
        shippingProvider: z.string().optional(),
        weight: z.string().optional(),
        height: z.string().optional(),
        age: z.string().optional(),
        goal: z.string().optional(),
        createAccount: z.boolean(),
        agreeToTerms: z.boolean().refine(val => val === true, {
            message: content.checkout.validation.termsRequired
        }),
    }).superRefine((data, ctx) => {
        if (selectedTier.requiresShipping) {
            if (!data.address || data.address.length < 5) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, message: content.checkout.validation.addressRequired, path: ["address"] });
            }
            if (!data.city) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, message: content.checkout.validation.cityRequired, path: ["city"] });
            }
            // Postal code condition: REQUIRED for International (outside EG), OPTIONAL for Egypt
            if (data.country !== 'EG' && (!data.zipCode || data.zipCode.length < 3)) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, message: isAr ? "الرمز البريدي مطلوب للدول الخارجية" : "Postal Code is required for international orders", path: ["zipCode"] });
            }
            if (!data.shippingProvider) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, message: content.checkout.validation.shippingRequired, path: ["shippingProvider"] });
            }
        }
        if (selectedTier.requiresBodyStats) {
            if (!data.weight) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, message: content.checkout.validation.weightRequired, path: ["weight"] });
            }
            if (!data.height) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, message: content.checkout.validation.heightRequired, path: ["height"] });
            }
        }
    });
}
