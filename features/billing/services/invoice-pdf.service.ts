/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  INVOICE & RECEIPT PRINT / PDF RENDERING SERVICE
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { InvoiceItem } from '../types/billing.types';
import { BillingService } from './billing.service';

export class InvoicePdfService {
    /**
     * Triggers a clean, branded browser print window for the invoice
     */
    public static printInvoice(invoice: InvoiceItem, isRTL: boolean = true) {
        if (typeof window === 'undefined') return;

        const printWindow = window.open('', '_blank', 'width=850,height=900');
        if (!printWindow) {
            alert(isRTL ? 'يرجى السماح بفتح النوافذ المنبثقة لطباعة الفاتورة.' : 'Please allow popups to print your invoice.');
            return;
        }

        const dateStr = new Date(invoice.created_at).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const planName = BillingService.getPlanName(invoice.tier_id, isRTL);
        const formattedAmount = BillingService.formatPrice(invoice.amount, invoice.currency, isRTL);
        const subtotal = invoice.amount - (invoice.shipping_cost || 0) + (invoice.discount_amount || 0);

        const html = `
<!DOCTYPE html>
<html lang="${isRTL ? 'ar' : 'en'}" dir="${isRTL ? 'rtl' : 'ltr'}">
<head>
    <meta charset="utf-8">
    <title>${isRTL ? 'فاتورة إلكترونية' : 'Tax Invoice'} - ${invoice.id.slice(0, 8)}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: 'Cairo', system-ui, -apple-system, sans-serif;
            background: #ffffff;
            color: #18181b;
            padding: 40px;
            font-size: 14px;
            line-height: 1.6;
        }
        .invoice-card {
            max-width: 750px;
            margin: 0 auto;
            border: 1px solid #e4e4e7;
            border-radius: 16px;
            padding: 36px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.05);
        }
        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #f4f4f5;
            padding-bottom: 24px;
            margin-bottom: 24px;
        }
        .brand {
            font-size: 24px;
            font-weight: 900;
            color: #000000;
            letter-spacing: -0.5px;
        }
        .brand span {
            color: #d97706;
        }
        .badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 999px;
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
        }
        .badge-success { background: #dcfce7; color: #15803d; }
        .badge-pending { background: #fef3c7; color: #b45309; }
        .badge-failed { background: #fee2e2; color: #b91c1c; }
        .meta-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
            margin-bottom: 30px;
            background: #fafafa;
            padding: 16px;
            border-radius: 12px;
        }
        .meta-item strong { display: block; color: #71717a; font-size: 11px; text-transform: uppercase; }
        .meta-item span { font-weight: 700; font-size: 14px; color: #18181b; }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
        }
        th {
            background: #f4f4f5;
            padding: 12px 16px;
            text-align: ${isRTL ? 'right' : 'left'};
            font-size: 12px;
            color: #52525b;
            text-transform: uppercase;
        }
        td {
            padding: 14px 16px;
            border-bottom: 1px solid #f4f4f5;
        }
        .totals-table {
            width: 320px;
            margin-${isRTL ? 'right' : 'left'}: auto;
            margin-bottom: 30px;
        }
        .totals-table tr td:last-child {
            text-align: ${isRTL ? 'left' : 'right'};
            font-weight: 700;
        }
        .grand-total {
            font-size: 18px;
            color: #d97706;
            border-top: 2px solid #18181b;
        }
        .footer {
            text-align: center;
            border-top: 1px solid #f4f4f5;
            padding-top: 20px;
            color: #a1a1aa;
            font-size: 11px;
        }
        @media print {
            body { padding: 0; background: none; }
            .invoice-card { border: none; box-shadow: none; padding: 0; max-width: 100%; }
        }
    </style>
</head>
<body>
    <div class="invoice-card">
        <div class="header">
            <div>
                <div class="brand">MR<span>.X</span> STEROID</div>
                <div style="font-size: 12px; color: #71717a; font-weight: 600;">Precision Metabolic Protocols & Physiology</div>
            </div>
            <div>
                <span class="badge badge-${invoice.status === 'success' ? 'success' : invoice.status === 'pending' ? 'pending' : 'failed'}">
                    ${invoice.status === 'success' ? (isRTL ? 'مدفوعة بنجاح' : 'PAID') : invoice.status.toUpperCase()}
                </span>
            </div>
        </div>

        <div class="meta-grid">
            <div class="meta-item">
                <strong>${isRTL ? 'رقم الفاتورة' : 'Invoice Number'}</strong>
                <span>#${invoice.id.toUpperCase()}</span>
            </div>
            <div class="meta-item">
                <strong>${isRTL ? 'التاريخ' : 'Issue Date'}</strong>
                <span>${dateStr}</span>
            </div>
            <div class="meta-item">
                <strong>${isRTL ? 'بوابة الدفع' : 'Payment Gateway'}</strong>
                <span>${invoice.gateway.toUpperCase()} ${invoice.gateway_reference_id ? `(${invoice.gateway_reference_id})` : ''}</span>
            </div>
            <div class="meta-item">
                <strong>${isRTL ? 'العميل' : 'Customer'}</strong>
                <span>${invoice.customer_name || invoice.customer_email || (isRTL ? 'عميل مسجل' : 'Valued Client')}</span>
            </div>
        </div>

        <table>
            <thead>
                <tr>
                    <th>${isRTL ? 'الوصف / الباقة' : 'Description / Item'}</th>
                    <th style="text-align: center;">${isRTL ? 'الكمية' : 'Qty'}</th>
                    <th style="text-align: ${isRTL ? 'left' : 'right'};">${isRTL ? 'السعر' : 'Amount'}</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>
                        <strong>${planName}</strong>
                        <div style="font-size: 12px; color: #71717a;">${isRTL ? 'الوصول الكامل للنظام، الأدوات الحسابية، والبروتوكول الهندسي' : 'Full system access, precision biocalc tools & 12-week blueprint'}</div>
                    </td>
                    <td style="text-align: center; font-weight: 700;">1</td>
                    <td style="text-align: ${isRTL ? 'left' : 'right'}; font-weight: 700;">${BillingService.formatPrice(subtotal, invoice.currency, isRTL)}</td>
                </tr>
            </tbody>
        </table>

        <table class="totals-table">
            <tr>
                <td>${isRTL ? 'المجموع الفرعي:' : 'Subtotal:'}</td>
                <td>${BillingService.formatPrice(subtotal, invoice.currency, isRTL)}</td>
            </tr>
            ${invoice.shipping_cost ? `
            <tr>
                <td>${isRTL ? 'الشحن والتوصيل:' : 'Shipping & Handling:'}</td>
                <td>${BillingService.formatPrice(invoice.shipping_cost, invoice.currency, isRTL)}</td>
            </tr>` : ''}
            ${invoice.discount_amount ? `
            <tr style="color: #16a34a;">
                <td>${isRTL ? 'الخصم / كوبون:' : 'Discount applied:'}</td>
                <td>-${BillingService.formatPrice(invoice.discount_amount, invoice.currency, isRTL)}</td>
            </tr>` : ''}
            <tr class="grand-total">
                <td>${isRTL ? 'الإجمالي الكلي:' : 'Total Amount:'}</td>
                <td>${formattedAmount}</td>
            </tr>
        </table>

        <div class="footer">
            <p>© ${new Date().getFullYear()} Mr. X Steroid. ${isRTL ? 'فاتورة إلكترونية معتمدة صادرة من النظام الآلي' : 'Certified digital invoice issued automatically by Mr. X Steroid System'}.</p>
            <p>Support: foryoutalk@hotmail.com | https://www.mrxsteroid.com</p>
        </div>
    </div>

    <script>
        window.onload = function() {
            setTimeout(function() {
                window.print();
            }, 300);
        };
    </script>
</body>
</html>
        `;

        printWindow.document.write(html);
        printWindow.document.close();
    }
}
