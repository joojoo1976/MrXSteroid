import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import crypto from 'crypto';
import { NextRequest } from 'next/server';
import {
    verifyKashierPayoutWebhookSignature,
    buildPayoutSignatureInput,
    readPayoutSignatureHeader,
} from '../../server/payments/payoutWebhookVerifier';
import { resolveTransferCredentials } from '../../server/payments/transferCredentials';

const MID = 'MID-48761-625';
const TRANSFER_KEY_TEST = 'transfer-api-key-test-abc123';
const TRANSFER_KEY_LIVE = 'transfer-api-key-live-xyz789';
const PAYMENT_KEY_TEST = 'payment-api-key-test-DO-NOT-USE';
const SECRET_KEY_TEST = 'merchant-secret-key-test-DO-NOT-USE';

const ENV_KEYS = [
    'KASHIER_MODE',
    'KASHIER_TEST_TRANSFER_API_KEY',
    'KASHIER_LIVE_TRANSFER_API_KEY',
    'KASHIER_EGYPT_TRANSFER_API_KEY',
    'KASHIER_EGYPT_MERCHANT_ID',
    'KASHIER_GLOBAL_MERCHANT_ID',
    'KASHIER_TEST_PAYMENT_API_KEY',
    'KASHIER_TEST_SECRET_KEY',
    'KASHIER_LIVE_SECRET_KEY',
    'KASHIER_EGYPT_SECRET_KEY',
];

/**
 * Build a Kashier payout webhook payload.
 * signatureKeys order is significant and is NOT sorted, per Kashier docs.
 */
function buildTransferPayload(overrides: Record<string, unknown> = {}) {
    const payload: Record<string, unknown> = {
        transferId: 'TRS-1007931588',
        merchantTransferId: 'payout-uuid-0001',
        amount: 10,
        method: 'wallet',
        status: 'INITIATED',
        merchantId: MID,
        openForReturn: false,
        transferResponseCode: '00',
        transferResponseMessage: { en: 'success', ar: 'تمت الموافقة' },
        date: '2025-01-15T08:32:37.829Z',
        signatureKeys: ['merchantTransferId', 'method', 'amount', 'merchantId', 'status'],
        ...overrides,
    };
    return payload;
}

function signWith(keys: string | string[], payload: Record<string, unknown>, secret: string): string {
    const input = buildPayoutSignatureInput({ signatureKeys: keys, payload });
    return crypto.createHmac('sha256', secret).update(input).digest('hex');
}

