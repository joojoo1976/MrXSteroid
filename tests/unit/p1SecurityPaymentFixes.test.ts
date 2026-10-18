import { describe, it, expect, vi } from 'vitest';
import { verifyPaidAmount } from '../../server/payments/verifyPaidAmount';
import * as fs from 'fs';
import * as path from 'path';

describe('P1 Payment Security & Integrity Fixes', () => {
    describe('PAY-007: verifyPaidAmount Fail-Closed Verification', () => {
        it('refuses to activate (returns ok:false) when paidAmount is undefined', async () => {
            const result = await verifyPaidAmount('dummy-invoice-id', undefined);
            expect(result.ok).toBe(false);
        });

        it('refuses to activate (returns ok:false) when paidAmount is null or NaN', async () => {
            const nullResult = await verifyPaidAmount('dummy-invoice-id', null as unknown as number);
            expect(nullResult.ok).toBe(false);

            const nanResult = await verifyPaidAmount('dummy-invoice-id', NaN);
            expect(nanResult.ok).toBe(false);
        });

        it('refuses to activate (returns ok:false) when paidAmount is zero or negative', async () => {
            const zeroResult = await verifyPaidAmount('dummy-invoice-id', 0);
            expect(zeroResult.ok).toBe(false);

            const negResult = await verifyPaidAmount('dummy-invoice-id', -100);
            expect(negResult.ok).toBe(false);
        });

        it('refuses to activate (returns ok:false) when paidCurrency does not match invoice currency', async () => {
            const mockSupabase = {
                from: vi.fn().mockReturnValue({
                    select: vi.fn().mockReturnValue({
                        eq: vi.fn().mockReturnValue({
                            single: vi.fn().mockResolvedValue({
                                data: { amount: 100, currency: 'EGP' },
                                error: null,
                            }),
                        }),
                    }),
                }),
            } as any;

            const res = await verifyPaidAmount('test-invoice', 100, mockSupabase, 'USD');
            expect(res.ok).toBe(false);
        });

        it('confirms activation (returns ok:true) when paidAmount matches within tolerance and currency matches', async () => {
            const mockSupabase = {
                from: vi.fn().mockReturnValue({
                    select: vi.fn().mockReturnValue({
                        eq: vi.fn().mockReturnValue({
                            single: vi.fn().mockResolvedValue({
                                data: { amount: 100, currency: 'EGP' },
                                error: null,
                            }),
                        }),
                    }),
                }),
            } as any;

            const res = await verifyPaidAmount('test-invoice', 100, mockSupabase, 'EGP');
            expect(res.ok).toBe(true);
            expect(res.paid).toBe(100);
            expect(res.expected).toBe(100);
        });
    });

    describe('PAY-008: Admin InstaPay Receipt Approval Underpayment Hard Block', () => {
        it('ensures app/api/admin/payment-receipts/[id]/route.ts returns HTTP 422 if submittedAmount is less than required', () => {
            const routePath = path.resolve(
                process.cwd(),
                'app/api/admin/payment-receipts/[id]/route.ts'
            );
            const content = fs.readFileSync(routePath, 'utf-8');

            expect(content).toContain('submittedAmount < receipt.amount - 0.01');
            expect(content).toContain('status: 422');
            expect(content).toContain('Underpayment blocked');
        });
    });

    describe('PAY-006: Server-Authoritative Payment Verification for Success Page', () => {
        it('ensures /api/payments/verify exists and validates payments server-side', () => {
            const verifyRoute = path.resolve(process.cwd(), 'app/api/payments/verify/route.ts');
            expect(fs.existsSync(verifyRoute)).toBe(true);

            const content = fs.readFileSync(verifyRoute, 'utf-8');
            expect(content).toContain("invoices");
            expect(content).toContain("payment_status === 'paid'");
        });

        it('ensures SuccessPage calls /api/payments/verify instead of trusting URL parameters directly', () => {
            const successPagePath = path.resolve(process.cwd(), 'legacy-pages/SuccessPage.tsx');
            const content = fs.readFileSync(successPagePath, 'utf-8');

            expect(content).toContain('/api/payments/verify?orderId=');
            expect(content).not.toContain('setSubscriptionTier(planFromUrl)');
        });
    });

    describe('PAY-011: Webhook Merchant ID Routing Hardening', () => {
        it('ensures webhook.ts derives alternate gateway from server config without reading merchantId from req.body', () => {
            const webhookPath = path.resolve(process.cwd(), 'server/payments/webhook.ts');
            const content = fs.readFileSync(webhookPath, 'utf-8');

            expect(content).not.toContain('JSON.parse(rawBody) as Record<string, string>)?.merchantId');
            expect(content).toContain('PaymentFactory.getKashierGlobal()');
            expect(content).toContain('PaymentFactory.getKashierEgypt()');
        });
    });
});
