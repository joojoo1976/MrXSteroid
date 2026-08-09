/**
 * Minimal local stand-ins for the Vercel Node runtime request/response types.
 * Replaces the deprecated @vercel/node dependency (which pulls in vulnerable
 * transitive deps: ajv, brace-expansion, js-yaml, minimatch, undici, ...).
 *
 * Only the shapes the payment libraries actually touch are modelled:
 *   - VercelRequest: `headers`, `query`, `body`, `method`, `url`
 *   - VercelResponse: `status(code).json(body)`
 */
export interface VercelRequest {
    method?: string;
    url?: string;
    headers: Record<string, string | string[] | undefined>;
    query: Record<string, string | string[] | undefined>;
    body?: unknown;
}

export interface VercelResponse {
    status(code: number): VercelResponse;
    json(body: unknown): VercelResponse;
    setHeader(name: string, value: string): VercelResponse;
    send(body: unknown): unknown;
}