describe('payoutWebhookVerifier — Kashier transfer signature scheme', () => {
    it('accepts a signature built in array order with raw values', () => {
        const payload = buildTransferPayload();
        const sig = signWith(payload.signatureKeys as string[], payload, TRANSFER_KEY_TEST);
        expect(
            verifyKashierPayoutWebhookSignature({
                signatureKeys: payload.signatureKeys as string[],
                payload,
                signature: sig,
                transferApiKey: TRANSFER_KEY_TEST,
            })
        ).toBe(true);
    });

    it('rejects the signature when the Payment API Key is used by mistake', () => {
        const payload = buildTransferPayload();
        const wrong = signWith(payload.signatureKeys as string[], payload, PAYMENT_KEY_TEST);
        expect(
            verifyKashierPayoutWebhookSignature({
                signatureKeys: payload.signatureKeys as string[],
                payload,
                signature: wrong,
                transferApiKey: TRANSFER_KEY_TEST,
            })
        ).toBe(false);
    });

    it('rejects the Merchant Secret Key used as the signing secret', () => {
        const payload = buildTransferPayload();
        const wrong = signWith(payload.signatureKeys as string[], payload, SECRET_KEY_TEST);
        expect(
            verifyKashierPayoutWebhookSignature({
                signatureKeys: payload.signatureKeys as string[],
                payload,
                signature: wrong,
                transferApiKey: TRANSFER_KEY_TEST,
            })
        ).toBe(false);
    });

    it('rejects a wrong Transfer API Key', () => {
        const payload = buildTransferPayload();
        const sig = signWith(payload.signatureKeys as string[], payload, TRANSFER_KEY_TEST);
        expect(
            verifyKashierPayoutWebhookSignature({
                signatureKeys: payload.signatureKeys as string[],
                payload,
                signature: sig,
                transferApiKey: 'some-other-key',
            })
        ).toBe(false);
    });

    it('rejects when the signature was computed over SORTED keys (payment scheme)', () => {
        const payload = buildTransferPayload();
        const paymentStyleInput = (payload.signatureKeys as string[])
            .slice()
            .sort()
            .map((k) => `${k}=${payload[k]}`)
            .join('&');
        const paymentStyleSig = crypto
            .createHmac('sha256', TRANSFER_KEY_TEST)
            .update(paymentStyleInput)
            .digest('hex');
        expect(
            verifyKashierPayoutWebhookSignature({
                signatureKeys: payload.signatureKeys as string[],
                payload,
                signature: paymentStyleSig,
                transferApiKey: TRANSFER_KEY_TEST,
            })
        ).toBe(false);
    });

    it('rejects when URL encoding was applied to the values', () => {
        const payload = buildTransferPayload({ merchantTransferId: 'payout uuid 0001' });
        const encodedInput = (payload.signatureKeys as string[])
            .map((k) => `${k}=${encodeURIComponent(String(payload[k]))}`)
            .join('&');
        const encodedSig = crypto
            .createHmac('sha256', TRANSFER_KEY_TEST)
            .update(encodedInput)
            .digest('hex');
        expect(encodedInput).toContain('payout%20uuid%200001');
        expect(
            verifyKashierPayoutWebhookSignature({
                signatureKeys: payload.signatureKeys as string[],
                payload,
                signature: encodedSig,
                transferApiKey: TRANSFER_KEY_TEST,
            })
        ).toBe(false);
    });

    it('preserves the exact key order rather than sorting it', () => {
        const a = buildTransferPayload();
        const b = buildTransferPayload();
        const inputA = buildPayoutSignatureInput({ signatureKeys: a.signatureKeys as string[], payload: a });
        const inputB = buildPayoutSignatureInput({ signatureKeys: b.signatureKeys as string[], payload: b });
        expect(inputA).toBe(inputB);
        expect(inputA.split('&')[0]).toBe('merchantTransferId=payout-uuid-0001');
        expect(inputA).toContain('merchantId=MID-48761-625');
    });

    it('detects a reordered key list as a different signature input', () => {
        const payload = buildTransferPayload();
        const original = buildPayoutSignatureInput({ signatureKeys: payload.signatureKeys as string[], payload });
        const reordered = buildPayoutSignatureInput({
            signatureKeys: (payload.signatureKeys as string[]).slice().reverse(),
            payload,
        });
        expect(reordered).not.toBe(original);
    });

    it('verifies the documented single-transfer signed string exactly', () => {
        const payload = buildTransferPayload({
            merchantTransferId: 'transfer12345',
            method: 'wallet',
            amount: 10,
            merchantId: 'MID-xxx-xxx',
            status: 'INITIATED',
            signatureKeys: ['merchantTransferId', 'method', 'amount', 'merchantId', 'status'],
        });
        expect(buildPayoutSignatureInput({ signatureKeys: payload.signatureKeys as string[], payload })).toBe(
            'merchantTransferId=transfer12345&method=wallet&amount=10&merchantId=MID-xxx-xxx&status=INITIATED'
        );
    });

    it('supports the documented batch key set', () => {
        const payload = {
            merchantBatchId: 'batch-1',
            batchId: 'TRS-1',
            method: 'wallet',
            amount: 10,
            merchantId: MID,
            status: 'IN_TRANSIT',
            signatureKeys: ['merchantBatchId', 'batchId', 'method', 'amount', 'merchantId', 'status'],
        };
        expect(buildPayoutSignatureInput({ signatureKeys: payload.signatureKeys, payload })).toBe(
            'merchantBatchId=batch-1&batchId=TRS-1&method=wallet&amount=10&merchantId=MID-48761-625&status=IN_TRANSIT'
        );
    });

    it('rejects a merchantId that is not ours even when the HMAC is valid', () => {
        const payload = buildTransferPayload({ merchantId: 'MID-SOMEONE-ELSE' });
        const sig = signWith(payload.signatureKeys as string[], payload, TRANSFER_KEY_TEST);
        expect(
            verifyKashierPayoutWebhookSignature({
                signatureKeys: payload.signatureKeys as string[],
                payload,
                signature: sig,
                transferApiKey: TRANSFER_KEY_TEST,
                expectedMerchantId: [MID],
            })
        ).toBe(false);
    });

    it('rejects when signatureKeys is missing or the signature is absent', () => {
        expect(
            verifyKashierPayoutWebhookSignature({
                signatureKeys: '',
                payload: buildTransferPayload(),
                signature: 'abc',
                transferApiKey: TRANSFER_KEY_TEST,
            })
        ).toBe(false);
        expect(
            verifyKashierPayoutWebhookSignature({
                signatureKeys: ['status'],
                payload: buildTransferPayload(),
                signature: '',
                transferApiKey: TRANSFER_KEY_TEST,
            })
        ).toBe(false);
    });

    it('reads the signature from the header only, never from the body', () => {
        expect(readPayoutSignatureHeader('abc123', { signature: 'attacker' })).toBe('abc123');
        expect(readPayoutSignatureHeader(null, { signature: 'attacker' })).toBe('');
    });
});

