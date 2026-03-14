/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  🔧 PAYMENT CONFIGURATION DIAGNOSTIC PAGE
 *  Check SpaceRemit SDK, Environment Variables, and SSL Status
 * ═══════════════════════════════════════════════════════════════════════════
 */

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, AlertCircle, Loader2, Shield, Lock, Globe } from 'lucide-react';
import { Button } from '../shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../shared/ui/card';
import { usePreferences } from '../context/PreferencesContext';
import { env } from '../config/env';

interface DiagnosticResult {
    name: string;
    status: 'pass' | 'fail' | 'warning';
    message: string;
    details?: string;
}

const PaymentConfigDiagnostic: React.FC = () => {
    const { language } = usePreferences();
    const isAr = language === 'ar';
    const [results, setResults] = useState<DiagnosticResult[]>([]);
    const [isRunning, setIsRunning] = useState(true);
    const [spaceremitLoaded, setSpaceremitLoaded] = useState(false);

    // Run diagnostics
    useEffect(() => {
        const runDiagnostics = async () => {
            const diagnosticResults: DiagnosticResult[] = [];

            // 1. Check Environment Variables
            const publicKey = env.SPACEREMIT_PUBLIC_KEY;
            if (publicKey && publicKey.trim() !== '') {
                diagnosticResults.push({
                    name: isAr ? 'متغير البيئة (Public Key)' : 'Environment Variable (Public Key)',
                    status: 'pass',
                    message: isAr ? 'مفتاح SpaceRemit موجود' : 'SpaceRemit key is configured',
                    details: `Key preview: ${publicKey.substring(0, 8)}...`
                });
            } else {
                diagnosticResults.push({
                    name: isAr ? 'متغير البيئة (Public Key)' : 'Environment Variable (Public Key)',
                    status: 'fail',
                    message: isAr ? 'مفتاح SpaceRemit مفقود!' : 'SpaceRemit key is missing!',
                    details: isAr
                        ? 'أضف VITE_SPACEREMIT_PUBLIC_KEY إلى ملف .env'
                        : 'Add VITE_SPACEREMIT_PUBLIC_KEY to your .env file'
                });
            }

            // 2. Check HTTPS
            const isHTTPS = window.location.protocol === 'https:' || window.location.hostname === 'localhost';
            diagnosticResults.push({
                name: isAr ? 'اتصال آمن (HTTPS)' : 'Secure Connection (HTTPS)',
                status: isHTTPS ? 'pass' : 'fail',
                message: isHTTPS
                    ? (isAr ? 'الموقع يستخدم HTTPS ✅' : 'Site is using HTTPS ✅')
                    : (isAr ? '⚠️ الموقع ليس HTTPS - قد تفشل المدفوعات' : '⚠️ Site not using HTTPS - payments may fail'),
                details: isAr
                    ? 'SpaceRemit يتطلب اتصالاً آمناً'
                    : 'SpaceRemit requires a secure connection'
            });

            // 3. Check SpaceRemit SDK Load
            await new Promise<void>((resolve) => {
                const script = document.createElement('script');
                script.src = 'https://spaceremit.com/api/v2/js_script/spaceremit.js';
                script.async = true;
                script.crossOrigin = 'anonymous';

                script.onload = () => {
                    setSpaceremitLoaded(true);
                    diagnosticResults.push({
                        name: isAr ? 'تحميل SpaceRemit SDK' : 'SpaceRemit SDK Load',
                        status: 'pass',
                        message: isAr ? 'تم تحميل SDK بنجاح' : 'SDK loaded successfully',
                        details: 'spaceremit.com API accessible'
                    });
                    resolve();
                };

                script.onerror = () => {
                    setSpaceremitLoaded(false);
                    diagnosticResults.push({
                        name: isAr ? 'تحميل SpaceRemit SDK' : 'SpaceRemit SDK Load',
                        status: 'fail',
                        message: isAr ? 'فشل تحميل SDK' : 'Failed to load SDK',
                        details: isAr
                            ? 'تحقق من اتصال الإنترنت أو حجب CSP'
                            : 'Check internet connection or CSP blocking'
                    });
                    resolve();
                };

                document.body.appendChild(script);

                // Timeout after 5 seconds
                setTimeout(() => {
                    if (!window.SPACEREMIT) {
                        setSpaceremitLoaded(false);
                        diagnosticResults.push({
                            name: isAr ? 'تحميل SpaceRemit SDK' : 'SpaceRemit SDK Load',
                            status: 'warning',
                            message: isAr ? 'تحميل SDK يستغرق وقتاً طويلاً' : 'SDK loading taking too long',
                            details: isAr
                                ? 'قد يكون هناك مشكلة في الشبكة'
                                : 'May be a network issue'
                        });
                        resolve();
                    }
                }, 5000);
            });

            // 4. Check Window.SPACEREMIT availability
            if (window.SPACEREMIT) {
                diagnosticResults.push({
                    name: isAr ? 'تهيئة SpaceRemit' : 'SpaceRemit Initialization',
                    status: 'pass',
                    message: isAr ? 'SpaceRemit جاهز للاستخدام' : 'SpaceRemit ready to use',
                    details: `Version: ${typeof window.SPACEREMIT.init === 'function' ? 'v2+' : 'unknown'}`
                });
            } else {
                diagnosticResults.push({
                    name: isAr ? 'تهيئة SpaceRemit' : 'SpaceRemit Initialization',
                    status: 'fail',
                    message: isAr ? 'SpaceRemit غير مهيأ' : 'SpaceRemit not initialized',
                    details: isAr
                        ? 'تأكد من تحميل السكريبت بشكل صحيح'
                        : 'Ensure script is loading correctly'
                });
            }

            // 5. Check CSP Headers
            const cspHeader = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
            if (cspHeader) {
                const cspContent = cspHeader.getAttribute('content') || '';
                const allowsSpaceremit = cspContent.includes('spaceremit.com') || cspContent.includes('script-src') && cspContent.includes("'self'");
                diagnosticResults.push({
                    name: isAr ? 'سياسة الأمان (CSP)' : 'Content Security Policy (CSP)',
                    status: allowsSpaceremit ? 'pass' : 'warning',
                    message: allowsSpaceremit
                        ? (isAr ? 'CSP يسمح بـ SpaceRemit' : 'CSP allows SpaceRemit')
                        : (isAr ? '⚠️ CSP قد يمنع SpaceRemit' : '⚠️ CSP may block SpaceRemit'),
                    details: cspContent.substring(0, 100) + '...'
                });
            } else {
                diagnosticResults.push({
                    name: isAr ? 'سياسة الأمان (CSP)' : 'Content Security Policy (CSP)',
                    status: 'warning',
                    message: isAr ? 'لا يوجد CSP - قد يكون خطر' : 'No CSP header - potential security risk',
                    details: isAr
                        ? 'يُوصى بإضافة CSP للدفع'
                        : 'CSP recommended for payment pages'
                });
            }

            setResults(diagnosticResults);
            setIsRunning(false);
        };

        runDiagnostics();
    }, [isAr]);

    const getStatusIcon = (status: 'pass' | 'fail' | 'warning') => {
        switch (status) {
            case 'pass':
                return <CheckCircle2 className="w-5 h-5 text-green-500" />;
            case 'fail':
                return <XCircle className="w-5 h-5 text-red-500" />;
            case 'warning':
                return <AlertCircle className="w-5 h-5 text-yellow-500" />;
        }
    };

    const getStatusText = (status: 'pass' | 'fail' | 'warning') => {
        switch (status) {
            case 'pass':
                return isAr ? 'ناجح' : 'Pass';
            case 'fail':
                return isAr ? 'فشل' : 'Fail';
            case 'warning':
                return isAr ? 'تحذير' : 'Warning';
        }
    };

    const allPassed = results.every(r => r.status === 'pass');
    const hasFailures = results.some(r => r.status === 'fail');

    return (
        <div className="min-h-screen bg-black text-white py-20 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="mb-8 text-center"
                >
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <Shield className="w-8 h-8 text-gold-500" />
                        <h1 className="text-3xl font-black text-white">
                            {isAr ? 'تشخيص نظام الدفع' : 'Payment System Diagnostic'}
                        </h1>
                    </div>
                    <p className="text-zinc-400">
                        {isAr
                            ? 'فحص شامل لبوابة الدفع SpaceRemit'
                            : 'Comprehensive SpaceRemit payment gateway check'}
                    </p>
                </motion.div>

                {/* Running Status */}
                {isRunning && (
                    <Card className="bg-zinc-900/50 border-zinc-800 mb-6">
                        <CardContent className="p-6 flex items-center justify-center gap-3">
                            <Loader2 className="w-6 h-6 text-gold-500 animate-spin" />
                            <span className="text-zinc-400 font-medium">
                                {isAr ? 'جاري التشغيل...' : 'Running diagnostics...'}
                            </span>
                        </CardContent>
                    </Card>
                )}

                {/* Results */}
                {!isRunning && (
                    <>
                        {/* Summary Card */}
                        <Card className={`mb-6 border-2 ${
                            allPassed
                                ? 'bg-green-500/10 border-green-500/30'
                                : hasFailures
                                    ? 'bg-red-500/10 border-red-500/30'
                                    : 'bg-yellow-500/10 border-yellow-500/30'
                        }`}>
                            <CardContent className="p-6 flex items-center gap-4">
                                {allPassed
                                    ? <CheckCircle2 className="w-8 h-8 text-green-500" />
                                    : hasFailures
                                        ? <XCircle className="w-8 h-8 text-red-500" />
                                        : <AlertCircle className="w-8 h-8 text-yellow-500" />
                                }
                                <div>
                                    <p className={`font-black text-lg ${
                                        allPassed
                                            ? 'text-green-400'
                                            : hasFailures
                                                ? 'text-red-400'
                                                : 'text-yellow-400'
                                    }`}>
                                        {allPassed
                                            ? (isAr ? '✅ جميع الفحوصات ناجحة' : '✅ All checks passed')
                                            : hasFailures
                                                ? (isAr ? '❌ توجد مشاكل حرجة' : '❌ Critical issues found')
                                                : (isAr ? '⚠️ توجد تحذيرات' : '⚠️ Warnings found')}
                                    </p>
                                    <p className="text-sm text-zinc-400">
                                        {results.filter(r => r.status === 'pass').length}/{results.length} {isAr ? 'فحوصات ناجحة' : 'checks passed'}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Detailed Results */}
                        <div className="space-y-4">
                            {results.map((result, index) => (
                                <motion.div
                                    key={result.name}
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <Card className="bg-zinc-900/50 border-zinc-800">
                                        <CardContent className="p-4">
                                            <div className="flex items-start justify-between gap-4 mb-2">
                                                <div className="flex items-center gap-3 flex-1">
                                                    {getStatusIcon(result.status)}
                                                    <div>
                                                        <p className="font-bold text-white">{result.name}</p>
                                                        <p className="text-sm text-zinc-400">{result.message}</p>
                                                    </div>
                                                </div>
                                                <span className={`text-xs font-black px-2 py-1 rounded ${
                                                    result.status === 'pass'
                                                        ? 'bg-green-500/20 text-green-400'
                                                        : result.status === 'fail'
                                                            ? 'bg-red-500/20 text-red-400'
                                                            : 'bg-yellow-500/20 text-yellow-400'
                                                }`}>
                                                    {getStatusText(result.status)}
                                                </span>
                                            </div>
                                            {result.details && (
                                                <p className="text-xs text-zinc-500 mt-2 pl-8">{result.details}</p>
                                            )}
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-8 flex flex-col sm:flex-row gap-4">
                            <Button
                                onClick={() => window.location.reload()}
                                className="flex-1 bg-gold-500 hover:bg-gold-400 text-black font-black"
                            >
                                {isAr ? 'إعادة المحاولة' : 'Retry'}
                            </Button>
                            <Button
                                onClick={() => window.history.back()}
                                variant="outline"
                                className="flex-1 border-zinc-700 hover:bg-zinc-800"
                            >
                                {isAr ? 'عودة' : 'Back'}
                            </Button>
                        </div>

                        {/* Environment Variables Display */}
                        <Card className="mt-8 bg-zinc-900/30 border-zinc-800">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2 text-zinc-300">
                                    <Lock className="w-4 h-4" />
                                    {isAr ? 'متغيرات البيئة الحالية' : 'Current Environment Variables'}
                                </CardTitle>
                                <CardDescription className="text-zinc-500">
                                    {isAr ? 'لأغراض التشخيص فقط' : 'For diagnostic purposes only'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <div className="flex justify-between items-center p-3 bg-black/40 rounded">
                                    <span className="text-zinc-400">SPACEREMIT_PUBLIC_KEY</span>
                                    <span className="text-gold-500 font-mono">
                                        {env.SPACEREMIT_PUBLIC_KEY
                                            ? `${env.SPACEREMIT_PUBLIC_KEY.substring(0, 8)}...`
                                            : (isAr ? 'مفقود' : 'MISSING')}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-black/40 rounded">
                                    <span className="text-zinc-400">SITE_URL</span>
                                    <span className="text-zinc-300 font-mono">{env.SITE_URL}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-black/40 rounded">
                                    <span className="text-zinc-400">PROTOCOL</span>
                                    <span className="text-zinc-300 font-mono">{window.location.protocol}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>
        </div>
    );
};

export default PaymentConfigDiagnostic;
