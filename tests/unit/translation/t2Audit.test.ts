import { describe, expect, it, vi } from 'vitest';
import { translateBatchRequest } from '../../../server/translation/batchRuntime';
import { MemoryTranslationBudgetStore } from '../../../server/translation/budget';
import { MemoryTranslationRateLimiter } from '../../../server/translation/rateLimit';
import { TranslationCircuitBreaker } from '../../../server/translation/circuitBreaker';
import { issueTranslationSession } from '../../../server/translation/session';
import type { TranslationProvider } from '../../../server/translation/provider';
import { safeTranslationAuditEvent } from '../../../server/translation/audit';

const SECRET='audit-test-secret-with-at-least-thirty-two-characters';

describe('T2 safe batch audit', () => {
    it('never emits source text, session tokens, secrets, credentials or placeholders', async () => {
        const events: unknown[]=[];
        const token=issueTranslationSession({sessionId:'audit',targetLanguage:'de',routePath:'/about',routeClass:'PUBLIC_TRANSLATABLE',surface:'public-content',ttlMs:60000,maxRequests:8,maxCharacters:8192},SECRET);
        const provider:TranslationProvider={identity:{providerId:'mock',modelIdentifier:'nmt'},supportsLanguage:()=>true,translate:vi.fn(async({texts})=>({texts:[...texts]}))};
        await translateBatchRequest({
            request:new Request('https://www.mrxsteroid.com/api/translate',{headers:{origin:'https://www.mrxsteroid.com'}}),
            payload:{sourceLanguage:'en',targetLanguage:'de',items:[{id:'one',sourceText:'Private source {name}',surface:'public-content'}]},
            createProvider:()=>provider,resolveVerifiedTargets:async()=>new Set(['de']),clientId:'client',routePath:'/about',sessionToken:token,sessionSecret:SECRET,
            budgetStore:new MemoryTranslationBudgetStore(),budgetLimits:{maxSessionRequests:8,maxSessionCharacters:8192,maxRouteCharacters:10000,maxDailyCharacters:10000,maxGlobalDailyCharacters:10000,maxTargetsPerDay:4},
            rateLimiter:new MemoryTranslationRateLimiter(),circuitBreaker:new TranslationCircuitBreaker({failureThreshold:2,openDurationMs:100}),
            audit:(event)=>events.push(safeTranslationAuditEvent(event)),
        });
        const serialized=JSON.stringify(events);
        for(const value of ['Private source',token,SECRET,'redis-token','__MRX_TOKEN_0__']) expect(serialized).not.toContain(value);
    });
});