// Test script to verify Supabase signup functionality
import { createClient } from '@supabase/supabase-js';

// Load environment variables using the same mechanism as the app
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('Testing Supabase connection...');

async function testSignup() {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
        console.error('❌ Missing Supabase configuration in environment variables');
        console.log('SUPABASE_URL:', !!SUPABASE_URL);
        console.log('SUPABASE_ANON_KEY:', !!SUPABASE_ANON_KEY);
        console.log('Actual values:');
        console.log('- SUPABASE_URL:', SUPABASE_URL);
        console.log('- SUPABASE_ANON_KEY:', SUPABASE_ANON_KEY ? '[HIDDEN]' : 'undefined');
        return;
    }

    console.log('✅ Supabase configuration loaded');
    
    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Test connection by attempting a simple auth operation
    console.log('Attempting to connect to Supabase...');
    
    try {
        // Generate a test email to avoid conflicts
        const testEmail = `testuser_${Date.now()}@example.com`;
        const testPassword = 'TestPass123!';
        const testFullName = 'Test User';
        const testUsername = `testuser_${Date.now()}`;
        
        console.log(`Attempting to create user with email: ${testEmail}`);
        
        // Attempt to sign up
        const { data, error } = await supabase.auth.signUp({
            email: testEmail,
            password: testPassword,
            options: {
                data: {
                    full_name: testFullName,
                    user_name: testUsername,
                    currency: 'USD',
                    role: 'user'
                },
                emailRedirectTo: 'http://localhost:5173/auth/callback',
            },
        });
        
        if (error) {
            console.error('❌ Signup failed:', error.message);
            console.log('Error details:', error);
            return;
        }
        
        console.log('✅ Signup successful!');
        console.log('User data:', {
            id: data.user?.id,
            email: data.user?.email,
            createdAt: data.user?.created_at
        });
        
        if (data.session) {
            console.log('✅ Session created successfully');
        } else {
            console.log('ℹ️  No session created (expected for email confirmation)');
        }
        
        // Test login with the created user
        console.log('\nTesting login with created user...');
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
            email: testEmail,
            password: testPassword
        });
        
        if (loginError) {
            console.log('ℹ️  Login failed (expected due to email confirmation requirement)');
            console.log('Login error:', loginError.message);
        } else {
            console.log('✅ Login successful!');
        }
        
        // Sign out after testing
        if (loginData?.session) {
            await supabase.auth.signOut();
            console.log('✅ Signed out after testing');
        }
        
    } catch (err) {
        console.error('❌ Unexpected error during signup test:', err.message);
        console.error('Full error:', err);
    }
}

// Run the test
testSignup().then(() => {
    console.log('\nTest completed.');
    process.exit(0);
}).catch(err => {
    console.error('\nTest failed with error:', err);
    process.exit(1);
});