import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import PaymentDiagnostic from '../../pages/PaymentDiagnostic';

// Mock the payment diagnostic utilities
vi.mock('../../utils/payment-diagnostic', () => ({
  runPaymentDiagnostic: vi.fn(() => ({
    timestamp: Date.now(),
    checks: {
      publicKey: { status: 'success', message: 'Valid', messageAr: 'صالح' },
      callbackUrl: { status: 'success', message: 'Valid', messageAr: 'صالح' },
      webhookEndpoint: { status: 'success', message: 'Valid', messageAr: 'صالح' }
    }
  })),
  logDiagnosticReport: vi.fn(),
  getDiagnosticSummary: vi.fn(() => ({
    status: 'healthy',
    message: 'All checks passed',
    messageAr: 'تم تمرير جميع عمليات الفحص',
    issues: [],
    issuesAr: []
  }))
}));

// Mock UI components
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

// Mock icons
vi.mock('lucide-react', () => ({
  CheckCircle2: () => <span data-testid="check-circle">✓</span>,
  AlertTriangle: () => <span data-testid="alert-triangle">⚠</span>,
  XCircle: () => <span data-testid="x-circle">✕</span>,
  RefreshCw: () => <span data-testid="refresh-cw">↻</span>
}));

describe('PaymentDiagnostic Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<PaymentDiagnostic />);
    
    // Check that the main header is present
    expect(screen.getByRole('heading', { name: /Payment Service Diagnostic/i })).toBeInTheDocument();
  });

  it('displays diagnostic results', async () => {
    render(<PaymentDiagnostic />);
    
    // Wait for the diagnostic to complete and results to show
    expect(await screen.findByText(/Overall Status/i)).toBeInTheDocument();
  });

  it('shows healthy status when all checks pass', async () => {
    render(<PaymentDiagnostic />);
    
    // Wait for the diagnostic to complete
    const statusElement = await screen.findByText(/healthy/i);
    expect(statusElement).toBeInTheDocument();
  });

  it('displays Arabic content when needed', async () => {
    render(<PaymentDiagnostic />);
    
    // Check for Arabic text in the component
    expect(await screen.findByText(/خدمة الدفع/i)).toBeInTheDocument(); // "Payment Service" in Arabic
  });

  it('has a re-run diagnostic button', async () => {
    render(<PaymentDiagnostic />);
    
    // Wait for initial render to complete
    expect(await screen.findByTestId('button')).toBeInTheDocument();
    
    const rerunButton = screen.getByTestId('button');
    expect(rerunButton).toBeInTheDocument();
    expect(rerunButton).toHaveTextContent(/Re-run/i);
  });
});