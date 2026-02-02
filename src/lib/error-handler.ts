
import { toast } from 'sonner';

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

/**
 * Global Error Handler Service
 * Provides consistent error logging and user notification.
 */
class ErrorHandlerService {
    private static instance: ErrorHandlerService;

    private constructor() { }

    public static getInstance(): ErrorHandlerService {
        if (!ErrorHandlerService.instance) {
            ErrorHandlerService.instance = new ErrorHandlerService();
        }
        return ErrorHandlerService.instance;
    }

    public handle(error: unknown, context: string = 'Application'): void {
        const parsed = this.parseError(error);

        // Log to console (or external service like Sentry)
        console.error(`[${context}] ${parsed.type}:`, parsed.message, parsed.originalError);

        // Notify User
        toast.error(parsed.message, {
            description: `Error Code: ${parsed.type}`,
            duration: 5000,
        });
    }

    private parseError(error: unknown): AppError {
        // 1. Handle standard Error objects
        if (error instanceof Error) {
            const msg = error.message;
            if (msg.includes('fetch') || msg.includes('network')) {
                return { type: ErrorType.NETWORK, message: 'Connection issue. Please check your internet.', originalError: error };
            }
            if (msg.includes('payment') || msg.includes('decline')) {
                return { type: ErrorType.PAYMENT, message: 'Payment failed. Please check your card details.', originalError: error };
            }
            return { type: ErrorType.UNKNOWN, message: msg, originalError: error };
        }

        // 2. Handle Supabase-specific error objects or plain objects with message
        if (error && typeof error === 'object') {
            const errObj = error as Record<string, unknown>;

            // Extract message - handle various common error property names
            const rawMessage = errObj['message'] || errObj['error_description'] || errObj['error'] || errObj['msg'] || errObj['details'];

            let message = 'An unexpected error occurred.';

            if (rawMessage) {
                if (typeof rawMessage === 'object') {
                    // If it's an object, check for nested message or stringify fully
                    const nestedMsg = (rawMessage as any).message || (rawMessage as any).msg || (rawMessage as any).error;
                    message = nestedMsg ? String(nestedMsg) : JSON.stringify(rawMessage);
                } else {
                    message = String(rawMessage);
                }
            }

            // If message is still just "{}" or empty, try the whole object
            if (message === '{}' || !message) {
                message = JSON.stringify(errObj);
            }

            // Cleanup common Supabase error prefixes
            message = message.replace(/^Database error: /i, '').replace(/^AuthApiError: /i, '');

            const msgStr = message.toLowerCase();
            if (msgStr.includes('network') || msgStr.includes('fetch')) {
                return { type: ErrorType.NETWORK, message: 'Network error. Verify your connection.', originalError: error };
            }

            return {
                type: (errObj['status'] || errObj['code']) ? ErrorType.AUTH : ErrorType.UNKNOWN,
                message: message,
                originalError: error
            };
        }

        // 3. Handle string errors
        if (typeof error === 'string') {
            return { type: ErrorType.UNKNOWN, message: error };
        }

        return { type: ErrorType.UNKNOWN, message: 'An unexpected technical error occurred.', originalError: error };
    }
}

export const errorHandler = ErrorHandlerService.getInstance();
