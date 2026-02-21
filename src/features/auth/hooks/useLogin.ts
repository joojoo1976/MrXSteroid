import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import * as z from 'zod';
import { supabase } from '../../../shared/lib/supabase';
import { errorHandler } from '../../../shared/lib/error-handler';
import { Page } from '../../../types';
import { mockAuthService } from '../../../shared/lib/mock-auth-service';

// Inline login schema
const createLoginSchema = (isRTL: boolean) => z.object({
    email: z.string().email(isRTL ? 'بريد إلكتروني غير صالح' : 'Invalid email address'),
    password: z.string().min(1, isRTL ? 'كلمة المرور مطلوبة' : 'Password is required'),
});

type LoginFormValues = z.infer<ReturnType<typeof createLoginSchema>>;

interface UseLoginOptions {
    isRTL: boolean;
    navigateTo: (page: Page) => void;
}

const MAX_ATTEMPTS = 5;
const LOCKOUT_TIME = 30000; // 30 seconds

export const useLogin = ({ isRTL, navigateTo }: UseLoginOptions) => {
    const [loading, setLoading] = useState(false);
    const [attempts, setAttempts] = useState(0);
    const [isLocked, setIsLocked] = useState(false);
    const [lockoutTimer, setLockoutTimer] = useState(0);

    // Check for verified parameter
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('verified') === 'true') {
            toast.success(isRTL ? "تم تفعيل حسابك بنجاح! يمكنك الآن تسجيل الدخول." : "Account verified successfully! You can now log in.");
        }
    }, [isRTL]);

    // Rate Limiting Logic
    useEffect(() => {
        if (attempts >= MAX_ATTEMPTS) {
            setIsLocked(true);
            setLockoutTimer(LOCKOUT_TIME / 1000);
            const interval = setInterval(() => {
                setLockoutTimer((prev) => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        setIsLocked(false);
                        setAttempts(0);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [attempts]);

    const loginSchema = createLoginSchema(isRTL);

    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const onSubmit = async (values: LoginFormValues) => {
        if (isLocked) {
            toast.error(isRTL ? `حاول مرة أخرى بعد ${lockoutTimer} ثانية` : `Too many attempts. Try again in ${lockoutTimer}s`);
            return;
        }

        try {
            setLoading(true);

            // Check if Supabase is properly configured
            const isSupabaseConfigured = import.meta.env.NEXT_PUBLIC_SUPABASE_URL && import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

            let result;

            if (isSupabaseConfigured) {
                // Use Supabase for login
                result = await supabase.auth.signInWithPassword({
                    email: values.email,
                    password: values.password,
                });

                if (result.error) {
                    setAttempts((prev) => prev + 1);
                    throw result.error;
                }
            } else {
                // Use mock auth service when Supabase is not configured
                result = await mockAuthService.signIn(values.email, values.password);

                if (result.error) {
                    setAttempts((prev) => prev + 1);
                    throw new Error(result.error);
                }
            }

            toast.success(isRTL ? 'تم تسجيل الدخول بنجاح!' : 'Login successful!');
            navigateTo(Page.DASHBOARD);
        } catch (error) {
            await errorHandler.handle(error, 'Login');
        } finally {
            setLoading(false);
        }
    };

    return {
        form,
        loading,
        isLocked,
        lockoutTimer,
        onSubmit: form.handleSubmit(onSubmit)
    };
};
