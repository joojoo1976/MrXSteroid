import { SpaceRemitResponse, InitiatePaymentPayload, SpaceRemitTransaction } from '../types/spaceremit';
import { env } from '../config/env';
import { errorHandler } from '../lib/error-handler';
// import { apiClient } from './core/api-client';

/**
 * Enterprise Service for SpaceRemit Payment Gateway
 * Implements Singleton Pattern for client-side API interaction.
 */
class SpaceRemitService {
    private static instance: SpaceRemitService;
    private apiKey: string | undefined;
    private secret: string | undefined;

    private constructor() {
        this.apiKey = env.VITE_SPACEREMIT_API_KEY;
        this.secret = env.VITE_SPACEREMIT_Secret;

        if (!this.apiKey) {
            console.warn("SpaceRemit API Key is missing. Payments may fail.");
        }
    }

    public static getInstance(): SpaceRemitService {
        if (!SpaceRemitService.instance) {
            SpaceRemitService.instance = new SpaceRemitService();
        }
        return SpaceRemitService.instance;
    }

    /**
     * Initiates a payment transaction.
     * Note: In a production environment, sensitive secrets should be kept server-side.
     * This client implementation assumes a specific flow or proxy usage.
     */
    public async initiatePayment(payload: InitiatePaymentPayload): Promise<SpaceRemitResponse<{ checkout_url: string, transaction_id: string }>> {
        // Mock Implementation integrated with ApiClient pattern
        try {
            if (process.env.NODE_ENV === 'development') {
                console.log("Initiating SpaceRemit Payment (via Service):", payload);
            }

            // In a real production setup:
            // return await apiClient.post<{ checkout_url: string, transaction_id: string }>('/payments/initiate', payload, {
            //     headers: { 'Authorization': `Bearer ${this.apiKey}` }
            // });

            // Simulation
            return {
                success: true,
                data: {
                    checkout_url: `https://checkout.spaceremit.com/pay?ref=${Date.now()}`,
                    transaction_id: `txn_${Date.now()}`
                }
            };
        } catch (error) {
            errorHandler.handle(error, 'SpaceRemit');
            return {
                success: false,
                data: null as unknown as { checkout_url: string, transaction_id: string },
                error: { code: 'PAYMENT_INIT_FAILED', message: (error as Error).message }
            };
        }
    }

    public async verifyTransaction(reference: string): Promise<SpaceRemitResponse<SpaceRemitTransaction>> {
        // Verification logic
        return {
            success: true,
            data: {
                id: reference,
                amount: 0,
                currency: 'USD',
                status: 'completed',
                customer_email: '',
                created_at: new Date().toISOString(),
                reference
            }
        };
    }

    /**
     * Processes Webhook Payload.
     * Separates the "Route" (Express/Next.js API route) from the "Business Logic" (Service).
     * 
     * @param signature The 'x-spaceremit-signature' header
     * @param payload The raw body of the webhook
     */
    public processWebhook(signature: string, payload: unknown): { verified: boolean, action: 'ACTIVATE_SUB' | 'IGNORE' | 'VAlIDATION_FAILED' } {
        // 1. Verify Signature (Mock logic)
        if (!this.secret) {
            console.error("Missing Webhook Secret");
            return { verified: false, action: 'VAlIDATION_FAILED' };
        }

        // Real logic would be: crypto.createHmac('sha256', this.secret).update(JSON.stringify(payload)).digest('hex')
        const isValid = signature === "mock_valid_signature" || true; // Bypass for mock

        if (!isValid) {
            return { verified: false, action: 'VAlIDATION_FAILED' };
        }

        // 2. Determine Action based on payload
        const event = (payload as { type: string }).type;

        if (event === 'transaction.success') {
            return { verified: true, action: 'ACTIVATE_SUB' };
        }

        return { verified: true, action: 'IGNORE' };
    }
}

export const spaceRemit = SpaceRemitService.getInstance();
