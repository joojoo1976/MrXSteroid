/**
 * Kashier Official Testing Documentation Test Cards Fixture
 * Source: https://developers.kashier.io/
 */

export interface KashierTestCard {
    name: string;
    cardNumber: string;
    expiryMonth: string;
    expiryYear: string;
    cvv: string;
    expectedStatus: string;
    expectedOutcome: 'SUCCESS' | 'FAILURE' | 'EXPIRED' | 'UNKNOWN';
    expectedResponseCode: string;
    notes: string;
}

export const KASHIER_TEST_CARDS: readonly KashierTestCard[] = [
    {
        name: 'Mastercard Success (Official Docs)',
        cardNumber: '5123450000000008',
        expiryMonth: '06',
        expiryYear: '25',
        cvv: '123',
        expectedStatus: 'APPROVED',
        expectedOutcome: 'SUCCESS',
        expectedResponseCode: '00',
        notes: 'Official Kashier testing card for successful authorization',
    },
    {
        name: 'Visa Success (Standard)',
        cardNumber: '4111111111111112',
        expiryMonth: '12',
        expiryYear: '28',
        cvv: '123',
        expectedStatus: 'APPROVED',
        expectedOutcome: 'SUCCESS',
        expectedResponseCode: '00',
        notes: 'Standard Visa approved card',
    },
    {
        name: 'Insufficient Funds / Declined',
        cardNumber: '5123450000000008',
        expiryMonth: '01',
        expiryYear: '24', // Past month
        cvv: '123',
        expectedStatus: 'DECLINED',
        expectedOutcome: 'FAILURE',
        expectedResponseCode: '05',
        notes: 'Simulates bank decline or insufficient funds',
    },
    {
        name: 'Expired Card',
        cardNumber: '5123450000000008',
        expiryMonth: '01',
        expiryYear: '20', // Past year
        cvv: '123',
        expectedStatus: 'EXPIRED_CARD',
        expectedOutcome: 'EXPIRED',
        expectedResponseCode: '54',
        notes: 'Simulates expired card detection',
    },
    {
        name: 'Acquirer Timeout',
        cardNumber: '5123450000000008',
        expiryMonth: '02',
        expiryYear: '26',
        cvv: '123',
        expectedStatus: 'TIMED_OUT',
        expectedOutcome: 'UNKNOWN',
        expectedResponseCode: '91',
        notes: 'Acquirer or bank timeout — fail-closed pending reconciliation',
    },
    {
        name: 'System Error',
        cardNumber: '5123450000000008',
        expiryMonth: '03',
        expiryYear: '26',
        cvv: '123',
        expectedStatus: 'ACQUIRER_SYSTEM_ERROR',
        expectedOutcome: 'FAILURE',
        expectedResponseCode: '96',
        notes: 'Bank/switch system error',
    },
] as const;