describe('transferCredentials — mode and credential separation', () => {
    const saved: Record<string, string | undefined> = {};

    beforeEach(() => {
        for (const k of ENV_KEYS) {
            saved[k] = process.env[k];
            delete process.env[k];
        }
    });

    afterEach(() => {
        for (const k of ENV_KEYS) {
            if (saved[k] === undefined) delete process.env[k];
            else process.env[k] = saved[k];
        }
    });

    it('resolves the test Transfer API Key in test mode', () => {
        process.env.KASHIER_MODE = 'test';
        process.env.KASHIER_TEST_TRANSFER_API_KEY = TRANSFER_KEY_TEST;
        process.env.KASHIER_EGYPT_MERCHANT_ID = MID;
        const creds = resolveTransferCredentials(MID);
        expect(creds.mode).toBe('test');
        expect(creds.transferApiKey).toBe(TRANSFER_KEY_TEST);
    });

    it('never falls back to the test key when mode is live', () => {
        process.env.KASHIER_MODE = 'live';
        process.env.KASHIER_TEST_TRANSFER_API_KEY = TRANSFER_KEY_TEST;
        process.env.KASHIER_EGYPT_MERCHANT_ID = MID;
        const creds = resolveTransferCredentials(MID);
        expect(creds.transferApiKey).not.toBe(TRANSFER_KEY_TEST);
        expect(creds.transferApiKey).toBe('');
    });

    it('never falls back to the live key when mode is test', () => {
        process.env.KASHIER_MODE = 'test';
        process.env.KASHIER_LIVE_TRANSFER_API_KEY = TRANSFER_KEY_LIVE;
        process.env.KASHIER_EGYPT_MERCHANT_ID = MID;
        const creds = resolveTransferCredentials(MID);
        expect(creds.transferApiKey).not.toBe(TRANSFER_KEY_LIVE);
    });

    it('uses the live key only in live mode', () => {
        process.env.KASHIER_MODE = 'live';
        process.env.KASHIER_LIVE_TRANSFER_API_KEY = TRANSFER_KEY_LIVE;
        process.env.KASHIER_EGYPT_MERCHANT_ID = MID;
        expect(resolveTransferCredentials(MID).transferApiKey).toBe(TRANSFER_KEY_LIVE);
    });

    it('does not expose the Payment API Key or Secret Key as the transfer signing key', () => {
        process.env.KASHIER_MODE = 'test';
        process.env.KASHIER_TEST_PAYMENT_API_KEY = PAYMENT_KEY_TEST;
        process.env.KASHIER_TEST_SECRET_KEY = SECRET_KEY_TEST;
        process.env.KASHIER_EGYPT_MERCHANT_ID = MID;
        const creds = resolveTransferCredentials(MID);
        expect(creds.transferApiKey).not.toBe(PAYMENT_KEY_TEST);
        expect(creds.transferApiKey).not.toBe(SECRET_KEY_TEST);
        // The secret key is surfaced only for Authorization use.
        expect(creds.secretKey).toBe(SECRET_KEY_TEST);
    });

    it('keeps the same MID for test and live without minting a new one', () => {
        process.env.KASHIER_EGYPT_MERCHANT_ID = MID;
        process.env.KASHIER_MODE = 'test';
        const testCreds = resolveTransferCredentials(MID);
        process.env.KASHIER_MODE = 'live';
        const liveCreds = resolveTransferCredentials(MID);
        expect(testCreds.merchantId).toBe(MID);
        expect(liveCreds.merchantId).toBe(MID);
        expect(liveCreds.allowedMerchantIds).toContain(MID);
    });
});

