import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import PaymentDiagnostic from '../../pages/PaymentDiagnostic';
import {
    runPaymentDiagnostic,
    logDiagnosticReport,
    getDiagnosticSummary
} from '../../utils/payment-diagnostic';

// Mock the utility functions
vi.mock('../../utils/payment-diagnostic', async () => {
    const actual = await vi.importActual('../../utils/payment-diagnostic');
    return {
        ...actual,
        runPaymentDiagnostic: vi.fn(),
        logDiagnosticReport: vi.fn(),
        getDiagnosticSummary: vi.fn()
    };
});

// Mock the UI components
vi.mock('../../shared/ui/card', () => ({
    Card: ({ children }: { children: React.ReactNode }) => <div data-testid="card">{children}</div>,
    CardContent: ({ children }: { children: React.ReactNode }) => <div data-testid="card-content">{children}</div>,
    CardDescription: ({ children }: { children: React.ReactNode }) => <div data-testid="card-description">{children}</div>,
    CardHeader: ({ children }: { children: React.ReactNode }) => <div data-testid="card-header">{children}</div>,
    CardTitle: ({ children }: { children: React.ReactNode }) => <div data-testid="card-title">{children}</div>
}));

vi.mock('../../shared/ui/button', () => ({
    Button: ({ children, onClick, disabled }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean }) => (
        <button data-testid="button" onClick={onClick} disabled={disabled}>
            {children}
        </button>
    )
}));

vi.mock('../../shared/ui/alert', () => ({
    Alert: ({ children }: { children: React.ReactNode }) => <div data-testid="alert">{children}</div>,
    AlertDescription: ({ children }: { children: React.ReactNode }) => <div data-testid="alert-description">{children}</div>,
    AlertTitle: ({ children }: { children: React.ReactNode }) => <div data-testid="alert-title">{children}</div>
}));

vi.mock('../../shared/ui/badge', () => ({
    Badge: ({ children, variant }: { children: React.ReactNode; variant?: string }) => (
        <span data-testid="badge" data-variant={variant}>
            {children}
        </span>
    )
}));

// Mock the icons
vi.mock('lucide-react', () => ({
    CheckCircle2: ({ className }: { className?: string }) => <span className={className}>✓</span>,
    AlertTriangle: ({ className }: { className?: string }) => <span className={className}>⚠</span>,
    XCircle: ({ className }: { className?: string }) => <span className={className}>✕</span>,
    RefreshCw: ({ className }: { className?: string }) => <span className={className}>↻</span>
}));

// Type aliases for mock functions
type MockFn = ReturnType<typeof vi.fn>;

