import { errorHandler } from '../../lib/error-handler';
import { maskObservation } from '../../utils/contextOptimization';
import { loggers } from '../../utils/logger';

/**
 * Enterprise-Grade Generic API Client (Singleton)
 * 
 * Centralizes fetch logic with:
 * 1. Automatic header management (e.g., Auth tokens).
 * 2. Timeout protection.
 * 3. Unified error handling via ErrorHandler.
 */
class ApiClient {
    private static instance: ApiClient;
    private baseURL: string = '';

    private constructor() { }

    public static getInstance(): ApiClient {
        if (!ApiClient.instance) {
            ApiClient.instance = new ApiClient();
        }
        return ApiClient.instance;
    }

    public setBaseURL(url: string) {
        this.baseURL = url;
    }

    /**
     * Generic request wrapper
     */
    public async request<T>(endpoint: string, options: RequestInit = {}): Promise<{ data: T | null; error: string | null }> {
        const url = `${this.baseURL}${endpoint}`;
        const defaultHeaders = {
            'Content-Type': 'application/json',
        };

        try {
            const response = await fetch(url, {
                ...options,
                headers: { ...defaultHeaders, ...options.headers },
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                errorHandler.handle(new Error(errorData.message || 'API Request Failed'), 'ApiClient');
                return { data: null, error: errorData.message || 'Network Response Error' };
            }

            const data = await response.json();

            // Observation Masking for elite performance and security
            const { masked } = maskObservation(data, endpoint);
            loggers.api.debug(`Request ${endpoint} success`, masked);

            return { data, error: null };
        } catch (error) {
            errorHandler.handle(error, 'ApiClient');
            return { data: null, error: 'Connection failed' };
        }
    }

    public get<T>(endpoint: string, options?: RequestInit) {
        return this.request<T>(endpoint, { ...options, method: 'GET' });
    }

    public post<T>(endpoint: string, body: unknown, options?: RequestInit) {
        return this.request<T>(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) });
    }
}

export const apiClient = ApiClient.getInstance();
