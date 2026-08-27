'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './button';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
    isRTL?: boolean;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('[ErrorBoundary] Caught error:', error, errorInfo);
        this.props.onError?.(error, errorInfo);
    }

    reset = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        const { hasError, error } = this.state;
        const { children, fallback, isRTL = false } = this.props;

        if (hasError) {
            if (fallback) {
                return fallback;
            }

            return (
                <div
                    className={`flex flex-col items-center justify-center min-h-[300px] p-6 bg-zinc-900/50 border border-zinc-800 rounded-[1.25rem] text-center ${isRTL ? 'font-cairo' : ''}`}
                    dir={isRTL ? 'rtl' : 'ltr'}
                    role="alert"
                >
                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4 border border-red-500/20">
                        <AlertTriangle className="w-8 h-8 text-red-500" />
                    </div>
                    <h3 className="text-lg font-black text-white mb-2">
                        {isRTL ? 'حدث خطأ غير متوقع' : 'Something went wrong'}
                    </h3>
                    <p className="text-zinc-400 text-sm mb-6 max-w-md">
                        {isRTL
                            ? 'تعذر تحميل مكون التواصل. يرجى تحديث الصفحة أو المحاولة مرة أخرى.'
                            : 'Failed to load the contact component. Please refresh the page or try again.'}
                    </p>
                    <Button
                        variant="default"
                        className="gap-2"
                        onClick={this.reset}
                    >
                        <RefreshCw className="w-4 h-4" />
                        {isRTL ? 'إعادة المحاولة' : 'Try Again'}
                    </Button>
                    {process.env.NODE_ENV === 'development' && error && (
                        <details className="mt-6 text-left w-full max-w-md">
                            <summary className="text-[9px] font-black uppercase tracking-widest text-zinc-500 cursor-pointer mb-2">
                                {isRTL ? 'تفاصيل الخطأ (تطوير)' : 'Error Details (Dev)'}
                            </summary>
                            <pre className="text-[10px] text-zinc-500 bg-zinc-950 p-3 rounded-lg overflow-auto max-h-40">
                                {error.message}\n{error.stack}
                            </pre>
                        </details>
                    )}
                </div>
            );
        }

        return children;
    }
}

export default ErrorBoundary;