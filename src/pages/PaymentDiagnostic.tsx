import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert';
import { Badge } from '@/shared/ui/badge';
import {
    runPaymentDiagnostic,
    logDiagnosticReport,
    getDiagnosticSummary
} from '../utils/payment-diagnostic';

interface CheckResult {
    status: 'success' | 'warning' | 'error';
    message: string;
    messageAr: string;
    details?: Record<string, unknown>;
}

interface DiagnosticReport {
    timestamp: string;
    checks: Record<string, CheckResult>;
}

interface DiagnosticSummary {
    status: 'healthy' | 'warning' | 'critical';
    message: string;
    messageAr: string;
    issues: string[];
    issuesAr: string[];
}

const StatusIcon: React.FC<{ status: string }> = ({ status }) => {
    if (status === 'success') return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    if (status === 'warning') return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    return <XCircle className="h-5 w-5 text-red-500" />;
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const variantMap: Record<string, string> = {
        success: 'default',
        warning: 'secondary',
        error: 'destructive',
        healthy: 'default',
        critical: 'destructive'
    };
    return <Badge variant={variantMap[status] as any}>{status.toUpperCase()}</Badge>;
};

const PaymentDiagnostic: React.FC = () => {
    const [report, setReport] = useState<DiagnosticReport | null>(null);
    const [summary, setSummary] = useState<DiagnosticSummary | null>(null);
    const [isRunning, setIsRunning] = useState(false);

    const runDiagnostic = async () => {
        setIsRunning(true);
        try {
            const diagnosticReport = await Promise.resolve(runPaymentDiagnostic());
            const diagnosticSummary = getDiagnosticSummary(diagnosticReport);
            logDiagnosticReport(diagnosticReport);
            setReport(diagnosticReport as DiagnosticReport);
            setSummary(diagnosticSummary as DiagnosticSummary);
        } finally {
            setIsRunning(false);
        }
    };

    useEffect(() => {
        runDiagnostic();
    }, []);

    return (
        <div className="container mx-auto p-6 max-w-4xl">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold">Payment Service Diagnostic</h1>
                    <p className="text-muted-foreground mt-1">تشخيص خدمة الدفع</p>
                </div>
                <Button
                    data-testid="button"
                    onClick={runDiagnostic}
                    disabled={isRunning}
                >
                    <RefreshCw className={`mr-2 h-4 w-4 ${isRunning ? 'animate-spin' : ''}`} />
                    {isRunning ? 'Running...' : 'Re-run Diagnostic'}
                </Button>
            </div>

            {report && summary && (
                <>
                    {/* Overall Status */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                Overall Status
                                <StatusBadge status={summary.status} />
                            </CardTitle>
                            <CardDescription>
                                {summary.message} / {summary.messageAr}
                            </CardDescription>
                        </CardHeader>
                        {report.timestamp && (
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    Last diagnostic run: {new Date(report.timestamp).toLocaleString()}
                                </p>
                            </CardContent>
                        )}
                    </Card>

                    {/* Individual Checks */}
                    <div className="space-y-4 mb-6">
                        {Object.entries(report.checks).map(([checkName, result]) => (
                            <Card key={checkName}>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <StatusIcon status={result.status} />
                                        {checkName.replace(/([A-Z])/g, ' $1').trim()}
                                        <StatusBadge status={result.status} />
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm">{result.message}</p>
                                    <p className="text-sm text-muted-foreground mt-1">{result.messageAr}</p>
                                    {result.details && (
                                        <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
                                            {JSON.stringify(result.details, null, 2)
                                                .split('\n')
                                                .slice(1, -1)
                                                .map(line => line.trim())
                                                .filter(Boolean)
                                                .map(line => {
                                                    const parts = line.replace(/,$/, '').split(': ');
                                                    const key = parts[0].replace(/"/g, '');
                                                    const value = parts.slice(1).join(': ');
                                                    return `"${key}": ${value}`;
                                                })
                                                .map((line, i, arr) => (
                                                    <span key={i}>{line}{i < arr.length - 1 ? '\n' : ''}</span>
                                                ))}
                                        </pre>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Issues List */}
                    {summary.issues.length > 0 && (
                        <Alert className="mb-6">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>Issues Detected</AlertTitle>
                            <AlertDescription>
                                <ul className="list-disc list-inside mt-2 space-y-1">
                                    {summary.issues.map((issue, i) => (
                                        <li key={i}>{issue}</li>
                                    ))}
                                </ul>
                            </AlertDescription>
                        </Alert>
                    )}
                </>
            )}

            {/* Help Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Need Help?</CardTitle>
                    <CardDescription>هل تحتاج مساعدة؟</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <h3 className="font-semibold mb-2">Common Issues:</h3>
                        <h3 className="font-semibold mb-2 text-muted-foreground">المشاكل الشائعة:</h3>
                        <ul className="list-disc list-inside space-y-2 text-sm">
                            <li>Invalid Public Key: Check your SpaceRemit dashboard for the correct key</li>
                            <li>Missing Configuration: Ensure all environment variables are set</li>
                            <li>Callback URL: Verify the URL is accessible and uses HTTPS in production</li>
                        </ul>
                        <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground mt-2">
                            <li>مفتاح عام غير صالح: تحقق من لوحة تحكم SpaceRemit للحصول على المفتاح الصحيح</li>
                            <li>تكوين مفقود: تأكد من تعيين جميع متغيرات البيئة</li>
                            <li>عنوان رد الاتصال: تحقق من إمكانية الوصول إلى URL واستخدام HTTPS في الإنتاج</li>
                        </ul>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default PaymentDiagnostic;
