/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  🔍 PAYMENT DIAGNOSTIC PAGE                                              ║
 * ║  صفحة تشخيص الدفع                                                       ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../shared/ui/card';
import { Button } from '../shared/ui/button';
import { Alert, AlertDescription, AlertTitle } from '../shared/ui/alert';
import { Badge } from '../shared/ui/badge';
import {
    runPaymentDiagnostic,
    logDiagnosticReport,
    getDiagnosticSummary,
    type PaymentDiagnosticReport
} from '../utils/payment-diagnostic';
import { CheckCircle2, AlertTriangle, XCircle, RefreshCw } from 'lucide-react';

export default function PaymentDiagnostic() {
    const [report, setReport] = useState<PaymentDiagnosticReport | null>(null);
    const [isRunning, setIsRunning] = useState(false);

    const runDiagnostic = () => {
        setIsRunning(true);
        setTimeout(() => {
            const diagnosticReport = runPaymentDiagnostic();
            setReport(diagnosticReport);
            logDiagnosticReport(diagnosticReport);
            setIsRunning(false);
        }, 500);
    };

    useEffect(() => {
        // Run diagnostic on mount (wrapped to avoid sync state update warning)
        const timer = setTimeout(() => {
            runDiagnostic();
        }, 0);
        return () => clearTimeout(timer);
    }, []);

    if (!report) {
        return (
            <div className="container mx-auto p-6 max-w-4xl">
                <Card>
                    <CardContent className="p-12 text-center">
                        <RefreshCw className="w-12 h-12 mx-auto mb-4 animate-spin text-blue-500" />
                        <p className="text-lg">Running diagnostic...</p>
                        <p className="text-sm text-muted-foreground mt-2">جاري تشغيل التشخيص...</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const summary = getDiagnosticSummary(report);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'success':
                return <CheckCircle2 className="w-5 h-5 text-green-500" />;
            case 'warning':
                return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
            case 'error':
                return <XCircle className="w-5 h-5 text-red-500" />;
            default:
                return null;
        }
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
            success: 'default',
            warning: 'secondary',
            error: 'destructive'
        };
        return (
            <Badge variant={variants[status] || 'outline'}>
                {status.toUpperCase()}
            </Badge>
        );
    };

    const getOverallStatusColor = (status: string) => {
        switch (status) {
            case 'healthy':
                return 'border-green-500 bg-green-50';
            case 'warning':
                return 'border-yellow-500 bg-yellow-50';
            case 'critical':
                return 'border-red-500 bg-red-50';
            default:
                return '';
        }
    };

    return (
        <div className="container mx-auto p-6 max-w-4xl space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Payment Service Diagnostic</h1>
                    <p className="text-muted-foreground mt-1">تشخيص خدمة الدفع</p>
                </div>
                <Button
                    onClick={runDiagnostic}
                    disabled={isRunning}
                    variant="outline"
                >
                    <RefreshCw className={`w-4 h-4 mr-2 ${isRunning ? 'animate-spin' : ''}`} />
                    Re-run
                </Button>
            </div>

            {/* Overall Status */}
            <Card className={`border-2 ${getOverallStatusColor(summary.status)}`}>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-2xl">Overall Status</CardTitle>
                        <Badge
                            variant={summary.status === 'healthy' ? 'default' : summary.status === 'warning' ? 'secondary' : 'destructive'}
                            className="text-lg px-4 py-1"
                        >
                            {summary.status.toUpperCase()}
                        </Badge>
                    </div>
                    <CardDescription className="text-base mt-2">
                        <div>{summary.message}</div>
                        <div className="text-right mt-1">{summary.messageAr}</div>
                    </CardDescription>
                </CardHeader>
            </Card>

            {/* Issues Summary */}
            {summary.issues.length > 0 && (
                <Alert variant={summary.status === 'critical' ? 'destructive' : 'default'}>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Issues Found</AlertTitle>
                    <AlertDescription>
                        <ul className="list-disc list-inside space-y-1 mt-2">
                            {summary.issues.map((issue, index) => (
                                <li key={index} className="text-sm">{issue}</li>
                            ))}
                        </ul>
                        <div className="mt-3 pt-3 border-t">
                            <p className="text-sm font-semibold mb-1">المشاكل المكتشفة:</p>
                            <ul className="list-disc list-inside space-y-1">
                                {summary.issuesAr.map((issue, index) => (
                                    <li key={index} className="text-sm">{issue}</li>
                                ))}
                            </ul>
                        </div>
                    </AlertDescription>
                </Alert>
            )}

            {/* Detailed Checks */}
            <div className="grid gap-4 md:grid-cols-2">
                {Object.entries(report.checks).map(([key, result]) => (
                    <Card key={key}>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg capitalize flex items-center gap-2">
                                    {getStatusIcon(result.status)}
                                    {key.replace(/([A-Z])/g, ' $1').trim()}
                                </CardTitle>
                                {getStatusBadge(result.status)}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-sm font-medium">Message:</p>
                                    <p className="text-sm text-muted-foreground">{result.message}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium">الرسالة:</p>
                                    <p className="text-sm text-muted-foreground text-right">{result.messageAr}</p>
                                </div>
                                {result.details && (
                                    <div>
                                        <p className="text-sm font-medium mb-2">Details:</p>
                                        <div className="bg-muted p-3 rounded-md">
                                            <pre className="text-xs overflow-x-auto">
                                                {JSON.stringify(result.details, null, 2)}
                                            </pre>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Timestamp */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>Last diagnostic run:</span>
                        <span>{new Date(report.timestamp).toLocaleString()}</span>
                    </div>
                </CardContent>
            </Card>

            {/* Help Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Need Help?</CardTitle>
                    <CardDescription>هل تحتاج إلى مساعدة؟</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div>
                        <h4 className="font-semibold mb-2">Common Issues:</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                            <li>Invalid Public Key: Check your SpaceRemit dashboard for the correct key</li>
                            <li>Missing Configuration: Ensure all environment variables are set</li>
                            <li>Callback URL: Verify the URL is accessible and uses HTTPS in production</li>
                        </ul>
                    </div>
                    <div className="pt-3 border-t">
                        <h4 className="font-semibold mb-2">المشاكل الشائعة:</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground text-right">
                            <li>مفتاح عام غير صالح: تحقق من لوحة تحكم SpaceRemit للحصول على المفتاح الصحيح</li>
                            <li>تكوين مفقود: تأكد من تعيين جميع متغيرات البيئة</li>
                            <li>عنوان URL للاستدعاء: تحقق من إمكانية الوصول إلى العنوان واستخدام HTTPS في الإنتاج</li>
                        </ul>
                    </div>
                    <div className="pt-3 border-t">
                        <Button variant="outline" className="w-full" asChild>
                            <a href="/PAYMENT_FIX_GUIDE.md" target="_blank" rel="noopener noreferrer">
                                View Payment Fix Guide
                            </a>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
