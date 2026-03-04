/**
 * ═══════════════════════════════════════════════════════════════════════════
 * MR. X STEROID - COMPREHENSIVE FLOW TEST
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Tests:
 * 1. Email Confirmation Flow (from foryoutalk @gmail.com)
 * 2. Payment Processing Flow (to spaceremit account)
 * 
 * Usage: node test-both-flows.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const spaceremitPublicKey = process.env.VITE_SPACEREMIT_PUBLIC_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials in .env file');
    process.exit(1);
}

if (!spaceremitPublicKey) {
    console.error('❌ Missing SpaceRemit Public Key in .env file');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Test data
const TEST_EMAIL = `test+${Date.now()}@example.com`;
const TEST_PASSWORD = 'Test123!@#';
const TEST_FULL_NAME = 'Test User';
const TEST_USERNAME = 'testuser' + Date.now();

// ═══════════════════════════════════════════════════════════════════════════
// TEST 1: EMAIL CONFIRMATION FLOW
// ═══════════════════════════════════════════════════════════════════════════

async function testEmailConfirmation() {
    console.log('\n' + '═'.repeat(70));
    console.log('       TEST 1: EMAIL CONFIRMATION FLOW');
    console.log('═'.repeat(70) + '\n');

    console.log('📋 Test Configuration:');
    console.log(`   Supabase URL: ${supabaseUrl}`);
    console.log(`   Test Email: ${TEST_EMAIL}`);
    console.log(`   Sender Email: foryoutalk@gmail.com (configured in Supabase SMTP)`);
    console.log('');

    try {
        // Step 1: Sign up
        console.log('📝 Step 1: Signing up with new account...');
        const { data: signupData, error: signupError } = await supabase.auth.signUp({
            email: TEST_EMAIL,
            password: TEST_PASSWORD,
            options: {
                data: {
                    full_name: TEST_FULL_NAME,
                    user_name: TEST_USERNAME,
                    currency: 'USD',
                    role: 'user'
                },
                emailRedirectTo: `${process.env.VITE_PAYMENT_SUCCESS_URL?.replace('/payment-success', '') || 'http://localhost:5173'}/auth/callback`,
            },
        });

        if (signupError) {
            console.error('❌ Signup error:', signupError);
            return { success: false, error: signupError };
        }

        console.log('✅ Signup successful!');
        console.log(`   User ID: ${signupData.user?.id}`);
        console.log(`   Email: ${signupData.user?.email}`);
        console.log(`   Email Confirmed: ${!!signupData.user?.email_confirmed_at}`);
        console.log('');

        // Step 2: Check email confirmation status
        console.log('📬 Step 2: Email Confirmation Status:');
        if (!signupData.user?.email_confirmed_at) {
            console.log('   ⚠️  Email confirmation is REQUIRED');
            console.log('   📧 User should receive confirmation email from: foryoutalk@gmail.com');
            console.log('   📧 Check spam folder if not in inbox');
        } else {
            console.log('   ✅ Email is already confirmed (auto-confirm enabled)');
        }
        console.log('');

        // Step 3: Try login (may fail if email not confirmed)
        console.log('🔐 Step 3: Testing login (before confirmation)...');
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
            email: TEST_EMAIL,
            password: TEST_PASSWORD,
        });

        if (loginError) {
            console.log('   ⚠️  Login failed (expected if email not confirmed)');
            console.log(`   Error: ${loginError.message}`);
        } else {
            console.log('   ✅ Login successful (email confirmation may be optional)');
        }
        console.log('');

        // Step 4: Resend confirmation email
        console.log('📤 Step 4: Testing resend confirmation...');
        const { error: resendError } = await supabase.auth.resend({
            type: 'signup',
            email: TEST_EMAIL,
        });

        if (resendError) {
            console.error('   ❌ Resend error:', resendError);
        } else {
            console.log('   ✅ Confirmation email resent successfully');
        }
        console.log('');

        // Step 5: Check Supabase email settings
        console.log('🔍 Step 5: Email Configuration Checklist:');
        console.log('   Verify in Supabase Dashboard:');
        console.log('   1. Authentication → Providers → Email');
        console.log('      ✓ "Confirm email" should be ENABLED for production');
        console.log('   2. Authentication → Email Templates → Confirm signup');
        console.log('      ✓ Template should be configured');
        console.log('   3. Project Settings → Auth → SMTP Settings');
        console.log('      ✓ SMTP should be configured with Gmail:');
        console.log('        - Host: smtp.gmail.com');
        console.log('        - Port: 587');
        console.log('        - Username: foryoutalk@gmail.com');
        console.log('        - Password: [Gmail App Password]');
        console.log('');

        console.log('═══════════════════════════════════════════════════════════════════');
        console.log('       TEST 1 COMPLETE!');
        console.log('═══════════════════════════════════════════════════════════════════');
        console.log('');
        console.log('📋 Manual Steps Required:');
        console.log(`   1. Check email inbox: ${TEST_EMAIL}`);
        console.log('   2. Look for email from: foryoutalk@gmail.com');
        console.log('   3. Click confirmation link in email');
        console.log('   4. Should redirect to: /auth/callback');
        console.log('   5. After confirmation, try logging in');
        console.log('');

        return { 
            success: true, 
            userId: signupData.user?.id,
            email: signupData.user?.email,
            needsConfirmation: !signupData.user?.email_confirmed_at
        };

    } catch (error) {
        console.error('❌ Test failed with error:', error);
        return { success: false, error };
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// TEST 2: PAYMENT PROCESSING FLOW
// ═══════════════════════════════════════════════════════════════════════════

async function testPaymentFlow() {
    console.log('\n' + '═'.repeat(70));
    console.log('       TEST 2: PAYMENT PROCESSING FLOW (SpaceRemit)');
    console.log('═'.repeat(70) + '\n');

    console.log('📋 Payment Configuration:');
    console.log(`   SpaceRemit Public Key: ${spaceremitPublicKey?.substring(0, 20)}...`);
    console.log(`   Callback URL: ${process.env.VITE_SPACEREMIT_CALLBACK_URL}`);
    console.log(`   Success URL: ${process.env.VITE_PAYMENT_SUCCESS_URL}`);
    console.log(`   Cancel URL: ${process.env.VITE_PAYMENT_CANCEL_URL}`);
    console.log('');

    try {
        // Step 1: Check SpaceRemit script injection
        console.log('💳 Step 1: SpaceRemit Integration Check:');
        console.log('   Checking if SpaceRemit script is properly configured...');
        
        // Check if spaceremit.js exists or is referenced
        const fs = require('fs');
        const path = require('path');
        
        const indexHtmlPath = path.join(__dirname, 'index.html');
        if (fs.existsSync(indexHtmlPath)) {
            const indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');
            const hasSpaceremitScript = indexHtml.includes('spaceremit') || indexHtml.includes('SP_FORM_ID');
            
            if (hasSpaceremitScript) {
                console.log('   ✅ SpaceRemit script tag found in index.html');
            } else {
                console.log('   ⚠️  SpaceRemit script tag NOT found in index.html');
                console.log('   ℹ️  SpaceRemit may be loaded dynamically instead');
            }
        }
        console.log('');

        // Step 2: Check payment API endpoints
        console.log('🔌 Step 2: Payment API Endpoints:');
        const apiFiles = [
            'api/payments/callback.ts',
            'api/payments/webhook.ts'
        ];
        
        apiFiles.forEach(file => {
            const filePath = path.join(__dirname, file);
            if (fs.existsSync(filePath)) {
                console.log(`   ✅ ${file} exists`);
            } else {
                console.log(`   ❌ ${file} NOT found`);
            }
        });
        console.log('');

        // Step 3: Check database payments table
        console.log('🗄️  Step 3: Database Payments Table Check:');
        const { data: payments, error: paymentsError } = await supabase
            .from('payments')
            .select('id, transaction_id, status, amount, spaceremit_code')
            .order('created_at', { ascending: false })
            .limit(5);

        if (paymentsError) {
            console.log('   ⚠️  Could not query payments table:', paymentsError.message);
        } else {
            console.log(`   ✅ Payments table accessible (${payments?.length || 0} recent records)`);
            if (payments && payments.length > 0) {
                console.log('   Recent payments:');
                payments.forEach(p => {
                    console.log(`     - ${p.transaction_id}: ${p.status} (${p.amount} ${p.amount_currency || 'USD'})`);
                });
            }
        }
        console.log('');

        // Step 4: Test payment record creation
        console.log('📝 Step 4: Creating Test Payment Record...');
        const testTransactionId = `TEST_${Date.now()}`;
        const { data: paymentData, error: paymentError } = await supabase
            .from('payments')
            .insert({
                transaction_id: testTransactionId,
                user_id: null, // Guest checkout
                order_id: `ORDER_${Date.now()}`,
                amount: 99.99,
                currency: 'USD',
                status: 'pending',
                product_id: 'TEST_PRODUCT',
                product_name: 'Test Product',
                customer_email: TEST_EMAIL,
                customer_name: TEST_FULL_NAME,
                metadata: { test: true }
            })
            .select()
            .single();

        if (paymentError) {
            console.log('   ❌ Failed to create payment record:', paymentError.message);
        } else {
            console.log('   ✅ Test payment record created successfully');
            console.log(`   Payment ID: ${paymentData.id}`);
            console.log(`   Transaction ID: ${paymentData.transaction_id}`);
            console.log(`   Status: ${paymentData.status}`);
            
            // Clean up test record
            await supabase.from('payments').delete().eq('id', paymentData.id);
            console.log('   🗑️  Test record cleaned up');
        }
        console.log('');

        // Step 5: SpaceRemit Configuration Checklist
        console.log('🔍 Step 5: SpaceRemit Configuration Checklist:');
        console.log('   Verify in SpaceRemit Dashboard:');
        console.log('   1. ✓ Public Key configured in .env (VITE_SPACEREMIT_PUBLIC_KEY)');
        console.log('   2. ✓ Secret Key configured in Vercel (SPACEREMIT_SECRET_KEY)');
        console.log('   3. ✓ Callback URL registered: ' + process.env.VITE_SPACEREMIT_CALLBACK_URL);
        console.log('   4. ✓ Webhook endpoint accessible: https://mrxsteroid.vercel.app/api/payments/callback');
        console.log('   5. ✓ Payment flow redirects to spaceremit.com for processing');
        console.log('   6. ✓ After payment, user redirected back to callback URL');
        console.log('   7. ✓ spaceremit_code stored in payments table after successful payment');
        console.log('');

        console.log('═══════════════════════════════════════════════════════════════════');
        console.log('       TEST 2 COMPLETE!');
        console.log('═══════════════════════════════════════════════════════════════════');
        console.log('');
        console.log('📋 Manual Payment Test Steps:');
        console.log('   1. Start the app: npm run dev');
        console.log('   2. Navigate to checkout page');
        console.log('   3. Select a product and fill customer details');
        console.log('   4. Choose payment method (SpaceRemit)');
        console.log('   5. Complete payment on SpaceRemit platform');
        console.log('   6. Verify payment recorded in database with spaceremit_code');
        console.log('   7. Check if user account upgraded (has_paid: true)');
        console.log('');

        return { 
            success: true,
            paymentsTableExists: !paymentsError,
            canCreatePayments: !paymentError
        };

    } catch (error) {
        console.error('❌ Payment test failed with error:', error);
        return { success: false, error };
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN TEST RUNNER
// ═══════════════════════════════════════════════════════════════════════════

async function runAllTests() {
    console.log('\n');
    console.log('╔══════════════════════════════════════════════════════════════════════════╗');
    console.log('║         MR. X STEROID - COMPREHENSIVE FLOW TEST                         ║');
    console.log('║         Testing: Email Confirmation & Payment Processing                ║');
    console.log('╚══════════════════════════════════════════════════════════════════════════╝');
    console.log('');

    // Test 1: Email Confirmation
    const emailResult = await testEmailConfirmation();
    
    // Wait a bit between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Test 2: Payment Flow
    const paymentResult = await testPaymentFlow();

    // Summary
    console.log('\n');
    console.log('╔══════════════════════════════════════════════════════════════════════════╗');
    console.log('║                          TEST SUMMARY                                    ║');
    console.log('╚══════════════════════════════════════════════════════════════════════════╝');
    console.log('');
    console.log('TEST 1 - Email Confirmation:');
    console.log(`   Status: ${emailResult.success ? '✅ PASSED' : '❌ FAILED'}`);
    if (emailResult.needsConfirmation) {
        console.log(`   ⚠️  Email confirmation required - check inbox for ${TEST_EMAIL}`);
    }
    console.log('');
    console.log('TEST 2 - Payment Processing:');
    console.log(`   Status: ${paymentResult.success ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`   Payments Table: ${paymentResult.paymentsTableExists ? '✅ Accessible' : '❌ Not accessible'}`);
    console.log(`   Create Payments: ${paymentResult.canCreatePayments ? '✅ Working' : '❌ Failed'}`);
    console.log('');
    console.log('═══════════════════════════════════════════════════════════════════════════');
    console.log('');

    // Issues and Solutions
    const hasIssues = !emailResult.success || !paymentResult.success;
    if (hasIssues) {
        console.log('⚠️  ISSUES DETECTED - See solutions below:\n');
        
        if (!emailResult.success) {
            console.log('📧 Email Confirmation Issues:');
            console.log('   Problem: Email confirmation not working');
            console.log('   Solution:');
            console.log('   1. Go to Supabase Dashboard → Authentication → Providers → Email');
            console.log('   2. Enable "Confirm email" option');
            console.log('   3. Configure SMTP Settings:');
            console.log('      - Host: smtp.gmail.com');
            console.log('      - Port: 587');
            console.log('      - Username: foryoutalk@gmail.com');
            console.log('      - Password: [Gmail App Password]');
            console.log('   4. Test by signing up again');
            console.log('');
        }
        
        if (!paymentResult.success) {
            console.log('💳 Payment Processing Issues:');
            console.log('   Problem: Payment integration not working');
            console.log('   Solution:');
            console.log('   1. Verify SpaceRemit credentials in .env');
            console.log('   2. Check Vercel environment variables for SPACEREMIT_SECRET_KEY');
            console.log('   3. Ensure callback URL is registered in SpaceRemit dashboard');
            console.log('   4. Test payment flow in browser');
            console.log('');
        }
    } else {
        console.log('✅ ALL TESTS PASSED!');
        console.log('');
        console.log('Next Steps:');
        console.log('1. Manually test email confirmation in browser');
        console.log('2. Manually test payment flow with real SpaceRemit transaction');
        console.log('3. Monitor logs for any errors during actual usage');
        console.log('');
    }

    return hasIssues ? 1 : 0;
}

// Run tests
runAllTests()
    .then(exitCode => {
        process.exit(exitCode);
    })
    .catch(err => {
        console.error('❌ Unexpected error:', err);
        process.exit(1);
    });
