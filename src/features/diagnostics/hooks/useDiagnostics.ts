import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { LinkageInspector, InspectionResult } from '../../../lib/linkage-inspector';
import { env } from '../../../config/env';

export interface DiagnosticStatus {
    url: string;
    keyExists: boolean;
    keyFormat: boolean;
    connection: 'testing' | 'success' | 'failed';
    error: string | null;
    rawError: unknown;
    diagnosticDetails?: InspectionResult['checks'];
}

export const useDiagnostics = () => {
    const [status, setStatus] = useState<DiagnosticStatus>({
        url: env.SUPABASE_URL || 'MISSING',
        keyExists: !!env.SUPABASE_ANON_KEY,
        keyFormat: (env.SUPABASE_ANON_KEY || '').startsWith('eyJ'),
        connection: 'testing',
        error: null,
        rawError: null
    });

    const [logs, setLogs] = useState<string[]>([]);

    const addLog = useCallback((msg: string) => {
        setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`]);
    }, []);

    const runTests = useCallback(async () => {
        setStatus(prev => ({ ...prev, connection: 'testing', error: null, rawError: null }));
        setLogs([]);
        addLog('Starting comprehensive Linkage Inspector diagnostics...');

        try {
            const result = await LinkageInspector.inspect('full');

            addLog(`Supabase URL Trace: ${result.checks.url_reachable ? 'REACHABLE' : 'UNREACHABLE'}`);
            addLog(`API Key Trace: ${result.checks.api_key_valid ? 'VALID_FORMAT' : 'INVALID_FORMAT'}`);

            if (result.checks.auth_endpoint) {
                addLog(`Auth API: ${result.checks.auth_endpoint.status.toUpperCase()} (${result.checks.auth_endpoint.latency_ms}ms)`);
            }

            if (result.checks.database_connection) {
                addLog(`Database: ${result.checks.database_connection.status.toUpperCase()} (${result.checks.database_connection.latency_ms}ms)`);
            }

            if (result.checks.webhook_delivery) {
                addLog(`Webhook Simulation: ${result.checks.webhook_delivery.status.toUpperCase()} (HTTP ${result.checks.webhook_delivery.http_status_code})`);
            }

            if (result.checks.spaceremit_sdk) {
                addLog(`SpaceRemit SDK: ${result.checks.spaceremit_sdk.loaded ? 'LOADED' : 'NOT_LOADED'}`);
                addLog(`Pay Key Format: ${result.checks.spaceremit_sdk.key_format_valid ? 'VALID' : 'INVALID/SHORT'}`);
            } else {
                addLog(`SpaceRemit SDK: CHECK_NOT_RUN (Check code logic)`);
            }

            if (!result.success) {
                addLog(`FAILURE DETECTED: [${result.error?.code}] ${result.error?.message}`);
                addLog(`SUGGESTION: ${result.error?.suggestion}`);
                setStatus(prev => ({
                    ...prev,
                    connection: 'failed',
                    error: result.error?.message || 'Diagnostic failure',
                    diagnosticDetails: result.checks,
                    rawError: result.error
                }));
            } else {
                addLog('Mr. X System Linkage: OPTIMAL.');
                setStatus(prev => ({
                    ...prev,
                    connection: 'success',
                    diagnosticDetails: result.checks
                }));
            }
        } catch (e: unknown) {
            const err = e as Error;
            addLog(`CRITICAL SYSTEM ERROR: ${err.message}`);
            setStatus(prev => ({
                ...prev,
                connection: 'failed',
                error: err.message,
                rawError: err
            }));
        }
    }, [addLog]);

    useEffect(() => {
        const timer = setTimeout(() => {
            runTests();
        }, 0);
        return () => clearTimeout(timer);
    }, [runTests]);

    const copyLogs = () => {
        const text = `DIAGNOSTIC REPORT\n${new Date().toISOString()}\n\n` +
            `URL: ${status.url}\n` +
            `Key Exists: ${status.keyExists}\n` +
            `Key Format: ${status.keyFormat}\n` +
            `Connection: ${status.connection}\n` +
            `Error: ${status.error}\n\n` +
            `LOGS:\n${logs.join('\n')}\n\n` +
            `RAW ERROR:\n${JSON.stringify(status.rawError, null, 2)}`;

        navigator.clipboard.writeText(text);
        toast.success('Diagnostics copied to clipboard!');
    };

    return {
        status,
        logs,
        runTests,
        copyLogs
    };
};
