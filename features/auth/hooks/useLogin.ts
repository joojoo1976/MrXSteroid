'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import * as z from 'zod';
import { errorHandler } from '../../../shared/lib/error-handler';
import { readEnv } from '../../../shared/lib/env-reader';
import { Page } from '@/shared/types/types';
import { mockAuthService } from '../../../shared/lib/mock-auth-service';

import { authService } from '../../../shared/lib/auth-service';

// Dual login schema (Email OR Phone Number)
const createLoginSchema = (isRTL: boolean) => z.object({
    identifier: z.string().min(1, isRTL ? 'البريد الإلكتروني أو رقم الهاتف مطلوب' : 'Email or phone number is required')
        .refine((val) => {
            const clean = val.trim();
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const phoneRegex = /^\+?[0-9\s\-()]{7,20}$/;
            return emailRegex.test(clean) || phoneRegex.test(clean);
        }, {
            message: isRTL ? 'يرجى إدخال بريد إلكتروني صحيح أو رقم هاتف مغاير' : 'Please enter a valid email address or phone number'
        }),
    password: z.string().min(1, isRTL ? 'كلمة المرور مطلوبة' : 'Password is required'),
});

type LoginFormValues = z.infer<ReturnType<typeof createLoginSchema>>;

interface UseLoginOptions {
    isRTL: boolean;
    navigateTo: (page: Page) => void;
    refreshUser?: () => Promise<void>;
}

const MAX_ATTEMPTS = 5;
const LOCKOUT_TIME = 30000; // 30 seconds

export const useLogin = ({ isRTL, navigateTo, refreshUser }: UseLoginOptions) => {
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
            identifier: "",
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

            const isSupabaseConfigured = (readEnv('VITE_SUPABASE_URL') || readEnv('NEXT_PUBLIC_SUPABASE_URL')) && (readEnv('VITE_SUPABASE_ANON_KEY') || readEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'));

            let result;

            if (isSupabaseConfigured) {
                // Use Enterprise authService for dual identifier login (email or phone)
                result = await authService.signIn(values.identifier, values.password);

                if (result.error) {
                    setAttempts((prev) => prev + 1);
                    const errStr = typeof result.error === 'string' ? result.error : result.error.message;
                    if (errStr.includes('Email not confirmed')) {
                        toast.error(isRTL ? "يرجى تأكيد بريدك الإلكتروني عبر الرابط المرسل إليك أولاً." : "Please verify your email address via the sent link first.");
                        return;
                    }
                    if (errStr.includes('No account found with this phone number')) {
                        toast.error(isRTL ? "عفواً، لا يوجد حساب مسجل برقم الهاتف هذا. تحقق من الرقم أو أنشئ حساباً جديداً." : "No account found with this phone number. Please check the number or sign up.");
                        return;
                    }
                    if (errStr.includes('Invalid login credentials') || errStr.includes('invalid credentials')) {
                        toast.error(isRTL ? "بيانات الدخول غير صحيحة (البريد الإلكتروني/رقم الهاتف أو كلمة المرور)." : "Invalid login credentials (email/phone or password).");
                        return;
                    }
                    throw new Error(errStr);
                }
            } else {
                // Use mock auth service when Supabase is not configured
                result = await mockAuthService.signIn(values.identifier, values.password);

                if (result.error) {
                    setAttempts((prev) => prev + 1);
                    throw new Error(result.error);
                }
            }

            toast.success(isRTL ? 'تم تسجيل الدخول بنجاح!' : 'Login successful!');
            if (refreshUser) {
                await refreshUser();
            }
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
