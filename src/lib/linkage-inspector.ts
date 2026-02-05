/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  🔗 SUPABASE LINKAGE INSPECTOR                                           ║
 * ║  Implementation based on Linkage Inspector Tool Schema                   ║
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
    };
    error?: {
        code: string;
        message: string;
        suggestion: string;
        details?: any;
    };
}

export class LinkageInspector {
    /**
     * Inspects the connection between the app and Supabase.
     */
    static async inspect(type: CheckType = 'full', customPayload?: any): Promise<InspectionResult> {
        const result: InspectionResult = {
            success: true,
            timestamp: new Date().toISOString(),
            checks: {}
        };

        const startTime = performance.now();

        try {
            // 1. Basic URL and Key Presence Check
            result.checks.url_reachable = !!env.VITE_SUPABASE_URL;
            result.checks.api_key_valid = !!env.VITE_SUPABASE_ANON_KEY && env.VITE_SUPABASE_ANON_KEY.startsWith('eyJ');

            if (!result.checks.url_reachable) {
                return this.createError(result, 'URL_UNREACHABLE',
                    'Supabase URL is missing or incorrect.',
                    'Check your Vercel/Local environment variables for VITE_SUPABASE_URL.');
            }

            if (!result.checks.api_key_valid) {
                return this.createError(result, 'INVALID_API_KEY',
                    'Supabase API Key is missing or has an invalid format.',
                    'Ensure VITE_SUPABASE_ANON_KEY is set and starts with a valid JWT header (eyJ).');
            }

            // 2. Auth Endpoint Test
            if (type === 'full' || type === 'auth_only') {
                const authStart = performance.now();
                const { error } = await supabase.auth.getSession();
                const authEnd = performance.now();

                result.checks.auth_endpoint = {
                    status: error ? 'error' : 'ok',
                    latency_ms: Math.round(authEnd - authStart),
                    message: error?.message
                };

                if (error) {
                    return this.createError(result, 'AUTH_ENDPOINT_ERROR',
                        `Auth diagnostic failed: ${error.message}`,
                        'Check if your Supabase project is active and the API key hasn\'t been rotated.');
                }
            }

            // 3. Database Connectivity Test
            if (type === 'full' || type === 'database_only') {
                const dbStart = performance.now();
                // We try a simple query to a common table (profiles)
                const { error, data } = await supabase.from('profiles').select('id').limit(1);
                const dbEnd = performance.now();

                result.checks.database_connection = {
                    status: error ? 'error' : 'ok',
                    latency_ms: Math.round(dbEnd - dbStart),
                    tables_accessible: !error
                };

                if (error && error.code !== 'PGRST116') { // PGRST116 just means no rows found, which is fine
                    return this.createError(result, 'DATABASE_CONNECTION_ERROR',
                        `Database query failed: ${error.message}`,
                        'Verify that the "profiles" table exists and that RLS policies allow selection.');
                }
            }

            // 4. Webhook Test (Client-side simulation)
            if (type === 'full' || type === 'webhook_only') {
                const webhookUrl = env.VITE_SPACEREMIT_CALLBACK_URL;
                if (webhookUrl) {
                    const webStart = performance.now();
                    try {
                        const response = await fetch(webhookUrl, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(customPayload || { status: 'success', customer_email: 'test@example.com' })
                        });
                        const webEnd = performance.now();

                        result.checks.webhook_delivery = {
                            status: response.ok ? 'ok' : 'error',
                            http_status_code: response.status,
                            latency_ms: Math.round(webEnd - webStart)
                        };

                        if (!response.ok) {
                            return this.createError(result, 'WEBHOOK_DELIVERY_FAILED',
                                `Webhook returned status ${response.status}`,
                                'Verify that the webhook handler is deployed and can handle incoming POST requests.');
                        }
                    } catch (e) {
                        result.checks.webhook_delivery = {
                            status: 'error',
                            latency_ms: Math.round(performance.now() - webStart)
                        };
                        return this.createError(result, 'WEBHOOK_DELIVERY_FAILED',
                            'Failed to reach webhook endpoint.',
                            'Ensure the callback URL is correct and the server allows CORS if calling from the frontend.');
                    }
                }
            }

        } catch (globalError: any) {
            return this.createError(result, 'UNKNOWN_ERROR',
                globalError.message || 'An unexpected error occurred during diagnostics.',
                'Check the browser console for more details.');
        }

        return result;
    }

    private static createError(result: InspectionResult, code: string, message: string, suggestion: string): InspectionResult {
        result.success = false;
        result.error = { code, message, suggestion };
        return result;
    }

    /**
     * Diagnostic helper specifically for Auth failures.
     */
    static async quickCheckAuth(): Promise<string | null> {
        const result = await this.inspect('auth_only');
        if (!result.success) {
            return `${result.error?.message}. Suggestion: ${result.error?.suggestion}`;
        }
        return null;
    }
}
