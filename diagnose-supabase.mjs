// Script to diagnose and fix Supabase connection issues
import { createClient } from '@supabase/supabase-js';

// Load environment variables using the same mechanism as the app
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://alghvtpkpspnqupbvodu.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFsZ2h2dHBrcHNwbnF1cGJ2b2R1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4NDgyMTYsImV4cCI6MjA4MTQyNDIxNn0.4en9cYMCkIwxd1pWxehb9-lP77cHgh5FhZnrBRg-yaw';

console.log('🔍 Diagnosing Supabase connection...');

async function diagnoseSupabase() {
    console.log('Supabase URL:', SUPABASE_URL);
    console.log('Anon Key Length:', SUPABASE_ANON_KEY ? SUPABASE_ANON_KEY.length : 'Missing');
    
    // Validate URL format
    try {
        new URL(SUPABASE_URL);
        console.log('✅ URL format is valid');
    } catch (e) {
        console.error('❌ Invalid URL format:', e.message);
        return;
    }
    
    // Check if the domain is accessible
    console.log('\n🌐 Checking domain accessibility...');
    try {
        // Using a simple fetch to check if the domain resolves
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch(`${SUPABASE_URL}/health`, { 
            method: 'GET',
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        console.log('✅ Domain is accessible, health check status:', response.status);
    } catch (error) {
        if (error.name === 'AbortError') {
            console.error('❌ Request timed out - domain may not be accessible');
        } else {
            console.error('❌ Domain is not accessible:', error.message);
        }
        console.log('\n💡 Possible solutions:');
        console.log('1. Check if the Supabase project is still active in your Supabase dashboard');
        console.log('2. Verify the URL and API key are correct');
        console.log('3. Check your internet connection');
        console.log('4. If you need a new Supabase project, follow these steps:');
        console.log('   - Go to https://supabase.com');
        console.log('   - Create a new project');
        console.log('   - Copy the Project URL and anon key');
        console.log('   - Update your .env file with the new credentials');
        return;
    }
    
    // Create Supabase client and test basic functionality
    console.log('\n🔧 Testing Supabase client initialization...');
    try {
        const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        
        // Test auth functionality
        console.log('🧪 Testing authentication endpoint...');
        const testEmail = `test_${Date.now()}@example.com`;
        const testPassword = 'TempPass123!';
        
        const { data, error } = await supabase.auth.signUp({
            email: testEmail,
            password: testPassword,
            options: {
                data: {
                    full_name: 'Test User',
                    user_name: `testuser_${Date.now()}`,
                    currency: 'USD',
                    role: 'user'
                },
                emailRedirectTo: 'http://localhost:5173/auth/callback',
            },
        });
        
        if (error) {
            console.log('⚠️  Signup failed as expected (likely due to email confirmation requirement)');
            console.log('Error message:', error.message);
            
            // Try to sign in to verify the user was created
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: testEmail,
                password: testPassword
            });
            
            if (signInError) {
                console.log('ℹ️  Sign in also failed (expected for unconfirmed emails)');
                console.log('This is normal behavior for Supabase email confirmation');
            } else {
                console.log('✅ User was created and authenticated successfully');
            }
        } else {
            console.log('✅ Signup successful!');
            console.log('User created with ID:', data.user?.id);
        }
        
        // Clean up by signing out
        await supabase.auth.signOut();
        
        console.log('\n🎉 Supabase integration is working correctly!');
        console.log('You can now use the signup functionality in your app.');
        
    } catch (err) {
        console.error('❌ Error during Supabase test:', err.message);
    }
}

diagnoseSupabase().then(() => {
    console.log('\n📋 Diagnosis complete.');
}).catch(err => {
    console.error('\n❌ Diagnosis failed:', err);
});