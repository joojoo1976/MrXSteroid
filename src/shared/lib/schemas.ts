import * as z from "zod";

// Helper for RTL/LTR messages
const getMessage = (isRTL: boolean, ar: string, en: string) => isRTL ? ar : en;

export const createLoginSchema = (isRTL: boolean) => z.object({
    email: z.string().email({ message: getMessage(isRTL, "بريد إلكتروني غير صحيح", "Invalid email address") }),
    password: z.string().min(1, { message: getMessage(isRTL, "كلمة المرور مطلوبة", "Password is required") }),
});

export const createSignupSchema = (isRTL: boolean) => z.object({
    fullName: z.string().min(2, { message: getMessage(isRTL, "الاسم يجب أن يكون طويلاً بما يكفي", "Full name is too short") }),
    username: z.string().min(3, { message: getMessage(isRTL, "اسم المستخدم يجب أن يكون 3 أحرف على الأقل", "Username must be at least 3 characters") })
        .regex(/^[a-zA-Z0-9_]+$/, { message: getMessage(isRTL, "اسم المستخدم يجب أن يحتوي فقط على أحرف وأرقام", "Username must be alphanumeric") }),
    email: z.string().email({ message: getMessage(isRTL, "بريد إلكتروني غير صحيح", "Invalid email address") }),
    password: z.string()
        .min(8, { message: getMessage(isRTL, "كلمة المرور يجب أن تكون 8 أحرف على الأقل", "Password must be at least 8 characters") })
        .regex(/[A-Z]/, { message: getMessage(isRTL, "يجب أن تحتوي على حرف كبير واحد على الأقل", "Must contain at least one uppercase letter") })
        .regex(/[a-z]/, { message: getMessage(isRTL, "يجب أن تحتوي على حرف صغير واحد على الأقل", "Must contain at least one lowercase letter") })
        .regex(/[0-9]/, { message: getMessage(isRTL, "يجب أن تحتوي على رقم واحد على الأقل", "Must contain at least one number") })
        .regex(/[!@#$%^&*(),.?":{}|<>]/, { message: getMessage(isRTL, "يجب أن تحتوي على رمز خاص واحد على الأقل", "Must contain at least one special character") }),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: getMessage(isRTL, "كلمتا المرور غير متطابقتين", "Passwords do not match"),
    path: ["confirmPassword"],
});

export type LoginFormValues = z.infer<ReturnType<typeof createLoginSchema>>;
export type SignupFormValues = z.infer<ReturnType<typeof createSignupSchema>>;
