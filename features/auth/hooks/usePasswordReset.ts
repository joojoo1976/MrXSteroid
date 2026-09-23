'use client';

/**
 * features/auth/hooks/usePasswordReset.ts
 *
 * Encapsulates the password-reset submission for the reset page.
 * Security contract (same as signup):
 *   - Server-side leaked-password check via /api/auth/check-password BEFORE
 *     calling supabase.auth.updateUser. Any non-'safe' result blocks the
 *     password change (fail-closed default: even a HIBP outage blocks).
 *   - The password is never logged, stored, or echoed by this hook.
 * The recovery/session flow (AuthCallbackPage) is untouched.
 */
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { supabase } from '../../../shared/lib/supabase';
import { errorHandler } from '../../../shared/lib/error-handler';
import { checkPasswordServerSide } from '../../../shared/lib/password-safety-client';

export const createResetPasswordSchema = (isRTL: boolean) =>
    z
        .object({
            password: z
                .string()
                .min(8, {
                    message: isRTL ? 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' : 'Password must be at least 8 characters',
                })
                .regex(/[A-Z]/, {
                    message: isRTL ? 'يجب أن تحتوي على حرف كبير واحد على الأقل' : 'Must contain at least one uppercase letter',
                })
                .regex(/[0-9]/, {
                    message: isRTL ? 'يجب أن تحتوي على رقم واحد على الأقل' : 'Must contain at least one number',
                }),
            confirmPassword: z.string(),
        })
        .refine((data) => data.password === data.confirmPassword, {
            message: isRTL ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match',
            path: ['confirmPassword'],
        });

export type ResetPasswordFormValues = z.infer<ReturnType<typeof createResetPasswordSchema>>;

interface UsePasswordResetOptions {
    isRTL: boolean;
    successMessage: string;
}

export const usePasswordReset = ({ isRTL, successMessage }: UsePasswordResetOptions) => {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const form = useForm<ResetPasswordFormValues>({
        resolver: zodResolver(createResetPasswordSchema(isRTL)),
        defaultValues: {
            password: '',
            confirmPassword: '',
        },
    });

    const runReset = async (values: ResetPasswordFormValues): Promise<boolean> => {
        setLoading(true);
        try {
            // Server-side leaked-password check (security boundary). Fail-closed:
            // only 'safe' proceeds to actually changing the password.
            const serverCheck = await checkPasswordServerSide(values.password);
            if (serverCheck.status !== 'safe') {
                if (serverCheck.status === 'leaked') {
                    toast.error(
                        isRTL
                            ? '⚠️ كلمة المرور هذه ظهرت في اختراقات سابقة! اختر كلمة مرور قوية وفريدة.'
                            : '⚠️ This password has appeared in known data breaches! Choose a strong, unique password.'
                    );
                } else if (serverCheck.status === 'rate_limited') {
                    toast.error(
                        isRTL
                            ? '⏳ وصلت للحد الأقصى من المحاولات. انتظر قليلاً ثم أعد المحاولة.'
                            : '⏳ Too many attempts. Please wait a moment and try again.'
                    );
                } else {
                    toast.error(
                        isRTL
                            ? '⚠️ تعذّر التحقق من أمان كلمة المرور حالياً. حاول مرة أخرى لاحقاً.'
                            : '⚠️ Unable to verify password safety right now. Please try again later.'
                    );
                }
                form.setError('password', {
                    type: 'manual',
                    message: isRTL ? 'تعذّر التحقق من كلمة المرور حالياً' : 'Unable to verify password right now',
                });
                return false;
            }

            const { error } = await supabase.auth.updateUser({
                password: values.password,
            });
            if (error) throw error;

            setSuccess(true);
            toast.success(successMessage);
            return true;
        } catch (error) {
            errorHandler.handle(error, 'ResetPassword');
            return false;
        } finally {
            setLoading(false);
        }
    };

    return { form, loading, success, runReset };
};