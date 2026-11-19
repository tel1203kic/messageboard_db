import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { createApp } from './src/app.js';
import { SupabasePostStore } from './src/supabasePostStore.js';

const port = Number(process.env.PORT) || 3000;
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseSecretKey) {
  throw new Error('Set SUPABASE_URL and SUPABASE_SECRET_KEY in the server environment.');
}

const supabase = createClient(supabaseUrl, supabaseSecretKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
});

const app = createApp(new SupabasePostStore(supabase));

app.listen(port, () => {
  console.log(`Message board listening on http://localhost:${port}`);
});