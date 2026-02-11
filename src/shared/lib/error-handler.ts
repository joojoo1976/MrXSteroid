
import { toast } from 'sonner';
import { ContentStrings } from '../types';

/**
 * Enterprise Error Classification
 */
export enum ErrorType {
    NETWORK = 'NETWORK_ERROR',
    PAYMENT = 'PAYMENT_ERROR',
    DATABASE = 'DB_ERROR',
    AUTH = 'AUTH_ERROR',
    UNKNOWN = 'UNKNOWN_ERROR'
}

interface AppError {
    type: ErrorType;
    message: string;
    originalError?: unknown;
}

import { LinkageInspector } from './linkage-inspector';

/**
 * Global Error Handler Service
 * Provides consistent error logging and user notification.
 */
class ErrorHandlerService {
    private static instance: ErrorHandlerService;
    private content: ContentStrings | null = null;

    private constructor() { }

    public static getInstance(): ErrorHandlerService {
        if (!ErrorHandlerService.instance) {
            ErrorHandlerService.instance = new ErrorHandlerService();
        }
        return ErrorHandlerService.instance;
    }

    public setContent(content: ContentStrings): void {
        this.content = content;
    }

    public async handle(error: unknown, context: string = 'Application'): Promise<void> {
        const parsed = this.parseError(error);

        // Log to console (or external service like Sentry)
        console.error(`[${context}] ${parsed.type}:`, parsed.message, parsed.originalError);

        // Proactive Diagnosis: If Auth or Network error, run inspector
        let diagnosticSuggestion = '';
        if (parsed.type === ErrorType.AUTH || parsed.type === ErrorType.NETWORK) {
            const check = await LinkageInspector.quickCheckAuth();
            if (check) diagnosticSuggestion = `\n\n[Diagnostic]: ${check}`;
        }

        // Notify User
        toast.error(parsed.message, {
            description: `Error Code: ${parsed.type}${diagnosticSuggestion}`,
            duration: diagnosticSuggestion ? 10000 : 5000,
        });
    }

    private parseError(error: unknown): AppError {
        // 1. Log the raw error for developer investigation
        console.error("ErrorHandler caught raw error:", error);

        // Standard message for generic failures
        const DEFAULT_MSG = this.content?.errorUnknown || 'An unexpected error occurred.';

        // 2. Handle standard Error objects (extracting non-enumerable props like message)
        if (error instanceof Error) {
            const msg = error.message || DEFAULT_MSG;
            if (msg.includes('fetch') || msg.includes('network')) {
                return { type: ErrorType.NETWORK, message: this.content?.errorNetwork || 'Connection issue. Please check your internet.', originalError: error };
            }
            if (msg.includes('payment') || msg.includes('decline')) {
                return { type: ErrorType.PAYMENT, message: this.content?.errorPayment || 'Payment failed. Please check your card details.', originalError: error };
            }
            return { type: ErrorType.UNKNOWN, message: msg, originalError: error };
        }

        // 3. Handle typical Supabase / Plain Object errors
        if (error && typeof error === 'object') {
            const errObj = error as Record<string, unknown>;

            // Try to find a message in common property names
            let message = (
                errObj['message'] ||
                errObj['error_description'] ||
                errObj['error'] ||
                errObj['msg'] ||
                errObj['details'] ||
                errObj['code']
            );

            // Special case: If error has a 'status' but no message (Supabase format sometimes)
            if (!message && errObj['status']) {
                message = `Status ${errObj['status']}: Error during background request.`;
            }

            // Convert message to string safely
            let messageStr = DEFAULT_MSG;
            if (message) {
                if (typeof message === 'object') {
                    // Try to dig deeper one level if it's nested
                    const nested = message as Record<string, unknown>;
                    const extracted = (typeof nested.message === 'string' ? nested.message : '') ||
                        (typeof nested.msg === 'string' ? nested.msg : '') ||
                        (typeof nested.error === 'string' ? nested.error : '');
                    messageStr = extracted || JSON.stringify(message);
                } else {
                    messageStr = String(message);
                }
            } else {
                // If we STILL have no message, stringify the whole object 
                // but use a custom replacer to catch non-enumerable Error props just in case
                try {
                    messageStr = JSON.stringify(errObj, Object.getOwnPropertyNames(errObj));
                } catch {
                    messageStr = DEFAULT_MSG;
                }
            }

            // Avoid showing just "{}", it's useless to the user
            if (messageStr === '{}' || !messageStr) messageStr = DEFAULT_MSG;

            // Cleanup Supabase prefixes for a cleaner UI
            messageStr = messageStr.replace(/^Database error: /i, '').replace(/^AuthApiError: /i, '');

            // Detect Network issues in strings
            const lowerMsg = messageStr.toLowerCase();
            if (lowerMsg.includes('network') || lowerMsg.includes('fetch') || lowerMsg.includes('failed to fetch')) {
                return { type: ErrorType.NETWORK, message: this.content?.errorNetwork || 'Network error. Verify your connection.', originalError: error };
            }

            // Decide on Error Type
            const type = (errObj['status'] || errObj['code'] || lowerMsg.includes('auth')) ? ErrorType.AUTH : ErrorType.UNKNOWN;

            // Localize generic auth error if message is not helpful
            if (type === ErrorType.AUTH && messageStr === DEFAULT_MSG) {
                messageStr = this.content?.errorAuth || 'Authentication failed. Access denied.';
            }

            return { type, message: messageStr, originalError: error };
        }

        // 4. Handle string errors
        if (typeof error === 'string') {
            return { type: ErrorType.UNKNOWN, message: error };
        }

        return { type: ErrorType.UNKNOWN, message: DEFAULT_MSG, originalError: error };
    }
}

export const errorHandler = ErrorHandlerService.getInstance();
