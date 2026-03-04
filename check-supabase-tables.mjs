import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkTables() {
    const tables = ['profiles', 'categories', 'products', 'orders', 'order_items', 'reviews', 'coupons', 'payments']
    console.log('Checking tables in Supabase...')

    for (const table of tables) {
        const { data, error } = await supabase.from(table).select('*').limit(1)
        if (error) {
            console.log(`❌ Table "${table}": ${error.message}`)
        } else {
            console.log(`✅ Table "${table}": Found`)
        }
    }
}

checkTables()
