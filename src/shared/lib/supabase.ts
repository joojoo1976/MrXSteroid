import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://alghvtpkpspnqupbvodu.supabase.co';
const supabaseAnonKey = 'sb_publishable_4ZSR56ZM0Sk8g_bYE440Bg_OGOx0N7N';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// تعريف المتغير الذي كان يسبب خطأ في الصورة (SP_FORM_ID)
(window as any).SP_FORM_ID = "registration-form";
