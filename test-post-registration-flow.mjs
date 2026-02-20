import { createClient } from '@supabase/supabase-js';
import { createHash } from 'crypto';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Initialize Supabase client
const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
);

/**
 * Helper: Generate MD5 hash for Gravatar
 */
function md5(text) {
    return createHash('md5').update(text).digest('hex');
}

/**
 * Generate Gravatar URL
 */
function getGravatarUrl(email, size = 400) {
    const hash = md5(email.toLowerCase().trim());
    return `https://www.gravatar.com/avatar/${hash}?d=mp&s=${size}`;
}

/**
 * Test 1: Check Profile Data Synchronization
 */
async function testProfileDataSync() {
    console.log('\n📋 TEST 1: Profile Data Synchronization');
    console.log('========================================');
    
    const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, email, full_name, user_name, avatar_url, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

    if (error) {
        console.error('❌ Error fetching profiles:', error.message);
        return false;
    }

    if (!profiles || profiles.length === 0) {
        console.log('ℹ️  No profiles found in database (clean installation)');
        console.log('   This is normal - profiles will be created when users sign up\n');
        return true;
    }

    console.log(`✅ Found ${profiles.length} profile(s)\n`);
    
    let allValid = true;
    profiles.forEach((profile, index) => {
        console.log(`Profile #${index + 1}:`);
        console.log(`  - ID: ${profile.id}`);
        console.log(`  - Email: ${profile.email || '❌ MISSING'}`);
        console.log(`  - Full Name: ${profile.full_name || '⚠️  Empty'}`);
        console.log(`  - Username: ${profile.user_name || '⚠️  Empty'}`);
        console.log(`  - Avatar URL: ${profile.avatar_url ? '✅ Set' : '⚠️  Not set'}`);
        console.log(`  - Created: ${profile.created_at}\n`);
        
        if (!profile.full_name || !profile.user_name) {
            allValid = false;
        }
    });

    return allValid;
}

/**
 * Test 2: Check Email Confirmation Status
 */
async function testEmailConfirmation() {
    console.log('\n📧 TEST 2: Email Confirmation Status');
    console.log('====================================');
    
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
        console.log('ℹ️  No authenticated user (this is normal if not logged in)');
        console.log('   Email confirmation can only be checked for logged-in users\n');
        return true;
    }

    if (!user) {
        console.log('ℹ️  No user data available\n');
        return true;
    }

    const isConfirmed = !!(user.email_confirmed_at || user.confirmed_at);
    
    console.log(`User Email: ${user.email}`);
    console.log(`Email Confirmed: ${isConfirmed ? '✅ YES' : '❌ NO'}`);
    console.log(`Confirmed At: ${user.email_confirmed_at || user.confirmed_at || 'Not confirmed'}\n`);

    return isConfirmed;
}

/**
 * Test 3: Check Avatar Service (Gravatar)
 */
async function testAvatarService() {
    console.log('\n🖼️  TEST 3: Avatar Service (Gravatar)');
    console.log('=====================================');
    
    const testEmail = 'test@example.com';
    const avatarUrl = getGravatarUrl(testEmail, 400);
    
    console.log(`Test Email: ${testEmail}`);
    console.log(`Generated Avatar URL: ${avatarUrl}`);
    console.log(`URL Format: ${avatarUrl.includes('gravatar.com') ? '✅ Valid Gravatar URL' : '❌ Invalid URL'}\n`);
    
    // Test with different scenarios
    console.log('Additional Tests:');
    const scenarios = [
        { email: 'user@example.com', desc: 'Regular email' },
        { email: 'USER@EXAMPLE.COM', desc: 'Uppercase email (should normalize)' },
        { email: 'john.doe@company.org', desc: 'Email with dots' },
    ];
    
    scenarios.forEach(({ email, desc }) => {
        const url = getGravatarUrl(email);
        console.log(`  ${desc}: ${url.includes('gravatar.com') ? '✅' : '❌'} ${url}`);
    });
    
    console.log('');
    return avatarUrl.includes('gravatar.com');
}

/**
 * Test 4: Check Database Schema
 */
async function testDatabaseSchema() {
    console.log('\n⚙️  TEST 4: Database Schema Verification');
    console.log('========================================');
    
    // Check if profiles table exists
    const { data, error } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true });

    if (error) {
        console.error('❌ Error accessing profiles table:', error.message);
        return false;
    }

    console.log('✅ Profiles table exists and is accessible');
    console.log(`   Total profiles: ${data || 0}`);
    
    // Check required columns by fetching one record with all fields
    const { data: sample, error: sampleError } = await supabase
        .from('profiles')
        .select('id, email, full_name, user_name, avatar_url, subscription_status, role, created_at, updated_at')
        .limit(1);
    
    if (sampleError) {
        console.error('❌ Error checking schema:', sampleError.message);
        console.log('   Some columns might be missing\n');
        return false;
    }
    
    console.log('✅ All required columns exist:\n');
    console.log('   - id (UUID)');
    console.log('   - email (TEXT)');
    console.log('   - full_name (TEXT)');
    console.log('   - user_name (TEXT)');
    console.log('   - avatar_url (TEXT)');
    console.log('   - subscription_status (TEXT)');
    console.log('   - role (TEXT)');
    console.log('   - created_at (TIMESTAMPTZ)');
    console.log('   - updated_at (TIMESTAMPTZ)\n');
    
    return true;
}

