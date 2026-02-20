import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import * as z from 'zod';
import { supabase } from '../../../shared/lib/supabase';
import { errorHandler } from '../../../shared/lib/error-handler';
import { ContentStrings, Page } from '../../../types';
import { mockAuthService } from '../../../shared/lib/mock-auth-service';
import { getAvatarUrl } from '../../../shared/lib/avatar-service';

// Password validation helper - matches auth-service requirements
const isSecurePassword = (password: string): boolean => {
    const minLength = /.{8,}/;
    const hasUpper = /[A-Z]/;
    const hasLower = /[a-z]/;
    const hasNumber = /[0-9]/;
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/;
    return (
        minLength.test(password) &&
        hasUpper.test(password) &&
        hasLower.test(password) &&
        hasNumber.test(password) &&
        hasSpecial.test(password)
    );
};

// Inline signup schema
const createSignupSchema = (isRTL: boolean) => z.object({
    fullName: z.string().min(2, isRTL ? 'الاسم الكامل مطلوب' : 'Full name is required'),
    username: z.string().min(3, isRTL ? 'اسم المستخدم يجب أن يكون 3 أحرف على الأقل' : 'Username must be at least 3 characters'),
    email: z.string().email(isRTL ? 'بريد إلكتروني غير صالح' : 'Invalid email address'),
    password: z.string()
        .min(8, isRTL ? 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' : 'Password must be at least 8 characters')
        .refine(
            (pwd) => isSecurePassword(pwd),
            isRTL
                ? 'كلمة المرور يجب أن تحتوي على حرف كبير، حرف صغير، رقم ورمز خاص'
                : 'Password must contain uppercase, lowercase, number and special character'
        ),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: isRTL ? 'كلمات المرور غير متطابقة' : 'Passwords do not match',
    path: ['confirmPassword'],
});

type SignupFormValues = z.infer<ReturnType<typeof createSignupSchema>>;

interface UseSignupOptions {
    content: ContentStrings;
    isRTL: boolean;
    navigateTo: (page: Page) => void;
}

export const useSignup = ({ content, isRTL, navigateTo }: UseSignupOptions) => {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const signupSchema = createSignupSchema(isRTL);

    const form = useForm<SignupFormValues>({
        resolver: zodResolver(signupSchema),
        defaultValues: {
            fullName: "",
            username: "",
            email: "",
            password: "",
            confirmPassword: "",
        },
    });

    const onSubmit = async (values: SignupFormValues) => {
        setLoading(true);

        try {
            // Check if Supabase is properly configured
            const isSupabaseConfigured = process.env.VITE_SUPABASE_URL && process.env.VITE_SUPABASE_ANON_KEY;

            let result;

            if (isSupabaseConfigured) {
                // Use Supabase for signup
                result = await supabase.auth.signUp({
                    email: values.email,
                    password: values.password,
                    options: {
                        data: {
                            full_name: values.fullName,
                            user_name: values.username,
                            currency: 'USD',
                            role: 'user'
                        },
                        emailRedirectTo: `${window.location.origin}/auth/callback`,
                    },
                });

                // Check for duplicate identity (for Supabase)
                if (result.error && (result.error.message?.includes('User already registered') || result.error.message?.includes('Email already exists'))) {
                    toast.error(isRTL ? "هذا البريد الإلكتروني مسجل بالفعل." : "This email is already registered.");
                    return;
                }

                if (result.error) throw result.error;
            } else {
                // Use mock auth service when Supabase is not configured
                result = await mockAuthService.signUp(
                    values.email,
                    values.password,
                    values.fullName,
                    values.username
                );

                if (result.error) throw new Error(result.error);
            }

            setSuccess(true);

            // Store Gravatar URL as default avatar for email signups
            if (isSupabaseConfigured && 'data' in result && result.data?.user?.id) {
                try {
                    const avatarUrl = getAvatarUrl({ email: values.email });
                    await supabase.from('profiles').update({ avatar_url: avatarUrl })
                        .eq('id', result.data.user.id);
                } catch (avatarErr) {
                    console.warn('Could not set default avatar:', avatarErr);
                }
            }

            toast.success(content.signupSuccess || (isRTL ? "تم إنشاء الحساب! افحص بريدك الإلكتروني للتحقق." : "Account created! Check your email to verify."));

            setTimeout(() => navigateTo(Page.LOGIN), 5000);

        } catch (error: unknown) {
            console.error('Signup error:', error);

            let errorMessage = isRTL ? "حدث خطأ أثناء إنشاء الحساب." : "An error occurred during signup.";

            if (error instanceof Error) {
                if (error.message.includes('User already registered') || error.message.includes('Email already exists')) {
                    errorMessage = isRTL ? "هذا البريد الإلكتروني مسجل بالفعل." : "This email is already registered.";
                } else if (error.message?.includes('fetch') || error.message?.includes('network')) {
                    errorMessage = isRTL ? "خطأ في الشبكة: يرجى التحقق من اتصالك بالإنترنت." : "Network error: Please check your connection.";
                } else if (error.message?.includes('RATE_LIMIT_EXCEEDED') || error.message?.includes('Too many requests')) {
                    errorMessage = isRTL ? "لقد حاولت عدة مرات. يرجى الانتظار قليلاً." : "Too many requests. Please wait a moment.";
                } else if (error.message?.includes('INVALID_EMAIL_FORMAT')) {
                    errorMessage = isRTL ? "تنسيق البريد الإلكتروني غير صحيح." : "Invalid email format.";
                } else if (error.message?.includes('WEAK_PASSWORD_REQUIREMENTS')) {
                    errorMessage = isRTL ? "كلمة المرور لا تفي بشروط الأمان." : "Password does not meet security requirements.";
                } else {
                    errorMessage = error.message;
                }
            }

            toast.error(errorMessage);
            await errorHandler.handle(error, 'Signup');
        } finally {
            setLoading(false);
        }
    };

    return {
        form,
        loading,
        success,
        onSubmit: form.handleSubmit(onSubmit)
    };
};