describe('PaymentDiagnostic Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders loading state initially', () => {
        (runPaymentDiagnostic as unknown as MockFn).mockReturnValue({
            timestamp: Date.now(),
            checks: {
                publicKey: { status: 'success', message: 'Valid', messageAr: 'صالح' },
                callbackUrl: { status: 'success', message: 'Valid', messageAr: 'صالح' },
                webhookEndpoint: { status: 'success', message: 'Valid', messageAr: 'صالح' }
            }
        });

        render(<PaymentDiagnostic />);

        expect(screen.getByText('Payment Service Diagnostic')).toBeInTheDocument();
    });

    it('runs diagnostic on mount and displays results', async () => {
        const mockReport = {
            timestamp: Date.now(),
            checks: {
                publicKey: {
                    status: 'success',
                    message: 'Public key is valid',
                    messageAr: 'المفتاح العام صحيح',
                    details: { keyLength: 32 }
                },
                callbackUrl: {
                    status: 'warning',
                    message: 'Callback URL should use HTTPS',
                    messageAr: 'ينبغي أن يستخدم عنوان URL للاستcallable HTTPS',
                    details: { isHttps: false }
                },
                webhookEndpoint: {
                    status: 'error',
                    message: 'Webhook endpoint is not accessible',
                    messageAr: 'نقطة نهاية webhook غير متاحة',
                    details: { statusCode: 404 }
                }
            }
        };

        const mockSummary = {
            status: 'warning',
            message: 'Some issues detected',
            messageAr: 'تم اكتشاف بعض المشاكل',
            issues: ['Callback URL should use HTTPS', 'Webhook endpoint is not accessible'],
            issuesAr: ['ينبغي أن يستخدم عنوان URL للاستcallable HTTPS', 'نقطة نهاية webhook غير متاحة']
        };

        (runPaymentDiagnostic as unknown as MockFn).mockReturnValue(mockReport);
        (getDiagnosticSummary as unknown as MockFn).mockReturnValue(mockSummary);

        render(<PaymentDiagnostic />);

        await waitFor(() => {
            expect(screen.getByText('Overall Status')).toBeInTheDocument();
        });

        expect(runPaymentDiagnostic).toHaveBeenCalled();
        expect(getDiagnosticSummary).toHaveBeenCalledWith(mockReport);
        expect(logDiagnosticReport).toHaveBeenCalledWith(mockReport);

        expect(screen.getByText('Public key is valid')).toBeInTheDocument();
        expect(screen.getAllByText('Callback URL should use HTTPS')[0]).toBeInTheDocument();
        expect(screen.getAllByText('Webhook endpoint is not accessible')[0]).toBeInTheDocument();

        expect(screen.getByText('المفتاح العام صحيح')).toBeInTheDocument();
    });

    it('handles re-run diagnostic button click', async () => {
        const mockReport = {
            timestamp: Date.now(),
            checks: {
                publicKey: { status: 'success', message: 'Valid', messageAr: 'صالح' }
            }
        };

        const mockSummary = {
            status: 'healthy',
            message: 'All checks passed',
            messageAr: 'تم تمرير جميع عمليات الفحص',
            issues: [] as string[],
            issuesAr: [] as string[]
        };

        (runPaymentDiagnostic as unknown as MockFn).mockReturnValue(mockReport);
        (getDiagnosticSummary as unknown as MockFn).mockReturnValue(mockSummary);

        render(<PaymentDiagnostic />);

        await waitFor(() => {
            expect(screen.getByText('Overall Status')).toBeInTheDocument();
        });

        const rerunButton = screen.getByTestId('button');
        fireEvent.click(rerunButton);

        expect(runPaymentDiagnostic).toHaveBeenCalledTimes(2);
    });

    it('disables re-run button while diagnostic is running', async () => {
        const mockPromise = new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    timestamp: Date.now(),
                    checks: {
                        publicKey: { status: 'success', message: 'Valid', messageAr: 'صالح' }
                    }
                });
            }, 100);
        });

        (runPaymentDiagnostic as unknown as MockFn).mockReturnValue(mockPromise as any);
        (getDiagnosticSummary as unknown as MockFn).mockImplementation(() => ({
            status: 'healthy',
            message: 'All checks passed',
            messageAr: 'تم تمرير جميع عمليات الفحص',
            issues: [] as string[],
            issuesAr: [] as string[]
        }));

        render(<PaymentDiagnostic />);

        const rerunButton = screen.getByTestId('button');
        fireEvent.click(rerunButton);

        expect(runPaymentDiagnostic).toHaveBeenCalledTimes(1);
    });

    it('displays error status correctly', async () => {
        const mockReport = {
            timestamp: Date.now(),
            checks: {
                publicKey: {
                    status: 'error',
                    message: 'Invalid public key',
                    messageAr: 'مفتاح عام غير صحيح',
                    details: { error: 'Key format is invalid' }
                }
            }
        };

        const mockSummary = {
            status: 'critical',
            message: 'Critical issues detected',
            messageAr: 'تم اكتشاف مشاكل حرجة',
            issues: ['Invalid public key'],
            issuesAr: ['مفتاح عام غير صحيح']
        };

        (runPaymentDiagnostic as unknown as MockFn).mockReturnValue(mockReport);
        (getDiagnosticSummary as unknown as MockFn).mockReturnValue(mockSummary);

        render(<PaymentDiagnostic />);

        await waitFor(() => {
            expect(screen.getByText('Overall Status')).toBeInTheDocument();
        });

        const badgeElements = screen.getAllByTestId('badge');
        expect(badgeElements.length).toBeGreaterThan(0);
    });

    it('displays warning status correctly', async () => {
        const mockReport = {
            timestamp: Date.now(),
            checks: {
                callbackUrl: {
                    status: 'warning',
                    message: 'Callback URL should use HTTPS',
                    messageAr: 'ينبغي أن يستخدم عنوان URL للاستcallable HTTPS',
                    details: { isHttps: false }
                }
            }
        };

        const mockSummary = {
            status: 'warning',
            message: 'Some issues detected',
            messageAr: 'تم اكتشاف بعض المشاكل',
            issues: ['Callback URL should use HTTPS'],
            issuesAr: ['ينبغي أن يستخدم عنوان URL للاستcallable HTTPS']
        };

        (runPaymentDiagnostic as unknown as MockFn).mockReturnValue(mockReport);
        (getDiagnosticSummary as unknown as MockFn).mockReturnValue(mockSummary);

        render(<PaymentDiagnostic />);

        await waitFor(() => {
            expect(screen.getByText('Overall Status')).toBeInTheDocument();
        });

        const badgeElements = screen.getAllByTestId('badge');
        expect(badgeElements.length).toBeGreaterThan(0);
    });

    it('formats timestamp correctly', async () => {
        const mockTimestamp = 1678886400000;
        const mockReport = {
            timestamp: mockTimestamp,
            checks: {
                publicKey: { status: 'success', message: 'Valid', messageAr: 'صالح' }
            }
        };

        const mockSummary = {
            status: 'healthy',
            message: 'All checks passed',
            messageAr: 'تم تمرير جميع عمليات الفحص',
            issues: [] as string[],
            issuesAr: [] as string[]
        };

        (runPaymentDiagnostic as unknown as MockFn).mockReturnValue(mockReport);
        (getDiagnosticSummary as unknown as MockFn).mockReturnValue(mockSummary);

        render(<PaymentDiagnostic />);

        await waitFor(() => {
            expect(screen.getByText('Overall Status')).toBeInTheDocument();
        });

        const timestampElement = screen.getByText(/Last diagnostic run:/);
        expect(timestampElement).toBeInTheDocument();
    });

    it('shows help section with common issues', async () => {
        const mockReport = {
            timestamp: Date.now(),
            checks: {
                publicKey: { status: 'success', message: 'Valid', messageAr: 'صالح' }
            }
        };

        const mockSummary = {
            status: 'healthy',
            message: 'All checks passed',
            messageAr: 'تم تمرير جميع عمليات الفحص',
            issues: [] as string[],
            issuesAr: [] as string[]
        };

        (runPaymentDiagnostic as unknown as MockFn).mockReturnValue(mockReport);
        (getDiagnosticSummary as unknown as MockFn).mockReturnValue(mockSummary);

        render(<PaymentDiagnostic />);

        await waitFor(() => {
            expect(screen.getByText('Need Help?')).toBeInTheDocument();
        });

        expect(screen.getByText('Common Issues:')).toBeInTheDocument();
        expect(screen.getByText('Invalid Public Key: Check your SpaceRemit dashboard for the correct key')).toBeInTheDocument();
        expect(screen.getByText('Missing Configuration: Ensure all environment variables are set')).toBeInTheDocument();
        expect(screen.getByText('Callback URL: Verify the URL is accessible and uses HTTPS in production')).toBeInTheDocument();

        expect(screen.getByText('المشاكل الشائعة:')).toBeInTheDocument();
        expect(screen.getByText('مفتاح عام غير صالح: تحقق من لوحة تحكم SpaceRemit للحصول على المفتاح الصحيح')).toBeInTheDocument();
    });
});