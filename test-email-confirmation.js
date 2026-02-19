/**
 * Email Confirmation Test Script
 * Tests the Supabase email confirmation flow
 * 
 * Usage: node test-email-confirmation.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials in .env file');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const testEmail = `test+${Date.now()}@example.com`;
const testPassword = 'Test123!@#';
const testFullName = 'Test User';
const testUsername = 'testuser';

async function testEmailConfirmation() {
    console.log('════════════════════════════════════════════════════════');
    console.log('       Email Confirmation Flow Test');
    console.log('════════════════════════════════════════════════════════\n');

    console.log('📋 Test Configuration:');
    console.log(`   Supabase URL: ${supabaseUrl}`);
    console.log(`   Test Email: ${testEmail}`);
    console.log(`   Redirect URL: ${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173'}/auth/callback`);
    console.log('');

    try {
        // Step 1: Sign up
        console.log('📝 Step 1: Signing up...');
        const { data: signupData, error: signupError } = await supabase.auth.signUp({
            email: testEmail,
            password: testPassword,
            options: {
                data: {
                    full_name: testFullName,
                    user_name: testUsername,
                    currency: 'USD',
                    role: 'user'
                },
                emailRedirectTo: `${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173'}/auth/callback`,
            },
        });

        if (signupError) {
            console.error('❌ Signup error:', signupError);
            return false;
        }

        console.log('✅ Signup successful!');
        console.log(`   User ID: ${signupData.user?.id}`);
        console.log(`   Email: ${signupData.user?.email}`);
        console.log(`   Email Confirmed: ${!!signupData.user?.email_confirmed_at}`);
        console.log('');

        // Step 2: Check if email confirmation is required
        console.log('📬 Step 2: Checking email confirmation status...');
        if (!signupData.user?.email_confirmed_at) {
            console.log('⚠️  Email confirmation is required');
            console.log('📧 Check your email inbox for the confirmation link');
            console.log('📧 The confirmation URL should redirect to: /auth/callback');
        } else {
            console.log('✅ Email is already confirmed (auto-confirm enabled)');
        }
        console.log('');

        // Step 3: Try to login (should fail if email not confirmed)
        console.log('🔐 Step 3: Testing login (before confirmation)...');
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
            email: testEmail,
            password: testPassword,
        });

        if (loginError) {
            console.log('⚠️  Login failed (expected if email not confirmed)');
            console.log(`   Error: ${loginError.message}`);
        } else {
            console.log('✅ Login successful');
            console.log(`   Session: ${!!loginData.session}`);
        }
        console.log('');

        // Step 4: Test resend confirmation
        console.log('📤 Step 4: Testing resend confirmation...');
        const { error: resendError } = await supabase.auth.resend({
            type: 'signup',
            email: testEmail,
        });

        if (resendError) {
            console.error('❌ Resend error:', resendError);
        } else {
            console.log('✅ Confirmation email resent successfully');
        }
        console.log('');

        // Step 5: Check Supabase email settings
        console.log('🔍 Step 5: Email Configuration Check');
        console.log('   Please verify in Supabase Dashboard:');
        console.log('   1. Go to: Authentication → Providers → Email');
        console.log('   2. Check if "Confirm email" is enabled/disabled');
        console.log('   3. Go to: Authentication → Email Templates');
        console.log('   4. Verify "Confirm signup" template is configured');
        console.log('   5. Check SMTP settings in Project Settings → Auth');
        console.log('');

        console.log('════════════════════════════════════════════════════════');
        console.log('       Test Complete!');
        console.log('════════════════════════════════════════════════════════');
        console.log('');
        console.log('📋 Next Steps:');
        console.log('   1. Check the email inbox for: ' + testEmail);
        console.log('   2. Click the confirmation link in the email');
        console.log('   3. You should be redirected to: /auth/callback');
        console.log('   4. After confirmation, try logging in again');
        console.log('');

        return true;

    } catch (error) {
        console.error('❌ Test failed with error:', error);
        return false;
    }
}

// Run the test
testEmailConfirmation()
    .then(success => {
        if (success) {
            console.log('✅ Test completed successfully');
        } else {
            console.log('❌ Test failed');
            process.exit(1);
        }
    })
    .catch(err => {
        console.error('❌ Unexpected error:', err);
        process.exit(1);
    });
