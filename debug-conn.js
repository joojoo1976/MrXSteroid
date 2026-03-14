import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const url = process.env.VITE_SUPABASE_URL + '/auth/v1/health';
console.log('Testing Health Endpoint:', url);

try {
    const response = await fetch(url);
    console.log('Status:', response.status);
    const text = await response.text();
    console.log('Body:', text);
} catch (error) {
    console.error('Fetch Error:', error.message);
}
