# Testing Guide

## Running Tests
```bash
npm run test:unit        # Run all unit tests (watch mode)
npx vitest run           # Run all tests once
npx vitest run tests/    # Run specific directory
```

## Test Coverage

### Unit Tests
| File | Tests | Coverage |
|------|-------|---------|
| `tests/unit/commissionEngine.test.ts` | 17 | Tier selection, rates, math, edge cases |
| `tests/unit/attribution.test.ts` | 8 | Cookie build/parse, expiry, self-referral |
| `tests/unit/paymentRouting.test.ts` | 8 | Gateway detection, Kashier routing |

### Integration Tests
| File | Tests | Coverage |
|------|-------|---------|
| `tests/integration/webhook.test.ts` | 21 | All Kashier webhook scenarios |

**Total: 55 tests, all passing**

## Webhook Test Scenarios (21)
1. Valid webhook SUCCESS
2. Invalid signature
3. Missing signature
4. Malformed payload
5. Empty body
6. Missing orderId
7. Wrong merchant ID (cross-account rejection)
8. DECLINED status
9. TIMED_OUT (unresolved, no fulfillment)
10. UNKNOWN (unresolved, no fulfillment)
11. EXPIRED_CARD
12. ACQUIRER_SYSTEM_ERROR
13. UNSPECIFIED_FAILURE
14. AUTHORIZED (unresolved, not yet captured)
15. CAPTURED (success)
16. REFUNDED
17. paidAmount parsing
18. merchantId extraction
19. signatureKeys order normalization
20. Unknown orderStatus → UNKNOWN
21. Short/mismatched hex signature
