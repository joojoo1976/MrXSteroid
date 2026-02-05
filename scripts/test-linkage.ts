import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

async function runDiagnostic() {
    console.log('--- Mr. X Linkage Diagnostic (Terminal Edition) ---');
    console.log(`URL: ${supabaseUrl ? 'PRESENT' : 'MISSING'}`);
    console.log(`KEY: ${supabaseAnonKey ? 'PRESENT' : 'MISSING'}`);

    if (!supabaseUrl || !supabaseAnonKey) {
        console.error('CRITICAL: Missing credentials.');
        process.exit(1);
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    console.log('\n[1/3] Testing Auth Connection...');
    const { data: authData, error: authError } = await supabase.auth.getSession();
    if (authError) {
        console.error('❌ Auth Failed:', authError.message);
    } else {
        console.log('✅ Auth Success (Session fetched)');
    }

    console.log('\n[2/3] Testing Database Connection (profiles table)...');
    const { data: dbData, error: dbError } = await supabase.from('profiles').select('id').limit(1);
    if (dbError) {
        console.error('❌ Database Failed:', dbError.message);
    } else {
        console.log('✅ Database Success (Query returned)');
    }

    console.log('\n[3/3] Testing Webhook Simulation (Live URL)...');
    const webhookUrl = 'https://mrxsteroid.vercel.app/api/payments/webhook';
    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'success', customer_email: 'test_diagnostic@example.com' })
        });
        if (response.ok) {
            console.log(`✅ Webhook Simulation Success (Status ${response.status})`);
        } else {
            console.error(`❌ Webhook Simulation Failed (Status ${response.status})`);
        }
    } catch (e: any) {
        console.error('❌ Webhook Network Error:', e.message);
    }

    console.log('\n--- Diagnostic Complete ---');
}

runDiagnostic();