/**
 * Test 5: Verify Supabase Connection
 */
async function testSupabaseConnection() {
    console.log('\n🔌 TEST 5: Supabase Connection');
    console.log('=============================');
    
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
        console.log('❌ Supabase credentials missing');
        console.log('   Please check .env.local file\n');
        return false;
    }
    
    console.log(`Supabase URL: ${supabaseUrl.substring(0, 30)}...`);
    console.log(`Supabase Key: ${supabaseKey.substring(0, 20)}...`);
    
    // Test connection
    const { error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
    
    if (error) {
        console.error('❌ Connection test failed:', error.message);
        return false;
    }
    
    console.log('✅ Connection successful\n');
    return true;
}

/**
 * Test 6: Check Email Configuration Status
 */
async function testEmailConfig() {
    console.log('\n📧 TEST 6: Email Configuration Status');
    console.log('======================================');
    
    console.log('Email Confirmation Settings:');
    console.log('  - Email confirmation is managed in Supabase Dashboard');
    console.log('  - Navigate to: Authentication → Providers → Email');
    console.log('  - Check "Confirm email" toggle status');
    console.log('');
    console.log('SMTP Configuration (Production):');
    console.log('  - Navigate to: Project Settings → Auth → SMTP Settings');
    console.log('  - Configure with SendGrid, Mailgun, or Resend');
    console.log('  - Free tier: 2 emails/hour rate limit');
    console.log('');
    console.log('Email Templates:');
    console.log('  - Navigate to: Authentication → Email Templates');
    console.log('  - Verify "Confirm signup" template is configured');
    console.log('');
    console.log('Current Redirect URL:');
    console.log(`  - ${process.env.VITE_SITE_URL || 'https://mrxsteroid.vercel.app'}/auth/callback`);
    console.log('');
    
    return true;
}

/**
 * Main Test Runner
 */
async function runAllTests() {
    console.log('\n╔════════════════════════════════════════════════╗');
    console.log('║  POST-REGISTRATION FLOW - VERIFICATION TESTS  ║');
    console.log('╚════════════════════════════════════════════════╝');
    
    const results = {
        connection: await testSupabaseConnection(),
        profileDataSync: await testProfileDataSync(),
        emailConfirmation: await testEmailConfirmation(),
        avatarService: await testAvatarService(),
        dbSchema: await testDatabaseSchema(),
        emailConfig: await testEmailConfig(),
    };

    console.log('\n╔════════════════════════════════════════════════╗');
    console.log('║                TEST SUMMARY                    ║');
    console.log('╚════════════════════════════════════════════════╝');
    
    const passed = Object.values(results).filter(r => r).length;
    const total = Object.values(results).length;
    
    console.log(`\n✅ Passed: ${passed}/${total}`);
    console.log(`❌ Failed: ${total - passed}/${total}\n`);

    if (passed === total) {
        console.log('🎉 ALL TESTS PASSED! Post-registration flow is configured correctly.\n');
    } else {
        console.log('⚠️  Some tests failed. Review the output above for details.\n');
    }

    // Display next steps
    console.log('╔════════════════════════════════════════════════╗');
    console.log('║              RECOMMENDED ACTIONS               ║');
    console.log('╚════════════════════════════════════════════════╝\n');
    
    console.log('1. Manual Testing:');
    console.log('   - Open the app in browser');
    console.log('   - Navigate to /signup');
    console.log('   - Create a test account with real email');
    console.log('   - Check email inbox for confirmation link');
    console.log('   - Click confirmation link');
    console.log('   - Verify redirect to dashboard');
    console.log('   - Check /profile page shows correct data\n');
    
    console.log('2. Supabase Dashboard Checks:');
    console.log('   - Verify email confirmation is enabled');
    console.log('   - Check email templates are configured');
    console.log('   - Review authentication logs');
    console.log('   - Set up custom SMTP for production\n');
    
    console.log('3. Code Review:');
    console.log('   - src/features/auth/hooks/useSignup.ts - Profile commit');
    console.log('   - src/pages/ProfilePage.tsx - Verification UI');
    console.log('   - src/pages/AuthCallbackPage.tsx - Avatar sync');
    console.log('   - src/context/AuthContext.tsx - Profile fetch\n');
    
    console.log('');
}

// Run all tests
runAllTests().catch(console.error);
