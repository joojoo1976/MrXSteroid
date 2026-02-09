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
            const signupOptions = {
                data: {
                    full_name: values.fullName,
                    user_name: values.username,
                },
                emailRedirectTo: window.location.origin + '/dashboard',
            };

            const { data, error } = await supabase.auth.signUp({
                email: values.email,
                password: values.password,
                options: signupOptions,
            });

            if (error) throw error;

            if (!data.user) {
                throw new Error(isRTL ? "فشل إنشاء المستخدم. قد يكون البريد الإلكتروني مستخدماً بالفعل." : "User creation failed. Email might already be in use.");
            }

            setSuccess(true);
            toast.success(content.signupSuccess || (isRTL ? "تم إنشاء الحساب! افحص بريدك الإلكتروني." : "Account created! Check your email."));

            // Auto-redirect to login after 5 seconds
            setTimeout(() => navigateTo(Page.LOGIN), 5000);

        } catch (error) {
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
