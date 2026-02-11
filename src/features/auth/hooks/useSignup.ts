import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { supabase } from '../../../lib/supabase';
import { errorHandler } from '../../../lib/error-handler';
import { createSignupSchema, SignupFormValues } from '../../../lib/schemas';
import { ContentStrings, Page } from '../../../types';

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
            const { data, error } = await supabase.auth.signUp({
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

            if (error) throw error;

            if (data.user?.identities && data.user.identities.length === 0) {
                toast.error(isRTL ? "هذا البريد الإلكتروني مسجل بالفعل." : "This email is already registered.");
                return;
            }

            setSuccess(true);
            toast.success(content.signupSuccess || (isRTL ? "تم إنشاء الحساب! افحص بريدك الإلكتروني للتحقق." : "Account created! Check your email to verify."));

            setTimeout(() => navigateTo(Page.LOGIN), 5000);

        } catch (error: unknown) {
            console.error('Signup error:', error);

            let errorMessage = isRTL ? "حدث خطأ أثناء إنشاء الحساب." : "An error occurred during signup.";

            if (error.message?.includes('User already registered') || error.status === 400) {
                errorMessage = isRTL ? "هذا البريد الإلكتروني مسجل بالفعل." : "This email is already registered.";
            } else if (error.message?.includes('fetch') || error.message?.includes('network')) {
                errorMessage = isRTL ? "خطأ في الشبكة: يرجى التحقق من اتصالك بالإنترنت." : "Network error: Please check your connection.";
            } else if (error.status === 429) {
                errorMessage = isRTL ? "لقد حاولت عدة مرات. يرجى الانتظار قليلاً." : "Too many requests. Please wait a moment.";
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