describe('payout webhook route — signature, lifecycle, idempotency', () => {
    const PAYOUT_ID = '11111111-2222-3333-4444-555555555555';
    const BENEFICIARY_ID = '66666666-7777-8888-9999-aaaaaaaaaaaa';

    const payoutRow: Record<string, unknown> = {
        id: PAYOUT_ID,
        beneficiary_id: BENEFICIARY_ID,
        amount_minor: 1000,
        currency: 'EGP',
        payout_method: 'mobile_wallet',
        kashier_transfer_id: 'TRS-1007931588',
        status: 'processing',
        payment_intent_id: null,
    };

    let payoutSelect: ReturnType<typeof vi.fn>;
    let payoutUpdate: ReturnType<typeof vi.fn>;
    let journalCalls: number;
    let payoutFound: boolean;

    const envBackup: Record<string, string | undefined> = {};
    const EXTRA_ENV_KEYS = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];

    function installMocks() {
        vi.doMock('@supabase/supabase-js', () => ({
            createClient: () => ({
                from: (table: string) => {
                    if (table === 'payouts') {
                        return {
                            select: (...a: unknown[]) => (payoutSelect as (...x: unknown[]) => unknown)(...a),
                            update: (...a: unknown[]) => (payoutUpdate as (...x: unknown[]) => unknown)(...a),
                        };
                    }
                    const chain: Record<string, unknown> = {
                        select: () => chain,
                        update: () => chain,
                        eq: async () => ({ error: null }),
                    };
                    return chain;
                },
            }),
        }));

        vi.doMock('../../server/payments/financialLedgerService', async () => {
            const actual = await vi.importActual<
                typeof import('../../server/payments/financialLedgerService')
            >('../../server/payments/financialLedgerService');
            return {
                ...actual,
                recordPayoutExecutionJournal: async () => {
                    journalCalls += 1;
                    return { journalEntryId: 'je-1' } as never;
                },
            };
        });
    }

    beforeEach(() => {
        for (const k of [...ENV_KEYS, ...EXTRA_ENV_KEYS]) {
            envBackup[k] = process.env[k];
            delete process.env[k];
        }
        process.env.KASHIER_MODE = 'test';
        process.env.KASHIER_TEST_TRANSFER_API_KEY = TRANSFER_KEY_TEST;
        process.env.KASHIER_EGYPT_MERCHANT_ID = MID;
        process.env.SUPABASE_URL = 'https://example.supabase.co';
        process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key';

        journalCalls = 0;
        payoutFound = true;
        payoutRow.status = 'processing';

        payoutSelect = vi.fn(() => {
            const chain: Record<string, unknown> = {
                maybeSingle: async () => ({ data: payoutFound ? payoutRow : null, error: null }),
                select: () => chain,
                eq: () => chain,
            };
            return chain;
        });
        payoutUpdate = vi.fn(() => {
            const chain: Record<string, unknown> = {
                select: () => chain,
                eq: () => chain,
                update: async () => ({ error: null }),
            };
            return chain;
        });

        installMocks();
    });

    afterEach(() => {
        for (const k of [...ENV_KEYS, ...EXTRA_ENV_KEYS]) {
            if (envBackup[k] === undefined) delete process.env[k];
            else process.env[k] = envBackup[k];
        }
        vi.doUnmock('@supabase/supabase-js');
        vi.doUnmock('../../server/payments/financialLedgerService');
        vi.resetModules();
    });

    async function importRoute() {
        installMocks();
        return import('../../app/api/payouts/webhook/route');
    }

    async function invoke(payload: Record<string, unknown>, secret = TRANSFER_KEY_TEST) {
        const { POST } = await importRoute();
        const keys = payload.signatureKeys as string[];
        const signature = signWith(keys, payload, secret);
        const req = new NextRequest('https://www.mrxsteroid.com/api/payouts/webhook', {
            method: 'POST',
            headers: { 'content-type': 'application/json', 'x-kashier-signature': signature },
            body: JSON.stringify(payload),
        });
        const res = await POST(req);
        return { res, json: await res.json() };
    }

    it('rejects with 503 rather than trusting the body when no Transfer API Key is configured', async () => {
        delete process.env.KASHIER_TEST_TRANSFER_API_KEY;
        const { res } = await invoke(buildTransferPayload());
        expect(res.status).toBe(503);
    });

    it('rejects a signature made with the Payment API Key', async () => {
        const { res } = await invoke(buildTransferPayload(), PAYMENT_KEY_TEST);
        expect(res.status).toBe(401);
    });

    it('rejects an event for a merchant we do not own', async () => {
        const { res } = await invoke(buildTransferPayload({ merchantId: 'MID-OTHER-999' }));
        expect(res.status).toBe(401);
    });

    it('accepts INITIATED and keeps the payout non-final', async () => {
        payoutRow.status = 'queued';
        const { res, json } = await invoke(buildTransferPayload({ status: 'INITIATED' }));
        expect(res.status).toBe(200);
        expect(json.state).toBe('PROCESSING');
        const patch = payoutUpdate.mock.calls.at(-1)?.[0] as Record<string, unknown>;
        expect(patch.status).toBe('processing');
        expect(journalCalls).toBe(0);
    });

    it('treats IN_TRANSIT as in progress, not success', async () => {
        payoutRow.status = 'queued';
        const { res, json } = await invoke(buildTransferPayload({ status: 'IN_TRANSIT' }));
        expect(res.status).toBe(200);
        expect(json.state).toBe('PROCESSING');
        expect(journalCalls).toBe(0);
    });

    it('does not rewrite a payout that is already processing', async () => {
        payoutRow.status = 'processing';
        const { res, json } = await invoke(buildTransferPayload({ status: 'IN_TRANSIT' }));
        expect(res.status).toBe(200);
        expect(json.reason).toBe('no_state_change');
        expect(payoutUpdate).not.toHaveBeenCalled();
        expect(journalCalls).toBe(0);
    });

    it('completes and posts the journal only on TRANSFERRED', async () => {
        const { res, json } = await invoke(buildTransferPayload({ status: 'TRANSFERRED' }));
        expect(res.status).toBe(200);
        expect(json.state).toBe('COMPLETED');
        const patch = payoutUpdate.mock.calls.at(-1)?.[0] as Record<string, unknown>;
        expect(patch.status).toBe('completed');
        expect(journalCalls).toBe(1);
    });

    it('does not treat TRANSFERRED with openForReturn=true as final', async () => {
        const { res, json } = await invoke(
            buildTransferPayload({ status: 'TRANSFERRED', openForReturn: true })
        );
        expect(res.status).toBe(200);
        expect(json.state).toBe('RECONCILING');
        const patch = payoutUpdate.mock.calls.at(-1)?.[0] as Record<string, unknown>;
        expect(patch.status).toBe('reconciling');
        expect(journalCalls).toBe(0);
    });

    it('maps FAILED and records the provider failure reason', async () => {
        const payload = buildTransferPayload({
            status: 'FAILED',
            transferResponseCode: 'k_default',
            transferResponseMessage: { en: 'A General Error Occured', ar: '' },
        });
        const { res, json } = await invoke(payload);
        expect(res.status).toBe(200);
        expect(json.state).toBe('FAILED');
        const patch = payoutUpdate.mock.calls.at(-1)?.[0] as Record<string, unknown>;
        expect(patch.status).toBe('failed');
        expect(String(patch.error_message)).toContain('k_default');
    });

    it('never promotes an unknown status to success', async () => {
        const { res, json } = await invoke(buildTransferPayload({ status: 'SOMETHING_NEW' }));
        expect(res.status).toBe(200);
        expect(json.state).toBe('UNKNOWN');
        const patch = payoutUpdate.mock.calls.at(-1)?.[0] as Record<string, unknown>;
        expect(patch.status).toBe('unknown');
        expect(journalCalls).toBe(0);
    });

    it('applies a repeated TRANSFERRED event only once', async () => {
        payoutRow.status = 'completed';
        const { res, json } = await invoke(buildTransferPayload({ status: 'TRANSFERRED' }));
        expect(res.status).toBe(200);
        expect(json.reason).toBe('no_state_change');
        expect(journalCalls).toBe(0);
    });

    it('does not walk a terminal failure back to processing', async () => {
        payoutRow.status = 'failed';
        const { res, json } = await invoke(buildTransferPayload({ status: 'INITIATED' }));
        expect(res.status).toBe(200);
        expect(json.reason).toBe('no_state_change');
    });

    it('resolves the payout by merchantTransferId', async () => {
        await invoke(buildTransferPayload({ status: 'IN_TRANSIT' }));
        const selectArgs = payoutSelect.mock.calls.at(-1)?.[0] as string;
        expect(selectArgs).toBe('*');
    });

    it('acknowledges an unknown payout without writing anything', async () => {
        payoutFound = false;
        const { res, json } = await invoke(buildTransferPayload());
        expect(res.status).toBe(200);
        expect(json.status).toBe('ignored');
        expect(payoutUpdate).not.toHaveBeenCalled();
    });

    it('rejects a payload with neither merchantTransferId nor transferId', async () => {
        const payload = buildTransferPayload({ merchantTransferId: undefined, transferId: undefined });
        const { res } = await invoke(payload);
        expect(res.status).toBe(400);
    });

    it('rejects an empty body', async () => {
        const { POST } = await import('../../app/api/payouts/webhook/route');
        const req = new NextRequest('https://www.mrxsteroid.com/api/payouts/webhook', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: '',
        });
        const res = await POST(req);
        expect(res.status).toBe(400);
    });

    it('rejects a missing signature header', async () => {
        const { POST } = await import('../../app/api/payouts/webhook/route');
        const payload = buildTransferPayload();
        const req = new NextRequest('https://www.mrxsteroid.com/api/payouts/webhook', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(payload),
        });
        const res = await POST(req);
        expect(res.status).toBe(401);
    });
});
