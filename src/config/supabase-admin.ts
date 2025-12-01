import { createClient } from '@supabase/supabase-js';

require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error(
    'Supabase URL and Service Role Key must be defined in environment variables',
  );
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
