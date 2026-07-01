// A biblioteca @supabase/supabase-js é carregada como script UMD (ver <script>
// no <head> de index.html e app.html), que expõe window.supabase.
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./config.js";

export const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
