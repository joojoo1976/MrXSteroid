'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import * as z from 'zod';
import { supabase } from '../../../shared/lib/supabase';
import { readEnv } from '../../../shared/lib/env-reader';
import { errorHandler } from '../../../shared/lib/error-handler';
import { ContentStrings } from '@/shared/types/types';
import { mockAuthService } from '../../../shared/lib/mock-auth-service';
import { isPasswordLeaked } from '../../../shared/lib/pwned-password';

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
    fullName: z.string().min(2, isRTL ? 'الاسم الكامل مطلوب (حرفان على الأقل)' : 'Full name is required (min 2 chars)'),
    username: z.string()
        .min(3, isRTL ? 'اسم المستخدم يجب أن يكون 3 أحرف على الأقل' : 'Username must be at least 3 characters')
        .regex(/^[a-zA-Z0-9_]+$/, isRTL ? 'اسم المستخدم يقبل أحرف إنجليزية وأرقام وشرطة سفلية فقط' : 'Username: letters, numbers and underscores only'),
    email: z.string().email(isRTL ? 'بريد إلكتروني غير صالح' : 'Invalid email address'),
    phoneNumber: z.string().optional().refine((val) => {
        if (!val || !val.trim()) return true;
        const clean = val.replace(/[\s\-()]/g, '');
        return /^\+?[0-9]{7,15}$/.test(clean);
    }, {
        message: isRTL ? 'رقم الهاتف غير صحيح (مثال: +966500000000)' : 'Invalid phone format (e.g. +966500000000)'
    }),
    password: z.string()
        .min(8, isRTL ? 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' : 'Password must be at least 8 characters')
        .refine(
            (pwd) => isSecurePassword(pwd),
            isRTL
                ? 'يجب أن تحتوي على حرف كبير، حرف صغير، رقم ورمز خاص (!@#$%^&*...)'
                : 'Must contain uppercase, lowercase, number and special character (!@#$%^&*...)'
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
}

export const useSignup = ({ content, isRTL }: UseSignupOptions) => {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [usedMockAuth, setUsedMockAuth] = useState(false);

    const signupSchema = createSignupSchema(isRTL);

    const form = useForm<SignupFormValues>({
        resolver: zodResolver(signupSchema),
        defaultValues: {
            fullName: '',
            username: '',
            email: '',
            phoneNumber: '',
            password: '',
            confirmPassword: '',
        },
    });

    const onSubmit = async (values: SignupFormValues) => {
        setLoading(true);

        try {
            // ─────────────────────────────────────────────────────────────────
            // PRE-CHECK 0: Password appeared in a known data breach (HaveIBeenPwned)
            // k-anonymity check — only the first 5 chars of the SHA-1 hash leave
            // the browser. Fail-open: never blocks signup on API outage.
            // ─────────────────────────────────────────────────────────────────
            const leakedCheck = await isPasswordLeaked(values.password);
            if (leakedCheck.leaked) {
                toast.error(
                    isRTL
                        ? '⚠️ كلمة المرور هذه ظهرت في اختراقات سابقة! اختر كلمة مرور قوية وفريدة.'
                        : '⚠️ This password has appeared in known data breaches! Choose a strong, unique password.'
                );
                form.setError('password', {
                    type: 'manual',
                    message: isRTL
                        ? 'كلمة المرور مسرّبة في اختراقات سابقة — اختر أخرى'
                        : 'Password found in previous breaches — pick another one'
                });
                return;
            }

            const isSupabaseConfigured = !!(
                (readEnv('VITE_SUPABASE_URL') || readEnv('NEXT_PUBLIC_SUPABASE_URL')) &&
                (readEnv('VITE_SUPABASE_ANON_KEY') || readEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'))
            );

            const cleanEmail = values.email.trim().toLowerCase();
            const cleanPhone = values.phoneNumber ? values.phoneNumber.replace(/[\s\-()]/g, '').trim() : null;
            const cleanUsername = values.username.trim().toLowerCase();

            let isMock = false;

            if (isSupabaseConfigured) {
                try {
                    // ─────────────────────────────────────────────────────────────────
                    // PRE-CHECK 1: Duplicate Email via profiles table (faster check)
                    // ─────────────────────────────────────────────────────────────────
                    const { data: existingEmailProfile } = await supabase
                        .from('profiles')
                        .select('id')
                        .ilike('email', cleanEmail)
                        .maybeSingle();

                    if (existingEmailProfile) {
                        toast.error(
                            isRTL
                                ? '⚠️ هذا البريد الإلكتروني مسجّل بالفعل. جرّب تسجيل الدخول.'
                                : '⚠️ This email is already registered. Try signing in instead.'
                        );
                        form.setError('email', {
                            type: 'manual',
                            message: isRTL ? 'بريد إلكتروني مُسجَّل مسبقاً' : 'Email already registered'
                        });
                        return;
                    }

                    // ─────────────────────────────────────────────────────────────────
                    // PRE-CHECK 2: Duplicate Username
                    // ─────────────────────────────────────────────────────────────────
                    const { data: existingUsername } = await supabase
                        .from('profiles')
                        .select('id')
                        .ilike('user_name', cleanUsername)
                        .maybeSingle();

                    if (existingUsername) {
                        toast.error(
                            isRTL
                                ? '⚠️ اسم المستخدم هذا مستخدم بالفعل. اختر اسماً آخر.'
                                : '⚠️ This username is already taken. Choose a different one.'
                        );
                        form.setError('username', {
                            type: 'manual',
                            message: isRTL ? 'اسم المستخدم محجوز مسبقاً' : 'Username already taken'
                        });
                        return;
                    }

                    // ─────────────────────────────────────────────────────────────────
                    // PRE-CHECK 3: Duplicate Phone Number
                    // ─────────────────────────────────────────────────────────────────
                    if (cleanPhone) {
                        const { data: existingPhone } = await supabase
                            .from('profiles')
                            .select('id')
                            .eq('phone_number', cleanPhone)
                            .maybeSingle();

                        if (existingPhone) {
                            toast.error(
                                isRTL
                                    ? '⚠️ رقم الهاتف هذا مسجّل بالفعل لحساب آخر.'
                                    : '⚠️ This phone number is already registered to another account.'
                            );
                            form.setError('phoneNumber', {
                                type: 'manual',
                                message: isRTL ? 'رقم الهاتف مُسجَّل مسبقاً' : 'Phone already registered'
                            });
                            return;
                        }
                    }

                    // ─────────────────────────────────────────────────────────────────
                    // SIGNUP: Register with Supabase Auth
                    // ─────────────────────────────────────────────────────────────────
                    const { data, error } = await supabase.auth.signUp({
                        email: cleanEmail,
                        password: values.password,
                        options: {
                            data: {
                                full_name: values.fullName.trim(),
                                user_name: cleanUsername,
                                phone_number: cleanPhone,
                                currency: 'USD',
                                role: 'user',
                            },
                            emailRedirectTo: `${window.location.origin}/auth/callback`,
                        },
                    });

                    console.log('📋 Supabase signUp response:', { data, error });

                    // ─────────────────────────────────────────────────────────────────
                    // CRITICAL: Supabase returns data.user with EMPTY identities array
                    // when the email is already registered (instead of returning error).
                    // This is a Supabase security feature to prevent email enumeration.
                    // We MUST check identities to detect duplicate registrations.
                    // ─────────────────────────────────────────────────────────────────
                    if (!error && data.user && data.user.identities && data.user.identities.length === 0) {
                        toast.error(
                            isRTL
                                ? '⚠️ هذا البريد الإلكتروني مسجّل بالفعل. جرّب تسجيل الدخول أو استعادة كلمة المرور.'
                                : '⚠️ This email is already registered. Try signing in or resetting your password.'
                        );
                        form.setError('email', {
                            type: 'manual',
                            message: isRTL ? 'بريد إلكتروني مُسجَّل مسبقاً' : 'Email already registered'
                        });
                        return;
                    }

                    // Handle actual Supabase errors
                    if (error) {
                        console.error('❌ Supabase signUp error:', error);
                        const msg = error.message?.toLowerCase() || '';
                        if (msg.includes('user already registered') || msg.includes('email already') || msg.includes('already registered')) {
                            toast.error(
                                isRTL
                                    ? '⚠️ هذا البريد الإلكتروني مسجّل بالفعل.'
                                    : '⚠️ This email is already registered.'
                            );
                            form.setError('email', {
                                type: 'manual',
                                message: isRTL ? 'بريد إلكتروني مُسجَّل مسبقاً' : 'Email already registered'
                            });
                            return;
                        }
                        throw error;
                    }

                } catch (supabaseError: unknown) {
                    // Fall back to mock auth ONLY if Supabase is unreachable (503/network)
                    const err = supabaseError as { status?: number; message?: string };
                    const isNetworkError =
                        err?.status === 503 ||
                        err?.message?.includes('503') ||
                        err?.message?.includes('fetch') ||
                        err?.message?.includes('network') ||
                        err?.message?.includes('Failed to fetch') ||
                        err?.message?.includes('Service unavailable');

                    if (isNetworkError) {
                        console.warn('⚠️ Supabase unreachable — falling back to mock auth...');
                        isMock = true;
                        setUsedMockAuth(true);

                        const mockResult = await mockAuthService.signUp(
                            cleanEmail,
                            values.password,
                            values.fullName.trim(),
                            cleanUsername,
                            cleanPhone || undefined
                        );

                        if (mockResult.error) {
                            toast.error(
                                mockResult.error.includes('already') || mockResult.error.includes('exists')
                                    ? (isRTL ? '⚠️ هذا البريد الإلكتروني مُسجَّل بالفعل (وضع تجريبي).' : '⚠️ Email already registered (test mode).')
                                    : mockResult.error
                            );
                            return;
                        }

                        toast.warning(
                            isRTL
                                ? '⚠️ الخادم غير متاح. تم إنشاء حساب تجريبي مؤقت. تواصل مع الدعم إذا استمرت المشكلة.'
                                : '⚠️ Server unavailable. A temporary test account was created. Contact support if this persists.'
                        );
                    } else {
                        console.error('❌ Non-network Supabase error:', supabaseError);
                        throw supabaseError;
                    }
                }
            } else {
                // No Supabase configured — use mock auth entirely
                isMock = true;
                setUsedMockAuth(true);

                const mockResult = await mockAuthService.signUp(
                    cleanEmail,
                    values.password,
                    values.fullName.trim(),
                    cleanUsername,
                    cleanPhone || undefined
                );

                if (mockResult.error) {
                    const isDuplicate = mockResult.error.toLowerCase().includes('already') || mockResult.error.toLowerCase().includes('exists');
                    if (isDuplicate) {
                        toast.error(isRTL ? '⚠️ هذا البريد الإلكتروني مُسجَّل بالفعل.' : '⚠️ This email is already registered.');
                        form.setError('email', {
                            type: 'manual',
                            message: isRTL ? 'بريد إلكتروني مُسجَّل مسبقاً' : 'Email already registered'
                        });
                    } else {
                        toast.error(mockResult.error);
                    }
                    return;
                }
            }

            // ─────────────────────────────────────────────────────────────────
            // SUCCESS
            // ─────────────────────────────────────────────────────────────────
            setSuccess(true);

            if (isMock) {
                toast.success(
                    isRTL
                        ? '✅ تم إنشاء الحساب بنجاح! (وضع الاختبار)'
                        : '✅ Account created successfully! (Test Mode)'
                );
            } else {
                toast.success(
                    content.signupSuccess || (isRTL
                        ? '✅ تم إنشاء الحساب! تحقق من بريدك الإلكتروني للتفعيل.'
                        : '✅ Account created! Check your email to verify.')
                );
            }

        } catch (error: unknown) {
            console.error('❌ Signup error:', error);

            let errorMessage = isRTL ? 'حدث خطأ أثناء إنشاء الحساب.' : 'An error occurred during signup.';

            if (error instanceof Error) {
                const msg = error.message.toLowerCase();
                if (msg.includes('user already registered') || msg.includes('email already') || msg.includes('already registered') || msg.includes('already exists')) {
                    errorMessage = isRTL ? '⚠️ هذا البريد الإلكتروني مسجّل بالفعل.' : '⚠️ This email is already registered.';
                    form.setError('email', { type: 'manual', message: isRTL ? 'بريد إلكتروني مُسجَّل مسبقاً' : 'Email already registered' });
                } else if (msg.includes('fetch') || msg.includes('network') || msg.includes('503')) {
                    errorMessage = isRTL ? 'الخدمة غير متوفرة حالياً. حاول مرة أخرى.' : 'Service unavailable. Please try again later.';
                } else if (msg.includes('rate_limit') || msg.includes('too many requests')) {
                    errorMessage = isRTL ? 'لقد حاولت عدة مرات. يرجى الانتظار قليلاً.' : 'Too many requests. Please wait a moment.';
                } else if (msg.includes('password') || msg.includes('weak')) {
                    errorMessage = isRTL ? 'كلمة المرور لا تفي بشروط الأمان.' : 'Password does not meet security requirements.';
                } else {
                    errorMessage = error.message;
                }
            } else if (typeof error === 'object' && error !== null) {
                const errObj = error as { status?: number; message?: string };
                if (errObj.status === 503) {
                    errorMessage = isRTL ? 'الخدمة غير متوفرة حالياً. حاول مرة أخرى.' : 'Service unavailable. Please try again later.';
                } else if (errObj.message) {
                    errorMessage = errObj.message;
                }
            }

            toast.error(errorMessage);
            if (!errorMessage.includes('503') && !errorMessage.includes('Service unavailable') && !errorMessage.includes('unavailable')) {
                try { await errorHandler.handle(error, 'Signup'); } catch { /* silent */ }
            }
        } finally {
            setLoading(false);
        }
    };

    return {
        form,
        loading,
        success,
        usedMockAuth,
        onSubmit: form.handleSubmit(onSubmit)
    };
};
