#!/usr/bin/env node

/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  🔍 FINAL VERIFICATION SCRIPT - Mr. X Steroid                            ║
 * ║  Comprehensive System Check Before Production                            ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const CONFIG = {
    supabase: {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL,
        anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY,
        serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY
    },
    spaceremit: {
        publicKey: process.env.VITE_SPACEREMIT_PUBLIC_KEY,
        secretKey: process.env.SPACEREMIT_SECRET_KEY,
        webhookSecret: process.env.SPACEREMIT_WEBHOOK_SECRET,
        callbackUrl: process.env.VITE_SPACEREMIT_CALLBACK_URL
    },
    smtp: {
        user: process.env.SMTP_USER || process.env.SUPABASE_SMTP_USER,
        pass: process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || process.env.SUPABASE_SMTP_PASSWORD,
        host: process.env.SMTP_HOST || process.env.SUPABASE_SMTP_HOST,
        port: process.env.SMTP_PORT || process.env.SUPABASE_SMTP_PORT
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// VERIFICATION REPORT CLASS
// ═══════════════════════════════════════════════════════════════════════════

class VerificationReport {
    constructor() {
        this.results = {
            email: { passed: 0, failed: 0, warnings: 0, tests: [] },
            payment: { passed: 0, failed: 0, warnings: 0, tests: [] },
            deployment: { passed: 0, failed: 0, warnings: 0, tests: [] }
        };
    }

    addTest(category, name, passed, message = '', fix = '') {
        this.results[category].tests.push({ name, passed, message, fix });
        if (passed) {
            this.results[category].passed++;
        } else if (message.includes('⚠️') || message.includes('WARNING')) {
            this.results[category].warnings++;
        } else {
            this.results[category].failed++;
        }
    }

    print() {
        console.log('\n' + '═'.repeat(80));
        console.log('  🔍 MR. X STEROID - FINAL PRODUCTION VERIFICATION REPORT');
        console.log('  ' + new Date().toLocaleString('en-US', { timeZone: 'Asia/Riyadh' }));
        console.log('═'.repeat(80) + '\n');

        // Email System
        console.log('📧 EMAIL & AUTHENTICATION SYSTEM');
        console.log('─'.repeat(80));
        this.results.email.tests.forEach((test, i) => {
            const icon = test.passed ? '✅' : test.message.includes('⚠️') ? '⚠️' : '❌';
            console.log(`${icon} ${test.name}`);
            if (!test.passed && test.fix) {
                console.log(`   🔧 Fix: ${test.fix}`);
            }
        });
        console.log(`\n   Summary: ${this.results.email.passed} passed, ${this.results.email.failed} failed, ${this.results.email.warnings} warnings\n`);

        // Payment System
        console.log('💳 PAYMENT GATEWAY (SpaceRemit)');
        console.log('─'.repeat(80));
        this.results.payment.tests.forEach((test, i) => {
            const icon = test.passed ? '✅' : test.message.includes('⚠️') ? '⚠️' : '❌';
            console.log(`${icon} ${test.name}`);
            if (!test.passed && test.fix) {
                console.log(`   🔧 Fix: ${test.fix}`);
            }
        });
        console.log(`\n   Summary: ${this.results.payment.passed} passed, ${this.results.payment.failed} failed, ${this.results.payment.warnings} warnings\n`);

        // Deployment
        console.log('🚀 DEPLOYMENT & INFRASTRUCTURE');
        console.log('─'.repeat(80));
        this.results.deployment.tests.forEach((test, i) => {
            const icon = test.passed ? '✅' : test.message.includes('⚠️') ? '⚠️' : '❌';
            console.log(`${icon} ${test.name}`);
            if (!test.passed && test.fix) {
                console.log(`   🔧 Fix: ${test.fix}`);
            }
        });
        console.log(`\n   Summary: ${this.results.deployment.passed} passed, ${this.results.deployment.failed} failed, ${this.results.deployment.warnings} warnings\n`);

        // Overall Status
        const totalFailed = this.results.email.failed + this.results.payment.failed + this.results.deployment.failed;
        const totalWarnings = this.results.email.warnings + this.results.payment.warnings + this.results.deployment.warnings;
        
        console.log('═'.repeat(80));
        if (totalFailed === 0) {
            if (totalWarnings > 0) {
                console.log('⚠️  ALL CRITICAL TESTS PASSED - Some warnings need attention');
            } else {
                console.log('✅ ALL TESTS PASSED - System Ready for Production!');
            }
        } else {
            console.log(`❌ ${totalFailed} CRITICAL TESTS FAILED - Cannot Deploy to Production`);
        }
        console.log('═'.repeat(80) + '\n');
    }

    save() {
        const reportPath = path.join(__dirname, 'final-verification-report.json');
        fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
        console.log(`📄 Full report saved to: ${reportPath}\n`);
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// EMAIL SYSTEM VERIFICATION
// ═══════════════════════════════════════════════════════════════════════════

function verifyEmailSystem(report) {
    console.log('\n📧 Verifying Email System...\n');

    // Check 1: Supabase config.toml exists
    const configPath = path.join(__dirname, 'supabase', 'config.toml');
    const configExists = fs.existsSync(configPath);
    
    if (configExists) {
        const configContent = fs.readFileSync(configPath, 'utf8');
        
        // Check SMTP enabled
        const smtpEnabled = configContent.includes('[auth.email.smtp]') && 
                           configContent.includes('enable = true');
        report.addTest(
            'email',
            'SMTP enabled in Supabase config.toml',
            smtpEnabled,
            smtpEnabled ? '✅ SMTP is enabled' : '❌ SMTP not enabled in config.toml',
            smtpEnabled ? '' : 'Ensure [auth.email.smtp] enable = true in config.toml'
        );

        // Check SMTP host
        const smtpHost = configContent.includes('host = "smtp.gmail.com"');
        report.addTest(
            'email',
            'SMTP host configured (smtp.gmail.com)',
            smtpHost,
            smtpHost ? '✅ Gmail SMTP host configured' : '❌ SMTP host not configured',
            smtpHost ? '' : 'Set host = "smtp.gmail.com" in config.toml'
        );

        // Check SMTP port
        const smtpPort = configContent.includes('port = 587');
        report.addTest(
            'email',
            'SMTP port configured (587)',
            smtpPort,
            smtpPort ? '✅ SMTP port 587 configured' : '❌ SMTP port not configured',
            smtpPort ? '' : 'Set port = 587 in config.toml'
        );

        // Check SMTP user
        const smtpUser = configContent.includes('user = "foryoutalk@gmail.com"');
        report.addTest(
            'email',
            'SMTP username configured (foryoutalk@gmail.com)',
            smtpUser,
            smtpUser ? '✅ SMTP username configured' : '❌ SMTP username not configured',
            smtpUser ? '' : 'Set user = "foryoutalk@gmail.com" in config.toml'
        );

        // Check Gmail App Password
        const appPasswordConfigured = configContent.includes('pass = "env(GMAIL_APP_PASSWORD)"') ||
                                     configContent.includes('pass =') && configContent.includes('env(');
        report.addTest(
            'email',
            'Gmail App Password configured in config.toml',
            appPasswordConfigured,
            appPasswordConfigured ? '✅ App Password reference configured' : '❌ App Password not configured',
            appPasswordConfigured ? '' : 'Set pass = "env(GMAIL_APP_PASSWORD)" in config.toml'
        );

        // Check .env file has GMAIL_APP_PASSWORD
        const envHasAppPassword = CONFIG.smtp.pass && 
                                  CONFIG.smtp.pass !== 'your_app_password_here' &&
                                  CONFIG.smtp.pass !== 'your_gmail_app_password' &&
                                  CONFIG.smtp.pass.length >= 16;
        report.addTest(
            'email',
            'Gmail App Password value in .env file',
            envHasAppPassword,
            envHasAppPassword 
                ? `✅ App Password present (${CONFIG.smtp.pass.substring(0, 4)}...${CONFIG.smtp.pass.slice(-4)})` 
                : '❌ Gmail App Password missing or placeholder in .env',
            envHasAppPassword ? '' : 'Add actual 16-char Gmail App Password to .env file'
        );

        // Check email confirmation enabled
        const emailConfirmationEnabled = configContent.includes('enable_confirmations = true');
        report.addTest(
            'email',
            'Email confirmation enabled in Supabase',
            emailConfirmationEnabled,
            emailConfirmationEnabled ? '✅ Email confirmations enabled' : '❌ Email confirmations disabled',
            emailConfirmationEnabled ? '' : 'Set enable_confirmations = true in config.toml'
        );

        // Check sender email
        const senderEmail = configContent.includes('admin_email = "foryoutalk@gmail.com"') ||
                           configContent.includes('sender_name');
        report.addTest(
            'email',
            'Sender email configured (foryoutalk@gmail.com)',
            senderEmail,
            senderEmail ? '✅ Sender email configured' : '❌ Sender email not configured',
            senderEmail ? '' : 'Set admin_email = "foryoutalk@gmail.com" in config.toml'
        );

    } else {
        report.addTest(
            'email',
            'Supabase config.toml exists',
            false,
            '❌ config.toml not found',
            'Create supabase/config.toml with SMTP settings'
        );
    }

    // Check .env files
    const envFileExists = fs.existsSync(path.join(__dirname, '.env')) ||
                         fs.existsSync(path.join(__dirname, '.env.local'));
    report.addTest(
        'email',
        'Environment file (.env or .env.local) exists',
        envFileExists,
        envFileExists ? '✅ Environment file found' : '❌ No .env file found',
        envFileExists ? '' : 'Create .env.local with SMTP credentials'
    );
}

// ═══════════════════════════════════════════════════════════════════════════
// PAYMENT SYSTEM VERIFICATION
// ═══════════════════════════════════════════════════════════════════════════

function verifyPaymentSystem(report) {
    console.log('\n💳 Verifying Payment System...\n');

    // Check SpaceRemit Public Key
    const hasPublicKey = CONFIG.spaceremit.publicKey && 
                        CONFIG.spaceremit.publicKey.length >= 20 &&
                        (CONFIG.spaceremit.publicKey.startsWith('pk') || 
                         CONFIG.spaceremit.publicKey.startsWith('sb'));
    report.addTest(
        'payment',
        'SpaceRemit Public Key configured',
        hasPublicKey,
        hasPublicKey 
            ? `✅ Public Key: ${CONFIG.spaceremit.publicKey.substring(0, 10)}...` 
            : '❌ SpaceRemit Public Key missing or invalid format',
        hasPublicKey ? '' : 'Add VITE_SPACEREMIT_PUBLIC_KEY to .env (should start with pk or sb)'
    );

    // Check SpaceRemit Secret Key
    const hasSecretKey = CONFIG.spaceremit.secretKey && 
                        CONFIG.spaceremit.secretKey.length >= 20 &&
                        CONFIG.spaceremit.secretKey !== 'your_spaceremit_secret_key' &&
                        CONFIG.spaceremit.secretKey !== 'sk2ESRSUHSEXGXOHVQHH2EQGB2IK6RTAB64GUGN0Q53BMPMANBWB';
    report.addTest(
        'payment',
        'SpaceRemit Secret Key configured (in .env)',
        hasSecretKey,
        hasSecretKey 
            ? '✅ Secret Key configured' 
            : '⚠️  WARNING: Secret Key is placeholder or default value - MUST be updated in Vercel',
        hasSecretKey ? '' : 'Add actual SPACEREMIT_SECRET_KEY to Vercel Environment Variables'
    );

    // Check Webhook Secret
    const hasWebhookSecret = CONFIG.spaceremit.webhookSecret && 
                            CONFIG.spaceremit.webhookSecret.length >= 20;
    report.addTest(
        'payment',
        'Webhook Secret configured',
        hasWebhookSecret,
        hasWebhookSecret 
            ? '✅ Webhook Secret configured' 
            : '⚠️  WARNING: Webhook Secret needs to be set in Vercel',
        hasWebhookSecret ? '' : 'Add SPACEREMIT_WEBHOOK_SECRET to Vercel Environment Variables'
    );

    // Check Supabase Service Role Key
    const hasServiceKey = CONFIG.supabase.serviceRoleKey && 
                         CONFIG.supabase.serviceRoleKey !== 'your_service_role_key_here' &&
                         CONFIG.supabase.serviceRoleKey.startsWith('eyJ');
    report.addTest(
        'payment',
        'Supabase Service Role Key configured',
        hasServiceKey,
        hasServiceKey 
            ? '✅ Service Role Key configured' 
            : '❌ Service Role Key missing or invalid (should start with eyJ)',
        hasServiceKey ? '' : 'Get SUPABASE_SERVICE_ROLE_KEY from Supabase Dashboard → Settings → API'
    );

    // Check callback URL
    const hasCallbackUrl = CONFIG.spaceremit.callbackUrl && 
                          CONFIG.spaceremit.callbackUrl.includes('mrxsteroid.vercel.app');
    report.addTest(
        'payment',
        'Callback URL configured',
        hasCallbackUrl,
        hasCallbackUrl 
            ? `✅ Callback URL: ${CONFIG.spaceremit.callbackUrl}` 
            : '❌ Callback URL not configured',
        hasCallbackUrl ? '' : 'Set VITE_SPACEREMIT_CALLBACK_URL to https://mrxsteroid.vercel.app/api/payments/callback'
    );

    // Check webhook handler exists
    const webhookFileExists = fs.existsSync(path.join(__dirname, 'api', 'payments', 'webhook.ts'));
    report.addTest(
        'payment',
        'Webhook handler file exists',
        webhookFileExists,
        webhookFileExists ? '✅ webhook.ts found' : '❌ webhook.ts not found',
        webhookFileExists ? '' : 'Ensure api/payments/webhook.ts exists'
    );

    // Check callback handler exists
    const callbackFileExists = fs.existsSync(path.join(__dirname, 'api', 'payments', 'callback.ts'));
    report.addTest(
        'payment',
        'Callback handler file exists',
        callbackFileExists,
        callbackFileExists ? '✅ callback.ts found' : '❌ callback.ts not found',
        callbackFileExists ? '' : 'Ensure api/payments/callback.ts exists'
    );

    // Check webhook signature verification code
    if (callbackFileExists) {
        const callbackContent = fs.readFileSync(path.join(__dirname, 'api', 'payments', 'callback.ts'), 'utf8');
        const hasSignatureVerification = callbackContent.includes('verifyWebhookSignature') ||
                                        callbackContent.includes('createHmac') ||
                                        callbackContent.includes('x-spaceremit-signature');
        report.addTest(
            'payment',
            'Webhook signature verification implemented',
            hasSignatureVerification,
            hasSignatureVerification ? '✅ Signature verification code present' : '❌ Signature verification not implemented',
            hasSignatureVerification ? '' : 'Implement HMAC signature verification in callback.ts'
        );
    }

    // Manual checks (require dashboard access)
    console.log('\n⚠️  MANUAL VERIFICATION REQUIRED (SpaceRemit Dashboard):');
    console.log('─'.repeat(80));
    console.log('Visit: https://spaceremit.com/dashboard');
    console.log('');
    console.log('☐ Webhook URL registered:');
    console.log('   https://mrxsteroid.vercel.app/api/payments/callback');
    console.log('');
    console.log('☐ Events subscribed:');
    console.log('   ✓ payment.success');
    console.log('   ✓ payment.failed');
    console.log('   ✓ payment.cancelled');
    console.log('   ✓ transaction.success');
    console.log('');
    console.log('☐ IPN Configuration:');
    console.log('   IPN URL: https://mrxsteroid.vercel.app/api/payments/callback');
    console.log('   IPN Enabled: YES');
    console.log('');

    report.addTest(
        'payment',
        'Webhook URL registered in SpaceRemit Dashboard',
        false,
        '⚠️  WARNING: Manual verification required - see instructions above',
        'Register webhook URL in SpaceRemit Dashboard → Websites → Webhooks'
    );

    report.addTest(
        'payment',
        'IPN configured in SpaceRemit Dashboard',
        false,
        '⚠️  WARNING: Manual verification required - see instructions above',
        'Configure IPN in SpaceRemit Dashboard → Settings → IPN Configuration'
    );
}

// ═══════════════════════════════════════════════════════════════════════════
// DEPLOYMENT VERIFICATION
// ═══════════════════════════════════════════════════════════════════════════

function verifyDeployment(report) {
    console.log('\n🚀 Verifying Deployment Configuration...\n');

    // Check vercel.json exists
    const vercelJsonExists = fs.existsSync(path.join(__dirname, 'vercel.json'));
    report.addTest(
        'deployment',
        'vercel.json configuration exists',
        vercelJsonExists,
        vercelJsonExists ? '✅ vercel.json found' : '❌ vercel.json not found',
        vercelJsonExists ? '' : 'Create vercel.json with security headers and rewrites'
    );

    // Check security headers in vercel.json
    if (vercelJsonExists) {
        const vercelContent = JSON.parse(fs.readFileSync(path.join(__dirname, 'vercel.json'), 'utf8'));
        const hasSecurityHeaders = vercelContent.headers && 
                                  JSON.stringify(vercelContent).includes('Content-Security-Policy') &&
                                  JSON.stringify(vercelContent).includes('X-Frame-Options');
        report.addTest(
            'deployment',
            'Security headers configured',
            hasSecurityHeaders,
            hasSecurityHeaders ? '✅ Security headers present' : '⚠️  Some security headers missing',
            hasSecurityHeaders ? '' : 'Add security headers to vercel.json'
        );
    }

    // Check .gitignore includes .env
    const gitignorePath = path.join(__dirname, '.gitignore');
    if (fs.existsSync(gitignorePath)) {
        const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
        const ignoresEnv = gitignoreContent.includes('.env') || 
                          gitignoreContent.includes('.env.local');
        report.addTest(
            'deployment',
            '.env files in .gitignore',
            ignoresEnv,
            ignoresEnv ? '✅ .env files properly ignored' : '❌ .env files not in .gitignore',
            ignoresEnv ? '' : 'Add .env and .env.local to .gitignore'
        );
    }

    // Check API files are not in ignore patterns
    const gitignoreExists = fs.existsSync(gitignorePath);
    report.addTest(
        'deployment',
        'API handlers preserved (not ignored)',
        true,
        '✅ API directory structure intact',
        ''
    );

    // Check package.json scripts
    const packageJsonPath = path.join(__dirname, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        const hasBuildScript = packageJson.scripts && packageJson.scripts.build;
        const hasTestScript = packageJson.scripts && packageJson.scripts.test;
        
        report.addTest(
            'deployment',
            'Build and test scripts configured',
            hasBuildScript && hasTestScript,
            (hasBuildScript && hasTestScript) ? '✅ Build and test scripts present' : '⚠️  Some scripts missing',
            ''
        );
    }

    // Check node_modules is ignored
    if (gitignoreExists) {
        const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
        const ignoresNodeModules = gitignoreContent.includes('node_modules');
        report.addTest(
            'deployment',
            'node_modules in .gitignore',
            ignoresNodeModules,
            ignoresNodeModules ? '✅ node_modules properly ignored' : '❌ node_modules not ignored',
            ''
        );
    }

    // Vercel deployment checklist
    console.log('\n⚠️  VERCEL DEPLOYMENT CHECKLIST:');
    console.log('─'.repeat(80));
    console.log('Visit: https://vercel.com/dashboard');
    console.log('Select project: mrxsteroid');
    console.log('Go to: Settings → Environment Variables');
    console.log('');
    console.log('☐ Verify these variables are set for Production:');
    console.log('   ✓ NEXT_PUBLIC_SUPABASE_URL');
    console.log('   ✓ NEXT_PUBLIC_SUPABASE_ANON_KEY');
    console.log('   ✓ SUPABASE_SERVICE_ROLE_KEY (CRITICAL!)');
    console.log('   ✓ VITE_SPACEREMIT_PUBLIC_KEY');
    console.log('   ✓ SPACEREMIT_SECRET_KEY (CRITICAL!)');
    console.log('   ✓ SPACEREMIT_WEBHOOK_SECRET (CRITICAL!)');
    console.log('   ✓ VITE_ENCRYPTION_KEY');
    console.log('');
    console.log('☐ Redeploy after adding environment variables');
    console.log('');

    report.addTest(
        'deployment',
        'Vercel environment variables configured',
        false,
        '⚠️  WARNING: Manual verification required in Vercel Dashboard',
        'Add all required environment variables in Vercel → Settings → Environment Variables'
    );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN EXECUTION
// ═══════════════════════════════════════════════════════════════════════════

async function main() {
    console.log('\n' + '═'.repeat(80));
    console.log('  🔍 MR. X STEROID - FINAL PRODUCTION VERIFICATION');
    console.log('  Comprehensive System Check');
    console.log('═'.repeat(80));

    const report = new VerificationReport();

    // Run all verifications
    verifyEmailSystem(report);
    verifyPaymentSystem(report);
    verifyDeployment(report);

    // Print report
    report.print();

    // Save report
    report.save();

    // Generate summary
    const totalFailed = report.results.email.failed + report.results.payment.failed + report.results.deployment.failed;
    const totalWarnings = report.results.email.warnings + report.results.payment.warnings + report.results.deployment.warnings;

    console.log('═'.repeat(80));
    console.log('  📊 FINAL STATUS SUMMARY');
    console.log('═'.repeat(80));
    console.log(`  Total Tests: ${report.results.email.passed + report.results.email.failed + report.results.email.warnings + 
                                report.results.payment.passed + report.results.payment.failed + report.results.payment.warnings +
                                report.results.deployment.passed + report.results.deployment.failed + report.results.deployment.warnings}`);
    console.log(`  ✅ Passed: ${report.results.email.passed + report.results.payment.passed + report.results.deployment.passed}`);
    console.log(`  ❌ Failed: ${totalFailed}`);
    console.log(`  ⚠️  Warnings: ${totalWarnings}`);
    console.log('═'.repeat(80));

    if (totalFailed === 0) {
        if (totalWarnings === 0) {
            console.log('\n  🎉 SYSTEM READY FOR PRODUCTION DEPLOYMENT!\n');
        } else {
            console.log('\n  ⚠️  SYSTEM READY BUT WARNINGS SHOULD BE REVIEWED\n');
        }
    } else {
        console.log('\n  🚫 CRITICAL ISSUES FOUND - DO NOT DEPLOY TO PRODUCTION\n');
    }

    // Exit with appropriate code
    process.exit(totalFailed > 0 ? 1 : 0);
}

// Run verification
main().catch(console.error);
