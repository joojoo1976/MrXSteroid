/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  🔗 SUPABASE & PAYMENT LINKAGE INSPECTOR                                 ║
 * ║  Robust diagnostic tool with circular dependency protection               ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

import { supabase } from './supabase';
import { env } from '../config/env';

export type CheckType = 'full' | 'auth_only' | 'database_only' | 'webhook_only';

export interface InspectionResult {
    success: boolean;
    timestamp: string;
    checks: {
        api_key_valid?: boolean;
        url_reachable?: boolean;
        auth_endpoint?: {
            status: 'ok' | 'error';
            latency_ms: number;
            message?: string;
        };
        database_connection?: {
            status: 'ok' | 'error';
            latency_ms: number;
            tables_accessible?: boolean;
        };
        webhook_delivery?: {
            status: 'ok' | 'error';
            http_status_code?: number;
            response_body?: string;
            latency_ms: number;
        };
        spaceremit_sdk?: {
            status: 'ok' | 'error';
            loaded: boolean;
            key_format_valid: boolean;
        };
    };
    error?: {
        code: string;
        message: string;
        suggestion: string;
        details?: unknown;
    };
}

export class LinkageInspector {
    static async inspect(type: CheckType = 'full', customPayload?: Record<string, unknown>): Promise<InspectionResult> {
        const result: InspectionResult = {
            success: true,
            timestamp: new Date().toISOString(),
            checks: {}
        };

        try {
            // 1. Supabase Check
            result.checks.url_reachable = !!env.SUPABASE_URL;
            result.checks.api_key_valid = !!env.SUPABASE_ANON_KEY && env.SUPABASE_ANON_KEY.startsWith('eyJ');

            if (type === 'full' || type === 'auth_only') {
                const authStart = performance.now();
                const { error } = await supabase.auth.getSession();
                result.checks.auth_endpoint = {
                    status: error ? 'error' : 'ok',
                    latency_ms: Math.round(performance.now() - authStart),
                    message: error?.message
                };
            }

            if (type === 'full' || type === 'database_only') {
                const dbStart = performance.now();
                const { error } = await supabase.from('profiles').select('id').limit(1);
                result.checks.database_connection = {
                    status: error ? 'error' : 'ok',
                    latency_ms: Math.round(performance.now() - dbStart),
                    tables_accessible: !error
                };
            }

            // 2. Webhook Check
            if (type === 'full' || type === 'webhook_only') {
                const webhookUrl = env.SPACEREMIT_CALLBACK_URL;
                if (webhookUrl) {
                    const webStart = performance.now();
                    try {
                        const response = await fetch(webhookUrl, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(customPayload || { status: 'success', customer_email: 'test@example.com' })
                        });
                        result.checks.webhook_delivery = {
                            status: response.ok ? 'ok' : 'error',
                            http_status_code: response.status,
                            latency_ms: Math.round(performance.now() - webStart)
                        };
                    } catch {
                        result.checks.webhook_delivery = { status: 'error', latency_ms: 0 };
                    }
                }
            }

            // 3. SpaceRemit Check (Independent logic to avoid circular imports)
            if (type === 'full') {
                const publicKey = env.SPACEREMIT_PUBLIC_KEY || '';
                const sdkPresent = !!(window as Window & { SpaceRemit?: unknown }).SpaceRemit;
                const isSandbox = publicKey.startsWith('sb_');
                const isStripeFormat = publicKey.startsWith('pk_');
                const isStandardFormat = publicKey.length > 20 && !isStripeFormat;

                result.checks.spaceremit_sdk = {
                    status: (publicKey && (sdkPresent || isSandbox || isStandardFormat)) ? 'ok' : 'error',
                    loaded: sdkPresent,
                    key_format_valid: isSandbox || isStandardFormat
                };

                if (!publicKey) {
                    return this.createError(result, 'MISSING_PAYMENT_KEY', 'Payment Public Key is missing.');
                }

            }

        } catch (globalError: unknown) {
            const message = globalError instanceof Error ? globalError.message : 'Diagnostic failed.';
            return this.createError(result, 'UNKNOWN_ERROR', message);
        }

        return result;
    }

    private static createError(result: InspectionResult, code: string, message: string, suggestion: string = 'Check console for full trace.'): InspectionResult {
        result.success = false;
        result.error = { code, message, suggestion };
        return result;
    }

    static async quickCheckAuth(): Promise<string | null> {
        const result = await this.inspect('auth_only');
        return result.success ? null : result.error?.message || 'Auth failure';
    }
}
