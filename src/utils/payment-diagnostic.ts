/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  🔍 PAYMENT SERVICE DIAGNOSTIC TOOL                                      ║
 * ║  أداة تشخيص خدمة الدفع                                                  ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

import { env } from '../config/env';

export interface DiagnosticResult {
    status: 'success' | 'warning' | 'error';
    message: string;
    messageAr: string;
    details?: Record<string, unknown>;
}

export interface PaymentDiagnosticReport {
    overall: 'healthy' | 'warning' | 'critical';
    checks: {
        publicKey: DiagnosticResult;
        supabase: DiagnosticResult;
        callbackUrl: DiagnosticResult;
        encryption: DiagnosticResult;
    };
    timestamp: string;
}

/**
 * Check SpaceRemit Public Key Configuration
 */
function checkPublicKey(): DiagnosticResult {
    const publicKey = env.SPACEREMIT_PUBLIC_KEY;

    if (!publicKey) {
        return {
            status: 'error',
            message: 'SpaceRemit Public Key is not configured',
            messageAr: 'مفتاح SpaceRemit العام غير مُكوَّن',
            details: {
                required: true,
                configured: false
            }
        };
    }

    // Check key format
    const isLiveKey = publicKey.startsWith('pk_');
    const isSandboxKey = publicKey.startsWith('sb_');
    const isValidFormat = isLiveKey || isSandboxKey;

    if (!isValidFormat) {
        return {
            status: 'error',
            message: 'Invalid Public Key format. Must start with pk_ (live) or sb_ (sandbox)',
            messageAr: 'صيغة المفتاح العام غير صالحة. يجب أن يبدأ بـ pk_ (مباشر) أو sb_ (تجريبي)',
            details: {
                keyPrefix: publicKey.substring(0, 4),
                expectedPrefix: 'pk_ or sb_',
                isLiveKey,
                isSandboxKey
            }
        };
    }

    // Check key length
    if (publicKey.length < 20) {
        return {
            status: 'warning',
            message: 'Public Key seems too short. Please verify it is correct.',
            messageAr: 'المفتاح العام يبدو قصيراً جداً. يرجى التحقق من صحته.',
            details: {
                keyLength: publicKey.length,
                minimumLength: 20
            }
        };
    }

    return {
        status: 'success',
        message: `Valid ${isLiveKey ? 'Live' : 'Sandbox'} Public Key configured`,
        messageAr: `مفتاح عام ${isLiveKey ? 'مباشر' : 'تجريبي'} صالح مُكوَّن`,
        details: {
            keyType: isLiveKey ? 'live' : 'sandbox',
            keyLength: publicKey.length,
            keyPrefix: publicKey.substring(0, 4)
        }
    };
}

/**
 * Check Supabase Configuration
 */
function checkSupabase(): DiagnosticResult {
    const supabaseUrl = env.SUPABASE_URL;
    const supabaseKey = env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        return {
            status: 'error',
            message: 'Supabase configuration is incomplete',
            messageAr: 'تكوين Supabase غير مكتمل',
            details: {
                urlConfigured: !!supabaseUrl,
                keyConfigured: !!supabaseKey
            }
        };
    }

    // Validate URL format
    try {
        const url = new URL(supabaseUrl);
        if (!url.hostname.includes('supabase')) {
            return {
                status: 'warning',
                message: 'Supabase URL does not appear to be a valid Supabase domain',
                messageAr: 'عنوان URL لـ Supabase لا يبدو نطاقاً صالحاً لـ Supabase',
                details: {
                    hostname: url.hostname
                }
            };
        }
    } catch {
        return {
            status: 'error',
            message: 'Invalid Supabase URL format',
            messageAr: 'صيغة عنوان URL لـ Supabase غير صالحة',
            details: {
                url: supabaseUrl
            }
        };
    }

    return {
        status: 'success',
        message: 'Supabase configuration is valid',
        messageAr: 'تكوين Supabase صالح',
        details: {
            urlConfigured: true,
            keyConfigured: true
        }
    };
}

/**
 * Check Callback URL Configuration
 */
