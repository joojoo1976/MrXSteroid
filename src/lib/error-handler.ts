
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
            const errObj = error as Record<string, any>;
            const message = errObj.message || errObj.error_description || errObj.error || 'An unexpected error occurred.';

            // Check for common error strings
            const msgStr = String(message);
            if (msgStr.toLowerCase().includes('network') || msgStr.toLowerCase().includes('fetch')) {
                return { type: ErrorType.NETWORK, message: 'Network error. Verify your connection.', originalError: error };
            }

            return {
                type: (errObj.status || errObj.code) ? ErrorType.AUTH : ErrorType.UNKNOWN,
                message: msgStr,
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