function checkCallbackUrl(): DiagnosticResult {
    const callbackUrl = env.SPACEREMIT_CALLBACK_URL;

    if (!callbackUrl) {
        return {
            status: 'error',
            message: 'Callback URL is not configured',
            messageAr: 'عنوان URL للاستدعاء غير مُكوَّن',
            details: {
                required: true,
                configured: false
            }
        };
    }

    // Validate URL format
    try {
        const url = new URL(callbackUrl);
        
        // Check if it's a localhost URL in production
        if (env.MODE === 'production' && (url.hostname === 'localhost' || url.hostname === '127.0.0.1')) {
            return {
                status: 'error',
                message: 'Callback URL cannot be localhost in production',
                messageAr: 'لا يمكن أن يكون عنوان URL للاستدعاء localhost في الإنتاج',
                details: {
                    url: callbackUrl,
                    mode: env.MODE
                }
            };
        }

        // Check if it uses HTTPS in production
        if (env.MODE === 'production' && url.protocol !== 'https:') {
            return {
                status: 'warning',
                message: 'Callback URL should use HTTPS in production',
                messageAr: 'يجب أن يستخدم عنوان URL للاستدعاء HTTPS في الإنتاج',
                details: {
                    protocol: url.protocol,
                    mode: env.MODE
                }
            };
        }

        return {
            status: 'success',
            message: 'Callback URL is properly configured',
            messageAr: 'عنوان URL للاستدعاء مُكوَّن بشكل صحيح',
            details: {
                url: callbackUrl,
                protocol: url.protocol,
                hostname: url.hostname
            }
        };
    } catch {
        return {
            status: 'error',
            message: 'Invalid Callback URL format',
            messageAr: 'صيغة عنوان URL للاستدعاء غير صالحة',
            details: {
                url: callbackUrl
            }
        };
    }
}

/**
 * Check Encryption Key Configuration
 */
function checkEncryption(): DiagnosticResult {
    const encryptionKey = env.ENCRYPTION_KEY;

    if (!encryptionKey) {
        return {
            status: 'error',
            message: 'Encryption key is not configured',
            messageAr: 'مفتاح التشفير غير مُكوَّن',
            details: {
                required: true,
                configured: false
            }
        };
    }

    // Check key length (should be at least 32 characters for AES-256)
    if (encryptionKey.length < 32) {
        return {
            status: 'warning',
            message: 'Encryption key is too short. Should be at least 32 characters for AES-256',
            messageAr: 'مفتاح التشفير قصير جداً. يجب أن يكون 32 حرفاً على الأقل لـ AES-256',
            details: {
                keyLength: encryptionKey.length,
                minimumLength: 32
            }
        };
    }

    return {
        status: 'success',
        message: 'Encryption key is properly configured',
        messageAr: 'مفتاح التشفير مُكوَّن بشكل صحيح',
        details: {
            keyLength: encryptionKey.length
        }
    };
}

/**
 * Run Full Payment Service Diagnostic
 */
export function runPaymentDiagnostic(): PaymentDiagnosticReport {
    const checks = {
        publicKey: checkPublicKey(),
        supabase: checkSupabase(),
        callbackUrl: checkCallbackUrl(),
        encryption: checkEncryption()
    };

    // Determine overall health
    const hasErrors = Object.values(checks).some(check => check.status === 'error');
    const hasWarnings = Object.values(checks).some(check => check.status === 'warning');

    let overall: 'healthy' | 'warning' | 'critical';
    if (hasErrors) {
        overall = 'critical';
    } else if (hasWarnings) {
        overall = 'warning';
    } else {
        overall = 'healthy';
    }

    return {
        overall,
        checks,
        timestamp: new Date().toISOString()
    };
}

/**
 * Log Diagnostic Report to Console
 */
export function logDiagnosticReport(report: PaymentDiagnosticReport): void {
    console.group('🔍 Payment Service Diagnostic Report');
    console.log(`Overall Status: ${report.overall.toUpperCase()}`);
    console.log(`Timestamp: ${report.timestamp}`);
    console.log('');

    Object.entries(report.checks).forEach(([key, result]) => {
        const icon = result.status === 'success' ? '✅' : result.status === 'warning' ? '⚠️' : '❌';
        console.group(`${icon} ${key}`);
        console.log(`Status: ${result.status}`);
        console.log(`Message: ${result.message}`);
        console.log(`Message (AR): ${result.messageAr}`);
        if (result.details) {
            console.log('Details:', result.details);
        }
        console.groupEnd();
    });

    console.groupEnd();
}

/**
 * Get Diagnostic Summary for UI Display
 */
export function getDiagnosticSummary(report: PaymentDiagnosticReport): {
    status: string;
    message: string;
    messageAr: string;
    issues: string[];
    issuesAr: string[];
} {
    const issues: string[] = [];
    const issuesAr: string[] = [];

    Object.entries(report.checks).forEach(([key, result]) => {
        if (result.status !== 'success') {
            issues.push(`${key}: ${result.message}`);
            issuesAr.push(`${key}: ${result.messageAr}`);
        }
    });

    let message = '';
    let messageAr = '';

    switch (report.overall) {
        case 'healthy':
            message = 'All payment service checks passed successfully';
            messageAr = 'نجحت جميع فحوصات خدمة الدفع';
            break;
        case 'warning':
            message = 'Payment service is operational but has warnings';
            messageAr = 'خدمة الدفع تعمل ولكن لديها تحذيرات';
            break;
        case 'critical':
            message = 'Payment service has critical configuration errors';
            messageAr = 'خدمة الدفع لديها أخطاء تكوين حرجة';
            break;
    }

    return {
        status: report.overall,
        message,
        messageAr,
        issues,
        issuesAr
    };
}
